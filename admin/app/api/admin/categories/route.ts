import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Category from "@/models/Category"
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

    const allowedSortFields = ["name", "createdAt", "order"];

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

    const [categories, total] = await Promise.all([
      Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),

      Category.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json(
      {
        categories,
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
    console.error("GET /api/admin/categories error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch categories",
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

    const category = await Category.create({
      ...body,
      featured: body.featured ?? false,
    });

    return NextResponse.json(category, {
      status: 201,
    });
  } catch (error: any) {
    console.error("POST /api/admin/categories error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "A category with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}