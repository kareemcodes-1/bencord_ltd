import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const rate = await ShippingRate.findById(id).lean();

    if (!rate) {
      return NextResponse.json(
        { message: "Shipping rate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rate, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/shipping-rates/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to fetch shipping rate" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { location, fee, country, isActive } = body;

    if (location !== undefined && !location.trim()) {
      return NextResponse.json(
        { message: "Location cannot be empty" },
        { status: 400 }
      );
    }

    if (fee !== undefined && fee < 0) {
      return NextResponse.json(
        { message: "Fee cannot be negative" },
        { status: 400 }
      );
    }

    // Prevent duplicate location names
    if (location) {
      const exists = await ShippingRate.findOne({
        location: location.trim(),
        _id: { $ne: id },
      });

      if (exists) {
        return NextResponse.json(
          { message: "This location already exists" },
          { status: 400 }
        );
      }
    }

    const updatedRate = await ShippingRate.findByIdAndUpdate(
      id,
      {
        ...(location && { location: location.trim() }),
        ...(fee !== undefined && { fee }),
        ...(country && { country }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedRate) {
      return NextResponse.json(
        { message: "Shipping rate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRate, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/shipping-rates/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update shipping rate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const deletedRate = await ShippingRate.findByIdAndDelete(id);

    if (!deletedRate) {
      return NextResponse.json(
        { message: "Shipping rate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Shipping rate deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/shipping-rates/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete shipping rate" },
      { status: 500 }
    );
  }
}