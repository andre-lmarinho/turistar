import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DesktopActions } from "./DesktopActions";

type Session = { user: { id: string } } | null;
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  fetchProfile: vi.fn(),
  unsubscribe: vi.fn(),
  authChanged: null as ((event: string, session: Session) => void) | null,
}));
vi.mock("@/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: (callback: (event: string, session: Session) => void) => {
        mocks.authChanged = callback;
        return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
      },
    },
  },
}));
vi.mock("@/trpc/react", () => {
  const utils = { client: { viewer: { profile: { get: { query: mocks.fetchProfile } } } } };
  return { trpc: { useUtils: () => utils } };
});

beforeEach(() => vi.clearAllMocks());

describe("marketing account navigation", () => {
  it("retries a failed profile lookup without presenting login actions", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    mocks.fetchProfile
      .mockRejectedValueOnce(new Error("Unavailable"))
      .mockResolvedValueOnce({ slug: "traveler" });
    render(<DesktopActions />);
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Go to Planner" })).toHaveAttribute("href", "/u/traveler");
  });

  it("preserves the current destination if a token refresh lookup fails", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    mocks.fetchProfile
      .mockResolvedValueOnce({ slug: "traveler" })
      .mockRejectedValueOnce(new Error("Unavailable"));
    render(<DesktopActions />);
    expect(await screen.findByRole("link", { name: "Go to Planner" })).toHaveAttribute("href", "/u/traveler");
    await act(async () => mocks.authChanged?.("TOKEN_REFRESHED", { user: { id: "user-1" } }));
    expect(screen.getByRole("link", { name: "Go to Planner" })).toHaveAttribute("href", "/u/traveler");
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });
  it("reserves the action area while checking the session rather than flashing login actions", async () => {
    let resolve: (value: { data: { session: Session } }) => void = () => {};
    mocks.getSession.mockReturnValue(
      new Promise((resolvePromise) => {
        resolve = resolvePromise;
      })
    );
    mocks.fetchProfile.mockResolvedValue({ slug: "traveler" });
    render(<DesktopActions />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
    await act(async () => resolve({ data: { session: { user: { id: "user-1" } } } }));
    expect(await screen.findByRole("link", { name: "Go to Planner" })).toHaveAttribute("href", "/u/traveler");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("ignores a profile response that arrives after sign-out", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    let resolve: (value: { slug: string }) => void = () => {};
    mocks.fetchProfile.mockReturnValue(
      new Promise((resolvePromise) => {
        resolve = resolvePromise;
      })
    );
    render(<DesktopActions />);
    await waitFor(() => expect(mocks.fetchProfile).toHaveBeenCalledTimes(1));
    await act(async () => mocks.authChanged?.("SIGNED_OUT", null));
    expect(screen.getByRole("link", { name: "Log in" })).toBeVisible();
    await act(async () => resolve({ slug: "old-session" }));
    expect(screen.queryByRole("link", { name: "Go to Planner" })).not.toBeInTheDocument();
  });

  it("ignores an initial session snapshot superseded by an auth change", async () => {
    let resolve: (value: { data: { session: Session } }) => void = () => {};
    mocks.getSession.mockReturnValue(
      new Promise((resolvePromise) => {
        resolve = resolvePromise;
      })
    );
    mocks.fetchProfile.mockResolvedValue({ slug: "current-session" });
    const { unmount } = render(<DesktopActions />);
    await act(async () => mocks.authChanged?.("SIGNED_IN", { user: { id: "user-2" } }));
    expect(await screen.findByRole("link", { name: "Go to Planner" })).toHaveAttribute(
      "href",
      "/u/current-session"
    );
    await act(async () => resolve({ data: { session: null } }));
    expect(screen.getByRole("link", { name: "Go to Planner" })).toBeVisible();
    unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("resolves the new account independently of the previous account's pending profile", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    let resolvePrevious: (value: { slug: string }) => void = () => {};
    mocks.fetchProfile
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePrevious = resolve;
        })
      )
      .mockResolvedValueOnce({ slug: "new-account" });
    render(<DesktopActions />);
    await waitFor(() => expect(mocks.fetchProfile).toHaveBeenCalledTimes(1));
    await act(async () => mocks.authChanged?.("SIGNED_OUT", null));
    await act(async () => mocks.authChanged?.("SIGNED_IN", { user: { id: "user-2" } }));
    expect(await screen.findByRole("link", { name: "Go to Planner" })).toHaveAttribute(
      "href",
      "/u/new-account"
    );
    await act(async () => resolvePrevious({ slug: "old-account" }));
    expect(screen.getByRole("link", { name: "Go to Planner" })).toHaveAttribute("href", "/u/new-account");
  });

  it("hides the previous account's destination while loading a different account", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    let resolveNew: (value: { slug: string }) => void = () => {};
    mocks.fetchProfile.mockResolvedValueOnce({ slug: "previous-account" }).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNew = resolve;
      })
    );
    render(<DesktopActions />);
    expect(await screen.findByRole("link", { name: "Go to Planner" })).toHaveAttribute(
      "href",
      "/u/previous-account"
    );
    await act(async () => mocks.authChanged?.("SIGNED_IN", { user: { id: "user-2" } }));
    expect(screen.queryByRole("link", { name: "Go to Planner" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeVisible();
    await act(async () => resolveNew({ slug: "next-account" }));
    expect(screen.getByRole("link", { name: "Go to Planner" })).toHaveAttribute("href", "/u/next-account");
  });

  it("keeps the current destination visible while refreshing the same account's token", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    let resolveRefresh: (value: { slug: string }) => void = () => {};
    mocks.fetchProfile.mockResolvedValueOnce({ slug: "current-account" }).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      })
    );
    render(<DesktopActions />);
    expect(await screen.findByRole("link", { name: "Go to Planner" })).toHaveAttribute(
      "href",
      "/u/current-account"
    );
    await act(async () => mocks.authChanged?.("TOKEN_REFRESHED", { user: { id: "user-1" } }));
    expect(screen.getByRole("link", { name: "Go to Planner" })).toHaveAttribute("href", "/u/current-account");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await act(async () => resolveRefresh({ slug: "current-account" }));
  });
});
