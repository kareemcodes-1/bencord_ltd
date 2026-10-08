import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Discount from "@/models/Discount";
import "@/models/Category";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const product = await Product.findOne({ slug })
      .populate("categoryId")
      .lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Find active discount that includes this product
    const discount = await Discount.findOne({
      isActive: true,
      startsAt: { $lte: now },
      expiresAt: { $gte: now },
      productIds: product._id,
    }).lean();

    const productWithDiscount = {
      ...product,
      discount: discount
        ? {
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            title: discount.title,
          }
        : null,
    };

    return NextResponse.json(productWithDiscount, { status: 200 });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);

    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}