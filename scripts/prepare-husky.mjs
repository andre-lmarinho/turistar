import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cwd, env } from 'node:process';
import { spawnSync } from 'node:child_process';

const skipReasons = [];

if (env.CI === 'true' || env.CI === '1') {
  skipReasons.push('CI environment detected');
}

if ((env.NODE_ENV ?? '').toLowerCase() === 'production') {
  skipReasons.push('NODE_ENV=production');
}

if (env.HUSKY_SKIP_INSTALL === '1' || env.HUSKY_SKIP_INSTALL === 'true') {
  skipReasons.push('HUSKY_SKIP_INSTALL is set');
}

const gitDir = join(cwd(), '.git');
if (!existsSync(gitDir)) {
  skipReasons.push('no .git directory found');
}

if (skipReasons.length > 0) {
  console.log(`Skipping Husky install: ${skipReasons.join(', ')}`);
  process.exit(0);
}

const huskyBin = join('node_modules', 'husky', 'lib', 'bin.js');

if (!existsSync(huskyBin)) {
  console.warn('Skipping Husky install: husky binary not found. Did you install dependencies?');
  process.exit(0);
}

const result = spawnSync('node', [huskyBin, 'install'], { stdio: 'inherit' });

if (result.status !== 0) {
  const exitCode = result.status ?? 1;
  console.error(`Husky install failed with exit code ${exitCode}.`);
  process.exit(exitCode);
}
