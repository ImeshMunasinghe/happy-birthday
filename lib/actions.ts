"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";
import { getSupabase } from "./supabase";
import { isThemeKey, type CustomThemeConfig } from "./themes";
import type { CreateWishState } from "./form-state";

/**
 * Short-id generator for wish URLs.
 * Lowercase alphabet excludes visually ambiguous characters
 * (0/O, 1/l/I); six characters yield roughly 887 million combinations.
 */
const generateId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 6);

/**
 * Honeypot field name. The field is hidden from human users but rendered
 * in the markup; automated form submissions typically fill every field,
 * so a non-empty value identifies the submitter as a bot.
 */
const HONEYPOT_FIELD = "website";

const MAX_MESSAGE = 1000;
const MAX_NAME = 60;
const MAX_IMAGES = 5;
const STORAGE_BUCKET = "wish-images";

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 *
 * @param file - The image file to upload
 * @param wishId - The wish ID to use in the file path
 * @returns The public URL of the uploaded image, or null on failure
 */
async function uploadImage(file: File, wishId: string): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${generateId()}.${fileExt}`;
    const filePath = `${wishId}/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Image upload failed:", error.message);
      return null;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Image upload threw:", err);
    return null;
  }
}

/**
 * Server Action: validate the create-wish form, insert the row, and
 * redirect to the new wish page.
 *
 * Validation is performed entirely server-side; the client mirrors the
 * same limits (maxLength, counters) purely for UX and is never trusted.
 * Unique-violation errors trigger a bounded retry with a fresh id.
 *
 * @param _prev - Previous form state (unused; required by useActionState)
 * @param formData - Raw form payload from the create-wish form
 * @returns Updated form state on validation/save failure; never returns
 *          on success (redirects instead)
 */
export async function createWish(
  _prev: CreateWishState,
  formData: FormData
): Promise<CreateWishState> {
  const get = (name: string) => (formData.get(name) ?? "").toString().trim();

  // Honeypot: on a bot submission, skip all work and behave as if the
  // wish was created (the id will not resolve to a real row).
  if (get(HONEYPOT_FIELD) !== "") {
    redirect("/wish/nice-try-bot");
  }

  const values = {
    recipient_name: get("recipient_name"),
    sender_name: get("sender_name"),
    message: get("message"),
    theme: get("theme") || "pastel",
    scheduled: get("scheduled") === "on",
    scheduled_date: get("scheduled_date"),
    scheduled_time: get("scheduled_time") || "00:00",
    // The client converts the viewer's local date/time to a UTC instant
    // before submission; browsers know their timezone, servers do not.
    scheduled_for: get("scheduled_for"),
    music_track: get("music_track"),
  };

  // Validation: collect all field errors so the form can render them inline.
  const errors: Record<string, string> = {};
  if (!values.recipient_name) {
    errors.recipient_name = "Who's the lucky birthday person?";
  } else if (values.recipient_name.length > MAX_NAME) {
    errors.recipient_name = `Keep the name under ${MAX_NAME} characters.`;
  }

  if (!values.sender_name) {
    errors.sender_name = "Don't be shy — sign your name.";
  } else if (values.sender_name.length > MAX_NAME) {
    errors.sender_name = `Keep the name under ${MAX_NAME} characters.`;
  }

  if (!values.message) {
    errors.message = "Write a little something — even two words works.";
  } else if (values.message.length > MAX_MESSAGE) {
    errors.message = `Message is too long (max ${MAX_MESSAGE} characters).`;
  }

  // Whitelist the theme server-side; client payloads cannot be trusted.
  if (!isThemeKey(values.theme)) {
    errors.theme = "Pick one of the four themes.";
  }

  let scheduledFor: string | null = null;
  if (values.scheduled) {
    const dt = new Date(values.scheduled_for);
    if (!values.scheduled_for || Number.isNaN(dt.getTime())) {
      errors.scheduled = "Pick the date & time the wish should unlock.";
    } else if (dt.getTime() <= Date.now()) {
      errors.scheduled = "The unlock moment must be in the future.";
    } else {
      scheduledFor = dt.toISOString();
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  // Insert with bounded retry: a unique-violation means the generated id
  // already exists (unlikely at this scale); regenerate and try again.
  const supabase = getSupabase();

  // Get image files from form data
  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_IMAGES);

  for (let attempt = 0; attempt < 3; attempt++) {
    const id = generateId();

    // Parse custom theme config if the theme is "custom"
    let customTheme: CustomThemeConfig | null = null;
    if (values.theme === "custom") {
      const raw = get("custom_theme");
      if (raw) {
        try {
          customTheme = JSON.parse(raw) as CustomThemeConfig;
        } catch {
          errors.theme = "Invalid custom theme configuration.";
        }
      }
    }

    // Upload images to Supabase Storage
    const imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      const uploadResults = await Promise.all(
        imageFiles.map((file) => uploadImage(file, id))
      );
      uploadResults.forEach((url) => {
        if (url) {
          imageUrls.push(url);
        }
      });
    }

    const { error } = await supabase.from("wishes").insert({
      id,
      recipient_name: values.recipient_name,
      sender_name: values.sender_name,
      message: values.message,
      theme: values.theme,
      scheduled_for: scheduledFor,
      custom_theme: customTheme,
      music_track: values.music_track || null,
      photo_urls: imageUrls.length > 0 ? imageUrls : null,
    });

    if (!error) {
      revalidatePath("/wish/" + id);
      redirect(`/wish/${id}`);
    }

    // Postgres unique_violation. Any other error is a real failure.
    if (error.code !== "23505") {
      console.error("createWish insert failed:", error.message);
      return {
        ok: false,
        errors: {
          form: "Something went wrong saving your wish. Please try again.",
        },
        values,
      };
    }
  }

  return {
    ok: false,
    errors: { form: "Couldn't generate a free link — please try again." },
    values,
  };
}

/**
 * Server Action: atomically increment the view counter for a wish via the
 * `increment_view_count` security-definer RPC (the anon role has no direct
 * UPDATE grant on the table).
 *
 * Intended as fire-and-forget during wish page rendering; failures are
 * logged and swallowed so view counting can never break the page.
 */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.rpc("increment_view_count", { p_id: id });
    if (error) console.error("increment_view_count failed:", error.message);
  } catch (err) {
    console.error("increment_view_count threw:", err);
  }
}