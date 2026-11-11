import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppBar } from "./AppBar";

const { mockGetViewer, mockFetchProfileByUserId } = vi.hoisted(() => ({
  mockGetViewer: vi.fn(),
  mockFetchProfileByUserId: vi.fn(),
}));

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const { default: messages } = await import("@/i18n/locales/en.json");
  return { getTranslations: async () => createTranslator({ locale: "en", messages }) };
});

vi.mock("@/features/auth/lib/session", () => ({ getViewer: mockGetViewer }));
vi.mock("@/supabase/server", () => ({ createSupabaseServerClient: () => ({}) }));
vi.mock("@/features/profile/repositories/ProfileRepository", () => ({
  ProfileRepository: class {
    fetchProfileByUserId = mockFetchProfileByUserId;
  },
}));
vi.mock("./AvatarMenu", () => ({
  AvatarMenu: ({ displayName }: { displayName: string | null }) => <div>{displayName}</div>,
}));

describe("AppBar", () => {
  it("renders sign-in actions only when there is no viewer", async () => {
    mockGetViewer.mockResolvedValue(null);

    render(await AppBar());

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByText("Get started")).toBeInTheDocument();
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
