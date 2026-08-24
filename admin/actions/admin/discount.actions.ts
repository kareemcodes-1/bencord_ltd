import type { Discount } from "@/types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface DiscountPayload {
  title: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  productIds: string[];
  startsAt: string; // ISO
  expiresAt: string; // ISO
  isActive: boolean;
}

export interface GetDiscountsResult {
  discounts: Discount[];
  pagination: PaginationMeta;
}

interface GetDiscountsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getDiscounts({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetDiscountsParams = {}): Promise<GetDiscountsResult> {
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/discounts?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch discounts");
  }

  return response.json();
}

export async function createDiscount(data: DiscountPayload) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/discounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to create discount");
  }

  return response.json();
}

export async function updateDiscount(id: string, data: DiscountPayload) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/discounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to update discount");
  }

  return response.json();
}

export async function deleteDiscount(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/discounts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to delete discount");
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}