import { expect, test } from "@playwright/test";

test("starts the desktop LCP image before stylesheets finish loading", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let releaseStyles: () => void = () => {};
  const stylesReleased = new Promise<void>((resolve) => {
    releaseStyles = resolve;
  });
  let stylesheetRequested = false;
  let imageRequests = 0;
  page.on("request", (request) => {
    if (request.resourceType() === "image" && request.url().includes("app-mock")) imageRequests++;
  });
  await page.route("**/*.css*", async (route) => {
    stylesheetRequested = true;
    await stylesReleased;
    await route.continue();
  });

  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect.poll(() => stylesheetRequested).toBe(true);
    await expect.poll(() => imageRequests).toBe(1);
  } finally {
    releaseStyles();
  }
  await page.waitForLoadState("load");
  await expect(page.locator("img")).toBeVisible();
  await expect
    .poll(() => page.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  expect(imageRequests).toBe(1);
});

test("does not download the desktop illustration on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1023, height: 900 });
  const imageRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "image" && request.url().includes("app-mock")) {
      imageRequests.push(request.url());
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("img")).toBeHidden();
  expect(imageRequests).toEqual([]);
});
