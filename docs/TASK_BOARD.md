# Artificer Task Board

This is the **active execution checklist**. `ROADMAP.md` defines current priority and the Jules orchestrator queue; this board tracks the concrete work and acceptance state behind those priorities. Completed historical work should not remain mixed into actionable work. Architecture/design details belong in `docs/modules/` and `docs/systems/`.

## 🔴 Critical — Current engineering

### BattleMapEditor → Combat Integration v1
The BattleMapEditor now has a strong functional authoring foundation. The next priority is to make authored maps directly testable in the combat stack.

- [x] BattleMap authoring data model and versioned schema.
- [x] Canvas viewport foundation: coordinates, pan, zoom and grid/snap.
- [x] Wall-segment authoring foundation.
- [x] Room and Door authoring foundation.
- [x] Terrain painting foundation.
- [x] Object/Stamp placement foundation using canonical asset infrastructure.
- [x] Token/Spawn placement foundation with Atlas references where appropriate.
- [x] Layers and Inspector UI foundation.
- [x] Initial Undo/Redo/history foundation.
- [x] Map validation and JSON serialization foundation.
- [ ] Persistent combat-map authoring files under `public/assets/atlas/combat/combat_maps/` through the supported development/server write boundary.
- [ ] Canonical BattleMap loader/service shared by editor and runtime testing.
- [ ] Update `src/components/devkit/CombatTester.tsx` to load the same BattleMap authoring data as the editor.
- [ ] Introduce/verify a dedicated BattleMap → CombatGrid adapter rather than duplicating map conversion in UI code.
- [ ] Ensure CombatGrid treats walls as **cell boundaries**, not fully blocked cells.
- [ ] Map terrain identity into combat walkability/movement-cost queries using canonical terrain definitions.
- [ ] Load PC/enemy token references from BattleMap data without creating a second entity schema.
- [ ] Support explicit player/party entry points rather than hardcoded spawn coordinates.
- [ ] Add a small canonical integration test map covering walls, doors, terrain, PC, enemy, entry point and objects.
- [ ] Add focused regression tests for BattleMap loading, conversion, wall boundaries, terrain and spawn/entry data.
- [ ] Keep BattleMapEditor as authoring UI; keep CombatTester as testing/debug UI; keep CombatGrid as runtime representation.

> **Important:** UI presence does not equal completed behavior. Do not mark editor tools complete unless the underlying behavior is functional and tested.

### Documentation / agent alignment
- [x] Establish living `docs/ARCHITECTURE_STATUS.md`.
- [x] Refresh `docs/PROJECT_HUB.md`.
- [x] Refresh `docs/COMPONENT_MAP.md`.
- [x] Refresh `docs/PROGRESS.md`.
- [x] Integrate the documentation audit findings into the central task system.
- [x] Establish the Jules orchestrator roadmap/review workflow.
- [ ] Audit remaining system/module docs against current source.
- [ ] Remove or clearly mark stale/deprecated documentation.
- [ ] Ensure all major modules have one authoritative specification.
- [ ] Keep `ROADMAP.md`, `TASK_BOARD.md` and module/system docs synchronized after material architecture changes.

## 🟠 High — Architecture & data foundations

### Ruleset Selection & Ruleset Context — D&D 2014 / 2024
Do not treat `/14/` and `/24/` as a recurring URL-fix task. These are separate ruleset datasets and require an explicit game/campaign ruleset context.

- [ ] Define the canonical ruleset identifier (`2014` / `2024`) for a game/campaign.
- [ ] Add ruleset selection at the appropriate new-game/campaign setup point.
- [ ] Persist the selected ruleset with the campaign/game state.
- [ ] Provide a single ruleset context/resolver used by rules-sensitive systems.
- [ ] Audit rules, equipment, classes, species, feats, spells and other rules-sensitive Atlas access for ruleset awareness where required.
- [ ] Replace ad-hoc `/14/` / `/24/` branching with canonical ruleset-aware resolution.
- [ ] Validate that both rulesets load the correct versioned Atlas data.
- [ ] Document which systems are ruleset-sensitive and which are ruleset-neutral.
- [ ] Do not introduce parallel ruleset logic in individual UI components.

### Inventory & Equipment Architecture / UX Overhaul
The existing Inventory V2 foundation is already present. Do **not** implement another container/grid system. Consolidate the current character-domain components and separate compact runtime HUD presentation from the full inventory workspace.

- [ ] Audit `src/components/character/Inventory.tsx`, `FullInventoryMenu.tsx`, `PartyInventory.tsx`, `DraggableInventoryItem.tsx`, `EquipmentDoll.tsx`, `SpellInventory.tsx` and related inventory/equipment components.
- [ ] Define the intended character-domain structure:
  - `character/profile/`
  - `character/inventory/`
  - `character/equipment/`
  - `character/progression/`
- [ ] Keep reusable character-domain inventory/equipment components under `character/`; do not move inventory into `hud/` merely because it is visible from the HUD.
- [ ] Move/refactor `CharacterPanel.tsx` toward a runtime HUD surface that consumes reusable character-domain components rather than owning the complete inventory implementation.
- [ ] Keep `DraggableInventoryItem` as a reusable item interaction primitive where appropriate.
- [ ] Make `FullInventoryMenu` the full inventory workspace rather than another partial implementation.
- [ ] Provide a clear UI entry point from the CharacterPanel to the full inventory workspace.
- [ ] Implement reliable scrolling in the full inventory workspace and compact inventory contexts.
- [ ] Provide working item inspection through the existing inspection infrastructure.
- [ ] Provide working equip/unequip interactions via supported click and drag/drop flows.
- [ ] Ensure EquipmentDoll and equipment item presentation use the intended 9:16 visual treatment consistently.
- [ ] Fix the current equipment/background chroma-key presentation so supported green-screen assets render correctly.
- [ ] Verify party inventory/shared storage behavior and transfer interactions.
- [ ] Remove duplicate inventory presentation/state logic rather than adding another inventory component.
- [ ] Preserve Inventory V2 registry/slot architecture and existing save compatibility.
- [ ] Add regression tests around equip/unequip, item inspection, DnD transfers and inventory rendering state.

### Canonical Character Profile & TitleScreen
A character profile/passport is a reusable presentation capability, not a screen-specific implementation.

- [ ] Establish canonical character-profile presentation primitives.
- [ ] Add compact/selection and full-profile variants without creating a second character schema.
- [ ] Refactor `src/components/core/TitleScreen.tsx` to consume canonical character profile primitives.
- [ ] Refactor `src/components/character/CharacterProfile.tsx` into a clean composition with clear responsibility boundaries.
- [ ] Remove duplicated character identity/portrait/class/level presentation logic from screens where the canonical profile can be reused.
- [ ] Keep character data/state as the single source of truth.
- [ ] Bring CharacterProfile layout to a consistent professional responsive standard.
- [ ] Avoid replacing the existing God Component with a new generic profile God Component.
- [ ] Add/update tests for canonical profile rendering and TitleScreen integration.

### DevKit shared infrastructure
- [ ] Establish shared DevKit interaction primitives where reuse is justified: context menu, file actions, color picker, icon helpers, keyboard shortcut handling and history/command infrastructure.
- [ ] Refactor/reuse `src/components/devkit/audio/ColorWheel.tsx` as a shared color-picker capability where appropriate.
- [ ] Keep shared infrastructure separate from domain state: BattleMap, Audio, World and other editor histories must remain isolated.
- [ ] Reuse the existing Artificer icon registry under `public/assets/icons/svg/` before adding new icons.
- [ ] Keep reusable asset/entity browsers backed by canonical Atlas data rather than hardcoded lists.

## 🟡 Medium — Character & gameplay systems

### Character Creation / Level Up
- [ ] Tighten and polish the overall character creation flow.
- [ ] Starting Equipment Eligibility Resolver — enforce ruleset-aware starting equipment filters in Character Creator to prevent invalid high-tier equipment selection.
- [ ] Point Buy Calculator — standard 27-point-buy constraints.
- [ ] Advanced Spellbook Manager.
- [ ] Feat selection during ASI/Level Up with prerequisites and ability-score increases.
- [ ] Automatic HP level-up flow with class hit dice and Constitution modifier.
- [ ] Per-attribute 3D ability-score rolls.
- [ ] Equipment Pack inspection in `FocusView`.
- [ ] Recruitable NPC / Character Passport behavior should reuse the canonical Character Profile rather than introducing another passport/card implementation.

### Runtime systems & Combat Loop
- [ ] Combat loop — verify the full cycle end to end after BattleMap/CombatTester integration work.
- [x] XP animation — display high-fidelity animation when players earn XP.
- [x] Shared XP across the party — distribute earned XP evenly to all active characters.
- [ ] NPC Memory / relationship history module.
- [ ] Economic & Trade module.
- [ ] Soundscape Orchestrator.
- [ ] Rule Engine / Condition Tracker.

### Location & Submap Flow
- [x] Enter Location Flow foundation.
- [ ] Spawn- or Entry-points: spawn/place party automatically on specified coordinates inside locations.
- [ ] Restructure HUD responsibilities so legend, layer toggles and location information live in appropriate UI components rather than markdown.
- [x] Discoverable Locations foundation.
- [x] Fog-of-War granularity foundation.
- [ ] WorldMap and LocationMap decoupling into clean specialized subcomponents.
- [ ] Add D&D Markdown Styling in `WorldPanel` for location lore.

## 🟢 Maintenance / optimization

- [ ] Continue Atlas asset/index validation as schemas evolve.
- [ ] Review image and asset loading performance after major UI changes.
- [ ] Keep module documentation synchronized with architectural changes.
- [ ] Add regression tests when existing runtime systems are refactored.
- [ ] Verify all asset paths against canonical Atlas indexes before declaring asset-routing tasks complete.
- [ ] Keep heavyweight/development-only artifacts out of source-controlled runtime assets.

## Completed foundations

These are historical milestones and should not be re-opened as new implementation tasks without explicit review:

- [x] Domain-oriented store slicing (`useUIStore`, `useAtlasStore`, `useGameStore`, `useWorldStore`).
- [x] World state, time, weather and discovery foundations.
- [x] World map/tile infrastructure.
- [x] Tactical combat foundation with grid movement, A* pathfinding and initiative.
- [x] Journal foundations.
- [x] Core asset validation/indexing and canonical Atlas paths.
- [x] Inventory V2 migration / save schema v2.
- [x] DevKit organizational restructuring.

## Task-board rules

1. `[ ]` means actionable and not finished.
2. `[x]` means implemented **and verified**; do not use it for scaffolding or intended behavior that has not been tested.
3. Architecture decisions belong in `docs/ARCHITECTURE_STATUS.md` or the relevant module/system document.
4. If a task becomes large enough to need its own design, create/update a module document and keep this board as the execution checklist.
5. `ROADMAP.md` controls current priority; `TASK_BOARD.md` contains the concrete work behind those priorities.
6. Never create a duplicate implementation to satisfy a task if an existing component/service/store already owns that capability; refactor/consolidate instead.
7. Before marking an architecture task complete, cross-check implementation, documentation and runtime behavior.
8. Keep runtime HUD presentation separate from reusable domain capabilities.
9. Keep authoring tools separate from runtime representations.

*Last Updated: 2026-08-15*
