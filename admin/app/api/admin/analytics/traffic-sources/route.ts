
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

      dimensions: [
        {
          name: "sessionSource",
        },
      ],

      metrics: [
        {
          name: "sessions",
        },
      ],

      orderBys: [
        {
          metric: {
            metricName: "sessions",
          },
          desc: true,
        },
      ],
    });

    const trafficSources = {
      Instagram: 0,
      Google: 0,
      TikTok: 0,
      WhatsApp: 0,
      Other: 0,
    };

    response.rows?.forEach((row) => {
      const source =
        row.dimensionValues?.[0]?.value?.toLowerCase() || "";

      const sessions = Number(
        row.metricValues?.[0]?.value || 0
      );

      if (
        source.includes("instagram") ||
        source.includes("instagram.com")
      ) {
        trafficSources.Instagram += sessions;
      } else if (
        source === "google" ||
        source.includes("google.")
      ) {
        trafficSources.Google += sessions;
      } else if (
        source.includes("tiktok") ||
        source.includes("tiktok.com")
      ) {
        trafficSources.TikTok += sessions;
      } else if (
        source.includes("whatsapp") ||
        source.includes("whatsapp.com")
      ) {
        trafficSources.WhatsApp += sessions;
      } else {
        trafficSources.Other += sessions;
      }
    });

    return NextResponse.json(
      Object.entries(trafficSources).map(
        ([source, sessions]) => ({
          source,
          sessions,
        })
      )
    );
  } catch (error) {
    console.error(
      "GA4 traffic sources error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch traffic source data",
      },
      {
        status: 500,
      }
    );
  }
}