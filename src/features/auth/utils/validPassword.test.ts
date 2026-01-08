import { describe, expect, it } from "vitest";

import { MIN_PASSWORD_LENGTH, validPassword } from "./validPassword";

describe("validPassword", () => {
  it("accepts passwords with minimum 6 characters", () => {
    expect(validPassword("123456")).toBe(true);
    expect(validPassword("abcdef")).toBe(true);
    expect(validPassword("a".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
  });

  it("rejects passwords shorter than 6 characters", () => {
    expect(validPassword("12345")).toBe(false);
    expect(validPassword("abc")).toBe(false);
    expect(validPassword("")).toBe(false);
  });

  it("accepts long passwords", () => {
    expect(validPassword("a".repeat(100))).toBe(true);
  });
});
