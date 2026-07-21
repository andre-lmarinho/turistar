import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";
export const E2E_USER_ID = "e2e-owner";
export const E2E_USER_SLUG = "e2e-owner";

export async function authenticateE2EUser(page: Page) {
  await page.context().addCookies([{ name: "e2e-user-id", value: E2E_USER_ID, url: baseURL }]);
}

export async function goToPlanner(page: Page, planSlug = "plan-e2e-001") {
  await authenticateE2EUser(page);
  await page.goto(`/p/${planSlug}`);
  await expect(page.getByRole("list", { name: /days/i })).toBeVisible();
}

export async function goToDashboard(page: Page) {
  await authenticateE2EUser(page);
  await page.goto(`/u/${E2E_USER_SLUG}`);
  await expect(page.getByRole("heading", { name: /your planners/i })).toBeVisible();
}
