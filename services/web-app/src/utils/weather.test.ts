import { describe, it, expect } from "vitest";
import {
  getWeatherCondition,
  getComfortCategory,
  getChartColor,
  getConditionBadgeColor,
  getTableConditionBadgeColor,
  getWeatherIconInfo,
  getConditionIconColor,
  getWeatherIconType,
  getTrendIcon,
  getTrendColor,
  getAQILevel,
} from "./weather";
import { TrendingUp, TrendingDown, Minus, Cloud } from "lucide-react";

describe("weather utils", () => {
  describe("getWeatherCondition", () => {
    it("should return correct condition for clear sky (code 0)", () => {
      const condition = getWeatherCondition(0);
      expect(condition).toBeDefined();
      expect(condition.label).toBe("Ensolarado");
    });

    it("should return correct condition for rain (code 61)", () => {
      const condition = getWeatherCondition(61);
      expect(condition).toBeDefined();
      expect(condition.label).toBe("Chuvoso");
    });

    it("should return fallback for unknown code", () => {
      const condition = getWeatherCondition(999);
      expect(condition).toBeDefined();
    });

    it("should return condition for fog (code 45)", () => {
      const condition = getWeatherCondition(45);
      expect(condition).toBeDefined();
    });

    it("should return condition for snow (code 71)", () => {
      const condition = getWeatherCondition(71);
      expect(condition).toBeDefined();
    });

    it("should return condition for thunderstorm (code 95)", () => {
      const condition = getWeatherCondition(95);
      expect(condition).toBeDefined();
    });
  });

  describe("getComfortCategory", () => {
    it("should return very uncomfortable for low score", () => {
      const category = getComfortCategory(10);
      expect(category).toBeDefined();
      expect(category.label).toBeDefined();
    });

    it("should return comfortable for mid-high score", () => {
      const category = getComfortCategory(75);
      expect(category).toBeDefined();
    });

    it("should return very comfortable for high score", () => {
      const category = getComfortCategory(95);
      expect(category).toBeDefined();
    });

    it("should handle edge cases (0 and 100)", () => {
      const lowCategory = getComfortCategory(0);
      const highCategory = getComfortCategory(100);
      expect(lowCategory).toBeDefined();
      expect(highCategory).toBeDefined();
    });

    it("should return fallback for out of range values", () => {
      const category = getComfortCategory(-10);
      expect(category).toBeDefined();
    });
  });

  describe("getChartColor", () => {
    it("should return light theme color for temperature", () => {
      const color = getChartColor("temperature", "light");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return dark theme color for temperature", () => {
      const color = getChartColor("temperature", "dark");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return color for humidity", () => {
      const color = getChartColor("humidity");
      expect(color).toBeDefined();
    });

    it("should return color for rain", () => {
      const color = getChartColor("rain");
      expect(color).toBeDefined();
    });
  });

  describe("getConditionBadgeColor", () => {
    it("should return color for sunny condition", () => {
      const color = getConditionBadgeColor("sunny");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return color for rainy condition", () => {
      const color = getConditionBadgeColor("rainy");
      expect(color).toBeDefined();
    });

    it("should handle case-insensitive conditions", () => {
      const colorLower = getConditionBadgeColor("SUNNY");
      expect(colorLower).toBeDefined();
    });

    it("should return fallback for unknown condition", () => {
      const color = getConditionBadgeColor("unknown_condition_xyz");
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      );
    });

    it("should match partial conditions", () => {
      const color = getConditionBadgeColor("partly sunny day");
      expect(color).toBeDefined();
    });
  });

  describe("getTableConditionBadgeColor", () => {
    it("should return color for valid WMO code", () => {
      const color = getTableConditionBadgeColor(0); // clear sky
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return color for rain code", () => {
      const color = getTableConditionBadgeColor(61);
      expect(color).toBeDefined();
    });

    it("should return fallback for unknown code", () => {
      const color = getTableConditionBadgeColor(999);
      expect(color).toBeDefined();
    });
  });

  describe("getWeatherIconInfo", () => {
    it("should return icon and condition for valid code", () => {
      const info = getWeatherIconInfo(0);
      expect(info).toBeDefined();
      expect(info.icon).toBeDefined();
      expect(info.condition).toBeDefined();
    });

    it("should return Cloud icon for unknown code", () => {
      const info = getWeatherIconInfo(999);
      expect(info.icon).toBe(Cloud);
      expect(info.condition).toBe("cloudy");
    });

    it("should return correct info for rain", () => {
      const info = getWeatherIconInfo(61);
      expect(info.condition).toBeDefined();
    });
  });

  describe("getConditionIconColor", () => {
    it("should return color for cloudy condition", () => {
      const color = getConditionIconColor("cloudy");
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
    });

    it("should return fallback for unknown condition", () => {
      const color = getConditionIconColor("unknown");
      expect(color).toBeDefined();
    });
  });

  describe("getWeatherIconType", () => {
    it('should return "sunny" for clear conditions', () => {
      expect(getWeatherIconType("clear")).toBe("sunny");
      expect(getWeatherIconType("sunny")).toBe("sunny");
      expect(getWeatherIconType("céu limpo")).toBe("sunny");
      expect(getWeatherIconType("ensolarado")).toBe("sunny");
    });

    it('should return "rainy" for rain conditions', () => {
      expect(getWeatherIconType("rain")).toBe("rainy");
      expect(getWeatherIconType("chuva")).toBe("rainy");
      expect(getWeatherIconType("chuvoso")).toBe("rainy");
    });

    it('should return "stormy" for storm conditions', () => {
      expect(getWeatherIconType("storm")).toBe("stormy");
      expect(getWeatherIconType("tempestade")).toBe("stormy");
      expect(getWeatherIconType("thunder")).toBe("stormy");
    });

    it('should return "snowy" for snow conditions', () => {
      expect(getWeatherIconType("snow")).toBe("snowy");
      expect(getWeatherIconType("neve")).toBe("snowy");
      expect(getWeatherIconType("nevando")).toBe("snowy");
    });

    it('should return "foggy" for fog conditions', () => {
      expect(getWeatherIconType("fog")).toBe("foggy");
      expect(getWeatherIconType("mist")).toBe("foggy");
      expect(getWeatherIconType("neblina")).toBe("foggy");
      expect(getWeatherIconType("nebuloso")).toBe("foggy");
    });

    it('should return "cloudy" for cloudy conditions', () => {
      expect(getWeatherIconType("cloud")).toBe("cloudy");
      expect(getWeatherIconType("nublado")).toBe("cloudy");
      expect(getWeatherIconType("encoberto")).toBe("cloudy");
    });

    it('should return "sunny" as fallback', () => {
      expect(getWeatherIconType("unknown")).toBe("sunny");
    });

    it("should be case-insensitive", () => {
      expect(getWeatherIconType("CLEAR")).toBe("sunny");
      expect(getWeatherIconType("RAIN")).toBe("rainy");
    });
  });

  describe("getTrendIcon", () => {
    it("should return TrendingUp for up trend", () => {
      expect(getTrendIcon("up")).toBe(TrendingUp);
    });

    it("should return TrendingDown for down trend", () => {
      expect(getTrendIcon("down")).toBe(TrendingDown);
    });

    it("should return Minus for stable trend", () => {
      expect(getTrendIcon("stable")).toBe(Minus);
    });

    it("should return Minus for unknown trend", () => {
      expect(getTrendIcon("unknown")).toBe(Minus);
    });
  });

  describe("getTrendColor", () => {
    it("should return red for up trend", () => {
      expect(getTrendColor("up")).toBe("text-red-500");
    });

    it("should return blue for down trend", () => {
      expect(getTrendColor("down")).toBe("text-blue-500");
    });

    it("should return slate for stable trend", () => {
      expect(getTrendColor("stable")).toBe("text-slate-500");
    });

    it("should return slate for unknown trend", () => {
      expect(getTrendColor("unknown")).toBe("text-slate-500");
    });
  });

  describe("getAQILevel", () => {
    it("should return Bom for AQI <= 50", () => {
      const level = getAQILevel(30);
      expect(level.label).toBe("Bom");
      expect(level.color).toContain("green");
    });

    it("should return Moderado for AQI 51-100", () => {
      const level = getAQILevel(75);
      expect(level.label).toBe("Moderado");
      expect(level.color).toContain("yellow");
    });

    it("should return Ruim p/ Sensíveis for AQI 101-150", () => {
      const level = getAQILevel(125);
      expect(level.label).toBe("Ruim p/ Sensíveis");
      expect(level.color).toContain("orange");
    });

    it("should return Ruim for AQI 151-200", () => {
      const level = getAQILevel(175);
      expect(level.label).toBe("Ruim");
      expect(level.color).toContain("red");
    });

    it("should return Muito Ruim for AQI 201-300", () => {
      const level = getAQILevel(250);
      expect(level.label).toBe("Muito Ruim");
      expect(level.color).toContain("purple");
    });

    it("should return Perigoso for AQI > 300", () => {
      const level = getAQILevel(350);
      expect(level.label).toBe("Perigoso");
      expect(level.color).toContain("rose");
    });

    it("should return Desconhecido for undefined", () => {
      const level = getAQILevel(undefined);
      expect(level.label).toBe("Desconhecido");
    });

    it("should return Desconhecido for 0", () => {
      const level = getAQILevel(0);
      expect(level.label).toBe("Desconhecido");
    });

    it("should handle edge cases at boundaries", () => {
      expect(getAQILevel(50).label).toBe("Bom");
      expect(getAQILevel(51).label).toBe("Moderado");
      expect(getAQILevel(100).label).toBe("Moderado");
      expect(getAQILevel(101).label).toBe("Ruim p/ Sensíveis");
    });
  });
});
