import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('loads the homepage hero', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Less time planning. More time traveling.' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Start Your Planning' }).first()
    ).toBeVisible();
  });
});
