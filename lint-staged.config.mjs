export default {
  "**/*.{js,ts,jsx,tsx}": [
    "prettier --write",
    "eslint --fix --max-warnings=0",
  ],
  "**/*.json": ["prettier --write"],
};
