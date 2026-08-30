# Artificer Task Board

This is the **active execution checklist**. `ROADMAP.md` defines current priority and the Jules orchestrator queue; this board tracks the concrete work and acceptance state behind those priorities. Completed historical work should not remain mixed into actionable work. Architecture/design details belong in `docs/modules/` and `docs/systems/`.

## 🔴 Critical — Current engineering

### Character Creator — Species Character Mirror & Choice State v1
Feature branch `feat/character-creator-species-mirror` in progress.

- [ ] Welcome/Ruleset choice state visually reflects explicit user selection (`isExplicitlySelected`), starting neutral before interaction.
- [ ] Identity choice state visually reflects explicit user selection (`isExplicitlySelected`), starting neutral before interaction.
- [ ] Hover and selected card states are clearly distinct (subtle border/bg on hover vs persistent glow/border on selected).
- [ ] Continue button is disabled when choice is incomplete and subtly pulses when valid choice exists.
- [ ] Character Panel begins strictly at Species step (`currentStep === 'species'`).
- [ ] Prior steps (`welcome`, `slot`, `identity`) consume 100% stage area with no reserved right panel.
- [ ] Selected species dynamically drives the Character Panel (background image, body SVG, species name label).
- [ ] Dynamic stats and modifiers resolved strictly via canonical domain calculations (`calculateDerivedStats`, `getEffectiveStats`).
- [ ] 6 horizontal ability tabs (`STR DEX CON INT WIS CHA`) appear at the bottom using `ability-score-tab-hc.svg` background and semantic `<GameIcon />` icons.
- [ ] HP, AC, Speed, Initiative metrics use canonical icons (`hit-points.svg`, `ac-badge.webp`, `speedfoot.svg`, `initiative.svg`).
- [ ] Overview, Skills, and Traits tabs become available starting after Class selection.
- [ ] Display only player-confirmed character choices (unselected metrics remain unresolved/neutral `—`).
- [ ] Consolidated shared presentation primitives under `src/components/character/panel/`.

### Character Creator — Species Visual Integration v1
PR #247 accepted and merged. Species Visual Integration v1 completed. Character Creator — Selection Experience v1 is the next focused task.

- [x] Establish shared `ChromaKeyImage` usage for official character visuals.
- [x] Integrate canonical `race_sprite.webp` sprite sheet into Species selection.
- [x] Define data-driven species sprite mapping for the 2×7 sheet.
- [x] Use 3:2 species-cell geometry.
- [x] Human-test every species selection and verify crop, positioning and green-screen removal.
- [x] Confirm no stale/duplicate species visual implementation remains in the Character Creator.
- [x] Keep Class and Background visual integration out of this PR unless required to fix a shared foundation regression.
- [x] PR #247 accepted and merged; Species Visual Integration v1 completed.

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
- [x] Keep `ROADMAP.md`, `TASK_BOARD.md` and module/system docs synchronized after material architecture changes.

## 🟠 High — Architecture & data foundations

### Artificer Naming Domain & Name Generator Foundation v1
- [x] Create application-wide, data-driven Naming Domain (`src/lib/naming/`).
- [x] Implement deterministic seedable PRNG (`Mulberry32`).
- [x] Source-backed naming data pools & rules for Tiefling, Gnome, Dragonborn, Elf, Dwarf, Halfling, Half-Elf, Half-Orc, and Human ethnic naming.
- [x] Comprehensive unit test suite (`tests/naming_domain.test.ts` - 17 passing tests).
- [x] Complete system documentation in `docs/modules/name-generator.md` and SVG specs in `docs/modules/svgBodys.md`.
- [x] Seamless integration into Character Creator (`BackstoryStep.tsx`).

### Character Creator — Selection Experience v1
PR #257 accepted and merged. Selection Experience v1 completed.

- [x] PR #257 accepted and merged.

- [x] Define and implement the intended order: Welcome/Ruleset → Save Slot → Identity → Species → Class → Background → Alignment → Attributes/Stats → Skills & Choices → Arcana/Spells → Equipment → Appearance → Describe Your Character → Review.
- [x] Move Background before Equipment.
- [x] Add meaningful introduction/content before Species/Class/Background selection using the official Markdown content assets (`race_choice.md`, `class_choice.md`, `background_choice.md`) and Help overlays.
- [x] Use official visual assets from `public/assets/ui/official/` with correct aspect ratios: races 3:2, classes 2:3, backgrounds 1:1.
- [x] Use sprite sheets where appropriate (`SpeciesSprite`, `ClassSprite`, `BackgroundSprite`) for efficient loading while retaining individual images where the asset contract calls for them.
- [x] Make selected records/items inspectable where appropriate, including background-provided equipment.
- [x] Prevent invalid starting equipment tiers; selection must be ruleset/class/background aware.
- [x] Use `public/assets/icons/svg/` for character creator selection UI via `GameIcon`.
- [x] Use `public/assets/sounds/sfx/ui_character_select.wav` (`UI_CHARACTER_SELECT` in `soundService`) for character selection feedback.
- [x] Add polished required-step validation overlay (`ValidationOverlay.tsx`): missing required selections trigger modal overlay with direct route buttons to missing steps.
- [x] Preserve existing ruleset selection (2014 vs 2024) and save persistence; do not duplicate ruleset state in individual steps.
- [x] Review step consumes canonical `Character` state and displays actual persisted data.
- [x] Keep Appearance redesign, canonical profile schema and image generation out of this task.

### Ruleset Selection & Ruleset Context — D&D 2014 / 2024
Foundation and Downstream Integration v1 passes in progress.

- [x] Provide the 2014/2024 selection UI.
- [x] Persist the selected ruleset in character save data.
- [x] Verify the selected ruleset is exposed through one canonical game/campaign context (`useGameStore.ruleset`) rather than read independently by screens.
- [x] Provide a single ruleset context/resolver (`getActiveRulesetContext` / `getRulesetVersionFolder`) used by rules-sensitive systems.
- [x] Replace ad-hoc `/14/` / `/24/` branching with canonical ruleset-aware resolution in representative loaders (`fetchEquipmentData`, `fetchMonsterData`, `atlasService.loadEquipment`, `atlasService.loadEnemy`).
- [x] Document canonical ruleset ownership contract and scope in `docs/ARCHITECTURE_STATUS.md`.
- [x] Audit and migrate Feat data loaders (`fetchFeatData`, `atlasService.loadFeat`).
- [x] Audit and migrate Class Levels data loaders (`fetchClassLevels`, `atlasService.loadLevelData`).
- [x] Audit and migrate Spell data loaders (`fetchSpellData`, `atlasService.loadSpell`).
- [ ] Audit and migrate remaining rules, species, subraces, backgrounds, conditions and feature rulesets for ruleset awareness.
- [ ] Validate both rulesets load correct versioned Atlas data across all downstream consumers where 2024 content exists.

### Combat Integration v1 — BattleMap → CombatTester → CombatGrid
PR #261 accepted and merged. Implementation, adapter, unit tests, and Playwright verification complete.

- [x] PR #261 accepted and merged.
- [x] Persistent combat-map authoring files under `public/assets/atlas/combat/combat_maps/` through the supported development/server write boundary.
- [x] Canonical BattleMap loader/service shared by editor and runtime testing.
- [x] Update `src/components/devkit/CombatTester.tsx` to load the same BattleMap authoring data as the editor.
- [x] Introduce/verify a dedicated BattleMap → CombatGrid adapter rather than duplicating map conversion in UI code.
- [x] Ensure CombatGrid treats walls as **cell boundaries**, not fully blocked cells.
- [x] Map terrain identity into combat walkability/movement-cost queries using canonical terrain definitions.
- [x] Load PC/enemy token references from BattleMap data without creating a second entity schema.
- [x] Support explicit player/party entry points rather than hardcoded spawn coordinates.
- [x] Add a small canonical integration test map covering walls, doors, terrain, PC, enemy, entry point and objects.
- [x] Add focused regression tests for BattleMap loading, conversion, wall boundaries, terrain and spawn/entry data.
- [x] Keep BattleMapEditor as authoring UI; keep CombatTester as testing/debug UI; keep CombatGrid as runtime representation.

### Inventory & Equipment Architecture / UX Overhaul
- [x] Audit `src/components/character/Inventory.tsx`, `FullInventoryMenu.tsx`, `PartyInventory.tsx`, `DraggableInventoryItem.tsx`, `EquipmentDoll.tsx`, `SpellInventory.tsx` and related inventory/equipment components.
- [x] Define the intended character-domain structure: `character/profile/`, `character/inventory/`, `character/equipment/`, `character/progression/`.
- [x] Keep reusable character-domain inventory/equipment components under `character/`; do not move inventory into `hud/` merely because it is visible from the HUD.
- [x] Refactor `CharacterPanel.tsx` toward a compact runtime HUD surface.
- [x] Keep `DraggableInventoryItem` as a reusable item interaction primitive where appropriate.
- [x] Make `FullInventoryMenu` the full inventory workspace.
- [x] Provide a clear UI entry point from CharacterPanel to the full inventory workspace.
- [x] Implement reliable scrolling, category filtering and item inspection.
- [x] Implement working equip/unequip interactions through supported click and drag/drop flows.
- [x] Ensure EquipmentDoll uses the intended 9:16 visual treatment consistently.
- [x] Fix supported green-screen equipment rendering through the shared chroma-key infrastructure.
- [x] Verify party inventory/shared storage behavior and transfers.
- [x] Preserve Inventory V2 registry/slot architecture and save compatibility.
- [x] Add regression tests around equip/unequip, item inspection, DnD transfers and inventory rendering state.

### Canonical Character Profile & CharacterScreen Refactor
This follows the Character Creator Selection Experience rather than being folded into it.

- [ ] Establish canonical character-profile presentation primitives.
- [ ] Add compact/selection and full-profile variants without creating a second character schema.
- [ ] Refactor `src/components/core/TitleScreen.tsx` to consume canonical profile primitives.
- [ ] Refactor `src/components/character/CharacterProfile.tsx` into clean composition with clear responsibility boundaries.
- [ ] Refactor the full `CharacterScreen.tsx` only after the shared profile foundation is stable.
- [ ] Remove duplicated character identity/portrait/class/level presentation logic from screens where the canonical profile can be reused.
- [ ] Keep character data/state as the single source of truth.
- [ ] Include narrative character fields such as **Traits, Ideals, Bonds and Flaws** as first-class profile data; these are important inputs for Journal and DM/LM immersion and must not be UI-only decorations.
- [ ] Keep `CharacterPanel` as a HUD surface and avoid replacing it with another profile God Component.
- [ ] Add/update tests for canonical profile rendering and screen integration.

### DevKit shared infrastructure
- [ ] Establish shared DevKit interaction primitives where reuse is justified: context menu/right-click actions, file actions, color picker, icon helpers, keyboard shortcut handling and history/command infrastructure.
- [ ] Refactor/reuse `src/components/devkit/audio/ColorWheel.tsx` as a shared color-picker capability where appropriate.
- [ ] Keep shared infrastructure separate from domain state: BattleMap, Audio, World and other editor histories remain isolated.
- [ ] Reuse the existing Artificer icon registry under `public/assets/icons/svg/` before adding new icons.
- [ ] Keep reusable asset/entity browsers backed by canonical Atlas data rather than hardcoded lists.

## 🟡 Medium — Character & gameplay systems

### Character Creation / Level Up
- [ ] Starting Equipment Eligibility Resolver — enforce ruleset-aware starting equipment filters in Character Creator.
- [ ] Point Buy Calculator — standard 27-point-buy constraints.
- [ ] Advanced Spellbook Manager — repair and then overhaul spell selection using the canonical spell Atlas data.
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
- [ ] Journal/DM/LM character-context integration — use character narrative state (Traits/Ideals/Bonds/Flaws and later description/profile data) as structured context rather than scraping UI text.

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
- [x] Canonical SVG Icon System Migration (`public/assets/icons/svg/`, `GameIcon`, zero third-party/legacy icons).

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

*Last Updated: 2026-08-18*
