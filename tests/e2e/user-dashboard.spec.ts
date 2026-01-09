import { expect, test } from "@playwright/test";

import { authenticateE2EUser, E2E_USER_SLUG } from "./helpers/auth";

test.describe("User dashboard", () => {
  test("loads planners and creates a new planner", async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto(`/u/${E2E_USER_SLUG}/planners`);

    await expect(page.getByRole("heading", { name: "Your planners" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Playwright E2E Plan" })).toBeVisible();

    await page.getByRole("button", { name: "Create new planner" }).click();
    await expect(page.getByRole("heading", { name: "Create Planner" })).toBeVisible();

    await page.getByPlaceholder("Destination").fill("Paris");
    await page.getByRole("button", { name: "Start Your Planning" }).click();

    await expect(page).toHaveURL(/\/p\/plan-e2e-001/);
  });
});
