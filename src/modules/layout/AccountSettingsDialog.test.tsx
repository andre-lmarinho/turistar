import { useMutation } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountSettingsDialog } from "./AccountSettingsDialog";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  pending: false,
  realMutation: false,
}));

vi.mock("@/trpc/react", () => ({
  trpc: {
    viewer: {
      profile: {
        update: {
          useMutation: () => {
            const mutation = useMutation({ mutationFn: mocks.mutateAsync });
            return mocks.realMutation
              ? mutation
              : { mutateAsync: mocks.mutateAsync, isPending: mocks.pending };
          },
        },
      },
    },
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));

function dialog(onOpenChange = vi.fn()) {
  return <AccountSettingsDialog open onOpenChange={onOpenChange} displayName="Traveler" slug="traveler" />;
}

function openEditor(label: "Edit name" | "Edit username") {
  fireEvent.click(screen.getByRole("button", { name: label }));
  return screen.getByRole("dialog", { name: label });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.pending = false;
  mocks.realMutation = false;
  mocks.mutateAsync.mockResolvedValue({});
});

describe("AccountSettingsDialog", () => {
  it("keeps language in the settings dialog and opens separate profile editors", () => {
    render(dialog());
    const settingsDialog = screen.getByRole("dialog", { name: "Account settings" });
    expect(settingsDialog).toHaveClass("max-w-lg");
    expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit name" })).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.getByRole("button", { name: "Edit username" })).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();

    const nameDialog = openEditor("Edit name");
    expect(nameDialog).toHaveClass("max-w-md");
    expect(nameDialog).not.toHaveClass("max-w-lg");
    expect(nameDialog).toHaveTextContent("Name");
  });

  it("focuses and describes the invalid field without sending a mutation", () => {
    render(dialog());
    const nameDialog = openEditor("Edit name");
    const name = screen.getByLabelText("Name");
    fireEvent.change(name, { target: { value: " " } });
    fireEvent.click(within(nameDialog).getByRole("button", { name: "Save changes" }));

    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Enter your name.");
    expect(mocks.mutateAsync).not.toHaveBeenCalled();

    fireEvent.change(name, { target: { value: "Updated" } });
    fireEvent.click(within(nameDialog).getByRole("button", { name: "Cancel" }));
    const usernameDialog = openEditor("Edit username");
    const username = within(usernameDialog).getByLabelText("Username");
    fireEvent.change(username, { target: { value: "invalid_username" } });
    fireEvent.click(within(usernameDialog).getByRole("button", { name: "Save changes" }));
    expect(username).toHaveFocus();
    expect(username).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps entered values on failure and identifies an occupied username", async () => {
    mocks.mutateAsync.mockRejectedValue({ data: { code: "CONFLICT" }, message: "Database details" });
    render(dialog());
    const usernameDialog = openEditor("Edit username");
    const username = within(usernameDialog).getByLabelText("Username");
    fireEvent.change(username, { target: { value: "occupied" } });
    fireEvent.click(within(usernameDialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Username already taken.");
    expect(username).toHaveValue("occupied");
    expect(username).toHaveAttribute("aria-invalid", "true");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps an occupied-username error in the edit dialog after saving", async () => {
    mocks.realMutation = true;
    let reject: (cause: unknown) => void = () => {};
    mocks.mutateAsync.mockReturnValue(
      new Promise((_, rejectPromise) => {
        reject = rejectPromise;
      })
    );
    render(dialog());
    const usernameDialog = openEditor("Edit username");
    const username = within(usernameDialog).getByLabelText("Username");
    const submit = within(usernameDialog).getByRole("button", { name: "Save changes" });
    submit.focus();
    fireEvent.click(submit);
    await waitFor(() => expect(username).toHaveAttribute("readonly"));
    await act(async () => reject({ data: { code: "CONFLICT" } }));
    await waitFor(() => expect(username).not.toHaveAttribute("readonly"));
    expect(within(usernameDialog).getByRole("button", { name: "Close" })).toHaveFocus();
    expect(username).toHaveAccessibleDescription(expect.stringContaining("Username already taken."));
  });

  it("prevents repeated submissions and dismissal while saving, preserving the action label", async () => {
    mocks.realMutation = true;
    let reject: (cause: unknown) => void = () => {};
    mocks.mutateAsync.mockReturnValue(
      new Promise((_, rejectPromise) => {
        reject = rejectPromise;
      })
    );
    const onOpenChange = vi.fn();
    render(dialog(onOpenChange));
    const editor = openEditor("Edit username");
    await waitFor(() => expect(within(editor).getByLabelText("Username")).toHaveValue("traveler"));
    const save = within(editor).getByRole("button", { name: "Save changes" });
    fireEvent.click(save);

    await waitFor(() => {
      expect(within(editor).getByRole("button", { name: "Save changes" })).toHaveAttribute(
        "aria-disabled",
        "true"
      );
      expect(within(editor).getByRole("button", { name: "Save changes" })).toHaveAttribute(
        "aria-busy",
        "true"
      );
      expect(within(editor).getByRole("button", { name: "Cancel" })).toBeDisabled();
      expect(within(editor).getByLabelText("Username")).toHaveAttribute("readonly");
    });
    fireEvent.click(save);
    expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
    fireEvent.click(within(editor).getByRole("button", { name: "Close" }));
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => reject(new Error("Internal details")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to save your settings.");
    expect(screen.queryByText("Internal details")).not.toBeInTheDocument();
  });

  it("normalizes the submitted username and refreshes the updated profile without reloading the page", async () => {
    const onOpenChange = vi.fn();
    render(dialog(onOpenChange));
    const usernameDialog = openEditor("Edit username");
    fireEvent.change(within(usernameDialog).getByLabelText("Username"), {
      target: { value: " Updated-Name " },
    });
    fireEvent.click(within(usernameDialog).getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/u/updated-name"));
    expect(mocks.mutateAsync).toHaveBeenCalledWith({ displayName: "Traveler", slug: "updated-name" });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
