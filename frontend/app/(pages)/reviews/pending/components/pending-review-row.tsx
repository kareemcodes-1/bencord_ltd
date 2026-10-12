"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { PendingReviewItem } from "@/actions/review.actions";

type Props = {
  item: PendingReviewItem;
  onRate?: () => void;
};

export default function PendingReviewRow({
  item,
  onRate,
}: Props) {
  const isNeedsReview = item.type === "needs_review";

  const deliveredDate = item.deliveredAt
    ? new Date(item.deliveredAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black/15 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        {/* Product information */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
            {item.productImage && (
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-black">
              {item.productName}
            </p>

            {isNeedsReview ? (
              <div className="mt-1 space-y-0.5 text-xs text-black/50">
                {item.orderReference && (
                  <p className="font-mono">
                    Order: {item.orderReference}
                  </p>
                )}

                {deliveredDate && (
                  <p>Delivered: {deliveredDate}</p>
                )}
              </div>
            ) : (
              <div
                className="mt-1.5 flex items-center gap-1.5"
                aria-label={`Your rating: ${item.rating || 0} out of 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < (item.rating || 0)
                        ? "fill-[#F5C518] text-[#F5C518]"
                        : "fill-transparent text-black/15"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action or review status */}
        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          {isNeedsReview && onRate ? (
            <button
              type="button"
              onClick={onRate}
              className="btn-primary w-full px-5 text-sm sm:w-auto sm:px-6"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Star size={15} />
                Rate this product
              </span>
            </button>
          ) : !isNeedsReview ? (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-700 sm:text-xs">
              Pending approval
            </span>
          ) : null}
        </div>
      </div>

      {/* Review preview for submitted reviews awaiting approval */}
      {!isNeedsReview && item.comment && (
        <div className="mt-4 rounded-xl border border-black/5 bg-neutral-50 p-3.5">
          {item.title && (
            <p className="text-sm font-medium text-black">
              {item.title}
            </p>
          )}

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/60">
            {item.comment}
          </p>
        </div>
      )}
    </div>
  );
}

