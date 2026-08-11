# ⚔️ Tactical Combat Engine

The Tactical Combat Engine is the **runtime** system for resolving grid-based encounters. It consumes canonical game/Atlas data and presents tactical movement, positioning, initiative and combat interactions.

> **Authoring boundary:** `BattleMapEditor` creates and edits battle-map authoring data. `CombatGrid` is the runtime tactical view. The editor is not a second combat engine.

## Status

**Implemented foundation / actively evolving.** The current tactical implementation provides the grid, Canvas-based rendering, token presentation, movement/pathfinding foundations, initiative and several spatial utilities. Advanced combat automation and some rule integration remain work in progress.

Do not document a feature as implemented solely because a UI placeholder or prototype exists.

## Data integrity

Combat entities and mechanical definitions should resolve from the canonical Atlas/runtime data. Avoid hard-coded monster, spell, equipment or ability definitions in UI components.

## Spatial model

The current tactical convention is:

- Square grid
- 32 × 20 default battle area where applicable
- 5 ft per cell
- Integer `[x, y]` coordinates
- Canvas for high-frequency map rendering
- React for token/UI overlays

The exact map dimensions should eventually come from the loaded battle-map definition rather than being treated as a universal runtime constant.

## Rendering architecture

`CombatGrid` uses a hybrid rendering model:

```text
Canvas
├── grid
├── terrain
├── walls / doors
├── spatial highlights
└── other high-frequency map visuals

React
├── tokens
├── token interaction
├── animation
└── surrounding combat UI
```

Do not create a React component for every grid cell.

## Movement and pathfinding

The tactical layer uses grid-based movement and A* pathfinding foundations. Movement must respect the active actor's speed and the map's blocking geometry.

Closed doors and blocking walls must prevent movement where appropriate.

Pathfinding and coordinate utilities should remain reusable and independent from React presentation.

## Doors, walls and geometry

Runtime combat should consume the map's semantic wall/door geometry.

The Battle Map Editor represents walls as segments between cells and doors as entities attached to wall geometry. The runtime adapter is responsible for translating that authoring model into the representation required by combat.

This distinction is important for:

- collision
- line of sight
- pathfinding
- door interaction
- cover
- future lighting

## Line of sight and fog of war

The tactical system has spatial visibility foundations including line-of-sight calculations and fog-of-war presentation.

LoS geometry should be based on actual blocking walls/doors rather than a purely visual approximation.

Fog of War has both an authoring concern (map layer) and a runtime concern (what the player can currently see). Keep those concerns separate.

## Initiative

Combat uses an initiative order and active-turn concept. Initiative is a runtime combat concern and should not be stored as editor state.

Future work includes stricter action/turn validation and richer combatant state.

## Combat state

`useGameStore` owns transient combat/session state. The exact shape is implementation-owned and should not be copied into documentation as a second schema. When the runtime model changes, update this document and the canonical TypeScript types together.

The editor's persisted `BattleMap` schema is intentionally different from combat runtime state.

## AI combat

Automated enemy tactical behaviour is **planned work**, not a completed system. The intended direction includes:

- target selection
- A* movement during enemy turns
- attack/spell resolution
- tactical priorities
- perception/visibility checks

Do not claim an enemy AI state machine is implemented until the corresponding runtime logic exists and is tested.

## Area of effect

AOE targeting for cones, spheres and lines is planned as part of the tactical rules layer. Geometry utilities should be pure and testable and should eventually be shared by the runtime UI and rule resolution.

## Runtime map loading

The intended flow is:

```text
Saved BattleMap
      ↓
validation / deserialization
      ↓
BattleMap → combat adapter
      ↓
combat runtime state
      ↓
CombatGrid
```

The adapter is the boundary between editor-only authoring data and runtime combat data.

## Development priorities

1. Keep spatial conventions consistent.
2. Keep combat rules out of presentation components.
3. Reuse Atlas data instead of duplicating definitions.
4. Separate map authoring from combat runtime.
5. Make geometry utilities deterministic and testable.
6. Add advanced AI/rules only after the runtime state model can support them cleanly.

---

**Related documentation:**

- `docs/modules/mapEditor.md` — Battle Map authoring architecture
- `docs/modules/tactical_combat_blueprint.md` — tactical roadmap/research
- `docs/systems/DATA_FLOW.md` — application state/data flow
- `docs/ARCHITECTURE_STATUS.md` — current architectural contract for agents
