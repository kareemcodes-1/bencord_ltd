"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { priceFormatter } from "@/lib/priceFormatter";
import { getProductPricing } from "@/lib/product-pricing";
import {
  getStockLabel,
  getStockStatus,
  isAddToCartDisabled,
} from "@/lib/product-stock";
import { useCurrencyStore } from "@/store/currency";

type StickyAddToCartBarProps = {
  product: Product;
};

const StickyAddToCartBar = ({ product }: StickyAddToCartBarProps) => {
  const { addItem } = useCartStore();
  const [visible, setVisible] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stockStatus = getStockStatus(product);
  const stockLabel = getStockLabel(product);
  const disabled = isAddToCartDisabled(product);

  const thumbnail = product.media.find((item) => item.type === "image");

  const { originalPrice, finalPrice, hasDiscount } =
    getProductPricing(product);

  const handleAddToCart = () => {
    if (disabled) return;
    addItem(product, 1);
  };

  const stockBadgeClass =
    stockStatus === "out-of-stock"
      ? "border-red-200 bg-red-100 text-red-700"
      : stockStatus === "low-stock"
        ? "border-amber-200 bg-amber-100 text-amber-800"
        : "border-emerald-200 bg-emerald-100 text-emerald-700";

  const statusDotClass =
    stockStatus === "out-of-stock"
      ? "bg-red-500"
      : stockStatus === "low-stock"
        ? "bg-amber-400"
        : "bg-emerald-500";

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[90rem] items-center gap-4 px-4 py-3 lg:px-8">
        {/* Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {thumbnail && (
            <Image
              src={thumbnail.url}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          )}
        </div>

        {/* Name + price */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-black">
            {product.name}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-black/80">
              {priceFormatter(finalPrice)}
            </p>

            {hasDiscount && (
              <p className="text-xs text-black/40 line-through">
                {priceFormatter(originalPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Stock badge */}
        <div
          className={`hidden w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm sm:flex ${stockBadgeClass}`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${statusDotClass}`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${statusDotClass}`}
            />
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.08em]">
            {stockLabel}
          </span>
        </div>

        {/* Add to cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={disabled}
          className="btn-primary shrink-0 px-6 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default StickyAddToCartBar;