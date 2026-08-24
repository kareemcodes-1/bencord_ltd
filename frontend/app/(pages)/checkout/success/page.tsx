// app/checkout/success/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import ClearCart from "../clear-cart";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { orderId } = await searchParams;
  if (!orderId) redirect("/");

  await connectDB();
  const order = await Order.findById(orderId).lean();

  if (!order || order.userId.toString() !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen px-6 pb-24 pt-[9rem] lg:px-[3rem]">
      {/* This clears the cart as soon as the success page loads */}
      <ClearCart />

      <div className="mx-auto max-w-[32rem] text-center">
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ee0a0a]/10 sm:h-20 sm:w-20">
            <svg
              className="h-8 w-8 text-[#ee0a0a] sm:h-10 sm:w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
        </div>

        <span className="subtitle">Order confirmed</span>
        <h1 className="heading-2 mt-3">Thank you!</h1>

        <p className="mx-auto mt-4 max-w-[22rem] text-sm text-black/60 sm:max-w-[28rem]">
          Your payment was successful. We are processing your order and will
          confirm it within 24–48 hours.
        </p>

        <p className="mt-6 text-sm text-black/50">
          Order reference:{" "}
          <span className="break-all font-medium text-black">
            {order.paymentInfo.transactionId}
          </span>
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center">
          <Link href="/shop" className="btn-primary">
            Continue shopping
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-[0.75rem] border border-black/15 px-8 py-[0.95rem] text-[0.8rem] font-medium uppercase tracking-wide transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}