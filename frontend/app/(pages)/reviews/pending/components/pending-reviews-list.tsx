"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import type { PendingReviewItem } from "@/actions/review.actions";
import PendingReviewRow from "./pending-review-row";
import ReviewSheet from "@/app/(pages)/shop/p/[slug]/components/review-sheet";
import EmptyState from "@/app/components/empty-state";

type Props = {
  initialItems: PendingReviewItem[];
};

export default function PendingReviewsList({
  initialItems,
}: Props) {
  const router = useRouter();

  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<{
    slug: string;
    name: string;
  } | null>(null);

  // Sync the list when refreshed server data arrives.
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleRateProduct = (item: PendingReviewItem) => {
    setSelectedProduct({
      slug: item.productSlug,
      name: item.productName,
    });

    setSheetOpen(true);
  };

  const handleReviewSuccess = () => {
    // Let the server determine the new review status.
    setSheetOpen(false);
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Star}
        message="No pending reviews."
        buttonText="Continue Shopping"
        buttonHref="/shop"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={
              item.type === "needs_review"
                ? `needs-${item.productId}`
                : `pending-${item.reviewId}`
            }
            className="relative"
          >
            {item.type === "pending_approval" && (
              <span className="absolute right-4 top-4 z-10 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wide text-orange-700 sm:right-5 sm:top-5 sm:text-[0.7rem]">
                Pending approval
              </span>
            )}

            <PendingReviewRow
              item={item}
              onRate={
                item.type === "needs_review"
                  ? () => handleRateProduct(item)
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {selectedProduct && (
        <ReviewSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          productSlug={selectedProduct.slug}
          productName={selectedProduct.name}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}

