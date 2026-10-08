import { analyticsDataClient } from "@/lib/analytics";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      metrics: [
        {
          name: "activeUsers",
        },
      ],
    });

    const totalVisitors = Number(
      response.rows?.[0]?.metricValues?.[0]?.value || 0
    );

    return NextResponse.json({
      totalVisitors,
    });
  } catch (error) {
    console.error("GA4 visitors error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch GA4 visitor data",
      },
      {
        status: 500,
      }
    );
  }
}