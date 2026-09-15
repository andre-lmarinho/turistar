import { describe, expect, it } from "vitest";

import { getErrorMessage } from "./getErrorMessage";

describe("getErrorMessage", () => {
  it("extracts message from Error objects", () => {
    expect(getErrorMessage(new Error("Test error"))).toBe("Test error");
    expect(getErrorMessage(new TypeError("Type error"))).toBe("Type error");
  });

  it("returns string errors directly", () => {
    expect(getErrorMessage("String error")).toBe("String error");
  });

  it("extracts message property from objects", () => {
    expect(getErrorMessage({ message: "Object error" })).toBe("Object error");
  });

  it("returns null for empty or whitespace-only messages", () => {
    expect(getErrorMessage(new Error(""))).toBeNull();
    expect(getErrorMessage(new Error("   "))).toBeNull();
    expect(getErrorMessage("")).toBeNull();
    expect(getErrorMessage("   ")).toBeNull();
    expect(getErrorMessage({ message: "" })).toBeNull();
    expect(getErrorMessage({ message: "   " })).toBeNull();
  });

  it("returns null for invalid inputs", () => {
    expect(getErrorMessage(null)).toBeNull();
    expect(getErrorMessage(undefined)).toBeNull();
    expect(getErrorMessage(123)).toBeNull();
    expect(getErrorMessage(true)).toBeNull();
    expect(getErrorMessage({})).toBeNull();
    expect(getErrorMessage({ message: 123 })).toBeNull();
  });
});
