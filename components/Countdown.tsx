"use client";

/**
 * Live countdown to a scheduled wish unlock.
 *
 * Renders a placeholder on the server and until the first client tick,
 * which avoids hydration mismatches from clock differences. When the
 * timer reaches zero it triggers a router refresh so the server
 * re-renders the page with the wish unlocked.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, type ThemeKey } from "@/lib/themes";

type CountdownProps = {
  targetIso: string;
  themeKey: ThemeKey;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Countdown({ targetIso, themeKey }: CountdownProps) {
  const theme = THEMES[themeKey];
  const router = useRouter();

  // null until the first client tick: prevents SSR/CSR hydration mismatch
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.parse(targetIso);

    const tick = () => {
      const r = Math.max(0, target - Date.now());
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        // Re-render the server component now that the wish is unlocked.
        router.refresh();
      }
    };

    // First tick is deferred to a timeout so state updates stay inside
    // callbacks rather than the effect body. Closing over `interval` is
    // safe: the timeout fires only after the synchronous block completes.
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [targetIso, router]);

  if (remaining === null) {
    return <div className="mt-5 h-24" aria-hidden />;
  }

  const total = Math.floor(remaining / 1000);
  const units: [string, string][] = [
    [String(Math.floor(total / 86400)), "days"],
    [pad(Math.floor((total % 86400) / 3600)), "hrs"],
    [pad(Math.floor((total % 3600) / 60)), "min"],
    [pad(total % 60), "sec"],
  ];

  return (
    <div
      className="mt-5 flex justify-center gap-2 sm:gap-3"
      role="timer"
      aria-live="polite"
    >
      {units.map(([value, label]) => (
        <div
          key={label}
          className={`min-w-[4.25rem] rounded-2xl px-3 py-3 ${theme.cardClass}`}
        >
          <div
            className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${theme.fontClass} ${theme.headingClass}`}
          >
            {value}
          </div>
          <div className="mt-1 text-[0.65rem] uppercase tracking-widest opacity-60">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}