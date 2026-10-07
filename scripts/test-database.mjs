import { spawnSync } from "node:child_process";

// Capture local credentials in memory; never forward status output to CI logs.
const status = spawnSync("supabase", ["status", "-o", "json"], { encoding: "utf8" });
if (status.status !== 0) {
  throw new Error("Database tests require running local Supabase. Run supabase start first.");
}
const local = JSON.parse(status.stdout);
if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(local.API_URL).hostname)) {
  throw new Error("Database tests require a loopback Supabase URL.");
}
if (!local.ANON_KEY || !local.SERVICE_ROLE_KEY) {
  throw new Error("Local Supabase test keys are unavailable.");
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error) throw new Error(`Could not start ${command}. Check that it is installed.`);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("supabase", ["test", "db", "--local"]);
run("pnpm", ["exec", "vitest", "run", "--config", "vitest.database.config.ts"], {
  ...process.env,
  SUPABASE_TEST_URL: local.API_URL,
  SUPABASE_TEST_ANON_KEY: local.ANON_KEY,
  SUPABASE_TEST_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY,
});
