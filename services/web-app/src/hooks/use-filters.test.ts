import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilters } from "./use-filters";

describe("useFilters hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with empty filters by default", () => {
    const { result } = renderHook(() => useFilters());

    expect(result.current.filters).toEqual({});
    expect(result.current.debouncedFilters).toEqual({});
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("should initialize with provided initial state", () => {
    const initialState = { startDate: "2024-01-01", endDate: "2024-12-31" };
    const { result } = renderHook(() => useFilters(initialState));

    expect(result.current.filters).toEqual(initialState);
    expect(result.current.debouncedFilters).toEqual(initialState);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("should update filter immediately on filters object", () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.updateFilter("startDate", "2024-06-15");
    });

    expect(result.current.filters.startDate).toBe("2024-06-15");
  });

  it("should debounce filter updates for debouncedFilters", async () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.updateFilter("minTemp", 20);
    });

    expect(result.current.debouncedFilters).toEqual({});

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.debouncedFilters.minTemp).toBe(20);
  });

  it("should reset filters to initial state", () => {
    const initialState = { minHumidity: 50 };
    const { result } = renderHook(() => useFilters(initialState));

    act(() => {
      result.current.updateFilter("maxTemp", 35);
      result.current.updateFilter("minHumidity", 80);
    });

    expect(result.current.filters.maxTemp).toBe(35);
    expect(result.current.filters.minHumidity).toBe(80);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual(initialState);
    expect(result.current.debouncedFilters).toEqual(initialState);
  });

  it("should update multiple filters independently", () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.updateFilter("minTemp", 15);
    });

    act(() => {
      result.current.updateFilter("maxTemp", 30);
    });

    expect(result.current.filters.minTemp).toBe(15);
    expect(result.current.filters.maxTemp).toBe(30);
  });

  it("should report hasActiveFilters correctly", async () => {
    const { result } = renderHook(() => useFilters());

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.updateFilter("startDate", "2024-01-01");
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("should handle undefined values", () => {
    const { result } = renderHook(() => useFilters({ startDate: "2024-01-01" }));

    act(() => {
      result.current.updateFilter("startDate", undefined);
    });

    expect(result.current.filters.startDate).toBeUndefined();
  });
});
