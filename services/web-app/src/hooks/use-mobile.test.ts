import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile, useIsLargeScreen } from "./use-mobile";

describe("use-mobile hooks", () => {
  let originalInnerWidth: number;
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let listeners: Map<string, Set<(e: MediaQueryListEvent) => void>>;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    listeners = new Map();

    matchMediaMock = vi.fn((query: string) => {
      const listenerSet = new Set<(e: MediaQueryListEvent) => void>();
      listeners.set(query, listenerSet);

      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(
          (event: string, callback: (e: MediaQueryListEvent) => void) => {
            if (event === "change") {
              listenerSet.add(callback);
            }
          },
        ),
        removeEventListener: vi.fn(
          (event: string, callback: (e: MediaQueryListEvent) => void) => {
            if (event === "change") {
              listenerSet.delete(callback);
            }
          },
        ),
        dispatchEvent: vi.fn(),
      };
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  describe("useIsMobile", () => {
    it("should return false for desktop viewport (>= 768px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it("should return true for mobile viewport (< 768px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 500,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it("should return false at exactly 768px (boundary)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 768,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it("should return true at 767px (boundary)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 767,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it("should call matchMedia with correct query", () => {
      renderHook(() => useIsMobile());
      expect(matchMediaMock).toHaveBeenCalledWith("(max-width: 767px)");
    });

    it("should add event listener on mount", () => {
      renderHook(() => useIsMobile());
      const mediaQueryList = matchMediaMock.mock.results[0]?.value;
      expect(mediaQueryList?.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("should remove event listener on unmount", () => {
      const { unmount } = renderHook(() => useIsMobile());
      const mediaQueryList = matchMediaMock.mock.results[0]?.value;
      unmount();
      expect(mediaQueryList?.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("should handle very small viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 320,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it("should handle tablet viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 800,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });
  });

  describe("useIsLargeScreen", () => {
    it("should return true for large viewport (>= 1024px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1440,
      });

      const { result } = renderHook(() => useIsLargeScreen());
      expect(result.current).toBe(true);
    });

    it("should return false for small viewport (< 1024px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 800,
      });

      const { result } = renderHook(() => useIsLargeScreen());
      expect(result.current).toBe(false);
    });

    it("should return true at exactly 1024px (boundary)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsLargeScreen());
      expect(result.current).toBe(true);
    });

    it("should return false at 1023px (boundary)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1023,
      });

      const { result } = renderHook(() => useIsLargeScreen());
      expect(result.current).toBe(false);
    });

    it("should call matchMedia with correct query", () => {
      renderHook(() => useIsLargeScreen());
      expect(matchMediaMock).toHaveBeenCalledWith("(min-width: 1024px)");
    });

    it("should add event listener on mount", () => {
      renderHook(() => useIsLargeScreen());
      const mediaQueryList = matchMediaMock.mock.results[0]?.value;
      expect(mediaQueryList?.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("should remove event listener on unmount", () => {
      const { unmount } = renderHook(() => useIsLargeScreen());
      const mediaQueryList = matchMediaMock.mock.results[0]?.value;
      unmount();
      expect(mediaQueryList?.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("should handle very large viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 2560,
      });

      const { result } = renderHook(() => useIsLargeScreen());
      expect(result.current).toBe(true);
    });
  });

  describe("onChange callback", () => {
    it("should update isMobile when window resizes (onChange callback)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);

      const listenerSet = listeners.get("(max-width: 767px)");
      expect(listenerSet).toBeDefined();
      expect(listenerSet?.size).toBeGreaterThan(0);

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 500,
      });

      act(() => {
        listenerSet?.forEach((callback) =>
          callback({ matches: true } as MediaQueryListEvent)
        );
      });

      expect(result.current).toBe(true);
    });

    it("should update isLarge when window resizes (onChange callback)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 800,
      });

      const { result } = renderHook(() => useIsLargeScreen());
      expect(result.current).toBe(false);

      const listenerSet = listeners.get("(min-width: 1024px)");
      expect(listenerSet).toBeDefined();
      expect(listenerSet?.size).toBeGreaterThan(0);

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1440,
      });

      act(() => {
        listenerSet?.forEach((callback) =>
          callback({ matches: true } as MediaQueryListEvent)
        );
      });

      expect(result.current).toBe(true);
    });
  });

  describe("hooks interaction", () => {
    it("should correctly identify mobile-only viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 500,
      });

      const { result: mobileResult } = renderHook(() => useIsMobile());
      const { result: largeResult } = renderHook(() => useIsLargeScreen());

      expect(mobileResult.current).toBe(true);
      expect(largeResult.current).toBe(false);
    });

    it("should correctly identify tablet viewport (between mobile and large)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 900,
      });

      const { result: mobileResult } = renderHook(() => useIsMobile());
      const { result: largeResult } = renderHook(() => useIsLargeScreen());

      expect(mobileResult.current).toBe(false);
      expect(largeResult.current).toBe(false);
    });

    it("should correctly identify large viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1440,
      });

      const { result: mobileResult } = renderHook(() => useIsMobile());
      const { result: largeResult } = renderHook(() => useIsLargeScreen());

      expect(mobileResult.current).toBe(false);
      expect(largeResult.current).toBe(true);
    });
  });
});
