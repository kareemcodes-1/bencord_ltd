import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}