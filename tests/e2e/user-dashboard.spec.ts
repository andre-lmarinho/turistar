import { expect, test } from "@playwright/test";

import { goToUserPlanners, openPlannerCreationPopover } from "./helpers/plannerUi";

test.describe("User dashboard", () => {
  test("loads planners and creates a new planner", async ({ page }) => {
    await goToUserPlanners(page);

    await expect(page.getByRole("heading", { name: "Your trips" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Playwright E2E Plan" })).toBeVisible();

    await openPlannerCreationPopover(page);

    await page.getByPlaceholder("Destination").fill("Paris");
    await page.getByTestId("create-trip-submit").click();

    await expect(page).toHaveURL(/\/p\/plan-e2e-001/);
  });

  test("renders the travel map section", async ({ page }) => {
    await goToUserPlanners(page);

    await expect(page.getByRole("heading", { name: "Your travel map" })).toBeVisible();
    await expect(page.getByRole("img", { name: "World travel map" })).toBeVisible();
    await expect(page.getByText("Visited", { exact: true })).toBeVisible();
    await expect(page.getByText("Yet to explore", { exact: true })).toBeVisible();
  });

  test("explores countries with one tab stop and arrow keys", async ({ page }) => {
    await goToUserPlanners(page);

    const activeCountry = page.locator("svg [data-country][tabindex='0']");
    await expect(activeCountry).toHaveCount(1);
    const initialCountry = await activeCountry.getAttribute("data-country");
    await activeCountry.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(activeCountry).toBeFocused();
    await expect(activeCountry).not.toHaveAttribute("data-country", initialCountry ?? "");
    await expect(activeCountry).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(activeCountry).toBeFocused();
  });

  test("keeps the date picker within the mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goToUserPlanners(page);
    await openPlannerCreationPopover(page);

    const dateTrigger = page.getByRole("button", { name: /travel dates/i });
    await dateTrigger.click();
    const calendar = page.locator("[data-slot='popover-content']");
    await expect(calendar).toBeVisible();
    await expect
      .poll(async () => {
        const bounds = await calendar.boundingBox();
        return Boolean(
          bounds &&
            bounds.x >= 0 &&
            bounds.y >= 0 &&
            bounds.x + bounds.width <= 390 &&
            bounds.y + bounds.height <= 844
        );
      })
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(calendar).toHaveCount(0);
    await expect(dateTrigger).toBeFocused();
    await expect(page.getByRole("dialog", { name: "Create a trip", exact: true })).toBeVisible();
  });
});
