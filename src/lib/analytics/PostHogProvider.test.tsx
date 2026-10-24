import { render } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_POSTHUG_PROJECT_TOKEN = "test-token";
  const calls: string[] = [];
  const posthog = {
    __loaded: false,
    init: vi.fn(() => {
      calls.push("init");
      posthog.__loaded = true;
    }),
    capture: vi.fn((event: string) => {
      calls.push(posthog.__loaded ? event : `${event}:before-init`);
    }),
    identify: vi.fn(),
    reset: vi.fn(),
    opt_out_capturing: vi.fn(),
  };
  return { calls, posthog, pathname: "/" };
});

vi.mock("posthog-js", () => ({ default: mocks.posthog }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("@/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  }),
}));

import { PostHogProvider } from "./PostHogProvider";

function pageviews() {
  return mocks.calls.filter((call) => call.startsWith("$pageview"));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.calls.length = 0;
  mocks.posthog.__loaded = false;
  mocks.pathname = "/";
  window.localStorage.clear();
});

it("initializes PostHog before the initial homepage pageview", () => {
  render(<PostHogProvider>content</PostHogProvider>);

  expect(mocks.calls[0]).toBe("init");
  expect(mocks.posthog.init).toHaveBeenCalledTimes(1);
  expect(pageviews()).toEqual(["$pageview"]);
  expect(mocks.posthog.capture).toHaveBeenCalledWith("$pageview", { page_group: "auth_home" });
});

it("captures one pageview per route change without another initialization", () => {
  const { rerender } = render(<PostHogProvider>content</PostHogProvider>);
  mocks.pathname = "/u/traveler";
  rerender(<PostHogProvider>content</PostHogProvider>);

  expect(mocks.posthog.init).toHaveBeenCalledTimes(1);
  expect(pageviews()).toEqual(["$pageview", "$pageview"]);
  expect(mocks.posthog.capture).toHaveBeenLastCalledWith("$pageview", { page_group: "planner" });
});

it("initializes once before any capture in Strict Mode", () => {
  render(
    <StrictMode>
      <PostHogProvider>content</PostHogProvider>
    </StrictMode>
  );

  expect(mocks.calls[0]).toBe("init");
  expect(mocks.posthog.init).toHaveBeenCalledTimes(1);
  expect(mocks.calls).not.toContain("$pageview:before-init");
});

it("skips initialization and capture when analytics is disabled", () => {
  window.localStorage.setItem("turistar.analytics.disabled", "1");

  render(<PostHogProvider>content</PostHogProvider>);

  expect(mocks.posthog.init).not.toHaveBeenCalled();
  expect(mocks.posthog.capture).not.toHaveBeenCalled();
});
