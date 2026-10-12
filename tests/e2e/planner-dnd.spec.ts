import { expect, test } from "@playwright/test";

import {
  getPlannerDatePicker,
  goToPlannerPage,
  openInlineActivity,
  openPlannerMode,
} from "./helpers/plannerUi";

test.describe("Planner Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    await goToPlannerPage(page);
  });

  test("displays days list", async ({ page }) => {
    const daysSection = page.getByRole("list", { name: /days/i });
    await expect(daysSection).toBeVisible();
  });

  test("displays day headings", async ({ page }) => {
    const firstDay = page.getByRole("heading", { name: "Mon, Jan 01" });
    await expect(firstDay).toBeVisible();
  });

  test("displays add activity button in each day", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add activity/i }).first();
    await expect(addButton).toBeVisible();
  });

  test("displays status indicator", async ({ page }) => {
    const status = page.getByRole("status");
    await expect(status.first()).toBeVisible();
  });

  test("displays budget tab button", async ({ page }) => {
    const budgetButton = page.getByRole("button", { name: /budget/i });
    await expect(budgetButton).toBeVisible();
  });

  test("displays budget section when tab is clicked", async ({ page }) => {
    await openPlannerMode(page, "budget");
    const budgetSection = page.getByRole("region", { name: /total spent/i });
    await expect(budgetSection).toBeVisible();
  });

  test("displays navigation tabs", async ({ page }) => {
    const tabs = page.locator("button").filter({ hasText: /planner|map|budget/i });
    await expect(tabs.first()).toBeVisible();
  });

  test("displays map tab", async ({ page }) => {
    const mapTab = page.getByRole("button", { name: /trip/i });
    await expect(mapTab).toBeVisible();
  });

  test("displays share button", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /share planner/i });
    await expect(shareButton).toBeVisible();
  });

  test("displays date button", async ({ page }) => {
    const dateButton = getPlannerDatePicker(page);
    await expect(dateButton).toBeVisible();
  });

  test("drags cards by their body and preserves click and keyboard interactions", async ({ page }) => {
    test.setTimeout(60_000);
    await page.locator('[data-testid="planner-mode-kanban"]:visible').first().click();
    const firstTitle = "UX drag first";
    const secondTitle = "UX drag second";
    for (const title of [firstTitle, secondTitle]) {
      const input = await openInlineActivity(page);
      await input.fill(title);
      await Promise.all([
        page.waitForResponse((response) => response.url().includes("viewer.events.append") && response.ok()),
        page.getByRole("button", { name: "Done", exact: true }).click(),
      ]);
    }

    const titles = page
      .getByTestId("day-scroll")
      .first()
      .locator("h3")
      .filter({ hasText: /^UX drag / });
    await expect(titles).toHaveText([firstTitle, secondTitle]);
    const firstCard = page.getByRole("button", { name: firstTitle, exact: true });
    const secondCard = page.getByRole("button", { name: secondTitle, exact: true });
    const source = await firstCard.boundingBox();
    const target = await secondCard.boundingBox();
    expect(source).not.toBeNull();
    expect(target).not.toBeNull();
    if (!source || !target) return;

    await page.mouse.move(source.x + 40, source.y + source.height / 2);
    await page.mouse.down();
    await page.mouse.move(target.x + 40, target.y + target.height - 5, { steps: 12 });
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("viewer.events.append") && response.ok()),
      page.mouse.up(),
    ]);
    await expect(titles).toHaveText([secondTitle, firstTitle]);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await secondCard.click();
    await expect(page.getByRole("dialog").locator("#title")).toHaveValue(secondTitle);
    await page.getByRole("button", { name: "Done", exact: true }).click();

    const handle = page.getByRole("button", { name: `Reorder activity ${secondTitle}`, exact: true });
    await handle.focus();
    await page.keyboard.press("Space");
    await expect(handle).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await page.keyboard.press("ArrowDown");
    await expect(titles).toHaveText([firstTitle, secondTitle]);
    await Promise.all([
      page.waitForResponse((response) => response.url().includes("viewer.events.append") && response.ok()),
      page.keyboard.press("Space"),
    ]);
    await expect(titles).toHaveText([firstTitle, secondTitle]);

    await page.reload();
    await page.locator('[data-testid="planner-mode-kanban"]:visible').first().click();
    await expect(titles).toHaveText([firstTitle, secondTitle]);
    for (const title of [firstTitle, secondTitle]) {
      await page.getByRole("button", { name: title, exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
      await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();
      await expect(page.getByRole("heading", { name: title, exact: true })).toHaveCount(0);
    }
  });
});
