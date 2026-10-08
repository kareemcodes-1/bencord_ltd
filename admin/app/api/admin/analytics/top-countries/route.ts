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
          name: "country",
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

      limit: 10,
    });

    const countries =
      response.rows
        ?.map((row) => ({
          country:
            row.dimensionValues?.[0]?.value || "",
          sessions: Number(
            row.metricValues?.[0]?.value || 0
          ),
        }))
        .filter(
          (item) =>
            item.country &&
            item.country.toLowerCase() !== "(not set)"
        ) || [];

    return NextResponse.json(countries);
  } catch (error) {
    console.error(
      "GA4 top countries error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch top countries data",
      },
      {
        status: 500,
      }
    );
  }
}