"use client";

export default function PaymentSection() {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <h2 className="mb-5 text-[1.1rem] font-medium sm:mb-6 sm:text-[1.2rem]">
        Payment
      </h2>

      <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-neutral-50 p-3.5 sm:p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f5a623]/10">
          {/* Flutterwave-style icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="#f5a623"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium">Flutterwave</p>
          <p className="text-xs text-black/50">
            You will be redirected to Flutterwave to complete payment securely.
          </p>
        </div>
      </div>
    </section>
  );
}