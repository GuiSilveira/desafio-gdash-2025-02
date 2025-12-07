import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRandomItems,
  formatPokemonName,
  getPokemonIdFromUrl,
  extractPokemonId,
  buildPokemonUrl,
  formatPokemonHeight,
  formatPokemonWeight,
  calculateGenderPercent,
  getTypeGradient,
  getTypeGradientClass,
  getRandomPokemonId,
  getRandomWeatherMessage,
} from "./pokemon";

describe("pokemon utils", () => {
  describe("getRandomItems", () => {
    it("should return the specified number of items", () => {
      const items = [1, 2, 3, 4, 5];
      const result = getRandomItems(items, 3);
      expect(result).toHaveLength(3);
    });

    it("should return items from the original array", () => {
      const items = ["a", "b", "c", "d"];
      const result = getRandomItems(items, 2);
      result.forEach((item) => {
        expect(items).toContain(item);
      });
    });

    it("should not modify the original array", () => {
      const items = [1, 2, 3, 4, 5];
      const originalLength = items.length;
      getRandomItems(items, 3);
      expect(items).toHaveLength(originalLength);
    });

    it("should handle requesting more items than available", () => {
      const items = [1, 2, 3];
      const result = getRandomItems(items, 5);
      expect(result).toHaveLength(3);
    });

    it("should handle empty array", () => {
      const result = getRandomItems([], 3);
      expect(result).toHaveLength(0);
    });

    it("should handle count of 0", () => {
      const items = [1, 2, 3];
      const result = getRandomItems(items, 0);
      expect(result).toHaveLength(0);
    });
  });

  describe("formatPokemonName", () => {
    it("should capitalize single word names", () => {
      expect(formatPokemonName("pikachu")).toBe("Pikachu");
      expect(formatPokemonName("bulbasaur")).toBe("Bulbasaur");
    });

    it("should handle hyphenated names", () => {
      expect(formatPokemonName("mr-mime")).toBe("Mr Mime");
      expect(formatPokemonName("ho-oh")).toBe("Ho Oh");
    });

    it("should handle multiple hyphens", () => {
      expect(formatPokemonName("tapu-koko")).toBe("Tapu Koko");
      expect(formatPokemonName("porygon-z")).toBe("Porygon Z");
    });

    it("should handle already capitalized names", () => {
      expect(formatPokemonName("Pikachu")).toBe("Pikachu");
    });

    it("should handle empty string", () => {
      expect(formatPokemonName("")).toBe("");
    });

    it("should handle single character", () => {
      expect(formatPokemonName("a")).toBe("A");
    });
  });

  describe("getPokemonIdFromUrl", () => {
    it("should extract ID from pokemon-species URL", () => {
      expect(getPokemonIdFromUrl("https://pokeapi.co/api/v2/pokemon-species/25/")).toBe("25");
      expect(getPokemonIdFromUrl("https://pokeapi.co/api/v2/pokemon-species/1/")).toBe("1");
    });

    it("should return 1 for invalid URL", () => {
      expect(getPokemonIdFromUrl("invalid-url")).toBe("1");
      expect(getPokemonIdFromUrl("https://example.com")).toBe("1");
    });

    it("should handle URLs without trailing slash", () => {
      expect(getPokemonIdFromUrl("https://pokeapi.co/api/v2/pokemon-species/25")).toBe("1");
    });

    it("should handle large IDs", () => {
      expect(getPokemonIdFromUrl("https://pokeapi.co/api/v2/pokemon-species/1010/")).toBe("1010");
    });
  });

  describe("extractPokemonId", () => {
    it("should extract ID from pokemon URL", () => {
      expect(extractPokemonId("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
      expect(extractPokemonId("https://pokeapi.co/api/v2/pokemon/1/")).toBe(1);
    });

    it("should extract ID from pokemon-species URL", () => {
      expect(extractPokemonId("https://pokeapi.co/api/v2/pokemon-species/150/")).toBe(150);
    });

    it("should handle URLs without trailing slash", () => {
      expect(extractPokemonId("https://pokeapi.co/api/v2/pokemon/25")).toBe(25);
    });

    it("should return 1 for invalid URL", () => {
      expect(extractPokemonId("invalid-url")).toBe(1);
    });

    it("should handle large IDs", () => {
      expect(extractPokemonId("https://pokeapi.co/api/v2/pokemon/1010/")).toBe(1010);
    });
  });

  describe("buildPokemonUrl", () => {
    it("should build correct URL for ID", () => {
      expect(buildPokemonUrl(25)).toBe("https://pokeapi.co/api/v2/pokemon/25/");
      expect(buildPokemonUrl(1)).toBe("https://pokeapi.co/api/v2/pokemon/1/");
    });

    it("should handle large IDs", () => {
      expect(buildPokemonUrl(1010)).toBe("https://pokeapi.co/api/v2/pokemon/1010/");
    });
  });

  describe("formatPokemonHeight", () => {
    it("should convert decimeters to meters", () => {
      expect(formatPokemonHeight(4)).toBe("0.4"); // Pikachu: 4dm = 0.4m
      expect(formatPokemonHeight(10)).toBe("1.0"); // 10dm = 1m
      expect(formatPokemonHeight(17)).toBe("1.7"); // Charizard: 17dm = 1.7m
    });

    it("should handle large heights", () => {
      expect(formatPokemonHeight(145)).toBe("14.5"); // Wailord: 145dm = 14.5m
    });

    it("should handle 0", () => {
      expect(formatPokemonHeight(0)).toBe("0.0");
    });
  });

  describe("formatPokemonWeight", () => {
    it("should convert hectograms to kilograms", () => {
      expect(formatPokemonWeight(60)).toBe("6.0"); // Pikachu: 60hg = 6kg
      expect(formatPokemonWeight(100)).toBe("10.0"); // 100hg = 10kg
      expect(formatPokemonWeight(905)).toBe("90.5"); // Charizard: 905hg = 90.5kg
    });

    it("should handle large weights", () => {
      expect(formatPokemonWeight(3980)).toBe("398.0"); // Wailord: 3980hg = 398kg
    });

    it("should handle 0", () => {
      expect(formatPokemonWeight(0)).toBe("0.0");
    });
  });

  describe("calculateGenderPercent", () => {
    it("should return null for genderless Pokemon (-1)", () => {
      const result = calculateGenderPercent(-1);
      expect(result.male).toBeNull();
      expect(result.female).toBeNull();
    });

    it("should calculate 50/50 gender ratio (rate 4)", () => {
      const result = calculateGenderPercent(4);
      expect(result.male).toBe(50);
      expect(result.female).toBe(50);
    });

    it("should calculate 87.5% male (rate 1)", () => {
      const result = calculateGenderPercent(1);
      expect(result.male).toBe(87.5);
      expect(result.female).toBe(12.5);
    });

    it("should calculate 100% female (rate 8)", () => {
      const result = calculateGenderPercent(8);
      expect(result.male).toBe(0);
      expect(result.female).toBe(100);
    });

    it("should calculate 100% male (rate 0)", () => {
      const result = calculateGenderPercent(0);
      expect(result.male).toBe(100);
      expect(result.female).toBe(0);
    });

    it("should calculate 75% female (rate 6)", () => {
      const result = calculateGenderPercent(6);
      expect(result.male).toBe(25);
      expect(result.female).toBe(75);
    });
  });

  describe("getTypeGradient", () => {
    it("should return gradient for fire type", () => {
      const gradient = getTypeGradient("fire");
      expect(gradient).toContain("linear-gradient");
    });

    it("should return gradient for water type", () => {
      const gradient = getTypeGradient("water");
      expect(gradient).toContain("linear-gradient");
    });

    it("should be case-insensitive", () => {
      const lowerGradient = getTypeGradient("fire");
      const upperGradient = getTypeGradient("FIRE");
      expect(lowerGradient).toBe(upperGradient);
    });

    it("should return normal gradient for unknown type", () => {
      const gradient = getTypeGradient("unknown_type");
      expect(gradient).toContain("linear-gradient");
    });
  });

  describe("getTypeGradientClass", () => {
    it("should return Tailwind class for fire type", () => {
      const className = getTypeGradientClass("fire");
      expect(typeof className).toBe("string");
    });

    it("should return Tailwind class for water type", () => {
      const className = getTypeGradientClass("water");
      expect(typeof className).toBe("string");
    });

    it("should be case-insensitive", () => {
      const lowerClass = getTypeGradientClass("fire");
      const upperClass = getTypeGradientClass("FIRE");
      expect(lowerClass).toBe(upperClass);
    });

    it("should return normal class for unknown type", () => {
      const className = getTypeGradientClass("unknown_type");
      expect(typeof className).toBe("string");
    });
  });

  describe("getRandomPokemonId", () => {
    beforeEach(() => {
      vi.spyOn(Math, "random").mockReturnValue(0);
    });

    it("should return a Pokemon ID for sunny weather", () => {
      const id = getRandomPokemonId("sunny");
      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    });

    it("should return a Pokemon ID for rainy weather", () => {
      const id = getRandomPokemonId("rainy");
      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    });

    it("should return fallback for unknown weather", () => {
      const id = getRandomPokemonId("unknown_weather_xyz");
      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    });
  });

  describe("getRandomWeatherMessage", () => {
    beforeEach(() => {
      vi.spyOn(Math, "random").mockReturnValue(0);
    });

    it("should return a message for sunny weather", () => {
      const message = getRandomWeatherMessage("sunny");
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(0);
    });

    it("should return a message for rainy weather", () => {
      const message = getRandomWeatherMessage("rainy");
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(0);
    });

    it("should return fallback for unknown weather", () => {
      const message = getRandomWeatherMessage("unknown_weather_xyz");
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
