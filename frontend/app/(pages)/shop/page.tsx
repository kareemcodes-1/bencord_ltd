import { getProducts } from "@/actions/product.actions";
import { getCategories } from "@/actions/category.actions";

import ShopClient from "./components/shop-client";

const PRODUCTS_PER_PAGE = 10;

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    categories?: string;
    availability?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const currentPage = Math.max(1, Number(params.page) || 1);

  const [
    { products, pagination, priceRange },
    categories,
  ] = await Promise.all([
    getProducts({
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      categories: params.categories,
      availability: params.availability,
      minPrice: params.minPrice
        ? Number(params.minPrice)
        : undefined,
      maxPrice: params.maxPrice
        ? Number(params.maxPrice)
        : undefined,
      sort: params.sort,
    }),
    getCategories(),
  ]);

  return (
    <ShopClient
      initialProducts={products ?? []}
      categories={categories ?? []}
      pagination={pagination}
      priceRange={priceRange}
    />
  );
}