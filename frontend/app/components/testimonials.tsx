"use client";

import { Star, Quote } from "lucide-react";
import { SplitLines } from "@/components/animations/SplitLines";

const testimonials = [
  {
    id: 1,
    name: "Michael Owusu",
    review:
      "We've been ordering our HP toner cartridges from Bencord for over a year. Their products are always genuine, delivery is fast, and we've never had compatibility issues.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Mensah",
    review:
      "Finding original Canon ink cartridges used to be difficult until we discovered Bencord. Excellent customer service and very competitive prices.",
    rating: 5,
  },
  {
    id: 3,
    name: "Daniel Boateng",
    review:
      "Our office purchased printers and accessories through Bencord, and the experience was smooth from ordering to delivery. Highly recommended.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="section-spacing bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <SplitLines
            text="Testimonials"
            tag="span"
            className="subtitle"
            duration={0.8}
            stagger={0.02}
            ease="power3.out"
            yPercent={120}
            threshold={0.1}
            rootMargin="-80px"
          />

          <SplitLines
            text="Trusted by Businesses Across Ghana"
            tag="h2"
            className="heading-1"
            duration={1}
            stagger={0.025}
            ease="power3.out"
            yPercent={150}
            threshold={0.1}
            rootMargin="-100px"
            delay={0.05}
          />

          <div className="line-border" />
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-7">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`
                group relative overflow-hidden rounded-2xl border border-black/5
                bg-[#fafafa] p-6 sm:p-7
                transition-all duration-500
                hover:-translate-y-2 hover:bg-red-50/60 hover:border-[#ee0a0a]/20 hover:shadow-xl
                ${index === 1 ? "lg:-translate-y-6" : ""}
              `}
            >
              {/* Faint quote icon */}
              <Quote
                size={56}
                strokeWidth={1.5}
                className="absolute right-5 top-5 text-[#ee0a0a]/10"
              />

              {/* Stars */}
              <div className="mb-5 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-[#ee0a0a] text-[#ee0a0a]"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="relative z-10 mb-8 text-[0.95rem] leading-relaxed text-black/70">
                “{testimonial.review}”
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Name initial avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ee0a0a]/10 text-lg font-medium text-[#ee0a0a] ring-4 ring-white">
                  {testimonial.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-base font-semibold text-black">
                    {testimonial.name}
                  </h4>
                  <span className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
    Verified purchase
  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}