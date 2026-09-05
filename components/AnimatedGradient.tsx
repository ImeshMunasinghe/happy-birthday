"use client";

/**
 * Animated gradient background component.
 *
 * Applies a slowly shifting gradient background based on the current theme.
 * The animation is done purely with CSS (no JavaScript animation cost).
 *
 * Usage: Place as the first child of a relative-positioned container.
 */

type AnimatedGradientProps = {
  themeKey: string;
};

const GRADIENT_CLASSES: Record<string, string> = {
  pastel: "gradient-pastel",
  fireworks: "gradient-fireworks",
  funny: "gradient-funny",
  elegant: "gradient-elegant",
  ocean: "gradient-ocean",
  sunset: "gradient-sunset",
  custom: "gradient-custom",
};

export default function AnimatedGradient({ themeKey }: AnimatedGradientProps) {
  const gradientClass = GRADIENT_CLASSES[themeKey] ?? "gradient-pastel";

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 animate-gradient ${gradientClass}`}
    />
  );
}