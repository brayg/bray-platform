/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { eq } from "drizzle-orm";
import { roles } from "@heybray/identity/schema";
import { classificationDimensions, classificationOptions } from "@heybray/taxonomy/schema";
import { createLogger } from "@heybray/server-kit";
import { db } from "./db.ts";

const log = createLogger("seed");

const ROLE_DEFS = [
  { name: "admin", description: "Administrator", permissions: ["notes:manage"] },
  { name: "user", description: "Regular user", permissions: [] },
];

/** One taxonomy dimension ("category"), two options — enough to prove @heybray/taxonomy composes. */
const CATEGORY_OPTIONS = [
  { slug: "personal", label: "Personal", color: "#2563eb", icon: "user" },
  { slug: "work", label: "Work", color: "#059669", icon: "briefcase" },
];

async function seedRoles() {
  for (const def of ROLE_DEFS) {
    const [existing] = await db.select().from(roles).where(eq(roles.name, def.name)).limit(1);
    if (existing) continue;
    await db.insert(roles).values({ ...def, isGlobal: false });
    log.info("Created role", { name: def.name });
  }
}

async function seedTaxonomy() {
  const [existingDimension] = await db
    .select()
    .from(classificationDimensions)
    .where(eq(classificationDimensions.slug, "category"))
    .limit(1);

  const dimensionId =
    existingDimension?.id ??
    (
      await db
        .insert(classificationDimensions)
        .values({ slug: "category", name: "Category", cardinality: "single", sortOrder: 0 })
        .returning()
    )[0].id;

  if (!existingDimension) {
    log.info("Created classification dimension", { slug: "category" });
  }

  for (let i = 0; i < CATEGORY_OPTIONS.length; i++) {
    const opt = CATEGORY_OPTIONS[i];
    const [existing] = await db
      .select()
      .from(classificationOptions)
      .where(eq(classificationOptions.slug, opt.slug))
      .limit(1);
    if (existing) continue;

    await db.insert(classificationOptions).values({
      dimensionId,
      slug: opt.slug,
      label: opt.label,
      sortOrder: i,
      isActive: true,
      color: opt.color,
      icon: opt.icon,
    });
    log.info("Created classification option", { slug: opt.slug });
  }
}

export async function seedDatabase() {
  await seedRoles();
  await seedTaxonomy();
  log.info("Seed complete");
}
