import { expect, test } from "@playwright/test";

import { authenticateE2EUser, E2E_USER_SLUG } from "./helpers/auth";

test.describe("User worldmap", () => {
  test("highlights visited countries", async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto(`/u/${E2E_USER_SLUG}/worldmap`);

    await expect(page.locator("svg.map-traveling")).toBeVisible();
    await expect(page.locator("path#BR")).toHaveClass(/visited/);
  });
});
