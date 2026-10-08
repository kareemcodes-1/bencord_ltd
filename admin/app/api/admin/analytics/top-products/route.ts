import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    const products = await Order.aggregate([
      {
        $match: {
          "paymentInfo.paymentStatus": "paid",
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.productId",

          name: {
            $first: "$items.name",
          },

          image: {
            $first: {
              $arrayElemAt: [
                "$items.media.url",
                0,
              ],
            },
          },

          orders: {
            $sum: 1,
          },

          sales: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: {
              $multiply: [
                "$items.price",
                "$items.quantity",
              ],
            },
          },
        },
      },

      {
        $sort: {
          sales: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    return NextResponse.json(products);
  } catch (error) {
    console.error(
      "Top selling products error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch top selling products",
      },
      {
        status: 500,
      }
    );
  }
}