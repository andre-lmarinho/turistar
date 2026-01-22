import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InviteForm } from "./InviteForm";

const { addMemberMutateAsync, mockUseShareMembers, mockUsePlannerContext } = vi.hoisted(() => ({
  addMemberMutateAsync: vi.fn(),
  mockUseShareMembers: vi.fn(),
  mockUsePlannerContext: vi.fn(),
}));

vi.mock("@/features/members/hooks/useShareMembers", () => ({
  useShareMembers: (...args: unknown[]) => mockUseShareMembers(...args),
}));

vi.mock("@/features/plan/hooks/PlannerContext", () => ({
  usePlannerContext: () => mockUsePlannerContext(),
}));

describe("InviteForm", () => {
  beforeEach(() => {
    addMemberMutateAsync.mockReset();
    mockUseShareMembers.mockReset();
    mockUsePlannerContext.mockReset();

    mockUsePlannerContext.mockReturnValue({ canManageMembers: true });
    mockUseShareMembers.mockReturnValue({
      addMember: { mutateAsync: addMemberMutateAsync, isPending: false },
      isLoading: false,
    });
  });

  it("shows a validation error when the email is empty", async () => {
    render(<InviteForm planId="plan-1" />);

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a valid email.");
    expect(addMemberMutateAsync).not.toHaveBeenCalled();
  });

  it("shows a helpful message when the email is not registered", async () => {
    addMemberMutateAsync.mockRejectedValue({
      message: "USER_NOT_REGISTERED",
      code: "USER_NOT_REGISTERED",
    });

    render(<InviteForm planId="plan-1" />);

    fireEvent.change(screen.getByPlaceholderText("Email address…"), {
      target: { value: "new-user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => expect(addMemberMutateAsync).toHaveBeenCalled());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This email has no account yet. Ask them to sign up first, then invite again."
    );
  });

  it("clears the input and shows success after sharing", async () => {
    addMemberMutateAsync.mockResolvedValue({ userId: "user-1", tier: "member" });

    render(<InviteForm planId="plan-1" />);

    const input = screen.getByPlaceholderText("Email address…");
    fireEvent.change(input, { target: { value: " member@example.com " } });
    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => expect(addMemberMutateAsync).toHaveBeenCalled());
    expect(screen.getByRole("status")).toHaveTextContent("Member added.");
    expect(input).toHaveValue("");
  });

  it("disables the form for non-admins", () => {
    mockUsePlannerContext.mockReturnValue({ canManageMembers: false });

    render(<InviteForm planId="plan-1" />);

    expect(screen.getByPlaceholderText("Email address…")).toBeDisabled();
    expect(screen.getByRole("button", { name: /share/i })).toBeDisabled();
    expect(screen.getByText("Only admins can invite people.")).toBeVisible();
  });
});
