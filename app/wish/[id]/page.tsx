/**
 * Wish reveal page.
 *
 * A Server Component that renders either the locked countdown view or the
 * unlocked reveal, depending on the wish's schedule. Rendered per-request
 * (see `dynamic` below) so scheduled unlocks and the view counter reflect
 * the current moment rather than a cached snapshot.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LuHourglass, LuArrowRight } from "react-icons/lu";
import { getWish, isWishLocked } from "@/lib/wishes";
import { resolveTheme, isThemeKey } from "@/lib/themes";
import { incrementViewCount } from "@/lib/actions";
import WishReveal from "@/components/WishReveal";
import Countdown from "@/components/Countdown";
import ParticleBackground from "@/components/ParticleBackground";
import AnimatedGradient from "@/components/AnimatedGradient";

/**
 * Forces per-request rendering so that scheduled unlocks reflect the
 * current time and view_count increments on real visits.
 */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const wish = await getWish(id);

  if (!wish) {
    return { title: "Wish not found" };
  }

  const locked = isWishLocked(wish);
  const title = locked
    ? `A surprise is coming for ${wish.recipient_name}`
    : `A birthday wish for ${wish.recipient_name}`;

  return {
    title,
    description: locked
      ? "Something special is waiting to be unlocked. Come back at the right moment!"
      : `${wish.sender_name} made this wish. Open it to see.`,
    // Wish links are shared person-to-person; exclude them from search
    // engines so recipient names are not indexed.
    robots: { index: false, follow: false },
  };
}

export default async function WishPage({ params }: Params) {
  const { id } = await params;
  const wish = await getWish(id);

  if (!wish) notFound();

  const themeKey = isThemeKey(wish.theme) ? wish.theme : "pastel";
  const theme = resolveTheme(themeKey, wish.custom_theme);
  const locked = isWishLocked(wish);

  return (
    <div className={`relative min-h-dvh overflow-hidden ${theme.pageClass}`}>
      {/* Animated gradient background */}
      <AnimatedGradient themeKey={themeKey === "custom" ? "pastel" : themeKey} />
      {/* Animated particle background */}
      <ParticleBackground themeKey={themeKey === "custom" ? "pastel" : themeKey} />

      {/* Decorative layer: pure CSS, no JavaScript cost, behind the card */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {theme.decor.map((d, i) => {
          const DecorIcon = d.icon;
          return (
            <div key={i} className={`absolute ${d.className}`}>
              {DecorIcon && (
                <DecorIcon className={d.iconClassName ?? "h-10 w-10"} />
              )}
            </div>
          );
        })}
      </div>

      {locked ? (
        /* Scheduled state: countdown only; the message is withheld entirely */
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
          <div className={theme.cardWrapperClass}>
            <div
              className={`w-full max-w-md rounded-3xl p-8 sm:p-10 ${theme.cardClass}`}
            >
              <LuHourglass
                className={`mx-auto h-14 w-14 animate-pop-in ${theme.accentTextClass}`}
              />
              <p
                className={`mt-5 text-xs font-semibold uppercase tracking-[0.25em] ${theme.accentTextClass}`}
              >
                Hold your horses
              </p>
              <h1
                className={`mt-2 text-4xl font-extrabold sm:text-5xl ${theme.fontClass} ${theme.headingClass}`}
              >
                {wish.recipient_name}, something&rsquo;s brewing…
              </h1>
              <p className="mt-4 text-sm opacity-70">
                A wish from {wish.sender_name} unlocks in:
              </p>

              <Countdown targetIso={wish.scheduled_for!} themeKey={themeKey} />

              <p className="mt-6 text-xs opacity-50">
                This page will open by itself when the timer hits zero.
              </p>
            </div>
          </div>

          <Link
            href="/create"
            className="relative z-10 mt-10 inline-flex items-center gap-1 text-xs opacity-60 underline-offset-4 hover:underline"
          >
            Make your own wish <LuArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        /* Unlocked state: full reveal with share controls */
        <>
          {/* Fire-and-forget view counting; failures are logged, never thrown */}
          {await incrementViewCount(id)}

          <WishReveal
            recipientName={wish.recipient_name}
            senderName={wish.sender_name}
            message={wish.message}
            themeKey={themeKey}
            viewCount={wish.view_count}
            customTheme={wish.custom_theme}
            photoUrls={wish.photo_urls}
            musicTrack={wish.music_track}
          />

          <Link
            href="/create"
            className="relative z-10 mx-auto flex w-fit items-center gap-1 pb-8 text-xs opacity-60 underline-offset-4 hover:underline"
          >
            Make your own wish <LuArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      )}
    </div>
  );
}