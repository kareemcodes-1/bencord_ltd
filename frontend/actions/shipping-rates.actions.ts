// actions/shipping-rates.ts  (or wherever you keep public actions)

export type PublicShippingRate = {
  _id: string;
  location: string;
  fee: number;
};

export async function getPublicShippingRates(): Promise<PublicShippingRate[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/shipping-rates`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch shipping rates");
  }

  return response.json();
}