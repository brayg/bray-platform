---
"@heybray/dev-config": major
"@heybray/gamification": major
"@heybray/gamification-react": major
"@heybray/identity": major
"@heybray/llm": major
"@heybray/media": major
"@heybray/react": major
"@heybray/server-kit": major
"@heybray/taxonomy": major
"@heybray/ui": major
---

**1.0.0 — API stability policy lock**

From 1.0.0 onward: a breaking DB schema change is a **major** release with expand/contract documentation; a breaking runtime API change is a **major** release with migration notes in the changelog.

Deprecated aliases supported until **2.0.0**: legacy star-map path helpers (`legacyMemberScenarioHistoryPath`, `legacyMemberRoleplayAttemptsPath`), `drawerPink.scenarioRow` / `scenarioRowHover`, `ScenarioListRowComponent` / `ScenarioListRowProps`, `detachedFromScenarios` (use `detachedCount`), and related response-key fallbacks.

`@heybray/llm` remains the least-validated package (single consumer: Scenarios).
