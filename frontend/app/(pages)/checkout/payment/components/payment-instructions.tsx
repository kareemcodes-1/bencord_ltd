"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, Clock3, Copy, Loader2, ShieldCheck } from "lucide-react";

import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { priceFormatter } from "@/lib/priceFormatter";

type Props = {
  orderId: string;
  totalAmount: number;
  customerNotifiedAt: string | null;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
};

export default function PaymentInstructions({
  orderId,
  totalAmount,
  customerNotifiedAt,
  bankDetails,
}: Props) {
  const currency = useCurrencyStore((state) => state.currency);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasNotified, setHasNotified] = useState(
    Boolean(customerNotifiedAt)
  );

  const formattedAmount = priceFormatter(totalAmount);

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Unable to copy. Please copy it manually.");
    }
  };

  const handlePaymentNotification = async () => {
    if (isSubmitting || hasNotified) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/orders/${orderId}/payment-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message || "Failed to notify us about your payment."
        );
        return;
      }

      setHasNotified(true);
      clearCart();
      toast.success("Payment notification sent successfully.");
    } catch (error) {
      console.error("Payment notification error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bankDetailsConfigured = Boolean(
    bankDetails.bankName?.trim() &&
      bankDetails.accountName?.trim() &&
      bankDetails.accountNumber?.trim()
  );

  const CopyButton = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => handleCopy(value, label)}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-black/10 transition hover:border-[#ee0a0a]/40 hover:bg-[#ee0a0a]/5"
      aria-label={`Copy ${label.toLowerCase()}`}
    >
      <Copy className="size-4 text-black/60" />
    </button>
  );

  if (hasNotified) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-[#ee0a0a]/10">
            <Clock3 className="size-7 text-[#ee0a0a]" />
          </div>

          <h1 className=" text-2xl font-semibold sm:text-3xl">
            Payment pending
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-black/60">
            Thank you for your order. We have received your payment
            notification. Your order will remain pending until our team
            verifies the transfer.
          </p>

          <div className="mt-7 w-full rounded-xl bg-neutral-50 p-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-black/50">
                Order reference
              </span>

              <span className="max-w-[60%] break-all text-right text-sm font-medium">
                {orderId}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-black/50">
                Amount
              </span>

              <span className="text-sm font-semibold">
                {formattedAmount}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-black/50">
                Payment status
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-500">
                <Clock3 className="size-3.5" />
                Pending
              </span>
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="btn-primary w-full"
            >
              View my orders
            </Link>

            <Link
              href="/shop"
              className="flex w-full items-center justify-center rounded-xl border border-black/10 px-5 py-3 text-xs font-medium uppercase transition hover:border-black/30 hover:bg-black/[0.03]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-8">
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-[#ee0a0a]/10">
          <div className="flex items-center gap-1">
            <span className="size-2 animate-bounce rounded-full bg-[#ee0a0a] [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-[#ee0a0a] [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-[#ee0a0a]" />
          </div>
        </div>

        <p className="subtitle">Secure bank transfer</p>

        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Complete your payment
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/60">
          Please do not refresh or leave this page. Transfer the exact amount
      below. Payment confirmation takes up to 24 hours.
        </p>
      </div>

      <div className="mt-8 rounded-2xl bg-neutral-50 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-black/45">
              Amount to transfer
            </p>

            <p className="mt-2 text-2xl font-semibold sm:text-3xl">
              {formattedAmount}
            </p>
          </div>

          <CopyButton
            value={String(totalAmount)}
            label="Amount"
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-black/10 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#ee0a0a]/10">
            <ShieldCheck className="size-5 text-[#ee0a0a]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Bank transfer details
            </h2>

            <p className="mt-1 text-xs text-black/50">
              Use these details to complete your transfer.
            </p>
          </div>
        </div>

        {!bankDetailsConfigured ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Bank details are not configured yet.
            </p>

            <p className="mt-1 text-sm text-red-600">
              Please contact us for payment instructions before
              making a transfer.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-black/45">Bank name</p>
                <p className="mt-1 break-words text-sm font-medium">
                  {bankDetails.bankName}
                </p>
              </div>

              <CopyButton
                value={bankDetails.bankName}
                label="Bank name"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-black/45">
                  Account name
                </p>
                <p className="mt-1 break-words text-sm font-medium">
                  {bankDetails.accountName}
                </p>
              </div>

              <CopyButton
                value={bankDetails.accountName}
                label="Account name"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-black/45">
                  Account number
                </p>
                <p className="mt-1 break-all text-lg font-semibold tracking-wide">
                  {bankDetails.accountNumber}
                </p>
              </div>

              <CopyButton
                value={bankDetails.accountNumber}
                label="Account number"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-[#ee0a0a]/15 bg-[#ee0a0a]/5 p-4">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 size-4 shrink-0 text-[#ee0a0a]" />

          <p className="text-sm leading-relaxed text-black/70">
            Please transfer exactly{" "}
            <span className="font-semibold">{formattedAmount}</span>.
            Your order will remain pending until the payment is
            verified by our team.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePaymentNotification}
        disabled={isSubmitting || !bankDetailsConfigured}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending notification...
          </>
        ) : (
          "I've sent the money"
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-black/45">
        Only submit this notification after making the transfer.
        Notifying us does not automatically confirm your payment.
      </p>
    </div>
  );
}

