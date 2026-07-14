/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import type { Config } from "tailwindcss";
import { uiPreset } from "@heybray/ui/tailwind-preset";

export default {
  presets: [uiPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/react/src/**/*.{ts,tsx}",
    "../../packages/gamification-react/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
