import type { ComponentType, SVGProps } from "react";
import {
  LuFlower2,
  LuSparkles,
  LuLaugh,
  LuWine,
  LuPartyPopper,
  LuGift,
  LuRocket,
  LuWaves,
  LuSunset,
  LuPalette,
} from "react-icons/lu";

/** A React component that renders an inline SVG icon. */
export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type ThemeKey =
  | "pastel"
  | "fireworks"
  | "funny"
  | "elegant"
  | "ocean"
  | "sunset"
  | "custom";

/** A positioned decorative element rendered behind the wish card. */
export type Decor = {
  /** Position + size + animation classes for the wrapper element */
  className: string;
  /** Optional icon rendered inside the wrapper */
  icon?: IconType;
  /** Size + color classes applied to the icon */
  iconClassName?: string;
};

/**
 * Visual identity for a wish theme.
 *
 * All Tailwind classes are stored as static strings so the Tailwind v4
 * compiler can statically extract them. Icons are component references;
 * the OG image additionally carries a pre-built SVG data-URI because the
 * satori renderer cannot execute React components.
 */
export type ThemeConfig = {
  key: ThemeKey;
  label: string;
  icon: IconType;
  tagline: string;
  /** Background and base text classes for the full-page container */
  pageClass: string;
  /** Container classes for the wish card */
  cardClass: string;
  /** Static transform applied outside framer-motion so it is not overridden */
  cardWrapperClass: string;
  /** Font utility class, defined in globals.css via next/font variables */
  fontClass: string;
  /** Classes for the recipient-name heading */
  headingClass: string;
  /** Classes for small accent text (eyebrows, labels) */
  accentTextClass: string;
  /** Classes for the primary button */
  buttonClass: string;
  /** Gradient bar shown in the theme picker */
  swatchClass: string;
  /** Decorative elements rendered behind the card */
  decor: Decor[];
  /** Flat colors and inline SVG icon for the Open Graph image */
  og: { bg: string; accent: string; text: string; sub: string; iconSvg: string };
};

/**
 * Builds an Open Graph icon as an SVG data-URI.
 * Satori supports `<img>` but not React component trees, so the icon's
 * path data is embedded directly.
 */
function ogIcon(path: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Lucide path data for each theme's Open Graph icon. */
const OG_PATHS = {
  flower:
    '<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"/><circle cx="12" cy="8" r="2"/><path d="M12 10v12"/><path d="M12 22c5.5 0 8-2.5 8-5 0-1.5-1-2.5-2.5-2.5C15 14.5 13.5 16 12 18c-1.5-2-3-3.5-5.5-3.5C5 14.5 4 15.5 4 17c0 2.5 2.5 5 8 5Z"/>',
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  laugh:
    '<circle cx="12" cy="12" r="10"/><path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  wine: "<path d=\"M8 22h8\"/><path d=\"M7 10h10\"/><path d=\"M12 15v7\"/><path d=\"M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z\"/>",
  party:
    '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>',
  gift: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13\"/><path d=\"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5\"/>",
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  waves:
    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  sunset:
    '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
};

/** Theme registry — the single source of truth for theme appearance. */
export const THEMES: Record<Exclude<ThemeKey, "custom">, ThemeConfig> = {
  pastel: {
    key: "pastel",
    label: "Pastel Dream",
    icon: LuFlower2,
    tagline: "Soft, sweet & dreamy",
    pageClass:
      "bg-gradient-to-br from-rose-100 via-fuchsia-100 to-sky-100 text-slate-700",
    cardClass:
      "bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl shadow-rose-200/60",
    cardWrapperClass: "",
    fontClass: "font-theme-pastel",
    headingClass:
      "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent",
    accentTextClass: "text-pink-500",
    buttonClass:
      "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-300/50 hover:brightness-110",
    swatchClass: "bg-gradient-to-r from-pink-300 via-fuchsia-300 to-sky-300",
    decor: [
      {
        className:
          "top-[-4rem] left-[-4rem] h-72 w-72 rounded-full bg-pink-300/50 blur-3xl animate-float-slow",
      },
      {
        className:
          "bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-sky-300/50 blur-3xl animate-float-slower",
      },
      {
        className:
          "top-1/3 right-[10%] h-24 w-24 rounded-full bg-violet-300/40 blur-2xl animate-float-slow",
      },
    ],
    og: {
      bg: "#fdf2f8",
      accent: "#ec4899",
      text: "#1e1b4b",
      sub: "#6b7280",
      iconSvg: ogIcon(OG_PATHS.flower, "#ec4899"),
    },
  },

  fireworks: {
    key: "fireworks",
    label: "Fireworks Night",
    icon: LuSparkles,
    tagline: "Go big, go bright",
    pageClass:
      "bg-gradient-to-b from-indigo-950 via-slate-950 to-black text-slate-200",
    cardClass:
      "bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl shadow-indigo-900/40",
    cardWrapperClass: "",
    fontClass: "font-theme-fireworks",
    headingClass:
      "bg-gradient-to-r from-amber-200 via-orange-400 to-rose-400 bg-clip-text text-transparent",
    accentTextClass: "text-amber-300",
    buttonClass:
      "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/30 hover:brightness-110",
    swatchClass: "bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500",
    decor: [
      { className: "top-[12%] left-[8%] h-2 w-2 rounded-full bg-amber-200/80 animate-twinkle" },
      { className: "top-[28%] right-[12%] h-1.5 w-1.5 rounded-full bg-white/70 animate-twinkle-delayed" },
      { className: "top-[60%] left-[15%] h-1.5 w-1.5 rounded-full bg-sky-300/70 animate-twinkle" },
      { className: "bottom-[18%] right-[20%] h-2 w-2 rounded-full bg-rose-300/70 animate-twinkle-delayed" },
      { className: "top-[8%] right-[30%] h-1 w-1 rounded-full bg-white/60 animate-twinkle" },
      { className: "bottom-[30%] left-[30%] h-1 w-1 rounded-full bg-violet-300/60 animate-twinkle-delayed" },
    ],
    og: {
      bg: "#020617",
      accent: "#fbbf24",
      text: "#f1f5f9",
      sub: "#94a3b8",
      iconSvg: ogIcon(OG_PATHS.sparkles, "#fbbf24"),
    },
  },

  funny: {
    key: "funny",
    label: "Funny Bones",
    icon: LuLaugh,
    tagline: "Silly, loud & proud",
    pageClass:
      "bg-amber-100 bg-[radial-gradient(#fcd34d_2px,transparent_2px)] [background-size:26px_26px] text-slate-800",
    cardClass:
      "bg-white border-4 border-slate-900 shadow-[10px_10px_0_0_#0f172a]",
    cardWrapperClass: "-rotate-1",
    fontClass: "font-theme-funny",
    headingClass: "text-orange-500",
    accentTextClass: "text-orange-500",
    buttonClass:
      "bg-orange-500 text-white border-4 border-slate-900 shadow-[5px_5px_0_0_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0f172a]",
    swatchClass: "bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400",
    decor: [
      {
        className: "top-[10%] left-[6%] animate-float-slow",
        icon: LuRocket,
        iconClassName: "h-12 w-12 text-orange-400",
      },
      {
        className: "top-[22%] right-[8%] animate-float-slower",
        icon: LuLaugh,
        iconClassName: "h-10 w-10 text-yellow-500",
      },
      {
        className: "bottom-[15%] left-[12%] animate-float-slower",
        icon: LuPartyPopper,
        iconClassName: "h-10 w-10 text-red-400",
      },
      {
        className: "bottom-[25%] right-[10%] animate-float-slow",
        icon: LuGift,
        iconClassName: "h-12 w-12 text-orange-500",
      },
    ],
    og: {
      bg: "#fef3c7",
      accent: "#f97316",
      text: "#0f172a",
      sub: "#57534e",
      iconSvg: ogIcon(OG_PATHS.laugh, "#f97316"),
    },
  },

  elegant: {
    key: "elegant",
    label: "Elegant Gold",
    icon: LuWine,
    tagline: "Timeless & refined",
    pageClass:
      "bg-[radial-gradient(ellipse_at_top,#292524,#0c0a09_70%)] text-stone-300",
    cardClass:
      "bg-stone-900/40 backdrop-blur border border-amber-200/25 shadow-2xl shadow-black/60",
    cardWrapperClass: "",
    fontClass: "font-theme-elegant",
    headingClass: "text-amber-100 italic",
    accentTextClass: "text-amber-200",
    buttonClass:
      "border border-amber-200/50 text-amber-100 hover:bg-amber-100/10",
    swatchClass: "bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-700",
    decor: [
      { className: "top-[15%] left-[10%] h-1.5 w-1.5 rounded-full bg-amber-200/70 animate-twinkle" },
      { className: "top-[40%] right-[10%] h-1 w-1 rounded-full bg-amber-100/60 animate-twinkle-delayed" },
      { className: "bottom-[20%] left-[20%] h-1 w-1 rounded-full bg-amber-200/60 animate-twinkle" },
      { className: "bottom-[35%] right-[18%] h-1.5 w-1.5 rounded-full bg-yellow-100/50 animate-twinkle-delayed" },
    ],
    og: {
      bg: "#0c0a09",
      accent: "#e7c873",
      text: "#f5f5f4",
      sub: "#a8a29e",
      iconSvg: ogIcon(OG_PATHS.wine, "#e7c873"),
    },
  },

  ocean: {
    key: "ocean",
    label: "Ocean Breeze",
    icon: LuWaves,
    tagline: "Cool, calm & refreshing",
    pageClass:
      "bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 text-slate-700",
    cardClass:
      "bg-white/80 backdrop-blur-xl border border-cyan-200/70 shadow-xl shadow-cyan-200/60",
    cardWrapperClass: "",
    fontClass: "font-theme-fireworks",
    headingClass:
      "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 bg-clip-text text-transparent",
    accentTextClass: "text-cyan-500",
    buttonClass:
      "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-300/50 hover:brightness-110",
    swatchClass: "bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300",
    decor: [
      {
        className:
          "top-[-4rem] right-[-4rem] h-72 w-72 rounded-full bg-cyan-300/50 blur-3xl animate-float-slow",
      },
      {
        className:
          "bottom-[-5rem] left-[-4rem] h-80 w-80 rounded-full bg-blue-300/50 blur-3xl animate-float-slower",
      },
      {
        className:
          "top-1/3 left-[10%] h-24 w-24 rounded-full bg-sky-300/40 blur-2xl animate-float-slow",
      },
    ],
    og: {
      bg: "#ecfeff",
      accent: "#06b6d4",
      text: "#0c4a6e",
      sub: "#64748b",
      iconSvg: ogIcon(OG_PATHS.waves, "#06b6d4"),
    },
  },

  sunset: {
    key: "sunset",
    label: "Sunset Glow",
    icon: LuSunset,
    tagline: "Warm, golden & vibrant",
    pageClass:
      "bg-gradient-to-br from-orange-100 via-rose-100 to-pink-100 text-slate-700",
    cardClass:
      "bg-white/80 backdrop-blur-xl border border-orange-200/70 shadow-xl shadow-orange-200/60",
    cardWrapperClass: "",
    fontClass: "font-theme-pastel",
    headingClass:
      "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent",
    accentTextClass: "text-orange-500",
    buttonClass:
      "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-300/50 hover:brightness-110",
    swatchClass: "bg-gradient-to-r from-orange-300 via-rose-300 to-pink-300",
    decor: [
      {
        className:
          "top-[-4rem] left-[-4rem] h-72 w-72 rounded-full bg-orange-300/50 blur-3xl animate-float-slow",
      },
      {
        className:
          "bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-rose-300/50 blur-3xl animate-float-slower",
      },
      {
        className:
          "top-1/3 right-[10%] h-24 w-24 rounded-full bg-pink-300/40 blur-2xl animate-float-slow",
      },
    ],
    og: {
      bg: "#fff7ed",
      accent: "#f97316",
      text: "#431407",
      sub: "#78716c",
      iconSvg: ogIcon(OG_PATHS.sunset, "#f97316"),
    },
  },
};

/** All theme keys in registry order (used to render pickers). */
export const THEME_KEYS = Object.keys(THEMES) as Exclude<ThemeKey, "custom">[];

/** Type guard that validates an untrusted string against the registry. */
export function isThemeKey(value: string): value is ThemeKey {
  return [...THEME_KEYS, "custom"].includes(value as ThemeKey);
}

/**
 * Custom theme overrides stored per-wish in the `custom_theme` jsonb column.
 * All values are keys into curated presets so Tailwind can statically
 * extract the classes.
 */
export type CustomThemeConfig = {
  /** Base theme to start from (colors are overridden, structure is kept) */
  baseTheme: Exclude<ThemeKey, "custom">;
  /** Background gradient preset key */
  background: string;
  /** Accent color preset key */
  accent: string;
  /** Card style preset key */
  cardStyle: string;
  /** Font preset key */
  font: string;
  /** Decor preset key */
  decor: string;
};

/** Curated background gradient presets for custom themes. */
export const BACKGROUND_PRESETS: Record<string, { label: string; pageClass: string; swatchClass: string; ogBg: string }> = {
  rose: {
    label: "Rose Blush",
    pageClass: "bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100 text-slate-700",
    swatchClass: "bg-gradient-to-r from-rose-300 via-pink-300 to-fuchsia-300",
    ogBg: "#fff1f2",
  },
  sky: {
    label: "Sky Blue",
    pageClass: "bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 text-slate-700",
    swatchClass: "bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300",
    ogBg: "#f0f9ff",
  },
  mint: {
    label: "Mint Fresh",
    pageClass: "bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 text-slate-700",
    swatchClass: "bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300",
    ogBg: "#ecfdf5",
  },
  amber: {
    label: "Amber Glow",
    pageClass: "bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 text-slate-700",
    swatchClass: "bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-300",
    ogBg: "#fffbeb",
  },
  violet: {
    label: "Violet Dream",
    pageClass: "bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 text-slate-700",
    swatchClass: "bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300",
    ogBg: "#f5f3ff",
  },
  midnight: {
    label: "Midnight",
    pageClass: "bg-gradient-to-b from-slate-900 via-indigo-950 to-black text-slate-200",
    swatchClass: "bg-gradient-to-r from-slate-600 via-indigo-700 to-black",
    ogBg: "#0f172a",
  },
  sunset: {
    label: "Sunset",
    pageClass: "bg-gradient-to-br from-orange-100 via-rose-100 to-pink-100 text-slate-700",
    swatchClass: "bg-gradient-to-r from-orange-300 via-rose-300 to-pink-300",
    ogBg: "#fff7ed",
  },
  forest: {
    label: "Forest",
    pageClass: "bg-gradient-to-br from-emerald-50 via-green-100 to-lime-100 text-slate-700",
    swatchClass: "bg-gradient-to-r from-emerald-300 via-green-300 to-lime-300",
    ogBg: "#f0fdf4",
  },
};

/** Curated accent color presets for custom themes. */
export const ACCENT_PRESETS: Record<string, { label: string; accentClass: string; headingClass: string; buttonClass: string; ogAccent: string }> = {
  pink: {
    label: "Pink",
    accentClass: "text-pink-500",
    headingClass: "bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-lg shadow-pink-300/50 hover:brightness-110",
    ogAccent: "#ec4899",
  },
  blue: {
    label: "Blue",
    accentClass: "text-blue-500",
    headingClass: "bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-300/50 hover:brightness-110",
    ogAccent: "#3b82f6",
  },
  emerald: {
    label: "Emerald",
    accentClass: "text-emerald-500",
    headingClass: "bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-300/50 hover:brightness-110",
    ogAccent: "#10b981",
  },
  amber: {
    label: "Amber",
    accentClass: "text-amber-500",
    headingClass: "bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-300/50 hover:brightness-110",
    ogAccent: "#f59e0b",
  },
  violet: {
    label: "Violet",
    accentClass: "text-violet-500",
    headingClass: "bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-300/50 hover:brightness-110",
    ogAccent: "#8b5cf6",
  },
  rose: {
    label: "Rose",
    accentClass: "text-rose-500",
    headingClass: "bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-300/50 hover:brightness-110",
    ogAccent: "#f43f5e",
  },
  teal: {
    label: "Teal",
    accentClass: "text-teal-500",
    headingClass: "bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-300/50 hover:brightness-110",
    ogAccent: "#14b8a6",
  },
  orange: {
    label: "Orange",
    accentClass: "text-orange-500",
    headingClass: "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent",
    buttonClass: "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-300/50 hover:brightness-110",
    ogAccent: "#f97316",
  },
};

/** Curated card style presets for custom themes. */
export const CARD_STYLE_PRESETS: Record<string, { label: string; cardClass: string }> = {
  glass: {
    label: "Glass",
    cardClass: "bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl",
  },
  solid: {
    label: "Solid",
    cardClass: "bg-white border border-slate-200 shadow-xl",
  },
  bordered: {
    label: "Bordered",
    cardClass: "bg-white border-4 border-slate-900 shadow-[8px_8px_0_0_#0f172a]",
  },
};

/** Curated font presets for custom themes. */
export const FONT_PRESETS: Record<string, { label: string; fontClass: string }> = {
  pastel: { label: "Baloo (Rounded)", fontClass: "font-theme-pastel" },
  fireworks: { label: "Fredoka (Playful)", fontClass: "font-theme-fireworks" },
  funny: { label: "Chewy (Silly)", fontClass: "font-theme-funny" },
  elegant: { label: "Playfair (Serif)", fontClass: "font-theme-elegant" },
  pacifico: { label: "Pacifico (Script)", fontClass: "font-theme-pacifico" },
  bebas: { label: "Bebas Neue (Bold)", fontClass: "font-theme-bebas" },
};

/** Curated decor presets for custom themes. */
export const DECOR_PRESETS: Record<string, { label: string; decor: Decor[] }> = {
  none: { label: "None", decor: [] },
  floating: {
    label: "Floating Icons",
    decor: [
      { className: "top-[10%] left-[6%] animate-float-slow", icon: LuPartyPopper, iconClassName: "h-12 w-12 opacity-40" },
      { className: "top-[22%] right-[8%] animate-float-slower", icon: LuGift, iconClassName: "h-10 w-10 opacity-40" },
      { className: "bottom-[15%] left-[12%] animate-float-slower", icon: LuRocket, iconClassName: "h-10 w-10 opacity-40" },
      { className: "bottom-[25%] right-[10%] animate-float-slow", icon: LuSparkles, iconClassName: "h-12 w-12 opacity-40" },
    ],
  },
  twinkles: {
    label: "Twinkles",
    decor: [
      { className: "top-[12%] left-[8%] h-2 w-2 rounded-full bg-white/80 animate-twinkle" },
      { className: "top-[28%] right-[12%] h-1.5 w-1.5 rounded-full bg-white/70 animate-twinkle-delayed" },
      { className: "top-[60%] left-[15%] h-1.5 w-1.5 rounded-full bg-white/70 animate-twinkle" },
      { className: "bottom-[18%] right-[20%] h-2 w-2 rounded-full bg-white/70 animate-twinkle-delayed" },
      { className: "top-[8%] right-[30%] h-1 w-1 rounded-full bg-white/60 animate-twinkle" },
      { className: "bottom-[30%] left-[30%] h-1 w-1 rounded-full bg-white/60 animate-twinkle-delayed" },
    ],
  },
};

/**
 * Resolves the effective theme config for a wish.
 *
 * If the wish has a `custom_theme` JSON, the custom overrides are merged
 * onto the base theme's structure. Otherwise the standard theme is used.
 */
export function resolveTheme(
  themeKey: ThemeKey,
  customTheme?: CustomThemeConfig | null
): ThemeConfig {
  // Standard theme (no custom overrides)
  if (themeKey !== "custom" || !customTheme) {
    return THEMES[themeKey === "custom" ? "pastel" : themeKey];
  }

  // Custom theme: merge curated presets onto the base theme
  const base = THEMES[customTheme.baseTheme] ?? THEMES.pastel;
  const bg = BACKGROUND_PRESETS[customTheme.background] ?? BACKGROUND_PRESETS.rose;
  const accent = ACCENT_PRESETS[customTheme.accent] ?? ACCENT_PRESETS.pink;
  const card = CARD_STYLE_PRESETS[customTheme.cardStyle] ?? CARD_STYLE_PRESETS.glass;
  const font = FONT_PRESETS[customTheme.font] ?? FONT_PRESETS.pastel;
  const decor = DECOR_PRESETS[customTheme.decor] ?? DECOR_PRESETS.none;

  return {
    ...base,
    key: "custom",
    label: "Custom",
    icon: LuPalette,
    tagline: "Made your way",
    pageClass: bg.pageClass,
    cardClass: card.cardClass,
    cardWrapperClass: "",
    fontClass: font.fontClass,
    headingClass: accent.headingClass,
    accentTextClass: accent.accentClass,
    buttonClass: accent.buttonClass,
    swatchClass: bg.swatchClass,
    decor: decor.decor,
    og: {
      bg: bg.ogBg,
      accent: accent.ogAccent,
      text: base.og.text,
      sub: base.og.sub,
      iconSvg: base.og.iconSvg,
    },
  };
}
