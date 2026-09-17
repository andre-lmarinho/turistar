import { expect, test } from "@playwright/test";

test.describe("Auth", () => {
  test("shows username taken message on blur", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("textbox", { name: "Username" }).fill("e2e-owner");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/trpc/public.profile.availability") && response.status() === 200
      ),
      page.getByRole("textbox", { name: "Email" }).click(),
    ]);

    await expect(page.getByText("Username already taken.")).toBeVisible();
  });
});

test("translates signup and password recovery without changing routes", async ({ browser }) => {
  const context = await browser.newContext({ locale: "pt-BR" });
  try {
    const page = await context.newPage();
    await page.route("**/api/trpc/public.profile.availability**", (route) =>
      route.fulfill({ json: [{ result: { data: { json: { available: false } } } }] })
    );
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Comece a planejar" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Termos", exact: true })).toHaveAttribute("href", "/terms");
    await page.getByRole("textbox", { name: "Usuário" }).fill("e2e-owner");
    await page.getByRole("textbox", { name: "E-mail" }).click();
    await expect(page.getByText("Esse nome de usuário já está em uso.")).toBeVisible();
    await page.getByRole("combobox", { name: "Idioma" }).click();
    await page.getByRole("option", { name: "English", exact: true }).click();
    await expect(page.getByText("Username already taken.")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Username" })).toHaveValue("e2e-owner");
    await page.goto("/forgot-password?next=%2Fp%2Fplan-e2e-001");
    await page.getByRole("button", { name: "Send link" }).click();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await page.getByRole("combobox", { name: "Language" }).click();
    await page.getByRole("option", { name: "Português (Brasil)", exact: true }).click();
    await expect(page.getByText("Digite seu e-mail.")).toBeVisible();
    await expect(page).toHaveURL(/forgot-password\?next=%2Fp%2Fplan-e2e-001$/);
    await page.goto("/forgot-password/reset");
    await expect(page.getByRole("heading", { name: "Redefina sua senha" })).toBeVisible();
    await expect(page.getByText("O link de recuperação é inválido ou expirou.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Atualizar senha" })).toBeDisabled();
  } finally {
    await context.close();
  }
});
