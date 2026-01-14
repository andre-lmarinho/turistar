import { expect, test } from "@playwright/test";

test.describe("Planner sharing", () => {
  test("hides share dialog for unauthenticated users", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    await expect(page.getByRole("heading", { name: /Playwright E2E Plan/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share planner" })).toHaveCount(0);
  });

  test("prompts sign in for unauthenticated share links", async ({ page }) => {
    await page.goto("/p/share/fd102502-7903-4df8-8c3b-11a60b3c1f1f");

    await expect(page.getByRole("heading", { name: "Join this planner" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});
