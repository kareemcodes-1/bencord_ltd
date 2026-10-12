
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const error = await response.json().catch(() => null);
  return error?.message ?? fallback;
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
    country: "GH",
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `${API_URL}/api/admin/shipping-rates?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to fetch Ghana shipping rates"
      )
    );
  }

  return response.json();
}

export async function createShippingRate(
  data: ShippingRatePayload
): Promise<ShippingRate> {
  const response = await fetch(
    `${API_URL}/api/admin/shipping-rates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: data.location.trim(),
        fee: data.fee,
        isActive: data.isActive ?? true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to create Ghana shipping rate"
      )
    );
  }

  return response.json();
}

export async function updateShippingRate(
  id: string,
  data: ShippingRatePayload
): Promise<ShippingRate> {
  const response = await fetch(
    `${API_URL}/api/admin/shipping-rates/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: data.location.trim(),
        fee: data.fee,
        isActive: data.isActive,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to update Ghana shipping rate"
      )
    );
  }

  return response.json();
}

export async function deleteShippingRate(
  id: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/api/admin/shipping-rates/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to delete Ghana shipping rate"
      )
    );
  }

  return response.json();
}