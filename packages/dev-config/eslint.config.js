import licenseHeader from "eslint-plugin-license-header";
import { fileURLToPath } from "node:url";

const headerPath = fileURLToPath(new URL("./license-header.js", import.meta.url));

/**
 * Shared SPDX license-header rule. Consuming packages spread this into their
 * own eslint.config.js: `export default [...licenseHeaderConfig(), { ... }]`.
 * Pass a custom `files` glob when the config lives somewhere other than a
 * single package root (e.g. the monorepo root linting every package's src/).
 */
export function licenseHeaderConfig(files = ["src/**/*.{ts,tsx}"]) {
  return [
    {
      files,
      plugins: {
        "license-header": licenseHeader,
      },
      rules: {
        "license-header/header": ["error", headerPath],
      },
    },
  ];
}

export default licenseHeaderConfig;
