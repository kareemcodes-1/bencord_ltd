import ProductCard from "@/app/components/products/product-card";
import { SplitLines } from "@/components/animations/SplitLines";
import type { Product } from "@/types";

type RelatedProductsProps = {
  products: Product[];
};

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div className="border-t border-black/10 px-5 py-12 sm:px-6 sm:py-16 lg:px-[4rem] lg:py-24">
      <div className="mx-auto mb-8 flex max-w-[min(50rem,100%)] flex-col items-center gap-2.5 text-center sm:mb-10 sm:gap-3 lg:mb-16">
        <span className="subtitle">Related Products</span>

        <SplitLines
          text="You May Also Like"
          tag="h1"
          className="heading-1 max-w-[min(36rem,100%)]"
          duration={1}
          stagger={0.025}
          ease="power4.out"
          yPercent={150}
          threshold={0.1}
          rootMargin="-100px"
        />
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} item={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;