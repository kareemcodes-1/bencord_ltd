import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          message: "Order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      userId: session.user.id,
    });

    if (!order) {
      return NextResponse.json(
        {
          message: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (order.paymentInfo.paymentStatus === "paid") {
      return NextResponse.json(
        {
          message: "This order has already been confirmed as paid.",
          paymentStatus: "paid",
          orderStatus: order.orderStatus,
        },
        {
          status: 200,
        }
      );
    }

    if (order.orderStatus === "cancelled") {
      return NextResponse.json(
        {
          message: "This order has been cancelled.",
        },
        {
          status: 400,
        }
      );
    }

    order.paymentInfo.customerNotifiedAt = new Date();

    await order.save();

    const user = await User.findById(session.user.id);

if (user && user.addresses.length === 0) {
  // This is their first address → make it default
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

    /*
     * Important:
     *
     * We DO NOT change:
     *
     * paymentStatus -> paid
     * orderStatus -> confirmed
     *
     * The admin still has to verify the actual bank transfer.
     */

    return NextResponse.json(
      {
        message:
          "Payment notification received. Your order will remain pending until the payment is confirmed.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/orders/[orderId]/payment-notification error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to send payment notification.",
      },
      {
        status: 500,
      }
    );
  }
}