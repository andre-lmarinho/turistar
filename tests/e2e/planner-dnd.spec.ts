import { expect, test } from "@playwright/test";

import { authenticateE2EUser } from "./helpers/auth";

test.describe("Planner Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto("/p/plan-e2e-001");
  });

  test("displays days list", async ({ page }) => {
    const daysSection = page.getByRole("list", { name: /days/i });
    await expect(daysSection).toBeVisible();
  });

  test("displays day headings", async ({ page }) => {
    const firstDay = page.getByRole("heading", { name: /day 1/i });
    await expect(firstDay).toBeVisible();
  });

  test("displays add activity button in each day", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await expect(addButton).toBeVisible();
  });

  test("displays status indicator", async ({ page }) => {
    const status = page.getByRole("status");
    await expect(status.first()).toBeVisible();
  });

  test("displays map tab and Leaflet attribution", async ({ page }) => {
    const mapTab = page.getByRole("button", { name: /map/i });
    await expect(mapTab).toBeVisible();

    await mapTab.click();

    const leafletLink = page.getByRole("link", { name: /leaflet/i });
    await expect(leafletLink).toBeVisible();
  });

  test("displays zoom controls for map", async ({ page }) => {
    const mapTab = page.getByRole("button", { name: /map/i });
    await mapTab.click();

    const zoomIn = page.getByRole("button", { name: /zoom in/i });
    await expect(zoomIn.first()).toBeVisible();

    const zoomOut = page.getByRole("button", { name: /zoom out/i });
    await expect(zoomOut.first()).toBeVisible();
  });

  test("displays budget tab button", async ({ page }) => {
    const budgetButton = page.getByRole("button", { name: /budget/i });
    await expect(budgetButton).toBeVisible();
  });

  test("displays budget section when tab is clicked", async ({ page }) => {
    const budgetButton = page.getByRole("button", { name: /budget/i });
    await budgetButton.click();

    const budgetSection = page.getByRole("region", { name: /summary/i });
    await expect(budgetSection).toBeVisible();
  });

  test("displays navigation tabs", async ({ page }) => {
    const tabs = page.locator("button").filter({ hasText: /planner|map|budget/i });
    await expect(tabs.first()).toBeVisible();
  });

  test("displays map tab", async ({ page }) => {
    const mapTab = page.getByRole("button", { name: /map/i });
    await expect(mapTab).toBeVisible();
  });

  test("displays share button", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /share planner/i });
    await expect(shareButton).toBeVisible();
  });

  test("displays date button", async ({ page }) => {
    const dateButton = page.getByRole("button", { name: /jan 01/i });
    await expect(dateButton).toBeVisible();
  });
});
