import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragScroll } from "./use-drag-scroll";

describe("useDragScroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should return ref, onMouseDown, scrollBack, and scrollForward", () => {
      const { result } = renderHook(() => useDragScroll());

      expect(result.current.ref).toBeDefined();
      expect(result.current.onMouseDown).toBeDefined();
      expect(result.current.scrollBack).toBeDefined();
      expect(result.current.scrollForward).toBeDefined();
    });

    it("should initialize with default options", () => {
      const { result } = renderHook(() => useDragScroll());
      expect(result.current.ref.current).toBeNull();
    });

    it("should accept custom speed option", () => {
      const { result } = renderHook(() => useDragScroll({ speed: 2.0 }));
      expect(result.current).toBeDefined();
    });

    it("should accept horizontal direction option", () => {
      const { result } = renderHook(() => useDragScroll({ direction: "horizontal" }));
      expect(result.current).toBeDefined();
    });

    it("should accept vertical direction option", () => {
      const { result } = renderHook(() => useDragScroll({ direction: "vertical" }));
      expect(result.current).toBeDefined();
    });
  });

  describe("scrollBack", () => {
    it("should not throw when ref is null", () => {
      const { result } = renderHook(() => useDragScroll());

      expect(() => {
        act(() => {
          result.current.scrollBack();
        });
      }).not.toThrow();
    });

    it("should call scrollBy with default amount when ref is set", () => {
      const mockScrollBy = vi.fn();
      const mockElement = {
        scrollBy: mockScrollBy,
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll());

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      act(() => {
        result.current.scrollBack();
      });

      expect(mockScrollBy).toHaveBeenCalledWith({
        left: -200,
        behavior: "smooth",
      });
    });

    it("should call scrollBy with custom amount", () => {
      const mockScrollBy = vi.fn();
      const mockElement = {
        scrollBy: mockScrollBy,
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll());

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      act(() => {
        result.current.scrollBack(100);
      });

      expect(mockScrollBy).toHaveBeenCalledWith({
        left: -100,
        behavior: "smooth",
      });
    });

    it("should scroll vertically when direction is vertical", () => {
      const mockScrollBy = vi.fn();
      const mockElement = {
        scrollBy: mockScrollBy,
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll({ direction: "vertical" }));

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      act(() => {
        result.current.scrollBack();
      });

      expect(mockScrollBy).toHaveBeenCalledWith({
        top: -200,
        behavior: "smooth",
      });
    });
  });

  describe("scrollForward", () => {
    it("should not throw when ref is null", () => {
      const { result } = renderHook(() => useDragScroll());

      expect(() => {
        act(() => {
          result.current.scrollForward();
        });
      }).not.toThrow();
    });

    it("should call scrollBy with positive amount", () => {
      const mockScrollBy = vi.fn();
      const mockElement = {
        scrollBy: mockScrollBy,
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll());

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      act(() => {
        result.current.scrollForward();
      });

      expect(mockScrollBy).toHaveBeenCalledWith({
        left: 200,
        behavior: "smooth",
      });
    });

    it("should call scrollBy with custom amount", () => {
      const mockScrollBy = vi.fn();
      const mockElement = {
        scrollBy: mockScrollBy,
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll());

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      act(() => {
        result.current.scrollForward(300);
      });

      expect(mockScrollBy).toHaveBeenCalledWith({
        left: 300,
        behavior: "smooth",
      });
    });

    it("should scroll vertically when direction is vertical", () => {
      const mockScrollBy = vi.fn();
      const mockElement = {
        scrollBy: mockScrollBy,
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll({ direction: "vertical" }));

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      act(() => {
        result.current.scrollForward();
      });

      expect(mockScrollBy).toHaveBeenCalledWith({
        top: 200,
        behavior: "smooth",
      });
    });
  });

  describe("onMouseDown", () => {
    it("should not throw when ref is null", () => {
      const { result } = renderHook(() => useDragScroll());

      const mockEvent = {
        pageX: 100,
        pageY: 100,
      } as React.MouseEvent;

      expect(() => {
        act(() => {
          result.current.onMouseDown(mockEvent);
        });
      }).not.toThrow();
    });

    it("should set cursor to grabbing on mousedown", () => {
      const mockElement = {
        scrollBy: vi.fn(),
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll());

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      const mockEvent = {
        pageX: 100,
        pageY: 100,
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      expect(mockElement.style.cursor).toBe("grabbing");
    });

    it("should add mousemove and mouseup event listeners", () => {
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      const mockElement = {
        scrollBy: vi.fn(),
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll());

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      const mockEvent = {
        pageX: 100,
        pageY: 100,
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it("should update scrollLeft on horizontal mousemove", () => {
      const mockElement = {
        scrollBy: vi.fn(),
        scrollLeft: 100,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll({ direction: "horizontal", speed: 1 }));

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      let mousemoveHandler: ((e: MouseEvent) => void) | null = null;
      const addEventListenerSpy = vi.spyOn(document, "addEventListener").mockImplementation((event, handler) => {
        if (event === "mousemove") {
          mousemoveHandler = handler as (e: MouseEvent) => void;
        }
      });

      const mouseDownEvent = {
        pageX: 100,
        pageY: 0,
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });

      if (mousemoveHandler) {
        const mouseMoveEvent = { pageX: 150, pageY: 0 } as MouseEvent;
        act(() => {
          mousemoveHandler!(mouseMoveEvent);
        });
      }

      expect(mockElement.scrollLeft).toBeDefined();

      addEventListenerSpy.mockRestore();
    });

    it("should update scrollTop on vertical mousemove", () => {
      const mockElement = {
        scrollBy: vi.fn(),
        scrollLeft: 0,
        scrollTop: 100,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll({ direction: "vertical", speed: 1 }));

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      let mousemoveHandler: ((e: MouseEvent) => void) | null = null;
      const addEventListenerSpy = vi.spyOn(document, "addEventListener").mockImplementation((event, handler) => {
        if (event === "mousemove") {
          mousemoveHandler = handler as (e: MouseEvent) => void;
        }
      });

      const mouseDownEvent = {
        pageX: 0,
        pageY: 100,
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });

      if (mousemoveHandler) {
        const mouseMoveEvent = { pageX: 0, pageY: 150 } as MouseEvent;
        act(() => {
          mousemoveHandler!(mouseMoveEvent);
        });
      }

      expect(mockElement.scrollTop).toBeDefined();

      addEventListenerSpy.mockRestore();
    });

    it("should remove event listeners and reset cursor on mouseup", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      
      const mockElement = {
        scrollBy: vi.fn(),
        scrollLeft: 0,
        scrollTop: 0,
        offsetLeft: 0,
        offsetTop: 0,
        style: { cursor: "" },
      } as unknown as HTMLDivElement;

      const { result } = renderHook(() => useDragScroll());

      Object.defineProperty(result.current.ref, "current", {
        value: mockElement,
        writable: true,
      });

      let mouseupHandler: (() => void) | null = null;
      const addEventListenerSpy = vi.spyOn(document, "addEventListener").mockImplementation((event, handler) => {
        if (event === "mouseup") {
          mouseupHandler = handler as () => void;
        }
      });

      const mouseDownEvent = {
        pageX: 100,
        pageY: 100,
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mouseDownEvent);
      });

      expect(mockElement.style.cursor).toBe("grabbing");

      if (mouseupHandler) {
        act(() => {
          mouseupHandler!();
        });
      }

      expect(mockElement.style.cursor).toBe("grab");
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
