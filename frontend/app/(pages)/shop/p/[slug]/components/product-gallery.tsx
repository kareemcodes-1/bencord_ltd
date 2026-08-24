"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { Product } from "@/types";

type ProductGalleryProps = {
  media: Product["media"];
  name: string;
};

const ProductGallery = ({ media, name }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null;
  const activeItem = isOpen ? media[activeIndex] : null;

  const close = useCallback(() => setActiveIndex(null), []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => {
      if (i === null || media.length === 0) return i;
      return (i - 1 + media.length) % media.length;
    });
  }, [media.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => {
      if (i === null || media.length === 0) return i;
      return (i + 1) % media.length;
    });
  }, [media.length]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close, goPrev, goNext]);

  if (!media.length) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center bg-neutral-100 lg:w-1/2">
        <p className="text-sm text-black/40">No media available.</p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery */}
      <div className="flex w-full flex-col gap-3 lg:w-1/2">
        {media.map((item, index) => (
          <button
            key={item._id ?? index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-neutral-50 text-left"
            aria-label={`View ${name} media ${index + 1}`}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.url}
                  className="h-full w-full object-contain p-6"
                  muted
                  playsInline
                  preload="metadata"
                  autoPlay
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-white">
                  Video
                </span>
              </>
            ) : (
              <Image
                src={item.url}
                alt={`${name} ${index + 1}`}
                fill
                quality={80}
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6"
              />
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {isOpen && activeItem && (
        <div
          className="fixed inset-0 z-[400] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
        >
          {/* Top bar */}
          <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/50">
              {activeIndex! + 1} / {media.length}
            </p>

            <button
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white hover:text-black"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Media stage */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 sm:px-16">
            {media.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous"
                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition-colors hover:bg-[#ee0a0a] sm:left-4 sm:h-12 sm:w-12"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <div className="relative h-full w-full max-w-5xl">
              {activeItem.type === "video" ? (
                <video
                  key={activeItem.url}
                  src={activeItem.url}
                  className="h-full w-full object-contain"
                  controls
                  playsInline
                  autoPlay
                />
              ) : (
                <Image
                  key={activeItem.url}
                  src={activeItem.url}
                  alt={`${name} ${activeIndex! + 1}`}
                  fill
                  quality={90}
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              )}
            </div>

            {media.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Next"
                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition-colors hover:bg-[#ee0a0a] sm:right-4 sm:h-12 sm:w-12"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>

          {/* Thumb strip */}
          {media.length > 1 && (
            <div className="flex shrink-0 gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6">
              {media.map((item, index) => (
                <button
                  key={item._id ?? index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-16 sm:w-16 ${
                    index === activeIndex
                      ? "border-[#ee0a0a]"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductGallery;