import { describe, expect, it } from "vitest";
import { buildInitialDays, formatDay } from "./dayOperations";

describe("formatDay", () => {
  it("formats date into DayPlan id and label", () => {
    const date = new Date("2024-01-15T12:00:00");

    const result = formatDay(date);

    expect(result.id).toBe("2024-01-15");
    expect(result.label).toMatch(/Mon, 15 Jan/);
  });
});

describe("buildInitialDays", () => {
  it("creates empty days for each date", () => {
    const dates = [new Date("2024-01-01"), new Date("2024-01-02"), new Date("2024-01-03")];

    const result = buildInitialDays(dates);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("2024-01-01");
    expect(result[1].id).toBe("2024-01-02");
    expect(result[2].id).toBe("2024-01-03");
  });

  it("each day has empty activities array", () => {
    const dates = [new Date("2024-01-01")];

    const result = buildInitialDays(dates);

    expect(result[0].activities).toEqual([]);
  });

  it("handles single day", () => {
    const dates = [new Date("2024-03-15")];

    const result = buildInitialDays(dates);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2024-03-15");
  });

  it("handles empty array", () => {
    const result = buildInitialDays([]);

    expect(result).toEqual([]);
  });
});
