import { describe, expect, it } from "vitest";

import { resolveNextPath } from "./redirect";

describe("resolveNextPath", () => {
  it.each(["/p/plan-1", "/p/plan-1?mode=map", "/u/andre#trips"])(
    "accepts local destination %s",
    (destination) => {
      expect(resolveNextPath(destination)).toBe(destination);
    }
  );

  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "///evil.example/path",
    "/\\evil.example/path",
    "\\evil.example/path",
  ])("rejects cross-origin destination %s", (destination) => {
    expect(resolveNextPath(destination)).toBeNull();
  });

  it.each([undefined, null, 42, "plan-1", "https://"])("rejects invalid destination %s", (destination) => {
    expect(resolveNextPath(destination)).toBeNull();
  });
});
