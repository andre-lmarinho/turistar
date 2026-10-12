import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import pt from "@/i18n/locales/pt-BR.json";
import { DateRangePicker } from "./DateRangePicker";

describe("DateRangePicker", () => {
  it.each([
    { to: undefined, label: "12 mai 2026" },
    { to: new Date(2026, 4, 19), label: "12 mai - 19 mai 2026" },
  ])("uses day-first labels in pt-BR: $label", ({ to, label }) => {
    const value = { from: new Date(2026, 4, 12), to };
    const { rerender } = render(
      <NextIntlClientProvider locale="pt-BR" messages={pt}>
        <DateRangePicker value={value} onChange={vi.fn()} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("button", { name: label })).toHaveTextContent(label);

    rerender(
      <NextIntlClientProvider locale="pt-BR" messages={pt}>
        <DateRangePicker iconOnly value={value} onChange={vi.fn()} />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("button", { name: label })).toHaveAttribute("title", label);
  });

  it("returns Date values with unchanged ISO serialization when picking in pt-BR", async () => {
    const onChange = vi.fn();
    render(
      <NextIntlClientProvider locale="pt-BR" messages={pt}>
        <DateRangePicker value={{ from: new Date(2026, 4, 12) }} onChange={onChange} />
      </NextIntlClientProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "12 mai 2026" }));
    fireEvent.click(await screen.findByRole("button", { name: /17.*maio.*2026/i }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const selected = onChange.mock.calls.at(-1)?.[0];
    expect(selected).toEqual({ from: new Date(2026, 4, 12), to: new Date(2026, 4, 17) });
    expect(selected.from.toISOString()).toBe("2026-05-12T00:00:00.000Z");
    expect(selected.to.toISOString()).toBe("2026-05-17T00:00:00.000Z");
  });

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

it("forwards form error semantics and the trigger ref", () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <>
      <label id="dates-label" htmlFor="dates">
        Travel dates
      </label>
      <DateRangePicker
        ref={ref}
        id="dates"
        value={undefined}
        onChange={vi.fn()}
        aria-labelledby="dates-label"
        aria-invalid
        aria-describedby="dates-error"
      />
      <p id="dates-error">Choose both dates</p>
    </>
  );
  expect(ref.current).toBe(screen.getByRole("button", { name: "Travel dates" }));
  expect(ref.current).toHaveAttribute("aria-invalid", "true");
  expect(ref.current).toHaveAccessibleDescription("Choose both dates");
});
