import { useState, useCallback, useMemo } from "react";
import type { FilterState, FilterValue, ColumnFilterConfig } from "@/components/ui/data-table-filters";

interface UseColumnFiltersOptions<T> {
  initialFilters?: FilterState;
  filterConfigs?: ColumnFilterConfig[];
  debounceMs?: number;
}

interface UseColumnFiltersReturn<T> {
  filters: FilterState;
  setFilter: (id: string, value: FilterValue) => void;
  setFilters: (newFilters: Partial<FilterState>) => void;
  clearFilter: (id: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  filterData: (data: T[], filterFn: (item: T, filters: FilterState) => boolean) => T[];
  getFilter: (id: string) => FilterValue;
}

export function useColumnFilters<T = unknown>(
  options: UseColumnFiltersOptions<T> = {}
): UseColumnFiltersReturn<T> {
  const { initialFilters = {}, filterConfigs = [] } = options;

  const buildInitialState = useCallback((): FilterState => {
    const state: FilterState = { ...initialFilters };
    filterConfigs.forEach((config) => {
      if (!(config.id in state) && config.defaultValue !== undefined) {
        state[config.id] = config.defaultValue;
      }
    });
    return state;
  }, [initialFilters, filterConfigs]);

  const [filters, setFiltersState] = useState<FilterState>(buildInitialState);

  const setFilter = useCallback((id: string, value: FilterValue) => {
    setFiltersState((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const clearFilter = useCallback((id: string) => {
    setFiltersState((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const getFilter = useCallback(
    (id: string): FilterValue => {
      return filters[id];
    },
    [filters]
  );

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== undefined && value !== "" && value !== null
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== "" && value !== null
    ).length;
  }, [filters]);

  const filterData = useCallback(
    (data: T[], filterFn: (item: T, filters: FilterState) => boolean): T[] => {
      if (!hasActiveFilters) {
        return data;
      }
      return data.filter((item) => filterFn(item, filters));
    },
    [filters, hasActiveFilters]
  );

  return {
    filters,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    filterData,
    getFilter,
  };
}

export function matchesTextFilter(
  value: string | undefined | null,
  filter: string | undefined
): boolean {
  if (!filter || filter === "") return true;
  if (!value) return false;
  return value.toLowerCase().includes(filter.toLowerCase());
}

export function matchesExactFilter(
  value: string | undefined | null,
  filter: string | undefined
): boolean {
  if (!filter || filter === "") return true;
  return value === filter;
}

export function matchesMultiFilter(
  value: string | undefined | null,
  filter: string[] | undefined
): boolean {
  if (!filter || filter.length === 0) return true;
  if (!value) return false;
  return filter.includes(value);
}

export function matchesRangeFilter(
  value: number | undefined | null,
  min: number | undefined,
  max: number | undefined
): boolean {
  if (value === undefined || value === null) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

export function createFilterFn<T>(
  fieldFilters: {
    field: keyof T;
    type: "text" | "exact" | "multi";
    filterId: string;
  }[]
): (item: T, filters: FilterState) => boolean {
  return (item: T, filters: FilterState) => {
    for (const { field, type, filterId } of fieldFilters) {
      const filterValue = filters[filterId];
      const fieldValue = item[field];

      if (type === "text") {
        if (!matchesTextFilter(String(fieldValue ?? ""), filterValue as string)) {
          return false;
        }
      } else if (type === "exact") {
        if (!matchesExactFilter(String(fieldValue ?? ""), filterValue as string)) {
          return false;
        }
      } else if (type === "multi") {
        if (!matchesMultiFilter(String(fieldValue ?? ""), filterValue as string[])) {
          return false;
        }
      }
    }
    return true;
  };
}
