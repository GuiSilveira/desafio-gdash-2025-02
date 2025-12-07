import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useColumnFilters,
  matchesTextFilter,
  matchesExactFilter,
  matchesMultiFilter,
  matchesRangeFilter,
  createFilterFn,
} from "./use-column-filters";

describe("useColumnFilters", () => {
  it("should initialize with empty filters", () => {
    const { result } = renderHook(() => useColumnFilters());

    expect(result.current.filters).toEqual({});
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("should initialize with initial filters", () => {
    const { result } = renderHook(() =>
      useColumnFilters({ initialFilters: { name: "test" } })
    );

    expect(result.current.filters).toEqual({ name: "test" });
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("should set a single filter", () => {
    const { result } = renderHook(() => useColumnFilters());

    act(() => {
      result.current.setFilter("name", "test");
    });

    expect(result.current.filters.name).toBe("test");
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("should set multiple filters", () => {
    const { result } = renderHook(() => useColumnFilters());

    act(() => {
      result.current.setFilters({ name: "test", role: "admin" });
    });

    expect(result.current.filters.name).toBe("test");
    expect(result.current.filters.role).toBe("admin");
    expect(result.current.activeFilterCount).toBe(2);
  });

  it("should clear a single filter", () => {
    const { result } = renderHook(() =>
      useColumnFilters({ initialFilters: { name: "test", role: "admin" } })
    );

    act(() => {
      result.current.clearFilter("name");
    });

    expect(result.current.filters.name).toBeUndefined();
    expect(result.current.filters.role).toBe("admin");
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("should clear all filters", () => {
    const { result } = renderHook(() =>
      useColumnFilters({ initialFilters: { name: "test", role: "admin" } })
    );

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filters).toEqual({});
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("should get filter value by ID", () => {
    const { result } = renderHook(() =>
      useColumnFilters({ initialFilters: { name: "test" } })
    );

    expect(result.current.getFilter("name")).toBe("test");
    expect(result.current.getFilter("nonexistent")).toBeUndefined();
  });

  it("should filter data using filterData", () => {
    const { result } = renderHook(() =>
      useColumnFilters({ initialFilters: { name: "john" } })
    );

    const data = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Johnny Appleseed" },
    ];

    const filtered = result.current.filterData(data, (item, filters) => {
      if (filters.name) {
        return item.name.toLowerCase().includes((filters.name as string).toLowerCase());
      }
      return true;
    });

    expect(filtered).toHaveLength(2);
    expect(filtered[0].name).toBe("John Doe");
    expect(filtered[1].name).toBe("Johnny Appleseed");
  });

  it("should return all data when no filters are active", () => {
    const { result } = renderHook(() => useColumnFilters());

    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];

    const filtered = result.current.filterData(data, () => false);

    expect(filtered).toHaveLength(2);
  });

  it("should not count empty string as active filter", () => {
    const { result } = renderHook(() => useColumnFilters());

    act(() => {
      result.current.setFilter("name", "");
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("should use default values from filterConfigs", () => {
    const { result } = renderHook(() =>
      useColumnFilters({
        filterConfigs: [
          { id: "status", label: "Status", type: "select", defaultValue: "active" },
        ],
      })
    );

    expect(result.current.filters.status).toBe("active");
  });
});

describe("matchesTextFilter", () => {
  it("should return true when filter is empty", () => {
    expect(matchesTextFilter("any value", "")).toBe(true);
    expect(matchesTextFilter("any value", undefined)).toBe(true);
  });

  it("should return false when value is null or undefined", () => {
    expect(matchesTextFilter(null, "filter")).toBe(false);
    expect(matchesTextFilter(undefined, "filter")).toBe(false);
  });

  it("should match case-insensitively", () => {
    expect(matchesTextFilter("John Doe", "john")).toBe(true);
    expect(matchesTextFilter("john doe", "JOHN")).toBe(true);
  });

  it("should match partial strings", () => {
    expect(matchesTextFilter("John Doe", "ohn")).toBe(true);
    expect(matchesTextFilter("John Doe", "Doe")).toBe(true);
  });

  it("should return false when no match", () => {
    expect(matchesTextFilter("John Doe", "Smith")).toBe(false);
  });
});

describe("matchesExactFilter", () => {
  it("should return true when filter is empty", () => {
    expect(matchesExactFilter("any value", "")).toBe(true);
    expect(matchesExactFilter("any value", undefined)).toBe(true);
  });

  it("should match exactly", () => {
    expect(matchesExactFilter("admin", "admin")).toBe(true);
    expect(matchesExactFilter("admin", "Admin")).toBe(false);
  });

  it("should return false when no match", () => {
    expect(matchesExactFilter("admin", "user")).toBe(false);
  });
});

describe("matchesMultiFilter", () => {
  it("should return true when filter is empty", () => {
    expect(matchesMultiFilter("any value", [])).toBe(true);
    expect(matchesMultiFilter("any value", undefined)).toBe(true);
  });

  it("should return true when value is in filter array", () => {
    expect(matchesMultiFilter("admin", ["admin", "user"])).toBe(true);
  });

  it("should return false when value is not in filter array", () => {
    expect(matchesMultiFilter("guest", ["admin", "user"])).toBe(false);
  });

  it("should return false when value is null or undefined", () => {
    expect(matchesMultiFilter(null, ["admin"])).toBe(false);
    expect(matchesMultiFilter(undefined, ["admin"])).toBe(false);
  });
});

describe("matchesRangeFilter", () => {
  it("should return true when value is within range", () => {
    expect(matchesRangeFilter(5, 0, 10)).toBe(true);
    expect(matchesRangeFilter(0, 0, 10)).toBe(true);
    expect(matchesRangeFilter(10, 0, 10)).toBe(true);
  });

  it("should return false when value is outside range", () => {
    expect(matchesRangeFilter(-1, 0, 10)).toBe(false);
    expect(matchesRangeFilter(11, 0, 10)).toBe(false);
  });

  it("should handle undefined min or max", () => {
    expect(matchesRangeFilter(5, undefined, 10)).toBe(true);
    expect(matchesRangeFilter(5, 0, undefined)).toBe(true);
    expect(matchesRangeFilter(5, undefined, undefined)).toBe(true);
  });

  it("should return false when value is null or undefined", () => {
    expect(matchesRangeFilter(null, 0, 10)).toBe(false);
    expect(matchesRangeFilter(undefined, 0, 10)).toBe(false);
  });
});

describe("createFilterFn", () => {
  interface TestItem {
    name: string;
    role: string;
    status: string;
  }

  it("should create a filter function for text filters", () => {
    const filterFn = createFilterFn<TestItem>([
      { field: "name", type: "text", filterId: "name" },
    ]);

    const item: TestItem = { name: "John Doe", role: "admin", status: "active" };

    expect(filterFn(item, { name: "john" })).toBe(true);
    expect(filterFn(item, { name: "jane" })).toBe(false);
    expect(filterFn(item, {})).toBe(true);
  });

  it("should create a filter function for exact filters", () => {
    const filterFn = createFilterFn<TestItem>([
      { field: "role", type: "exact", filterId: "role" },
    ]);

    const item: TestItem = { name: "John", role: "admin", status: "active" };

    expect(filterFn(item, { role: "admin" })).toBe(true);
    expect(filterFn(item, { role: "user" })).toBe(false);
  });

  it("should combine multiple filters", () => {
    const filterFn = createFilterFn<TestItem>([
      { field: "name", type: "text", filterId: "name" },
      { field: "role", type: "exact", filterId: "role" },
    ]);

    const item: TestItem = { name: "John Doe", role: "admin", status: "active" };

    expect(filterFn(item, { name: "john", role: "admin" })).toBe(true);
    expect(filterFn(item, { name: "john", role: "user" })).toBe(false);
    expect(filterFn(item, { name: "jane", role: "admin" })).toBe(false);
  });
});
