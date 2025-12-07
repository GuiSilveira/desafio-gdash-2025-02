import { describe, it, expect, vi, beforeEach } from "vitest";
import { decodeJWT, isTokenExpired, getTokenExpirationTime } from "./jwt";

function createMockJWT(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = "mock-signature";
  return `${header}.${body}.${signature}`;
}

describe("jwt utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("decodeJWT", () => {
    it("should decode a valid JWT payload", () => {
      const payload = {
        sub: "123",
        email: "test@example.com",
        exp: 1735084800,
        iat: 1735081200,
      };
      const token = createMockJWT(payload);

      const result = decodeJWT(token);

      expect(result).toEqual(payload);
    });

    it("should return null for invalid token", () => {
      const result = decodeJWT("invalid-token");
      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = decodeJWT("");
      expect(result).toBeNull();
    });

    it("should decode payload with roles array", () => {
      const payload = {
        sub: "123",
        email: "admin@example.com",
        roles: ["admin", "user"],
        exp: 1735084800,
      };
      const token = createMockJWT(payload);

      const result = decodeJWT(token);

      expect(result?.roles).toEqual(["admin", "user"]);
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for non-expired token", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockJWT({ exp: futureExp });

      expect(isTokenExpired(token)).toBe(false);
    });

    it("should return true for expired token", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockJWT({ exp: pastExp });

      expect(isTokenExpired(token)).toBe(true);
    });

    it("should return true for invalid token", () => {
      expect(isTokenExpired("invalid")).toBe(true);
    });

    it("should return true for token expiring now", () => {
      const nowExp = Math.floor(Date.now() / 1000);
      const token = createMockJWT({ exp: nowExp });

      vi.advanceTimersByTime(1000);

      expect(isTokenExpired(token)).toBe(true);
    });
  });

  describe("getTokenExpirationTime", () => {
    it("should return remaining time in milliseconds", () => {
      const fixedTime = new Date("2024-01-01T12:00:00.000Z").getTime();
      vi.setSystemTime(fixedTime);

      const futureExp = Math.floor(fixedTime / 1000) + 3600;
      const token = createMockJWT({ exp: futureExp });

      const result = getTokenExpirationTime(token);

      expect(result).toBe(3600000);
    });

    it("should return 0 for expired token", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockJWT({ exp: pastExp });

      expect(getTokenExpirationTime(token)).toBe(0);
    });

    it("should return 0 for invalid token", () => {
      expect(getTokenExpirationTime("invalid")).toBe(0);
    });

    it("should never return negative values", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 999999;
      const token = createMockJWT({ exp: pastExp });

      expect(getTokenExpirationTime(token)).toBeGreaterThanOrEqual(0);
    });
  });
});
