import { describe, it, expect } from "vitest";
import {
  getInitials,
  capitalize,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTemperature,
  formatPercentage,
  formatWindSpeed,
  formatForecastDate,
  formatTime,
  formatDuration,
} from "./format";

describe("format utils", () => {
  describe("getInitials", () => {
    it("should return initials from two-word name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("should return initials from multi-word name", () => {
      expect(getInitials("John Michael Doe")).toBe("JD");
    });

    it("should return first two chars for single-word name", () => {
      expect(getInitials("Alice")).toBe("AL");
    });

    it("should return ?? for empty string", () => {
      expect(getInitials("")).toBe("??");
    });

    it("should handle names with extra spaces", () => {
      expect(getInitials("  John   Doe  ")).toBe("JD");
    });

    it("should uppercase the initials", () => {
      expect(getInitials("john doe")).toBe("JD");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should return empty string for empty input", () => {
      expect(capitalize("")).toBe("");
    });

    it("should handle already capitalized strings", () => {
      expect(capitalize("Hello")).toBe("Hello");
    });

    it("should only capitalize first letter", () => {
      expect(capitalize("hELLO")).toBe("HELLO");
    });
  });

  describe("formatDate", () => {
    it("should format Date object to pt-BR locale", () => {
      const date = new Date("2025-12-06T12:00:00");
      const result = formatDate(date);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should format string date to pt-BR locale", () => {
      const result = formatDate("2025-12-06T12:00:00");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should accept custom options", () => {
      const date = new Date("2025-12-06T12:00:00");
      const result = formatDate(date, { weekday: "long" });
      expect(result).toBeTruthy();
    });
  });

  describe("formatDateTime", () => {
    it("should format Date object with time", () => {
      const date = new Date("2025-12-06T14:30:00");
      const result = formatDateTime(date);
      expect(result).toContain(":");
    });

    it("should format string date with time", () => {
      const result = formatDateTime("2025-12-06T14:30:00");
      expect(result).toContain(":");
    });
  });

  describe("formatNumber", () => {
    it("should format number with default 1 decimal", () => {
      expect(formatNumber(25.567)).toBe("25.6");
    });

    it("should format number with custom decimals", () => {
      expect(formatNumber(25.567, 2)).toBe("25.57");
    });

    it("should format number with 0 decimals", () => {
      expect(formatNumber(25.567, 0)).toBe("26");
    });

    it("should handle negative numbers", () => {
      expect(formatNumber(-5.5, 1)).toBe("-5.5");
    });
  });

  describe("formatTemperature", () => {
    it("should format temperature in Celsius by default", () => {
      expect(formatTemperature(25.5)).toBe("25.5°C");
    });

    it("should format temperature in Fahrenheit", () => {
      expect(formatTemperature(77.0, "F")).toBe("77.0°F");
    });

    it("should handle negative temperatures", () => {
      expect(formatTemperature(-10.5)).toBe("-10.5°C");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage without decimals", () => {
      expect(formatPercentage(65.7)).toBe("66%");
    });

    it("should format 0%", () => {
      expect(formatPercentage(0)).toBe("0%");
    });

    it("should format 100%", () => {
      expect(formatPercentage(100)).toBe("100%");
    });
  });

  describe("formatWindSpeed", () => {
    it("should format wind speed with default unit", () => {
      expect(formatWindSpeed(15.5)).toBe("15.5 km/h");
    });

    it("should format wind speed with custom unit", () => {
      expect(formatWindSpeed(10.0, "m/s")).toBe("10.0 m/s");
    });
  });

  describe("formatForecastDate", () => {
    it("should return day and date object", () => {
      const result = formatForecastDate("2025-12-06");
      expect(result).toHaveProperty("day");
      expect(result).toHaveProperty("date");
    });

    it("should return capitalized day name", () => {
      const result = formatForecastDate("2025-12-06");
      expect(result.day.charAt(0)).toMatch(/[A-Z]/);
    });
  });

  describe("formatTime", () => {
    it("should format time in 12-hour format by default", () => {
      const result = formatTime("2025-12-06T14:30:00");
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });

    it("should format time in 24-hour format", () => {
      const result = formatTime("2025-12-06T14:30:00", false);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it("should return --:-- for undefined", () => {
      expect(formatTime(undefined)).toBe("--:--");
    });
  });

  describe("formatDuration", () => {
    it("should format seconds to hours and minutes", () => {
      expect(formatDuration(3661)).toBe("1h 1m");
    });

    it("should handle exact hours", () => {
      expect(formatDuration(7200)).toBe("2h 0m");
    });

    it("should return fallback for undefined", () => {
      expect(formatDuration(undefined)).toBe("0h 0m");
    });

    it("should return custom fallback", () => {
      expect(formatDuration(undefined, "N/A")).toBe("N/A");
    });

    it("should return fallback for 0", () => {
      expect(formatDuration(0)).toBe("0h 0m");
    });
  });
});
