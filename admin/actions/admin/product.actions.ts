import type { Product } from "@/types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ProductPayload {
    name: string;
    slug: string;
    description: string;
    price: number;
    categoryId: string;

 
    featured: boolean;
    inStock: boolean;
 
    media: { url: string; type: "image" | "video" }[];
}

export interface GetProductsResult {
  products: Product[];
  pagination: PaginationMeta;
}

interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getProducts({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetProductsParams = {}): Promise<GetProductsResult> {
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function createProduct(data: ProductPayload) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
 
    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => null);
 
        throw new Error(
            error?.message ?? "Failed to create product"
        );
    }
 
    return response.json();
}
 
export async function updateProduct(
    id: string,
    data: ProductPayload
) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
 
    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => null);
 
        throw new Error(
            error?.message ?? "Failed to update product"
        );
    }
 
    return response.json();
}

export async function deleteProduct(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to delete product");
  }

  // Some APIs return 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}