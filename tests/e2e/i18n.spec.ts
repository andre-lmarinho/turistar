import { expect, test } from "@playwright/test";
import { authenticateE2EUser } from "./helpers/auth";

test("language persists without changing the URL or another visitor's preference", async ({ browser }) => {
  const first = await browser.newContext({ locale: "pt-BR" });
  const second = await browser.newContext({ locale: "en-US" });
  try {
    const a = await first.newPage();
    const b = await second.newPage();
    const response = await a.goto("/login?next=%2Fp%2Fplan-e2e-001");
    expect(await response?.text()).toContain('lang="pt-BR"');
    await b.goto("/login");
    await expect(a.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(a.getByRole("heading", { name: "Boas-vindas de volta" })).toBeVisible();
    await a.getByLabel("E-mail", { exact: true }).fill("visitor@example.com");
    await a.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(a.getByText("Informe sua senha.")).toBeVisible();
    await a.getByRole("combobox", { name: "Idioma" }).click();
    await a.getByRole("option", { name: "English", exact: true }).click();
    await expect(a.getByText("Password is required.")).toBeVisible();
    await expect(a.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(a.getByLabel("Email", { exact: true })).toHaveValue("visitor@example.com");
    await expect(a).toHaveURL(/\/login\?next=%2Fp%2Fplan-e2e-001$/);
    await a.reload();
    await expect(a.locator("html")).toHaveAttribute("lang", "en");
    await a.getByRole("combobox", { name: "Language" }).focus();
    await a.keyboard.press("ArrowDown");
    await a.keyboard.press("End");
    await a.keyboard.press("Enter");
    await expect(a.locator("html")).toHaveAttribute("lang", "pt-BR");
    await authenticateE2EUser(a);
    await authenticateE2EUser(b);
    await a.goto("/u/e2e-owner");
    await b.goto("/u/e2e-owner");
    await expect(a.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(b.locator("html")).toHaveAttribute("lang", "en");
    await a.screenshot({ path: "/tmp/turistar-i18n.png", fullPage: true });
  } finally {
    await first.close();
    await second.close();
  }
});
