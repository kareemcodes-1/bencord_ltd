import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ArrowLeft } from "lucide-react";

import { getProductBySlug } from "@/actions/product.actions";
import { getProductReviews } from "@/actions/review.actions";

interface ProductReviewsPageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function ProductReviewsPage({
  params,
}: ProductReviewsPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviewsData = await getProductReviews(product.slug);
  const { averageRating, reviewCount, breakdown, reviews } = reviewsData;
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <div className="min-h-screen px-6 pb-24 pt-[9rem] lg:px-[4rem]">
      {/* Back link */}
      {/* Back link */}
<div className="mx-auto mb-10 max-w-[60rem]">
  <Link
    href={`/shop/p/${product.slug}`}
    className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-black/60 shadow-xs transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
  >
    <ArrowLeft
      size={14}
      className="transition-transform duration-300 group-hover:-translate-x-0.5"
    />
    Back to product
  </Link>
</div>

      {/* Header */}
      <div className="mx-auto mb-12 flex max-w-[50rem] flex-col items-center gap-3 text-center">
        <span className="subtitle">Customer Reviews</span>
        <h1 className="heading-2">{product.name}</h1>
        <p className="text-sm text-black/50">
          All verified reviews for this product
        </p>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto grid max-w-[60rem] gap-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-14">
        {/* Left — summary + breakdown */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-[7rem] lg:self-start">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <p className="text-[2.5rem] leading-none">
              {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
              {reviewCount > 0 && (
                <span className="text-base text-black/40">/5</span>
              )}
            </p>
            <StarRow rating={averageRating} size={18} />
            <p className="text-[0.7rem] uppercase tracking-[0.15em] text-black/40">
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
        </div>

        {/* Right — all comments */}
        <div className="flex flex-col">
          <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-black/40">
            Comments from verified purchases ({reviewCount})
          </p>

          {reviews.length === 0 ? (
            <p className="py-8 text-sm text-black/40">
              No reviews yet for this product.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="flex flex-col gap-2 border-b border-dashed border-[#F5C518]/40 py-6 first:pt-0 last:border-none"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ee0a0a]/10 text-[0.75rem] font-medium text-[#ee0a0a]">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}