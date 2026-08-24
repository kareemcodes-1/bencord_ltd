"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import ProductCard from "./product-card";
import { getProducts } from "@/actions/product.actions";
import type { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "../empty-state";

import "swiper/css";
import "swiper/css/navigation";
import { SplitLines } from "@/components/animations/SplitLines";
import FadeContent from "@/components/animations/fade-content";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts({ page: 1, limit: 8 });
        setProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="section-spacing w-full">
      <div className="flex flex-col">
        <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-12">

  <SplitLines
    text="Featured Products"
    tag="span"
    className="subtitle"
    duration={0.8}
    stagger={0.02}
    ease="power3.out"
    yPercent={120}
    threshold={0.1}
    rootMargin="-80px"
  />

  <SplitLines
    text="Shop Best Sellers"
    tag="h2"
    className="heading-1"
    duration={1}
    stagger={0.025}
    ease="power3.out"
    yPercent={150}
    threshold={0.1}
    rootMargin="-100px"
    delay={0.05}
  />

  {/* Red accent line */}
  <div className="line-border" />
</div>

        <div className="relative w-full">
          {/* Nav buttons — inset so they don’t clip when zoomed */}
          {/* Previous */}
          <button
            ref={setPrevEl}
            type="button"
            aria-label="Previous products"
            className="absolute left-[-1rem] top-[32%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/95 shadow-sm backdrop-blur transition-colors duration-300 hover:bg-[#ee0a0a] hover:text-white sm:left-2 sm:h-11 sm:w-11 md:top-1/2 lg:left-[-1.25rem] lg:h-14 lg:w-14 xl:left-[-2rem]"
          >
            <ArrowLeft size={18} className="lg:size-[22px]" />
          </button>

          {/* Next */}
          <button
            ref={setNextEl}
            type="button"
            aria-label="Next products"
            className="absolute right-[-1rem] top-[32%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/15 bg-white/95 shadow-sm backdrop-blur transition-colors duration-300 hover:bg-[#ee0a0a] hover:text-white sm:right-2 sm:h-11 sm:w-11 md:top-1/2 lg:right-[-1.25rem] lg:h-14 lg:w-14 xl:right-[-2rem]"
          >
            <ArrowRight size={18} className="lg:size-[22px]" />
          </button>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="mt-4 flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <Swiper
              className="w-full !overflow-hidden"
              modules={[Navigation, Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              centeredSlides={false}
              breakpoints={{
                480: {
                  slidesPerView: 1,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
              }}
              loop={products.length > 3}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                prevEl,
                nextEl,
              }}
              key={prevEl && nextEl ? "with-navigation" : "without-navigation"}
            >
              {products.map((product) => (
                <SwiperSlide key={product._id} className="!h-auto">
                  <ProductCard item={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flex min-h-[16rem] items-center justify-center sm:min-h-[20rem]">
              <EmptyState
                icon={ShoppingBag}
                message="No featured products available."
                buttonText="Continue Shopping"
                buttonHref="/shop"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex w-full justify-center sm:mt-10">
          <Link href="/shop" className="btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Products;