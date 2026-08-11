# ⚔️ Tactical Combat Blueprint

This document is the **design/roadmap document** for tactical combat. It is intentionally separate from `docs/systems/TACTICAL_COMBAT_ENGINE.md`, which documents the current runtime architecture and implementation status.

## Relationship to the Battle Map Editor

The tactical stack has two distinct responsibilities:

```text
BattleMapEditor
    │
    │ authoring
    ▼
BattleMap definition
    │
    │ adapter
    ▼
Combat runtime
    │
    ▼
CombatGrid
```

The Battle Map Editor is responsible for creating map geometry, terrain, doors, objects, spawn points, layers and other DM authoring data. Combat is responsible for resolving actions against that map at runtime.

## Current foundation

The tactical runtime already has foundations for:

- Canvas-based grid rendering
- grid coordinates and distance calculations
- A* pathfinding
- line-of-sight calculations
- doors/walls and collision concepts
- token rendering and interaction
- initiative/turn sequencing
- DevKit combat testing

See `docs/systems/TACTICAL_COMBAT_ENGINE.md` for the current implementation contract.

## Design priorities

### 1. Runtime spatial correctness

All movement, targeting, collision, LoS and range calculations must use one consistent coordinate system.

The initial convention is square grid, 5 ft per cell, integer `[x, y]` coordinates.

### 2. Actor turn validation

Movement and combat actions must be validated against the actor whose turn is active. UI selection alone must never grant permission to move or act.

### 3. Geometry-first targeting

Targeting should use deterministic geometry utilities for:

- melee/ranged distance
- line of sight
- cones
- spheres/circles
- lines
- creature footprints
- blocking walls and doors

The UI visualizes these calculations; it should not contain a second implementation of the rules.

### 4. Area of Effect

Planned AOE primitives include:

- **Sphere/Circle:** cells within the defined radius.
- **Cone:** directional fan originating from the actor.
- **Line:** cells intersected by a directional line effect.

AOE calculations must be pure and testable.

## Enemy AI — planned

Automated enemy turns are not considered complete yet.

The intended first implementation is deliberately small:

```text
Enemy turn
   ↓
Find visible/valid target
   ↓
Check attack range
   ├── yes → resolve attack
   └── no  → calculate A* movement
                ↓
             move
                ↓
          resolve attack if possible
```

Later priorities can include target scoring, tactical positioning, cover, disengagement and ability selection.

## NPCs, summons and allied units — planned

The runtime should eventually distinguish:

- player characters
- full NPC party members
- simplified companions
- summons/minions
- enemies
- neutral creatures

The control model should be defined before implementing companion-specific UI.

## Combat UI / viewport

The tactical viewport should prioritize usable screen space. Panning and zooming should preserve accurate grid coordinate conversion.

The combat UI should not duplicate the Battle Map Editor's authoring controls. Runtime controls should focus on:

- actor selection
- movement
- actions
- targeting
- initiative
- combat log
- relevant tactical information

## Planned implementation phases

### Phase 1 — Runtime foundation

- [x] Grid rendering foundation
- [x] Basic pathfinding foundation
- [x] Initiative foundation
- [x] Token rendering foundation
- [x] Initial LoS foundation
- [ ] Complete runtime map loading from `BattleMap`
- [ ] Centralize geometry/rule validation

### Phase 2 — Action resolution

- [ ] Strict active-turn movement validation
- [ ] Melee/ranged range resolution
- [ ] Attack targeting
- [ ] Damage resolution
- [ ] Combat log integration
- [ ] Spell targeting

### Phase 3 — Spatial effects

- [ ] Cone targeting
- [ ] Sphere targeting
- [ ] Line targeting
- [ ] Creature footprint-aware targeting
- [ ] Cover resolution

### Phase 4 — Enemy automation

- [ ] Enemy turn runner
- [ ] Target selection
- [ ] A* tactical movement
- [ ] Basic attack resolution
- [ ] Ability selection

### Phase 5 — Allied control

- [ ] NPC party control model
- [ ] Companion/minion schema
- [ ] Companion action interface

## Architecture constraints

1. Do not turn `CombatGrid.tsx` into a God Component.
2. Keep combat rules in state/domain utilities rather than UI event handlers.
3. Do not duplicate Battle Map authoring logic in combat.
4. Do not hard-code Atlas entity definitions in combat UI.
5. Keep geometry deterministic and unit-testable.
6. Prefer adapters between authoring and runtime models rather than shared mutable state.

## Related documents

- `docs/systems/TACTICAL_COMBAT_ENGINE.md` — current runtime architecture
- `docs/modules/mapEditor.md` — Battle Map authoring architecture
- `docs/systems/DATA_FLOW.md` — application state and orchestration
- `docs/ARCHITECTURE_STATUS.md` — agent-facing architecture contract
