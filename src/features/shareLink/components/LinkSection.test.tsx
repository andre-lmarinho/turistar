import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LinkSection } from "./LinkSection";

const { mockUseShareLink, mockUsePlannerContext, createLinkMutate, revokeLinkMutate, writeTextMock } =
  vi.hoisted(() => ({
    mockUseShareLink: vi.fn(),
    mockUsePlannerContext: vi.fn(),
    createLinkMutate: vi.fn(),
    revokeLinkMutate: vi.fn(),
    writeTextMock: vi.fn(),
  }));

vi.mock("@/features/shareLink/hooks/useShareLink", () => ({
  useShareLink: (...args: unknown[]) => mockUseShareLink(...args),
}));

vi.mock("@/features/plan/hooks/PlannerContext", () => ({
  usePlannerContext: () => mockUsePlannerContext(),
}));

describe("LinkSection", () => {
  beforeEach(() => {
    createLinkMutate.mockReset();
    revokeLinkMutate.mockReset();
    writeTextMock.mockReset();
    mockUseShareLink.mockReset();
    mockUsePlannerContext.mockReset();

    mockUsePlannerContext.mockReturnValue({ canManageMembers: true });
    mockUseShareLink.mockReturnValue({
      data: null,
      isLoading: false,
      createLink: { mutate: createLinkMutate, isPending: false },
      revokeLink: { mutate: revokeLinkMutate, isPending: false },
    });

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  it("shows the restricted message for non-admins", () => {
    mockUsePlannerContext.mockReturnValue({ canManageMembers: false });

    render(<LinkSection planId="plan-1" />);

    expect(screen.getByText("Only admins can generate access links.")).toBeVisible();
  });

  it("creates a link when none exists", () => {
    render(<LinkSection planId="plan-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Create link" }));

    expect(createLinkMutate).toHaveBeenCalledTimes(1);
  });

  it("copies the share link when available", async () => {
    mockUseShareLink.mockReturnValue({
      data: {
        token: "token-123",
        createdAt: "2024-01-01T00:00:00.000Z",
        createdBy: "user-1",
        revokedAt: null,
      },
      isLoading: false,
      createLink: { mutate: createLinkMutate, isPending: false },
      revokeLink: { mutate: revokeLinkMutate, isPending: false },
    });

    render(<LinkSection planId="plan-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/p/share/token-123`)
    );
    expect(screen.getByRole("button", { name: /copied/i })).toBeVisible();
  });

  it("revokes the link when deletion is confirmed", async () => {
    mockUseShareLink.mockReturnValue({
      data: {
        token: "token-456",
        createdAt: "2024-01-01T00:00:00.000Z",
        createdBy: "user-1",
        revokedAt: null,
      },
      isLoading: false,
      createLink: { mutate: createLinkMutate, isPending: false },
      revokeLink: { mutate: revokeLinkMutate, isPending: false },
    });

    render(<LinkSection planId="plan-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Delete link" }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    expect(revokeLinkMutate).toHaveBeenCalledTimes(1);
  });
});
