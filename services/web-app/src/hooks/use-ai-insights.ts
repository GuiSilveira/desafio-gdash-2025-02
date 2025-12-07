import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/config/api";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/constants/api";
import { REFRESH_INTERVALS } from "@/constants/app";
import { aiAutoModeStorage } from "@/utils/storage";
import type { WeatherInsights } from "@/types/weather";

export function useAIInsights() {
  const [isAutoMode, setIsAutoMode] = useState(() => aiAutoModeStorage.get());

  const queryClient = useQueryClient();

  useEffect(() => {
    aiAutoModeStorage.set(isAutoMode);
  }, [isAutoMode]);

  const query = useQuery<WeatherInsights & { lastUpdated: Date }>({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.WEATHER_INSIGHTS);
      return {
        ...data,
        lastUpdated: new Date(),
      };
    },
    refetchInterval: isAutoMode
      ? REFRESH_INTERVALS.AI_INSIGHTS_AUTO
      : REFRESH_INTERVALS.AI_INSIGHTS_MANUAL,
    staleTime: isAutoMode ? 60 * 1000 : Infinity,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.WEATHER_INSIGHTS);
      return {
        ...data,
        lastUpdated: new Date(),
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["ai-insights"], data);
    },
  });

  return {
    insights: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isAutoMode,
    setIsAutoMode,
    generateManually: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    isRefetching: query.isRefetching && !query.isLoading,
    lastUpdated: query.data?.lastUpdated,
  };
}

export function useForecastInsights() {
  const queryClient = useQueryClient();

  const query = useQuery<WeatherInsights & { lastUpdated: Date }>({
    queryKey: ["forecast-insights"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.WEATHER_FORECAST_INSIGHTS);
      return {
        ...data,
        lastUpdated: new Date(),
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.WEATHER_FORECAST_INSIGHTS);
      return {
        ...data,
        lastUpdated: new Date(),
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["forecast-insights"], data);
    },
  });

  return {
    insights: query.data,
    isLoading: query.isLoading,
    error: query.error,
    generateManually: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    lastUpdated: query.data?.lastUpdated,
  };
}
