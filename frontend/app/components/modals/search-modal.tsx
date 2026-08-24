"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { getProducts } from "@/actions/product.actions";
import { Product } from "@/types";
import { priceFormatter } from "@/lib/priceFormatter";

type SearchModalProps = {
  openSearchModal: boolean;
  setOpenSearchModal: React.Dispatch<React.SetStateAction<boolean>>;
};

function SearchModal({ openSearchModal, setOpenSearchModal }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const data = await getProducts({
        page: 1,
        limit: 500, // load enough products for search
      });
      setAllProducts(Array.isArray(data) ? data : data.products ?? []);
    })();
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [products]);

useEffect(() => {
  if (!query.trim()) {
    setProducts(allProducts.slice(0, 8));
    return;
  }

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[-_/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const q = normalize(query);
  const words = q.split(" ").filter(Boolean);

  const filtered = allProducts.filter((p) => {
    const name = normalize(p.name ?? "");
    const slug = normalize(p.slug ?? p.name ?? "");

    // every word in the search must appear in name or slug
    return words.every(
      (word) => name.includes(word) || slug.includes(word)
    );
  });

  setProducts(filtered);
}, [query, allProducts]);

  useEffect(() => {
    if (openSearchModal) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [openSearchModal]);

  const handleSelect = (product: Product) => {
    const slug =
      product.slug ?? product.name.replace(/\s+/g, "-").toLowerCase();
    router.push(`/shop/p/${slug}`);
    setOpenSearchModal(false);
    setQuery("");
  };

  useEffect(() => {
    if (!openSearchModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, products.length - 1),
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      }
      if (e.key === "Enter" && selectedIndex >= 0 && products[selectedIndex]) {
        handleSelect(products[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSearchModal, selectedIndex, products]);

  return (
    <Dialog open={openSearchModal} onOpenChange={setOpenSearchModal}>
            <DialogContent
        showCloseButton={false}
        className="top-[6%] z-[350] flex max-h-[min(36rem,88dvh)] w-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] translate-y-0 flex-col gap-0 overflow-hidden rounded-2xl border border-black/10 p-0 shadow-2xl sm:top-[10%] sm:max-h-[min(36rem,80vh)] sm:w-full sm:max-w-[42rem] [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>

        {/* Input */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-black/10 px-4 py-3.5 sm:gap-3 sm:px-5 sm:py-4">
          <Search
            size={18}
            strokeWidth={1.8}
            className="shrink-0 text-black/40"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="min-w-0 flex-1 bg-transparent text-[0.9rem] font-medium text-black outline-none placeholder:font-normal placeholder:text-black/35 sm:text-[0.95rem]"
          />
          <button
            type="button"
            onClick={() => (query ? setQuery("") : setOpenSearchModal(false))}
            aria-label={query ? "Clear search" : "Close search"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Results */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {products.length > 0 ? (
            <>
              <p className="sticky top-0 z-10 bg-white px-4 pb-2 pt-3.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-black/40 sm:px-5 sm:pt-4">
                {query
                  ? `${products.length} result${products.length !== 1 ? "s" : ""}`
                  : "Suggested"}
              </p>

              <div className="pb-2">
                {products.map((product, index) => (
                  <button
                    key={product._id ?? index}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] sm:gap-4 sm:px-5 sm:py-3 ${
                      selectedIndex === index ? "bg-black/[0.04]" : ""
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-14 sm:w-14">
                      <Image
                        src={
                          product.media.find((m) => m.type === "image")?.url ||
                          product.media[0]?.url ||
                          "/placeholder.jpg"
                        }
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.85rem] font-medium text-black sm:text-[0.9rem]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 hidden truncate text-[0.75rem] text-black/40 sm:block">
                        /shop/p/
                        {(
                          product.slug ??
                          product.name.replace(/\s+/g, "-")
                        ).toLowerCase()}
                      </p>
                    </div>

                    <span className="shrink-0 text-[0.8rem] font-medium text-black/70 sm:text-[0.85rem]">
                      {priceFormatter(product.price)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:py-16">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
                <Search size={20} strokeWidth={1.8} className="text-black/30" />
              </div>
              <p className="text-[0.9rem] font-medium text-black/50">
                No products found
              </p>
              {query && (
                <p className="mt-1 max-w-full truncate text-[0.8rem] text-black/35">
                  Nothing matched &quot;{query}&quot;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer — hide keyboard hints on very small screens */}
        <div className="hidden shrink-0 items-center gap-4 border-t border-black/10 px-5 py-3 sm:flex">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-black/30">
            ↵ Select
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-black/30">
            ↑↓ Navigate
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-black/30">
            Esc Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchModal;