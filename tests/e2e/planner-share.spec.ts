import { test, expect } from '@playwright/test';

test.describe('Planner sharing', () => {
  test('shows members in the share dialog', async ({ page }) => {
    await page.goto('/p/plan-e2e-001');

    await page.getByRole('button', { name: 'Share planner' }).click();

    await expect(page.getByText('Share planner')).toBeVisible();
    await expect(page.getByText('Share this planner with a link')).toBeVisible();
    await expect(page.getByText('E2E Owner (owner)')).toBeVisible();
    await expect(page.getByText('E2E Member')).toBeVisible();
  });

  test('prompts sign in for unauthenticated share links', async ({ page }) => {
    await page.goto('/p/share/fd102502-7903-4df8-8c3b-11a60b3c1f1f');

    await expect(page.getByRole('heading', { name: 'Join this planner' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});
