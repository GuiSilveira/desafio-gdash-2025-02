import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateSunPosition,
  isDaytime,
  getDaylightDuration,
  formatSunTime,
} from "./sun-position";
import type { WeatherLog } from "@/types/weather";

function createWeatherLog(overrides: Partial<WeatherLog> = {}): WeatherLog {
  return {
    _id: "test-id",
    city: "São Paulo",
    latitude: -23.55,
    longitude: -46.63,
    temperature: 25,
    apparent_temperature: 27,
    humidity: 65,
    wind_speed: 10,
    wind_direction: 180,
    condition: "Clear",
    wmo_code: 0,
    timestamp: new Date().toISOString(),
    sunrise: undefined,
    sunset: undefined,
    daylight_duration: undefined,
    uv_index: 5,
    ...overrides,
  };
}

describe("sun-position utils", () => {
  describe("calculateSunPosition", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 50 when sunrise/sunset are not available", () => {
      const weather = createWeatherLog();
      expect(calculateSunPosition(weather)).toBe(50);
    });

    it("should return 0 when current time is before sunrise", () => {
      const now = new Date("2024-01-15T05:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(calculateSunPosition(weather)).toBe(0);
    });

    it("should return 100 when current time is after sunset", () => {
      const now = new Date("2024-01-15T20:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(calculateSunPosition(weather)).toBe(100);
    });

    it("should return 50 when current time is at midday", () => {
      const now = new Date("2024-01-15T12:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(calculateSunPosition(weather)).toBe(50);
    });

    it("should return 25 when current time is 1/4 through the day", () => {
      const now = new Date("2024-01-15T09:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(calculateSunPosition(weather)).toBe(25);
    });

    it("should return 75 when current time is 3/4 through the day", () => {
      const now = new Date("2024-01-15T15:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(calculateSunPosition(weather)).toBe(75);
    });

    it("should clamp value between 0 and 100", () => {
      const now = new Date("2024-01-15T12:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      const result = calculateSunPosition(weather);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe("isDaytime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true during daytime hours (no sunrise/sunset)", () => {
      const now = new Date("2024-01-15T12:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog();
      expect(isDaytime(weather)).toBe(true);
    });

    it("should return false during nighttime hours (no sunrise/sunset)", () => {
      const now = new Date("2024-01-15T03:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog();
      expect(isDaytime(weather)).toBe(false);
    });

    it("should return true at 6 AM (boundary)", () => {
      const now = new Date("2024-01-15T06:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog();
      expect(isDaytime(weather)).toBe(true);
    });

    it("should return false at 6 PM (boundary)", () => {
      const now = new Date("2024-01-15T18:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog();
      expect(isDaytime(weather)).toBe(false);
    });

    it("should return true when between sunrise and sunset", () => {
      const now = new Date("2024-01-15T12:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(isDaytime(weather)).toBe(true);
    });

    it("should return false when before sunrise", () => {
      const now = new Date("2024-01-15T05:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(isDaytime(weather)).toBe(false);
    });

    it("should return false when after sunset", () => {
      const now = new Date("2024-01-15T19:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(isDaytime(weather)).toBe(false);
    });

    it("should return true exactly at sunrise", () => {
      const now = new Date("2024-01-15T06:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(isDaytime(weather)).toBe(true);
    });

    it("should return true exactly at sunset", () => {
      const now = new Date("2024-01-15T18:00:00");
      vi.setSystemTime(now);

      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(isDaytime(weather)).toBe(true);
    });
  });

  describe("getDaylightDuration", () => {
    it("should return daylight_duration in hours when available", () => {
      const weather = createWeatherLog({
        daylight_duration: 43200,
      });

      expect(getDaylightDuration(weather)).toBe(12);
    });

    it("should calculate duration from sunrise/sunset when daylight_duration not available", () => {
      const weather = createWeatherLog({
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(getDaylightDuration(weather)).toBe(12);
    });

    it("should return 12 as default when no data available", () => {
      const weather = createWeatherLog();
      expect(getDaylightDuration(weather)).toBe(12);
    });

    it("should handle different daylight durations", () => {
      const weather = createWeatherLog({
        sunrise: "2024-06-21T05:00:00",
        sunset: "2024-06-21T20:00:00",
      });

      expect(getDaylightDuration(weather)).toBe(15);
    });

    it("should prefer daylight_duration over calculated value", () => {
      const weather = createWeatherLog({
        daylight_duration: 36000,
        sunrise: "2024-01-15T06:00:00",
        sunset: "2024-01-15T18:00:00",
      });

      expect(getDaylightDuration(weather)).toBe(10);
    });

    it("should handle short winter days", () => {
      const weather = createWeatherLog({
        sunrise: "2024-12-21T07:30:00",
        sunset: "2024-12-21T16:30:00",
      });

      expect(getDaylightDuration(weather)).toBe(9);
    });
  });

  describe("formatSunTime", () => {
    it("should return '--:--' for undefined input", () => {
      expect(formatSunTime(undefined)).toBe("--:--");
    });

    it("should format valid ISO string to HH:MM format", () => {
      const result = formatSunTime("2024-01-15T06:30:00");
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should format morning times correctly", () => {
      const result = formatSunTime("2024-01-15T06:00:00");
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should format evening times correctly", () => {
      const result = formatSunTime("2024-01-15T18:45:00");
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should handle midnight", () => {
      const result = formatSunTime("2024-01-15T00:00:00");
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should handle noon", () => {
      const result = formatSunTime("2024-01-15T12:00:00");
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});
