import { describe, expect, it, vi } from "vitest";
import type { CategoryKey } from "../types";
import { getBudgetRowInputs } from "./getBudgetRowInputs";

describe("getBudgetRowInputs", () => {
  it("returns input configs unchanged", () => {
    const description = {
      id: "desc",
      value: "Test entry",
      onChange: vi.fn(),
      placeholder: "Enter description",
    };
    const category = {
      id: "cat",
      value: "food" as CategoryKey,
      onChange: vi.fn(),
    };
    const amount = {
      id: "amt",
      value: "100",
      onValueChange: vi.fn(),
      placeholder: "0.00",
    };

    const result = getBudgetRowInputs({ description, category, amount });

    expect(result.description).toBe(description);
    expect(result.category).toBe(category);
    expect(result.amount).toBe(amount);
  });

  it("passes through all config properties", () => {
    const description = {
      id: "desc",
      value: "Hotel",
      onChange: vi.fn(),
      placeholder: "What was this for?",
      autoFocus: true,
      ariaLabel: "Entry description",
    };
    const category = {
      id: "cat",
      value: "lodging" as CategoryKey,
      onChange: vi.fn(),
      ariaLabel: "Entry category",
    };
    const amount = {
      id: "amt",
      value: "200",
      onValueChange: vi.fn(),
      onBlur: vi.fn(),
      placeholder: "0.00",
      ariaLabel: "Entry amount",
    };

    const result = getBudgetRowInputs({ description, category, amount });

    expect(result.description.placeholder).toBe("What was this for?");
    expect(result.description.autoFocus).toBe(true);
    expect(result.description.ariaLabel).toBe("Entry description");
    expect(result.category.ariaLabel).toBe("Entry category");
    expect(result.amount.onBlur).toBeDefined();
    expect(result.amount.ariaLabel).toBe("Entry amount");
  });

  it("works with empty values", () => {
    const description = {
      id: "desc",
      value: "",
      onChange: vi.fn(),
    };
    const category = {
      id: "cat",
      value: "transport" as CategoryKey,
      onChange: vi.fn(),
    };
    const amount = {
      id: "amt",
      value: "",
      onValueChange: vi.fn(),
    };

    const result = getBudgetRowInputs({ description, category, amount });

    expect(result.description.value).toBe("");
    expect(result.amount.value).toBe("");
  });
});
