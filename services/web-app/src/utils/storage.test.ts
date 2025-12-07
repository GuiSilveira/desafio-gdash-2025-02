import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getStorage,
  setStorage,
  createMemoryStorage,
  tokenStorage,
  themeStorage,
  aiAutoModeStorage,
  searchedLocationStorage,
  type StorageService,
} from "./storage";

describe("storage utils", () => {
  beforeEach(() => {
    const memoryStorage = createMemoryStorage();
    setStorage(memoryStorage);
    memoryStorage.clear();
  });

  describe("createMemoryStorage", () => {
    it("should create an in-memory storage instance", () => {
      const storage = createMemoryStorage();
      expect(storage).toBeDefined();
      expect(storage.get).toBeDefined();
      expect(storage.set).toBeDefined();
      expect(storage.remove).toBeDefined();
      expect(storage.clear).toBeDefined();
    });

    it("should store and retrieve string values", () => {
      const storage = createMemoryStorage();
      storage.set("key", "value");
      expect(storage.get("key")).toBe("value");
    });

    it("should store and retrieve object values", () => {
      const storage = createMemoryStorage();
      const obj = { name: "test", count: 42 };
      storage.set("obj", obj);
      expect(storage.get("obj")).toEqual(obj);
    });

    it("should store and retrieve array values", () => {
      const storage = createMemoryStorage();
      const arr = [1, 2, 3, "four"];
      storage.set("arr", arr);
      expect(storage.get("arr")).toEqual(arr);
    });

    it("should return null for non-existent keys", () => {
      const storage = createMemoryStorage();
      expect(storage.get("nonexistent")).toBeNull();
    });

    it("should remove values", () => {
      const storage = createMemoryStorage();
      storage.set("key", "value");
      expect(storage.get("key")).toBe("value");
      storage.remove("key");
      expect(storage.get("key")).toBeNull();
    });

    it("should clear all values", () => {
      const storage = createMemoryStorage();
      storage.set("key1", "value1");
      storage.set("key2", "value2");
      storage.clear();
      expect(storage.get("key1")).toBeNull();
      expect(storage.get("key2")).toBeNull();
    });

    it("should store and retrieve boolean values", () => {
      const storage = createMemoryStorage();
      storage.set("bool-true", true);
      storage.set("bool-false", false);
      expect(storage.get("bool-true")).toBe(true);
      expect(storage.get("bool-false")).toBe(false);
    });

    it("should store and retrieve number values", () => {
      const storage = createMemoryStorage();
      storage.set("num", 42);
      storage.set("float", 3.14);
      expect(storage.get("num")).toBe(42);
      expect(storage.get("float")).toBe(3.14);
    });

    it("should store and retrieve null value as JSON", () => {
      const storage = createMemoryStorage();
      storage.set("null-val", null);
      expect(storage.get("null-val")).toBeNull();
    });

    it("should handle nested objects", () => {
      const storage = createMemoryStorage();
      const nested = { user: { name: "Test", settings: { theme: "dark" } } };
      storage.set("nested", nested);
      expect(storage.get("nested")).toEqual(nested);
    });

    it("should overwrite existing values", () => {
      const storage = createMemoryStorage();
      storage.set("key", "value1");
      storage.set("key", "value2");
      expect(storage.get("key")).toBe("value2");
    });

    it("should handle removing non-existent key gracefully", () => {
      const storage = createMemoryStorage();
      expect(() => storage.remove("nonexistent")).not.toThrow();
    });
  });

  describe("getStorage", () => {
    it("should return the current storage instance", () => {
      const storage = getStorage();
      expect(storage).toBeDefined();
    });

    it("should return same instance on multiple calls", () => {
      const storage1 = getStorage();
      const storage2 = getStorage();
      expect(storage1).toBe(storage2);
    });
  });

  describe("setStorage", () => {
    it("should allow setting a custom storage implementation", () => {
      const customStorage: StorageService = {
        get: vi.fn().mockReturnValue("custom-value"),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
      };

      setStorage(customStorage);
      const result = getStorage().get("test");
      expect(result).toBe("custom-value");
    });

    it("should replace existing storage implementation", () => {
      const storage1 = createMemoryStorage();
      const storage2 = createMemoryStorage();

      setStorage(storage1);
      storage1.set("key", "value1");

      setStorage(storage2);
      storage2.set("key", "value2");

      expect(getStorage().get("key")).toBe("value2");
    });
  });

  describe("tokenStorage", () => {
    it("should set and get token", () => {
      tokenStorage.set("test-token-123");
      expect(tokenStorage.get()).toBe("test-token-123");
    });

    it("should return null when no token is set", () => {
      expect(tokenStorage.get()).toBeNull();
    });

    it("should remove token", () => {
      tokenStorage.set("test-token");
      tokenStorage.remove();
      expect(tokenStorage.get()).toBeNull();
    });
  });

  describe("themeStorage", () => {
    it("should set and get theme", () => {
      themeStorage.set("dark");
      expect(themeStorage.get()).toBe("dark");
    });

    it("should return null when no theme is set", () => {
      expect(themeStorage.get()).toBeNull();
    });

    it("should remove theme", () => {
      themeStorage.set("light");
      themeStorage.remove();
      expect(themeStorage.get()).toBeNull();
    });
  });

  describe("aiAutoModeStorage", () => {
    it("should set and get auto mode", () => {
      aiAutoModeStorage.set(true);
      expect(aiAutoModeStorage.get()).toBe(true);
    });

    it("should return false by default when not set", () => {
      expect(aiAutoModeStorage.get()).toBe(false);
    });

    it("should remove auto mode", () => {
      aiAutoModeStorage.set(true);
      aiAutoModeStorage.remove();
      expect(aiAutoModeStorage.get()).toBe(false);
    });

    it("should handle false value", () => {
      aiAutoModeStorage.set(false);
      expect(aiAutoModeStorage.get()).toBe(false);
    });
  });

  describe("searchedLocationStorage", () => {
    it("should set and get searched location", () => {
      searchedLocationStorage.set("São Paulo");
      expect(searchedLocationStorage.get()).toBe("São Paulo");
    });

    it("should return null when no location is set", () => {
      expect(searchedLocationStorage.get()).toBeNull();
    });

    it("should remove searched location", () => {
      searchedLocationStorage.set("Rio de Janeiro");
      searchedLocationStorage.remove();
      expect(searchedLocationStorage.get()).toBeNull();
    });

    it("should handle special characters", () => {
      searchedLocationStorage.set("São Paulo, Brasil");
      expect(searchedLocationStorage.get()).toBe("São Paulo, Brasil");
    });
  });

  describe("LocalStorageService (via real localStorage)", () => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
      };
    })();

    beforeEach(() => {
      Object.defineProperty(globalThis, "localStorage", {
        value: localStorageMock,
        writable: true,
      });
      localStorageMock.clear();
      vi.clearAllMocks();
      setStorage(null as unknown as StorageService);
    });

    afterEach(() => {
      setStorage(createMemoryStorage());
    });

    it("should get string value from localStorage", () => {
      localStorageMock.setItem("test-key", "test-value");
      
      const storage = getStorage();
      const result = storage.get<string>("test-key");
      
      expect(result).toBe("test-value");
    });

    it("should get JSON parsed value from localStorage", () => {
      const obj = { name: "test", value: 42 };
      localStorageMock.setItem("json-key", JSON.stringify(obj));
      
      const storage = getStorage();
      const result = storage.get<typeof obj>("json-key");
      
      expect(result).toEqual(obj);
    });

    it("should return null for non-existent key", () => {
      const storage = getStorage();
      const result = storage.get("nonexistent");
      
      expect(result).toBeNull();
    });

    it("should return string when JSON parse fails", () => {
      localStorageMock.setItem("invalid-json", "not-valid-json");
      
      const storage = getStorage();
      const result = storage.get<string>("invalid-json");
      
      expect(result).toBe("not-valid-json");
    });

    it("should set string value directly", () => {
      const storage = getStorage();
      storage.set("string-key", "string-value");
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith("string-key", "string-value");
    });

    it("should set object value as JSON", () => {
      const storage = getStorage();
      const obj = { name: "test" };
      storage.set("obj-key", obj);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith("obj-key", JSON.stringify(obj));
    });

    it("should handle error when setting value", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("Storage full");
      });
      
      const storage = getStorage();
      
      expect(() => storage.set("key", "value")).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error saving to localStorage:", expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it("should remove value from localStorage", () => {
      const storage = getStorage();
      storage.remove("key-to-remove");
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("key-to-remove");
    });

    it("should clear all values from localStorage", () => {
      const storage = getStorage();
      storage.clear();
      
      expect(localStorageMock.clear).toHaveBeenCalled();
    });

    it("should create LocalStorageService when no instance exists", () => {
      setStorage(null as unknown as StorageService);
      
      const storage = getStorage();
      
      expect(storage).toBeDefined();
      expect(typeof storage.get).toBe("function");
      expect(typeof storage.set).toBe("function");
    });
  });
});
