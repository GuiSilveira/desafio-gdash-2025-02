import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  useTableSort,
  createSortComparator,
  type SortDirection,
} from "./use-table-sort";

describe("useTableSort", () => {
  describe("initialization", () => {
    it("should initialize with null sort state by default", () => {
      const { result } = renderHook(() => useTableSort());

      expect(result.current.sortState).toEqual({
        column: null,
        direction: null,
      });
    });

    it("should initialize with provided initial column and direction", () => {
      const { result } = renderHook(() =>
        useTableSort({
          initialColumn: "name",
          initialDirection: "asc",
        })
      );

      expect(result.current.sortState).toEqual({
        column: "name",
        direction: "asc",
      });
    });

    it("should initialize with descending direction", () => {
      const { result } = renderHook(() =>
        useTableSort({
          initialColumn: "date",
          initialDirection: "desc",
        })
      );

      expect(result.current.sortState).toEqual({
        column: "date",
        direction: "desc",
      });
    });
  });

  describe("toggleSort", () => {
    it("should set ascending sort when clicking on unsorted column", () => {
      const { result } = renderHook(() => useTableSort());

      act(() => {
        result.current.toggleSort("name");
      });

      expect(result.current.sortState).toEqual({
        column: "name",
        direction: "asc",
      });
    });

    it("should toggle from ascending to descending", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      act(() => {
        result.current.toggleSort("name");
      });

      expect(result.current.sortState).toEqual({
        column: "name",
        direction: "desc",
      });
    });

    it("should toggle from descending to null when allowUnsorted is true", () => {
      const { result } = renderHook(() =>
        useTableSort({
          initialColumn: "name",
          initialDirection: "desc",
          allowUnsorted: true,
        })
      );

      act(() => {
        result.current.toggleSort("name");
      });

      expect(result.current.sortState).toEqual({
        column: null,
        direction: null,
      });
    });

    it("should toggle from descending to ascending when allowUnsorted is false", () => {
      const { result } = renderHook(() =>
        useTableSort({
          initialColumn: "name",
          initialDirection: "desc",
          allowUnsorted: false,
        })
      );

      act(() => {
        result.current.toggleSort("name");
      });

      expect(result.current.sortState).toEqual({
        column: "name",
        direction: "asc",
      });
    });

    it("should reset to ascending when clicking on a different column", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "desc" })
      );

      act(() => {
        result.current.toggleSort("date");
      });

      expect(result.current.sortState).toEqual({
        column: "date",
        direction: "asc",
      });
    });
  });

  describe("setSort", () => {
    it("should set sort directly", () => {
      const { result } = renderHook(() => useTableSort());

      act(() => {
        result.current.setSort("price", "desc");
      });

      expect(result.current.sortState).toEqual({
        column: "price",
        direction: "desc",
      });
    });

    it("should allow setting null direction", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      act(() => {
        result.current.setSort("name", null);
      });

      expect(result.current.sortState).toEqual({
        column: "name",
        direction: null,
      });
    });
  });

  describe("clearSort", () => {
    it("should clear sort state", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      act(() => {
        result.current.clearSort();
      });

      expect(result.current.sortState).toEqual({
        column: null,
        direction: null,
      });
    });
  });

  describe("isSorted", () => {
    it("should return true for sorted column", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      expect(result.current.isSorted("name")).toBe(true);
    });

    it("should return false for unsorted column", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      expect(result.current.isSorted("date")).toBe(false);
    });

    it("should return false when direction is null", () => {
      const { result } = renderHook(() => useTableSort());

      expect(result.current.isSorted("name")).toBe(false);
    });
  });

  describe("getSortDirection", () => {
    it("should return direction for sorted column", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "desc" })
      );

      expect(result.current.getSortDirection("name")).toBe("desc");
    });

    it("should return null for unsorted column", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      expect(result.current.getSortDirection("date")).toBeNull();
    });
  });

  describe("sortData", () => {
    interface TestItem {
      id: number;
      name: string;
      value: number | null;
      date: Date;
    }

    const testData: TestItem[] = [
      { id: 1, name: "Banana", value: 20, date: new Date("2024-01-15") },
      { id: 2, name: "Apple", value: 10, date: new Date("2024-01-10") },
      { id: 3, name: "Cherry", value: null, date: new Date("2024-01-20") },
      { id: 4, name: "apple", value: 30, date: new Date("2024-01-05") },
    ];

    const getValueFn = (item: TestItem, column: string): unknown => {
      if (column === "name") return item.name;
      if (column === "value") return item.value;
      if (column === "date") return item.date;
      return null;
    };

    it("should not sort when no column is selected", () => {
      const { result } = renderHook(() => useTableSort());

      const sorted = result.current.sortData(testData, getValueFn);

      expect(sorted).toEqual(testData);
    });

    it("should sort strings in ascending order (case-insensitive)", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      const sorted = result.current.sortData(testData, getValueFn);

      expect(sorted[0].name.toLowerCase()).toBe("apple");
      expect(sorted[1].name.toLowerCase()).toBe("apple");
      expect(sorted[2].name).toBe("Banana");
      expect(sorted[3].name).toBe("Cherry");
    });

    it("should sort strings in descending order", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "desc" })
      );

      const sorted = result.current.sortData(testData, getValueFn);

      expect(sorted[0].name).toBe("Cherry");
      expect(sorted[1].name).toBe("Banana");
    });

    it("should sort numbers in ascending order", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "value", initialDirection: "asc" })
      );

      const sorted = result.current.sortData(testData, getValueFn);

      expect(sorted[0].value).toBe(10);
      expect(sorted[1].value).toBe(20);
      expect(sorted[2].value).toBe(30);
      expect(sorted[3].value).toBeNull();
    });

    it("should sort numbers in descending order", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "value", initialDirection: "desc" })
      );

      const sorted = result.current.sortData(testData, getValueFn);

      expect(sorted[0].value).toBe(30);
      expect(sorted[1].value).toBe(20);
      expect(sorted[2].value).toBe(10);
      expect(sorted[3].value).toBeNull();
    });

    it("should sort dates in ascending order", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "date", initialDirection: "asc" })
      );

      const sorted = result.current.sortData(testData, getValueFn);

      expect(sorted[0].id).toBe(4);
      expect(sorted[1].id).toBe(2);
      expect(sorted[2].id).toBe(1);
      expect(sorted[3].id).toBe(3);
    });

    it("should sort dates in descending order", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "date", initialDirection: "desc" })
      );

      const sorted = result.current.sortData(testData, getValueFn);

      expect(sorted[0].id).toBe(3);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(2);
      expect(sorted[3].id).toBe(4);
    });

    it("should not mutate original array", () => {
      const { result } = renderHook(() =>
        useTableSort({ initialColumn: "name", initialDirection: "asc" })
      );

      const originalFirst = testData[0];
      result.current.sortData(testData, getValueFn);

      expect(testData[0]).toBe(originalFirst);
    });
  });
});

describe("createSortComparator", () => {
  it("should return 0 when direction is null", () => {
    const comparator = createSortComparator<{ value: number }>(
      null,
      (item) => item.value
    );

    expect(comparator({ value: 10 }, { value: 20 })).toBe(0);
  });

  it("should sort numbers in ascending order", () => {
    const comparator = createSortComparator<{ value: number }>(
      "asc",
      (item) => item.value
    );

    expect(comparator({ value: 10 }, { value: 20 })).toBeLessThan(0);
    expect(comparator({ value: 20 }, { value: 10 })).toBeGreaterThan(0);
    expect(comparator({ value: 10 }, { value: 10 })).toBe(0);
  });

  it("should sort numbers in descending order", () => {
    const comparator = createSortComparator<{ value: number }>(
      "desc",
      (item) => item.value
    );

    expect(comparator({ value: 10 }, { value: 20 })).toBeGreaterThan(0);
    expect(comparator({ value: 20 }, { value: 10 })).toBeLessThan(0);
  });

  it("should handle null values", () => {
    const comparator = createSortComparator<{ value: number | null }>(
      "asc",
      (item) => item.value
    );

    expect(comparator({ value: 10 }, { value: null })).toBeLessThan(0);
    expect(comparator({ value: null }, { value: 10 })).toBeGreaterThan(0);
    expect(comparator({ value: null }, { value: null })).toBe(0);
  });

  it("should sort strings case-insensitively", () => {
    const comparator = createSortComparator<{ name: string }>(
      "asc",
      (item) => item.name
    );

    expect(comparator({ name: "Apple" }, { name: "banana" })).toBeLessThan(0);
    expect(comparator({ name: "apple" }, { name: "Apple" })).toBe(0);
  });

  it("should sort dates", () => {
    const comparator = createSortComparator<{ date: Date }>(
      "asc",
      (item) => item.date
    );

    const earlier = { date: new Date("2024-01-01") };
    const later = { date: new Date("2024-12-31") };

    expect(comparator(earlier, later)).toBeLessThan(0);
    expect(comparator(later, earlier)).toBeGreaterThan(0);
  });
});
