import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "@/ui/components/dialog/ConfirmationDialog";

describe("ConfirmationDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens with an accessible title and description", () => {
    render(
      <ConfirmationDialog
        trigger={<button type="button">Delete trip</button>}
        title="Delete planner"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete trip" }));

    expect(screen.getByRole("alertdialog", { name: "Delete planner" })).toHaveAccessibleDescription(
      "This action cannot be undone."
    );
  });

  it("confirms the action and closes after success", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmationDialog
        trigger={<button type="button">Delete trip</button>}
        title="Delete planner"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete trip" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.queryByRole("alertdialog", { name: "Delete planner" })).toBeNull());
  });

  it("keeps the dialog open when confirmation fails", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Deletion failed"));

    render(
      <ConfirmationDialog
        trigger={<button type="button">Delete trip</button>}
        title="Delete planner"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete trip" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());

    expect(screen.getByRole("alertdialog", { name: "Delete planner" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });
});

it("keeps one confirmation pending and offers a retry after failure", async () => {
  let rejectAction: (error: Error) => void = () => {};
  const onConfirm = vi.fn(
    () =>
      new Promise<void>((_resolve, reject) => {
        rejectAction = reject;
      })
  );
  render(
    <ConfirmationDialog
      trigger={<button type="button">Remove</button>}
      title="Remove item"
      description="This cannot be undone."
      confirmLabel="Delete"
      errorMessage="Could not delete. Try again."
      onConfirm={onConfirm}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  const button = screen.getByRole("button", { name: "Delete" });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  await act(async () => rejectAction(new Error("Failed")));
  expect(screen.getByRole("alert")).toHaveTextContent("Could not delete. Try again.");
  expect(button).toBeEnabled();
});
