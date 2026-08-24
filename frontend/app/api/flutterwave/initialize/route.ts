import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      contact,
      delivery,
      shippingMethod,
      shippingFee,
      selectedAddressId,
      items,
      subtotal,
      totalAmount,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    if (!contact?.email || !delivery?.firstName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!shippingMethod || !["pickup", "delivery"].includes(shippingMethod)) {
      return NextResponse.json(
        { message: "Shipping method is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Create pending order
    const pendingOrder = await Order.create({
      userId: session.user.id,
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        media: item.media || [],
        price: item.price,
        quantity: item.quantity,
        size: item.size ?? null,
      })),
      shippingAddress: {
        firstName: delivery.firstName,
        lastName: delivery.lastName,
        address: delivery.address,
        apartment: delivery.apartment || "",
        city: delivery.city,
        state: delivery.state,
        postalCode: delivery.postalCode,
        country: delivery.country,
      },
      paymentInfo: {
        transactionId: "pending",
        gateway: "flutterwave",
        paymentStatus: "pending",
        channel: null,
        paidAt: null,
      },
      orderStatus: "processing",
      shippingMethod,
      subtotal,
      shippingFee: shippingMethod === "delivery" ? shippingFee || 0 : 0,
      tax: 0,
      totalAmount,
    });

    const tx_ref = `BC-${pendingOrder._id}-${Date.now()}`;

    // Initialize Flutterwave payment (GHS)
    const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  tx_ref,
  amount: totalAmount,
  currency: "NGN", // ← change this for testing
  redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/callback`,
  customer: {
    email: contact.email,
    phone_number: contact.phone,
    name: `${delivery.firstName} ${delivery.lastName}`,
  },
  customizations: {
    title: "Bencord",
    description: "Payment for order",
  },
  meta: {
    orderId: pendingOrder._id.toString(),
    userId: session.user.id,
    selectedAddressId,
  },
}),
    });

    const flwData = await flwRes.json();

    if (flwData.status !== "success") {
      await Order.findByIdAndDelete(pendingOrder._id);
      return NextResponse.json(
        { message: flwData.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    // Save tx_ref
    pendingOrder.paymentInfo.transactionId = tx_ref;
    await pendingOrder.save();

    return NextResponse.json({
      authorization_url: flwData.data.link,
      reference: tx_ref,
    });
  } catch (error) {
    console.error("Flutterwave initialize error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}