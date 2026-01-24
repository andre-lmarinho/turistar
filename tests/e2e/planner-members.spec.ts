import { expect, test } from "@playwright/test";

import { authenticateE2EUser } from "./helpers/auth";

test.describe("Planner Members", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateE2EUser(page);
    await page.goto("/p/plan-e2e-001");
  });

  test("opens share dialog when share button is clicked", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /share/i });
    await expect(shareButton).toBeVisible();

    await shareButton.click();

    const shareDialog = page.getByRole("dialog");
    await expect(shareDialog.first()).toBeVisible();
  });

  test("share dialog contains members section", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    const shareDialog = page.getByRole("dialog");
    await expect(shareDialog).toBeVisible();

    // Check for members-related content in the dialog
    const membersContent = shareDialog.getByText(/member|invite/i);
    await expect(membersContent.first()).toBeVisible();
  });

  test("share dialog contains invite form", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput.first()).toBeVisible();
  });

  test("share dialog has close button", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    const closeButton = page.getByRole("button", { name: /close/i });
    await expect(closeButton.first()).toBeVisible();
  });

  test("can close share dialog", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /share/i });
    await shareButton.click();

    const shareDialog = page.getByRole("dialog");
    await expect(shareDialog.first()).toBeVisible();

    const closeButton = page.getByRole("button", { name: /close/i }).first();
    await closeButton.click();

    await expect(shareDialog.first()).not.toBeVisible();
  });
});
