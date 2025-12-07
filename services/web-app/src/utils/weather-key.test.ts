import { describe, it, expect } from "vitest";
import {
  getWeatherKey,
  matchesWeatherType,
  getAvailableWeatherKeys,
  type WeatherKey,
} from "./weather-key";

describe("weather-key utils", () => {
  describe("getWeatherKey", () => {
    describe("sunny conditions", () => {
      it("should return 'sunny' for 'clear' condition", () => {
        expect(getWeatherKey("clear")).toBe("sunny");
      });

      it("should return 'sunny' for 'Clear' condition (case insensitive)", () => {
        expect(getWeatherKey("Clear")).toBe("sunny");
      });

      it("should return 'sunny' for 'CLEAR' condition (uppercase)", () => {
        expect(getWeatherKey("CLEAR")).toBe("sunny");
      });

      it("should return 'sunny' for 'céu limpo' (Portuguese)", () => {
        expect(getWeatherKey("céu limpo")).toBe("sunny");
      });

      it("should return 'sunny' for 'ensolarado' (Portuguese)", () => {
        expect(getWeatherKey("ensolarado")).toBe("sunny");
      });

      it("should return 'sunny' for 'sunny' condition", () => {
        expect(getWeatherKey("sunny")).toBe("sunny");
      });

      it("should return 'sunny' for 'Mainly Clear'", () => {
        expect(getWeatherKey("Mainly Clear")).toBe("sunny");
      });
    });

    describe("snowy conditions", () => {
      it("should return 'snowy' for 'snow' condition", () => {
        expect(getWeatherKey("snow")).toBe("snowy");
      });

      it("should return 'snowy' for 'Snow' condition (case insensitive)", () => {
        expect(getWeatherKey("Snow")).toBe("snowy");
      });

      it("should return 'snowy' for 'neve' (Portuguese)", () => {
        expect(getWeatherKey("neve")).toBe("snowy");
      });

      it("should return 'snowy' for 'Heavy Snow'", () => {
        expect(getWeatherKey("Heavy Snow")).toBe("snowy");
      });

      it("should return 'snowy' for 'Light snow'", () => {
        expect(getWeatherKey("Light snow")).toBe("snowy");
      });
    });

    describe("foggy conditions", () => {
      it("should return 'foggy' for 'fog' condition", () => {
        expect(getWeatherKey("fog")).toBe("foggy");
      });

      it("should return 'foggy' for 'Fog' condition (case insensitive)", () => {
        expect(getWeatherKey("Fog")).toBe("foggy");
      });

      it("should return 'foggy' for 'neblina' (Portuguese)", () => {
        expect(getWeatherKey("neblina")).toBe("foggy");
      });

      it("should return 'foggy' for 'nebuloso' (Portuguese)", () => {
        expect(getWeatherKey("nebuloso")).toBe("foggy");
      });

      it("should return 'foggy' for 'mist' condition", () => {
        expect(getWeatherKey("mist")).toBe("foggy");
      });

      it("should return 'foggy' for 'Dense Fog'", () => {
        expect(getWeatherKey("Dense Fog")).toBe("foggy");
      });
    });

    describe("rainy conditions", () => {
      it("should return 'rainy' for 'rain' condition", () => {
        expect(getWeatherKey("rain")).toBe("rainy");
      });

      it("should return 'rainy' for 'Rain' condition (case insensitive)", () => {
        expect(getWeatherKey("Rain")).toBe("rainy");
      });

      it("should return 'rainy' for 'chuva' (Portuguese)", () => {
        expect(getWeatherKey("chuva")).toBe("rainy");
      });

      it("should return 'rainy' for 'chuvoso' (Portuguese)", () => {
        expect(getWeatherKey("chuvoso")).toBe("rainy");
      });

      it("should return 'rainy' for 'thunder' condition", () => {
        expect(getWeatherKey("thunder")).toBe("rainy");
      });

      it("should return 'rainy' for 'storm' condition", () => {
        expect(getWeatherKey("storm")).toBe("rainy");
      });

      it("should return 'rainy' for 'tempest' (Portuguese)", () => {
        expect(getWeatherKey("tempest")).toBe("rainy");
      });

      it("should return 'rainy' for 'drizzle' condition", () => {
        expect(getWeatherKey("drizzle")).toBe("rainy");
      });

      it("should return 'rainy' for 'garoa' (Portuguese)", () => {
        expect(getWeatherKey("garoa")).toBe("rainy");
      });

      it("should return 'rainy' for 'Heavy Rain'", () => {
        expect(getWeatherKey("Heavy Rain")).toBe("rainy");
      });

      it("should return 'rainy' for 'Thunderstorm'", () => {
        expect(getWeatherKey("Thunderstorm")).toBe("rainy");
      });
    });

    describe("windy conditions", () => {
      it("should return 'windy' for 'wind' condition", () => {
        expect(getWeatherKey("wind")).toBe("windy");
      });

      it("should return 'windy' for 'Wind' condition (case insensitive)", () => {
        expect(getWeatherKey("Wind")).toBe("windy");
      });

      it("should return 'windy' for 'vento' (Portuguese)", () => {
        expect(getWeatherKey("vento")).toBe("windy");
      });

      it("should return 'windy' for 'ventoso' (Portuguese)", () => {
        expect(getWeatherKey("ventoso")).toBe("windy");
      });

      it("should return 'windy' for 'Strong Wind'", () => {
        expect(getWeatherKey("Strong Wind")).toBe("windy");
      });
    });

    describe("cloudy conditions", () => {
      it("should return 'cloudy' for 'overcast' condition", () => {
        expect(getWeatherKey("overcast")).toBe("cloudy");
      });

      it("should return 'cloudy' for 'Overcast' condition (case insensitive)", () => {
        expect(getWeatherKey("Overcast")).toBe("cloudy");
      });

      it("should return 'cloudy' for 'encoberto' (Portuguese)", () => {
        expect(getWeatherKey("encoberto")).toBe("cloudy");
      });

      it("should return 'cloudy' for 'cloudy' condition", () => {
        expect(getWeatherKey("cloudy")).toBe("cloudy");
      });

      it("should return 'cloudy' for 'nublado' (Portuguese)", () => {
        expect(getWeatherKey("nublado")).toBe("cloudy");
      });

      it("should return 'cloudy' for 'Mostly Cloudy'", () => {
        expect(getWeatherKey("Mostly Cloudy")).toBe("cloudy");
      });
    });

    describe("partly cloudy conditions", () => {
      it("should return 'partly_cloudy' for 'partly' condition", () => {
        expect(getWeatherKey("partly")).toBe("partly_cloudy");
      });

      it("should return 'partly_cloudy' for 'Partly' condition (case insensitive)", () => {
        expect(getWeatherKey("Partly")).toBe("partly_cloudy");
      });

      it("should return 'partly_cloudy' for 'parcial' (Portuguese)", () => {
        expect(getWeatherKey("parcial")).toBe("partly_cloudy");
      });

      it("should return 'cloudy' for 'Partly Cloudy' due to pattern priority", () => {
        expect(getWeatherKey("Partly Cloudy")).toBe("cloudy");
      });
    });

    describe("default/fallback conditions", () => {
      it("should return 'partly_cloudy' for unknown condition", () => {
        expect(getWeatherKey("unknown")).toBe("partly_cloudy");
      });

      it("should return 'partly_cloudy' for empty string", () => {
        expect(getWeatherKey("")).toBe("partly_cloudy");
      });

      it("should return 'partly_cloudy' for random text", () => {
        expect(getWeatherKey("xyz123")).toBe("partly_cloudy");
      });
    });
  });

  describe("matchesWeatherType", () => {
    it("should return true when condition matches weather key", () => {
      expect(matchesWeatherType("clear sky", "sunny")).toBe(true);
    });

    it("should return false when condition does not match weather key", () => {
      expect(matchesWeatherType("clear sky", "rainy")).toBe(false);
    });

    it("should return true for exact match", () => {
      expect(matchesWeatherType("rain", "rainy")).toBe(true);
    });

    it("should return true for Portuguese conditions", () => {
      expect(matchesWeatherType("chuva forte", "rainy")).toBe(true);
    });

    it("should return false for mismatched types", () => {
      expect(matchesWeatherType("snow", "rainy")).toBe(false);
    });

    it("should work with all weather types", () => {
      const testCases: [string, WeatherKey, boolean][] = [
        ["clear", "sunny", true],
        ["snow", "snowy", true],
        ["fog", "foggy", true],
        ["rain", "rainy", true],
        ["wind", "windy", true],
        ["cloudy", "cloudy", true],
        ["partly", "partly_cloudy", true],
      ];

      testCases.forEach(([condition, key, expected]) => {
        expect(matchesWeatherType(condition, key)).toBe(expected);
      });
    });
  });

  describe("getAvailableWeatherKeys", () => {
    it("should return all available weather keys", () => {
      const keys = getAvailableWeatherKeys();
      expect(keys).toContain("sunny");
      expect(keys).toContain("snowy");
      expect(keys).toContain("foggy");
      expect(keys).toContain("rainy");
      expect(keys).toContain("windy");
      expect(keys).toContain("cloudy");
      expect(keys).toContain("partly_cloudy");
    });

    it("should return 7 weather keys", () => {
      const keys = getAvailableWeatherKeys();
      expect(keys).toHaveLength(7);
    });

    it("should return an array", () => {
      const keys = getAvailableWeatherKeys();
      expect(Array.isArray(keys)).toBe(true);
    });

    it("should not contain duplicates", () => {
      const keys = getAvailableWeatherKeys();
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });
});
