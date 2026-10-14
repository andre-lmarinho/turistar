import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Activity, DayPlan } from "@/features/activity/types";

import { ActivityDialog } from "./ActivityDialog";

afterEach(() => vi.unstubAllGlobals());

const activity: Activity & { dayId: string } = {
  id: "activity-1",
  dayId: "2024-01-01",
  title: "Visit museum",
  color: "bg-[var(--color-1)]",
};

const days: DayPlan[] = [
  {
    id: "2024-01-01",
    label: "Day 1",
    activities: [activity],
  },
];

describe("ActivityDialog", () => {
  it("commits place details together with the current draft, without saving again on blur", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (url: string) =>
          new Response(
            JSON.stringify(
              url.startsWith("/api/places/details")
                ? {
                    details: { formatted: "Museum address", description: "Museum notes" },
                    wikidataImageUrl: "https://example.com/museum.jpg",
                  }
                : {
                    results: [
                      {
                        placeId: "museum",
                        name: "Museum",
                        formatted: "Museum address",
                        latitude: 1,
                        longitude: 2,
                      },
                    ],
                  }
            )
          )
      )
    );
    const onSave = vi.fn().mockReturnValue(true);
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Budget amount"), { target: { value: "25" } });
    const title = screen.getByRole("combobox", { name: "Title" });
    fireEvent.focus(title);
    fireEvent.click(await screen.findByRole("option", { name: /Museum/ }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Museum",
          address: "Museum address",
          description: "Museum notes",
          budget: 25,
          latitude: 1,
          longitude: 2,
          imageUrl: "https://example.com/museum.jpg",
        })
      )
    );
    expect(screen.getByLabelText("Notes")).toHaveValue("Museum notes");
    fireEvent.blur(title);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  });

  it.each(["Done", "Enter"])(
    "saves selected place coordinates through %s without waiting for details",
    async (action) => {
      let finishDetails!: (response: Response) => void;
      let detailsSignal: AbortSignal | undefined;
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string, options?: RequestInit) => {
          if (url.startsWith("/api/places/details")) {
            detailsSignal = options?.signal ?? undefined;
            return new Promise<Response>((resolve) => {
              finishDetails = resolve;
            });
          }
          return Promise.resolve(
            new Response(
              JSON.stringify({
                results: [
                  {
                    placeId: "selected-museum",
                    name: "Selected Museum, a long address",
                    formatted: "Museum address",
                    latitude: 1,
                    longitude: 2,
                  },
                ],
              })
            )
          );
        })
      );
      const onSave = vi.fn().mockReturnValue(true);
      const onClose = vi.fn();
      render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
      const title = screen.getByRole("combobox", { name: "Title" });
      fireEvent.change(title, { target: { value: "My query" } });
      fireEvent.focus(title);
      fireEvent.click(await screen.findByRole("option", { name: /Selected Museum/ }));
      expect(title).toHaveValue("Selected Museum");
      expect(screen.getByRole("combobox", { name: "Address" })).toHaveValue("Museum address");
      expect(onSave).not.toHaveBeenCalled();
      if (action === "Done") fireEvent.click(screen.getByRole("button", { name: "Done" }));
      else fireEvent.keyDown(title, { key: "Enter" });
      expect(onSave).toHaveBeenCalledExactlyOnceWith({
        title: "Selected Museum",
        address: "Museum address",
        latitude: 1,
        longitude: 2,
      });
      expect(onClose).toHaveBeenCalledOnce();
      expect(detailsSignal?.aborted).toBe(true);
      await act(async () =>
        finishDetails(new Response(JSON.stringify({ details: { description: "Too late" } })))
      );
      expect(onSave).toHaveBeenCalledOnce();
      expect(screen.getByLabelText("Notes")).not.toHaveValue("Too late");
    }
  );

  it("does not save an unchanged draft when optional fields are absent", async () => {
    const onSave = vi.fn().mockReturnValue(true);
    const onClose = vi.fn();
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits synchronously on blur and does not submit again on Done", () => {
    const onSave = vi.fn().mockReturnValue(true);
    const onClose = vi.fn();
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
    const title = screen.getByRole("combobox", { name: "Title" });
    fireEvent.change(title, { target: { value: "Updated" } });
    fireEvent.blur(title);
    expect(onSave).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });

  it.each([
    ["Duration in hours", "duration"],
    ["Budget amount", "budget"],
  ])("updates and clears %s without changing the other numeric field", (label, field) => {
    const onSave = vi.fn().mockReturnValue(true);
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={vi.fn()} />);
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value: "0" } });
    expect(input).toHaveValue(0);
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "0.5" } });
    expect(input).toHaveValue(0.5);
    expect(input).toBeValid();
    fireEvent.blur(input);
    expect(onSave).toHaveBeenLastCalledWith({ [field]: 0.5 });
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onSave).toHaveBeenLastCalledWith({ [field]: 0 });
  });

  it("discards uncommitted edits on Cancel", () => {
    const onSave = vi.fn().mockReturnValue(true);
    const onClose = vi.fn();
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Discard me" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Notes")).toHaveValue("");
  });

  it("reverts to the last submitted draft on Escape", async () => {
    const onSave = vi.fn().mockReturnValue(true);
    const onClose = vi.fn();
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
    const title = screen.getByRole("combobox", { name: "Title" });
    fireEvent.change(title, { target: { value: "Confirmed" } });
    fireEvent.blur(title);
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    fireEvent.change(title, { target: { value: "Discard me" } });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(title).toHaveValue("Confirmed"));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("persists removing a photo as an empty image URL", async () => {
    const onSave = vi.fn().mockReturnValue(true);
    render(
      <ActivityDialog
        activity={{ ...activity, imageUrl: "https://example.com/photo.jpg" }}
        days={days}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove photo" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: "" })));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("provides an accessible description", () => {
    render(<ActivityDialog activity={activity} days={days} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Edit Activity" })).toHaveAccessibleDescription(
      "Edit the selected activity title, schedule position, location, notes, budget, and visual details."
    );
  });

  it("saves edited fields before closing with Done", async () => {
    const onSave = vi.fn().mockReturnValue(true);
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={vi.fn()} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Title" }), {
      target: { value: "Updated museum" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: "Updated museum" }))
    );
    expect(onSave.mock.calls[0][0]).not.toHaveProperty("dayId");
    expect(onSave.mock.calls[0][0]).not.toHaveProperty("id");
  });

  it("explains an empty title and focuses it without discarding the draft", async () => {
    const onSave = vi.fn().mockReturnValue(true);
    const onClose = vi.fn();
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
    await waitFor(() => expect(screen.getAllByRole("button")[0]).toHaveFocus());
    const title = screen.getByRole("combobox", { name: "Title" });
    fireEvent.change(title, { target: { value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveFocus();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter an activity title");
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each(["Duration in hours", "Budget amount"])("focuses invalid %s on submission", async (label) => {
    const onSave = vi.fn().mockReturnValue(true);
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByRole("button")[0]).toHaveFocus());
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value: "-5" } });
    const done = screen.getByRole("button", { name: "Done" });
    done.focus();
    fireEvent.click(done);
    expect(input).toHaveValue(-5);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveFocus();
    expect(screen.getByRole("alert")).toHaveTextContent("greater than or equal to zero");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits free text with Enter without choosing an unhighlighted suggestion", () => {
    const onSave = vi.fn().mockReturnValue(true);
    const onClose = vi.fn();
    render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
    const title = screen.getByRole("combobox", { name: "Title" });
    fireEvent.change(title, { target: { value: "My own title" } });
    fireEvent.keyDown(title, { key: "Enter" });
    expect(onSave).toHaveBeenCalledWith({ title: "My own title" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

it("keeps rejected edits open and retries the same values on Done", () => {
  const onSave = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
  const onClose = vi.fn();
  render(<ActivityDialog activity={activity} days={days} onSave={onSave} onClose={onClose} />);
  fireEvent.change(screen.getByRole("combobox", { name: "Title" }), { target: { value: "Keep this draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole("combobox", { name: "Title" })).toHaveValue("Keep this draft");
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(onSave).toHaveBeenCalledTimes(2);
  expect(onSave).toHaveBeenLastCalledWith({ title: "Keep this draft" });
  expect(onClose).toHaveBeenCalledOnce();
});
