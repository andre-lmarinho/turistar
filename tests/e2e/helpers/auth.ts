import type { Page } from "@playwright/test";

export const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
export const E2E_USER_ID = "e2e-owner";
export const E2E_USER_SLUG = "e2e-owner";

export async function authenticateE2EUser(page: Page) {
  await page.context().addCookies([{ name: "e2e-user-id", value: E2E_USER_ID, url: baseURL }]);
}
