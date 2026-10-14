import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AvatarMenu } from "./AvatarMenu";

const mocks = vi.hoisted(() => ({ signOut: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));
vi.mock("@/supabase/client", () => ({ supabase: { auth: { signOut: mocks.signOut } } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("./AccountSettingsDialog", () => ({ AccountSettingsDialog: () => null }));

beforeEach(() => vi.clearAllMocks());

describe("AvatarMenu sign out", () => {
  it("keeps the account menu usable when Supabase reports a failure and allows a retry", async () => {
    mocks.signOut
      .mockResolvedValueOnce({ error: new Error("Network failure") })
      .mockResolvedValueOnce({ error: null });
    render(<AvatarMenu displayName="Traveler" email="traveler@example.test" slug="traveler" />);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    fireEvent.click(await screen.findByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not sign out. Please try again.");
    expect(mocks.replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("shows local pending feedback and prevents duplicate sign-out requests", async () => {
    let resolve: (result: { error: null }) => void = () => {};
    mocks.signOut.mockReturnValue(
      new Promise((resolvePromise) => {
        resolve = resolvePromise;
      })
    );
    render(<AvatarMenu displayName="Traveler" email="traveler@example.test" slug="traveler" />);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    const button = await screen.findByRole("button", { name: "Log out" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Settings" })).toBeDisabled();
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ error: null }));
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
