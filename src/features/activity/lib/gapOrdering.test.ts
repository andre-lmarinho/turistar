import { describe, expect, it } from "vitest";

import { midpoint, normalizePositions, POSITION_SCALE, parsePosition } from "./gapOrdering";

describe("parsePosition", () => {
  it("treats blank and malformed positions as missing", () => {
    expect(parsePosition(undefined)).toBeNull();
    expect(parsePosition("")).toBeNull();
    expect(parsePosition("   ")).toBeNull();
    expect(parsePosition("abc")).toBeNull();
  });

  it("parses finite numeric positions", () => {
    expect(parsePosition("1024")).toBe(1024);
    expect(parsePosition(" -12.5 ")).toBe(-12.5);
  });

  it("rejects non-finite numbers", () => {
    expect(parsePosition("Infinity")).toBeNull();
    expect(parsePosition("NaN")).toBeNull();
  });
});

describe("midpoint", () => {
  it("starts an empty list at the scale", () => {
    expect(midpoint()).toBe(String(POSITION_SCALE));
  });

  it("appends after the last activity", () => {
    expect(midpoint("512")).toBe(String(512 + POSITION_SCALE));
  });

  it("prepends before the first activity", () => {
    expect(midpoint(undefined, "512")).toBe("256");
    expect(midpoint(undefined, "0")).toBe(String(POSITION_SCALE));
  });

  it("fits between two neighbors", () => {
    expect(midpoint("512", "1024")).toBe("768");
  });

  it("keeps equal neighbors stable so arrival order decides", () => {
    expect(midpoint("512", "512")).toBe("512");
  });

  it("treats malformed neighbors as zero", () => {
    expect(midpoint("abc", "512")).toBe("256");
  });
});

describe("normalizePositions", () => {
  it("fills only missing positions and keeps existing values", () => {
    const items = [{ id: "a", position: "2048" }, { id: "b", position: "" }, { id: "c" }];

    expect(normalizePositions(items)).toEqual([
      { id: "a", position: "2048" },
      { id: "b", position: String(2 * POSITION_SCALE) },
      { id: "c", position: String(3 * POSITION_SCALE) },
    ]);
  });

  it("returns the same array when nothing is missing", () => {
    const items = [{ id: "a", position: "512" }];
    expect(normalizePositions(items)).toBe(items);
  });
});
