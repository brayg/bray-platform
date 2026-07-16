---
"@heybray/gamification": minor
---

Drop `legacy_id` from the `reward_tiers` schema definition and export neutral star-map API path constants (`content-history`, `contents/:contentId/attempts`). Apps with an existing database must drop the column via their own migration before upgrading.
