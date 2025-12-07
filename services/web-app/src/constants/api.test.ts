import { describe, it, expect } from "vitest";
import { API_ENDPOINTS } from "./api";

describe("API_ENDPOINTS", () => {
  describe("static endpoints", () => {
    it("should have LOGIN endpoint", () => {
      expect(API_ENDPOINTS.LOGIN).toBe("/auth/login");
    });

    it("should have LOGOUT endpoint", () => {
      expect(API_ENDPOINTS.LOGOUT).toBe("/auth/logout");
    });

    it("should have WEATHER_LOGS endpoint", () => {
      expect(API_ENDPOINTS.WEATHER_LOGS).toBe("/weather");
    });

    it("should have WEATHER_INSIGHTS endpoint", () => {
      expect(API_ENDPOINTS.WEATHER_INSIGHTS).toBe("/weather/insights");
    });

    it("should have WEATHER_FORECAST_INSIGHTS endpoint", () => {
      expect(API_ENDPOINTS.WEATHER_FORECAST_INSIGHTS).toBe(
        "/weather/forecast-insights"
      );
    });

    it("should have USERS endpoint", () => {
      expect(API_ENDPOINTS.USERS).toBe("/users");
    });

    it("should have EXPLORE endpoint", () => {
      expect(API_ENDPOINTS.EXPLORE).toBe("/external/pokemon");
    });
  });

  describe("dynamic endpoints", () => {
    describe("WEATHER_EXPORT", () => {
      it("should generate CSV export endpoint", () => {
        expect(API_ENDPOINTS.WEATHER_EXPORT("csv")).toBe("/weather/export/csv");
      });

      it("should generate XLSX export endpoint", () => {
        expect(API_ENDPOINTS.WEATHER_EXPORT("xlsx")).toBe(
          "/weather/export/xlsx"
        );
      });

      it("should generate JSON export endpoint", () => {
        expect(API_ENDPOINTS.WEATHER_EXPORT("json")).toBe(
          "/weather/export/json"
        );
      });
    });

    describe("USER_BY_ID", () => {
      it("should generate user by ID endpoint", () => {
        expect(API_ENDPOINTS.USER_BY_ID("123")).toBe("/users/123");
      });

      it("should generate user by ID endpoint with different ID", () => {
        expect(API_ENDPOINTS.USER_BY_ID("abc-def")).toBe("/users/abc-def");
      });
    });

    describe("EXPLORE_BY_ID", () => {
      it("should generate pokemon by ID endpoint", () => {
        expect(API_ENDPOINTS.EXPLORE_BY_ID("25")).toBe("/external/pokemon/25");
      });

      it("should generate pokemon by name endpoint", () => {
        expect(API_ENDPOINTS.EXPLORE_BY_ID("pikachu")).toBe(
          "/external/pokemon/pikachu"
        );
      });
    });

    describe("POKEMON_SPECIES", () => {
      it("should generate pokemon species endpoint by ID", () => {
        expect(API_ENDPOINTS.POKEMON_SPECIES("25")).toBe(
          "/external/pokemon/25/species"
        );
      });

      it("should generate pokemon species endpoint by name", () => {
        expect(API_ENDPOINTS.POKEMON_SPECIES("charizard")).toBe(
          "/external/pokemon/charizard/species"
        );
      });
    });

    describe("EVOLUTION_CHAIN", () => {
      it("should generate evolution chain endpoint", () => {
        expect(API_ENDPOINTS.EVOLUTION_CHAIN("1")).toBe(
          "/external/pokemon/evolution-chain/1"
        );
      });

      it("should generate evolution chain endpoint with different ID", () => {
        expect(API_ENDPOINTS.EVOLUTION_CHAIN("67")).toBe(
          "/external/pokemon/evolution-chain/67"
        );
      });
    });
  });
});
