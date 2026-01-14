import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";

const { mutateSpy } = vi.hoisted(() => {
  const fn = vi.fn(async (variables: { dayId: string; title: string; index?: number }) => ({
    id: "mock-id",
    title: variables.title,
  }));
  return { mutateSpy: fn };
});

vi.mock("@/features/app/planner/components/ui/ActivitySearchInput", () => ({
  ActivitySearchInput: ({
    value,
    onChange,
    inputRef,
    onInputKeyDown,
    inputProps,
  }: {
    value: string;
    onChange: (val: string) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
    onInputKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }) => (
    <input
      data-testid="planner-inline-add-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onInputKeyDown}
      ref={inputRef}
      {...inputProps}
    />
  ),
}));

import { ACTIVITY_COPY } from "@/features/app/planner/domain/constants/activity";
import { InlineCard } from "./InlineCard";

const insertActivityAt = vi.fn();
const replaceActivity = vi.fn();
const removeActivity = vi.fn();

vi.mock("@/features/app/planner/hooks/PlannerContext", () => ({
  usePlannerContext: () => ({
    updateActivity: vi.fn(),
    insertActivityAt,
    replaceActivity,
    removeActivity,
  }),
}));

declare global {
  interface Window {
    requestAnimationFrame(callback: FrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
  }
}

vi.mock("@/features/app/planner/hooks/state/dnd/useAddActivity", () => ({
  useAddActivity: () => ({
    mutateAsync: mutateSpy,
    isPending: false,
  }),
}));

const copy = ACTIVITY_COPY.inlineAdd;

beforeAll(() => {
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return window.setTimeout(() => cb(performance.now()), 0);
  };
  window.cancelAnimationFrame = (handle: number) => {
    window.clearTimeout(handle);
  };
});

afterAll(() => {
  delete (window as Partial<Window>).requestAnimationFrame;
  delete (window as Partial<Window>).cancelAnimationFrame;
});

beforeEach(() => {
  mutateSpy.mockReset();
  mutateSpy.mockImplementation(async (variables: { title: string }) => ({
    id: "mock-id",
    title: variables.title,
  }));
  insertActivityAt.mockReset();
  replaceActivity.mockReset();
  removeActivity.mockReset();
  insertActivityAt.mockImplementation((_dayId, _activity, index?: number) =>
    index != null ? { position: String(index) } : undefined
  );
});

describe("InlineCard", () => {
  it("focuses the input on mount", async () => {
    render(<InlineCard dayId="d1" insertIndex={0} onClose={vi.fn()} />);

    const input = await screen.findByTestId("planner-inline-add-input");
    await waitFor(() => expect(input).toHaveFocus());
  });

  it("prevents submission when the title is empty", async () => {
    render(<InlineCard dayId="d1" insertIndex={1} onClose={vi.fn()} />);

    const input = await screen.findByTestId("planner-inline-add-input");
    const form = input.closest("form");
    if (!form) {
      throw new Error("Expected inline add input to be inside a form.");
    }
    fireEvent.submit(form);

    expect(mutateSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
  });

  it("submits with Enter, clears the input, and keeps focus", async () => {
    mutateSpy.mockResolvedValue?.({ id: "mock-id", title: "Morning coffee" });
    const onAdvanceInline = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={2} onClose={vi.fn()} onAdvanceInline={onAdvanceInline} />);

    const input = await screen.findByTestId("planner-inline-add-input");
    fireEvent.change(input, { target: { value: "Morning coffee" } });
    await waitFor(() => expect(input).toHaveValue("Morning coffee"));
    const form = input.closest("form");
    if (!form) {
      throw new Error("Expected inline add input to be inside a form.");
    }
    fireEvent.submit(form);

    await waitFor(() =>
      expect(mutateSpy).toHaveBeenCalledWith({ dayId: "d1", title: "Morning coffee", index: 2 })
    );
    await waitFor(() => expect(input).toHaveValue(""));
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(onAdvanceInline).toHaveBeenCalledWith(3));
  });

  it("submits via the Add button and calls onClose afterwards", async () => {
    mutateSpy.mockResolvedValue?.({ id: "mock-id", title: "Dinner" });
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={3} onClose={onClose} />);

    const input = await screen.findByTestId("planner-inline-add-input");
    fireEvent.change(input, { target: { value: "Dinner" } });
    await waitFor(() => expect(input).toHaveValue("Dinner"));
    fireEvent.click(screen.getByRole("button", { name: copy.ctaAdd }));

    await waitFor(() => expect(mutateSpy).toHaveBeenCalledWith({ dayId: "d1", title: "Dinner", index: 3 }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={0} onClose={onClose} />);

    const input = await screen.findByTestId("planner-inline-add-input");
    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("calls onClose when the user clicks outside", async () => {
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={0} onClose={onClose} />);

    await screen.findByTestId("planner-inline-add-input");
    fireEvent.pointerDown(document.body);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("submits and closes when clicking outside with a value", async () => {
    mutateSpy.mockResolvedValue?.({ id: "mock-id", title: "Lunch" });
    const onClose = vi.fn();
    render(<InlineCard dayId="d1" insertIndex={1} onClose={onClose} />);

    const input = await screen.findByTestId("planner-inline-add-input");
    fireEvent.change(input, { target: { value: "Lunch" } });
    await waitFor(() => expect(input).toHaveValue("Lunch"));
    fireEvent.pointerDown(document.body);

    await waitFor(() => expect(mutateSpy).toHaveBeenCalledWith({ dayId: "d1", title: "Lunch", index: 1 }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("shows an error message when submission fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mutateSpy.mockRejectedValueOnce?.(new Error("fail"));
    render(<InlineCard dayId="d1" insertIndex={0} onClose={vi.fn()} />);

    const input = await screen.findByTestId("planner-inline-add-input");
    fireEvent.change(input, { target: { value: "City tour" } });
    await waitFor(() => expect(input).toHaveValue("City tour"));
    fireEvent.click(screen.getByRole("button", { name: copy.ctaAdd }));

    await waitFor(() => expect(screen.getByText(copy.errorGeneric)).toBeInTheDocument());
    expect(mutateSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
