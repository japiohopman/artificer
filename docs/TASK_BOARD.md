# Artificer Task Board

This is the **active execution checklist** behind the canonical `ROADMAP.md`. `ROADMAP.md` controls current priority and Jules dispatch; this board tracks concrete implementation and acceptance state. Architecture details belong in `docs/modules/` and `docs/systems/`.

## 🔴 Critical — Current engineering

### Inventory & Equipment Workspace — interaction, ingestion and asset UX overhaul — Issue #300
**Status:** active. The previous Inventory V2 / Inventory & Equipment foundation is merged, but runtime review identified structural UX, drag/drop, overlay, equipment-pack ingestion and asset-rendering problems. These are now the active completion phase.

#### Workspace architecture
- [ ] Replace the current dashboard-like gear composition with one focused Equipment Workspace.
- [ ] Keep one authoritative Equipment Doll visible beside the inventory; remove/migrate duplicate runtime doll surfaces.
- [ ] Keep the inventory and Equipment Doll visible simultaneously in the Equipment tab.
- [ ] Separate individual gear management from party/shared-storage concerns so shared storage does not dominate the workspace.

#### Inventory UI
- [ ] Replace broad/loose backpack presentation with a dense slot-based inventory grid.
- [ ] Render empty and occupied slots consistently from canonical container capacity.
- [ ] Reduce unnecessary margins, padding, oversized headers and decorative empty regions.
- [ ] Keep search/filter/inspection controls compact and subordinate to the item grid.
- [ ] Make item icon, quantity and slot state the dominant visual information.

#### Drag & drop
- [ ] Use one coherent dnd-kit context for inventory and equipment.
- [ ] Introduce slot-level droppable targets rather than treating the whole backpack as one drop zone.
- [ ] Use a dedicated DragOverlay so the dragged item remains visibly represented.
- [ ] Provide explicit source, dragging, valid-target, invalid-target and drop-result feedback.
- [ ] Verify supported Inventory → Equipment, Equipment → Inventory, Equipment → Equipment and Inventory → Inventory operations.
- [ ] Keep compatibility rules in the canonical equipment/domain layer rather than duplicating them in UI components.
- [ ] Verify no disappearing items, duplicate ownership, stale state or desynchronized inventory/equipment state.

#### Overlay / layering
- [ ] Diagnose why the inventory can render behind navigation/HUD.
- [ ] Establish a reliable global overlay surface/portal for full-screen inventory UI.
- [ ] Do not solve stacking-context problems by accumulating arbitrary z-index values.
- [ ] Verify pointer events, clipping and keyboard/mouse interaction after the overlay refactor.

#### Equipment-pack ingestion
- [ ] Trace selected class/background equipment-pack references from Character Creator to persisted character state.
- [ ] Resolve packs through the existing canonical `itemPacks.ts` definitions.
- [ ] Expand pack contents at the character creation/normalization boundary into real V2 ItemInstances.
- [ ] Preserve quantities, template IDs, stable item IDs and container placement.
- [ ] Verify a newly created character actually owns the contents of its selected equipment pack.
- [ ] Add regression coverage so pack definitions cannot silently disappear from the character inventory.

#### Equipment visual assets
- [ ] Audit EquipmentSprite and existing visual-identity → sprite-manifest resolution.
- [ ] Prefer canonical sprite-sheet rendering when a visual identity is READY.
- [ ] Keep individual `.webp` assets only where they remain a valid fallback path.
- [ ] Optimize fallback `.webp` dimensions/file sizes for their actual inventory display role.
- [ ] Avoid loading large source images or duplicating sprite-sheet loads for individual inventory slots.
- [ ] Run asset validation after image/manifest changes.

#### Verification
- [ ] Add/extend regression tests for slot movement, compatibility, pack ingestion and persistence.
- [ ] Run focused inventory/equipment tests.
- [ ] Run `npm run lint`.
- [ ] Run `npm run validate:assets` when asset changes are included.
- [ ] Run `npm run build`.
- [ ] Manually verify the complete grab → drag → valid/invalid target feedback → drop → state update workflow.
- [ ] Manually verify Inventory ↔ Equipment on a newly created character containing an equipment pack.

### 2024 Atlas Data Ingestion & Ruleset-Aware Character Creation
**Status:** complete and verified.

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

**Reference sources:** Foundry dnd5e `6.0.x` `packs/_source/classes24/` and `packs/_source/origins24/species/` are reference material only. Do not blindly copy the repository.

## 🟠 High — Architecture & data foundations

### Inventory & Equipment Architecture / UX Overhaul — foundation (merged)
- [x] Audit and consolidate existing inventory/equipment implementations.
- [x] Establish `character/inventory/` and `character/equipment/` responsibility boundaries.
- [x] Keep reusable inventory/equipment domain components out of `hud/` merely because they are displayed there.
- [x] Preserve the Inventory V2 registry/slot architecture and save compatibility.
- [x] Keep EquipmentDoll reusable as a presentation primitive.
- [x] Establish the current V2 item/container model and document its compatibility constraints.

The foundation is **not** considered the completion of the runtime UX. Issue #300 is the active follow-up for the observed workspace, drag/drop, ingestion and asset problems.

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

### Character Creator — Selection Experience v1
- [x] Welcome/Ruleset → Save Slot → Identity → Species → Class → Background → Alignment → Attributes/Stats → Skills/Choices → Arcana/Spells → Equipment → Appearance → Description → Review flow.
- [x] Background before Equipment.
- [x] Official selection content and visual assets integrated.
- [x] Ruleset selection persistence preserved.
- [x] Required-step validation overlay implemented.
- [x] Review consumes canonical Character state.

### Ruleset Selection & Ruleset Context — Foundation
- [x] One canonical `useGameStore.ruleset` owner.
- [x] `getActiveRulesetContext` / `getRulesetVersionFolder` boundary.
- [x] No component-level hardcoded ruleset paths in migrated consumers.
- [x] Equipment and Monster resolution migrated.
- [x] Feats, Class Levels and Spells migrated.
- [x] 2024 gap audit documented.
- [ ] Complete remaining downstream rules-sensitive migration after 2024 datasets exist.

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
