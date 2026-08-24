import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Discount from "@/models/Discount";
import "@/models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    const now = new Date();

    const [products, total, activeDiscounts] = await Promise.all([
      Product.find(filter)
        .populate("categoryId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      Discount.find({
        isActive: true,
        startsAt: { $lte: now },
        expiresAt: { $gte: now },
      }).lean(),
    ]);

    // Build map: productId → discount
    const discountMap = new Map<
      string,
      {
        discountType: "percentage" | "fixed";
        discountValue: number;
        title: string;
      }
    >();

    for (const discount of activeDiscounts) {
      for (const productId of discount.productIds) {
        const id = productId.toString();

        // If multiple discounts exist, keep the first one
        // (you can later improve this to pick the best discount)
        if (!discountMap.has(id)) {
          discountMap.set(id, {
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            title: discount.title,
          });
        }
      }
    }

    // Attach discount to each product
    const productsWithDiscount = products.map((product) => ({
      ...product,
      discount: discountMap.get(product._id.toString()) || null,
    }));

    return NextResponse.json(
      {
        products: productsWithDiscount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}