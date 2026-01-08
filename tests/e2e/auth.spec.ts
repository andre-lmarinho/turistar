import { expect, test } from "@playwright/test";

test.describe("Auth", () => {
  test("shows username taken message on blur", async ({ page }) => {
    let routeCalled = false;
    await page.route("**/api/profile/availability*", async (route) => {
      routeCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ available: false }),
      });
    });

    await page.goto("/signup");

    await page.getByRole("textbox", { name: "Username" }).fill("e2e-owner");
    await page.getByRole("textbox", { name: "Email" }).click();

    // Ensure the API was actually called
    expect(routeCalled).toBe(true);
    await expect(page.getByText("Username already taken.")).toBeVisible();
  });
});
