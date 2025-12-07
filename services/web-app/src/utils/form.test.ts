import { describe, it, expect } from "vitest";
import { getFieldError, extractApiErrorMessage } from "./form";

describe("form utils", () => {
  describe("getFieldError", () => {
    it("should return undefined for empty errors array", () => {
      expect(getFieldError([])).toBeUndefined();
    });

    it("should return string error directly", () => {
      expect(getFieldError(["Email is required"])).toBe("Email is required");
    });

    it("should extract message from object with message property", () => {
      expect(getFieldError([{ message: "Password too weak" }])).toBe(
        "Password too weak"
      );
    });

    it("should return fallback for object without message property", () => {
      expect(getFieldError([{ error: "something" }])).toBe("Erro de validação");
    });

    it("should return fallback for null", () => {
      expect(getFieldError([null])).toBe("Erro de validação");
    });

    it("should return fallback for number", () => {
      expect(getFieldError([123])).toBe("Erro de validação");
    });

    it("should return first error when multiple errors exist", () => {
      expect(getFieldError(["First error", "Second error"])).toBe(
        "First error"
      );
    });
  });

  describe("extractApiErrorMessage", () => {
    it("should return first message from array", () => {
      expect(extractApiErrorMessage(["Error 1", "Error 2"])).toBe("Error 1");
    });

    it("should return string message directly", () => {
      expect(extractApiErrorMessage("Direct error message")).toBe(
        "Direct error message"
      );
    });

    it("should return default fallback for non-string/non-array", () => {
      expect(extractApiErrorMessage(null)).toBe("Erro inesperado");
      expect(extractApiErrorMessage(undefined)).toBe("Erro inesperado");
      expect(extractApiErrorMessage(123)).toBe("Erro inesperado");
      expect(extractApiErrorMessage({})).toBe("Erro inesperado");
    });

    it("should return custom fallback when provided", () => {
      expect(extractApiErrorMessage(null, "Custom fallback")).toBe(
        "Custom fallback"
      );
    });

    it("should return fallback for empty array", () => {
      expect(extractApiErrorMessage([])).toBe("Erro inesperado");
    });

    it("should return custom fallback for empty array", () => {
      expect(extractApiErrorMessage([], "Nenhum erro")).toBe("Nenhum erro");
    });
  });
});
