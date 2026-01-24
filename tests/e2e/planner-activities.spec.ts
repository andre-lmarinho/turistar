import { expect, test } from "@playwright/test";

import { authenticateE2EUser } from "./helpers/auth";

test.describe("Planner Activities", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto("/p/plan-e2e-001");
  });

  test("displays add activity button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await expect(addButton).toBeVisible();
  });

  test("displays inline activity input when add button is clicked", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const inlineInput = page.getByRole("combobox", { name: /add a title/i });
    await expect(inlineInput).toBeVisible();
  });

  test("cancels activity creation by clicking cancel button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const inlineInput = page.getByRole("combobox", { name: /add a title/i });
    await expect(inlineInput).toBeVisible();

    const cancelButton = page.getByRole("button", { name: /cancel/i }).first();
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    await expect(inlineInput).not.toBeVisible();
  });

  test("has action buttons when adding activity", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const cancelButton = page.getByRole("button", { name: /cancel/i }).first();
    await expect(cancelButton).toBeVisible();

    const addActivityButton = page.getByRole("button", { name: /add activity/i }).first();
    await expect(addActivityButton).toBeVisible();
  });
});
