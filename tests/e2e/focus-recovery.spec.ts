import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { authenticateE2EUser, E2E_USER_SLUG } from "./helpers/auth";
import { goToPlannerPage, openPlannerMode, openShareDialog } from "./helpers/plannerUi";

const cases = [
  {
    name: "trip creation",
    procedure: "viewer.plan.create",
    error: "Failed to create plan",
    prepare: async (page: Page) => {
      await authenticateE2EUser(page);
      await page.goto(`/u/${E2E_USER_SLUG}`);
      await page.getByTestId("create-trip-trigger").click();
      const dialog = page.getByRole("dialog", { name: "Create a trip", exact: true });
      await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
      await dialog.getByRole("combobox", { name: "Destination", exact: true }).fill("Paris");
      return page.getByTestId("create-trip-submit");
    },
  },
  {
    name: "member invitation",
    procedure: "viewer.members.add",
    error: "We could not add this member",
    prepare: async (page: Page) => {
      await goToPlannerPage(page);
      const dialog = await openShareDialog(page);
      await dialog.getByRole("textbox", { name: /email/i }).fill("audit@example.com");
      return dialog.getByRole("button", { name: "Share", exact: true });
    },
  },
  {
    name: "member role update",
    procedure: "viewer.members.update",
    error: "Unable to update members",
    prepare: async (page: Page) => {
      await goToPlannerPage(page);
      const dialog = await openShareDialog(page);
      return dialog.getByRole("combobox", { name: "Role for E2E Member", exact: true });
    },
  },
  {
    name: "deletion confirmation",
    procedure: "viewer.plan.delete",
    error: "Something went wrong",
    prepare: async (page: Page) => {
      await goToPlannerPage(page);
      await page.getByRole("button", { name: "Delete planner", exact: true }).click();
      const dialog = page.getByRole("alertdialog", { name: "Delete planner", exact: true });
      await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
      return dialog.getByRole("button", { name: "Delete", exact: true });
    },
  },
  {
    name: "expense creation",
    procedure: "viewer.budget.createEntry",
    error: "Could not save the expense",
    prepare: async (page: Page) => {
      await goToPlannerPage(page);
      await openPlannerMode(page, "budget");
      const section = page.getByRole("region", { name: "Expenses", exact: true });
      await section
        .getByRole("textbox", { name: /description/i })
        .first()
        .fill("Audit expense");
      await section
        .getByRole("textbox", { name: /amount/i })
        .first()
        .fill("10");
      return section.getByRole("button", { name: "Add expense", exact: true });
    },
  },
];

for (const scenario of cases) {
  test(`preserves ${scenario.name} focus through request failure`, async ({ page }) => {
    const responseReady = Promise.withResolvers<void>();
    let requests = 0;
    await page.route(`**/api/trpc/${scenario.procedure}**`, async (route) => {
      requests += 1;
      await responseReady.promise;
      await route.fulfill({
        status: 500,
        json: [
          {
            error: {
              json: {
                message: "Offline",
                code: -32603,
                data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, path: scenario.procedure },
              },
            },
          },
        ],
      });
    });
    const submit = await scenario.prepare(page);
    await expect(submit).toBeEnabled();
    await submit.focus();
    if (scenario.procedure === "viewer.members.update") await submit.selectOption("admin");
    else await page.keyboard.press("Enter");
    await expect(submit).toHaveAttribute("aria-disabled", "true");
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    await expect(submit).toBeFocused();
    await page.keyboard.press(scenario.procedure === "viewer.members.update" ? "ArrowDown" : "Enter");
    responseReady.resolve();
    await expect(page.getByRole("alert").filter({ hasText: scenario.error })).toBeVisible();
    await expect(submit).toBeEnabled();
    await expect(submit).toBeFocused();
    expect(requests).toBe(1);
  });
}
