import type { Subscriber } from "@/types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface GetSubscribersResult {
  subscribers: Subscriber[];
  pagination: PaginationMeta;
}

interface GetSubscribersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "all" | "active" | "inactive";
}

export async function getSubscribers({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  status = "all",
}: GetSubscribersParams = {}): Promise<GetSubscribersResult> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
    status,
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subscribers?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch subscribers");
  }

  return response.json();
}

export async function updateSubscriberStatus(
  id: string,
  isActive: boolean
) {
  const response = await fetch(`/api/admin/subscribers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to update subscriber");
  }

  return response.json();
}

export async function deleteSubscriber(id: string) {
  const response = await fetch(`/api/admin/subscribers/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to delete subscriber");
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}