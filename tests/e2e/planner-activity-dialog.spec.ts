import { expect, test } from "@playwright/test";
import { EMPTY_ACTIVITY_TITLE } from "@/features/activity/constants";
import { goToPlannerPage, openInlineActivity } from "./helpers/plannerUi";

test.describe("Activity Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await goToPlannerPage(page);
  });

  test("displays add activity button", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await expect(addButton).toBeVisible();
  });

  test("clicking add activity shows inline input", async ({ page }) => {
    const inlineInput = await openInlineActivity(page);
    await expect(inlineInput).toBeVisible();
  });

  test("inline input displays placeholder text", async ({ page }) => {
    const inlineInput = await openInlineActivity(page);
    await expect(inlineInput).toHaveAttribute("placeholder", EMPTY_ACTIVITY_TITLE);
  });

  test("cancel button is visible when adding activity", async ({ page }) => {
    await openInlineActivity(page);
    const cancelButton = page.getByRole("button", { name: /cancel/i }).first();
    await expect(cancelButton).toBeVisible();
  });

  test("has visible action buttons when adding activity", async ({ page }) => {
    await openInlineActivity(page);

    const buttons = page.getByRole("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(2);
  });
});
