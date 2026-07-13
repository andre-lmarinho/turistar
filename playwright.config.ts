import path from "node:path";

import { defineConfig } from "@playwright/test";
import "./tests/e2e/env";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

const resolveFromRepoRoot = (relativePath: string) => path.resolve(__dirname, relativePath);

export default defineConfig({
  testDir: resolveFromRepoRoot("tests/e2e"),
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev:e2e",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 2 * 60 * 1000,
  },
});
