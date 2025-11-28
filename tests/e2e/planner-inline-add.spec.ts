import { test, expect } from '@playwright/test';

import { ACTIVITY_COPY } from '@/features/app/planner/domain/constants/activity';

const plannerUrl = '/p/plan-e2e-001';

const selectors = {
  trigger: () => ACTIVITY_COPY.inlineAdd.collapsedLabel,
  addCta: () => ACTIVITY_COPY.inlineAdd.ctaAdd,
  input: () => '[data-testid="planner-inline-add-input"]',
};

test.describe('Planner inline add', () => {
  test('adds multiple activities with enter and closes on Add button', async ({ page }) => {
    await page.goto(plannerUrl);

    const trigger = page.getByRole('button', { name: selectors.trigger() });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const input = page.locator(selectors.input());
    await expect(input).toBeFocused();

    await input.fill('Morning coffee');
    await input.press('Enter');
    await expect(page.getByRole('button', { name: 'Morning coffee' })).toBeVisible();
    await expect(input).toHaveValue('');

    await input.fill('Museum visit');
    await input.press('Enter');
    await expect(page.getByRole('button', { name: 'Museum visit' })).toBeVisible();

    await input.fill('Lunch break');
    await input.press('Enter');
    await expect(page.getByRole('button', { name: 'Lunch break' })).toBeVisible();

    await input.fill('Dinner reservation');
    await page.getByRole('button', { name: selectors.addCta() }).click();

    await expect(trigger).toBeVisible();
    await expect(page.locator(selectors.input())).toHaveCount(0);
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('Done key submission keeps form open for rapid entry', async ({ page }) => {
      await page.goto(plannerUrl);
      const trigger = page.getByRole('button', { name: selectors.trigger() });
      await trigger.click();

      const input = page.locator(selectors.input());
      await input.fill('Sunrise walk');
      await input.press('Enter');

      await expect(page.getByRole('button', { name: 'Sunrise walk' })).toBeVisible();
      await expect(input).toBeVisible();
      await expect(input).toBeFocused();
    });
  });
});
