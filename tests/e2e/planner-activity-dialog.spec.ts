import { expect, test } from "@playwright/test";
import { EMPTY_ACTIVITY_TITLE } from "@/features/activity/constants";
import { authenticateE2EUser } from "./helpers/auth";

test.describe("Activity Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto("/p/plan-e2e-001");
  });

  test("displays add activity button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await expect(addButton).toBeVisible();
  });

  test("clicking add activity shows inline input", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const inlineInput = page.getByRole("combobox", { name: /add a title/i });
    await expect(inlineInput).toBeVisible();
  });

  test("inline input displays placeholder text", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const inlineInput = page.getByRole("combobox", { name: /add a title/i });
    await expect(inlineInput).toHaveAttribute("placeholder", EMPTY_ACTIVITY_TITLE);
  });

  test("cancel button is visible when adding activity", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const cancelButton = page.getByRole("button", { name: /cancel/i }).first();
    await expect(cancelButton).toBeVisible();
  });

  test("has visible action buttons when adding activity", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await addButton.click();

    const buttons = page.getByRole("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(2);
  });
});
