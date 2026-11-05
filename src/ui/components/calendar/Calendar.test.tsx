import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Calendar } from "./Calendar";

describe("Calendar", () => {
  it("preserves the day buttons and focus when its parent rerenders", () => {
    const props = { defaultMonth: new Date(2026, 10, 1), mode: "single" } as const;
    const { rerender } = render(<Calendar {...props} />);
    const dayButton = screen.getAllByRole("button").find((button) => button.hasAttribute("data-day"));
    expect(dayButton).toBeDefined();
    dayButton?.focus();

    rerender(<Calendar {...props} className="updated" />);

    expect(dayButton).toBeInTheDocument();
    expect(dayButton).toHaveFocus();
  });
});
