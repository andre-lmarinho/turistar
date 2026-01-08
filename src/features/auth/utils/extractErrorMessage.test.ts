import { describe, expect, it } from "vitest";

import { extractErrorMessage, getAuthErrorMessage } from "./extractErrorMessage";

describe("extractErrorMessage", () => {
  it("extracts message from Error objects", () => {
    expect(extractErrorMessage(new Error("Test error"))).toBe("Test error");
    expect(extractErrorMessage(new TypeError("Type error"))).toBe("Type error");
  });

  it("returns string errors directly", () => {
    expect(extractErrorMessage("String error")).toBe("String error");
  });

  it("extracts message property from objects", () => {
    expect(extractErrorMessage({ message: "Object error" })).toBe("Object error");
  });

  it("returns null for empty or whitespace-only messages", () => {
    expect(extractErrorMessage(new Error(""))).toBeNull();
    expect(extractErrorMessage(new Error("   "))).toBeNull();
    expect(extractErrorMessage("")).toBeNull();
    expect(extractErrorMessage("   ")).toBeNull();
    expect(extractErrorMessage({ message: "" })).toBeNull();
    expect(extractErrorMessage({ message: "   " })).toBeNull();
  });

  it("returns null for invalid inputs", () => {
    expect(extractErrorMessage(null)).toBeNull();
    expect(extractErrorMessage(undefined)).toBeNull();
    expect(extractErrorMessage(123)).toBeNull();
    expect(extractErrorMessage(true)).toBeNull();
    expect(extractErrorMessage({})).toBeNull();
    expect(extractErrorMessage({ message: 123 })).toBeNull();
  });
});

describe("getAuthErrorMessage", () => {
  it("returns extracted message when available", () => {
    expect(getAuthErrorMessage(new Error("Auth failed"), "Fallback")).toBe("Auth failed");
    expect(getAuthErrorMessage("String error", "Fallback")).toBe("String error");
    expect(getAuthErrorMessage({ message: "Object error" }, "Fallback")).toBe("Object error");
  });

  it("returns fallback when extraction fails", () => {
    expect(getAuthErrorMessage(null, "Fallback")).toBe("Fallback");
    expect(getAuthErrorMessage(undefined, "Fallback")).toBe("Fallback");
    expect(getAuthErrorMessage(123, "Fallback")).toBe("Fallback");
    expect(getAuthErrorMessage(new Error(""), "Fallback")).toBe("Fallback");
  });
});
