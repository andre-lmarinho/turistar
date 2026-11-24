import { expect, test } from "@playwright/test";

import {
  goToPlannerPage,
  goToUserPlanners,
  openInlineActivity,
  openPlannerCreationPopover,
} from "./helpers/plannerUi";

test.describe("Search & Autocomplete", () => {
  test("displays destination search on create planner page", async ({ page }) => {
    await goToUserPlanners(page);

    await openPlannerCreationPopover(page);

    const destinationInput = page.getByPlaceholder("Destination");
    await expect(destinationInput).toBeVisible();
  });

  test("Tab leaves suggestions and Shift+Tab returns without reopening them", async ({ page }) => {
    const queries: string[] = [];
    await page.clock.install();
    await page.route("**/api/places/city-country?*", (route) => {
      const query = new URL(route.request().url()).searchParams.get("text") ?? "";
      queries.push(query);
      return route.fulfill({
        json: { results: [{ name: `${query}, Japan`, latitude: 35.68, longitude: 139.69 }] },
      });
    });
    await goToUserPlanners(page);

    await openPlannerCreationPopover(page);

    const destinationInput = page.getByPlaceholder("Destination");
    await destinationInput.fill("Tokyo");
    await expect(page.getByRole("option", { name: "Tokyo, Japan" })).toBeVisible();
    await destinationInput.press("ArrowDown");
    await destinationInput.press("Tab");
    await expect(page.locator("#travel-dates")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(destinationInput).toBeFocused();
    await expect(destinationInput).toHaveAttribute("aria-expanded", "false");
    await expect(destinationInput).toHaveValue("Tokyo");
    await destinationInput.press("ArrowDown");
    const option = page.getByRole("option", { name: "Tokyo, Japan" });
    await expect(option).toBeVisible();
    await page
      .locator("h2")
      .filter({ hasText: /^Create a trip$/i })
      .click();
    await expect(option).toBeHidden();
    await page.clock.fastForward(61_000);
    await destinationInput.click();
    await expect(option).toBeVisible();
    await destinationInput.press("ArrowDown");
    await destinationInput.press("Enter");
    await expect(destinationInput).toHaveValue("Tokyo, Japan");
    await expect(option).toBeHidden();
    await destinationInput.click();
    await expect(option).toBeVisible();
    await destinationInput.fill("Osaka");
    await expect(page.getByRole("option", { name: "Osaka, Japan" })).toBeVisible();
    expect(queries).toEqual(["Tokyo", "Osaka"]);
  });

  test("create planner dialog has destination field", async ({ page }) => {
    await goToUserPlanners(page);
    await openPlannerCreationPopover(page);

    await expect(page.getByRole("heading", { name: /create a trip/i })).toBeVisible();
    const destinationInput = page.getByPlaceholder("Destination");
    await expect(destinationInput).toBeVisible();
  });

  test("start planning button exists", async ({ page }) => {
    await goToUserPlanners(page);
    await openPlannerCreationPopover(page);

    const startButton = page.getByRole("button", { name: /create a trip/i });
    await expect(startButton).toBeVisible();
  });

  test("inline activity search shows input when adding", async ({ page }) => {
    await goToPlannerPage(page);
    const searchInput = await openInlineActivity(page);
    await expect(searchInput).toBeVisible();

    await searchInput.fill("Museum");
    await expect(searchInput).toHaveValue("Museum");
  });
});
