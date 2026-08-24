import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

// GET — Get one category
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(category, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/admin/categories/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch category",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT — Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const { name, slug, image, featured } = body;

    if (!name || !slug || !image) {
      return NextResponse.json(
        {
          message: "Name, slug, and image are required",
        },
        {
          status: 400,
        }
      );
    }

    const existingCategory = await Category.findOne({
      slug,
      _id: { $ne: id },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          message: "A category with this slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    category.name = name;
    category.slug = slug;
    category.image = image;
    category.featured = featured ?? false;

    await category.save();

    return NextResponse.json(
      {
        message: "Category updated successfully",
        category,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("PUT /api/admin/categories/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to update category",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE — Delete category
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Category deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete category",
      },
      {
        status: 500,
      }
    );
  }
}