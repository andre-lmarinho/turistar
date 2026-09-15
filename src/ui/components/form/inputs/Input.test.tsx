import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/i18n/locales/en.json";
import pt from "@/i18n/locales/pt-BR.json";

import { EmailField, PasswordField } from "@/ui/components/form";

describe("PasswordField", () => {
  it("toggles password visibility", () => {
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <PasswordField name="password" label="Password" />
      </NextIntlClientProvider>
    );

    const input = screen.getByLabelText("Password") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    expect(input).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggleButton);

    expect(input).toHaveAttribute("type", "text");
    expect(toggleButton).toHaveAttribute("aria-label", "Hide password");
    expect(toggleButton).toHaveAttribute("aria-pressed", "true");
    rerender(
      <NextIntlClientProvider locale="pt-BR" messages={pt}>
        <PasswordField name="password" label="Password" />
      </NextIntlClientProvider>
    );
    expect(toggleButton).toHaveAttribute("aria-label", pt.hidePassword);
    expect(input).toHaveAttribute("type", "text");
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-label", pt.showPassword);
    expect(input).toHaveAttribute("type", "password");
  });
});

describe("EmailField", () => {
  it("renders label and placeholder", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <EmailField name="email" label="Email address" placeholder="you@example.com" />
      </NextIntlClientProvider>
    );

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("applies email-related attributes", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <EmailField name="email" label="Email" />
      </NextIntlClientProvider>
    );

    const input = screen.getByLabelText("Email");

    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocapitalize", "none");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("inputmode", "email");
  });
});
