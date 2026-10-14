import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/locales/en.json";
import { LoginView } from "./login-view";
import { SignupView } from "./signup-view";

const mocks = vi.hoisted(() => ({
  demoSignIn: vi.fn(),
  signIn: vi.fn(),
  register: vi.fn(),
  available: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/modules/auth/components/LanguageSelect", () => ({ LanguageSelect: () => null }));
vi.mock("@/features/demo/lib/demoSignIn", () => ({ demoSignIn: mocks.demoSignIn }));
vi.mock("@/features/auth/handlers/signInWithPassword", () => ({ signInWithPassword: mocks.signIn }));
vi.mock("@/features/auth/handlers/registerWithPassword", () => ({ registerWithPassword: mocks.register }));
vi.mock("@/trpc/react", () => ({
  trpc: { useUtils: () => ({ public: { profile: { availability: { fetch: mocks.available } } } }) },
}));

const views = [
  ["signup", () => <SignupView finalizeProfile={vi.fn()} />],
  ["login", () => <LoginView resolveProfile={vi.fn()} />],
] as const;

beforeEach(() => {
  vi.resetAllMocks();
  mocks.available.mockResolvedValue({ available: true });
  mocks.signIn.mockResolvedValue({ slug: "profile" });
  mocks.register.mockResolvedValue({ status: "signed-in", slug: "profile" });
});

it("keeps password recovery separate from the password field label", () => {
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <LoginView resolveProfile={vi.fn()} />
    </NextIntlClientProvider>
  );
  expect(screen.getByLabelText(en.password, { exact: true })).toHaveAccessibleName(en.password);
  expect(screen.getByRole("link", { name: en.forgotPassword })).toHaveAttribute("href", "/forgot-password");
});

describe.each(views)("%s authentication actions", (name, renderView) => {
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
    const pendingButton = screen.getByRole("button", { name: en.exploreDemo });
    fireEvent.click(pendingButton);

    expect(mocks.demoSignIn).toHaveBeenCalledTimes(1);
    expect(pendingButton).toHaveAttribute("aria-disabled", "true");
    expect(pendingButton).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("button", { name: name === "login" ? en.signIn : en.createAccount })
    ).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText(en.openingDemo)).toBeInTheDocument();

    resolveSignIn("demo");
    await vi.waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/u/demo"));
    expect(screen.getByRole("button", { name: en.exploreDemo })).toHaveAttribute("aria-disabled", "true");
  });

  it("restores the button and shows the error when the demo sign-in fails", async () => {
    mocks.demoSignIn.mockRejectedValue(new Error("demo sign-in failed"));
    renderLocalized();

    fireEvent.click(screen.getByRole("button", { name: en.exploreDemo }));

    expect(await screen.findByRole("alert")).toHaveTextContent(en.signInError);
    expect(screen.getByRole("button", { name: en.exploreDemo })).toBeEnabled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  function fillCredentials() {
    if (name === "signup") {
      fireEvent.change(screen.getByLabelText(en.username), { target: { value: "new-user" } });
    }
    fireEvent.change(screen.getByLabelText(en.email), { target: { value: "test@example.com" } });
    fireEvent.change(
      screen.getByPlaceholderText(name === "login" ? en.passwordPlaceholder : en.createPasswordPlaceholder),
      {
        target: { value: "safe-password" },
      }
    );
  }

  it("prevents email authentication while demo sign-in is pending", async () => {
    mocks.demoSignIn.mockReturnValue(new Promise(() => {}));
    renderLocalized();
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: en.exploreDemo }));
    fireEvent.submit(screen.getByLabelText(en.email).closest("form") as HTMLFormElement);

    await vi.waitFor(() => expect(mocks.demoSignIn).toHaveBeenCalledTimes(1));
    expect(mocks.signIn).not.toHaveBeenCalled();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it("prevents demo sign-in during email authentication and keeps controls pending through navigation", async () => {
    let finish: (result: { slug: string; status: "signed-in" }) => void = () => {};
    const authentication = name === "login" ? mocks.signIn : mocks.register;
    authentication.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    renderLocalized();
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: name === "login" ? en.signIn : en.createAccount }));
    await vi.waitFor(() => expect(authentication).toHaveBeenCalledTimes(1));

    const demoButton = screen.getByRole("button", { name: en.exploreDemo });
    expect(demoButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(demoButton);
    expect(mocks.demoSignIn).not.toHaveBeenCalled();
    const submitButton = screen.getByRole("button", {
      name: name === "login" ? en.signIn : en.createAccount,
    });
    expect(submitButton).toHaveAttribute("aria-busy", "true");

    finish({ slug: "profile", status: "signed-in" });
    await vi.waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/u/profile"));
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
    expect(demoButton).toHaveAttribute("aria-disabled", "true");
  });

  it("restores both authentication actions after email authentication fails", async () => {
    const authentication = name === "login" ? mocks.signIn : mocks.register;
    authentication.mockRejectedValue(new Error("Authentication failed"));
    renderLocalized();
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: name === "login" ? en.signIn : en.createAccount }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      name === "login" ? en.signInError : en.signupError
    );
    expect(
      screen.getByRole("button", { name: name === "login" ? en.signIn : en.createAccount })
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: en.exploreDemo })).toBeEnabled();
  });
});
