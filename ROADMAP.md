# 🗺️ Roadmap

[GOALS.md](./GOALS.md) is the destination — it doesn't change often. [TASK_BOARD.md](./docs/TASK_BOARD.md) is the granular checklist. This file is the **single canonical dispatch roadmap** for Jules: it says what we are actually finishing now.

## Now

### Active

### Ready

- [ ] **Inventory & Equipment Workspace — interaction, ingestion and asset UX overhaul (Issue #300)**
  - **Status:** Ready for dispatch. The existing Inventory & Equipment foundation is merged, but runtime review exposed structural UX and data-flow problems that must be corrected before this area can be considered complete.
  - **Goal:** Rebuild the runtime gear-management surface as one canonical Equipment Workspace: compact inventory grid on the left, one authoritative Equipment Doll on the right, and one continuous drag/drop interaction model between them.
  - **Primary scope:** inventory/equipment composition, global overlay layering, slot-aware dnd-kit interactions and DragOverlay feedback, equipment compatibility feedback, canonical equipment-pack ingestion into ItemInstances, sprite-sheet-first equipment rendering, optimized `.webp` fallbacks, and regression/manual verification.
  - **Architecture:** preserve Inventory V2 ownership/placement state and existing inventory/equipment stores; do not introduce another inventory model, duplicate compatibility rules, duplicate Equipment Doll or parallel drag system.
  - **Acceptance:** no inventory hidden behind navigation; one doll; dense slot-based inventory; visible drag preview and valid/invalid targets; supported Inventory ↔ Equipment movement remains synchronized; selected equipment packs become real owned ItemInstances; sprite-backed equipment prefers canonical sprite sheets; fallback images are optimized; relevant tests/build/lint/asset validation pass.
  - **Canonical issue:** `https://github.com/japiohopman/artificer/issues/300`
  - **Canonical module:** `docs/modules/inventory_v2.md`
  - **Out of scope:** replacing Inventory V2 persistence, broad party-storage redesign, speculative backend migration, or a new sprite-generation pipeline.

### Blocked

### Human Review
- [ ] Character creation: point-buy stat system — exact product/rules decision still required.
- [ ] Character creation: advanced spellbook filters — small design decision still required.

## Completed / Confirmed Foundations

- [x] **2024 Atlas Data Ingestion & Ruleset-Aware Character Creation — Phase 2** — completed and verified.
- [x] **Character Creator — Species Character Mirror & Choice State v1** — merged. Shared Character Panel primitives established; persistent body/background presentation, Stats/Traits/Bio/Equipment structure and explicit choice-state work completed. The mirror is now the preferred naming/presentation model for the character panel.
- [x] **Character Creator — Selection Experience v1** — merged.
- [x] **Character Creator — Species Visual Integration v1** — merged.
- [x] **Canonical SVG Icon System Migration** — `public/assets/icons/svg/` + `GameIcon`; legacy `src/assets/icons/` and third-party icon libraries removed.
- [x] **Ruleset Selection & Ruleset Context — D&D 2014 / 2024 Foundation** — canonical `useGameStore.ruleset` context and resolver established.
- [x] **Ruleset Downstream Integration v1** — Feats, Class Levels and Spells migrated to canonical ruleset resolution.
- [x] **Ruleset Data Audit & 2024 Gap Analysis** — confirmed that several current Character Creator domains still resolve unversioned classic data; documented in `docs/audits/ruleset-2024-gap-analysis.md`.
- [x] **Inventory & Equipment Architecture / UX Overhaul foundation** — merged and documented; follow-up implementation is tracked as Issue #300.
- [x] **Combat Integration v1** — BattleMap → CombatTester → CombatGrid.
- [x] XP animation, shared party XP, location discovery, fog-of-war foundation and right-hand character panel foundations.

## Next — deliberately small follow-ups

- [ ] Character Creator profile requirements: canonical profile fields and validation model, including Traits/Ideals/Bonds/Flaws, before appearance/image-generation work.
- [ ] Point Buy Calculator.
- [ ] Advanced Spellbook Manager.
- [ ] ASI & Feat Selection.
- [ ] Automated HP Level Up.
- [ ] Per-attribute 3D Dice.
- [ ] Equipment Pack inspection in `FocusView`.
- [ ] AI DM tool-call integration — start with 2–3 tools only.
- [ ] NPC Memory / relationship history module.

## Later — parked until Now is clear

- [ ] Atlas sprite-sheet packing and loading optimizations.
- [ ] IndexedDB/LocalStorage Atlas caching.
- [ ] Economic simulation & regional pricing.
- [ ] Faction & reputation.
- [ ] Soundscape orchestration.
- [ ] Physical lighting sync.
- [ ] Vector-based session memory.
- [ ] Fully autonomous adventure generation.

## Roadmap Rules

1. Jules only receives work from `### Ready`.
2. `### Active` contains at most one dispatched task in v1.
3. `### Blocked` and `### Human Review` are never auto-dispatched.
4. A task becomes `[x]` only after human review, testing and architecture/documentation checks.
5. Large architectural work must define scope, acceptance criteria and out-of-scope boundaries.
6. `ROADMAP.md` is the single canonical **dispatch/current-priority** roadmap. `docs/TASK_BOARD.md` is the detailed execution checklist. Do not create another roadmap snapshot.

---
*Canonical current-priority roadmap for Artificer and the Jules orchestrator.*
