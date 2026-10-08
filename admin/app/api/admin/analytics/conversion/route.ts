import { NextResponse } from "next/server";
import Order from "@/models/Order";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const deliveredOrders = await Order.countDocuments({
      orderStatus: "delivered",
    });

    return NextResponse.json({
      deliveredOrders,
    });
  } catch (error) {
    console.error("Conversion analytics error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch conversion data",
      },
      {
        status: 500,
      }
    );
  }
}