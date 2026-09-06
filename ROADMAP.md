# 🗺️ Roadmap

[GOALS.md](./GOALS.md) is the destination — it doesn't change often. [TASK_BOARD.md](./docs/TASK_BOARD.md) is the granular checklist. This file is the **single canonical dispatch roadmap** for Jules: it says what we are actually finishing now.

## Now

### Active

### Ready

- [ ] **2024 Atlas Data Ingestion & Ruleset-Aware Character Creation — Phase 2**
  - **Status:**
    2024 Species Foundation
    ✓ 5/10 species (Human, Dwarf, Elf, Halfling, Orc)

    2024 Base Class Foundation
    ✓ 12/12 core classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard)

    2024 Base Class Progression & Feature Definitions
    ✓ 12/12 core classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard complete for levels 1–20 and canonical 2024 features)

    2024 Subclasses & Subclass Features
    ✓ 6 subclasses implemented across 4 supported 2024 classes (Fighter: Champion, Battle Master; Wizard: Evoker; Cleric: Life Domain; Rogue: Thief, Assassin; remaining 2024 subclasses pending)

    Next active dependency: 2024 Progressions for remaining 8 classes / remaining 2024 Subclasses / 2024 Backgrounds & Origins / Origin Feats.
  - **Goal:** Establish real 2014/2024 Atlas data boundaries and make Character Creator resolution genuinely ruleset-aware.
  - **Implementation order:** 2024 Species Foundation (complete) → 2024 Base Class Foundation (12/12 core classes complete) → 2024 Class Progressions & Features (12/12 core classes complete) → 2024 Subclasses & Subclass Features (6 subclasses across 4 classes complete; remaining subclasses pending) → 2024 Backgrounds/Origins (pending) → Feats integration → Spells → remaining rules-sensitive domains → complete ruleset integration tests.
  - **Canonical references:** Foundry dnd5e `6.0.x` `packs/_source/classes24/` and `packs/_source/origins24/species/` are reference sources only; do not blindly copy the repository.
  - **Acceptance:** selecting 2014 and 2024 resolves distinct versioned data where rules differ; shared data remains shared; Character Creator and downstream consumers use the canonical ruleset context; no component hardcodes `/14/` or `/24/` paths; no fake/generic placeholder feature definitions exist.
  - **Out of scope:** blind bulk ingestion, redesigning all D&D rules, or introducing a second ruleset state/store.
  - **Docs:** `docs/audits/ruleset-2024-gap-analysis.md` is the current audit; update it as implementation closes gaps.

- [ ] **Inventory & Equipment Architecture / UX Overhaul**
  - **Goal:** consolidate existing inventory/equipment implementations without creating another inventory data model.
  - **Architecture:** `character/inventory/` owns character inventory domain UI; `character/equipment/` owns equipment presentation; `FullInventoryMenu` remains the full workspace; `CharacterPanel` remains compact HUD presentation.
  - **Acceptance:** usable scrolling/filtering/inspection, equip/unequip, intended drag/drop, party/shared inventory, reusable EquipmentDoll, canonical Inventory V2 state, no duplicate inventory system.

- [ ] **Canonical Character Profile & CharacterScreen Refactor**
  - **Goal:** one reusable character profile/presentation layer for TitleScreen, HUD and character-facing screens.
  - **Requirements:** narrative fields such as Traits/Ideals/Bonds/Flaws become first-class character data; keep `CharacterPanel` as a HUD surface and avoid another God Component.

### Blocked

### Human Review
- [ ] Character creation: point-buy stat system — exact product/rules decision still required.
- [ ] Character creation: advanced spellbook filters — small design decision still required.

## Completed / Confirmed Foundations

- [x] **Character Creator — Species Character Mirror & Choice State v1** — merged. Shared Character Panel primitives established; persistent body/background presentation, Stats/Traits/Bio/Equipment structure and explicit choice-state work completed. The mirror is now the preferred naming/presentation model for the character panel.
- [x] **Character Creator — Selection Experience v1** — merged.
- [x] **Character Creator — Species Visual Integration v1** — merged.
- [x] **Canonical SVG Icon System Migration** — `public/assets/icons/svg/` + `GameIcon`; legacy `src/assets/icons/` and third-party icon libraries removed.
- [x] **Ruleset Selection & Ruleset Context — D&D 2014 / 2024 Foundation** — canonical `useGameStore.ruleset` context and resolver established.
- [x] **Ruleset Downstream Integration v1** — Feats, Class Levels and Spells migrated to canonical ruleset resolution.
- [x] **Ruleset Data Audit & 2024 Gap Analysis** — confirmed that several current Character Creator domains still resolve unversioned classic data; documented in `docs/audits/ruleset-2024-gap-analysis.md`.
- [x] **Inventory & Equipment Architecture / UX Overhaul foundation** — merged and documented.
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
