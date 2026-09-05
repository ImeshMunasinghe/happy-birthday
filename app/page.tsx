/**
 * Landing page: introduces the product and links to the create form.
 * Server component; decorative icons are pure CSS-animated.
 */
import Link from "next/link";
import {
  LuPartyPopper,
  LuGift,
  LuCake,
  LuSparkles,
  LuRocket,
  LuArrowRight,
} from "react-icons/lu";
import { resolveTheme, THEME_KEYS } from "@/lib/themes";

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50 to-sky-50 px-6 py-16 text-center">
      {/* Decorative floating icons, animated with CSS only */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <LuRocket className="absolute left-[8%] top-[18%] h-10 w-10 animate-float-slow text-pink-400" />
        <LuPartyPopper className="absolute right-[10%] top-[24%] h-9 w-9 animate-float-slower text-amber-500" />
        <LuGift className="absolute bottom-[16%] left-[14%] h-9 w-9 animate-float-slower text-violet-400" />
        <LuCake className="absolute bottom-[22%] right-[12%] h-10 w-10 animate-float-slow text-sky-400" />
        <LuSparkles className="absolute left-[45%] top-[8%] h-7 w-7 animate-float-slower text-yellow-400" />
      </div>

      <div className="relative">
        <LuCake className="mx-auto h-16 w-16 animate-pop-in text-pink-500" />
        <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
          Make someone&rsquo;s day{" "}
          <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            unforgettable
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-slate-500">
          Create a beautiful birthday wish, pick a vibe, and share it with a
          single link.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-pink-300/50 transition hover:scale-105 hover:brightness-110"
          >
            Create a wish <LuArrowRight className="h-5 w-5" />
          </Link>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500">
            {THEME_KEYS.map((key) => {
              const theme = resolveTheme(key);
              const ThemeIcon = theme.icon;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1"
                >
                  <ThemeIcon className="h-4 w-4" />
                  {theme.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}