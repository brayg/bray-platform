/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiPort = process.env.VITE_API_PORT || process.env.PORT || "3101";
const devPort = parseInt(process.env.VITE_PORT || "5174", 10);

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
  },
  server: {
    port: devPort,
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
});
