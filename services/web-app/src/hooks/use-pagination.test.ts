import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./use-pagination";

describe("usePagination", () => {
  describe("basic functionality", () => {
    it("should initialize with correct values", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
        }),
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(10);
      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(false);
      expect(result.current.offset).toBe(0);
    });

    it("should initialize with custom initial page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          initialPage: 5,
        }),
      );

      expect(result.current.currentPage).toBe(5);
      expect(result.current.offset).toBe(40);
    });

    it("should handle totalItems of 0", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 0,
          itemsPerPage: 10,
        }),
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(true);
    });

    it("should calculate totalPages correctly with remainder", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 25,
          itemsPerPage: 10,
        }),
      );

      expect(result.current.totalPages).toBe(3);
    });
  });

  describe("navigation", () => {
    it("should go to next page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
        }),
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.offset).toBe(10);
      expect(result.current.isFirstPage).toBe(false);
    });

    it("should go to previous page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          initialPage: 5,
        }),
      );

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(4);
    });

    it("should not go below page 1", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
        }),
      );

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should not go above total pages", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 30,
          itemsPerPage: 10,
        }),
      );

      act(() => {
        result.current.goToPage(5);
      });

      expect(result.current.currentPage).toBe(3);
    });

    it("should go to first page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          initialPage: 5,
        }),
      );

      act(() => {
        result.current.firstPage();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.isFirstPage).toBe(true);
    });

    it("should go to last page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
        }),
      );

      act(() => {
        result.current.lastPage();
      });

      expect(result.current.currentPage).toBe(10);
      expect(result.current.isLastPage).toBe(true);
    });

    it("should go to specific page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
        }),
      );

      act(() => {
        result.current.goToPage(7);
      });

      expect(result.current.currentPage).toBe(7);
      expect(result.current.offset).toBe(60);
    });

    it("should reset to page 1", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          initialPage: 5,
        }),
      );

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe("page numbers generation", () => {
    it("should return all pages when totalPages <= maxVisiblePages", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 30,
          itemsPerPage: 10,
          maxVisiblePages: 5,
        }),
      );

      expect(result.current.pageNumbers).toEqual([1, 2, 3]);
    });

    it("should show ellipsis at end when at beginning", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          maxVisiblePages: 5,
        }),
      );

      expect(result.current.pageNumbers).toContain(1);
      expect(result.current.pageNumbers).toContain("...");
      expect(
        result.current.pageNumbers[result.current.pageNumbers.length - 1],
      ).toBe(10);
    });

    it("should show ellipsis at start when at end", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          initialPage: 10,
          maxVisiblePages: 5,
        }),
      );

      expect(result.current.pageNumbers[0]).toBe(1);
      expect(result.current.pageNumbers).toContain("...");
      expect(result.current.pageNumbers).toContain(10);
    });

    it("should show ellipsis at both ends when in middle", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
          initialPage: 5,
          maxVisiblePages: 5,
        }),
      );

      const numbers = result.current.pageNumbers;
      expect(numbers[0]).toBe(1);
      expect(numbers[1]).toBe("...");
      expect(numbers).toContain(5);
      expect(numbers[numbers.length - 1]).toBe(10);
    });
  });

  describe("edge cases", () => {
    it("should handle single page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 5,
          itemsPerPage: 10,
        }),
      );

      expect(result.current.totalPages).toBe(1);
      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(true);
      expect(result.current.pageNumbers).toEqual([1]);
    });

    it("should clamp currentPage when totalItems decreases", () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) =>
          usePagination({
            totalItems,
            itemsPerPage: 10,
            initialPage: 10,
          }),
        { initialProps: { totalItems: 100 } },
      );

      expect(result.current.currentPage).toBe(10);

      rerender({ totalItems: 30 });

      expect(result.current.currentPage).toBeLessThanOrEqual(3);
    });

    it("should handle very large number of items", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 10000,
          itemsPerPage: 10,
        }),
      );

      expect(result.current.totalPages).toBe(1000);
    });

    it("should handle itemsPerPage of 1", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 5,
          itemsPerPage: 1,
        }),
      );

      expect(result.current.totalPages).toBe(5);
    });

    it("should handle goToPage with invalid values", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 50,
          itemsPerPage: 10,
        }),
      );

      act(() => {
        result.current.goToPage(-5);
      });
      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToPage(0);
      });
      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToPage(100);
      });
      expect(result.current.currentPage).toBe(5);
    });
  });

  describe("offset calculation", () => {
    it("should calculate correct offset for each page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          itemsPerPage: 10,
        }),
      );

      expect(result.current.offset).toBe(0);

      act(() => {
        result.current.goToPage(2);
      });
      expect(result.current.offset).toBe(10);

      act(() => {
        result.current.goToPage(5);
      });
      expect(result.current.offset).toBe(40);

      act(() => {
        result.current.goToPage(10);
      });
      expect(result.current.offset).toBe(90);
    });
  });
});
