import { expect, test } from "@playwright/test";

test.describe("Planner sharing", () => {
  test("hides share dialog for unauthenticated users", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    await expect(page.getByRole("heading", { name: /Playwright E2E Plan/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share planner" })).toHaveCount(0);
  });
});
