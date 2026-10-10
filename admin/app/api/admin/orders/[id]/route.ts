import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Order, { OrderStatus } from "@/models/Order";
import "@/models/User";
import "@/models/Product";

import {
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendOrderOutForDeliveryEmail,
  sendOrderReadyForPickupEmail,
  sendOrderDeliveredEmail,
} from "@/lib/email/send";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const validOrderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "ready_for_pickup",
  "delivered",
  "cancelled",
];

const validPaymentStatuses = ["pending", "paid"] as const;

function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 },
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const order = await Order.findById(id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug")
      .lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 },
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const {
      orderStatus,
      paymentStatus,
      trackingNumber,
      transactionReference,
      adminNote,
    } = body;

    const updateData: Record<string, unknown> = {};

    // Get the previous order status.
    const previousOrder = await Order.findById(id)
      .select("orderStatus")
      .lean();

    if (!previousOrder) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }

    // Order status.
    if (orderStatus !== undefined) {
      if (!validOrderStatuses.includes(orderStatus)) {
        return NextResponse.json(
          { message: "Invalid order status" },
          { status: 400 },
        );
      }

      updateData.orderStatus = orderStatus;

      // Confirming an order marks its payment as paid.
      if (orderStatus === "confirmed") {
        updateData["paymentInfo.paymentStatus"] = "paid";
        updateData["paymentInfo.paidAt"] = new Date();
      }
    }

    // Payment status.
    if (paymentStatus !== undefined) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { message: "Invalid payment status" },
          { status: 400 },
        );
      }

      updateData["paymentInfo.paymentStatus"] = paymentStatus;

      if (paymentStatus === "paid") {
        updateData["paymentInfo.paidAt"] = new Date();
      }

      if (paymentStatus === "pending") {
        updateData["paymentInfo.paidAt"] = null;
      }
    }

    // Admin note.
    if (adminNote !== undefined) {
      updateData.adminNote =
        adminNote === null || adminNote === ""
          ? null
          : String(adminNote).trim();
    }

    // Bank transfer reference.
    if (transactionReference !== undefined) {
      updateData["paymentInfo.transactionReference"] =
        transactionReference === null ||
        String(transactionReference).trim() === ""
          ? null
          : String(transactionReference).trim();
    }

    // Tracking number.
    if (trackingNumber !== undefined) {
      updateData.trackingNumber =
        trackingNumber === null || trackingNumber === ""
          ? null
          : String(trackingNumber).trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    // Update the order.
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug")
      .lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }

    // Send email only when the order status actually changes.
    const statusChanged =
      orderStatus !== undefined &&
      previousOrder.orderStatus !== orderStatus;

    if (statusChanged) {
      const user = order.userId as {
        name?: string;
        email?: string;
      } | null;

      const email = user?.email;
      const name = user?.name ?? "there";
      const orderReference = String(order._id)
        .slice(-8)
        .toUpperCase();

      if (email) {
        try {
          if (orderStatus === "confirmed") {
            await sendOrderConfirmedEmail(email, name, {
              orderReference,
              items: order.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.media?.[0]?.url,
              })),
              subtotal: order.subtotal,
              shippingFee: order.shippingFee,
              tax: order.tax,
              totalAmount: order.totalAmount,
              paymentMethod: "Bank transfer",
              shippingMethod: order.shippingMethod,
            });
          }

          if (orderStatus === "shipped") {
            await sendOrderShippedEmail(
              email,
              name,
              orderReference,
              order.trackingNumber ?? undefined,
            );
          }

          if (orderStatus === "out_for_delivery") {
            await sendOrderOutForDeliveryEmail(
              email,
              name,
              orderReference,
            );
          }

          if (orderStatus === "ready_for_pickup") {
            await sendOrderReadyForPickupEmail(
              email,
              name,
              orderReference,
            );
          }

          if (orderStatus === "delivered") {
            await sendOrderDeliveredEmail(
              email,
              name,
              orderReference,
              order.shippingMethod,
            );
          }
        } catch (emailError) {
          // Email failure must not prevent the order update.
          console.error(
            "Order status email failed:",
            emailError,
          );
        }
      }
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 },
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 },
    );
  }
}
