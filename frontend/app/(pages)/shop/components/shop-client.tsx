"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ShoppingBag } from "lucide-react";

import ProductCard from "@/app/components/products/product-card";
import { Product, Category } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@/app/components/pagination";
import EmptyState from "@/app/components/empty-state";
import FilterSheet, { type AvailabilityFilter } from "./filter-sheet";
import { SplitLines } from "@/components/animations/SplitLines";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

type Props = {
  initialProducts: Product[];
  categories: Category[];
  pagination: PaginationMeta;
  priceRange: PriceRange;
};

export default function ShopClient({
  initialProducts,
  categories,
  pagination,
  priceRange,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sort, setSort] = useState<SortValue>(
    (searchParams.get("sort") as SortValue) || "default",
  );

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const selectedCategories = searchParams.get("categories")
    ? searchParams.get("categories")!.split(",").filter(Boolean)
    : [];

  const selectedAvailability = searchParams.get("availability")
    ? (searchParams
        .get("availability")!
        .split(",")
        .filter(Boolean) as AvailabilityFilter[])
    : [];

  const minPrice = priceRange.minPrice;
  const maxPrice = priceRange.maxPrice;

  const urlMinPrice = searchParams.get("minPrice");
  const urlMaxPrice = searchParams.get("maxPrice");

  const parsedMinPrice =
    urlMinPrice !== null && Number.isFinite(Number(urlMinPrice))
      ? Number(urlMinPrice)
      : minPrice;

  const parsedMaxPrice =
    urlMaxPrice !== null && Number.isFinite(Number(urlMaxPrice))
      ? Number(urlMaxPrice)
      : maxPrice;

  const priceRangeValue: [number, number] = [
    parsedMinPrice,
    parsedMaxPrice,
  ];

  const [draftCategories, setDraftCategories] =
    useState<string[]>(selectedCategories);

  const [draftAvailability, setDraftAvailability] = useState<
    AvailabilityFilter[]
  >(selectedAvailability);

  const [draftPriceRange, setDraftPriceRange] = useState<
    [number, number]
  >(priceRangeValue);

  useEffect(() => {
    setDraftCategories(selectedCategories);
    setDraftAvailability(selectedAvailability);
    setDraftPriceRange(priceRangeValue);
    setSort((searchParams.get("sort") as SortValue) || "default");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleToggleAvailability = (value: AvailabilityFilter) => {
    setDraftAvailability((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };

  const handleToggleCategory = (categoryId: string) => {
    setDraftCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleClearFilters = () => {
    setDraftCategories([]);
    setDraftAvailability([]);
    setDraftPriceRange([minPrice, maxPrice]);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (draftCategories.length > 0) {
      params.set("categories", draftCategories.join(","));
    } else {
      params.delete("categories");
    }

    if (draftAvailability.length > 0) {
      params.set("availability", draftAvailability.join(","));
    } else {
      params.delete("availability");
    }

    if (
      draftPriceRange[0] !== minPrice ||
      draftPriceRange[1] !== maxPrice
    ) {
      params.set("minPrice", String(draftPriceRange[0]));
      params.set("maxPrice", String(draftPriceRange[1]));
    } else {
      params.delete("minPrice");
      params.delete("maxPrice");
    }

    // Any filter change starts from page 1
    params.set("page", "1");

    setFilterSheetOpen(false);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (value: SortValue) => {
    setSort(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value === "default") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    // Sorting starts from page 1
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedAvailability.length +
    (priceRangeValue[0] !== minPrice ||
    priceRangeValue[1] !== maxPrice
      ? 1
      : 0);

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Default";

  return (
    <section className="w-full px-[1.5rem] pb-[4rem] pt-[9rem] sm:px-8 lg:px-[3rem]">
      <div className="mx-auto w-full">
        <div className="mx-auto flex max-w-[min(50rem,100%)] flex-col items-center gap-[1rem] text-center">
          <span className="subtitle">Shop</span>

          <SplitLines
            text="Quality Office Essentials"
            tag="h1"
            className="heading-1 max-w-[min(40rem,100%)]"
            duration={1}
            stagger={0.025}
            ease="power4.out"
            yPercent={150}
            threshold={0.1}
            rootMargin="-100px"
          />

          <p className="mx-auto max-w-[min(32rem,100%)] text-[0.875rem] leading-relaxed text-black/50 sm:text-[0.9rem] lg:text-[1rem]">
            Reliable printing solutions, office equipment, and essentials to
            keep your business productive.
          </p>
        </div>

        {/* Filter + Sort */}
        <div className="mt-10 flex flex-col gap-3 pb-4 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:pb-5 lg:mt-[4rem]">
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="relative flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.05em] text-black shadow-sm transition-all duration-300 hover:border-[#ee0a0a] hover:bg-[#ee0a0a]/10 hover:text-[#ee0a0a] sm:w-auto sm:justify-start"
          >
            <span className="text-base leading-none">+</span>
            Filters

            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ee0a0a] px-1 text-[0.6rem] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-black shadow-sm transition-all duration-300 hover:border-[#ee0a0a] hover:bg-[#ee0a0a]/10 hover:text-[#ee0a0a] sm:w-auto sm:justify-start"
              >
                <ArrowUpDown
                  size={14}
                  className="text-black/50 transition-colors group-hover:text-[#ee0a0a]"
                />

                <span className="max-w-[10rem] truncate">
                  {activeSortLabel}
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="z-[350] w-52 rounded-2xl border border-black/10 p-1.5 shadow-lg"
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`cursor-pointer gap-2 rounded-xl px-3 py-2.5 text-[0.8rem] font-medium ${
                    sort === option.value
                      ? "bg-[#ee0a0a]/10 text-[#ee0a0a]"
                      : ""
                  }`}
                >
                  <span className="flex-1">{option.label}</span>

                  {sort === option.value && (
                    <Check size={14} strokeWidth={2} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="py-4 sm:py-6">
          <p className="text-[0.7rem] uppercase tracking-[0.05em] text-black/35">
            {pagination.total === 0
    ? "No products"
    : `Showing ${initialProducts.length} of ${pagination.total} products`}
          </p>
        </div>

        {initialProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3">
            {initialProducts.map((product) => (
              <ProductCard key={product._id} item={product} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[16rem] items-center justify-center border border-black/10 sm:min-h-[20rem]">
            <EmptyState
              icon={ShoppingBag}
              message="No products available at the moment."
              buttonText="Back to Home"
              buttonHref="/"
            />
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          className="mt-10 sm:mt-14 lg:mt-16"
        />
      </div>

      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        categories={categories}
        selectedCategories={draftCategories}
        onToggleCategory={handleToggleCategory}
        selectedAvailability={draftAvailability}
        onToggleAvailability={handleToggleAvailability}
        priceRange={draftPriceRange}
        onPriceRangeChange={setDraftPriceRange}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
      />
    </section>
  );
}