import { notFound } from "next/navigation";

import { getProductBySlug, getProducts } from "@/actions/product.actions";
import {
  getProductReviews,
  getReviewEligibility,
} from "@/actions/review.actions";
import ProductGallery from "./components/product-gallery";
import ProductInfo from "./components/product-info";
import ProductReviews from "./components/product-reviews";
import RelatedProducts from "./components/related-products";
import StickyAddToCartBar from "./components/sticky-add-to-cart-bar";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [reviewsData, eligibility, { products }] = await Promise.all([
    getProductReviews(product.slug),
    getReviewEligibility(product.slug),
    getProducts({ page: 1, limit: 12 }),
  ]);

  const relatedProducts = products
    .filter(
      (item) =>
        item._id !== product._id &&
        item.categoryId?._id === product.categoryId?._id,
    )
    .slice(0, 4);

  return (
    <>
      <div className="flex min-h-screen flex-col px-6 pt-[9rem] lg:flex-row lg:items-start lg:px-0">
        <ProductGallery media={product.media} name={product.name} />
        <ProductInfo product={product} />
      </div>

      <ProductReviews
        product={product}
        reviewsData={reviewsData}
        canReview={eligibility.canReview}
      />

      <RelatedProducts products={relatedProducts} />

      <StickyAddToCartBar product={product} />
    </>
  );
}

export const dynamic = "force-dynamic";