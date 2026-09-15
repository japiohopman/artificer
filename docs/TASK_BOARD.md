# Artificer Task Board

This is the **active execution checklist** behind the canonical `ROADMAP.md`. `ROADMAP.md` controls current priority and Jules dispatch; this board tracks concrete implementation and acceptance state. Architecture details belong in `docs/modules/` and `docs/systems/`.

## 🔴 Critical — Current engineering

### Inventory & Equipment Workspace — interaction, ingestion, ammunition & asset UX overhaul (Issue #300)
**Status:** ready for dispatch; the previous Inventory & Equipment foundation is merged, but runtime review identified follow-up work required for production completion.

- [ ] Reframe the runtime Equipment tab as one canonical gear-management workspace.
- [ ] Remove duplicate Equipment Doll presentations and identify the single authoritative consumer.
- [ ] Move the focused inventory experience above/away from navigation stacking contexts; prefer a dedicated global overlay/portal where required.
- [ ] Replace broad backpack droppable behavior with a canonical slot-aware inventory grid.
- [ ] Use one dnd-kit context for Inventory + Equipment and one DragOverlay.
- [ ] Preserve visible drag representation and add explicit valid/invalid/replacement target feedback.
- [ ] Verify Inventory → Equipment, Equipment → Inventory, compatible Equipment → Equipment and supported Inventory → Inventory flows.
- [ ] Keep Inventory V2 `items` + `containers` + `equipment` as the canonical ownership/placement model; no second persistence model.
- [ ] Fix Character Creator equipment-pack ingestion so selected packs become real ItemInstances in the canonical backpack with quantities preserved.
- [ ] Audit 2014/2024 equipment-pack and weapon/ammunition references without silently crossing ruleset boundaries.
- [ ] Introduce a canonical ammunition requirement/compatibility resolver using Atlas weapon/ammunition metadata.
- [ ] Show a contextual ammunition slot only when the equipped weapon requires ammunition.
- [ ] Enforce compatible ammunition types (for example arrows for bows, bolts for crossbows, sling bullets for slings, needles for blowguns) through domain rules rather than UI string matching.
- [ ] Consume canonical ammunition on successful attacks and immediately synchronize remaining quantity with inventory/equipment state.
- [ ] Model quivers as ammunition containers with explicit capacity semantics; normal quiver = 20 arrows, special/magic variants may define a higher capacity. Do not encode quiver capacity as arrow quantity.
- [ ] Keep ammunition as separate owned ItemInstances/stacks; container/equipment placement determines where ammunition is carried/assigned.
- [ ] Audit whether existing weapon JSON already contains sufficient structured ammunition information before adding new fields. Add structured fields only where current Atlas data cannot be resolved reliably.
- [ ] Make canonical sprite-manifest/sprite-sheet rendering the preferred equipment visual path.
- [ ] Optimize individual equipment `.webp` assets as small fallback thumbnails; do not delete still-needed fallbacks blindly.
- [ ] Avoid repeated sprite-sheet image loading per slot.
- [ ] Reduce inventory chrome, margins and padding so the slot field is the dominant surface.
- [ ] Add regression tests for drag/drop, compatibility, pack ingestion, ammunition consumption, quiver capacity and persistence.
- [ ] Run focused tests, `npm run lint`, `npm run validate:assets` when asset changes are included, and `npm run build`.
- [ ] Manually verify the full grab → drag → target feedback → drop → equip/use → ammunition consumption workflow.

### 2024 Atlas Data Ingestion & Ruleset-Aware Character Creation
**Status:** completed and verified.

2024 Species Foundation
→ implemented / verified (Human, Dwarf, Elf, Halfling, Orc)

2024 Base Class Foundation
→ implemented / verified (12/12 core classes in /class/json/24/)

2024 Base Class Progression & Feature Definitions
→ implemented / verified (12/12 core classes in /class/levels/24/ and /features/json/)

2024 Subclasses & Subclass Features
→ implemented / verified (48/48 canonical subclasses in /subclasses/json/24/ across all 12 core classes)

2024 Backgrounds & Origins Foundation
→ implemented / verified (16/16 PHB Origin Backgrounds in /backgrounds/json/24/, 10 Origin Feats in /feats/json/24/origin-feats/, ability score choice model [+2/+1 or +1/+1/+1], official markdown lore guides in /ui/official/backgrounds/*.md, and ruleset-aware Character Creator integration)

2024 Feats Integration — Foundation
→ implemented / verified (strict ruleset-aware resolution in fetchFeatData / loadFeat for 2014 vs 2024; versioned index_14.json and index_24.json catalogs for Origin, General, Fighting Style, and Epic Boon categories; Character Creator consumers updated; tests green)

2024 Spells Integration & Refinement
→ implemented / verified (strict ruleset-aware resolution in fetchSpellData / fetchSpellList / loadSpell for 2014 vs 2024; versioned index_14.json and index_24.json catalogs; 323 canonical SRD spells audited; sprite manifest and pure AOE geometry verified; zero silent cross-ruleset fallbacks; tests green)

Next active dependency: none; remaining rules-sensitive data work from this phase is complete.

- [x] Establish one canonical ruleset selection/context (`useGameStore.ruleset`).
- [x] Establish canonical ruleset resolver/context boundary.
- [x] Migrate representative rules-sensitive loaders to version-aware resolution.
- [x] Migrate Feats, Class Levels and Spells to the canonical ruleset context.
- [x] Complete `docs/audits/ruleset-2024-gap-analysis.md`.
- [x] Confirm the current gap: Character Creator 2024 Species/Class resolution still points at shared/unversioned classic data.
- [x] Ingest 2024 Species Foundation (Human, Dwarf, Elf, Halfling, Orc under `/species/json/14/` vs `/24/`).
- [x] Ingest 2024 Base Class Foundation (All 12 core classes under `/class/json/14/` vs `/24/`).
- [x] Ingest 2024 Class Features & 1-20 Progressions for Fighter, Wizard, Cleric, Rogue under `/class/levels/24/` and `/features/json/`.
- [x] Ingest 2024 Class Features & 1-20 Progressions for remaining 8 core classes.
- [x] Ingest 2024 Subclasses & Subclass Features (48/48 canonical subclasses across all 12 core classes).
- [x] Ingest 2024 Backgrounds/Origins.
- [x] Integrate 2024 Feats where rules differ.
- [x] Integrate 2024 Spells where rules differ.
- [x] Audit remaining rules-sensitive domains (conditions, subraces, features and other downstream consumers).
- [x] Add ruleset integration tests proving 2014 and 2024 resolve different datasets where intended.
- [x] Verify Character Creator end-to-end for both rulesets.

## 🟠 High — Architecture & data foundations

### Character Creator — Species Character Mirror & Choice State v1
**Status:** merged and verified as the foundation for the current Character Creator presentation model.

- [x] Welcome/Ruleset and Identity start neutral until explicit user selection.
- [x] Hover and selected choice states are visually distinct.
- [x] Continue button follows required-selection state and uses a subtle pulse when progression is valid.
- [x] Character Panel begins at Species and does not reserve an aside on earlier full-stage steps.
- [x] Selected species drives body SVG, environment/background and identity presentation.
- [x] Dynamic Stats/HP/AC/Speed/Initiative presentation uses canonical character data and icon assets.
- [x] Six ability-score tabs use the canonical ability-score visual asset and GameIcon system.
- [x] Shared character presentation primitives live under `src/components/character/panel/`.
- [x] Stats / Traits / Bio / Equipment panel structure established for the creator.
- [x] EquipmentDoll overlays the character body rather than replacing the body surface.
- [x] Character Panel naming/presentation model established as the reusable **Character Mirror** direction.

### Canonical SVG Icon System
- [x] Legacy `src/assets/icons/` removed.
- [x] Canonical icons live under `public/assets/icons/svg/`.
- [x] `GameIcon` is the application icon boundary.
- [x] `lucide-react` and Font Awesome icon dependencies removed from the migrated system.
- [x] Missing icons are treated as asset backlog rather than silently replacing canonical game icons with third-party icons.

### Canonical Character Profile & CharacterScreen Refactor
- [ ] Establish canonical character-profile presentation primitives.
- [ ] Add compact/selection and full-profile variants without a second character schema.
- [ ] Refactor TitleScreen to consume canonical profile primitives.
- [ ] Refactor `CharacterProfile.tsx` into clear composition.
- [ ] Refactor full `CharacterScreen.tsx` after profile foundation is stable.
- [ ] Make Traits/Ideals/Bonds/Flaws first-class profile data for Journal/DM/LM context.
- [ ] Keep Character Mirror/CharacterPanel as a HUD/presentation surface rather than a God Component.

### Documentation / Agent Alignment
- [x] `docs/ARCHITECTURE_STATUS.md` established.
- [x] `docs/PROJECT_HUB.md` refreshed.
- [x] `docs/COMPONENT_MAP.md` refreshed.
- [x] `docs/PROGRESS.md` refreshed.
- [x] Jules orchestrator roadmap/review workflow established.
- [x] `ROADMAP.md`, `TASK_BOARD.md` and module/system docs synchronized after the Character Mirror and ruleset audit.
- [ ] Audit remaining module docs against current source.
- [ ] Remove/mark stale documentation.
- [ ] Ensure major modules have one authoritative specification.

## 🟡 Medium — Character & gameplay systems

### Character Creation / Level Up
- [ ] Starting Equipment Eligibility Resolver — ruleset/class/background aware.
- [ ] Point Buy Calculator — standard 27-point-buy constraints.
- [ ] Advanced Spellbook Manager — canonical spell Atlas data and filters.
- [ ] Feat selection during ASI/Level Up.
- [ ] Automatic HP level-up flow.
- [ ] Per-attribute 3D ability-score rolls.
- [ ] Equipment Pack inspection in `FocusView`.
- [ ] Recruitable NPC / Character Passport reuse of canonical Character Profile.

### Runtime Systems
- [ ] End-to-end combat loop verification after integration work.
- [ ] NPC Memory / relationship history.
- [ ] Economic & Trade module.
- [ ] Soundscape Orchestrator.
- [ ] Rule Engine / Condition Tracker.
- [ ] Journal/DM/LM integration using structured character narrative state rather than scraping UI.

### Location & World Flow
- [x] Enter Location foundation.
- [x] Discoverable Locations foundation.
- [x] Fog-of-War foundation.
- [ ] Spawn/entry point placement.
- [ ] HUD responsibility cleanup for world/location UI.
- [ ] WorldMap/LocationMap specialization.
- [ ] D&D Markdown styling in WorldPanel.

## 🟢 Maintenance / optimization

- [ ] Continue Atlas asset/index validation as schemas evolve.
- [ ] Verify all asset paths against canonical Atlas indexes.
- [ ] Review asset loading performance after major UI changes.
- [ ] Keep module documentation synchronized.
- [ ] Add regression tests when runtime systems are refactored.
- [ ] Keep heavyweight/development-only artifacts out of runtime source control.

## Completed foundations

- [x] Domain-oriented stores (`useUIStore`, `useAtlasStore`, `useGameStore`, `useWorldStore`).
- [x] World state/time/weather/discovery foundations.
- [x] Tactical combat foundation with grid movement, A* pathfinding and initiative.
- [x] Journal foundations.
- [x] Core asset validation/indexing and canonical Atlas paths.
- [x] Inventory V2 migration/save schema v2.
- [x] DevKit organizational restructuring.
- [x] Canonical SVG Icon System Migration.
- [x] Character Creator Selection Experience v1.
- [x] Character Creator Species Visual Integration v1.
- [x] Character Creator Species Character Mirror & Choice State v1.
- [x] 2024 Species Foundation (Human, Dwarf, Elf, Halfling, Orc ruleset-aware resolution).
- [x] Combat Integration v1 — BattleMap → CombatTester → CombatGrid.
- [x] XP animation and shared party XP foundations.

## Task-board rules

1. `[ ]` means actionable and not finished.
2. `[x]` means implemented **and verified**; scaffolding does not count.
3. Architecture decisions belong in `docs/ARCHITECTURE_STATUS.md` or the relevant module/system document.
4. Large tasks get their own design/module document; this board remains the execution checklist.
5. `ROADMAP.md` controls current priority; this board contains the concrete work behind it.
6. Never create duplicate implementations when an existing component/service/store already owns the capability.
7. Cross-check implementation, documentation and runtime behavior before marking architecture work complete.
8. Keep runtime HUD presentation separate from reusable domain capabilities.
9. Keep authoring tools separate from runtime representations.
10. `ROADMAP.md` is the **only canonical current-priority/dispatch roadmap**. Do not create or maintain roadmap snapshots elsewhere.

*Last Updated: 2026-09-15*
