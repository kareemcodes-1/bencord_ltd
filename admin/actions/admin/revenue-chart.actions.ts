export type RevenueChartRange =
  | "today"
  | "7days"
  | "30days";

export interface RevenueChartData {
  date: string;
  revenue: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getRevenueChart(
  range: RevenueChartRange = "today"
): Promise<RevenueChartData[]> {
  const response = await fetch(
    `${API_URL}/api/admin/orders/chart?range=${range}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch revenue chart data");
  }

  return response.json();
}