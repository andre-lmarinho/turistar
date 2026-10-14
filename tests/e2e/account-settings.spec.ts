import { expect, test } from "@playwright/test";

import { authenticateE2EUser, E2E_USER_SLUG } from "./helpers/auth";

for (const failure of [
  { code: "CONFLICT", status: 409, message: "Username already taken.", focus: "username" },
  { code: "INTERNAL_SERVER_ERROR", status: 500, message: "Unable to save your settings.", focus: "submit" },
] as const) {
  test(`preserves account settings focus through ${failure.code}`, async ({ page }) => {
    const responseReady = Promise.withResolvers<void>();
    let requests = 0;
    await page.route("**/api/trpc/viewer.profile.update**", async (route) => {
      requests += 1;
      await responseReady.promise;
      await route.fulfill({
        status: failure.status,
        json: [
          {
            error: {
              json: {
                message: "Internal details",
                code: failure.code === "CONFLICT" ? -32009 : -32603,
                data: { code: failure.code, httpStatus: failure.status, path: "viewer.profile.update" },
              },
            },
          },
        ],
      });
    });

    await authenticateE2EUser(page);
    await page.goto(`/u/${E2E_USER_SLUG}`);
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Account settings", exact: true });
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();

    const username = dialog.getByRole("textbox", { name: "Username", exact: true });
    const name = dialog.getByRole("textbox", { name: "Name", exact: true });
    const submit = dialog.getByRole("button", { name: "Save changes", exact: true });
    await username.fill("occupied");
    await submit.focus();
    await page.keyboard.press("Enter");
    await expect(submit).toHaveAttribute("aria-disabled", "true");
    await expect(submit).toHaveAttribute("aria-busy", "true");
    await expect(submit).toBeFocused();
    await expect(username).toHaveAttribute("readonly");
    await expect(name).toHaveAttribute("readonly");
    await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeDisabled();

    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expect(submit).toBeFocused();
    await expect.poll(() => requests).toBe(1);

    responseReady.resolve();
    await expect(dialog.getByRole("alert")).toHaveText(failure.message);
    await expect(dialog.getByText("Internal details")).toHaveCount(0);
    await expect(username).toHaveValue("occupied");
    await expect(username).not.toHaveAttribute("readonly");
    await expect(submit).toBeEnabled();
    await expect(failure.focus === "username" ? username : submit).toBeFocused();
    expect(requests).toBe(1);
    if (failure.focus === "username") {
      await expect(username).toHaveAttribute("aria-invalid", "true");
      await expect(username).toHaveAccessibleDescription(/Username already taken\./);
    }
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toBeHidden();
  });
}
