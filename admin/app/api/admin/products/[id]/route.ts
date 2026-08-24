import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET — Get one product
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const product = await Product.findById(id)
      .populate("categoryId")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(product, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch product",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT — Update product
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("categoryId")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(product, {
      status: 200,
    });
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);

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
        message: "Failed to update product",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE — Delete product
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete product",
      },
      {
        status: 500,
      }
    );
  }
}