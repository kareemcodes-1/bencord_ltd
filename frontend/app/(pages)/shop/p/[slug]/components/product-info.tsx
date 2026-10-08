"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { priceFormatter } from "@/lib/priceFormatter";
import { getProductPricing } from "@/lib/product-pricing";

type ProductInfoProps = {
  product: Product;
};

const ProductInfo = ({ product }: ProductInfoProps) => {
  const router = useRouter();
  const { addItem } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);

  const [quantity, setQuantity] = useState(1);

  const disabled = !product.inStock;
  const stockLabel = product.inStock ? "In stock" : "Out of stock";

  const categorySlug = product.categoryId?.name
    ?.toLowerCase()
    .replace(/\s+/g, "-");

  const reviewCount = product.reviewCount ?? 0;
  const averageRating = product.averageRating ?? 0;

  const { originalPrice, finalPrice, hasDiscount, discountLabel } =
    getProductPricing(product);

  const handleAddToCart = () => {
    if (disabled) return;
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    if (disabled) return;
    addItem(product, 1);
    router.push("/checkout");
  };

  const stockBadgeClass = product.inStock
    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
    : "border-red-200 bg-red-100 text-red-700";

  const statusDotClass = product.inStock
    ? "bg-emerald-500"
    : "bg-red-500";

  return (
    <div className="flex w-full flex-col lg:w-1/2 lg:self-start lg:sticky lg:top-[5.5rem]">
      <div className="flex h-full flex-col justify-center py-6 sm:py-8 lg:px-[4rem] lg:py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-black/40 sm:text-[0.7rem]">
          <Link href="/" className="transition-colors hover:text-black">
            Home
          </Link>

          <span>/</span>

          {product.categoryId && (
            <>
              <Link
                href={`/shop?categories=${product._id}`}
                className="transition-colors hover:text-black"
              >
                {product.categoryId.name}
              </Link>

              <span>/</span>
            </>
          )}

          <span className="max-w-[12rem] truncate text-black/70 sm:max-w-none">
            {product.name}
          </span>
        </div>

        {/* Name + stock */}
        <div className="mb-5 sm:mb-6">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h1 className="heading-1 max-w-[min(28rem,100%)]">
              {product.name}
            </h1>

            <div
              className={`flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm ${stockBadgeClass}`}
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
          </div>

          {reviewCount > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    className={
                      index < Math.round(averageRating)
                        ? "fill-[#F5C518] text-[#F5C518]"
                        : "fill-transparent text-black/15"
                    }
                  />
                ))}
              </div>

              <span className="text-[0.75rem] font-medium text-black/50">
                {averageRating.toFixed(1)} · {reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}

          <div className="mb-4 h-px w-full bg-black/10" />

          {/* Price + discount */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[1.35rem] sm:text-[1.5rem] lg:text-[1.8rem]">
              {priceFormatter(finalPrice)}
            </p>

            {hasDiscount && (
              <>
                <p className="text-[1.1rem] text-black/40 line-through sm:text-[1.25rem]">
                  {priceFormatter(originalPrice)}
                </p>

                {discountLabel && (
                  <span className="rounded-full bg-[#ee0a0a] px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-white">
                    {discountLabel}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quantity + Add to cart */}
        <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-stretch sm:gap-3">
          <div className="flex h-12 min-w-0 items-center justify-between gap-4 rounded-[0.75rem] border border-black/20 px-4 sm:h-[3.2rem] sm:min-w-[8rem]">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>

            <span className="text-[1rem]">{quantity}</span>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setQuantity((current) => current + 1)}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={disabled}
            className="btn-primary w-full flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disabled ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={disabled}
          className="mb-6 w-full rounded-[0.75rem] border border-black/15 py-3 text-[0.7rem] font-medium uppercase tracking-[0.1em] transition-all duration-300 hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:mb-8 sm:py-3.5 sm:text-[0.75rem]"
        >
          Buy Now
        </button>

        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem
            value="description"
            className="rounded-[0.75rem] border border-black/10 bg-white px-3.5 py-1.5 shadow-xs sm:rounded-2xl sm:px-5 sm:py-2 md:px-6"
          >
            <AccordionTrigger className="py-3 text-left font-geist text-[0.8rem] font-medium uppercase transition-colors hover:text-[#ee0a0a] sm:py-4 sm:text-[15px] md:text-[1rem]">
              Description
            </AccordionTrigger>

            <AccordionContent className="pr-2 pb-3 font-geist text-[0.875rem] leading-6 text-black/70 sm:pr-6 sm:pb-4 sm:text-[0.925rem] sm:leading-7">
              {product.description}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ProductInfo;