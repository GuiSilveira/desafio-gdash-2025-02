import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, AuthContext } from "./auth-context";
import { useContext } from "react";
import type { AuthContextType } from "@/types/auth";

vi.mock("@/utils/jwt", () => ({
  decodeJWT: vi.fn(),
}));

vi.mock("@/utils/toast", () => ({
  authToasts: {
    loginSuccess: vi.fn(),
    logoutSuccess: vi.fn(),
    invalidToken: vi.fn(),
    tokenExpired: vi.fn(),
    sessionExpiredOnLoad: vi.fn(),
  },
}));

vi.mock("@/utils/storage", () => ({
  tokenStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("@/config/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

import { decodeJWT } from "@/utils/jwt";
import { authToasts } from "@/utils/toast";
import { tokenStorage } from "@/utils/storage";
import { api } from "@/config/api";

function TestConsumer({
  onContext,
}: {
  onContext: (ctx: AuthContextType | undefined) => void;
}) {
  const context = useContext(AuthContext);
  onContext(context);
  return (
    <div>
      <span data-testid="authenticated">
        {String(context?.isAuthenticated)}
      </span>
      <span data-testid="token">{context?.token || "null"}</span>
      <span data-testid="user">{context?.user?.email || "null"}</span>
      <button onClick={() => context?.signIn("test-token")}>Sign In</button>
      <button onClick={() => context?.signOut()}>Sign Out</button>
    </div>
  );
}

function createUserPayload(overrides: {
  sub?: string;
  email?: string;
  name?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
}) {
  return {
    sub: overrides.sub ?? "user-1",
    email: overrides.email ?? "test@example.com",
    name: overrides.name ?? "Test User",
    roles: overrides.roles ?? ["user"],
    exp: overrides.exp ?? Math.floor(Date.now() / 1000) + 3600,
    iat: overrides.iat ?? Math.floor(Date.now() / 1000),
  };
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tokenStorage.get).mockReturnValue(null);
  });

  describe("initial state", () => {
    it("should start unauthenticated when no token in storage", () => {
      vi.mocked(tokenStorage.get).mockReturnValue(null);

      render(
        <AuthProvider>
          <TestConsumer onContext={() => {}} />
        </AuthProvider>
      );

      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("token")).toHaveTextContent("null");
    });

    it("should restore valid token from storage", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      vi.mocked(tokenStorage.get).mockReturnValue("stored-token");
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({ exp: futureExp })
      );

      render(
        <AuthProvider>
          <TestConsumer onContext={() => {}} />
        </AuthProvider>
      );

      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("token")).toHaveTextContent("stored-token");
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });

    it("should clear expired token from storage on load", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      vi.mocked(tokenStorage.get).mockReturnValue("expired-token");
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({ exp: pastExp, iat: pastExp - 3600 })
      );

      render(
        <AuthProvider>
          <TestConsumer onContext={() => {}} />
        </AuthProvider>
      );

      expect(tokenStorage.remove).toHaveBeenCalled();
      expect(authToasts.sessionExpiredOnLoad).toHaveBeenCalled();
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });

    it("should clear token when decoded is null", () => {
      vi.mocked(tokenStorage.get).mockReturnValue("invalid-token");
      vi.mocked(decodeJWT).mockReturnValue(null);

      render(
        <AuthProvider>
          <TestConsumer onContext={() => {}} />
        </AuthProvider>
      );

      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });
  });

  describe("signIn", () => {
    it("should sign in with valid token", async () => {
      const user = userEvent.setup();
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({
          email: "new@example.com",
          name: "New User",
          exp: futureExp,
        })
      );

      render(
        <AuthProvider>
          <TestConsumer onContext={() => {}} />
        </AuthProvider>
      );

      await user.click(screen.getByText("Sign In"));

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      });

      expect(tokenStorage.set).toHaveBeenCalledWith("test-token");
      expect(authToasts.loginSuccess).toHaveBeenCalledWith("New User");
    });

    it("should not sign in with invalid token (null decode)", async () => {
      vi.mocked(decodeJWT).mockReturnValue(null);

      let contextRef: AuthContextType | undefined;
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </AuthProvider>
      );

      let result: boolean | undefined;
      await act(async () => {
        result = contextRef?.signIn("invalid-token");
      });

      expect(result).toBe(false);
      expect(authToasts.invalidToken).toHaveBeenCalled();
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });

    it("should not sign in with token missing exp", async () => {
      vi.mocked(decodeJWT).mockReturnValue({
        sub: "user-1",
        email: "test@example.com",
        name: "Test",
        roles: ["user"],
        iat: Math.floor(Date.now() / 1000),
      } as ReturnType<typeof decodeJWT>);

      let contextRef: AuthContextType | undefined;
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </AuthProvider>
      );

      let result: boolean | undefined;
      await act(async () => {
        result = contextRef?.signIn("no-exp-token");
      });

      expect(result).toBe(false);
      expect(authToasts.invalidToken).toHaveBeenCalled();
    });

    it("should not sign in with expired token", async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({ exp: pastExp, iat: pastExp - 3600 })
      );

      let contextRef: AuthContextType | undefined;
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </AuthProvider>
      );

      let result: boolean | undefined;
      await act(async () => {
        result = contextRef?.signIn("expired-token");
      });

      expect(result).toBe(false);
      expect(authToasts.tokenExpired).toHaveBeenCalled();
    });

    it("should return true on successful sign in", async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({ name: "Test", exp: futureExp })
      );

      let contextRef: AuthContextType | undefined;
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </AuthProvider>
      );

      let result: boolean | undefined;
      await act(async () => {
        result = contextRef?.signIn("valid-token");
      });

      expect(result).toBe(true);
    });

    it("should use email as fallback when name is not provided", async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      vi.mocked(decodeJWT).mockReturnValue({
        sub: "user-1",
        email: "fallback@example.com",
        name: undefined as unknown as string,
        roles: ["user"],
        exp: futureExp,
        iat: Math.floor(Date.now() / 1000),
      });

      let contextRef: AuthContextType | undefined;
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </AuthProvider>
      );

      await act(async () => {
        contextRef?.signIn("valid-token");
      });

      expect(authToasts.loginSuccess).toHaveBeenCalledWith(
        "fallback@example.com"
      );
    });

    it("should use email as fallback when name is empty string", async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({
          email: "empty-name@example.com",
          name: "",
          exp: futureExp,
        })
      );

      let contextRef: AuthContextType | undefined;
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </AuthProvider>
      );

      await act(async () => {
        contextRef?.signIn("valid-token");
      });

      expect(authToasts.loginSuccess).toHaveBeenCalledWith(
        "empty-name@example.com"
      );
    });
  });

  describe("signOut", () => {
    it("should sign out and clear state", async () => {
      const user = userEvent.setup();
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      vi.mocked(tokenStorage.get).mockReturnValue("stored-token");
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({ exp: futureExp })
      );
      vi.mocked(api.post).mockResolvedValue({});

      render(
        <AuthProvider>
          <TestConsumer onContext={() => {}} />
        </AuthProvider>
      );

      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");

      await user.click(screen.getByText("Sign Out"));

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      });

      expect(api.post).toHaveBeenCalledWith("/auth/logout");
      expect(tokenStorage.remove).toHaveBeenCalled();
      expect(authToasts.logoutSuccess).toHaveBeenCalled();
    });

    it("should sign out even if backend logout fails", async () => {
      const user = userEvent.setup();
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      vi.mocked(tokenStorage.get).mockReturnValue("stored-token");
      vi.mocked(decodeJWT).mockReturnValue(
        createUserPayload({ exp: futureExp })
      );
      vi.mocked(api.post).mockRejectedValue(new Error("Network error"));

      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestConsumer onContext={() => {}} />
        </AuthProvider>
      );

      await user.click(screen.getByText("Sign Out"));

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      });

      expect(tokenStorage.remove).toHaveBeenCalled();
      expect(authToasts.logoutSuccess).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("context value", () => {
    it("should provide all expected values", () => {
      let contextRef: AuthContextType | undefined;
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </AuthProvider>
      );

      expect(contextRef).toHaveProperty("isAuthenticated");
      expect(contextRef).toHaveProperty("token");
      expect(contextRef).toHaveProperty("user");
      expect(contextRef).toHaveProperty("signIn");
      expect(contextRef).toHaveProperty("signOut");
      expect(typeof contextRef?.signIn).toBe("function");
      expect(typeof contextRef?.signOut).toBe("function");
    });
  });
});
