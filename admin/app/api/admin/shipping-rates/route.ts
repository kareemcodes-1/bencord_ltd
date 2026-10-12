import { NextRequest, NextResponse } from "next/server";
import { SortOrder } from "mongoose";

import connectDB from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const search = searchParams.get("search")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "location";
    const sortOrder: SortOrder =
      searchParams.get("sortOrder") === "desc" ? -1 : 1;

    const allowedSortFields = ["location", "fee", "createdAt", "updatedAt"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "location";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Search by location name
    if (search) {
      filter.location = { $regex: search, $options: "i" };
    }

    const sort: Record<string, SortOrder> = {
      [safeSortBy]: sortOrder,
    };

    const [rates, total] = await Promise.all([
      ShippingRate.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      ShippingRate.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        rates,
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
    console.error("GET /api/admin/shipping-rates error:", error);

    return NextResponse.json(
      { message: "Failed to fetch shipping rates" },
      { status: 500 }
    );
  }
}

// CREATE new shipping rate
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { location, fee, country = "GH", isActive = true } = body;

    if (!location?.trim()) {
      return NextResponse.json(
        { message: "Location is required" },
        { status: 400 }
      );
    }

    if (fee === undefined || fee < 0) {
      return NextResponse.json(
        { message: "A valid fee is required" },
        { status: 400 }
      );
    }

    // Check if location already exists
    const exists = await ShippingRate.findOne({
      location: location.trim(),
    });

    if (exists) {
      return NextResponse.json(
        { message: "This location already exists" },
        { status: 400 }
      );
    }

    const newRate = await ShippingRate.create({
      location: location.trim(),
      fee,
      country,
      isActive,
    });

    return NextResponse.json(newRate, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/shipping-rates error:", error);

    return NextResponse.json(
      { message: "Failed to create shipping rate" },
      { status: 500 }
    );
  }
}