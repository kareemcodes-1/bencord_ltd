import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.nextUrl.searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json(
        { error: "Unsubscribe token is required" },
        { status: 400 }
      );
    }

    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { message: "You are already unsubscribed" },
        { status: 200 }
      );
    }

    subscriber.isActive = false;
    await subscriber.save();

    return NextResponse.json(
      { message: "You have been unsubscribed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/unsubscribe error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Optional: also support POST (same logic)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const token =
      body.token?.trim() ||
      request.nextUrl.searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json(
        { error: "Unsubscribe token is required" },
        { status: 400 }
      );
    }

    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 404 }
      );
    }

    subscriber.isActive = false;
    await subscriber.save();

    return NextResponse.json(
      { message: "You have been unsubscribed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/unsubscribe error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}