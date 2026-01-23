import { describe, expect, it } from "vitest";
import { normalizeAmount } from "./normalizeAmount";

describe("normalizeAmount", () => {
  it("parses simple number string", () => {
    const result = normalizeAmount("100");

    expect(result).toBe(100);
  });

  it("handles decimal numbers", () => {
    const result = normalizeAmount("99.99");

    expect(result).toBe(99.99);
  });

  it("strips currency symbols", () => {
    const result = normalizeAmount("$100");

    expect(result).toBe(100);
  });

  it("strips spaces", () => {
    const result = normalizeAmount("1 000");

    expect(result).toBe(1000);
  });

  it("removes thousands separators", () => {
    const result = normalizeAmount("1,000");

    expect(result).toBe(1000);
  });

  it("handles multiple commas", () => {
    const result = normalizeAmount("1,000,000");

    expect(result).toBe(1000000);
  });

  it("removes other non-numeric characters", () => {
    const result = normalizeAmount("abc123xyz");

    expect(result).toBe(123);
  });

  it("removes currency symbols with decimals", () => {
    const result = normalizeAmount("$1,234.56");

    expect(result).toBe(1234.56);
  });

  it("handles leading zeros", () => {
    const result = normalizeAmount("007");

    expect(result).toBe(7);
  });

  it("handles only zeros", () => {
    const result = normalizeAmount("0");

    expect(result).toBe(0);
  });

  it("handles empty string", () => {
    const result = normalizeAmount("");

    expect(result).toBe(0);
  });

  it("handles whitespace only", () => {
    const result = normalizeAmount("   ");

    expect(result).toBe(0);
  });

  it("handles non-numeric characters only", () => {
    const result = normalizeAmount("abc");

    expect(result).toBe(0);
  });

  it("handles special characters", () => {
    const result = normalizeAmount("€100");

    expect(result).toBe(100);
  });

  it("does not support Brazilian currency format (known limitation)", () => {
    const result = normalizeAmount("R$ 1.000,00");

    expect(result).toBe(1);
  });

  it("extracts numbers from mixed input", () => {
    const result = normalizeAmount("abc123def456ghi");

    expect(result).toBe(123456);
  });

  it("preserves decimal precision", () => {
    const result = normalizeAmount("123.456");

    expect(result).toBe(123.456);
  });

  it("handles large numbers", () => {
    const result = normalizeAmount("9999999999");

    expect(result).toBe(9999999999);
  });

  it("handles very small decimals", () => {
    const result = normalizeAmount("0.001");

    expect(result).toBe(0.001);
  });
});
