import { useState } from "react";
import { useDebounce } from "react-use";
import type { WeatherFilters } from "@/types/weather";

export function useFilters(initialState: WeatherFilters = {}) {
  const [filters, setFilters] = useState<WeatherFilters>(initialState);
  const [debouncedFilters, setDebouncedFilters] =
    useState<WeatherFilters>(initialState);

  useDebounce(
    () => {
      setDebouncedFilters(filters);
    },
    500,
    [filters]
  );

  const updateFilter = <K extends keyof WeatherFilters>(
    key: K,
    value: WeatherFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialState);
    setDebouncedFilters(initialState);
  };

  const hasActiveFilters = () => {
    return Object.keys(debouncedFilters).length > 0;
  };

  return {
    filters,
    debouncedFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters: hasActiveFilters(),
  };
}
