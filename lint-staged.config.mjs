const skipWarnings = ["1", "true", "yes", "on"].includes(
  (process.env.SKIP_WARNINGS ?? "").toLowerCase()
);

const quoteFiles = (files) => files.map((file) => `"${file}"`).join(" ");

const lintStagedConfig = {
  "**/*.{js,ts,jsx,tsx,mjs,cjs,mts,cts}": (files) =>
    skipWarnings
      ? `biome check --write ${quoteFiles(files)}`
      : `biome check --write --error-on-warnings ${quoteFiles(files)}`,
  "**/*.json": (files) => `biome format --write ${quoteFiles(files)}`,
};

export default lintStagedConfig;
