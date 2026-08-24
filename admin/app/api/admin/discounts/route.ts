import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Discount from "@/models/Discount";
import "@/models/Product"; // needed for populate
import { SortOrder } from "mongoose";
import { priceFormatter } from "@/lib/priceFormatter";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const search = searchParams.get("search")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder: SortOrder =
      searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const allowedSortFields = [
      "title",
      "discountValue",
      "startsAt",
      "expiresAt",
      "createdAt",
      "isActive",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, SortOrder> = {
      [safeSortBy]: sortOrder,
    };

    const [discounts, total] = await Promise.all([
      Discount.find(filter)
        .populate("productIds", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Discount.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        discounts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/discounts error:", error);
    return NextResponse.json(
      { message: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const discount = await Discount.create(body);

    return NextResponse.json(discount, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/discounts error:", error);

    return NextResponse.json(
      { message: "Failed to create discount" },
      { status: 500 }
    );
  }
}