# 📈 Artificer Project Progress

This document tracks high-level implementation status. It should reflect the repository as it exists now; detailed feature plans belong in `docs/TASK_BOARD.md` or module specifications.

## 📊 Current Status: Character Panel consolidation / presentation architecture

The core ruleset-aware Character Creator foundations are now substantially established, including 2014/2024 ruleset context, species/class/progression/subclass/background/feat/spell integration. The current priority is no longer adding another isolated character UI feature: it is consolidating the Character Panel into one reusable presentation system before more character-facing systems are layered on top.

---

## 🗺️ Roadmap Progress

### Core infrastructure
- [x] Inventory V2 / registry-slot architecture.
- [x] Store slicing into domain-oriented stores.
- [x] Asset validation and canonical asset paths.
- [x] Sound/icon organization work.
- [x] Documentation/orchestration foundation.

### World State & Tactical Foundations
- [x] World map/tile infrastructure.
- [x] Temporal progression.
- [x] Environmental/weather systems.
- [x] Travel/discovery foundations.
- [x] Tactical combat foundation: grid, movement/pathfinding, initiative and runtime combat UI.
- [x] Journal foundations.
- [🚧] Tactical engine refinement and deeper Atlas-driven integration.

### Ruleset-aware Character Creator
- [x] Canonical 2014/2024 ruleset context and resolution boundary.
- [x] 2024 Species Foundation.
- [x] 2024 Base Class Foundation.
- [x] 2024 Class Progressions & Features.
- [x] 2024 Subclasses & Subclass Features.
- [x] 2024 Backgrounds & Origins.
- [x] 2024 Feats integration.
- [x] 2024 Spells catalogue/runtime integration.
- [ ] Remaining rules-sensitive downstream audit and final end-to-end ruleset verification.

### Character Mirror / Panel
- [x] Character Mirror foundation with persistent body/background presentation.
- [x] Shared character panel primitives under `src/components/character/panel/`.
- [🚧] Canonical Character Panel consolidation — Creator, HUD and Profile still have overlapping composition/responsibilities.
- [🚧] Stats/Body/Abilities consolidation into `CharacterPanelStats`.
- [🚧] Character Panel visual refinement: full-panel background, persistent body layer, polished Stats default surface, HUD-sized contract and mobile behavior.
- [🚧] Spell UX consolidation: Spell Slots vs spellbook/known/prepared spells vs Spell Sheet.
- [🚧] Spell detail data-contract repair so descriptions and canonical detail fields reach Creator/HUD inspection.

### Current — DM DevKit & Battle Map Authoring
- [🚧] **Battle Map Editor architecture** — module has been split into `src/components/devkit/BattleMapEditor/`.
- [🚧] **Battle Map Editor UI scaffolding** — Wall, Room, Door, Terrain, Object, Token, Layers, Inspector and Undo/Redo currently have early placeholders/scaffolding and are not yet considered functional.
- [🚧] Battle Map authoring data model and persistence.
- [🚧] Authoring/runtime adapter into `CombatGrid`.
- [ ] Functional drawing/editing tools.
- [ ] Asset browser and object placement.
- [ ] Functional layers and inspector.
- [ ] Undo/redo command history.
- [ ] Map save/load/export.

### Phase 3 — AI DM Integration
- [ ] Tool-call connectivity to game state mutations.
- [ ] Contextual awareness and narrative state feeding.
- [ ] Autonomous adventure/NPC generation.

### Phase 4 — World Simulation
- [ ] Faction/reputation simulation.
- [ ] Economic simulation.

---

## 🏆 Recent milestones

### 2026-09-13
- Established the canonical Character Panel consolidation phase in `ROADMAP.md`.
- Added `docs/modules/characterPanel.md` as the authoritative Character Panel and Spell UX design specification.
- Updated architecture/component documentation to distinguish reusable Character Panel presentation from Creator/HUD/Profile host responsibilities.
- Recorded the ready-for-review Spell Sheet PR as human-review work that must be evaluated against the new architecture before merge.

### Earlier milestones
- Character Creator Species Character Mirror & Choice State v1 merged and verified.
- 2024 Species, Classes, Progressions, Subclasses, Backgrounds/Origins, Feats and Spells foundations implemented/verified.
- Inventory/equipment architecture foundation merged.
- Tactical combat foundation established.

---

## 🎯 Current engineering focus

1. Consolidate the Character Panel into one reusable presentation system under `src/components/character/panel/`.
2. Make `CharacterPanelStats` the polished default/open surface, with persistent full-panel background and body SVG.
3. Make Creator and runtime HUD consume the same panel system; avoid a second HUD implementation.
4. Refine the panel's identity/resource hierarchy, including prominent HP presentation and spell-slot resources.
5. Integrate the Spell Sheet/detail experience without losing canonical spell descriptions or ruleset isolation.
6. Refactor CharacterProfile and CharacterStats responsibilities only where they overlap with canonical panel presentation; avoid creating a God Component.
7. Keep documentation synchronized with implementation so Jules works from one architectural source of truth.

*Last Updated: 2026-09-13*
