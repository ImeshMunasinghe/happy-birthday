"use client";

/**
 * Share controls for the wish page: copy-to-clipboard, WhatsApp, and X.
 *
 * The canonical URL is read through useSyncExternalStore, which provides
 * an empty server snapshot (buttons render disabled) and the real
 * location after hydration, avoiding setState-in-effect cascades.
 */

import { useState, useSyncExternalStore } from "react";
import { LuLink, LuCheck } from "react-icons/lu";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";

type ShareButtonsProps = {
  recipientName: string;
  accentClass: string;
};

/**
 * The current page URL. Available only in the browser; the server
 * snapshot is an empty string, which keeps share links inert until
 * hydration completes.
 */
const emptySubscribe = () => () => {};
const getClientUrl = () => window.location.href;
const getServerUrl = () => "";

export default function ShareButtons({
  recipientName,
  accentClass,
}: ShareButtonsProps) {
  const url = useSyncExternalStore(emptySubscribe, getClientUrl, getServerUrl);
  const [copied, setCopied] = useState(false);

  const text = `A birthday wish for ${recipientName}!`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  /** Copies the current URL and shows a transient confirmation state. */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (permissions or insecure context); ignore.
    }
  }

  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={copyLink}
        disabled={!url}
        className={`${base} ${accentClass} disabled:opacity-60`}
      >
        {copied ? (
          <>
            <LuCheck className="h-4 w-4" /> Copied!
          </>
        ) : (
          <>
            <LuLink className="h-4 w-4" /> Copy link
          </>
        )}
      </button>

      <a
        href={url ? whatsappHref : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!url) e.preventDefault();
        }}
        className={`${base} border border-current/30 opacity-80 hover:opacity-100`}
      >
        <FaWhatsapp className="h-4 w-4" /> WhatsApp
      </a>

      <a
        href={url ? twitterHref : undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!url) e.preventDefault();
        }}
        className={`${base} border border-current/30 opacity-80 hover:opacity-100`}
      >
        <FaXTwitter className="h-4 w-4" /> Post
      </a>
    </div>
  );
}