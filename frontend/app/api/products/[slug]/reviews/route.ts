import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";
import "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Order from "@/models/Order";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be signed in to leave a review." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "Product slug is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const rating = Number(body.rating);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be a whole number between 1 and 5." },
        { status: 400 }
      );
    }

    if (!comment || comment.length < 10) {
      return NextResponse.json(
        { message: "Please write at least 10 characters in your review." },
        { status: 400 }
      );
    }

    if (comment.length > 2000) {
      return NextResponse.json(
        { message: "Review is too long (max 2000 characters)." },
        { status: 400 }
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        { message: "Title is too long (max 150 characters)." },
        { status: 400 }
      );
    }

    await connectDB();

    const productQuery = Types.ObjectId.isValid(slug)
      ? { _id: slug }
      : { slug };

    const product = await Product.findOne(productQuery)
      .select("_id")
      .lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    // Must have purchased this product
    const hasPurchased = await Order.exists({
      userId: new Types.ObjectId(userId),
      orderStatus: "delivered",
      "items.productId": product._id,
    });

    if (!hasPurchased) {
      return NextResponse.json(
        {
          message:
            "Only customers who purchased this product can leave a review.",
        },
        { status: 403 }
      );
    }

    // One review per user per product
    const existing = await Review.findOne({
      productId: product._id,
      userId,
    }).lean();

    if (existing) {
      return NextResponse.json(
        { message: "You have already reviewed this product." },
        { status: 409 }
      );
    }

    const review = await Review.create({
      productId: product._id,
      userId,
      rating,
      title,
      comment,
      isVerifiedPurchase: true,
      isApproved: false,
    });

    return NextResponse.json(
      {
        message: "Thank you! Your review was submitted",
        review: {
          _id: review._id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerifiedPurchase: review.isVerifiedPurchase,
          isApproved: review.isApproved,
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Duplicate key from unique index
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { message: "You have already reviewed this product." },
        { status: 409 }
      );
    }

    console.error("POST /api/products/[slug]/reviews error:", error);

    return NextResponse.json(
      { message: "Failed to submit review." },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "Product slug is required" },
        { status: 400 }
      );
    }

    // Support both slug and ObjectId in the same param
    const productQuery = Types.ObjectId.isValid(slug)
      ? { _id: slug }
      : { slug };

    const product = await Product.findOne(productQuery)
      .select("_id")
      .lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const reviews = await Review.find({
      productId: product._id,
      isApproved: true,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const breakdownMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;

    for (const review of reviews) {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5;

      if (rating >= 1 && rating <= 5) {
        breakdownMap[rating] += 1;
        ratingSum += rating;
      }
    }

    const averageRating =
      totalReviews > 0
        ? Math.round((ratingSum / totalReviews) * 10) / 10
        : 0;

    const formattedReviews = reviews.map((review) => {
      const user = review.userId as { name?: string } | null;

      return {
        _id: review._id,
        rating: review.rating,
        title: review.title || "",
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        name: user?.name?.trim() || "Customer",
      };
    });

    return NextResponse.json(
      {
        averageRating,
        reviewCount: totalReviews,
        breakdown: [
          { stars: 5, count: breakdownMap[5] },
          { stars: 4, count: breakdownMap[4] },
          { stars: 3, count: breakdownMap[3] },
          { stars: 2, count: breakdownMap[2] },
          { stars: 1, count: breakdownMap[1] },
        ],
        reviews: formattedReviews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products/[slug]/reviews error:", error);

    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}