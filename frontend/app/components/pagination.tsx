"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type PageItem = number | "ellipsis";

const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): PageItem[] => {
  const pages: PageItem[] = [];
  const siblingCount = 1;

  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);

  pages.push(1);

  if (start > 2) {
    pages.push("ellipsis");
  }

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    onPageChange(page);

    // Scroll to top after page change
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition-all duration-300 hover:border-[#ee0a0a] hover:bg-[#ee0a0a]/10 hover:text-[#ee0a0a] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-black/10 disabled:hover:bg-white disabled:hover:text-black"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-12 w-12 items-center justify-center text-sm text-black/30"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
              page === currentPage
                ? "bg-[#ee0a0a] text-white shadow-sm"
                : "border border-black/10 bg-white text-black shadow-sm hover:border-[#ee0a0a] hover:bg-[#ee0a0a]/10 hover:text-[#ee0a0a]"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition-all duration-300 hover:border-[#ee0a0a] hover:bg-[#ee0a0a]/10 hover:text-[#ee0a0a] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-black/10 disabled:hover:bg-white disabled:hover:text-black"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>
    </nav>
  );
};

export default Pagination;