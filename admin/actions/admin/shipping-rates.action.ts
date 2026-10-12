import type { ShippingRate } from "@/types"; 

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ShippingRatePayload {
  location: string;
  fee: number;
  country?: string;
  isActive?: boolean;
}

export interface GetShippingRatesResult {
  rates: ShippingRate[];
  pagination: PaginationMeta;
}

interface GetShippingRatesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getShippingRates({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "location",
  sortOrder = "asc",
}: GetShippingRatesParams = {}): Promise<GetShippingRatesResult> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/shipping-rates?${params.toString()}`,
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

export async function createShippingRate(data: ShippingRatePayload) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/shipping-rates`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to create shipping rate");
  }

  return response.json();
}

export async function updateShippingRate(
  id: string,
  data: ShippingRatePayload
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/shipping-rates/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to update shipping rate");
  }

  return response.json();
}

export async function deleteShippingRate(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/shipping-rates/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to delete shipping rate");
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}