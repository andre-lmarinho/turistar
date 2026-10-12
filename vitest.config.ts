import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const integration = process.env.VITEST_MODE === "integration";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@tests": resolve(__dirname, "./tests"),
      ...(!integration ? { "@supabase/ssr": resolve(__dirname, "./tests/__mocks__/supabaseSsr.ts") } : {}),
      "@/ui/theme.css": resolve(__dirname, "./tests/__mocks__/empty.css"),
      "leaflet/dist/leaflet.css": resolve(__dirname, "./tests/__mocks__/empty.css"),
      "server-only": resolve(__dirname, "./tests/__mocks__/serverOnly.ts"),
    },
  },
  test: {
    environment: integration ? "node" : "jsdom",
    globals: true,
    ...(integration ? { fileParallelism: false, testTimeout: 20_000, hookTimeout: 20_000 } : {}),
    setupFiles: integration ? [] : [resolve(__dirname, "./vitest.setup.tsx")],
    include: integration
      ? ["src/**/*.integration-test.ts", "tests/**/*.integration-test.ts"]
      : ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    coverage: {
      enabled: !integration && process.env.CI === "true",
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/*.test.{ts,tsx}", "src/**/*.integration-test.ts"],
      thresholds: {
        statements: 45,
        branches: 40,
        functions: 44,
        lines: 45,
      },
    },
  },
});
