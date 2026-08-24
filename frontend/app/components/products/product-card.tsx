"use client";

import Image from "next/image";
import Link from "next/link";

import { priceFormatter } from "@/lib/priceFormatter";
import { getProductPricing } from "@/lib/product-pricing";
import type { Product } from "@/types";
import { useCurrencyStore } from "@/store/currency";
import FadeContent from "@/components/animations/fade-content";

const ProductCard = ({ item }: { item: Product }) => {
  const currency = useCurrencyStore((s) => s.currency);
  const images = item.media.filter((media) => media.type === "image");
  const firstImage = images[0];
  const secondImage = images[1];
  const video = item.media.find((media) => media.type === "video");

  const fallbackImage = firstImage?.url || "/placeholder.jpg";
  const hoverImage = secondImage?.url || fallbackImage;

  const { originalPrice, finalPrice, hasDiscount, discountLabel } =
    getProductPricing(item);

  return (
    <Link href={`/shop/p/${item.slug}`} className="group flex h-full flex-col">
      <FadeContent key={item._id} blur={true} duration={1000} initialOpacity={0}>
        {/* Image Container */}
<div className="relative h-[240px] w-full overflow-hidden rounded-xl bg-neutral-50 border border-black/5 sm:h-[260px] lg:h-[300px]">
          <Image
            src={fallbackImage}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw"
            className={`object-cover p-4 transition-opacity duration-500 ${
              video || secondImage ? "group-hover:opacity-0" : ""
            }`}
          />

          {video && (
            <video
              src={video.url}
              muted
              loop
              playsInline
              preload="metadata"
              autoPlay
              className="absolute inset-0 h-full w-full object-contain p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {!video && secondImage && (
            <Image
              src={hoverImage}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw"
              className="absolute inset-0 object-contain p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Discount badge */}
          {hasDiscount && discountLabel && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#ee0a0a] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-sm">
              {discountLabel}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.01em] text-[#ee0a0a]">
            {typeof item.categoryId === "object" ? item.categoryId.name : ""}
          </span>

          <h4 className="text-[1.15rem] font-medium leading-snug text-black sm:text-[1.25rem] line-clamp-2">
  {item.name}
</h4>

          <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-[1.2rem] font-semibold text-black sm:text-[1.5rem]">
  {priceFormatter(finalPrice)}
</p>

            {hasDiscount && (
              <p className="text-sm text-black/40 line-through">
                {priceFormatter(originalPrice)}
              </p>
            )}
          </div>
        </div>
      </FadeContent>
    </Link>
  );
};

export default ProductCard;