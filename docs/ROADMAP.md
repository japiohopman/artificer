# 🗺️ Roadmap

[GOALS.md](./GOALS.md) is the destination — it doesn't change often. [TASK_BOARD.md](./docs/TASK_BOARD.md)
is the granular checklist. This document sits between them: it says **what we're actually
finishing right now**, so agents (and Jaap) aren't tempted to start a new GOALS.md system while
older ones are half-done. Update this file when priorities genuinely shift — not every sprint.

## Now — work through in order, one at a time
1. [ ] Combat loop — get the full cycle running smoothly end to end
2. [ ] XP animation
3. [ ] Shared XP across the party
4. [ ] Location discovery working as intended
5. [ ] Fog-of-war granularity — large seas can be pre-visible, small streams/puddles should only
       reveal once actually discovered (currently all-or-nothing)
6. [ ] Fuller character sheet, using the existing assets/UI elements for AC etc. instead of bare numbers
7. [ ] Right-hand character panel — classic layout: profile picture, level, XP bar
8. [ ] Inventory — container system + grid inventory with per-category sub-tabs
9. [ ] Character creation — tighten up (already in progress)

**Resolved from the previous Now list:**
- [x] Meteocons — confirmed live via CDN in `TemporalWidget.tsx` (`@meteocons/svg` on jsdelivr)
- [x] Dev Kit reorganization — confirmed: `DevKit.tsx` has real Inspectors/Generators/Testers
      tab-state grouping matching `docs/ui/DEV_KIT.md`
- [x] Tactical Combat Grid TSX — confirmed: `CombatGrid.tsx`, 905 lines, no stubs
- [x] Minimal smoke-test / build check — CI is live (`.github/workflows/ci.yml`), `main` is
      branch-protected, first run was green
- [x] Temperature system, Token.tsx crash, `errors.md` upkeep — all confirmed done

**Still open, unresolved:**
- [ ] Align Jane module with JSON schemas — re-checked twice (`Jane.tsx` and the `/api/commit`
      handler in `server.ts`), neither has schema-validation code, despite
      `jane_world_builder.md` describing it as "Mandatory." Possibly landed somewhere not yet
      checked, or not on `main` yet — needs a pointer to confirm.

## Conditional cleanup

**Phase 1 — done (2026-07-14):**
- [x] Removed the forked `dnd5e-6.0.x` folder and the duplicated `tactical-grid-main/tactical-grid-main`
- [x] Removed the SRD PDF (`Rulebooks/srd/system_reference_document.pdf`)
- Repo shrank ~200MB. Nothing else was touched — good, see Phase 2 below for why that matters.

**Phase 2 — not started, needs to happen before the remaining heavy binaries can be removed:**
- [ ] Confirmed still live: `atlasService.ts` (line ~174) and `soundService.ts`
      (`GITHUB_RAW_BASE`) both fall back to `raw.githubusercontent.com/.../public${path}` when a
      local asset isn't found. This is *not* legacy monorepo code — it's active and will fire the
      moment a referenced asset stops existing locally.
- [ ] Pick a real host for the runtime-needed heavy assets (93MB Sword Coast map, `public/assets/sounds/**`,
      enemy token `.webp`s) — Firebase Storage (already in the stack) or Git LFS.
- [ ] Update the fallback URLs in `atlasService.ts` and `soundService.ts` to point at that host
      instead of `raw.githubusercontent.com`.
- [ ] Only after the above two are verified working end-to-end: remove the local copies of those
      assets from git.
- [ ] Update `docs/ASSET_REGISTRY.md` to reflect the new asset locations once done.

## Next — natural continuation, kept small on purpose
- AI DM tool-call integration (GOALS.md §12) — start with 2–3 tools only (e.g. dice roll,
  journal update), not the full tool list. Prove the narrator/mechanics boundary works before
  widening it.
- NPC Memory module — affinity system only, no interaction-log/vector search yet.

## Later — parked until Now is clear and the app is stable
- Economic simulation & regional pricing (GOALS.md §7)
- Faction & reputation system (GOALS.md §7)
- Philips Hue / physical lighting sync (GOALS.md §10 area)
- Vector-based session memory (GOALS.md §13)
- Fully autonomous adventure generation (GOALS.md §5)

These aren't bad ideas — they're exactly the kind of thing that makes this project fun. They're
parked because each one is a new subsystem, and the project currently has more open subsystems
than closed ones. Finishing the "Now" list is what makes starting these safe.

---
*Owned by whoever is coordinating the agents (Jules, or Jaap directly). Revisit this list when
the "Now" section is empty — not before.*
