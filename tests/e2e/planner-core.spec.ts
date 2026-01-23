import { expect, test } from "@playwright/test";

import { authenticateE2EUser } from "./helpers/auth";

test.describe("Planner Core", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
  });

  test("loads planner page and displays days", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    await expect(page.getByRole("heading", { name: "Playwright E2E Plan" })).toBeVisible();
    await expect(page.getByText("Day 1")).toBeVisible();
  });

  test("displays planner tab as active", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    const plannerTab = page.getByRole("button", { name: "Planner", exact: true });
    await expect(plannerTab).toBeVisible();
  });

  test("displays map tab", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    const mapTab = page.getByRole("button", { name: /map/i });
    await expect(mapTab).toBeVisible();
  });

  test("displays budget tab", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    const budgetTab = page.getByRole("button", { name: /budget/i });
    await expect(budgetTab).toBeVisible();
  });

  test("displays share button", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    const shareButton = page.getByRole("button", { name: /share/i });
    await expect(shareButton).toBeVisible();
  });

  test("displays date button", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    // plan-e2e-001 fixture starts on Jan 01
    const dateButton = page.getByRole("button", { name: /jan 01/i });
    await expect(dateButton).toBeVisible();
  });

  test("displays day list", async ({ page }) => {
    await page.goto("/p/plan-e2e-001");

    const daysSection = page.getByRole("list", { name: /days/i });
    await expect(daysSection).toBeVisible();
  });
});
