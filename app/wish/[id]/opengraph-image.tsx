import { ImageResponse } from "next/og";
import { getWish, isWishLocked } from "@/lib/wishes";
import { resolveTheme, isThemeKey } from "@/lib/themes";

export const alt = "A birthday wish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph preview card, generated per wish.
 *
 * Rendered by Next.js when the wish link is shared on social platforms
 * (WhatsApp, X, iMessage, Slack). Displays the recipient name with the
 * theme's color palette and icon so shared links preview meaningfully.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wish = await getWish(id);

  // Fall back to neutral content if the wish cannot be resolved.
  const name = wish?.recipient_name ?? "Someone special";
  const themeKey = isThemeKey(wish?.theme ?? "") ? wish!.theme : "pastel";
  const theme = resolveTheme(themeKey, wish?.custom_theme ?? null);
  const locked = wish ? isWishLocked(wish) : false;

  // Layout uses inline styles only: the satori renderer supports a CSS
  // subset and does not process Tailwind classes.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.og.bg,
          color: theme.og.text,
          position: "relative",
        }}
      >
        {/* Themed accent blobs framing the content */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: 9999,
            background: theme.og.accent,
            opacity: 0.35,
            filter: "blur(90px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: theme.og.accent,
            opacity: 0.25,
            filter: "blur(100px)",
            display: "flex",
          }}
        />

        {/* Theme icon. Satori cannot render React components or next/image,
            so the icon ships as an inline SVG data-URI and uses a raw <img>. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={theme.og.iconSvg}
          alt=""
          width={110}
          height={110}
          style={{ marginBottom: 28 }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: theme.og.accent,
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          {locked ? "A SURPRISE UNLOCKS SOON" : "A BIRTHDAY WISH FOR"}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 110,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 940,
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          {name}
        </div>

        {!locked && wish ? (
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: theme.og.sub,
              marginTop: 30,
            }}
          >
            from {wish.sender_name} — tap to open
          </div>
        ) : null}
      </div>
    ),
    { ...size }
  );
}