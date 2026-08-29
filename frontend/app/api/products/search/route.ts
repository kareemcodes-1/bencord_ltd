import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Discount from "@/models/Discount";
import "@/models/Collection";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 12));

    const now = new Date();

    // Empty query → suggested products
    const filter: Record<string, unknown> = { isActive: true };

    if (q) {
      const words = q
        .toLowerCase()
        .replace(/[-_/]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

      if (words.length > 0) {
        filter.$and = words.map((word) => ({
          $or: [
            { name: { $regex: word, $options: "i" } },
            { slug: { $regex: word, $options: "i" } },
            { description: { $regex: word, $options: "i" } },
          ],
        }));
      }
    }

    const [products, activeDiscounts] = await Promise.all([
      Product.find(filter)
        .populate("collectionId")
        .sort({ createdAt: -1 })
        .limit(limit)
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
      { products: productsWithDiscount },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products/search error:", error);
    return NextResponse.json(
      { message: "Failed to search products" },
      { status: 500 }
    );
  }
}