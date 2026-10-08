export interface TrafficSourceData {
  source: string;
  sessions: number;
}

export async function getTrafficSources(): Promise<
  TrafficSourceData[]
> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/traffic-sources`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch traffic source data"
    );
  }

  return response.json();
}