"use client";

/**
 * Client component that renders the unlocked wish card.
 *
 * The card markup is rendered immediately; confetti is fired once from a
 * mount effect with canvas-confetti loaded through a dynamic import, so
 * the animation library never delays the server-rendered first paint.
 * Each theme defines its own burst choreography and color palette.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { resolveTheme, type CustomThemeConfig, type ThemeKey } from "@/lib/themes";
import ShareButtons from "./ShareButtons";
import ImageGallery from "./ImageGallery";
import MusicToggle from "./MusicToggle";
import TypewriterText from "./TypewriterText";

type WishRevealProps = {
  recipientName: string;
  senderName: string;
  message: string;
  themeKey: ThemeKey;
  viewCount: number;
  customTheme?: CustomThemeConfig | null;
  photoUrls?: string[] | null;
  musicTrack?: string | null;
};

/**
 * Fires the confetti sequence for the given theme.
 * Loads canvas-confetti via dynamic import to keep it out of the initial
 * bundle; the returned promise rejects only if the library fails to load,
 * which the caller treats as non-fatal.
 */
async function fireConfetti(themeKey: ThemeKey) {
  const confetti = (await import("canvas-confetti")).default;

  const pastel = ["#f9a8d4", "#c4b5fd", "#7dd3fc", "#fde68a", "#86efac"];
  const bright = [
    "#fbbf24",
    "#f97316",
    "#fb7185",
    "#38bdf8",
    "#a78bfa",
    "#f43f5e",
  ];
  const gold = ["#e7c873", "#f5e6b8", "#d4af37", "#fff8dc"];

  switch (themeKey) {
    case "pastel": {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: pastel,
      });
      setTimeout(
        () =>
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.7 },
            colors: pastel,
          }),
        250
      );
      setTimeout(
        () =>
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.7 },
            colors: pastel,
          }),
        400
      );
      break;
    }
    case "fireworks": {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 70,
            spread: 360,
            startVelocity: 28,
            gravity: 0.9,
            scalar: 1.1,
            origin: {
              x: 0.15 + Math.random() * 0.7,
              y: 0.15 + Math.random() * 0.35,
            },
            colors: bright,
          });
        }, i * 450);
      }
      break;
    }
    case "funny": {
      // Vector star particles, consistent with the icon-based UI
      const star = confetti.shapeFromPath({
        path: "M5 0 L6.5 3.5 L10 4 L7.5 6.5 L8 10 L5 8.2 L2 10 L2.5 6.5 L0 4 L3.5 3.5 Z",
      });
      const shapes: confetti.Shape[] = [star, "circle", "square"];
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.6 },
        shapes,
        scalar: 1.4,
        colors: bright,
      });
      setTimeout(
        () =>
          confetti({
            particleCount: 40,
            spread: 120,
            origin: { x: 0.2, y: 0.7 },
            shapes,
            scalar: 1.4,
            colors: bright,
          }),
        350
      );
      setTimeout(
        () =>
          confetti({
            particleCount: 40,
            spread: 120,
            origin: { x: 0.8, y: 0.7 },
            shapes,
            scalar: 1.4,
            colors: bright,
          }),
        700
      );
      break;
    }
    case "elegant": {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { y: 0.5 },
        colors: gold,
        scalar: 0.9,
        gravity: 0.5,
        drift: 1,
        ticks: 350,
      });
      break;
    }
  }
}

export default function WishReveal({
  recipientName,
  senderName,
  message,
  themeKey,
  viewCount,
  customTheme,
  photoUrls,
  musicTrack,
}: WishRevealProps) {
  const theme = resolveTheme(themeKey, customTheme);
  const firedRef = useRef(false);

  useEffect(() => {
    // Fire exactly once even under StrictMode's double-invoked effects.
    if (firedRef.current) return;
    firedRef.current = true;
    // Decoration only: a confetti failure must never surface as an error.
    fireConfetti(themeKey).catch(() => {});
  }, [themeKey]);

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className={theme.cardWrapperClass}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-lg rounded-3xl p-8 text-center sm:p-12 ${theme.cardClass}`}
        >
          {photoUrls && photoUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <ImageGallery urls={photoUrls} />
            </motion.div>
          )}

          <p
            className={`mt-5 text-xs font-semibold uppercase tracking-[0.25em] ${theme.accentTextClass}`}
          >
            A birthday wish for
          </p>
          <h1
            className={`mt-2 break-words text-5xl font-extrabold leading-tight sm:text-6xl ${theme.fontClass} ${theme.headingClass}`}
          >
            {recipientName}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className={`mt-6 text-lg leading-relaxed ${theme.fontClass}`}
          >
            <TypewriterText
              text={message}
              speed={25}
              startDelay={600}
              className="whitespace-pre-wrap"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-6 flex items-center justify-center gap-1.5 text-sm opacity-70"
          >
            — with love, <span className="font-semibold">{senderName}</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-8"
          >
            <ShareButtons
              recipientName={recipientName}
              accentClass={theme.buttonClass}
            />
          </motion.div>

          <p className="mt-6 text-xs opacity-50">
            opened {viewCount + 1} {viewCount + 1 === 1 ? "time" : "times"}
          </p>
        </motion.div>
      </div>

      {musicTrack && (
        <MusicToggle track={musicTrack} accentClass={theme.buttonClass} />
      )}
    </div>
  );
}
