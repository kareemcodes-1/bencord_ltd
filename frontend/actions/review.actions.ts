"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";

export type PendingReviewItem = {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  orderId: string;
  orderReference: string;
  deliveredAt: string;
  type: "needs_review" | "pending_approval";
  // only for pending_approval
  reviewId?: string;
  rating?: number;
  title?: string;
  comment?: string;
  createdAt?: string;
};


export type ReviewItem = {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  name: string;
};

export type ReviewsResponse = {
  averageRating: number;
  reviewCount: number;
  breakdown: { stars: number; count: number }[];
  reviews: ReviewItem[];
};

export type ReviewEligibility = {
  canReview: boolean;
  reason?: "unauthenticated" | "not_purchased" | "already_reviewed";
};

export async function getReviewEligibility(
  slugOrId: string,
): Promise<ReviewEligibility> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { canReview: false, reason: "unauthenticated" };
  }

  await connectDB();

  const productQuery = Types.ObjectId.isValid(slugOrId)
    ? { _id: slugOrId, isActive: true }
    : { slug: slugOrId, isActive: true };

  const product = await Product.findOne(productQuery).select("_id").lean();
  if (!product) {
    return { canReview: false, reason: "not_purchased" };
  }

  const userId = session.user.id;

  const alreadyReviewed = await Review.exists({
    productId: product._id,
    userId,
  });

  if (alreadyReviewed) {
    return { canReview: false, reason: "already_reviewed" };
  }

  const hasPurchased = await Order.exists({
    userId: new Types.ObjectId(userId),
    orderStatus: "delivered",
    "items.productId": product._id,
  });

  if (!hasPurchased) {
    return { canReview: false, reason: "not_purchased" };
  }

  return { canReview: true };
}

export async function getProductReviews(
  slugOrId: string,
): Promise<ReviewsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(
    `${baseUrl}/api/products/${slugOrId}/reviews`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return {
      averageRating: 0,
      reviewCount: 0,
      breakdown: [
        { stars: 5, count: 0 },
        { stars: 4, count: 0 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ],
      reviews: [],
    };
  }

  return res.json();
}


export async function getPendingReviews() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      items: [] as PendingReviewItem[],
      error: "Unauthorized" as const,
    };
  }

  try {
    await connectDB();

    const userId = session.user.id;

    // Existing reviews by this user
    const userReviews = await Review.find({ userId }).lean();
    const reviewedProductIds = new Set(
      userReviews.map((r) => r.productId.toString())
    );

    // Reviews waiting for admin approval
    const pendingApprovalReviews = userReviews.filter((r) => !r.isApproved);

    // Delivered orders
    const deliveredOrders = await Order.find({
      userId,
      orderStatus: "delivered",
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Map productId → latest delivered order info
    const productOrderMap = new Map<
      string,
      { orderId: string; orderReference: string; deliveredAt: Date }
    >();

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const productId = item.productId.toString();

        // Keep the most recent delivery for each product
        if (!productOrderMap.has(productId)) {
          productOrderMap.set(productId, {
            orderId: order._id.toString(),
            orderReference: order.paymentInfo?.transactionId || order._id.toString(),
            deliveredAt: order.updatedAt || order.createdAt,
          });
        }
      }
    }

    // Products delivered but not yet reviewed
    const needsReviewProductIds = [...productOrderMap.keys()].filter(
      (id) => !reviewedProductIds.has(id)
    );

    // Fetch product details
    const allProductIds = [
      ...needsReviewProductIds,
      ...pendingApprovalReviews.map((r) => r.productId.toString()),
    ];

    const products = await Product.find({
      _id: { $in: allProductIds },
    })
      .select("name slug media")
      .lean();

    const productMap = new Map(
      products.map((p) => [
        p._id.toString(),
        {
          name: p.name,
          slug: p.slug,
          image:
            p.media?.find((m: any) => m.type === "image")?.url ||
            p.media?.[0]?.url ||
            null,
        },
      ])
    );

    const items: PendingReviewItem[] = [];

    // A. Needs review
    for (const productId of needsReviewProductIds) {
      const product = productMap.get(productId);
      const orderInfo = productOrderMap.get(productId);
      if (!product || !orderInfo) continue;

      items.push({
        productId,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.image,
        orderId: orderInfo.orderId,
        orderReference: orderInfo.orderReference,
        deliveredAt: new Date(orderInfo.deliveredAt).toISOString(),
        type: "needs_review",
      });
    }

    // B. Pending approval
    for (const review of pendingApprovalReviews) {
      const product = productMap.get(review.productId.toString());
      if (!product) continue;

      items.push({
        productId: review.productId.toString(),
        productName: product.name,
        productSlug: product.slug,
        productImage: product.image,
        orderId: "",
        orderReference: "",
        deliveredAt: "",
        type: "pending_approval",
        reviewId: review._id.toString(),
        rating: review.rating,
        title: review.title || "",
        comment: review.comment,
        createdAt: new Date(review.createdAt).toISOString(),
      });
    }

    return {
      items,
      error: null,
    };
  } catch (error) {
    console.error("getPendingReviews error:", error);
    return {
      items: [] as PendingReviewItem[],
      error: "Failed to fetch pending reviews" as const,
    };
  }
}