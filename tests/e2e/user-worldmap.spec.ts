import { expect, test } from "@playwright/test";

import { authenticateE2EUser } from "./helpers/auth";

test.describe("Worldmap", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto("/u/e2e-owner/worldmap");
  });

  test("displays world map", async ({ page }) => {
    const svgMap = page.locator("svg.map-traveling");
    await expect(svgMap).toBeVisible();
  });

  test("displays country paths", async ({ page }) => {
    const countryPath = page.locator("path[data-id]");
    await expect(countryPath.first()).toBeVisible();
  });

  test("map has proper viewBox", async ({ page }) => {
    const svgMap = page.locator("svg.map-traveling");
    await expect(svgMap).toHaveAttribute("viewBox", /^\d+\s+\d+\s+\d+\s+\d+$/);
  });

  test("map displays title", async ({ page }) => {
    const mapImage = page.getByRole("img", { name: /world map/i });
    await expect(mapImage).toBeVisible();
  });
});
