import { expect, test } from "@playwright/test";

import { authenticateE2EUser, E2E_USER_SLUG } from "./helpers/auth";

test.describe("Inspirations", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
  });

  test("displays inspirations link in sidebar", async ({ page }) => {
    await page.goto(`/u/${E2E_USER_SLUG}/planners`);

    const inspirationsLink = page.getByRole("link", { name: /inspirations/i });
    await expect(inspirationsLink).toBeVisible();
  });

  test("navigates to inspirations page", async ({ page }) => {
    await page.goto(`/u/${E2E_USER_SLUG}/planners`);

    const inspirationsLink = page.getByRole("link", { name: /inspirations/i });
    await inspirationsLink.click();

    await expect(page).toHaveURL(/\/inspirations/);
  });

  test("displays inspiration heading", async ({ page }) => {
    await page.goto(`/u/${E2E_USER_SLUG}/inspirations`);

    const heading = page.getByRole("heading", { name: /be inspired/i });
    await expect(heading.first()).toBeVisible();
  });

  test("displays inspiration cards", async ({ page }) => {
    await page.goto(`/u/${E2E_USER_SLUG}/inspirations`);

    const cards = page.locator("section a").first();
    await expect(cards).toBeVisible();
  });

  test("displays globe emoji in heading section", async ({ page }) => {
    await page.goto(`/u/${E2E_USER_SLUG}/inspirations`);

    const globe = page.getByText("🌍");
    await expect(globe).toBeVisible();
  });
});
