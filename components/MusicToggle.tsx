"use client";

/**
 * Floating music toggle button for the wish reveal page.
 *
 * Browsers block autoplay with sound, so the audio starts playing muted
 * on page load and the user taps the button to unmute. Uses HTML5 <audio>
 * with preload="none" so the track is only fetched on first interaction.
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
  // Start as "playing" (but muted) so music begins on page load
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const src = TRACK_PATHS[track];

  // Auto-play muted on page load (browsers allow muted autoplay)
  useEffect(() => {
    if (!src) return;

    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.6;
    audioRef.current.muted = true;

    // Start playing muted (browsers allow this)
    audioRef.current.play().catch(() => {});

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  if (!src) return null;

  const toggle = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      // Unmute the music
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      // Mute the music
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition hover:scale-105 ${accentClass}`}
      aria-label={isMuted ? "Unmute music" : "Mute music"}
      title={isMuted ? "Unmute music" : "Mute music"}
    >
      {isMuted ? (
        <LuVolumeX className="h-5 w-5" />
      ) : (
        <LuVolume2 className="h-5 w-5 animate-pulse" />
      )}
      <LuMusic className={`h-4 w-4 ${isMuted ? "" : "animate-spin"}`} />
    </button>
  );
}