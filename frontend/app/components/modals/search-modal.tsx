"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import { searchProducts } from "@/actions/product.actions";
import type { Product } from "@/types";
import { priceFormatter } from "@/lib/priceFormatter";

type SearchModalProps = {
  openSearchModal: boolean;
  setOpenSearchModal: React.Dispatch<React.SetStateAction<boolean>>;
};

function SearchModal({
  openSearchModal,
  setOpenSearchModal,
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();

  // Load suggested products when the sheet opens.
  useEffect(() => {
    if (!openSearchModal) return;

    let cancelled = false;

    const loadSuggestions = async () => {
      setLoading(true);

      try {
        const data = await searchProducts("", 8);

        if (!cancelled) {
          setProducts(data.products ?? []);
        }
      } catch (error) {
        console.error("Failed to load search suggestions:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [openSearchModal]);

  // Debounced search while typing.
  useEffect(() => {
    if (!openSearchModal) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const trimmedQuery = query.trim();

        const data = await searchProducts(
          trimmedQuery,
          trimmedQuery ? 20 : 8,
        );

        if (!cancelled) {
          setProducts(data.products ?? []);
          setSelectedIndex(-1);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Product search failed:", error);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, openSearchModal]);

  // Focus input when opening and reset search when closing.
  useEffect(() => {
    if (openSearchModal) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }

    setQuery("");
    setProducts([]);
    setSelectedIndex(-1);
  }, [openSearchModal]);

  const handleClose = () => {
    setOpenSearchModal(false);
  };

  const handleSelect = (product: Product) => {
    const slug =
      product.slug ?? product.name.replace(/\s+/g, "-").toLowerCase();

    setOpenSearchModal(false);
    setQuery("");

    router.push(`/shop/p/${slug}`);
  };

  // Keyboard navigation.
  useEffect(() => {
    if (!openSearchModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelectedIndex((previous) =>
          products.length === 0
            ? -1
            : Math.min(previous + 1, products.length - 1),
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelectedIndex((previous) =>
          Math.max(previous - 1, -1),
        );
      }

      if (
        event.key === "Enter" &&
        selectedIndex >= 0 &&
        products[selectedIndex]
      ) {
        event.preventDefault();

        handleSelect(products[selectedIndex]);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [openSearchModal, selectedIndex, products]);

  return (
    <Sheet open={openSearchModal} onOpenChange={setOpenSearchModal}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="z-[350] flex h-full w-full max-w-full flex-col gap-0 overflow-hidden border-l border-black/10 bg-white p-0 sm:max-w-[28rem] lg:max-w-[32rem] [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 space-y-0 border-b border px-5 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="heading-3 text-left">
              Search
            </SheetTitle>

            <SheetClose asChild>
              <button
                type="button"
                aria-label="Close search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 hover:bg-red-500 hover:text-white sm:h-10 sm:w-10"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </SheetClose>
          </div>

          {/* Search input */}
          <div className="mt-4 flex h-11 items-center gap-3 rounded-xl border border-black/10 bg-neutral-50 px-3.5 transition-colors focus-within:border-black/25 sm:h-12">
            <Search
              size={18}
              strokeWidth={1.7}
              className="shrink-0 text-black/40"
            />

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/40"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
              >
                <X size={15} strokeWidth={1.7} />
              </button>
            )}
          </div>
        </SheetHeader>

        {/* Search results */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 lg:px-8">
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-red-500" />

              <p className="text-sm text-black/45">
                Searching products...
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between bg-white px-5 pb-3 pt-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-black/40">
                  {query.trim()
                    ? "Search results"
                    : "Suggested products"}
                </p>

                <span className="text-xs text-black/35">
                  {products.length}
                  {query.trim() ? " found" : " items"}
                </span>
              </div>

              <div className="pb-5">
                {products.map((product, index) => {
                  const image =
                    product.media.find(
                      (media) => media.type === "image",
                    )?.url ||
                    product.media[0]?.url ||
                    "/placeholder.jpg";

                  return (
                    <button
                      key={product._id ?? index}
                      type="button"
                      onClick={() => handleSelect(product)}
                      className={`group flex w-full items-center gap-3 border-b border-black/[0.06] py-3.5 text-left transition-colors sm:gap-4 ${
                        selectedIndex === index
                          ? "bg-black/[0.04]"
                          : "hover:bg-black/[0.02]"
                      }`}
                    >
                      {/* Product image */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-16 sm:w-16">
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Product information */}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-black">
                          {product.name}
                        </p>

                        {!product.inStock && (
                          <p className="mt-1 text-xs text-red-600">
                            Out of stock
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <span className="shrink-0 text-xs font-medium text-black/65 sm:text-sm">
                        {priceFormatter(product.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex min-h-[240px] flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Search
                  size={20}
                  strokeWidth={1.6}
                  className="text-black/35"
                />
              </div>

              <p className="text-sm font-medium text-black/70">
                {loading
                  ? "Searching..."
                  : "No products found"}
              </p>

              {!loading && query.trim() && (
                <p className="mt-1 max-w-[260px] break-words text-xs leading-relaxed text-black/40">
                  Nothing matched &quot;{query.trim()}&quot;. Try
                  another search.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Keyboard shortcuts — desktop only */}
        <div className="hidden shrink-0 items-center justify-between border-t border-black/10 px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-black/35 lg:flex">
          <span>↵ Select</span>
          <span>↑↓ Navigate</span>

          <button
            type="button"
            onClick={handleClose}
            className="transition-colors hover:text-black"
          >
            Esc Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SearchModal;