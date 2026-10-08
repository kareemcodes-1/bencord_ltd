import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const range = searchParams.get("range") || "today";

    const now = new Date();
    const startDate = new Date(now);

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "30days") {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: now,
          },
          "paymentInfo.paymentStatus": "paid",
        },
      },

      {
        $group: {
          _id:
            range === "today"
              ? {
                  $dateToString: {
                    format: "%Y-%m-%d-%H",
                    date: "$createdAt",
                    timezone: "Africa/Lagos",
                  },
                }
              : {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "Africa/Lagos",
                  },
                },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const revenueMap = new Map(
      revenue.map((item) => [
        item._id,
        item.revenue,
      ])
    );

    const result = [];

    if (range === "today") {
      const currentHour = new Date(startDate);

      while (currentHour <= now) {
        const year = currentHour.getFullYear();
        const month = String(
          currentHour.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
          currentHour.getDate()
        ).padStart(2, "0");
        const hour = String(
          currentHour.getHours()
        ).padStart(2, "0");

        const key = `${year}-${month}-${day}-${hour}`;

        result.push({
          date: key,
          revenue: revenueMap.get(key) ?? 0,
        });

        currentHour.setHours(
          currentHour.getHours() + 1
        );
      }
    } else {
      const currentDate = new Date(startDate);

      while (currentDate <= now) {
        const date = [
          currentDate.getFullYear(),
          String(
            currentDate.getMonth() + 1
          ).padStart(2, "0"),
          String(
            currentDate.getDate()
          ).padStart(2, "0"),
        ].join("-");

        result.push({
          date,
          revenue: revenueMap.get(date) ?? 0,
        });

        currentDate.setDate(
          currentDate.getDate() + 1
        );
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Revenue chart error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch revenue chart data",
      },
      {
        status: 500,
      }
    );
  }
}