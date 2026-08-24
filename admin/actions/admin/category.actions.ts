import type { Category } from "@/types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  image: string;
  featured: boolean;
}

export interface GetCategoriesResult {
  categories: Category[];
  pagination: PaginationMeta;
}

interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getCategories({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetCategoriesParams = {}): Promise<GetCategoriesResult> {
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export async function createCategory(data: CategoryPayload) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to create category");
  }

  return response.json();
}

export async function updateCategory(id: string, data: CategoryPayload) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to update category");
  }

  return response.json();
}

export async function deleteCategory(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to delete category");
  }

  // Some APIs return 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}