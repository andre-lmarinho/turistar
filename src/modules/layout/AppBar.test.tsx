import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppBar } from "./AppBar";

const { mockGetViewer, mockFetchProfileByUserId } = vi.hoisted(() => ({
  mockGetViewer: vi.fn(),
  mockFetchProfileByUserId: vi.fn(),
}));

vi.mock("@/features/auth/lib/session", () => ({ getViewer: mockGetViewer }));
vi.mock("@/supabase/server", () => ({ createSupabaseServerClient: () => ({}) }));
vi.mock("@/features/profile/repositories/ProfileRepository", () => ({
  ProfileRepository: class {
    fetchProfileByUserId = mockFetchProfileByUserId;
  },
}));
vi.mock("./AvatarMenu", () => ({
  AvatarMenu: ({ displayName }: { displayName: string | null }) => (
    <div data-testid="account-menu">{displayName ?? "Account menu"}</div>
  ),
}));

describe("AppBar", () => {
  it("renders the brand and account menu without a login-state branch", async () => {
    mockGetViewer.mockResolvedValue(null);

    render(await AppBar());

    const brand = screen.getByRole("link", { name: "Turistar" });
    expect(brand).toBeInTheDocument();
    expect(brand.querySelector("span")).toHaveClass("md:sr-only");
    expect(screen.getByTestId("account-menu")).toHaveTextContent("Account menu");
    expect(mockFetchProfileByUserId).not.toHaveBeenCalled();
  });

  it("loads the avatar menu for an authenticated viewer", async () => {
    mockGetViewer.mockResolvedValue({ id: "user-1", email: "user@example.test" });
    mockFetchProfileByUserId.mockResolvedValue({ slug: "user-1", displayName: "André" });

    render(await AppBar());

    expect(screen.getByText("André")).toBeInTheDocument();
  });

  it("surfaces profile load failures to the route error boundary", async () => {
    mockGetViewer.mockResolvedValue({ id: "user-1", email: "user@example.test" });
    const error = new Error("profile lookup failed");
    mockFetchProfileByUserId.mockRejectedValue(error);

    await expect(AppBar()).rejects.toBe(error);
  });
});
