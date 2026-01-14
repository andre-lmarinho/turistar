import { describe, expect, it } from "vitest";

import { sanitizeActivityTitle } from "./sanitizeActivityTitle";

describe("sanitizeActivityTitle", () => {
  it("trims surrounding whitespace", () => {
    expect(sanitizeActivityTitle("  Morning walk  ")).toBe("Morning walk");
  });

  it("returns the default fallback when title is empty", () => {
    expect(sanitizeActivityTitle(undefined)).toBe("Untitled activity");
    expect(sanitizeActivityTitle("   ")).toBe("Untitled activity");
  });

  it("uses a custom fallback when provided", () => {
    expect(sanitizeActivityTitle(undefined, "Existing title")).toBe("Existing title");
    expect(sanitizeActivityTitle("", "Backup")).toBe("Backup");
  });
});
