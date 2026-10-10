"use client";

export default function PaymentSection() {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <h2 className="mb-5 text-[1.1rem] font-medium sm:mb-6 sm:text-[1.2rem]">
        Payment
      </h2>

      <div className="rounded-xl border border-black/10 bg-neutral-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FD3F92]/10">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="text-[#ee0a0a]"
              aria-hidden
            >
              <path d="M3 10h18M5 10V19h14V10M12 3l9 7H3l9-7z" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium">
              Bank transfer
            </p>

            <p className="mt-1 text-xs leading-relaxed text-black/50">
              After placing your order, you&apos;ll receive the bank transfer details. Your order stays pending until payment is confirmed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}