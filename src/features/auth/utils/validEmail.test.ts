import { describe, expect, it } from "vitest";

import { validEmail } from "./validEmail";

describe("validEmail", () => {
  it("accepts valid email formats", () => {
    expect(validEmail("user@example.com")).toBe(true);
    expect(validEmail("test.user@domain.co")).toBe(true);
    expect(validEmail("name+tag@example.org")).toBe(true);
  });

  it("trims whitespace before validation", () => {
    expect(validEmail("  user@example.com  ")).toBe(true);
  });

  it("rejects invalid email formats", () => {
    expect(validEmail("")).toBe(false);
    expect(validEmail("invalid")).toBe(false);
    expect(validEmail("@example.com")).toBe(false);
    expect(validEmail("user@")).toBe(false);
    expect(validEmail("user@domain")).toBe(false);
    expect(validEmail("user domain@example.com")).toBe(false);
  });
});
