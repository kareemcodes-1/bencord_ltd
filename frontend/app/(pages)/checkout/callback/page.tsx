import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

type Props = {
  searchParams: Promise<{
    status?: string;
    tx_ref?: string;
    transaction_id?: string;
  }>;
};

export default async function CheckoutCallbackPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { status, tx_ref, transaction_id } = await searchParams;

  if (!tx_ref || !transaction_id) {
    redirect("/checkout?error=missing_reference");
  }

  // If user cancelled
  if (status === "cancelled") {
    redirect("/checkout?error=payment_cancelled");
  }

  await connectDB();

  // 1. Verify with Flutterwave
  const verifyRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    },
  );

  const verifyData = await verifyRes.json();

  if (
    verifyData.status !== "success" ||
    verifyData.data.status !== "successful"
  ) {
    redirect("/checkout?error=payment_failed");
  }

  const { meta, amount, payment_type, created_at } = verifyData.data;
  const orderId = meta?.orderId;

  if (!orderId) {
    redirect("/checkout?error=invalid_order");
  }

  // 2. Find the pending order
  const order = await Order.findById(orderId);
  if (!order || order.userId.toString() !== session.user.id) {
    redirect("/checkout?error=order_not_found");
  }

  // Already processed?
  if (order.paymentInfo.paymentStatus === "paid") {
    redirect(`/checkout/success?orderId=${order._id}`);
  }

  // 3. Update order to paid
  order.paymentInfo = {
    transactionId: tx_ref,
    gateway: "flutterwave",
    paymentStatus: "paid",
    channel: payment_type || null,
    paidAt: created_at ? new Date(created_at) : new Date(),
  };
  order.orderStatus = "processing";
  await order.save();

  // 4. Save address to user if it was a new address
  const selectedAddressId = meta?.selectedAddressId;

  if (selectedAddressId === "new") {
    const user = await User.findById(session.user.id);
    if (user) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });

      user.addresses.push({
        firstName: order.shippingAddress.firstName,
        lastName: order.shippingAddress.lastName,
        address: order.shippingAddress.address,
        apartment: order.shippingAddress.apartment || "",
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        isDefault: true,
      });

      await user.save();
    }
  }

  // 5. Redirect to success page
  redirect(`/checkout/success?orderId=${order._id}`);
}