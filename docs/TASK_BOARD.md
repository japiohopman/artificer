# Artificer Task Board

This is the **active work queue**. Completed historical work should not remain mixed into the actionable list. Architecture/design details belong in module/system docs.

## 🔴 Critical — Current engineering

### Battle Map Editor
- [ ] Complete the `BattleMap` authoring data model and versioned schema.
- [ ] Implement functional Canvas viewport: coordinates, pan, zoom and grid/snap.
- [ ] Implement functional Wall tool using wall-segment geometry.
- [ ] Implement functional Room and Door tools.
- [ ] Implement functional Terrain painting.
- [ ] Implement Object/Stamp placement using canonical asset infrastructure.
- [ ] Implement Token/Spawn placement with Atlas references where appropriate.
- [ ] Implement Layers and Inspector behavior.
- [ ] Implement command-based Undo/Redo.
- [ ] Implement map validation, serialization and save/load.
- [ ] Implement BattleMap → CombatGrid runtime adapter.
- [ ] Add editor tests for geometry, serialization and history.

> **Important:** the current Wall → Room → Door → Terrain → Object → Token → Layers → Inspector → Undo/Redo UI is scaffolding. A placeholder is not a completed task.

### Documentation / agent alignment
- [x] Establish living `docs/ARCHITECTURE_STATUS.md`.
- [x] Refresh `docs/PROJECT_HUB.md`.
- [x] Refresh `docs/COMPONENT_MAP.md`.
- [x] Refresh `docs/PROGRESS.md`.
- [x] Integrate new documentation audit findings (`docs/TASK_BOARD_addition.md` and `docs/new_map_functions.md`) into the central Task Board.
- [ ] Audit remaining system/module docs against current source.
- [ ] Remove or clearly mark stale/deprecated documentation.
- [ ] Ensure all major modules have one authoritative specification.

## 🟠 High — Data & infrastructure

- [ ] Implement allowlist for external/special asset paths.
- [ ] Check image coverage per Atlas domain.
- [ ] Asset Registry maintenance.
- [ ] Establish asset size budgets (WEBP/PNG < 1MB where practical).
- [ ] Lazy-load heavy assets per game screen.
- [ ] Create thumbnail variants for inventory/shop UI where beneficial.
- [ ] Resolve runtime hosting strategy for heavy assets (Firebase Storage or Git LFS).
- [ ] Remove obsolete local heavy-asset copies once hosting is verified.
- [ ] Remove deprecated `src/store/useStore.ts` if still unused after source verification.
- [ ] Implement the "Toril Location Image Generator" to populate empty world asset image slots (as defined in `docs/Toril_image_locations.md`).
- [ ] Implement the Day/Night Banner Matrix (16:9 layout split into horizontal Day/Night rows) for location banners.

## 🟡 Medium — Character & gameplay systems

### Character Creation / Level Up
- [ ] Tighten up and polish overall character creation flow (in progress).
- [ ] Fuller Character Sheet: display Armor Class (AC), Initiative, etc., utilizing existing assets and UI elements.
- [ ] Right-Hand Character Panel: Classic layout with profile picture, level, and XP progress bar.
- [ ] Grid-Based Inventory: implement a container-based system and grid inventory with per-category sub-tabs.
- [ ] Point Buy Calculator — standard 27-point-buy constraints.
- [ ] Advanced Spellbook Manager.
- [ ] Feat selection during ASI/Level Up with prerequisites and ability-score increases.
- [ ] Automatic HP level-up flow with class hit dice and Constitution modifier.
- [ ] Per-attribute 3D ability-score rolls.
- [ ] Equipment Pack inspection in `FocusView`.
- [ ] Recruitable NPC / Character Passport UI.

### Runtime systems & Combat Loop
- [ ] Combat loop — full cycle running smoothly end to end.
- [ ] XP animation — display high-fidelity animation when players earn XP.
- [ ] Shared XP across the party — distribute earned XP evenly to all active characters.
- [ ] NPC Memory / relationship history module.
- [ ] Economic & Trade module.
- [ ] Soundscape Orchestrator.
- [ ] Rule Engine / Condition Tracker.

### Location & Submap Flow (docs/new_map_functions.md)
- [ ] Enter Location Flow: trigger location map transition and automatically close active chat panels.
- [ ] Spawn- or Entry-points: spawn/place party automatically on specified coordinates inside locations (e.g. `entry_points.json`).
- [ ] Restructure HUD Responsibilities: manage legend, layer toggles, and location info in `WorldPanel.tsx` (or a dedicated React component) rather than inside markdown.
- [ ] Discoverable Locations: introduce discovery-driven visibility, displaying location markers only after traveling, talking to NPCs, reading lore, etc.
- [ ] Fog-of-War Granularities: pre-reveal large areas (e.g. seas) while small streams/puddles and hidden structures only reveal upon discovery.
- [ ] WorldMap and LocationMap decoupling: split `WorldMap.tsx` and `LocationMap.tsx` into clean, specialized subcomponents (Renderer, TravelController, Markers, etc.).
- [ ] Add D&D Markdown Styling in `WorldPanel` for location lore (crimson `#8B0000` H1/H2, gold `#D4AF37` HR, and serif quotes).

## 🟢 Maintenance / optimization

- [ ] Continue Atlas asset/index validation as schemas evolve.
- [ ] Review image and asset loading performance after major UI changes.
- [ ] Keep module documentation synchronized with architectural changes.
- [ ] Add regression tests when existing runtime systems are refactored.

## Completed foundations

These are recorded here as historical milestones rather than active tasks:

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
2. `[x]` means implemented and verified; do not use it for scaffolding.
3. Architecture decisions belong in `docs/ARCHITECTURE_STATUS.md` or the relevant module/system document.
4. If a task becomes large enough to need its own design, create/update a module document and keep this board as the execution checklist.
5. Update this file when work materially changes the active priority.

*Last Updated: 2026-08-11*
