"use client";

/**
 * Floating music toggle button for the wish reveal page.
 *
 * Browsers block autoplay with sound, so the audio starts muted and the
 * user taps the button to unmute/play. Uses HTML5 <audio> with
 * preload="none" so the track is only fetched on first interaction.
 */

import { useEffect, useRef, useState } from "react";
import { LuMusic, LuVolume2, LuVolumeX } from "react-icons/lu";

type MusicToggleProps = {
  track: string;
  accentClass: string;
};

const TRACK_PATHS: Record<string, string> = {
  "happy-birthday": "/audio/happy-birthday.mp3",
  celebration: "/audio/celebration.mp3",
  chill: "/audio/chill.mp3",
  romantic: "/audio/romantic.mp3",
};

export default function MusicToggle({ track, accentClass }: MusicToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const src = TRACK_PATHS[track];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!src) return null;

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.6;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition hover:scale-105 ${accentClass}`}
      aria-label={isPlaying ? "Pause music" : "Play music"}
      title={isPlaying ? "Pause music" : "Play music"}
    >
      {isPlaying ? (
        <LuVolume2 className="h-5 w-5 animate-pulse" />
      ) : (
        <LuVolumeX className="h-5 w-5" />
      )}
      <LuMusic className={`h-4 w-4 ${isPlaying ? "animate-spin" : ""}`} />
    </button>
  );
}