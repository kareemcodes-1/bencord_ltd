// components/reviews/pending-reviews-list.tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { PendingReviewItem } from "@/actions/review.actions";
import PendingReviewRow from "./pending-review-row";
import ReviewSheet from "@/app/(pages)/shop/p/[slug]/components/review-sheet";
import EmptyState from "@/app/components/empty-state";

type Props = {
  initialItems: PendingReviewItem[];
};

export default function PendingReviewsList({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    slug: string;
    name: string;
  } | null>(null);

  const needsReview = items.filter((i) => i.type === "needs_review");
  const pendingApproval = items.filter((i) => i.type === "pending_approval");

  const handleRateProduct = (item: PendingReviewItem) => {
    setSelectedProduct({
      slug: item.productSlug,
      name: item.productName,
    });
    setSheetOpen(true);
  };

  const handleReviewSuccess = () => {
    if (selectedProduct) {
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.type === "needs_review" &&
              item.productSlug === selectedProduct.slug
            )
        )
      );
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Star}
        message="No pending reviews"
        buttonText="Continue Shopping"
        buttonHref="/shop"
      />
    );
  }

  return (
    <>
      <div className="space-y-8 sm:space-y-10">
        {/* Needs review */}
        {needsReview.length > 0 && (
          <section>
            <h2 className="mb-4 text-[1.1rem] font-medium sm:mb-5">
              Rate your products
              <span className="ml-2 text-sm font-normal text-black/40">
                ({needsReview.length})
              </span>
            </h2>

            <div className="space-y-4">
              {needsReview.map((item) => (
                <PendingReviewRow
                  key={`needs-${item.productId}`}
                  item={item}
                  onRate={() => handleRateProduct(item)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Pending approval */}
        {pendingApproval.length > 0 && (
          <section>
            <h2 className="mb-4 text-[1.1rem] font-medium sm:mb-5">
              Waiting for approval
              <span className="ml-2 text-sm font-normal text-black/40">
                ({pendingApproval.length})
              </span>
            </h2>

            <div className="space-y-4">
              {pendingApproval.map((item) => (
                <PendingReviewRow
                  key={`pending-${item.reviewId}`}
                  item={item}
                />
              ))}
            </div>
          </section>
        )}
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