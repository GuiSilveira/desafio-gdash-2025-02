import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHourlyChartData } from "./use-hourly-chart-data";
import type { WeatherLog, WeatherPaginatedResponse } from "@/types/weather";

type MockQueryResult = {
  data: WeatherPaginatedResponse | undefined;
  isLoading: boolean;
};

function createMockQueryResult(
  data: WeatherPaginatedResponse | undefined,
  isLoading: boolean
): MockQueryResult {
  return { data, isLoading };
}

vi.mock("@/hooks/use-weather", () => ({
  useWeatherLogs: vi.fn(),
}));

import { useWeatherLogs } from "@/hooks/use-weather";

const mockWeatherLog: WeatherLog = {
  _id: "log-1",
  location: "São Paulo",
  collected_at: "2024-01-01T12:00:00Z",
  createdAt: "2024-01-01T12:00:00Z",
  updatedAt: "2024-01-01T12:00:00Z",
  temperature: 25,
  humidity: 60,
  wind_speed: 10,
  condition: "clear",
  weather_code: 0,
  hourly_time: [
    "2024-01-01T00:00:00Z",
    "2024-01-01T01:00:00Z",
    "2024-01-01T02:00:00Z",
    "2024-01-01T03:00:00Z",
    "2024-01-01T04:00:00Z",
    "2024-01-01T05:00:00Z",
    "2024-01-01T06:00:00Z",
    "2024-01-01T07:00:00Z",
    "2024-01-01T08:00:00Z",
    "2024-01-01T09:00:00Z",
    "2024-01-01T10:00:00Z",
    "2024-01-01T11:00:00Z",
    "2024-01-01T12:00:00Z",
    "2024-01-01T13:00:00Z",
    "2024-01-01T14:00:00Z",
    "2024-01-01T15:00:00Z",
    "2024-01-01T16:00:00Z",
    "2024-01-01T17:00:00Z",
    "2024-01-01T18:00:00Z",
    "2024-01-01T19:00:00Z",
    "2024-01-01T20:00:00Z",
    "2024-01-01T21:00:00Z",
    "2024-01-01T22:00:00Z",
    "2024-01-01T23:00:00Z",
  ],
  hourly_temperature: [
    18, 17, 16, 15, 15, 16, 18, 20, 22, 24, 26, 27, 28, 28, 27, 26, 25, 24, 22,
    21, 20, 19, 18, 17,
  ],
  hourly_precipitation_probability: [
    10, 10, 15, 20, 25, 30, 35, 30, 25, 20, 15, 10, 5, 5, 10, 15, 20, 25, 30, 35,
    40, 45, 50, 55,
  ],
  hourly_uv_index: [
    0, 0, 0, 0, 0, 1, 2, 4, 6, 8, 9, 10, 10, 9, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0,
  ],
  hourly_us_aqi: [
    30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60, 58, 55, 52, 50, 48, 45,
    42, 40, 38, 35, 32,
  ],
};

const mockResponse: WeatherPaginatedResponse = {
  data: [mockWeatherLog],
  total: 1,
  page: 1,
  limit: 1,
  totalPages: 1,
};

describe("useHourlyChartData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when loading", () => {
    it("should return loading state", () => {
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(undefined, true)
      );

      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hasData).toBe(false);
    });
  });

  describe("when data is loaded", () => {
    beforeEach(() => {
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(mockResponse, false)
      );
    });

    it("should return hasData as true when data exists", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.hasData).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it("should transform hourly data into chart data points", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.chartData.length).toBe(24);
      expect(result.current.chartData[0]).toHaveProperty("hour");
      expect(result.current.chartData[0]).toHaveProperty("hourNum");
      expect(result.current.chartData[0]).toHaveProperty("temperature");
      expect(result.current.chartData[0]).toHaveProperty("precipitation");
      expect(result.current.chartData[0]).toHaveProperty("uv");
      expect(result.current.chartData[0]).toHaveProperty("aqi");
    });

    it("should return correct current tab for temperature", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.currentTab.id).toBe("temperature");
      expect(result.current.currentTab.label).toBe("Temperatura");
      expect(result.current.currentTab.dataKey).toBe("temperature");
      expect(result.current.currentTab.unit).toBe("°C");
    });

    it("should return correct current tab for rain", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "rain", timeRange: "24h" })
      );

      expect(result.current.currentTab.id).toBe("rain");
      expect(result.current.currentTab.label).toBe("Chuva");
      expect(result.current.currentTab.dataKey).toBe("precipitation");
    });

    it("should return correct current tab for uv", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "uv", timeRange: "24h" })
      );

      expect(result.current.currentTab.id).toBe("uv");
      expect(result.current.currentTab.label).toBe("UV");
      expect(result.current.currentTab.dataKey).toBe("uv");
    });

    it("should return correct current tab for aqi", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "aqi", timeRange: "24h" })
      );

      expect(result.current.currentTab.id).toBe("aqi");
      expect(result.current.currentTab.label).toBe("Qualidade do Ar");
      expect(result.current.currentTab.dataKey).toBe("aqi");
    });

    it("should return correct time range for 24h", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.currentTimeRange.id).toBe("24h");
      expect(result.current.currentTimeRange.hours).toBe(24);
    });

    it("should return correct time range for 12h", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "12h" })
      );

      expect(result.current.currentTimeRange.id).toBe("12h");
      expect(result.current.currentTimeRange.hours).toBe(12);
    });

    it("should return correct time range for 6h", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "6h" })
      );

      expect(result.current.currentTimeRange.id).toBe("6h");
      expect(result.current.currentTimeRange.hours).toBe(6);
    });

    it("should calculate stats correctly for temperature", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.stats.min).toBe(15);
      expect(result.current.stats.max).toBe(28);
      expect(result.current.stats.avg).toBeGreaterThan(0);
    });

    it("should calculate stats correctly for precipitation", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "rain", timeRange: "24h" })
      );

      expect(result.current.stats.min).toBe(5);
      expect(result.current.stats.max).toBe(55);
      expect(result.current.stats.avg).toBeGreaterThan(0);
    });

    it("should calculate stats correctly for uv", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "uv", timeRange: "24h" })
      );

      expect(result.current.stats.min).toBe(0);
      expect(result.current.stats.max).toBe(10);
    });

    it("should calculate stats correctly for aqi", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "aqi", timeRange: "24h" })
      );

      expect(result.current.stats.min).toBe(30);
      expect(result.current.stats.max).toBe(60);
    });
  });

  describe("when data is empty", () => {
    it("should return empty chart data when no logs exist", () => {
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(
          { data: [], total: 0, page: 1, limit: 1, totalPages: 0 },
          false
        )
      );

      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.chartData).toEqual([]);
      expect(result.current.hasData).toBe(false);
    });

    it("should return empty chart data when hourly_time is missing", () => {
      const logWithoutHourly = { ...mockWeatherLog, hourly_time: undefined };
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(
          { data: [logWithoutHourly as WeatherLog], total: 1, page: 1, limit: 1, totalPages: 1 },
          false
        )
      );

      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.chartData).toEqual([]);
      expect(result.current.hasData).toBe(false);
    });

    it("should return empty chart data when hourly_time is empty array", () => {
      const logWithEmptyHourly = { ...mockWeatherLog, hourly_time: [] };
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(
          { data: [logWithEmptyHourly], total: 1, page: 1, limit: 1, totalPages: 1 },
          false
        )
      );

      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.chartData).toEqual([]);
      expect(result.current.hasData).toBe(false);
    });

    it("should return zero stats when no data", () => {
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(
          { data: [], total: 0, page: 1, limit: 1, totalPages: 0 },
          false
        )
      );

      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.stats).toEqual({ min: 0, max: 0, avg: 0 });
    });
  });

  describe("default fallbacks", () => {
    beforeEach(() => {
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(mockResponse, false)
      );
    });

    it("should fallback to first tab when invalid activeTab", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "invalid" as "temperature", timeRange: "24h" })
      );

      expect(result.current.currentTab.id).toBe("temperature");
    });

    it("should fallback to 24h when invalid timeRange", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "invalid" as "24h" })
      );

      expect(result.current.currentTimeRange.id).toBe("24h");
    });
  });

  describe("data transformation", () => {
    beforeEach(() => {
      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(mockResponse, false)
      );
    });

    it("should format hour as HH:00", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.chartData[0].hour).toMatch(/^\d{2}:00$/);
    });

    it("should include original time in data points", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      expect(result.current.chartData[0].time).toBe("2024-01-01T00:00:00Z");
    });

    it("should round temperature to integer", () => {
      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "24h" })
      );

      result.current.chartData.forEach((point) => {
        expect(Number.isInteger(point.temperature)).toBe(true);
      });
    });
  });

  describe("time range filtering with midnight wraparound", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("should filter data correctly when time range wraps around midnight", () => {
      const now = new Date();

      const hourlyTimeLocal: string[] = [];
      for (let i = 0; i < 24; i++) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i, 0, 0, 0);
        hourlyTimeLocal.push(date.toISOString());
      }

      const mockLogLocal: WeatherLog = {
        ...mockWeatherLog,
        hourly_time: hourlyTimeLocal,
      };

      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(
          { data: [mockLogLocal], total: 1, page: 1, limit: 1, totalPages: 1 },
          false
        )
      );

      vi.useFakeTimers();
      const mockTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0, 0);
      vi.setSystemTime(mockTime);

      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "6h" })
      );

      const hours = result.current.chartData.map((d) => d.hourNum);

      expect(result.current.chartData.length).toBeGreaterThan(0);

      hours.forEach((hour) => {
        expect(hour >= 22 || hour < 4).toBe(true);
      });
    });

    it("should filter data correctly when time range does not wrap around midnight", () => {
      const now = new Date();

      const hourlyTimeLocal: string[] = [];
      for (let i = 0; i < 24; i++) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i, 0, 0, 0);
        hourlyTimeLocal.push(date.toISOString());
      }

      const mockLogLocal: WeatherLog = {
        ...mockWeatherLog,
        hourly_time: hourlyTimeLocal,
      };

      vi.mocked(useWeatherLogs).mockReturnValue(
        createMockQueryResult<WeatherPaginatedResponse>(
          { data: [mockLogLocal], total: 1, page: 1, limit: 1, totalPages: 1 },
          false
        )
      );

      vi.useFakeTimers();
      const mockTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0);
      vi.setSystemTime(mockTime);

      const { result } = renderHook(() =>
        useHourlyChartData({ activeTab: "temperature", timeRange: "6h" })
      );

      const hours = result.current.chartData.map((d) => d.hourNum);

      expect(result.current.chartData.length).toBeGreaterThan(0);

      hours.forEach((hour) => {
        expect(hour >= 10 && hour < 16).toBe(true);
      });
    });
  });
});
