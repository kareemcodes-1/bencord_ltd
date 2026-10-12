"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  MessageSquare,
  PenLine,
  Star,
} from "lucide-react";

import type { Product } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmptyState from "@/app/components/empty-state";
import ReviewSheet from "./review-sheet";
import { useRouter } from "next/navigation";

export type ReviewItem = {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  name: string;
};

export type ReviewsResponse = {
  averageRating: number;
  reviewCount: number;
  breakdown: { stars: number; count: number }[];
  reviews: ReviewItem[];
};

type ProductReviewsProps = {
  product: Product;
  reviewsData: ReviewsResponse;
  canReview?: boolean;
};

const PREVIEW_LIMIT = 3;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={size}
        className={
          index < Math.round(rating)
            ? "fill-[#F5C518] text-[#F5C518]"
            : "fill-transparent text-black/15"
        }
      />
    ))}
  </div>
);

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

const ProductReviews = ({
  product,
  reviewsData,
  canReview = false,
}: ProductReviewsProps) => {
  const { averageRating, reviewCount, breakdown, reviews } = reviewsData;
  const [sort, setSort] = useState<SortValue>("newest");
  const [writeOpen, setWriteOpen] = useState(false);
  const router = useRouter();

  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  const sortedReviews = useMemo(() => {
    const list = [...reviews];

    if (sort === "highest") {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sort === "lowest") {
      return list.sort((a, b) => a.rating - b.rating);
    }

    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reviews, sort]);

  const previewReviews = sortedReviews.slice(0, PREVIEW_LIMIT);
  const hasMore = reviews.length > PREVIEW_LIMIT || reviewCount > PREVIEW_LIMIT;
  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Newest";

    const handleReviewSuccess = () => {
  router.refresh(); // This re-fetches canReview from the server
};

   return (
    <div className="border-t border-black/10 px-5 py-12 section-spacing">
      {/* Header */}
      <div className="mx-auto flex max-w-[min(50rem,100%)] flex-col items-center gap-2.5 text-center sm:gap-3">
        <span className="subtitle">Customer Reviews</span>
        <h2 className="heading-1 max-w-[min(36rem,100%)]">
          What They&apos;re Saying
        </h2>
      </div>

      <div className="mx-auto mt-8 grid max-w-[60rem] gap-8 sm:mt-10 lg:mt-12 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-14">
        {/* Left — summary */}
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-white p-5 text-center shadow-sm sm:p-6">
            <p className="text-[2rem] leading-none sm:text-[2.5rem]">
              {averageRating.toFixed(1)}
              <span className="text-sm text-black/40 sm:text-base">/5</span>
            </p>
            <StarRow rating={averageRating} size={18} />
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-black/40 sm:text-[0.7rem]">
              {reviewCount}{" "}
              {reviewCount === 1 ? "Verified Rating" : "Verified Ratings"}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {breakdown.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-2.5">
                <span className="flex w-8 items-center gap-0.5 text-xs text-black/50">
                  {stars}
                  <Star size={10} className="fill-[#F5C518] text-[#F5C518]" />
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-[#F5C518]/70"
                    style={{
                      width: `${Math.max(
                        (count / maxCount) * 100,
                        count > 0 ? 4 : 0,
                      )}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-black/40">
                  {count}
                </span>
              </div>
            ))}
          </div>

          {canReview && (
            <button
              type="button"
              onClick={() => setWriteOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-black/15 px-5 py-3 text-[0.7rem] font-medium uppercase tracking-[0.1em] transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <PenLine size={14} />
              Write a review
            </button>
          )}
        </div>

        {/* Right — comments */}
        <div className="flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-black/40">
              Comments ({reviewCount})
            </p>

            {reviews.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-black/50 transition-colors hover:text-black"
                  >
                    {activeSortLabel}
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[350] w-44 rounded-xl border border-black/10 p-1.5"
                >
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSort(option.value)}
                      className={`cursor-pointer gap-2 rounded-lg px-3 py-2 text-[0.8rem] font-medium ${
                        sort === option.value
                          ? "bg-[#ee0a0a]/10 text-[#ee0a0a]"
                          : ""
                      }`}
                    >
                      <span className="flex-1">{option.label}</span>
                      {sort === option.value && <Check size={14} />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {previewReviews.length === 0 ? (
            <div className="flex min-h-[14rem] items-center justify-center sm:min-h-[16rem]">
              <EmptyState
                icon={MessageSquare}
                message="No reviews yet"
                buttonText={canReview ? "Write a review" : undefined}
                onButtonClick={
                  canReview ? () => setWriteOpen(true) : undefined
                }
              />
            </div>
          ) : (
            <>
              {previewReviews.map((review) => (
                <div
                  key={review._id}
                  className="flex flex-col gap-2 border-b border-dashed border-[#ee0a0a]/40 py-5 first:pt-0 last:border-none sm:py-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ee0a0a]/10 text-[0.75rem] font-medium text-[#ee0a0a]">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">
                          {review.name}
                        </p>
                        <p className="text-xs text-black/40">
                          {formatRelativeDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>

                  {review.title ? (
                    <p className="text-sm font-medium text-black">
                      {review.title}
                    </p>
                  ) : null}

                  <p className="text-sm leading-relaxed text-black/60">
                    {review.comment}
                  </p>

                  {review.isVerifiedPurchase && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Verified Purchase
                    </p>
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="mt-6 flex justify-center sm:mt-8">
                  <Link
                    href={`/shop/p/${product.slug}/reviews`}
                    className="btn-primary"
                  >
                    View more reviews
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ReviewSheet
        open={writeOpen}
        onOpenChange={setWriteOpen}
        productSlug={product.slug}
        productName={product.name}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default ProductReviews;