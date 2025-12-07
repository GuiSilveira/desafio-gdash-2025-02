import { useState, useMemo, useCallback } from "react";

export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
  maxVisiblePages?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  pageNumbers: (number | "...")[];
  offset: number;
  reset: () => void;
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
  maxVisiblePages = 5,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const goToPage = useCallback(
    (page: number) => {
      const newPage = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(newPage);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const pageNumbers = useMemo((): (number | "...")[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (currentPage <= halfVisible + 1) {
      for (let i = 1; i <= maxVisiblePages - 1; i++) {
        pages.push(i);
      }
      pages.push("...", totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
      pages.push(1, "...");
      for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, "...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("...", totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  const offset = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    pageNumbers,
    offset,
    reset,
  };
}
