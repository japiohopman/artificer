# BattleMap v2 Architecture Specification

> **Governing Issue:** [#369](https://github.com/japiohopman/artificer/issues/369) — *feat(map): establish canonical BattleMap schema, edge semantics, hazards and CombatTester integration*  
> **Status:** Canonical Architecture Specification  
> **Applicable Specialist:** Architecture (`.github/agents/architecture-specialist.agent.md`)

---

## 1. Executive Summary & Problem Statement

The Battle Map Editor is the canonical authoring surface for tactical encounter maps. In the legacy v1 schema:
1. Physical boundaries (walls and doors) were stored as horizontal/vertical line segments, but cells had no directional boundary spine awareness.
2. At runtime, `battleMapToCombatGrid.ts` stamped doors directly onto the cell grid (`cell.type = 'door'`), destroying underlying floor/terrain data and incorrectly treating an edge boundary as an entire occupied tile.
3. `CombatGrid.tsx` did not render line-segment walls on canvas; it only rendered filled tiles for `cell.type === 'wall' | 'door'`, while checking `combatState.walls` invisibly for movement and Line-of-Sight.
4. Hazards, pits, elevation, and environmental zones had no structured representation in the schema.
5. `CombatTester.tsx` maintained a parallel hardcoded list of background images (`terrainMaps`) that duplicated and bypassed canonical map loading.
6. Documentation in `docs/modules/mapEditor.md` inaccurately described the editor as production-ready and fully implemented when core spatial, hazard, and runtime integration contracts were still scaffolding.

BattleMap v2 establishes a versioned, lossless, and mathematically sound authoring contract, runtime adapter, and verification suite.

---

## 2. Canonical Ownership & System Boundaries

```text
[Authoring Surface]
BattleMapEditor (src/components/devkit/BattleMapEditor/)
       ↓
[Canonical Persistence Layer]
JSON Authoring Files (public/assets/atlas/combat/combat_maps/*.json)
       ↓
[Loader / Migration / Validation Boundary]
battleMapStorage.ts -> battleMapValidator.ts -> battleMapMigration.ts
       ↓
[Adapter Boundary]
battleMapToCombatGrid.ts
       ↓
[Runtime Combat State]
useGameStore.combatState:
  ├─ grid: TacticalCell[][] (cells remain navigable floor/terrain with hazards)
  ├─ walls: MapEdge[] / boundary geometry (edges evaluate LoS and movement)
  ├─ monsters: CombatMonster[] (resolved from Atlas)
  ├─ combatMapBackground: string
  └─ playerPos: { x, y } (from player token or entrance portal)
       ↓
[Presentation & Execution]
CombatGrid.tsx (tactical canvas, movement ruler, LoS raycasting)
CombatTester.tsx (DevKit encounter testing workbench)
```

### Ownership Rules
1. **Static Authoring Boundary:** `public/assets/atlas/combat/combat_maps/*.json` holds canonical authored definitions. The editor owns authoring parameters, visual layers, labels, and metadata. It never executes combat logic.
2. **Dynamic Session Boundary:** `useGameStore.combatState` is the sole runtime state owner for active combat sessions (cell occupancy, active door open/closed status, initiative, health).
3. **Pure Adapter Boundary:** `battleMapToCombatGrid.ts` is the single, unidirectional transformation converting a static `BattleMap` into runtime combat state.
4. **Ruleset Isolation:** Spatial hazard descriptors (e.g. fire surface, acid pool) are declarative data in the map. Their mechanical resolution (damage rolls, saving throws, condition durations) belongs strictly to the tactical combat engine and ruleset resolvers.

---

## 3. Canonical Edge Coordinates & Shared Boundary Semantics

A cell is a navigable spatial area. Physical boundaries belong to the four directional spines/edges surrounding the cell: **North, East, South, West**.

### Valid Coordinate Ranges
For a map of width $W$ and height $H$, cells are indexed $x \in [0, W - 1]$ and $y \in [0, H - 1]$.

| Spine Orientation | Spine Line | Segment Span | Valid $x$ Range | Valid $y$ Range | Total Possible Positions | Outer Boundary Coordinates |
|---|---|---|---|---|---|---|
| **Horizontal (`h`)** | Grid line $y$ | from $(x, y)$ to $(x + 1, y)$ | $0 \le x \le W - 1$ | $0 \le y \le H$ | $W \times (H + 1)$ | North border: $y = 0$<br>South border: $y = H$ |
| **Vertical (`v`)** | Grid line $x$ | from $(x, y)$ to $(x, y + 1)$ | $0 \le x \le W$ | $0 \le y \le H - 1$ | $(W + 1) \times H$ | West border: $x = 0$<br>East border: $x = W$ |

### Deterministic Edge IDs
Edges are keyed deterministically by their orientation and anchor coordinate:
- Horizontal: `h:${x},${y}`
- Vertical: `v:${x},${y}`

### Shared Boundary Mathematical Proof
For any cell $C(x, y)$ within map bounds:
- **North spine:** `h:${x},${y}`
- **South spine:** `h:${x},${y + 1}`
- **West spine:** `v:${x},${y}`
- **East spine:** `v:${x + 1},${y}`

1. **Vertical Boundary between $C(x, y)$ and East Neighbor $C(x + 1, y)$:**
   - East spine of $C(x, y)$ is `v:${x + 1},${y}`.
   - West spine of $C(x + 1, y)$ is `v:${x + 1},${y}`.
   - Both point to the exact same canonical edge ID.
2. **Horizontal Boundary between $C(x, y)$ and South Neighbor $C(x, y + 1)$:**
   - South spine of $C(x, y)$ is `h:${x},${y + 1}`.
   - North spine of $C(x, y + 1)$ is `h:${x},${y + 1}`.
   - Both point to the exact same canonical edge ID.

**Conclusion:** Each physical boundary is represented exactly once in persistence, eliminating duplicate segments and conflicting door states.

---

## 4. Edge Types & Door Semantics

To avoid speculative complexity, edge types and door states are strictly bounded to verified requirements:

```typescript
export type EdgeType = 'wall' | 'low-wall' | 'door' | 'secret-door';
export type DoorState = 'open' | 'closed' | 'locked';

export interface MapEdge {
  id: string;               // e.g. "h:5,5" or "v:5,6"
  orientation: 'horizontal' | 'vertical';
  x: number;
  y: number;
  type: EdgeType;
  doorState?: DoorState;    // defined for 'door' and 'secret-door'
}
```

- `'wall'`: Solid obstruction. Blocks movement and Line-of-Sight.
- `'low-wall'`: Half wall. Blocks movement; allows Line-of-Sight (foundational geometry for cover calculation in `lineOfSight.ts`).
- `'door'` (closed / locked): Blocks movement and Line-of-Sight.
- `'door'` (open): Allows movement and Line-of-Sight.
- `'secret-door'`: Treated as `'wall'` until detected/opened.

### Door Interaction Model
Doors are boundary edges, not cells. When an active character interacts with a door in `CombatGrid.tsx`:
- The character must be within 5 ft (1 grid cell) of the edge.
- An edge-centered hitbox (or clicking either adjacent cell sharing the edge) toggles `doorState` between `'open'` and `'closed'` without modifying the underlying terrain of either cell.

---

## 5. Terrain & Structured Hazard Model

### Authored Terrain Invariants
- Terrain cells retain authored properties: `{ x, y, type }`.
- **Migration Invariant:** Migration **must not** infer `movementCost: 2` or difficult terrain for water, mud, or any other terrain. Authored values are preserved as authored. Rules engines evaluate terrain costs dynamically.

### Structured Hazard Schema
```typescript
export type HazardCategory = 'surface' | 'cloud' | 'pit' | 'trap';

export interface CellHazard {
  id: string;
  category: HazardCategory;
  type: string;             // e.g. 'fire', 'grease', 'acid', 'poison', 'ice', 'web', 'pit', 'spike'
  damageType?: string;      // Canonical reference: 'fire' | 'acid' | 'poison' | 'cold' | 'piercing'
  trigger?: 'on-enter' | 'on-turn-start' | 'on-turn-end';
}
```
- **Boundary Guarantee:** The editor and adapter never invent damage dice (e.g. `1d6`), saving throw formulas (e.g. `DC 13 Dex`), or condition durations.
- **Runtime Resolution:** The adapter attaches `cell.hazards` to `TacticalCell`. When a character moves into a cell or starts/ends a turn in combat, the tactical combat engine detects the hazard descriptor and resolves mechanics through the canonical ruleset domain.

---

## 6. Portals vs. Player Tokens

```typescript
export interface MapPortal {
  id: string;
  type: 'entrance' | 'exit';
  name: string;
  x: number;
  y: number;
  facing?: 'north' | 'east' | 'south' | 'west';
  description?: string;
}
```

### Separation Rules
1. Existing `markers` with `type === 'entrance' | 'exit'` migrate into `portals: MapPortal[]`.
2. Existing `markers` of other types (`encounter`, `trap`, `clue`) remain in `markers: MapMarker[]`.
3. Tokens with `type === 'player'` remain strictly in `tokens: MapToken[]`. They are **never** converted into portals.
4. **Spawn Resolution Order in `battleMapToCombatGrid.ts`:**
   - If a player token (`type === 'player'`) exists, its position defines the tactical `partySpawnPos`.
   - If no player token exists, the first entrance portal (`type === 'entrance'`) provides the default `partySpawnPos`.
   - Player tokens do not create active combatant monster records.

---

## 7. CombatTester Architecture & Map Selection

1. **Consumer Scope:** `src/components/devkit/CombatTester.tsx` is the sole consumer of `terrainMaps`.
2. **Clear UI Separation:**
   - **Primary Selector (`BattleMap:`):** Loads canonical `BattleMap` JSON definitions from `/api/combat-maps` using `loadBattleMapFromServer` and `battleMapToCombatGrid`.
   - **Secondary Selector (`Backdrop Image:`):** Retains the background image list (`terrainMaps`) strictly as a visual backdrop override.
3. **Canonical Fixture Scope:** We do not create six redundant battle maps. The authoritative fixture `public/assets/atlas/combat/combat_maps/canonical_integration_map.json` is upgraded to v2 to serve as the unified integration test target.

---

## 8. Migration & Schema Compatibility

### Versioned Schema Contract (`version: 2`)
```typescript
export interface BattleMapV2 {
  version: 2;
  id: string;
  name: string;
  metadata: MapMetadata;
  dimensions: { width: number; height: number };
  grid: GridConfiguration;
  background: MapBackground;
  terrain: TerrainCell[];
  edges: MapEdge[];
  portals: MapPortal[];
  objects: MapObject[];
  tokens: MapToken[];
  labels: MapLabel[];
  markers: MapMarker[];
  fogOfWar?: FogDefinition;
  layers: MapLayer[];
}
```

### Validation Invariants
- `battleMapValidator.ts` validates that `map.version === 1 || map.version === 2`. Unsupported future or unknown versions are rejected immediately with a descriptive error.
- Dimensions must be at least $4 \times 4$.
- Edge coordinates must conform strictly to valid orientation ranges:
  - Horizontal: $0 \le x < W$ and $0 \le y \le H$
  - Vertical: $0 \le x \le W$ and $0 \le y < H$
- Duplicate edge IDs are rejected.

### Migration Invariants
- Unversioned legacy maps $\rightarrow$ v1 $\rightarrow$ v2.
- v1 maps $\rightarrow$ v2:
  - `walls` transformed to `edges` with deterministic keys `h:x,y` / `v:x,y`. Overlapping duplicates merged.
  - `markers` of type `'entrance' | 'exit'` converted to `portals`.
  - Player tokens preserved in `tokens`.
  - Terrain preserved without inferred movement costs.

---

## 9. Verification Strategy

1. **Unit Tests (`tests/battle_map_v2_schema.test.ts`):**
   - Valid and invalid edge coordinates (including outer map borders $x=W, y=H$).
   - Symmetric access of shared edges from adjacent cells.
   - Lossless migration from v1 to v2.
   - Rejection of invalid versions and duplicate edge IDs.
2. **Combat Integration Tests (`tests/combat_integration.test.ts`):**
   - Boundary wall movement blocking and LoS raycasting.
   - Door crossing checks between adjacent cells.
   - Door state transitions without wiping cell terrain.
   - Player token spawn positioning vs. portal entrance fallback.
3. **Automated Pipeline Commands:**
   - `bun test tests/battle_map_v2_schema.test.ts`
   - `bun test tests/combat_integration.test.ts`
   - `npm run test:workflow`
   - `npm run lint`
   - `npm run validate:assets`
   - `git diff --check`
