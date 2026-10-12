import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";

export async function GET() {
  try {
    await connectDB();

    const rates = await ShippingRate.find({ isActive: true })
      .select("location fee")
      .sort({ location: 1 })
      .lean();

    return NextResponse.json(rates, { status: 200 });
  } catch (error) {
    console.error("GET /api/shipping-rates error:", error);
    return NextResponse.json(
      { message: "Failed to fetch shipping rates" },
      { status: 500 }
    );
  }
}