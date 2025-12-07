import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useWeather, useCurrentWeather, useWeatherLogs } from "./use-weather";
import type { WeatherLog, WeatherPaginatedResponse } from "@/types/weather";

vi.mock("@/config/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "@/config/api";

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
};

const mockPaginatedResponse: WeatherPaginatedResponse = {
  data: [mockWeatherLog],
  total: 1,
  page: 1,
  limit: 25,
  totalPages: 1,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useWeather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch weather data with default options", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    const { result } = renderHook(() => useWeather(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("/weather?page=1&limit=25")
    );
    expect(result.current.data).toEqual(mockPaginatedResponse);
  });

  it("should fetch weather data with custom page and limit", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    renderHook(() => useWeather({ page: 2, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("page=2")
      );
    });

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("limit=10")
    );
  });

  it("should include date filters in query params", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    renderHook(
      () =>
        useWeather({
          filters: {
            startDate: "2024-01-01",
            endDate: "2024-01-31",
          },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-01-01")
      );
    });

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("endDate=2024-01-31")
    );
  });

  it("should include temperature filters in query params", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    renderHook(
      () =>
        useWeather({
          filters: {
            minTemp: 15,
            maxTemp: 30,
          },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("minTemp=15")
      );
    });

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("maxTemp=30")
    );
  });

  it("should include humidity filters in query params", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    renderHook(
      () =>
        useWeather({
          filters: {
            minHumidity: 40,
            maxHumidity: 80,
          },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("minHumidity=40")
      );
    });

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("maxHumidity=80")
    );
  });

  it("should include conditions filter in query params", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    renderHook(
      () =>
        useWeather({
          filters: {
            conditions: ["clear", "cloudy"],
          },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("conditions=clear%2Ccloudy")
      );
    });
  });

  it("should not fetch when enabled is false", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    const { result } = renderHook(() => useWeather({ enabled: false }), {
      wrapper: createWrapper(),
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle error", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useWeather(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it("should not include empty conditions array in query params", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    renderHook(
      () =>
        useWeather({
          filters: {
            conditions: [],
          },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    expect(api.get).not.toHaveBeenCalledWith(
      expect.stringContaining("conditions=")
    );
  });
});

describe("useCurrentWeather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch current weather (first log entry)", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith("/weather?limit=1&page=1");
    expect(result.current.data).toEqual(mockWeatherLog);
  });

  it("should return undefined when no data", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 1, totalPages: 0 },
    });

    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
  });

  it("should handle error", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});

describe("useWeatherLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch weather logs with default limit", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    const { result } = renderHook(() => useWeatherLogs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith("/weather?limit=24&page=1");
  });

  it("should fetch weather logs with custom limit", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    renderHook(() => useWeatherLogs({ limit: 48 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/weather?limit=48&page=1");
    });
  });

  it("should return paginated response", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    const { result } = renderHook(() => useWeatherLogs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockPaginatedResponse);
    });
  });

  it("should handle error", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useWeatherLogs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
