import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({
      featured: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(categories, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);

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