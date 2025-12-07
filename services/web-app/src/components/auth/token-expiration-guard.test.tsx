import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { TokenExpirationGuard } from "./token-expiration-guard";

const mockSignOut = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    signOut: mockSignOut,
  })),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/utils/toast", () => ({
  authToasts: {
    sessionExpired: vi.fn(),
  },
}));

import { useAuth } from "@/hooks/use-auth";
import { authToasts } from "@/utils/toast";

describe("TokenExpirationGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSignOut.mockResolvedValue(undefined);
    mockNavigate.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      signOut: mockSignOut,
      token: null,
      isAuthenticated: false,
      signIn: vi.fn(),
    });

    const { container } = render(<TokenExpirationGuard />);

    expect(container.firstChild).toBeNull();
  });

  it("should do nothing when user is null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      signOut: mockSignOut,
      token: null,
      isAuthenticated: false,
      signIn: vi.fn(),
    });
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    render(<TokenExpirationGuard />);

    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it("should do nothing when user.exp is undefined", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        iat: Math.floor(Date.now() / 1000),
        exp: undefined as unknown as number,
      },
      signOut: mockSignOut,
      token: "test-token",
      isAuthenticated: true,
      signIn: vi.fn(),
    });
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    render(<TokenExpirationGuard />);

    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it("should not set timer when token is already expired", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pastExp = Math.floor(Date.now() / 1000) - 100;

    vi.mocked(useAuth).mockReturnValue({
      user: {
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        exp: pastExp,
        iat: pastExp - 3600,
      },
      signOut: mockSignOut,
      token: "expired-token",
      isAuthenticated: true,
      signIn: vi.fn(),
    });
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    render(<TokenExpirationGuard />);

    expect(consoleSpy).toHaveBeenCalledWith("Token has already expired");
    expect(setTimeoutSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  it("should set timer when token will expire in the future", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;

    vi.mocked(useAuth).mockReturnValue({
      user: {
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        exp: futureExp,
        iat: Math.floor(Date.now() / 1000),
      },
      signOut: mockSignOut,
      token: "valid-token",
      isAuthenticated: true,
      signIn: vi.fn(),
    });
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    render(<TokenExpirationGuard />);

    expect(setTimeoutSpy).toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it("should call signOut, toast and navigate when timer fires", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const now = new Date("2025-01-15T12:00:00Z");
    vi.setSystemTime(now);

    const futureExp = Math.floor(now.getTime() / 1000) + 5;

    vi.mocked(useAuth).mockReturnValue({
      user: {
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        exp: futureExp,
        iat: Math.floor(now.getTime() / 1000),
      },
      signOut: mockSignOut,
      token: "expiring-token",
      isAuthenticated: true,
      signIn: vi.fn(),
    });

    render(<TokenExpirationGuard />);

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(authToasts.sessionExpired).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(5000);
    await vi.runAllTimersAsync();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Token expired, signing out automatically",
    );
    expect(authToasts.sessionExpired).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });

    consoleSpy.mockRestore();
  });

  it("should cleanup timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const futureExp = Math.floor(Date.now() / 1000) + 3600;

    vi.mocked(useAuth).mockReturnValue({
      user: {
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        exp: futureExp,
        iat: Math.floor(Date.now() / 1000),
      },
      signOut: mockSignOut,
      token: "valid-token",
      isAuthenticated: true,
      signIn: vi.fn(),
    });

    const { unmount } = render(<TokenExpirationGuard />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("should reset timer when user.exp changes", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const futureExp1 = Math.floor(Date.now() / 1000) + 3600;
    const futureExp2 = Math.floor(Date.now() / 1000) + 7200;

    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: {
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        exp: futureExp1,
        iat: Math.floor(Date.now() / 1000),
      },
      signOut: mockSignOut,
      token: "token-1",
      isAuthenticated: true,
      signIn: vi.fn(),
    });

    const { rerender } = render(<TokenExpirationGuard />);

    mockUseAuth.mockReturnValue({
      user: {
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        exp: futureExp2,
        iat: Math.floor(Date.now() / 1000),
      },
      signOut: mockSignOut,
      token: "token-2",
      isAuthenticated: true,
      signIn: vi.fn(),
    });

    rerender(<TokenExpirationGuard />);

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);

    clearTimeoutSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });
});
