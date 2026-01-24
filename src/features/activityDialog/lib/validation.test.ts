import { describe, expect, it } from "vitest";
import type { ActivityFormValues } from "../types";
import { isValidTitle, validateForm } from "./validation";

const createValidValues = (overrides: Partial<ActivityFormValues> = {}): ActivityFormValues => ({
  title: "Visit Museum",
  description: "A great museum",
  duration: 120,
  budget: 50,
  address: "123 Main St",
  color: "bg-[var(--color-0)]",
  ...overrides,
});

describe("validation", () => {
  describe("validateForm", () => {
    it("returns valid=true when all fields are valid", () => {
      const values = createValidValues();

      const result = validateForm(values);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("returns error for empty title", () => {
      const values = createValidValues({ title: "   " });

      const result = validateForm(values);

      expect(result.valid).toBe(false);
      expect(result.errors.title).toBe("Title is required");
    });

    it("returns error for negative duration", () => {
      const values = createValidValues({ duration: -10 });

      const result = validateForm(values);

      expect(result.valid).toBe(false);
      expect(result.errors.duration).toBe("Duration cannot be negative");
    });

    it("returns error for negative budget", () => {
      const values = createValidValues({ budget: -100 });

      const result = validateForm(values);

      expect(result.valid).toBe(false);
      expect(result.errors.budget).toBe("Budget cannot be negative");
    });

    it("returns multiple errors when multiple fields are invalid", () => {
      const values = createValidValues({
        title: "",
        duration: -5,
        budget: -50,
      });

      const result = validateForm(values);

      expect(result.valid).toBe(false);
      expect(result.errors.title).toBe("Title is required");
      expect(result.errors.duration).toBe("Duration cannot be negative");
      expect(result.errors.budget).toBe("Budget cannot be negative");
    });

    it("accepts zero duration and budget", () => {
      const values = createValidValues({ duration: 0, budget: 0 });

      const result = validateForm(values);

      expect(result.valid).toBe(true);
    });

    it("trims title for validation", () => {
      const values = createValidValues({ title: "  Valid Title  " });

      const result = validateForm(values);

      expect(result.valid).toBe(true);
    });
  });

  describe("isValidTitle", () => {
    it("returns true for non-empty trimmed string", () => {
      expect(isValidTitle("Activity")).toBe(true);
      expect(isValidTitle("  Activity  ")).toBe(true);
      expect(isValidTitle("A")).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isValidTitle("")).toBe(false);
    });

    it("returns false for whitespace-only string", () => {
      expect(isValidTitle("   ")).toBe(false);
      expect(isValidTitle("\t\n")).toBe(false);
    });
  });
});
