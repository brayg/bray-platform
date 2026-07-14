/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createDb, setDatabase } from "@heybray/server-kit";
import { identitySchema } from "@heybray/identity/schema";
import { taxonomySchema } from "@heybray/taxonomy";
import { gamificationSchema } from "@heybray/gamification";
import { notes } from "./schema/notes.ts";

const appSchema = { notes };

const schema = {
  ...identitySchema,
  ...taxonomySchema,
  ...gamificationSchema,
  ...appSchema,
};

const { db, pool } = createDb(schema);
setDatabase(db);

export { db, pool };
