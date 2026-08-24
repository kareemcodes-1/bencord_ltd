"use client";

import Link from "next/link";
import { Home, Search } from "lucide-react";
import { SplitLines } from "@/components/animations/SplitLines";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-20 text-center sm:px-6 sm:pt-[5rem]">
      {/* Background accents */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-100 blur-3xl sm:h-96 sm:w-96" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <span className="text-[10rem] font-black leading-none tracking-tighter text-black/[0.03] sm:text-[16rem] lg:text-[22rem]">
          404
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#ff0000]">
          Oops
        </p>

        <SplitLines
          text="We can't find that page"
          tag="h1"
          className="heading-1 mb-4"
          duration={0.9}
          stagger={0.02}
          ease="power3.out"
          yPercent={150}
          threshold={0.1}
          rootMargin="0px"
        />

        <p className="mx-auto mb-8 max-w-[22rem] text-[0.95rem] leading-relaxed text-black/50 sm:mb-10 sm:max-w-[28rem]">
          It may have been moved, renamed, or never existed. No worries — you
          can head home or keep shopping.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home size={16} strokeWidth={1.8} />
            Back to home
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-[0.75rem] border border-black/15 px-8 py-[0.95rem] text-[0.8rem] font-medium uppercase tracking-wide transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
          >
            <Search size={16} strokeWidth={1.8} />
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  );
}