# 🚀 Future Modules & Architecture Roadmap

This document records **planned or partially designed subsystems** that are not yet complete production modules.

It is intentionally different from `docs/COMPONENT_MAP.md` and the system documentation:

- `COMPONENT_MAP.md` describes what exists in the codebase.
- `docs/systems/*` describes current system architecture and contracts.
- This document describes future work and design direction.
- `docs/TASK_BOARD.md` contains actionable work that is currently scheduled/open.

> **Status rule:** A design in this file is not an implementation claim.

---

## 1. NPC Memory

**Status: Planned / partially designed**

Goal: give NPCs persistent memory beyond their static Atlas definitions.

Potential capabilities:

- affinity toward the party
- important interaction memories
- short-term session context
- long-term summarized memories
- dynamic persona traits

The exact persistence model and AI retrieval mechanism are not finalized.

---

## 2. Journal & Campaign Memory

**Status: Planned / partially implemented foundations**

Goal: maintain a player- and DM-facing record of:

- important events
- quests
- NPC discoveries
- locations
- lore
- bestiary discoveries
- session summaries

Use the existing journal/domain infrastructure where available. Do not create a parallel persistence store without an architectural decision.

See the journal module documentation when available.

---

## 3. Battle Map Authoring

**Status: In progress**

The Battle Map Editor has moved from the old monolithic prototype into:

```text
src/components/devkit/BattleMapEditor/
```

The editor is an **authoring system**, not the tactical combat runtime.

Planned/active areas include:

- wall authoring
- rooms
- doors
- terrain
- objects/assets
- tokens/spawn points
- layers
- inspector
- undo/redo
- map persistence
- runtime adapter

Current UI placeholders must not be treated as completed features.

See `docs/modules/mapEditor.md`.

---

## 4. Tactical Combat Expansion

**Status: Runtime foundation exists; advanced systems planned**

`CombatGrid` is already the runtime tactical surface. Future work may expand:

- robust action economy
- AOE targeting
- richer cover rules
- advanced visibility/lighting
- encounter automation
- enemy tactical AI
- richer combat rule validation

See `docs/systems/TACTICAL_COMBAT_ENGINE.md` for the current runtime architecture.

See `docs/modules/tactical_combat_blueprint.md` for longer-term design work.

---

## 5. Economic & Trade Simulation

**Status: Planned**

Potential systems:

- regional pricing
- merchant inventories
- supply/scarcity
- crafting economy
- material availability

This should integrate with the existing inventory, Atlas and location systems rather than creating separate item definitions.

---

## 6. Soundscape Orchestration

**Status: Partially implemented / future expansion**

The project already has audio infrastructure. Future work may add higher-level orchestration for:

- narrative mood transitions
- environmental layering
- combat-state transitions
- dynamic ambient scenes
- AI-directed sound cues

Use the existing audio services/stores as the foundation.

---

## 7. Rule Engine & Condition Resolution

**Status: Planned / distributed foundations exist**

Goal: centralize mechanical rule resolution where it currently risks becoming scattered across UI and feature code.

Potential scope:

- conditions
- passive checks
- rest/recovery
- action validation
- status effects
- mechanical modifiers

Do not introduce a second rule engine until the existing combat/character utilities have been audited and the required boundary is clear.

---

## 8. AI Tool-Calling & Context Architecture

**Status: Active architectural direction**

The AI Dungeon Master should operate through validated application tools rather than directly mutating game state.

Conceptually:

```text
LLM
 ↓
tool call
 ↓
validated service/store action
 ↓
canonical application state
 ↓
UI projection
```

Examples of future tool categories:

- dice/check resolution
- inventory changes
- world-state changes
- journal updates
- encounter/combat actions

The exact tool contract should be defined before large-scale implementation.

### Context strategy

The long-term goal is to avoid sending the entire game state to the LLM. Context should be assembled from relevant canonical data and compact runtime summaries.

Do not treat token-optimization examples in old documentation as implemented infrastructure unless corresponding code exists.

---

## 9. Atlas / World Map Expansion

**Status: Existing system, continued expansion**

The Atlas/world-map system already exists and should not be treated as a missing future module.

Future improvements may include:

- richer discovery/fog behavior
- deeper sub-map transitions
- location-to-encounter integration
- improved map asset loading
- battle-map entry points

Keep global map navigation separate from the Battle Map Editor and tactical runtime.

---

## 10. General architectural principles for future modules

When a new subsystem is proposed:

1. First determine whether a current store/service/component already owns the responsibility.
2. Define the data model before building a large UI.
3. Separate authoring state from runtime state.
4. Keep canonical Atlas data authoritative for static game entities.
5. Prefer pure, testable domain/geometry utilities for rules and calculations.
6. Do not introduce a new global store simply to avoid local feature state.
7. Do not call a placeholder an implementation.
8. Move large modules into their own directories before they become God Components.
9. Update the relevant architecture documentation when the design changes.
10. Only put actionable work into `TASK_BOARD.md`.

---

## Historical note

Older versions of this document described planned store slicing such as `useCharacterStore`, `useInventoryStore` and `useWorldStore` as future architecture. Those stores now exist, so that material has intentionally been removed from the future roadmap.
