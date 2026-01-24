import { expect, test } from "@playwright/test";

import { authenticateE2EUser } from "./helpers/auth";

test.describe("Search & Autocomplete", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto("/p/plan-e2e-001");
  });

  test("displays destination search on create planner page", async ({ page }) => {
    await page.goto("/u/e2e-owner/planners");

    const createButton = page.getByRole("button", { name: /create new planner/i });
    await createButton.click();

    const destinationInput = page.getByPlaceholder("Destination");
    await expect(destinationInput).toBeVisible();
  });

  test("can type in destination search", async ({ page }) => {
    await page.goto("/u/e2e-owner/planners");

    const createButton = page.getByRole("button", { name: /create new planner/i });
    await createButton.click();

    const destinationInput = page.getByPlaceholder("Destination");
    await destinationInput.fill("Tokyo");

    await expect(destinationInput).toHaveValue("Tokyo");
  });

  test("create planner dialog has destination field", async ({ page }) => {
    await page.goto("/u/e2e-owner/planners");

    const createButton = page.getByRole("button", { name: /create new planner/i });
    await createButton.click();

    const heading = page.getByRole("heading", { name: /create planner/i });
    await expect(heading).toBeVisible();

    const destinationInput = page.getByPlaceholder("Destination");
    await expect(destinationInput).toBeVisible();
  });

  test("start planning button exists", async ({ page }) => {
    await page.goto("/u/e2e-owner/planners");

    const createButton = page.getByRole("button", { name: /create new planner/i });
    await createButton.click();

    const startButton = page.getByRole("button", { name: /start your planning/i });
    await expect(startButton).toBeVisible();
  });

  test("inline activity search shows input when adding", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const searchInput = page.getByRole("combobox", { name: /add a title/i });
    await expect(searchInput).toBeVisible();

    await searchInput.fill("Museum");
    await expect(searchInput).toHaveValue("Museum");
  });
});
