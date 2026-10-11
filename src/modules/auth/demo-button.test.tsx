import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/locales/en.json";
import { LoginView } from "./login-view";
import { SignupView } from "./signup-view";

const mocks = vi.hoisted(() => ({
  demoSignIn: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/modules/auth/components/LanguageSelect", () => ({ LanguageSelect: () => null }));
vi.mock("@/features/demo/lib/demoSignIn", () => ({ demoSignIn: mocks.demoSignIn }));
vi.mock("@/trpc/react", () => ({
  trpc: { useUtils: () => ({ public: { profile: { availability: { fetch: vi.fn() } } } }) },
}));

const views = [
  ["signup", () => <SignupView finalizeProfile={vi.fn()} />],
  ["login", () => <LoginView resolveProfile={vi.fn()} />],
] as const;

beforeEach(() => {
  vi.resetAllMocks();
});

describe.each(views)("%s demo button", (_name, renderView) => {
  function renderLocalized() {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        {renderView()}
      </NextIntlClientProvider>
    );
  }

  it("starts one demo sign-in and shows a loading state while it is pending", async () => {
    let resolveSignIn: (slug: string) => void = () => {};
    mocks.demoSignIn.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveSignIn = resolve;
      })
    );
    renderLocalized();

    fireEvent.click(screen.getByRole("button", { name: en.exploreDemo }));
    const pendingButton = await screen.findByRole("button", { name: en.openingDemo });
    fireEvent.click(pendingButton);

    expect(mocks.demoSignIn).toHaveBeenCalledTimes(1);
    expect(pendingButton).toBeDisabled();
    expect(pendingButton).toHaveAttribute("aria-busy", "true");

    resolveSignIn("demo");
    await vi.waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/u/demo"));
    expect(screen.getByRole("button", { name: en.openingDemo })).toBeDisabled();
  });

  it("restores the button and shows the error when the demo sign-in fails", async () => {
    mocks.demoSignIn.mockRejectedValue(new Error("demo sign-in failed"));
    renderLocalized();

    fireEvent.click(screen.getByRole("button", { name: en.exploreDemo }));

    expect(await screen.findByRole("alert")).toHaveTextContent(en.signInError);
    expect(screen.getByRole("button", { name: en.exploreDemo })).toBeEnabled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
