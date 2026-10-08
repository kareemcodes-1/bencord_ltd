import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { message: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const subscriber = await Subscriber.findByIdAndUpdate(
      id,
      { isActive: body.isActive },
      { new: true }
    );

    if (!subscriber) {
      return NextResponse.json(
        { message: "Subscriber not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscriber, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/subscribers/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update subscriber" },
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

    const subscriber = await Subscriber.findByIdAndDelete(id);

    if (!subscriber) {
      return NextResponse.json(
        { message: "Subscriber not found" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/admin/subscribers/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete subscriber" },
      { status: 500 }
    );
  }
}