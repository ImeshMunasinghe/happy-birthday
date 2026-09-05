"use client";

/**
 * Typewriter text effect for the wish message reveal.
 *
 * Types out the message character by character with a blinking cursor,
 * creating a dramatic, cinematic reveal experience.
 */

import { useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  onComplete?: () => void;
};

export default function TypewriterText({
  text,
  speed = 30,
  startDelay = 500,
  className = "",
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(delayTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, started, onComplete]);

  if (!started) return <span className={className}>&nbsp;</span>;

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="typewriter-cursor" />
      )}
    </span>
  );
}