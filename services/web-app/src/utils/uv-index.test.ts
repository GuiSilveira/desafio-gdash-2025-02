import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkIsNightTime,
  calculateUVStats,
  getUVLevel,
  getUVRecommendation,
  getUVBarColor,
  getUVRiskDescription,
} from "./uv-index";
import type { WeatherLog } from "@/types/weather";

function createMockWeatherLog(overrides: Partial<WeatherLog> = {}): WeatherLog {
  return {
    _id: "test-id",
    city: "Test City",
    country: "Test Country",
    latitude: 0,
    longitude: 0,
    temperature: 25,
    humidity: 50,
    weather_code: 0,
    wind_speed: 10,
    timestamp: new Date().toISOString(),
    uv_index: 5,
    ...overrides,
  } as WeatherLog;
}

describe("uv-index utils", () => {
  describe("checkIsNightTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true when current time is before sunrise", () => {
      vi.setSystemTime(new Date("2024-01-15T05:00:00"));
      
      const weather = createMockWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(checkIsNightTime(weather)).toBe(true);
    });

    it("should return true when current time is after sunset", () => {
      vi.setSystemTime(new Date("2024-01-15T20:00:00"));
      
      const weather = createMockWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(checkIsNightTime(weather)).toBe(true);
    });

    it("should return false during daytime", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00"));
      
      const weather = createMockWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(checkIsNightTime(weather)).toBe(false);
    });

    it("should fallback to hour check when no sunrise/sunset", () => {
      vi.setSystemTime(new Date("2024-01-15T20:00:00"));
      
      const weather = createMockWeatherLog({
        sunrise: undefined,
        sunset: undefined,
      });

      expect(checkIsNightTime(weather)).toBe(true);
    });

    it("should fallback to hour check - early morning", () => {
      vi.setSystemTime(new Date("2024-01-15T04:00:00"));
      
      const weather = createMockWeatherLog({
        sunrise: undefined,
        sunset: undefined,
      });

      expect(checkIsNightTime(weather)).toBe(true);
    });

    it("should fallback to hour check - daytime", () => {
      vi.setSystemTime(new Date("2024-01-15T12:00:00"));
      
      const weather = createMockWeatherLog({
        sunrise: undefined,
        sunset: undefined,
      });

      expect(checkIsNightTime(weather)).toBe(false);
    });
  });

  describe("calculateUVStats", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should calculate stats from hourly UV data", () => {
      vi.setSystemTime(new Date("2024-01-15T14:00:00"));
      
      const hourlyUV = Array(24).fill(0).map((_, i) => {
        if (i >= 6 && i <= 18) {
          return Math.sin(((i - 6) / 12) * Math.PI) * 10;
        }
        return 0;
      });
      
      const weather = createMockWeatherLog({
        hourly_uv_index: hourlyUV,
        uv_index: 8,
      });

      const stats = calculateUVStats(weather);
      
      expect(stats.max).toBeGreaterThan(0);
      expect(stats.maxHour).toBeGreaterThanOrEqual(0);
      expect(stats.maxHour).toBeLessThan(24);
      expect(stats.hourlyData).toBeDefined();
    });

    it("should return fallback when no hourly data", () => {
      const weather = createMockWeatherLog({
        hourly_uv_index: undefined,
        uv_index: 5,
      });

      const stats = calculateUVStats(weather);
      
      expect(stats.max).toBe(0);
      expect(stats.maxHour).toBe(12);
      expect(stats.current).toBe(5);
    });

    it("should return fallback for empty hourly data", () => {
      const weather = createMockWeatherLog({
        hourly_uv_index: [],
        uv_index: 3,
      });

      const stats = calculateUVStats(weather);
      
      expect(stats.max).toBe(0);
      expect(stats.maxHour).toBe(12);
      expect(stats.current).toBe(3);
    });
  });

  describe("getUVLevel", () => {
    it('should return "Noite" for night time', () => {
      const level = getUVLevel(5, true);
      expect(level.label).toBe("Noite");
      expect(level.bgColor).toContain("indigo");
    });

    it('should return "Nenhum" for UV 0 or undefined', () => {
      expect(getUVLevel(0, false).label).toBe("Nenhum");
      expect(getUVLevel(undefined, false).label).toBe("Nenhum");
    });

    it('should return "Baixo" for UV 1-2', () => {
      expect(getUVLevel(1, false).label).toBe("Baixo");
      expect(getUVLevel(2, false).label).toBe("Baixo");
    });

    it('should return "Moderado" for UV 3-5', () => {
      expect(getUVLevel(3, false).label).toBe("Moderado");
      expect(getUVLevel(5, false).label).toBe("Moderado");
    });

    it('should return "Alto" for UV 6-7', () => {
      expect(getUVLevel(6, false).label).toBe("Alto");
      expect(getUVLevel(7, false).label).toBe("Alto");
    });

    it('should return "Muito Alto" for UV 8-10', () => {
      expect(getUVLevel(8, false).label).toBe("Muito Alto");
      expect(getUVLevel(10, false).label).toBe("Muito Alto");
    });

    it('should return "Extremo" for UV > 10', () => {
      expect(getUVLevel(11, false).label).toBe("Extremo");
      expect(getUVLevel(15, false).label).toBe("Extremo");
    });

    it('should return last level for very high UV values (fallback)', () => {
      const level = getUVLevel(100, false);
      expect(level.label).toBe("Extremo");
      expect(level.bgColor).toContain("purple");
    });
  });

  describe("getUVRecommendation", () => {
    it("should return night recommendation when isNight is true", () => {
      const rec = getUVRecommendation(5, true);
      expect(rec.title).toBe("Boa Noite!");
      expect(rec.text).toContain("Sem radiação UV");
    });

    it("should return appropriate recommendation for low UV", () => {
      const rec = getUVRecommendation(1, false);
      expect(rec.title).toBe("Aproveite o Sol!");
    });

    it("should return appropriate recommendation for moderate UV", () => {
      const rec = getUVRecommendation(4, false);
      expect(rec.title).toBe("Proteção Leve");
    });

    it("should return appropriate recommendation for high UV", () => {
      const rec = getUVRecommendation(6, false);
      expect(rec.title).toBe("Hora do Protetor!");
    });

    it("should return appropriate recommendation for very high UV", () => {
      const rec = getUVRecommendation(9, false);
      expect(rec.title).toBe("Proteção Máxima!");
    });

    it("should return extreme recommendation for UV > 10", () => {
      const rec = getUVRecommendation(12, false);
      expect(rec.title).toBe("Perigo Extremo!");
    });
  });

  describe("getUVBarColor", () => {
    it("should return night color when isNight is true", () => {
      const color = getUVBarColor(1, 5, true);
      expect(color).toContain("indigo");
    });

    it("should return empty bar color when index > uvValue", () => {
      const color = getUVBarColor(10, 5, false);
      expect(color).toContain("slate");
    });

    it("should return green gradient for low UV", () => {
      const color = getUVBarColor(1, 2, false);
      expect(color).toContain("green");
    });

    it("should return lime gradient for moderate UV", () => {
      const color = getUVBarColor(1, 4, false);
      expect(color).toContain("lime");
    });

    it("should return orange gradient for high UV", () => {
      const color = getUVBarColor(1, 7, false);
      expect(color).toContain("orange");
    });

    it("should return red gradient for very high UV", () => {
      const color = getUVBarColor(1, 9, false);
      expect(color).toContain("red");
    });

    it("should return purple gradient for extreme UV", () => {
      const color = getUVBarColor(1, 12, false);
      expect(color).toContain("purple");
    });
  });

  describe("getUVRiskDescription", () => {
    it("should return night description when isNight is true", () => {
      const desc = getUVRiskDescription(5, true);
      expect(desc).toBe("Sem radiação UV no momento");
    });

    it("should return low risk for UV <= 2", () => {
      const desc = getUVRiskDescription(2, false);
      expect(desc).toContain("Baixo risco");
    });

    it("should return moderate risk for UV 3-5", () => {
      const desc = getUVRiskDescription(4, false);
      expect(desc).toContain("moderado");
    });

    it("should return high risk for UV 6-7", () => {
      const desc = getUVRiskDescription(7, false);
      expect(desc).toContain("Alto risco");
    });

    it("should return very high risk for UV 8-10", () => {
      const desc = getUVRiskDescription(9, false);
      expect(desc).toContain("muito alto");
    });

    it("should return extreme risk for UV > 10", () => {
      const desc = getUVRiskDescription(12, false);
      expect(desc).toContain("extremo");
    });
  });
});
