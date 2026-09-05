"use client";

/**
 * Gallery component for displaying uploaded wish photos.
 *
 * - 1 photo: large hero image
 * - 2+ photos: main viewer with prev/next arrows + thumbnail strip
 * - Click to open a fullscreen lightbox with keyboard navigation
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";

type ImageGalleryProps = {
  urls: string[];
};

export default function ImageGallery({ urls }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!urls || urls.length === 0) return null;

  const goPrev = () => {
    setActiveIndex((i) => (i - 1 + urls.length) % urls.length);
  };

  const goNext = () => {
    setActiveIndex((i) => (i + 1) % urls.length);
  };

  return (
    <div className="mb-6">
      {/* Main viewer */}
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={urls[activeIndex]}
            alt={`Wish photo ${activeIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightboxOpen(true)}
            className="h-64 w-full cursor-pointer object-cover sm:h-80"
          />
        </AnimatePresence>

        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="Previous photo"
            >
              <LuChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="Next photo"
            >
              <LuChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {activeIndex + 1} / {urls.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip for 2+ photos */}
      {urls.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-14 w-16 shrink-0 overflow-hidden rounded-lg transition ${
                i === activeIndex
                  ? "ring-2 ring-pink-500 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <LuX className="h-6 w-6" />
            </button>
            <motion.img
              src={urls[activeIndex]}
              alt={`Wish photo ${activeIndex + 1} enlarged`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {urls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white"
                  aria-label="Previous photo"
                >
                  <LuChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white"
                  aria-label="Next photo"
                >
                  <LuChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}