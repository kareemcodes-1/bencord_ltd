
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Discount from "@/models/Discount";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getShippingFee } from "@/lib/shipping";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({
      userId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      { message: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      contact,
      delivery,
      shippingMethod,
      selectedAddressId,
      items,
      paymentMethod,
    } = body;

    // Validate contact details.
    if (
      typeof contact?.email !== "string" ||
      !contact.email.trim() ||
      typeof contact?.phone !== "string" ||
      !contact.phone.trim()
    ) {
      return NextResponse.json(
        { message: "Contact email and phone number are required." },
        { status: 400 }
      );
    }

    // Validate shipping method.
    if (!["pickup", "delivery"].includes(shippingMethod)) {
      return NextResponse.json(
        { message: "Invalid shipping method." },
        { status: 400 }
      );
    }

    // Bencord accepts bank transfers only.
    if (paymentMethod !== "bank_transfer") {
      return NextResponse.json(
        {
          message:
            "Bank transfer is the only available payment method.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        { message: "Your cart contains too many items." },
        { status: 400 }
      );
    }

    // Delivery orders require a complete delivery address.
    if (shippingMethod === "delivery") {
      if (
        !delivery?.firstName?.trim() ||
        !delivery?.lastName?.trim() ||
        !delivery?.address?.trim() ||
        !delivery?.city?.trim() ||
        !delivery?.state?.trim() ||
        !delivery?.postalCode?.trim() ||
        !delivery?.country?.trim()
      ) {
        return NextResponse.json(
          {
            message:
              "Complete delivery information is required for delivery orders.",
          },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // Validate and collect product IDs from the cart.
    const cartItems: {
      productId: string;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const productId = item?.productId || item?._id;
      const quantity = Number(item?.quantity);

      if (
        typeof productId !== "string" ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return NextResponse.json(
          { message: "A product in your cart has an invalid ID." },
          { status: 400 }
        );
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          { message: "A product in your cart has an invalid quantity." },
          { status: 400 }
        );
      }

      cartItems.push({
        productId,
        quantity,
      });
    }

    // Combine duplicate cart entries so each product is processed once.
    const quantityByProduct = new Map<string, number>();

    for (const item of cartItems) {
      const currentQuantity =
        quantityByProduct.get(item.productId) || 0;

      quantityByProduct.set(
        item.productId,
        currentQuantity + item.quantity
      );
    }

    const productIds = [...quantityByProduct.keys()];

    const products = await Product.find({
      _id: { $in: productIds },
    }).lean();

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          message:
            "One or more products in your cart are no longer available.",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Find active discounts that apply to the cart products.
    const activeDiscounts = await Discount.find({
      isActive: true,
      startsAt: { $lte: now },
      expiresAt: { $gte: now },
      productIds: { $in: productIds },
    }).lean();

    const orderItems = [];

    for (const [productId, quantity] of quantityByProduct.entries()) {
      const product = products.find(
        (item) => item._id.toString() === productId
      );

      if (!product) {
        return NextResponse.json(
          { message: "A product in your cart could not be found." },
          { status: 400 }
        );
      }

      if (!product.inStock) {
        return NextResponse.json(
          {
            message: `${product.name} is currently out of stock.`,
          },
          { status: 400 }
        );
      }

      const originalPrice = Number(product.price);

      if (!Number.isFinite(originalPrice) || originalPrice < 0) {
        return NextResponse.json(
          {
            message: `The price for ${product.name} is invalid.`,
          },
          { status: 400 }
        );
      }

      // Find discounts that apply to this product.
      const productDiscounts = activeDiscounts.filter((discount) =>
  (discount.productIds || []).some(
    (id) => String(id) === product._id.toString()
  )
);

      let finalPrice = originalPrice;

      let discountSnapshot: {
        title: string | null;
        discountType: "percentage" | "fixed";
        discountValue: number;
      } | null = null;

      // Apply the discount that gives the customer the lowest price.
      for (const discount of productDiscounts) {
        const discountValue = Number(discount.discountValue);

        if (
          !Number.isFinite(discountValue) ||
          discountValue < 0
        ) {
          continue;
        }

        let discountedPrice = originalPrice;

        if (discount.discountType === "percentage") {
          if (discountValue > 100) continue;

          discountedPrice =
            originalPrice - (originalPrice * discountValue) / 100;
        } else if (discount.discountType === "fixed") {
          discountedPrice = originalPrice - discountValue;
        } else {
          continue;
        }

        discountedPrice = Math.max(0, discountedPrice);

        if (discountedPrice < finalPrice) {
          finalPrice = discountedPrice;

          discountSnapshot = {
            title: discount.title ?? null,
            discountType: discount.discountType,
            discountValue,
          };
        }
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        media: product.media || [],
        price: finalPrice,
        originalPrice,
        discount: discountSnapshot,
        quantity,
      });
    }

    // Calculate totals on the server, not from client-submitted totals.
    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );


    const shippingFee =
  shippingMethod === "delivery"
    ? getShippingFee(shippingMethod)
    : 0;

    const tax = 0;
    const totalAmount = subtotal + shippingFee + tax;

    // Save the order with payment awaiting bank-transfer confirmation.
    const order = await Order.create({
      userId: session.user.id,

      items: orderItems,

      shippingAddress: {
        firstName: delivery?.firstName?.trim() || "",
        lastName: delivery?.lastName?.trim() || "",
        address: delivery?.address?.trim() || "",
        apartment: delivery?.apartment?.trim() || "",
        city: delivery?.city?.trim() || "",
        state: delivery?.state?.trim() || "",
        postalCode: delivery?.postalCode?.trim() || "",
        country: delivery?.country?.trim() || "",
        phone: contact.phone.trim(),
      },

      paymentInfo: {
        paymentMethod: "bank_transfer",
        paymentStatus: "pending",
        transactionReference: null,
        customerNotifiedAt: null,
        paidAt: null,
      },

      orderStatus: "pending",
      shippingMethod,
      trackingNumber: null,

      subtotal,
      shippingFee,
      tax,
      totalAmount,
    });

    // Reserved for future address-saving functionality.
    void selectedAddressId;

    return NextResponse.json(
      {
        message: "Order created successfully.",
        orderId: order._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      { message: "Failed to create order." },
      { status: 500 }
    );
  }
}
