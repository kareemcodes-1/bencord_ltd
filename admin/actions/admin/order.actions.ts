import type { Order } from "@/types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled";

export interface UpdateOrderPayload {
  orderStatus: OrderStatus;
  trackingNumber?: string | null;
    adminNote?: string | null;
}

export interface GetOrdersResult {
  orders: Order[];
  pagination: PaginationMeta;
}

interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export async function getOrders({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  status = "",
}: GetOrdersParams = {}): Promise<GetOrdersResult> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  });

  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function getOrder(id: string): Promise<Order> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch order");
  }

  return response.json();
}

export async function updateOrder(
  id: string,
  data: UpdateOrderPayload
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to update order");
  }

  return response.json();
}

export async function deleteOrder(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to delete order");
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}

export async function getTotalRevenue(): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/revenue`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch total revenue");
  }

  const data = await response.json();
  return data.totalRevenue ?? 0;
}