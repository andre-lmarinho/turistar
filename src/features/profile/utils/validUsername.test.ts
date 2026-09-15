import { describe, expect, it } from "vitest";

import { normalizeUsername, validUsername } from "./validUsername";

describe("validateUsername", () => {
  it("normalizes to lowercase and trims whitespace", () => {
    expect(normalizeUsername("  User-Name  ")).toBe("user-name");
  });

  it("accepts valid usernames within 1-28 chars", () => {
    expect(validUsername("a")).toBe(true);
    expect(validUsername("user-name-123")).toBe(true);
    expect(validUsername("a".repeat(28))).toBe(true);
  });

  it("rejects usernames outside the allowed length", () => {
    expect(validUsername("")).toBe(false);
    expect(validUsername("a".repeat(29))).toBe(false);
  });

  it("rejects usernames with invalid characters or placement", () => {
    expect(validUsername("user_name")).toBe(false);
    expect(validUsername("-username")).toBe(false);
    expect(validUsername("username-")).toBe(false);
  });
});
