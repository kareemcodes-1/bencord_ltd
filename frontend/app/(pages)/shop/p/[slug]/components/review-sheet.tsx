"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSlug: string;
  productName: string;
  onSuccess?: () => void;
};

const ReviewSheet = ({
  open,
  onOpenChange,
  productSlug,
  productName,
  onSuccess,
}: ReviewSheetProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setComment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to submit review.");
        return;
      }

      toast.success(
        data.message || "Review submitted and pending approval.",
      );
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        className="z-[350] flex h-full w-full max-w-full flex-col gap-0 border-none bg-white p-0 sm:max-w-[28rem] lg:max-w-[32rem] [&>button]:hidden"
      >
        <SheetHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b px-5 py-4 sm:px-6 sm:py-5 lg:px-8">
          <SheetTitle className="heading-3 text-left">Write a review</SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[#ee0a0a] hover:text-white sm:h-10 sm:w-10"
          >
            <X size={18} strokeWidth={1.5} className="sm:size-5" />
          </button>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/50">
              Reviewing:{" "}
              <span className="break-words font-medium normal-case tracking-normal text-black">
                {productName}
              </span>
            </p>

            <div>
              <Label className="mb-3 block text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80">
                Your rating
              </Label>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  const active = value <= (hoverRating || rating);

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={26}
                        className={
                          active
                            ? "fill-[#F5C518] text-[#F5C518] sm:size-7"
                            : "fill-transparent text-black/20 sm:size-7"
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="review-title"
                className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80"
              >
                Title <span className="text-black/40">(optional)</span>
              </Label>
              <Input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                placeholder="Sum up your experience"
                className="h-11 rounded-xl border-black/10 focus-visible:ring-[#ee0a0a]/30"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="review-comment"
                className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black/80"
              >
                Review
              </Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="What did you like or dislike? How was the quality?"
                className="min-h-[8rem] resize-none rounded-xl border-black/10 focus-visible:ring-[##ee0a0a]/30 sm:min-h-[9rem]"
              />
              <p className="text-right text-[0.7rem] text-black/30">
                {comment.length}/2000
              </p>
            </div>
          </div>

          <div className="shrink-0 border-t border-black/10 px-5 py-4 sm:px-6 sm:py-5 lg:px-8">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>
            <p className="mt-3 text-center text-[0.7rem] text-black/40">
              Reviews are checked before they appear publicly.
            </p>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ReviewSheet;