"use client";

/**
 * Animated particle background system.
 *
 * Renders theme-aware particles on a canvas element:
 * - Pastel: soft pink/purple floating orbs
 * - Fireworks: bright star-like sparks
 * - Funny: colorful confetti pieces
 * - Elegant: golden sparkles
 * - Ocean: rising bubbles
 * - Sunset: warm floating embers
 *
 * Lightweight Canvas API implementation (~60fps, no external dependencies).
 */

import { useEffect, useRef } from "react";

type ParticleBackgroundProps = {
  themeKey: string;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
};

const THEME_PARTICLES: Record<string, { colors: string[]; count: number; speed: number }> = {
  pastel: { colors: ["#f9a8d4", "#c4b5fd", "#7dd3fc", "#fde68a"], count: 25, speed: 0.3 },
  fireworks: { colors: ["#fbbf24", "#f97316", "#fb7185", "#38bdf8", "#a78bfa"], count: 40, speed: 0.5 },
  funny: { colors: ["#f97316", "#fbbf24", "#ef4444", "#8b5cf6", "#06b6d4"], count: 30, speed: 0.6 },
  elegant: { colors: ["#e7c873", "#f5e6b8", "#d4af37", "#fff8dc"], count: 20, speed: 0.2 },
  ocean: { colors: ["#67e8f9", "#6ee7b7", "#7dd3fc", "#a5f3fc"], count: 30, speed: 0.4 },
  sunset: { colors: ["#fb923c", "#f472b6", "#fbbf24", "#f97316"], count: 25, speed: 0.3 },
  custom: { colors: ["#f9a8d4", "#c4b5fd", "#7dd3fc", "#fde68a"], count: 25, speed: 0.3 },
};

export default function ParticleBackground({ themeKey }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = THEME_PARTICLES[themeKey] ?? THEME_PARTICLES.pastel;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const particles: Particle[] = Array.from({ length: config.count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * config.speed,
      speedY: themeKey === "ocean"
        ? -(Math.random() * config.speed + 0.2)
        : (Math.random() - 0.5) * config.speed,
      opacity: Math.random() * 0.5 + 0.2,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [themeKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}