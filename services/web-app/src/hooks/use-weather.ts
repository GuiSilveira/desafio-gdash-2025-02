import { useQuery } from "@tanstack/react-query";
import { api } from "@/config/api";
import { API_ENDPOINTS } from "@/constants/api";
import { REFRESH_INTERVALS } from "@/constants/app";
import type {
  WeatherLog,
  WeatherPaginatedResponse,
  WeatherFilters,
} from "@/types/weather";

interface UseWeatherOptions {
  page?: number;
  limit?: number;
  filters?: WeatherFilters;
  enabled?: boolean;
  autoRefresh?: boolean;
}

export function useWeather(options: UseWeatherOptions = {}) {
  const {
    page = 1,
    limit = 25,
    filters = {},
    enabled = true,
    autoRefresh = true,
  } = options;

  return useQuery<WeatherPaginatedResponse>({
    queryKey: ["weather", page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.minTemp !== undefined)
        params.append("minTemp", filters.minTemp.toString());
      if (filters.maxTemp !== undefined)
        params.append("maxTemp", filters.maxTemp.toString());
      if (filters.minHumidity !== undefined)
        params.append("minHumidity", filters.minHumidity.toString());
      if (filters.maxHumidity !== undefined)
        params.append("maxHumidity", filters.maxHumidity.toString());
      if (filters.conditions && filters.conditions.length > 0) {
        params.append("conditions", filters.conditions.join(","));
      }

      const { data } = await api.get(
        `${API_ENDPOINTS.WEATHER_LOGS}?${params.toString()}`
      );
      return data;
    },
    enabled,
    refetchInterval: autoRefresh ? REFRESH_INTERVALS.WEATHER_DATA : false,
    staleTime: 60 * 1000,
  });
}

export function useCurrentWeather() {
  return useQuery<WeatherLog>({
    queryKey: ["weather", "current"],
    queryFn: async () => {
      const { data } = await api.get(
        `${API_ENDPOINTS.WEATHER_LOGS}?limit=1&page=1`
      );
      return data.data[0];
    },
    refetchInterval: REFRESH_INTERVALS.WEATHER_DATA,
    staleTime: 60 * 1000,
  });
}

export function useWeatherLogs(options: { limit?: number } = {}) {
  const { limit = 24 } = options;
  
  return useQuery<WeatherPaginatedResponse>({
    queryKey: ["weather", "logs", limit],
    queryFn: async () => {
      const { data } = await api.get(
        `${API_ENDPOINTS.WEATHER_LOGS}?limit=${limit}&page=1`
      );
      return data;
    },
    refetchInterval: REFRESH_INTERVALS.WEATHER_DATA,
    staleTime: 60 * 1000,
  });
}
