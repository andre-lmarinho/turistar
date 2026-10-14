import { useMutation } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
vi.mock("@/modules/auth/components/LanguageSelect", () => ({ LanguageSelect: () => null }));

function dialog(onOpenChange = vi.fn()) {
  return <AccountSettingsDialog open onOpenChange={onOpenChange} displayName="Traveler" slug="traveler" />;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.pending = false;
  mocks.realMutation = false;
  mocks.mutateAsync.mockResolvedValue({});
});

describe("AccountSettingsDialog", () => {
  it("focuses and describes the invalid field without sending a mutation", () => {
    render(dialog());
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

  it("keeps entered values on failure and identifies an occupied username", async () => {
    mocks.mutateAsync.mockRejectedValue({ data: { code: "CONFLICT" }, message: "Database details" });
    render(dialog());
    const username = screen.getByLabelText("Username");
    fireEvent.change(username, { target: { value: "occupied" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Username already taken.");
    expect(username).toHaveValue("occupied");
    expect(username).toHaveAttribute("aria-invalid", "true");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("announces an occupied username without moving focus after saving", async () => {
    mocks.realMutation = true;
    let reject: (cause: unknown) => void = () => {};
    mocks.mutateAsync.mockReturnValue(
      new Promise((_, rejectPromise) => {
        reject = rejectPromise;
      })
    );
    render(dialog());
    await waitFor(() => expect(screen.getByRole("button", { name: "Close" })).toHaveFocus());
    const username = screen.getByLabelText("Username");
    const submit = screen.getByRole("button", { name: "Save changes" });
    submit.focus();
    fireEvent.click(submit);
    await waitFor(() => expect(username).toHaveAttribute("readonly"));
    await act(async () => reject({ data: { code: "CONFLICT" } }));
    await waitFor(() => expect(username).not.toHaveAttribute("readonly"));
    expect(submit).toHaveFocus();
    expect(username).toHaveAccessibleDescription(expect.stringContaining("Username already taken."));
  });

  it("prevents repeated submissions and dismissal while saving, preserving the action label", async () => {
    let reject: (cause: unknown) => void = () => {};
    mocks.mutateAsync.mockReturnValue(
      new Promise((_, rejectPromise) => {
        reject = rejectPromise;
      })
    );
    const onOpenChange = vi.fn();
    const { rerender } = render(dialog(onOpenChange));
    const form = screen.getByRole("button", { name: "Save changes" }).closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);
    expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);

    mocks.pending = true;
    rerender(dialog(onOpenChange));
    expect(screen.getByRole("button", { name: "Save changes" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Save changes" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByLabelText("Username")).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => reject(new Error("Internal details")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to save your settings.");
    expect(screen.queryByText("Internal details")).not.toBeInTheDocument();
  });

  it("normalizes the submitted username and refreshes the updated profile without reloading the page", async () => {
    const onOpenChange = vi.fn();
    render(dialog(onOpenChange));
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: " Updated-Name " } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/u/updated-name"));
    expect(mocks.mutateAsync).toHaveBeenCalledWith({ displayName: "Traveler", slug: "updated-name" });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
