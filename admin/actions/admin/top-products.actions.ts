export interface TopProductData {
  _id: string;
  name: string;
  image: string | null;
  orders: number;
  sales: number;
  revenue: number;
}

export async function getTopProducts(): Promise<
  TopProductData[]
> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/top-products`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch top selling products"
    );
  }

  return response.json();
}