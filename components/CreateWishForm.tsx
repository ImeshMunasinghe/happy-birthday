"use client";

/**
 * Client form for creating a wish.
 *
 * Uses React 19's useActionState with the createWish Server Action.
 * The theme picker and schedule controls are managed client-side and
 * synced into hidden inputs; the browser converts the chosen local
 * unlock time to a UTC ISO instant (the server cannot know the user's
 * timezone). Validation limits mirror the server for immediate feedback,
 * but the server remains the source of truth.
 */

import { useActionState, useState, useRef } from "react";
import {
  LuGift,
  LuMail,
  LuPenLine,
  LuPalette,
  LuAlarmClock,
  LuPartyPopper,
  LuLoaderCircle,
  LuMusic,
  LuImage,
  LuX,
} from "react-icons/lu";
import { createWish } from "@/lib/actions";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import {
  resolveTheme,
  THEME_KEYS,
  BACKGROUND_PRESETS,
  ACCENT_PRESETS,
  CARD_STYLE_PRESETS,
  FONT_PRESETS,
  DECOR_PRESETS,
  type CustomThemeConfig,
  type ThemeKey,
} from "@/lib/themes";

const MAX_MESSAGE = 1000;
const MAX_NAME = 60;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-500">{message}</p>;
}

export default function CreateWishForm() {
  const [state, formAction, isPending] = useActionState(
    createWish,
    EMPTY_FORM_STATE
  );

  const [theme, setTheme] = useState<ThemeKey>("pastel");
  const [message, setMessage] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [musicTrack, setMusicTrack] = useState("");
  const [customTheme, setCustomTheme] = useState<CustomThemeConfig>({
    baseTheme: "pastel",
    background: "rose",
    accent: "pink",
    cardStyle: "glass",
    font: "pastel",
    decor: "none",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Converts the selected local date/time to a UTC ISO instant.
   * Computed on each render so the hidden input always carries the
   * correct instant; empty when scheduling is disabled or the date
   * is incomplete.
   */
  const scheduledForIso = (() => {
    if (!scheduleEnabled || !scheduledDate) return "";
    const dt = new Date(`${scheduledDate}T${scheduledTime || "00:00"}`);
    return Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
  })();

  /**
   * Handles image file selection: validates type/size, compresses via
   * Canvas API, and stores both the File and a preview data-URI.
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageError("");

    if (images.length + files.length > 5) {
      setImageError("You can add up to 5 photos.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validFiles = files.filter((f) => {
      if (!validTypes.includes(f.type)) {
        setImageError("Only JPEG, PNG, WebP, and GIF images are allowed.");
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setImageError("Each image must be under 5MB.");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews using FileReader
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    // Sync files to hidden input for form submission
    syncFilesToInput(newImages);
  };

  /** Removes an image from the selection by index. */
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);

    // Sync files to hidden input for form submission
    syncFilesToInput(newImages);
  };

  /** Syncs the image files to the hidden file input for form submission. */
  const syncFilesToInput = (files: File[]) => {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {/* Honeypot: hidden from users; a filled value marks the submission as automated */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {/* Controlled theme picker, synced into the form payload */}
      <input type="hidden" name="theme" value={theme} />

      {/* UTC ISO instant of the chosen unlock time ("" when not scheduled) */}
      <input type="hidden" name="scheduled_for" value={scheduledForIso} />

      {/* Custom theme config (JSON) when theme is "custom" */}
      {theme === "custom" && (
        <input type="hidden" name="custom_theme" value={JSON.stringify(customTheme)} />
      )}

      {/* Selected music track */}
      <input type="hidden" name="music_track" value={musicTrack} />

      {/* Hidden file input for image uploads - files are synced from the visible input */}
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        aria-hidden="true"
      />

      {/* Non-field error reported by the server action */}
      {state.errors.form ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.errors.form}
        </p>
      ) : null}

      {/* Recipient */}
      <div>
        <label
          htmlFor="recipient_name"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
        >
          <LuGift className="h-4 w-4 text-pink-500" />
          Who is this for?
        </label>
        <input
          id="recipient_name"
          name="recipient_name"
          type="text"
          required
          maxLength={MAX_NAME}
          defaultValue={state.values.recipient_name}
          placeholder="e.g. Nimali"
          className={inputClass}
        />
        <FieldError message={state.errors.recipient_name} />
      </div>

      {/* Sender */}
      <div>
        <label
          htmlFor="sender_name"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
        >
          <LuMail className="h-4 w-4 text-pink-500" />
          From
        </label>
        <input
          id="sender_name"
          name="sender_name"
          type="text"
          required
          maxLength={MAX_NAME}
          defaultValue={state.values.sender_name}
          placeholder="Your name"
          className={inputClass}
        />
        <FieldError message={state.errors.sender_name} />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
        >
          <LuPenLine className="h-4 w-4 text-pink-500" />
          Your message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={MAX_MESSAGE}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write something heartfelt, funny, or both…"
          className={`${inputClass} resize-y`}
        />
        <div className="mt-1 flex items-start justify-between gap-4">
          <FieldError message={state.errors.message} />
          <span
            className={`ml-auto shrink-0 text-xs ${
              message.length > MAX_MESSAGE - 100
                ? "text-orange-500"
                : "text-slate-400"
            }`}
          >
            {message.length}/{MAX_MESSAGE}
          </span>
        </div>
      </div>

      {/* Theme picker */}
      <div>
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <LuPalette className="h-4 w-4 text-pink-500" />
          Pick a vibe
        </span>
        <div className="grid grid-cols-2 gap-3">
          {THEME_KEYS.map((key) => {
            const t = resolveTheme(key);
            const ThemeIcon = t.icon;
            const selected = theme === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setTheme(key)}
                aria-pressed={selected}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  selected
                    ? "border-pink-500 bg-white shadow-lg shadow-pink-200/60"
                    : "border-slate-200 bg-white/60 hover:border-slate-300"
                }`}
              >
                <ThemeIcon
                  className={`h-7 w-7 ${selected ? "text-pink-500" : "text-slate-400"}`}
                />
                <span className="mt-1 block font-semibold text-slate-800">
                  {t.label}
                </span>
                <span className="block text-xs text-slate-400">
                  {t.tagline}
                </span>
                <span
                  className={`mt-2 block h-2 w-full rounded-full ${t.swatchClass}`}
                />
              </button>
            );
          })}
          {/* Custom theme option */}
          <button
            type="button"
            onClick={() => setTheme("custom")}
            aria-pressed={theme === "custom"}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              theme === "custom"
                ? "border-pink-500 bg-white shadow-lg shadow-pink-200/60"
                : "border-slate-200 bg-white/60 hover:border-slate-300"
            }`}
          >
            <LuPalette
              className={`h-7 w-7 ${theme === "custom" ? "text-pink-500" : "text-slate-400"}`}
            />
            <span className="mt-1 block font-semibold text-slate-800">Custom</span>
            <span className="block text-xs text-slate-400">Make it yours</span>
            <span className="mt-2 block h-2 w-full rounded-full bg-gradient-to-r from-pink-300 via-violet-300 to-sky-300" />
          </button>
        </div>
        <FieldError message={state.errors.theme} />
      </div>

      {/* Custom theme builder */}
      {theme === "custom" && (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <span className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <LuPalette className="h-4 w-4 text-pink-500" />
            Customize your theme
          </span>
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Background</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BACKGROUND_PRESETS).map(([key, preset]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCustomTheme({ ...customTheme, background: key })}
                    className={`h-8 w-10 rounded-lg ${preset.swatchClass} ${customTheme.background === key ? "ring-2 ring-pink-500 ring-offset-2" : ""}`}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Accent</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ACCENT_PRESETS).map(([key, preset]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCustomTheme({ ...customTheme, accent: key })}
                    className={`h-8 w-10 rounded-lg ${preset.accentClass} ${customTheme.accent === key ? "ring-2 ring-pink-500 ring-offset-2" : ""}`}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Card Style</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CARD_STYLE_PRESETS).map(([key, preset]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCustomTheme({ ...customTheme, cardStyle: key })}
                    className={`rounded-lg px-3 py-1.5 text-xs ${customTheme.cardStyle === key ? "bg-pink-500 text-white" : "bg-white border border-slate-200"}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Font</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FONT_PRESETS).map(([key, preset]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCustomTheme({ ...customTheme, font: key })}
                    className={`rounded-lg px-3 py-1.5 text-xs ${customTheme.font === key ? "bg-pink-500 text-white" : "bg-white border border-slate-200"}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Decor</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(DECOR_PRESETS).map(([key, preset]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCustomTheme({ ...customTheme, decor: key })}
                    className={`rounded-lg px-3 py-1.5 text-xs ${customTheme.decor === key ? "bg-pink-500 text-white" : "bg-white border border-slate-200"}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled unlock */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
        <label className="flex items-center gap-3 font-medium text-slate-700">
          <input
            type="checkbox"
            name="scheduled"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
            className="h-4 w-4 accent-pink-500"
          />
          <span className="flex items-center gap-1.5">
            <LuAlarmClock className="h-4 w-4 text-pink-500" />
            Schedule the reveal for later
          </span>
        </label>

        {scheduleEnabled && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                name="scheduled_date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                aria-label="Unlock date"
                className={inputClass}
              />
              <input
                type="time"
                name="scheduled_time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                aria-label="Unlock time"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-slate-400">
              Until then, the link shows a live countdown instead of the wish.
            </p>
            <FieldError message={state.errors.scheduled} />
          </div>
        )}
      </div>

      {/* Background music picker */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
        <span className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <LuMusic className="h-4 w-4 text-pink-500" />
          Background music
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMusicTrack("")}
            className={`rounded-lg px-3 py-1.5 text-xs ${musicTrack === "" ? "bg-pink-500 text-white" : "bg-white border border-slate-200"}`}
          >
            No music
          </button>
          {["happy-birthday", "celebration", "chill", "romantic"].map((track) => (
            <button
              type="button"
              key={track}
              onClick={() => setMusicTrack(track)}
              className={`rounded-lg px-3 py-1.5 text-xs ${musicTrack === track ? "bg-pink-500 text-white" : "bg-white border border-slate-200"}`}
            >
              {track === "happy-birthday" ? "🎵 Happy Birthday" :
               track === "celebration" ? "🎉 Celebration" :
               track === "chill" ? "🌊 Chill" : "💝 Romantic"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Music plays when the recipient taps the music button on the wish page.
        </p>
      </div>

      {/* Image upload */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
        <span className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <LuImage className="h-4 w-4 text-pink-500" />
          Add photos (up to 5)
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleImageSelect}
          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-100"
        />
        {imageError && <p className="mt-2 text-sm text-red-500">{imageError}</p>}
        {imagePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Upload ${i + 1}`}
                  className="h-20 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white"
                  aria-label="Remove image"
                >
                  <LuX className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Images are compressed and optimized automatically. Max 5 photos.
        </p>
      </div>

      {/* Submit button with pending state while the action is in flight */}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-pink-300/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LuLoaderCircle className="h-5 w-5 animate-spin" />
            Wrapping your gift…
          </>
        ) : (
          <>
            <LuPartyPopper className="h-5 w-5" />
            Create wish
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        You&rsquo;ll get a shareable link right after this.
      </p>
    </form>
  );
}