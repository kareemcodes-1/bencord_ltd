import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";
import { SortOrder } from "mongoose";
import { priceFormatter } from "@/lib/priceFormatter";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.max(
      1,
      Number(searchParams.get("limit")) || 10
    );

    const search = searchParams.get("search")?.trim() || "";

    const sortBy = searchParams.get("sortBy") || "createdAt";

    const sortOrder: SortOrder =
  searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const allowedSortFields = [
      "name",
      "price",
      "stock",
      "averageRating",
      "reviewCount",
      "createdAt",
      "order",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const sort: Record<string, SortOrder> = {
  [safeSortBy]: sortOrder,
};

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.max(
      1,
      Math.ceil(total / limit)
    );

    return NextResponse.json(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const product = await Product.create({
      ...body,
    });

    return NextResponse.json(product, {
      status: 201,
    });
  } catch (error: any) {
    console.error("POST /api/products error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "A product with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}