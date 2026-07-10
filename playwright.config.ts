import path from "node:path";

import { defineConfig } from "@playwright/test";
import "./tests/e2e/env";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

const resolveFromRepoRoot = (relativePath: string) => path.resolve(__dirname, relativePath);

const webCommand = process.env.PLAYWRIGHT_WEB_COMMAND ?? "pnpm dev:e2e";
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "1";

export default defineConfig({
  testDir: resolveFromRepoRoot("tests/e2e"),
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    storageState: resolveFromRepoRoot("tests/e2e/.auth/storageState.json"),
    trace: "on-first-retry",
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: webCommand,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 2 * 60 * 1000,
      },
});
