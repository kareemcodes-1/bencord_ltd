import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Discount from "@/models/Discount";
import "@/models/Collection";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    const [products, activeDiscounts] = await Promise.all([
      Product.find({ isActive: true, featured: true })
        .populate("collectionId")
        .sort({ createdAt: -1 })
        .lean(),
      Discount.find({
        isActive: true,
        startsAt: { $lte: now },
        expiresAt: { $gte: now },
      }).lean(),
    ]);

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
        if (!discountMap.has(id)) {
          discountMap.set(id, {
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            title: discount.title,
          });
        }
      }
    }

    const productsWithDiscount = products.map((product) => ({
      ...product,
      discount: discountMap.get(product._id.toString()) || null,
    }));

    return NextResponse.json(
      {
        products: productsWithDiscount,
        pagination: {
          page: 1,
          limit: productsWithDiscount.length,
          total: productsWithDiscount.length,
          totalPages: 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products/featured error:", error);
    return NextResponse.json(
      { message: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}