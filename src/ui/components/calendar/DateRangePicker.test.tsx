import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateRangePicker } from "./DateRangePicker";

describe("DateRangePicker", () => {
  it("falls back to the translated placeholder when no range is selected", () => {
    render(<DateRangePicker value={undefined} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Pick a date range" })).toBeInTheDocument();
  });

  it("labels an open-ended range with a single date", () => {
    render(<DateRangePicker value={{ from: new Date(2026, 4, 12) }} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "May 12, 2026" })).toBeInTheDocument();
  });

  it("labels a closed range with both dates", () => {
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 4, 12), to: new Date(2026, 4, 19) }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "May 12 - May 19, 2026" })).toBeInTheDocument();
  });

  it("exposes the e2e testid and tooltip only in iconOnly mode", () => {
    const { rerender } = render(<DateRangePicker iconOnly value={undefined} onChange={vi.fn()} />);

    const iconTrigger = screen.getByTestId("date-picker");
    expect(iconTrigger).toHaveAttribute("title", "Pick a date range");
    expect(iconTrigger).toHaveAttribute("aria-label", "Pick a date range");
    expect(iconTrigger).toHaveClass("size-8");

    rerender(<DateRangePicker value={undefined} onChange={vi.fn()} />);

    expect(screen.queryByTestId("date-picker")).toBeNull();
  });

  it("reports the picked range through onChange", async () => {
    const onChange = vi.fn();
    // `defaultMonth` follows value.from, so seeding one pins the visible month.
    render(<DateRangePicker value={{ from: new Date(2026, 4, 12) }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "May 12, 2026" }));

    fireEvent.click(await screen.findByRole("button", { name: /May 17th, 2026/ }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual({
      from: new Date(2026, 4, 12),
      to: new Date(2026, 4, 17),
    });
  });

  it("disables range selection when the disabled prop is set", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={undefined} onChange={onChange} disabled />);

    const trigger = screen.getByRole("button", { name: "Pick a date range" });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);

    await waitFor(() => expect(screen.queryByRole("button", { name: /12th May 2026/ })).toBeNull());
    expect(onChange).not.toHaveBeenCalled();
  });
});
