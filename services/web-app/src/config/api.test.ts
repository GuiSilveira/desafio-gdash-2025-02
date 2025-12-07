import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

vi.mock("@/utils/toast", () => ({
  authToasts: {
    unauthorizedRequest: vi.fn(),
  },
}));

vi.mock("@/utils/storage", () => ({
  tokenStorage: {
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockLocation = {
  pathname: "/dashboard",
  href: "",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

import { authToasts } from "@/utils/toast";
import { tokenStorage } from "@/utils/storage";

describe("api config", () => {
  let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
  let requestErrorInterceptor: (error: Error) => Promise<never>;
  let responseInterceptor: <T>(response: T) => T;
  let responseErrorInterceptor: (error: AxiosError) => Promise<never>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockLocation.pathname = "/dashboard";
    mockLocation.href = "";

    vi.resetModules();

    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn((onFulfilled, onRejected) => {
            requestInterceptor = onFulfilled;
            requestErrorInterceptor = onRejected;
          }),
        },
        response: {
          use: vi.fn((onFulfilled, onRejected) => {
            responseInterceptor = onFulfilled;
            responseErrorInterceptor = onRejected;
          }),
        },
      },
      get: vi.fn(),
      post: vi.fn(),
    };

    vi.spyOn(axios, "create").mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    await import("@/config/api");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("axios instance creation", () => {
    it("should create axios instance with correct config", () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });

  describe("request interceptor", () => {
    it("should add Authorization header when token exists", () => {
      vi.mocked(tokenStorage.get).mockReturnValue("test-token");

      const config = {
        headers: {},
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("should not add Authorization header when no token", () => {
      vi.mocked(tokenStorage.get).mockReturnValue(null);

      const config = {
        headers: {},
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should reject on request error", async () => {
      const error = new Error("Request failed");

      await expect(requestErrorInterceptor(error)).rejects.toThrow("Request failed");
    });
  });

  describe("response interceptor", () => {
    it("should pass through successful responses", () => {
      const response = { data: { message: "success" }, status: 200 };

      const result = responseInterceptor(response);

      expect(result).toEqual(response);
    });

    it("should handle 401 error by showing toast and clearing token", async () => {
      const error = {
        response: { status: 401 },
      } as AxiosError;

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);

      expect(authToasts.unauthorizedRequest).toHaveBeenCalled();
      expect(tokenStorage.remove).toHaveBeenCalled();
    });

    it("should redirect to login on 401 when not on login page", async () => {
      mockLocation.pathname = "/dashboard";

      const error = {
        response: { status: 401 },
      } as AxiosError;

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);

      expect(mockLocation.href).toBe("/login");
    });

    it("should not redirect when already on login page", async () => {
      mockLocation.pathname = "/login";

      const error = {
        response: { status: 401 },
      } as AxiosError;

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);

      expect(mockLocation.href).toBe("");
    });

    it("should not show toast for non-401 errors", async () => {
      const error = {
        response: { status: 500 },
      } as AxiosError;

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);

      expect(authToasts.unauthorizedRequest).not.toHaveBeenCalled();
      expect(tokenStorage.remove).not.toHaveBeenCalled();
    });

    it("should handle errors without response", async () => {
      const error = new Error("Network Error") as AxiosError;

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);

      expect(authToasts.unauthorizedRequest).not.toHaveBeenCalled();
    });

    it("should reject non-401 errors without modifications", async () => {
      const error = {
        response: { status: 404 },
        message: "Not found",
      } as AxiosError;

      await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    });
  });
});
