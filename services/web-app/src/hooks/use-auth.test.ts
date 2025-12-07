import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "./use-auth";
import { AuthContext } from "@/contexts/auth-context";
import { createElement } from "react";
import type { AuthContextType } from "@/types/auth";

describe("useAuth", () => {
  const mockAuthContext: AuthContextType = {
    isAuthenticated: true,
    token: "mock-token",
    user: {
      sub: "user-123",
      email: "test@example.com",
      name: "Test User",
      roles: ["user"],
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    },
    signIn: vi.fn(),
    signOut: vi.fn(),
  };

  const createWrapper = (contextValue: AuthContextType | undefined) => {
    return ({ children }: { children: React.ReactNode }) =>
      createElement(AuthContext.Provider, { value: contextValue }, children);
  };

  describe("when used inside AuthProvider", () => {
    it("should return auth context values", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe("mock-token");
      expect(result.current.user).toEqual(mockAuthContext.user);
    });

    it("should return signIn function", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      expect(result.current.signIn).toBe(mockAuthContext.signIn);
    });

    it("should return signOut function", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      expect(result.current.signOut).toBe(mockAuthContext.signOut);
    });

    it("should return isAuthenticated as false when not authenticated", () => {
      const unauthenticatedContext: AuthContextType = {
        ...mockAuthContext,
        isAuthenticated: false,
        token: null,
        user: null,
      };

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(unauthenticatedContext),
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it("should return user with all expected properties", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      expect(result.current.user).toHaveProperty("sub");
      expect(result.current.user).toHaveProperty("email");
      expect(result.current.user).toHaveProperty("name");
      expect(result.current.user).toHaveProperty("roles");
      expect(result.current.user).toHaveProperty("exp");
      expect(result.current.user).toHaveProperty("iat");
    });
  });

  describe("when used outside AuthProvider", () => {
    it("should throw an error", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth deve ser usado dentro de um AuthProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("context value types", () => {
    it("should have correct type for token (string or null)", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      expect(
        typeof result.current.token === "string" ||
          result.current.token === null,
      ).toBe(true);
    });

    it("should have correct type for signIn (function)", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      expect(typeof result.current.signIn).toBe("function");
    });

    it("should have correct type for signOut (function)", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(mockAuthContext),
      });

      expect(typeof result.current.signOut).toBe("function");
    });
  });
});
