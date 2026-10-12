import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, Ref } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlannerCreationForm } from "./PlannerCreationForm";

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn(), pending: false }));
vi.mock("@/trpc/react", () => ({
  trpc: {
    viewer: {
      plan: { create: { useMutation: () => ({ mutateAsync: mocks.mutateAsync, isPending: mocks.pending }) } },
    },
  },
}));
vi.mock("@/features/search/components/LocationSearchInput", () => ({
  LocationSearchInput: ({
    id,
    inputRef,
    inputProps,
    value,
    onChange,
  }: {
    id: string;
    inputRef: Ref<HTMLInputElement>;
    inputProps: ComponentProps<"input">;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      {...inputProps}
      id={id}
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
vi.mock("@/ui/components/calendar/DateRangePicker", () => ({
  DateRangePicker: ({
    ref,
    onChange,
    value: _value,
    ...props
  }: ComponentProps<"button"> & {
    ref: Ref<HTMLButtonElement>;
    onChange: (value: undefined) => void;
    value: unknown;
  }) => (
    <button {...props} type="button" ref={ref} onClick={() => onChange(undefined)}>
      Travel dates
    </button>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.pending = false;
  mocks.mutateAsync.mockResolvedValue({ planId: "plan-1" });
});

describe("PlannerCreationForm", () => {
  it("focuses the missing destination and connects its inline error", () => {
    render(<PlannerCreationForm onPlanCreated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Create a trip" }));
    const destination = screen.getByLabelText("Destination");
    expect(destination).toHaveFocus();
    expect(destination).toHaveAttribute("aria-invalid", "true");
    expect(destination).toHaveAccessibleDescription("Please choose a destination.");
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    fireEvent.change(destination, { target: { value: "Lisbon" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("focuses incomplete dates without marking the valid destination invalid", () => {
    render(<PlannerCreationForm onPlanCreated={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Destination"), { target: { value: "Lisbon" } });
    const dates = screen.getByRole("button", { name: /Travel dates/ });
    fireEvent.click(dates);
    fireEvent.click(screen.getByRole("button", { name: "Create a trip" }));
    expect(dates).toHaveFocus();
    expect(dates).toHaveAccessibleDescription("Please select your travel dates.");
    expect(screen.getByLabelText("Destination")).toHaveAttribute("aria-invalid", "false");
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("prevents repeated creation, keeps entered values on failure and offers a retry", async () => {
    let reject: (cause: unknown) => void = () => {};
    mocks.mutateAsync.mockReturnValueOnce(
      new Promise((_, rejectPromise) => {
        reject = rejectPromise;
      })
    );
    const onPlanCreated = vi.fn();
    const onPendingChange = vi.fn();
    render(<PlannerCreationForm onPlanCreated={onPlanCreated} onPendingChange={onPendingChange} />);
    fireEvent.change(screen.getByLabelText("Destination"), { target: { value: "Lisbon" } });
    const form = screen.getByRole("button", { name: "Create a trip" }).closest("form");
    if (!form) throw new Error("Expected a trip creation form");
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
    expect(onPendingChange).toHaveBeenLastCalledWith(true);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => reject(new Error("Request failed")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to create plan. Please try again.");
    expect(screen.getByLabelText("Destination")).toHaveValue("Lisbon");
    expect(onPendingChange).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByRole("button", { name: "Create a trip" }));
    await waitFor(() => expect(screen.getByLabelText("Destination")).toHaveValue(""));
    expect(onPlanCreated).toHaveBeenCalledWith({ planId: "plan-1" });
    consoleError.mockRestore();
  });

  it("shows progress on the original action while retaining the form context", () => {
    mocks.pending = true;
    render(<PlannerCreationForm onPlanCreated={vi.fn()} />);
    const submit = screen.getByRole("button", { name: "Create a trip" });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Destination")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Travel dates/ })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Creating plan");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
