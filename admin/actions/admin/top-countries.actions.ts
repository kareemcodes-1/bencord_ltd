export interface TopCountryData {
  country: string;
  sessions: number;
}

export async function getTopCountries(): Promise<
  TopCountryData[]
> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/top-countries`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch top countries data"
    );
  }

  return response.json();
}