# Gamification UI batch — working agreement

**Status:** In progress (~1 week, client-side UI dedupe only)  
**Branch:** `platform/gamification-ui-batch` in `bray-platform`

## Scope

- Extract reused gamification UI into `@heybray/gamification-react`
- Wire consumers to shared components; remove copy-pasted navbar glue
- **No** API, schema, or server changes in this batch

## Delivery

| Phase | Action |
|--------|--------|
| Build | One feature branch; **one changeset per logical change** (itemized changelog at publish) |
| Local dev | **yalc** loop — never sibling imports or `cp` into `node_modules` |
| CI | `./bin/check-no-yalc.sh` in platform + all three consumers |
| Publish | **Single** `@heybray/*` release when batch is complete |
| Verify | `npm pack` tarballs on consumers before publish; then coordinated pin bumps |

## yalc loop

```bash
# platform (after each change)
npm run build --workspace=@heybray/react            # when AppConfig changes
npm run build --workspace=@heybray/gamification-react
cd packages/gamification-react && yalc push

# consumer (once per branch; repeat npm install after push)
yalc add @heybray/gamification-react @heybray/react
npm install
```

Remove before commit: `yalc remove @heybray/gamification-react @heybray/react && npm install`

## First extraction: `GamificationNavActions`

- **Props:** `leading?`, `trailing?` (`ReactNode` slots only)
- **Routing:** `useAppConfig().routes.teamStarMapPath` (default `/team-star-map`)
- **Consumers:** scenarios-client, flashcards-client, bray-premium `PremiumLayout`
- **Tests:** component test in platform; shell smoke tests assert `MainLayout.actions` renders points + star map

## Publish checklist

1. All batch changesets on branch
2. `npm run build && npm run test --workspace=@heybray/gamification-react` (platform CI green)
3. Pack verify: `npm pack` in changed packages → install tarballs in each consumer → typecheck + client smoke tests
4. Merge platform → Version Packages PR → publish once
5. Consumer PRs: remove yalc, bump pins, land together
