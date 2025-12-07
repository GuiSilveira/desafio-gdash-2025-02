import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useAIInsights, useForecastInsights } from "./use-ai-insights";
import type { WeatherInsights } from "@/types/weather";

vi.mock("@/config/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock("@/utils/storage", () => ({
  aiAutoModeStorage: {
    get: vi.fn(() => false),
    set: vi.fn(),
  },
}));

import { api } from "@/config/api";
import { aiAutoModeStorage } from "@/utils/storage";

const mockInsights: WeatherInsights = {
  summary: "Dia ensolarado com temperaturas agradáveis",
  trend: "stable",
  alert: false,
  comfortScore: 85,
  tags: ["ensolarado", "confortável"],
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

describe("useAIInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(aiAutoModeStorage.get).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should load auto mode preference from storage", () => {
      vi.mocked(aiAutoModeStorage.get).mockReturnValue(true);
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      expect(aiAutoModeStorage.get).toHaveBeenCalled();
      expect(result.current.isAutoMode).toBe(true);
    });

    it("should default to false when storage returns false", () => {
      vi.mocked(aiAutoModeStorage.get).mockReturnValue(false);
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isAutoMode).toBe(false);
    });
  });

  describe("fetching insights", () => {
    it("should fetch insights on mount", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(api.get).toHaveBeenCalledWith("/weather/insights");
      expect(result.current.insights?.summary).toBe(mockInsights.summary);
    });

    it("should set loading state while fetching", () => {
      vi.mocked(api.get).mockImplementation(
        () => new Promise(() => {}),
      );

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("should handle fetch error", async () => {
      const error = new Error("API Error");
      vi.mocked(api.get).mockRejectedValue(error);

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it("should include lastUpdated in insights", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.insights?.lastUpdated).toBeInstanceOf(Date);
      });
    });
  });

  describe("auto mode toggle", () => {
    it("should save preference to storage when toggling auto mode", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setIsAutoMode(true);
      });

      await waitFor(() => {
        expect(aiAutoModeStorage.set).toHaveBeenCalledWith(true);
      });
    });

    it("should update isAutoMode state", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isAutoMode).toBe(false);

      act(() => {
        result.current.setIsAutoMode(true);
      });

      expect(result.current.isAutoMode).toBe(true);
    });
  });

  describe("manual generation", () => {
    it("should have generateManually function", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.generateManually).toBe("function");
    });

    it("should set isGenerating while generating", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it("should call API and update cache when generateManually is called", async () => {
      const updatedInsights: WeatherInsights = {
        summary: "Clima atualizado manualmente",
        trend: "up",
        alert: true,
        comfortScore: 90,
        tags: ["atualizado"],
      };

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockInsights })
        .mockResolvedValueOnce({ data: updatedInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.generateManually();
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2);
        expect(api.get).toHaveBeenLastCalledWith("/weather/insights");
      });

      await waitFor(() => {
        expect(result.current.insights?.summary).toBe(updatedInsights.summary);
      });
    });

    it("should set isGenerating to true during mutation", async () => {
      let resolveGenerate: (value: unknown) => void;
      const generatePromise = new Promise((resolve) => {
        resolveGenerate = resolve;
      });

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockInsights })
        .mockReturnValueOnce(generatePromise as ReturnType<typeof api.get>);

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.generateManually();
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });

      act(() => {
        resolveGenerate!({ data: mockInsights });
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });
  });

  describe("returned values", () => {
    it("should return all expected properties", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useAIInsights(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty("insights");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("isAutoMode");
      expect(result.current).toHaveProperty("setIsAutoMode");
      expect(result.current).toHaveProperty("generateManually");
      expect(result.current).toHaveProperty("isGenerating");
      expect(result.current).toHaveProperty("isRefetching");
      expect(result.current).toHaveProperty("lastUpdated");
    });
  });
});

describe("useForecastInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetching forecast insights", () => {
    it("should fetch forecast insights on mount", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(api.get).toHaveBeenCalledWith("/weather/forecast-insights");
    });

    it("should set loading state while fetching", () => {
      vi.mocked(api.get).mockImplementation(
        () => new Promise(() => {}),
      );

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("should handle fetch error", async () => {
      const error = new Error("API Error");
      vi.mocked(api.get).mockRejectedValue(error);

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it("should include lastUpdated in insights", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.insights?.lastUpdated).toBeInstanceOf(Date);
      });
    });
  });

  describe("manual generation", () => {
    it("should have generateManually function", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.generateManually).toBe("function");
    });

    it("should call API and update cache when generateManually is called", async () => {
      const updatedInsights: WeatherInsights = {
        summary: "Previsão atualizada manualmente",
        trend: "down",
        alert: false,
        comfortScore: 75,
        tags: ["previsão", "atualizado"],
      };

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockInsights })
        .mockResolvedValueOnce({ data: updatedInsights });

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.generateManually();
      });

      await waitFor(() => {
        expect(api.get).toHaveBeenLastCalledWith("/weather/forecast-insights");
      });

      await waitFor(() => {
        expect(result.current.insights?.summary).toBe(updatedInsights.summary);
      });
    });

    it("should set isGenerating during mutation", async () => {
      let resolveGenerate: (value: unknown) => void;
      const generatePromise = new Promise((resolve) => {
        resolveGenerate = resolve;
      });

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: mockInsights })
        .mockReturnValueOnce(generatePromise as ReturnType<typeof api.get>);

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.generateManually();
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });

      act(() => {
        resolveGenerate!({ data: mockInsights });
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });
  });

  describe("returned values", () => {
    it("should return all expected properties", async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockInsights });

      const { result } = renderHook(() => useForecastInsights(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty("insights");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("generateManually");
      expect(result.current).toHaveProperty("isGenerating");
      expect(result.current).toHaveProperty("lastUpdated");
    });
  });
});
