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

    const categoriesParam = searchParams.get("categories");
    const availabilityParam = searchParams.get("availability");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sortParam = searchParams.get("sort") || "default";

    const categories = categoriesParam
      ? categoriesParam.split(",").filter(Boolean)
      : [];

    const availability = availabilityParam
      ? availabilityParam.split(",").filter(Boolean)
      : [];

    const minPrice =
      minPriceParam !== null && Number.isFinite(Number(minPriceParam))
        ? Number(minPriceParam)
        : undefined;

    const maxPrice =
      maxPriceParam !== null && Number.isFinite(Number(maxPriceParam))
        ? Number(maxPriceParam)
        : undefined;

    const filter: Record<string, unknown> = {};

    // Category filter
    if (categories.length > 0) {
      filter.categoryId = { $in: categories };
    }

    // Availability filter
    if (
      availability.includes("in-stock") &&
      !availability.includes("out-of-stock")
    ) {
      filter.inStock = true;
    } else if (
      availability.includes("out-of-stock") &&
      !availability.includes("in-stock")
    ) {
      filter.inStock = false;
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};

      if (minPrice !== undefined) {
        priceFilter.$gte = minPrice;
      }

      if (maxPrice !== undefined) {
        priceFilter.$lte = maxPrice;
      }

      filter.price = priceFilter;
    }

    // Sorting
    let sort: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (sortParam === "price-asc") {
      sort = { price: 1 };
    } else if (sortParam === "price-desc") {
      sort = { price: -1 };
    }

    const skip = (page - 1) * limit;

    const now = new Date();

    const [
      products,
      total,
      activeDiscounts,
      priceRangeResult,
    ] = await Promise.all([
      Product.find(filter)
        .populate("categoryId")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),

      Discount.find({
        isActive: true,
        startsAt: { $lte: now },
        expiresAt: { $gte: now },
      }).lean(),

      Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
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

    const priceRange = priceRangeResult[0] ?? {
      minPrice: 0,
      maxPrice: 0,
    };

    return NextResponse.json(
      {
        products: productsWithDiscount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
        priceRange: {
          minPrice: priceRange.minPrice ?? 0,
          maxPrice: priceRange.maxPrice ?? 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}