import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "@/i18n/locales/en.json";
import pt from "@/i18n/locales/pt-BR.json";
import { ResetPasswordView } from "./forgot-password/forgot-password-reset-view";
import { ForgotPasswordView } from "./forgot-password/forgot-password-view";
import { SignupView } from "./signup-view";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  exchange: vi.fn(),
  update: vi.fn(),
  register: vi.fn(),
  available: vi.fn(),
  params: new URLSearchParams("code=test"),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => mocks.params,
}));
vi.mock("@/modules/auth/components/LanguageSelect", () => ({ LanguageSelect: () => null }));
vi.mock("@/features/auth/handlers/sendResetPasswordEmail", () => ({ sendResetPasswordEmail: mocks.send }));
vi.mock("@/features/auth/handlers/exchangeResetPasswordSession", () => ({
  exchangeResetPasswordSession: mocks.exchange,
}));
vi.mock("@/features/auth/handlers/updatePassword", () => ({ updatePassword: mocks.update }));
vi.mock("@/features/auth/handlers/registerWithPassword", () => ({ registerWithPassword: mocks.register }));
vi.mock("@/trpc/react", () => ({
  trpc: { useUtils: () => ({ public: { profile: { availability: { fetch: mocks.available } } } }) },
}));

function localized(children: ReactNode, locale: "en" | "pt-BR" = "pt-BR") {
  return (
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? en : pt}>
      {children}
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.params = new URLSearchParams("code=test");
  mocks.exchange.mockResolvedValue({ status: "ready" });
  mocks.update.mockResolvedValue({ ok: true });
  mocks.available.mockResolvedValue({ available: true });
});

describe("auth translations", () => {
  it("keeps username availability errors and entered values when the language changes", async () => {
    mocks.available.mockResolvedValue({ available: false });
    const view = <SignupView finalizeProfile={vi.fn()} />;
    const { rerender } = render(localized(view));
    fireEvent.change(screen.getByLabelText("Usuário"), { target: { value: "taken" } });
    fireEvent.blur(screen.getByLabelText("Usuário"));
    expect(await screen.findByText(pt.usernameTaken)).toBeVisible();
    rerender(localized(view, "en"));
    expect(await screen.findByText(en.usernameTaken)).toBeVisible();
    expect(screen.getByLabelText("Username")).toHaveValue("taken");
    expect(mocks.available).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: en.createAccount })).toBeEnabled();
  });

  it("translates signup confirmation and preserves rich-text link destinations", async () => {
    mocks.register.mockResolvedValue({ status: "needs-confirmation" });
    const view = <SignupView finalizeProfile={vi.fn()} />;
    const { rerender } = render(localized(view));
    fireEvent.change(screen.getByLabelText("Usuário"), { target: { value: "new-user" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Senha", { exact: true }), { target: { value: "safe-password" } });
    fireEvent.click(screen.getByRole("button", { name: pt.createAccount }));
    expect(await screen.findByText(pt.signupConfirmation)).toBeVisible();
    expect(screen.getByRole("link", { name: "Termos" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacy");
    rerender(localized(view, "en"));
    expect(screen.getByText(en.signupConfirmation)).toBeVisible();
  });

  it("retranslates email validation and success after sending the reset link", async () => {
    const view = <ForgotPasswordView />;
    const { rerender } = render(localized(view));
    fireEvent.click(screen.getByRole("button", { name: pt.sendResetLink }));
    expect(await screen.findByText(pt.emailRequired)).toBeVisible();
    rerender(localized(view, "en"));
    expect(await screen.findByText(en.emailRequired)).toBeVisible();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: en.sendResetLink }));
    expect(await screen.findByText(en.resetEmailSent)).toBeVisible();
    rerender(localized(view));
    expect(screen.getByText(pt.resetEmailSent)).toBeVisible();
  });

  it("shows a translated failure instead of a raw reset email error", async () => {
    mocks.send.mockRejectedValue(new Error("Internal service error"));
    render(localized(<ForgotPasswordView />));
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: pt.sendResetLink }));
    expect(await screen.findByText(pt.resetEmailError)).toBeVisible();
    expect(screen.queryByText("Internal service error")).not.toBeInTheDocument();
  });

  it("retranslates an invalid link without exchanging its code again", async () => {
    mocks.exchange.mockResolvedValue({ status: "error", error: new Error("Expired") });
    const view = <ResetPasswordView />;
    const { rerender } = render(localized(view));
    expect(await screen.findByText(pt.invalidResetLink)).toBeVisible();
    rerender(localized(view, "en"));
    expect(screen.getByText(en.invalidResetLink)).toBeVisible();
    expect(mocks.exchange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: en.updatePassword })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.requestNewResetLink })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it.each([true, false])("translates password update result (success=%s)", async (ok) => {
    mocks.update.mockResolvedValue({ ok, error: new Error("Internal update failure") });
    const view = <ResetPasswordView />;
    const { rerender } = render(localized(view));
    await waitFor(() => expect(screen.getByRole("button", { name: pt.updatePassword })).toBeEnabled());
    fireEvent.change(screen.getByLabelText(pt.newPassword), { target: { value: "safe-password" } });
    fireEvent.click(screen.getByRole("button", { name: pt.updatePassword }));
    expect(await screen.findByText(ok ? pt.passwordUpdated : pt.resetPasswordError)).toBeVisible();
    rerender(localized(view, "en"));
    expect(screen.getByText(ok ? en.passwordUpdated : en.resetPasswordError)).toBeVisible();
    expect(mocks.exchange).toHaveBeenCalledTimes(1);
    if (ok) {
      expect(screen.queryByRole("button", { name: en.updatePassword })).not.toBeInTheDocument();
      expect(screen.getByText(en.passwordUpdated)).toHaveFocus();
    }
  });
});

describe("auth error recovery", () => {
  function fillSignup() {
    fireEvent.change(screen.getByLabelText(en.username), { target: { value: "new-user" } });
    fireEvent.change(screen.getByLabelText(en.email), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(en.createPasswordPlaceholder), {
      target: { value: "safe-password" },
    });
  }

  it("lets users edit a taken username and submit the corrected form", async () => {
    mocks.available.mockResolvedValueOnce({ available: false });
    mocks.register.mockResolvedValue({ status: "needs-confirmation" });
    render(localized(<SignupView finalizeProfile={vi.fn()} />, "en"));
    fillSignup();
    fireEvent.blur(screen.getByLabelText(en.username));
    expect(await screen.findByText(en.usernameTaken)).toBeVisible();
    expect(screen.getByRole("button", { name: en.createAccount })).toBeEnabled();

    fireEvent.change(screen.getByLabelText(en.username), { target: { value: "other-user" } });
    expect(screen.queryByText(en.usernameTaken)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: en.createAccount }));
    const confirmation = await screen.findByText(en.signupConfirmation);
    expect(confirmation).toHaveAttribute("role", "status");
    expect(mocks.register).toHaveBeenCalledWith(expect.objectContaining({ username: "other-user" }));
    expect(screen.getByRole("button", { name: en.exploreDemo })).toBeEnabled();
  });

  it("allows retrying a failed username check without changing valid input", async () => {
    mocks.available.mockRejectedValueOnce(new Error("Availability request failed"));
    mocks.register.mockResolvedValue({ status: "needs-confirmation" });
    render(localized(<SignupView finalizeProfile={vi.fn()} />, "en"));
    fillSignup();
    fireEvent.blur(screen.getByLabelText(en.username));
    expect(await screen.findByText(en.usernameCheckFailed)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: en.createAccount }));
    expect(await screen.findByText(en.signupConfirmation)).toBeVisible();
    expect(mocks.available).toHaveBeenCalledTimes(2);
    expect(mocks.register).toHaveBeenCalledTimes(1);
  });

  it("does not apply a failed availability response after the username changes", async () => {
    let rejectFirst: (reason: Error) => void = () => {};
    mocks.available.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectFirst = reject;
      })
    );
    render(localized(<SignupView finalizeProfile={vi.fn()} />, "en"));
    fireEvent.change(screen.getByLabelText(en.username), { target: { value: "first-user" } });
    fireEvent.blur(screen.getByLabelText(en.username));
    fireEvent.change(screen.getByLabelText(en.username), { target: { value: "second-user" } });
    fireEvent.blur(screen.getByLabelText(en.username));
    await waitFor(() => expect(screen.queryByText(en.checkingUsername)).not.toBeInTheDocument());
    expect(mocks.available).toHaveBeenCalledTimes(2);

    await act(async () => {
      rejectFirst(new Error("Stale request failed"));
    });
    expect(screen.queryByText(en.usernameCheckFailed)).not.toBeInTheDocument();
    expect(screen.getByLabelText(en.username)).not.toHaveAttribute("aria-invalid", "true");
  });

  it("focuses an unavailable username after form submission", async () => {
    mocks.available.mockResolvedValue({ available: false });
    render(localized(<SignupView finalizeProfile={vi.fn()} />, "en"));
    fillSignup();
    fireEvent.click(screen.getByRole("button", { name: en.createAccount }));
    expect(await screen.findByText(en.usernameTaken)).toBeVisible();
    expect(screen.getByLabelText(en.username)).toHaveFocus();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it("offers a new reset link when session exchange rejects", async () => {
    mocks.exchange.mockRejectedValue(new Error("Network unavailable"));
    render(localized(<ResetPasswordView nextPath="/u/profile" />, "en"));
    expect(await screen.findByRole("alert")).toHaveTextContent(en.invalidResetLink);
    expect(screen.getByRole("link", { name: en.requestNewResetLink })).toHaveAttribute(
      "href",
      "/forgot-password?next=%2Fu%2Fprofile"
    );
    expect(screen.queryByLabelText(en.newPassword)).not.toBeInTheDocument();
  });
});
