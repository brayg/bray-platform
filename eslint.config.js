import { licenseHeaderConfig } from "@heybray/dev-config/eslint.config.js";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "examples/**"],
  },
  {
    files: ["packages/*/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  ...licenseHeaderConfig(["packages/*/src/**/*.{ts,tsx}"]),
];
