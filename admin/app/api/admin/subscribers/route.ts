import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { SortOrder } from "mongoose";

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
    const status = searchParams.get("status") || "all";

    const allowedSortFields = ["email", "source", "createdAt", "isActive"];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    const sort: Record<string, SortOrder> = {
      [safeSortBy]: sortOrder,
    };

    const [subscribers, total] = await Promise.all([
      Subscriber.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Subscriber.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        subscribers,
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
    console.error("GET /api/admin/subscribers error:", error);
    return NextResponse.json(
      { message: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}