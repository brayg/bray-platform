/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import "dotenv/config";
import { createApp } from "./app.ts";
import { createLogger } from "@heybray/server-kit";

const log = createLogger("server");
const port = Number(process.env.PORT ?? 3101);

const app = createApp();
app.listen(port, () => {
  log.info(`basic-app listening on :${port}`);
});
