import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTokenExpiration } from "./use-token-expiration";

const mockSignOut = vi.fn();
vi.mock("./use-auth", () => ({
  useAuth: vi.fn(() => ({
    token: null,
    signOut: mockSignOut,
  })),
}));

vi.mock("@/utils/jwt", () => ({
  decodeJWT: vi.fn(),
}));

vi.mock("@/utils/toast", () => ({
  authToasts: {
    sessionExpired: vi.fn(),
  },
}));

import { useAuth } from "./use-auth";
import { decodeJWT } from "@/utils/jwt";
import { authToasts } from "@/utils/toast";

describe("useTokenExpiration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should do nothing when token is null", () => {
    vi.mocked(useAuth).mockReturnValue({
      token: null,
      signOut: mockSignOut,
      isAuthenticated: false,
      user: null,
      signIn: vi.fn(),
    });

    renderHook(() => useTokenExpiration());

    expect(decodeJWT).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("should do nothing when decoded token is null", () => {
    vi.mocked(useAuth).mockReturnValue({
      token: "some-token",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue(null);

    renderHook(() => useTokenExpiration());

    expect(decodeJWT).toHaveBeenCalledWith("some-token");
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("should do nothing when decoded token has no exp", () => {
    vi.mocked(useAuth).mockReturnValue({
      token: "some-token",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
      roles: ["user"],
      iat: Math.floor(Date.now() / 1000),
      exp: undefined as unknown as number,
    });

    renderHook(() => useTokenExpiration());

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("should call sessionExpired toast when token is already expired", async () => {
    vi.useRealTimers();
    const expiredTime = Math.floor(Date.now() / 1000) - 100;

    vi.mocked(useAuth).mockReturnValue({
      token: "expired-token",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
      roles: ["user"],
      exp: expiredTime,
      iat: expiredTime - 3600,
    });

    renderHook(() => useTokenExpiration());

    await waitFor(() => {
      expect(authToasts.sessionExpired).toHaveBeenCalled();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("should schedule signOut when token will expire in the future", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    vi.mocked(useAuth).mockReturnValue({
      token: "valid-token",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
      roles: ["user"],
      exp: expirationTime,
      iat: Math.floor(Date.now() / 1000),
    });

    renderHook(() => useTokenExpiration());

    expect(mockSignOut).not.toHaveBeenCalled();

    expect(setTimeoutSpy).toHaveBeenCalled();

    setTimeoutSpy.mockRestore();
  });

  it("should cleanup timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    vi.mocked(useAuth).mockReturnValue({
      token: "valid-token",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
      roles: ["user"],
      exp: expirationTime,
      iat: Math.floor(Date.now() / 1000),
    });

    const { unmount } = renderHook(() => useTokenExpiration());

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("should reset timer when token changes", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      token: "token-1",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
      roles: ["user"],
      exp: expirationTime,
      iat: Math.floor(Date.now() / 1000),
    });

    const { rerender } = renderHook(() => useTokenExpiration());

    mockUseAuth.mockReturnValue({
      token: "token-2",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });

    rerender();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("should not set timer for very long expiration times", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const veryLongExpiration = Math.floor(Date.now() / 1000) + 86400;

    vi.mocked(useAuth).mockReturnValue({
      token: "long-lived-token",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
      roles: ["user"],
      exp: veryLongExpiration,
      iat: Math.floor(Date.now() / 1000),
    });

    renderHook(() => useTokenExpiration());

    expect(setTimeoutSpy).toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it("should call sessionExpired toast and signOut when timer fires", async () => {
    const expirationTime = Math.floor(Date.now() / 1000) + 5;

    vi.mocked(useAuth).mockReturnValue({
      token: "expiring-soon-token",
      signOut: mockSignOut,
      isAuthenticated: true,
      user: null,
      signIn: vi.fn(),
    });
    vi.mocked(decodeJWT).mockReturnValue({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
      roles: ["user"],
      exp: expirationTime,
      iat: Math.floor(Date.now() / 1000),
    });

    renderHook(() => useTokenExpiration());

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(authToasts.sessionExpired).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(6000);

    expect(authToasts.sessionExpired).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
  });
});
