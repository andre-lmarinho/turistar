import { useMutation } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountSettingsDialog } from "./AccountSettingsDialog";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/trpc/react", () => ({
  trpc: {
    viewer: {
      profile: {
        update: {
          useMutation: () =>
            useMutation({ mutationFn: (variables: unknown) => mocks.mutateAsync(variables) }),
        },
      },
    },
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("@/modules/auth/components/LanguageSelect", () => ({ LanguageSelect: () => null }));

function dialog(onOpenChange = vi.fn()) {
  return <AccountSettingsDialog open onOpenChange={onOpenChange} displayName="Traveler" slug="traveler" />;
}

async function openDialog(onOpenChange = vi.fn()) {
  render(dialog(onOpenChange));
  await waitFor(() => expect(screen.getByRole("button", { name: "Close" })).toHaveFocus());
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mutateAsync.mockResolvedValue({});
});

describe("AccountSettingsDialog", () => {
  it("focuses and describes the invalid field without sending a mutation", async () => {
    await openDialog();
    const name = screen.getByLabelText("Name");
    fireEvent.change(name, { target: { value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Enter your name.");
    expect(mocks.mutateAsync).not.toHaveBeenCalled();

    fireEvent.change(name, { target: { value: "Updated" } });
    const username = screen.getByLabelText("Username");
    fireEvent.change(username, { target: { value: "invalid_username" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(username).toHaveFocus();
    expect(username).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps entered values on failure and focuses an occupied username", async () => {
    mocks.mutateAsync.mockRejectedValue({ data: { code: "CONFLICT" }, message: "Database details" });
    await openDialog();
    const username = screen.getByLabelText("Username");
    fireEvent.change(username, { target: { value: "occupied" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Username already taken.");
    expect(username).toHaveValue("occupied");
    expect(username).toHaveFocus();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("preserves submit focus while saving and focuses an occupied username after failure", async () => {
    const mutation = Promise.withResolvers<unknown>();
    mocks.mutateAsync.mockReturnValue(mutation.promise);
    await openDialog();
    const username = screen.getByLabelText("Username");
    const submit = screen.getByRole("button", { name: "Save changes" });
    submit.focus();
    fireEvent.click(submit);
    await waitFor(() => expect(username).toHaveAttribute("readonly"));
    expect(username).toBeEnabled();
    expect(submit).toHaveFocus();
    await act(async () => mutation.reject({ data: { code: "CONFLICT" } }));
    await waitFor(() => expect(username).toHaveFocus());
    await act(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    expect(username).toHaveFocus();
    expect(username).not.toHaveAttribute("readonly");
    expect(username).toHaveAccessibleDescription(expect.stringContaining("Username already taken."));
  });

  it("prevents repeated submissions and dismissal while saving, preserving the action label", async () => {
    const mutation = Promise.withResolvers<unknown>();
    mocks.mutateAsync.mockReturnValue(mutation.promise);
    const onOpenChange = vi.fn();
    await openDialog(onOpenChange);
    const submit = screen.getByRole("button", { name: "Save changes" });
    const form = submit.closest("form");
    expect(form).not.toBeNull();
    submit.focus();
    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(submit).toHaveAttribute("aria-disabled", "true"));
    expect(submit).toBeEnabled();
    expect(submit).toHaveAttribute("aria-busy", "true");
    expect(submit).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Saving");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByLabelText("Name")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Username")).toHaveAttribute("readonly");
    fireEvent.click(submit);
    fireEvent.submit(form as HTMLFormElement);
    expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.keyDown(submit, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => mutation.reject(new Error("Internal details")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to save your settings.");
    expect(screen.queryByText("Internal details")).not.toBeInTheDocument();
    await waitFor(() => expect(submit).toHaveAttribute("aria-disabled", "false"));
    expect(submit).toHaveFocus();
    expect(screen.getByLabelText("Username")).not.toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Close" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("normalizes the submitted username and refreshes the updated profile without reloading the page", async () => {
    const onOpenChange = vi.fn();
    await openDialog(onOpenChange);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: " Updated-Name " } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/u/updated-name"));
    expect(mocks.mutateAsync).toHaveBeenCalledWith({ displayName: "Traveler", slug: "updated-name" });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
