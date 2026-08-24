import { getProducts } from "@/actions/product.actions";
import { getCategories } from "@/actions/category.actions";
import ShopClient from "./components/shop-client";

const PRODUCTS_PER_PAGE = 10;

interface ShopPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [{ products, pagination }, categories] = await Promise.all([
    getProducts({ page: currentPage, limit: PRODUCTS_PER_PAGE }),
    getCategories(),
  ]);

  return (
    <ShopClient
      initialProducts={products ?? []}
      categories={categories ?? []}
      pagination={pagination}
    />
  );
}