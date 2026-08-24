// components/reviews/pending-review-row.tsx
"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { PendingReviewItem } from "@/actions/review.actions";

type Props = {
  item: PendingReviewItem;
  onRate?: () => void;
};

export default function PendingReviewRow({ item, onRate }: Props) {
  const isNeedsReview = item.type === "needs_review";

  const deliveredDate = item.deliveredAt
    ? new Date(item.deliveredAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        {/* Left: Image + Info */}
        <div className="flex items-center gap-4">
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

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-black">
              {item.productName}
            </p>

            {isNeedsReview ? (
              <div className="mt-1 space-y-0.5 text-xs text-black/50">
                {item.orderReference && (
                  <p className="font-mono">Order: {item.orderReference}</p>
                )}
                {deliveredDate && <p>Delivered: {deliveredDate}</p>}
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < (item.rating || 0)
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-transparent text-black/15"
                    }
                  />
                ))}
                <span className="ml-2 text-xs font-medium text-amber-600">
                  Pending approval
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action */}
        {isNeedsReview && onRate && (
          <button
            type="button"
            onClick={onRate}
            className="btn-primary shrink-0 px-6 text-sm sm:w-auto"
          >
            Rate this product
          </button>
        )}
      </div>

      {/* Show review preview for pending approval */}
      {!isNeedsReview && item.comment && (
        <div className="mt-4 rounded-xl border border-black/5 bg-neutral-50 p-3">
          {item.title && (
            <p className="text-sm font-medium">{item.title}</p>
          )}
          <p className="mt-1 line-clamp-2 text-xs text-black/60">
            {item.comment}
          </p>
        </div>
      )}
    </div>
  );
}