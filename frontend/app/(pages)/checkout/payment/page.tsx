import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import PaymentInstructions from "./components/payment-instructions";

type Props = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function PaymentPage({
  searchParams,
}: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/shop");
  }

  await connectDB();

  const order = await Order.findOne({
    _id: orderId,
    userId: session.user.id,
  }).lean();

  if (!order) {
    redirect("/orders");
  }

  const bankDetails = {
    bankName: process.env.BANK_NAME || "",
    accountName: process.env.BANK_ACCOUNT_NAME || "",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
  <div className="mx-auto max-w-2xl">
    <PaymentInstructions
      orderId={order._id.toString()}
      totalAmount={order.totalAmount}
      customerNotifiedAt={
        order.paymentInfo.customerNotifiedAt
          ? order.paymentInfo.customerNotifiedAt.toISOString()
          : null
      }
      bankDetails={bankDetails}
    />
  </div>
</main>
  );
}