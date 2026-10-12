
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";

const GHANA_CODE = "GH";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid shipping rate ID" },
        { status: 400 }
      );
    }

    const rate = await ShippingRate.findOne({
      _id: id,
      country: GHANA_CODE,
    }).lean();

    if (!rate) {
      return NextResponse.json(
        { message: "Ghana shipping rate not found" },
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

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid shipping rate ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { location, fee, isActive } = body;

    const updates: {
      location?: string;
      fee?: number;
      country?: string;
      isActive?: boolean;
    } = {};

    if (location !== undefined) {
      if (
        typeof location !== "string" ||
        !location.trim()
      ) {
        return NextResponse.json(
          { message: "Please provide a valid delivery location" },
          { status: 400 }
        );
      }

      updates.location = location.trim();
    }

    if (fee !== undefined) {
      if (
        typeof fee !== "number" ||
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        return NextResponse.json(
          { message: "Please provide a valid non-negative delivery fee" },
          { status: 400 }
        );
      }

      updates.fee = fee;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          { message: "isActive must be a boolean" },
          { status: 400 }
        );
      }

      updates.isActive = isActive;
    }

    // Never allow this Ghana-only rate to be changed to another country.
    updates.country = GHANA_CODE;

    const currentRate = await ShippingRate.findOne({
      _id: id,
      country: GHANA_CODE,
    });

    if (!currentRate) {
      return NextResponse.json(
        { message: "Ghana shipping rate not found" },
        { status: 404 }
      );
    }

    // Prevent duplicate Ghana delivery locations.
    if (updates.location) {
      const existingRate = await ShippingRate.findOne({
        country: GHANA_CODE,
        location: {
          $regex: new RegExp(
            `^${updates.location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
        },
        _id: { $ne: id },
      });

      if (existingRate) {
        return NextResponse.json(
          { message: "This Ghana delivery location already exists" },
          { status: 409 }
        );
      }
    }

    Object.assign(currentRate, updates);

    await currentRate.save();

    return NextResponse.json(currentRate, { status: 200 });
  } catch (error) {
    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "This Ghana delivery location already exists" },
        { status: 409 }
      );
    }

    console.error("PUT /api/admin/shipping-rates/[id] error:", error);

    return NextResponse.json(
      { message: "Failed to update shipping rate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid shipping rate ID" },
        { status: 400 }
      );
    }

    const deletedRate = await ShippingRate.findOneAndDelete({
      _id: id,
      country: GHANA_CODE,
    });

    if (!deletedRate) {
      return NextResponse.json(
        { message: "Ghana shipping rate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Ghana shipping rate deleted successfully" },
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