import { defineConfig } from '@playwright/test';
import '../tests/e2e/env';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: '../tests/e2e',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    storageState: '../tests/e2e/.auth/storageState.json',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev:e2e',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 2 * 60 * 1000,
  },
});
