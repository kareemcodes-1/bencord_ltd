"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import type { Order as OrderType } from "@/types";

const ORDERS_PER_PAGE = 10;

function formatOrder(order: any): OrderType {
  return {
    _id: order._id.toString(),
    userId: order.userId.toString(),

    items: order.items.map((item: any) => ({
      _id: item._id ? item._id.toString() : "",
      productId: item.productId.toString(),
      name: item.name,

      media: (item.media || []).map((media: any) => ({
        _id: media._id ? media._id.toString() : "",
        url: media.url,
        type: media.type,
      })),

      price: item.price,
      originalPrice: item.originalPrice ?? item.price,
      discount: item.discount
        ? {
            title: item.discount.title ?? null,
            discountType: item.discount.discountType,
            discountValue: item.discount.discountValue,
          }
        : null,

      quantity: item.quantity,
    })),

    shippingAddress: {
      firstName: order.shippingAddress.firstName,
      lastName: order.shippingAddress.lastName,
      address: order.shippingAddress.address,
      apartment: order.shippingAddress.apartment || "",
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone || "",
    },

    paymentInfo: {
      paymentMethod: order.paymentInfo?.paymentMethod ?? "bank_transfer",
      paymentStatus: order.paymentInfo?.paymentStatus ?? "pending",
      transactionReference:
        order.paymentInfo?.transactionReference ?? null,
      customerNotifiedAt: order.paymentInfo?.customerNotifiedAt
        ? new Date(order.paymentInfo.customerNotifiedAt).toISOString()
        : null,
      paidAt: order.paymentInfo?.paidAt
        ? new Date(order.paymentInfo.paidAt).toISOString()
        : null,
    },

    orderStatus: order.orderStatus,
    shippingMethod: order.shippingMethod ?? "delivery",
    trackingNumber: order.trackingNumber ?? null,
    adminNote: order.adminNote ?? null,

    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    tax: order.tax,
    totalAmount: order.totalAmount,

    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: new Date(order.updatedAt).toISOString(),
  };
}

export async function getUserOrders(page: number = 1) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      orders: [] as OrderType[],
      totalOrders: 0,
      totalPages: 0,
      currentPage: 1,
      error: "Unauthorized" as const,
    };
  }

  try {
    await connectDB();

    const currentPage = Math.max(1, Math.floor(page) || 1);

    const totalOrders = await Order.countDocuments({
      userId: session.user.id,
    });

    const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE) || 1;
    const safePage = Math.min(currentPage, totalPages);

    const orders = await Order.find({
      userId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * ORDERS_PER_PAGE)
      .limit(ORDERS_PER_PAGE)
      .lean();

    return {
      orders: orders.map(formatOrder),
      totalOrders,
      totalPages,
      currentPage: safePage,
      error: null,
    };
  } catch (error) {
    console.error("getUserOrders error:", error);

    return {
      orders: [] as OrderType[],
      totalOrders: 0,
      totalPages: 0,
      currentPage: 1,
      error: "Failed to fetch orders" as const,
    };
  }
}

export async function getOrderById(orderId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      order: null,
      error: "Unauthorized" as const,
    };
  }

  try {
    await connectDB();

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return {
        order: null,
        error: "Order not found" as const,
      };
    }

    if (order.userId.toString() !== session.user.id) {
      return {
        order: null,
        error: "Unauthorized" as const,
      };
    }

    return {
      order: formatOrder(order),
      error: null,
    };
  } catch (error) {
    console.error("getOrderById error:", error);

    return {
      order: null,
      error: "Failed to fetch order" as const,
    };
  }
}

