  We are finishing the approved documentation correction for PR #416.

  Jaap authorizes committing and pushing ONLY these two reviewed files:
  - ROADMAP.md
  - scripts/agent-contract.test.mjs

  Before committing:
  1. Confirm the current branch is chore/replace-jules-with-antigravity-415.
  2. Confirm no other files are modified.
  3. Inspect the complete diff.
  4. Run npm run test:workflow.
  5. Run git diff --check.

  If any unexpected file or change appears, STOP and report it.

  If everything matches:
  1. Stage only the two authorized files.
  2. Inspect the staged diff.
  3. Commit with message:
     docs(workflow): clarify manual roadmap sequencing
  4. Push the existing branch to origin.

  Do not:
  - Switch branches.
  - Modify any other files.
  - Change GitHub Issues or PR metadata.
  - Create another PR.
  - Merge PR #416.
  - Touch PR #386.

  Report the commit SHA and push result.

○ Thought for 7.2s (Pre-commit verification is complete. The current branch and modified files match the approved c...)
● Ran 3 commands (git branch · git add · git push) (ctrl+o to expand)

  Pre-Commit Verification Summary

  1. Current Branch: chore/replace-jules-with-antigravity-415 confirmed.
  2. File Scope: Only ROADMAP.md and scripts/agent-contract.test.mjs were modified.
  3. Test Results: npm run test:workflow executed and passed all 37 tests.
  4. Diff Check: git diff --check executed with zero warnings/errors.
  ──────
  Commit & Push Results

  • Commit Message: docs(workflow): clarify manual roadmap sequencing
  • Commit SHA: 7cada31e16a1bdb9d1b11e472fe499ddb1e8773f
  • Push Destination: origin/chore/replace-jules-with-antigravity-415
  • Push Output:
    To https://github.com/japiohopman/artificer.git
       4054b9320..7cada31e1  chore/replace-jules-with-antigravity-415 -> chore/replace-jules-with-antigravity-415

  • Working Tree State: Clean; no other files or PRs were modified.

────────────────────────────────────────────────────────────
> --mode=plan

▸ Thought for 5s, 362 tokens

  I am now in planning mode (--mode=plan). In this mode, no files will be created or edited.

  Per AGENTS.md, implementation contracts begin strictly from an assigned GitHub Issue.

  Which GitHub Issue governs the work we are planning next? Please provide the Issue number or details, and I will:

  1. Inspect the assigned Issue and applicable specialist contract in .github/agents/.
  2. Inspect the current implementation, consumers, canonical ownership, and tests.
  3. Present a bounded investigation, risk analysis, and step-by-step implementation & verification plan for your
  review before any edits are made.

────────────────────────────────────────────────────────────
>
  We are starting GitHub Issue #369:

  "feat(map): establish canonical BattleMap schema, edge semantics, hazards and CombatTester integration"

  This is an architecture-heavy task. INVESTIGATION AND PLANNING ONLY. Do not edit files yet.

  Read:
  1. The complete GitHub Issue #369.
  2. The architecture specialist contract.
  3. AGENTS.md, AGENT.MD, AGENT_RULES.md and docs/WORKFLOW.md.
  4. docs/ARCHITECTURE_STATUS.md and docs/modules/mapEditor.md.
  5. All canonical map types, persistence, validation, migration, adapters, runtime consumers and relevant tests.

  Investigate the actual implementation, not just documentation.

  Pay particular attention to:
  - Current BattleMap v1 structure and wall semantics.
  - Shared edge identity and deterministic reconciliation.
  - Movement and line-of-sight consumers.
  - Existing door state behavior.
  - Terrain and hazard ownership.
  - Serialization, persistence and legacy migration.
  - CombatTester hardcoded terrainMaps and canonical map loading.
  - Runtime CombatGrid compatibility.
  - Existing tests and canonical map fixtures.

  IMPORTANT:
  The documentation currently contradicts itself about how complete the BattleMap Editor is. Establish the real
  implementation status before proposing documentation changes.

  PLAN REQUIREMENTS:

  1. Describe the current architecture and actual data flow.
  2. Identify canonical ownership and mutation boundaries.
  3. Propose a versioned BattleMap schema, including four-direction edges.
  4. Explain how shared boundaries avoid duplicates or conflicting states.
  5. Propose a backward-compatible v1 migration strategy.
  6. Explain how structured hazards reach runtime without creating a second combat rules engine.
  7. Explain how CombatTester and runtime combat will consume the same canonical maps.
  8. Identify required specialist handoffs (architecture, gameplay, ruleset/data, UI and verification).
  9. Propose implementation phases in dependency order.
  10. List exact files likely to change and tests required.
  11. Identify unresolved design decisions that require Jaap's input.

  SAFETY:
  - Do not modify files.
  - Do not generate or rewrite map assets.
  - Do not invent damage values, conditions or D&D mechanics.
  - Do not change GitHub Issues or PRs.
  - Do not commit or push.
  - Do not merge.
  - Do not begin implementation until Jaap has reviewed the plan.

  Return a clear, practical implementation plan and wait for approval.

○ Thought for 1m 32s (The API directly handles JSON files within the specified directory. Examining the user prompt...)
● Ran 2 commands (git log · Invoke-RestMethod -U...)
● Explored 9 files (architecture-specialist.agent.md, ARCHITECTURE_STATUS.md, mapEditor.md, +6)
… 31 more actions (22 reads, 9 commands) …
● Explored 1 file (CombatGrid.tsx)
● Ran 3 commands (+2 · Select-String -Path "server.ts" -Pattern "combat-maps" -Context 2,20) (ctrl+o to expand)

   Architectural Investigation & Implementation Plan

  GitHub Issue #369: Establish Canonical BattleMap Schema, Edge Semantics, Hazards & CombatTester Integration

  │ Mode: Planning Only (--mode=plan)
  │ Target Branch: feat/369-canonical-battlemap
  │ Status: No files modified; awaiting Jaap's review.
  ──────
  Audit: BattleMap Editor Documentation vs. Actual Code Status

  An audit was conducted across documentation and implementation to resolve the contradiction between
  docs/modules/mapEditor.md and docs/ARCHITECTURE_STATUS.md:

  • docs/modules/mapEditor.md: Claims the editor is "fully implemented with a hardened, production-ready
architecture...
  All primary systems are fully operational, architecturally sound, and thoroughly tested."
  • docs/ARCHITECTURE_STATUS.md: Contradicts this, stating that tools are "scaffolding, not completed features.
  Agents must not mark Wall, Room, Door, Terrain, Object, Token, Layers, Inspector or Undo/Redo as implemented merely
  because a placeholder exists."
  • Verified Code Reality:
      1. The editor has a working React/Canvas architecture
      (src/components/devkit/BattleMapEditor/BattleMapEditor.tsx,
      src/components/devkit/BattleMapEditor/components/MapViewport.tsx,
      src/components/devkit/BattleMapEditor/rendering/renderMap.ts,
      src/components/devkit/BattleMapEditor/state/editorStore.ts).
      2. Command-based undo/redo is genuinely implemented for wall, room, terrain, object, token, label, and marker
      additions/removals.
      3. Wall and door snapping works geometrically via grid boundary lines (getWallSnap).
      4. The Critical Flaw: The authoring schema and runtime adapter are shallow:
          • Cells have no concept of directional boundary spines (North, East, South, West).
          • At runtime, src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts turns the
          underlying tile into cell.type = 'door', overwriting the underlying terrain (stone, grass, etc.) and
          treating an edge boundary as an occupied cell.
          • src/components/combat/CombatGrid.tsx does not render combatState.walls on canvas; it only renders filled
          tiles for cell.type === 'wall' | 'door', while consulting combatState.walls invisibly for movement/LoS.
          • Hazards, pits, and environmental effects do not exist in the schema at all.
          • src/components/devkit/CombatTester.tsx maintains a parallel hardcoded list of background PNGs
          (terrainMaps) that bypasses canonical map loading.

  • Resolution: The documentation in docs/modules/mapEditor.md overclaims production-readiness. It will be updated as
  part of this Issue to reflect that the editor is a functional authoring shell whose core spatial contracts (four-
  way spine edges, cell hazards, and unified runtime loading) are being established in Issue #369.
  ──────
  1. Current Architecture and Actual Data Flow

    [Authoring Surface]
    BattleMapEditor Canvas (MapViewport)
           ↓ (editorStore.ts / mapCommands.ts)
    [Persistence Layer]
    JSON serialization (public/assets/atlas/combat/combat_maps/*.json)
           ↓ (battleMapStorage.ts: validateBattleMap -> migrateBattleMap)
    [Adapter Boundary]
    battleMapToCombatGrid(battleMap)
           ↓
    [Runtime Game State]
    useGameStore.combatState:
      ├─ grid: TacticalCell[][] (flat cell array; doors overwrite cell type)
      ├─ walls: WallSegment[] (horizontal/vertical lines used for LoS and pathfinding)
      ├─ monsters: CombatMonster[] (resolved from Atlas)
      ├─ combatMapBackground: string
      └─ playerPos: { x, y } (from player token or entrance marker)
           ↓
    [Presentation & Execution]
    CombatGrid.tsx (canvas rendering, click handling, A* movement, LoS checks)
    CombatTester.tsx (DevKit testbed with hardcoded background selector)
  ──────
  2. Canonical Ownership and Mutation Boundaries

  1. Authored Map Invariants (Static Asset Boundary):
      • Authoritative source files live under public/assets/atlas/combat/combat_maps/.
      • Validated by validateBattleMap, migrated by migrateBattleMap, and served via /api/combat-maps.
      • The editor owns authoring data (metadata, dimensions, layers, labels, editor selection). It must never
      execute combat logic.
  2. Runtime Combat State (Dynamic Session Boundary):
      • useGameStore.combatState is the sole canonical owner of active combat execution (grid occupancy, active door
      open/closed status, initiative, monster HP).
      • src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts is the pure, unidirectional
      transformation boundary converting static BattleMap into runtime combat state.
  3. Ruleset & Mechanics Boundary:
      • Spatial hazard effects (e.g. fire surface, grease save) must be resolved by the combat engine and gameplay
      rules resolvers, not evaluated or calculated inside the editor.

  ──────
  3. Proposed Versioned BattleMap Schema (v2)

  To satisfy the four-direction boundary requirement without turning cells into walls, we transition BattleMap from
  version: 1 to version: 2:

    export type EdgeOrientation = 'horizontal' | 'vertical';
    export type EdgeBoundaryType =
      | 'wall'           // Full wall (blocks movement & vision)
      | 'low-wall'       // Half cover (blocks movement, allows vision)
      | 'door'           // Standard hinged door
      | 'secret-door'    // Concealed door
      | 'bars'           // Iron portcullis/grate (blocks movement, allows vision)
      | 'window'         // Glass/opening (blocks movement, allows vision)
      | 'chasm-edge';    // Drop-off/ledge

    export type DoorState = 'open' | 'closed' | 'locked';

    export interface MapEdge {
      id: string; // Deterministic spine key: e.g. "h:5,5" or "v:5,6"
      orientation: EdgeOrientation;
      x: number;
      y: number;
      type: EdgeBoundaryType;
      doorState?: DoorState;
      // Optional metadata for gameplay/ruleset inspection
      secretDC?: number;   // Perception DC to detect
      lockDC?: number;     // Thieves' Tools DC to pick
      keyId?: string;      // Key item required to unlock
    }

    export type HazardCategory = 'surface' | 'cloud' | 'pit' | 'trap';

    export interface CellHazard {
      id: string;
      category: HazardCategory;
      type: 'fire' | 'grease' | 'acid' | 'poison' | 'ice' | 'web' | 'pit' | 'spike';
      damageType?: 'fire' | 'acid' | 'poison' | 'piercing' | 'cold';
      trigger: 'on-enter' | 'on-turn-start' | 'on-turn-end';
      difficultTerrain?: boolean;
    }

    export interface TerrainCellV2 {
      x: number;
      y: number;
      type: string;             // 'stone' | 'wood' | 'grass' | 'water' | 'mud' | 'ice' | 'lava' | 'dirt'
      elevation?: number;       // Elevation in grid units (0 = base floor, -1 = pit, +1 = platform)
      movementCost?: number;    // 1 = normal, 2 = difficult terrain (calculated or authored)
      hazards?: CellHazard[];   // Structured environmental effects on this tile
    }

    export interface MapPortal {
      id: string;
      type: 'entrance' | 'exit' | 'transition';
      name: string;
      x: number;
      y: number;
      facing?: 'north' | 'east' | 'south' | 'west';
      targetMapId?: string;
    }

    export interface BattleMapV2 {
      version: 2;
      id: string;
      name: string;
      metadata: {
        description?: string;
        author?: string;
        createdAt: string;
        updatedAt: string;
        theme?: string;
        recommendedLevel?: string;
        environment?: string;
      };
      dimensions: {
        width: number;
        height: number;
      };
      grid: {
        type: 'square' | 'hex';
        cellSize: number;
        unit: 'ft' | 'm';
        scale: number;
        visible: boolean;
        snap: boolean;
      };
      background: {
        type: 'color' | 'texture' | 'image';
        value: string;
        opacity: number;
      };
      terrain: TerrainCellV2[];
      edges: MapEdge[];          // Authoritative four-direction boundary spines
      portals: MapPortal[];      // Explicit entrance and exit locations
      objects: MapObject[];
      tokens: MapToken[];
      labels: MapLabel[];
      markers: MapMarker[];
      fogOfWar?: FogDefinition;
      layers: MapLayer[];
    }
  ──────
  4. Shared Boundaries and Deterministic Edge Reconciliation

  In an orthogonal grid, cells share boundaries:

  • A horizontal edge at (x, y) sits along grid line y between x and x + 1. It is the North spine of cell (x, y) and
  the South spine of cell (x, y - 1).
  • A vertical edge at (x, y) sits along grid line x between y and y + 1. It is the West spine of cell (x, y) and the
  East spine of cell (x - 1, y).

  Deterministic Edge Key Scheme

  Every edge is keyed deterministically by its orientation and grid coordinate:

  • h:${x},${y} for horizontal spines
  • v:${x},${y} for vertical spines

  Reconciliation Guarantee:

  1. Single Source of Truth: Edges are stored in a canonical keyed array/map. Duplicate edges at the same
  orientation:x:y are rejected at the store and validator level.
  2. Directional Accessor Helper:
    export function getCellEdges(x: number, y: number, edgeMap: Map<string, MapEdge>) {
      return {
        north: edgeMap.get(`h:${x},${y}`),
        south: edgeMap.get(`h:${x},${y + 1}`),
        west:  edgeMap.get(`v:${x},${y}`),
        east:  edgeMap.get(`v:${x + 1},${y}`)
      };
    }

  3. Zero Inconsistency: When a door on h:5,5 is toggled open, both cell (5, 5) looking North and cell (5, 4) looking
  South immediately observe the exact same door state.
  ──────
  5. Backward-Compatible v1 Migration Strategy

  In src/components/devkit/BattleMapEditor/persistence/battleMapMigration.ts:

  1. Version Detection:
      • If data.version === 2, return immediately.
      • If data.version === 1:
          • Convert walls: WallSegment[] into edges: MapEdge[]:
              • Deterministic ID: ${w.orientation[0]}:${w.x},${w.y}.
              • Preserve type (wall, door, secret-door), orientation, and doorState.
              • Deduplicate by key if legacy data contained overlapping segments.
          • Convert terrain: TerrainCell[] into TerrainCellV2[]:
              • Preserve existing x, y, type.
              • Add default movementCost: (type === 'mud' || type === 'water') ? 2 : 1.
              • Initialize empty hazards: [].
          • Extract portals: MapPortal[] from markers of type 'entrance' | 'exit' and tokens of type 'player'.
          • Set version: 2.
      • If !data.version (legacy unversioned pre-v1 format), run legacy migration to v1 first, then run v1 to v2.

  ──────
  6. Hazard Integration Without Duplicating the Combat Engine

  • Authoring Duty (Editor): The editor only records the presence of a hazard:
      • e.g. { id: 'hz-1', category: 'surface', type: 'fire', trigger: 'on-enter', damageType: 'fire' }
      • It does not roll damage, prompt saving throws, or apply conditions.
  • Runtime Duty (Tactical Combat Engine):
      • src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts maps cell hazards into
      TacticalCell.hazards.
      • When a character or monster executes a move in src/store/useGameStore.ts / CombatGrid.tsx, the existing
      action/damage pipeline checks grid[y][x].hazards.
      • Triggering events (on-enter, on-turn-start) dispatch to the standard combat log and character damage resolver
      (takeDamage).
      • Difficult terrain directly doubles movement cost in getReachableCells and findPath.

  ──────
  7. Unified Map Loading in CombatTester & Runtime Combat

  1. Retire Parallel terrainMaps Array:
      • Remove the hardcoded 6-image terrainMaps array in src/components/devkit/CombatTester.tsx.
  2. Canonical Map Selection:
      • Make the server map selector the primary and only map picker.
      • Ship canonical authored maps in public/assets/atlas/combat/combat_maps/ for testing:
          • canonical_integration_map.json
          • fey_forest.json
          • dungeon_crypt.json

  3. Execution Parity:
      • Both CombatTester and the in-game deployment invoke the exact same function: battleMapToCombatGrid(battleMap).
      • This populates grid, walls, monsters, partySpawnPos, and background texture identically.

  ──────
  8. Specialist Handoffs

  • Architecture Specialist (Current): Owns data contracts, schemas, persistence, migration, and boundary isolation.
  • Gameplay Specialist: Owns runtime movement costs in findPath / getReachableCells, door interaction triggers, and
  combat hazard damage resolution on enter/turn.
  • Ruleset & Data Specialist: Ensures hazard damage types and conditions reference standard 2014/2024 ruleset
  constants without hardcoded drift.
  • UI Specialist: Owns visual rendering of edge boundaries and hazards on the canvas in both MapViewport and
  CombatGrid (rendering physical wall lines, door icons, and hazard overlays).
  • Verification Specialist: Authors automated regression tests verifying edge collision, LoS through open doors,
  schema validation, and migration integrity.
  ──────
  9. Proposed Implementation Phases

  1. Phase 1: Canonical Schema, Types & Edge Geometry Helpers
      • Update types/battleMap.ts to BattleMapV2, MapEdge, TerrainCellV2, CellHazard, and MapPortal.
      • Create edge coordinate utilities and directional accessors in geometry/coordinates.ts.
  2. Phase 2: Validation, Serialization & Migration
      • Update battleMapValidator.ts (enforce deterministic edge keys, dimension bounds).
      • Update battleMapMigration.ts (flawless v1 -> v2 migration preserving all existing maps).
      • Write comprehensive unit tests for schema validation and migration.
  3. Phase 3: Runtime Adapter & Combat Integration
      • Update battleMapToCombatGrid.ts to output v2 edges, hazard data, and correct door states without wiping cell
      terrain.
      • Update combatUtils.ts (isMoveBlockedByWalls, checkLoS, findPath) to consume v2 edge models.
      • Update useGameStore.toggleDoor to toggle the boundary edge rather than overwriting cell types.
  4. Phase 4: CombatTester & Editor Alignment
      • Refactor CombatTester.tsx to remove hardcoded terrainMaps in favor of canonical map loading.
      • Ensure public/assets/atlas/combat/combat_maps/*.json files are upgraded to v2.
      • Update renderMap.ts and CombatGrid.tsx to render edge walls and hazard markers.
  5. Phase 5: Documentation Synchronization & Full Verification
      • Align docs/modules/mapEditor.md and docs/ARCHITECTURE_STATUS.md.
      • Run npm test, npm run test:workflow, and tests/combat_integration.test.ts.

  ──────
  10. Files Likely to Change & Verification Required

  Files to Modify:

  • src/components/devkit/BattleMapEditor/types/battleMap.ts
  • src/components/devkit/BattleMapEditor/persistence/battleMapValidator.ts
  • src/components/devkit/BattleMapEditor/persistence/battleMapMigration.ts
  • src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts
  • src/components/devkit/BattleMapEditor/geometry/coordinates.ts
  • src/components/devkit/BattleMapEditor/geometry/lineOfSight.ts
  • src/components/devkit/BattleMapEditor/state/editorStore.ts
  • src/components/devkit/BattleMapEditor/rendering/renderMap.ts
  • src/components/devkit/CombatTester.tsx
  • src/components/combat/combatUtils.ts
  • src/components/combat/CombatGrid.tsx
  • src/store/useGameStore.ts
  • docs/modules/mapEditor.md
  • docs/ARCHITECTURE_STATUS.md
  • public/assets/atlas/combat/combat_maps/*.json

  Tests to Add/Update:

  • tests/battle_map_v2_schema.test.ts (unit tests for v2 validation, deterministic edge keys, v1->v2 migration)
  • tests/combat_integration.test.ts (updated for v2 edge semantics, door state preservation, and hazard translation)
  ──────
  11. Unresolved Design Decisions for Jaap

  1. Door Click Target:
      • In v1, clicking the cell toggles the door because the cell was stamped as type: 'door'.
      • In v2, the door is an edge. Should clicking anywhere in either of the two adjacent cells (within 5ft) toggle
      the door, or should interaction require clicking near the edge line/doorway sprite itself?
      (Recommendation: Clicking the doorway area or selecting either adjacent cell while adjacent triggers door
      interaction).
  2. Hazard Representation in the Canvas Viewport:
      • Should cell hazards be drawn as translucent colored overlays (e.g. orange for fire, green for acid/poison,
      white/blue for ice) with small indicator glyphs, or should they rely solely on painted terrain textures?
      (Recommendation: Translucent overlay with subtle border styling so hazards remain visually distinct from base
      floor textures).
  3. Canonical Fixture Scope for CombatTester:
      • Should we convert the 6 backgrounds currently in terrainMaps (fey_forest, dungeon_crypt, frozen_tundra,
      temple_ruins, abyssal_chasm, forgotten_oasis) into pre-authored canonical JSON battle maps shipped in the
      repository?
      (Recommendation: Yes, provide fully authored, minimal v2 JSON fixtures for each of these 6 themes so
      CombatTester immediately has rich test scenarios).

  ──────
  Awaiting Jaap's review and approval before proceeding with implementation.

────────────────────────────────────────────────────────────
> Refine the Issue #369 implementation plan before any code changes.

  The overall architecture and phased approach are approved, subject to these design constraints:

  1. **Edge coordinates**
     - Audit the existing `getWallSnap()` implementation and all legacy `WallSegment` coordinate conventions before
  defining the v1-to-v2 mapping.
     - Explicitly define valid horizontal and vertical edge coordinate ranges, including map boundaries.
     - Add tests proving that one shared edge is represented exactly once and is returned consistently from both
  adjacent cells.
     - Never assume legacy x/y coordinates already match the new spine coordinate convention.

  2. **Terrain and hazard mechanics**
     - Do not infer `movementCost: 2` for water or mud during migration.
     - Preserve authored terrain data without inventing gameplay mechanics.
     - Hazard data must remain structured and serializable, with a clear boundary to canonical gameplay resolvers.
     - Do not invent damage values, saving throw rules, conditions or trigger behavior.
     - Where applicable, use canonical mechanic references and parameters rather than embedding rule resolution inside
  the editor or adapter.

  3. **Portals and player tokens**
     - Migrate existing entrance and exit markers into the canonical portal representation.
     - Do not convert player tokens into portals.
     - Preserve player token positions and their existing spawn semantics.
     - Avoid duplicate or conflicting representations of entrances and exits.

  4. **CombatTester background selection**
     - Inspect every actual consumer of `terrainMaps`.
     - Distinguish background/theme selection from canonical BattleMap selection.
     - Remove parallel hardcoded map definitions where they duplicate canonical map loading.
     - Preserve independent background selection if it remains useful.
     - Do not create six complete BattleMaps merely because six background images exist.
     - Define the smallest set of canonical JSON fixtures needed to prove the shared map pipeline.

  5. **Edge types and scope**
     - Start with the edge types and door states genuinely required by the existing implementation and Issue #369.
     - Do not introduce unimplemented mechanics for bars, windows, chasm edges or other speculative edge types.
     - Preserve geometry needed by a future cover resolver without implementing the full cover system.

  6. **Schema and compatibility**
     - Reuse existing metadata, object, token, label, fog and layer types wherever possible.
     - Identify all consumers of the legacy `walls` property and document how they move to the canonical edge
  representation.
     - Ensure v2 data is still validated; unknown future schema versions must be rejected rather than silently
  accepted.
     - Preserve all existing canonical map data during migration.

  7. **Verification**
     - Include round-trip tests for existing canonical JSON maps.
     - Test shared edges, outer map boundaries, door state, migration, hazards, portals, player token positions and
  adapter output.
     - Verify actual package scripts before selecting the final test commands.

  Return the revised phased implementation plan, exact files and tests, and any remaining decisions that genuinely
  require product input.

  Planning only. Do not edit, create, delete, commit, push or modify any files or GitHub resources.

○ Thought for 1m 2s (`DevKit.tsx` imports from a modular directory, indicating potential architectural design. The...)
● Ran 4 commands, checked 2 tasks, killed 1 task (Get-Content public/assets/atlas/combat/combat_maps/untitled_battl...)
● Explored 1 file (task-247.log)
● Ran 5 commands, checked 2 tasks, killed 1 task (git grep "walls" src/ · git grep "BattleMapE...) (ctrl+o to expand)
▸ Thought for 9s

   Refined Architectural Implementation Plan

  GitHub Issue #369: Canonical BattleMap Schema, Edge Semantics, Hazards & CombatTester Integration

  │ Execution Contract: GitHub Issue #369
  │ Specialist Contract: .github/agents/architecture-specialist.agent.md
  │ Mode: Planning Only (--mode=plan) — Read-Only
  │ Implementation Branch: feat/369-canonical-battlemap
  ──────
  1. Edge Coordinates & Boundary Audit

  A. Auditing getWallSnap() & Legacy WallSegment

  In src/components/devkit/BattleMapEditor/geometry/coordinates.ts:

    // For a mouse click inside cell (cellX, cellY):
    if (minDist === distToTop)    return { x: cellX, y: cellY,     orientation: 'horizontal' };
    if (minDist === distToBottom) return { x: cellX, y: cellY + 1, orientation: 'horizontal' };
    if (minDist === distToLeft)   return { x: cellX, y: cellY,     orientation: 'vertical' };
    if (minDist === distToRight)  return { x: cellX + 1, y: cellY, orientation: 'vertical' };

  In src/components/combat/combatUtils.ts:

  • A horizontal wall at (x, y) is treated as a segment from (x, y) to (x + 1, y).
  • A vertical wall at (x, y) is treated as a segment from (x, y) to (x, y + 1).

  B. Explicit Valid Coordinate Ranges

  For a map of width W and height H, with cells x ∈ [0, W - 1] and y ∈ [0, H - 1]:

   Spine        │ Spine Line  │ Segment Span    │ Valid x Range │ Valid y Range │ Total       │ Outer Boundary
   Orientation  │             │                 │               │               │ Possible    │ Coordinates
                │             │                 │               │               │ Positions   │
  ──────────────┼─────────────┼─────────────────┼───────────────┼───────────────┼─────────────┼──────────────────────
   Horizontal   │ Grid line y │ from (x, y) to  │ 0 ≤ x ≤ W - 1 │ 0 ≤ y ≤ H     │ W × (H + 1) │ North border: y =
   (h)          │             │ (x + 1, y)      │               │               │             │ 0South border: y = H
   Vertical (v) │ Grid line x │ from (x, y) to  │ 0 ≤ x ≤ W     │ 0 ≤ y ≤ H - 1 │ (W + 1) × H │ West border: x =
                │             │ (x, y + 1)      │               │               │             │ 0East border: x = W

  C. Deterministic Edge ID & Shared Boundary Mathematical Proof

  Every edge is assigned a deterministic ID based on its orientation and anchor coordinate:

  • Horizontal: h:${x},${y}
  • Vertical: v:${x},${y}

  For any cell C(x, y) within the map bounds:

  • North spine: h:${x},${y}
  • South spine: h:${x},${y + 1}
  • West spine: v:${x},${y}
  • East spine: v:${x + 1},${y}

  Proof of Exact-Once Representation Across Shared Boundaries:

  1. Vertical Boundary between C(x, y) and East Neighbor C(x + 1, y):
      • East spine of C(x, y) is v:${x + 1},${y}.
      • West spine of C(x + 1, y) is v:${x + 1},${y}.
      • Both evaluate to the exact same string v:${x + 1},${y}.
  2. Horizontal Boundary between C(x, y) and South Neighbor C(x, y + 1):
      • South spine of C(x, y) is h:${x},${y + 1}.
      • North spine of C(x, y + 1) is h:${x},${y + 1}.
      • Both evaluate to the exact same string h:${x},${y + 1}.


  D. v1-to-v2 Edge Migration Mapping

  Legacy WallSegment objects specify { id, orientation, x, y, type, doorState }.

  • We do not assume legacy IDs match the spine scheme.
  • Each legacy segment is transformed by reading its orientation, x, and y:
    const prefix = wall.orientation === 'horizontal' ? 'h' : 'v';
    const edgeId = `${prefix}:${wall.x},${wall.y}`;

  • If duplicate legacy entries exist at the same coordinate/orientation, they are merged deterministically
  (preserving door properties if either entry was a door).
  ──────
  2. Terrain and Hazard Contracts

  A. Authored Terrain Invariants

  • Terrain cells retain authored properties: { x, y, type }.
  • Constraint Compliance: Migration must NOT infer movementCost: 2 or difficult terrain for water, mud, or any other
  terrain. Authored values are preserved as authored. If a cell does not explicitly specify a custom movementCost,
  the property is omitted.
  • The tactical combat engine evaluates movement penalties dynamically through its existing ruleset mechanisms
  rather than hardcoded static map data.

  B. Structured Hazard Schema

  Hazards are authored as pure declarative data:

    export type HazardCategory = 'surface' | 'cloud' | 'pit' | 'trap';

    export interface CellHazard {
      id: string;
      category: HazardCategory;
      type: string;             // e.g. 'fire', 'grease', 'acid', 'poison', 'ice', 'web', 'pit', 'spike'
      damageType?: string;      // Canonical reference: 'fire' | 'acid' | 'poison' | 'cold' | 'piercing'
      trigger?: 'on-enter' | 'on-turn-start' | 'on-turn-end';
    }

  • Boundary Guarantee: The editor and adapter never invent damage dice (e.g. 1d6), saving throw formulas (e.g. DC 13
  Dex), or condition durations.
  • Runtime Consumption: The adapter passes cell.hazards to TacticalCell. When a character moves into a cell or
  starts/ends a turn in combat, the tactical combat engine detects the hazard descriptor and resolves mechanics
  through the canonical ruleset domain.
  ──────
  3. Portals and Player Tokens

  A. Portals Representation

    export interface MapPortal {
      id: string;
      type: 'entrance' | 'exit';
      name: string;
      x: number;
      y: number;
      facing?: 'north' | 'east' | 'south' | 'west';
      description?: string;
    }

  B. Migration Rules

  1. Existing markers with type === 'entrance' | 'exit' migrate into portals: MapPortal[].
  2. Existing markers with other types (encounter, trap, clue) remain in markers: MapMarker[].
  3. Player Tokens: Tokens with type === 'player' remain strictly in tokens: MapToken[]. They are never converted
  into portals.
  4. Spawn Resolution Order in src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts:
      • If a player token (type === 'player') exists, its position defines the tactical partySpawnPos.
      • If no player token exists, the first entrance portal (type === 'entrance') provides the default partySpawnPos.
      • Player tokens do not create active combatant monster records.

  ──────
  4. CombatTester Background & Map Selection

  A. Consumer Audit of terrainMaps

  • Audit confirmed that src/components/devkit/CombatTester.tsx is the only consumer of terrainMaps in the entire
  repository.
  • It was used solely to populate a <select> that calls setCombatMapBackground(e.target.value). It does not load
  walls, terrain, or spawns.

  B. Refactored UI Architecture in CombatTester

  1. Primary Selector (BattleMap): The existing "Custom Map" dropdown is promoted to the primary selector labeled
  "BattleMap:". It fetches from /api/combat-maps and invokes the canonical loadBattleMapFromServer and
  battleMapToCombatGrid pipeline.
  2. Secondary Selector (Backdrop Override): The existing terrainMaps dropdown is retained but clearly relabeled as
  "Backdrop:" or "Theme Image:". It operates purely as a visual canvas background override.
  3. Canonical Fixtures: We do not generate 6 empty BattleMaps. The existing
  public/assets/atlas/combat/combat_maps/canonical_integration_map.json is upgraded to v2 to serve as the
  authoritative integration test fixture.
  ──────
  5. Bounded Edge Types & Cover Foundation

  To prevent speculative complexity, edge types and door states are strictly bounded to verified requirements:

    export type EdgeType = 'wall' | 'low-wall' | 'door' | 'secret-door';
    export type DoorState = 'open' | 'closed' | 'locked';

    export interface MapEdge {
      id: string;               // "h:5,5" or "v:5,6"
      orientation: 'horizontal' | 'vertical';
      x: number;
      y: number;
      type: EdgeType;
      doorState?: DoorState;    // defined for 'door' and 'secret-door'
    }

  • Collision & LoS Semantics:
      • 'wall': Blocks movement and Line-of-Sight.
      • 'low-wall': Blocks movement; allows Line-of-Sight (foundational for half cover in lineOfSight.ts).
      • 'door' (closed / locked): Blocks movement and Line-of-Sight.
      • 'door' (open): Allows movement and Line-of-Sight.
      • 'secret-door': Treated as 'wall' until discovered/opened.
  • No unneeded types (bars, window, chasm-edge) will be introduced.
  ──────
  6. Schema, Consumers of walls, & Backward Compatibility

  A. Versioned Schema (version: 2)

    export interface BattleMapV2 {
      version: 2;
      id: string;
      name: string;
      metadata: MapMetadata;
      dimensions: { width: number; height: number };
      grid: GridConfiguration;
      background: MapBackground;
      terrain: TerrainCell[];
      edges: MapEdge[];          // Replaces legacy walls array
      portals: MapPortal[];      // Migrated entrance/exit portals
      objects: MapObject[];
      tokens: MapToken[];
      labels: MapLabel[];
      markers: MapMarker[];
      fogOfWar?: FogDefinition;
      layers: MapLayer[];
    }

  B. Legacy walls Consumer Transition

   Consumer File                         │ Current Usage                    │ Updated v2 Usage
  ───────────────────────────────────────┼──────────────────────────────────┼────────────────────────────────────────
   src/components/devkit/BattleMapEditor │ Validates map.walls array        │ Validates map.edges array; verifies
   /persistence/battleMapValidator.ts    │                                  │ coordinates match orientation bounds;
                                         │                                  │ rejects duplicate keys; rejects
                                         │                                  │ unsupported versions
   src/components/devkit/BattleMapEditor │ Returns walls: map.walls, stamps │ Returns walls: map.edges (or edge
   /persistence/battleMapToCombatGrid.ts │ doors onto cells                 │ representation); stops overwriting
                                         │                                  │ cell terrain with doors
   src/components/combat/combatUtils.ts  │ isMoveBlockedByWalls, checkLoS   │ Consumes MapEdge (or boundary geometry
                                         │ iterate over walls               │ with orientation/coords/doorState)
   src/components/devkit/BattleMapEditor │ drawWallsAndDoors(rc, map.walls) │ drawEdges(rc, map.edges) rendering
   /rendering/renderMap.ts               │                                  │ physical lines and door markers
   src/components/devkit/BattleMapEditor │ addWall, removeWall, updateWall  │ addEdge, removeEdge, updateEdge using
   /state/editorStore.ts                 │                                  │ deterministic keys
   src/store/useGameStore.ts             │ toggleDoor(x, y)                 │ Toggles doorState on the corresponding
                                         │                                  │ edge boundary

  C. Strict Schema Version Validation

  In battleMapValidator.ts:

  • If map.version !== 1 && map.version !== 2, reject immediately with "Unsupported map schema version: ${map.
  version}".
  • Ensure v2 maps contain valid dimensions (≥ 4 × 4), valid edge coordinates, and required metadata.
  ──────
  7. Phased Implementation Plan

  │ Diagram exceeds terminal width (243 > 119 cols)
  │ Displayed as code block. Widen terminal to view inline.

    flowchart TD
        P1["Phase 1: Canonical Types & Edge Geometry"] --> P2["Phase 2: Validation, Migration & Unit Tests"]
        P2 --> P3["Phase 3: Runtime Adapter & Combat Integration"]
        P3 --> P4["Phase 4: CombatTester & Editor Alignment"]
        P4 --> P5["Phase 5: Documentation & Canonical Map Fixtures"]

  Phase 1: Canonical Types & Edge Geometry

  • Update src/components/devkit/BattleMapEditor/types/battleMap.ts:
      • Define BattleMapV2, MapEdge, EdgeType, DoorState, CellHazard, and MapPortal.
      • Maintain type compatibility aliases during migration where required.
  • Update src/components/devkit/BattleMapEditor/geometry/coordinates.ts:
      • Add getCellEdges(x, y, edgeMap) helper.
      • Add isValidEdgeCoordinate(orientation, x, y, width, height) validator.


  Phase 2: Validation, Migration & Unit Tests

  • Update src/components/devkit/BattleMapEditor/persistence/battleMapValidator.ts:
      • Reject unknown schema versions.
      • Validate edge coordinate bounds and enforce deterministic key formats (h:x,y, v:x,y).
  • Update src/components/devkit/BattleMapEditor/persistence/battleMapMigration.ts:
      • Implement lossless v1 -> v2 migration.
      • Convert walls to edges without duplicate keys.
      • Migrate entrance/exit markers to portals without converting player tokens.
      • Preserve terrain without inferred movement costs.
  • Create tests/battle_map_v2_schema.test.ts:
      • Test valid/invalid edge coordinate ranges, including outer borders (x = W, y = H).
      • Test that shared edges are represented once and accessed symmetrically from adjacent cells.
      • Test round-trip serialization and migration of existing canonical maps.


  Phase 3: Runtime Adapter & Combat Integration

  • Update src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts:
      • Map edges to runtime boundary segments.
      • Map cell.hazards to TacticalCell.hazards.
      • Stop stamping doors over terrain cells; preserve cell.type as the underlying floor/terrain.
      • Resolve partySpawnPos from player tokens first, falling back to entrance portals.
  • Update src/components/combat/combatUtils.ts:
      • Support low-wall LoS pass-through in checkLoS.
      • Ensure door crossing checks properly test boundaries between adjacent cells.
  • Update src/store/useGameStore.ts:
      • Update toggleDoor to toggle the boundary edge state without requiring a destructive cell type overwrite.


  Phase 4: CombatTester & Editor Alignment

  • Update src/components/devkit/CombatTester.tsx:
      • Promote map loader to "BattleMap:".
      • Relabel background selector to "Backdrop Image:".
  • Update src/components/devkit/BattleMapEditor/rendering/renderMap.ts:
      • Draw edge walls, low walls, and door state indicators.
  • Update src/components/devkit/BattleMapEditor/state/editorStore.ts:
      • Use deterministic edge keys for addEdge, removeEdge, updateEdge.


  Phase 5: Documentation & Canonical Map Fixtures

  • Upgrade public/assets/atlas/combat/combat_maps/canonical_integration_map.json to v2.
  • Update docs/modules/mapEditor.md and docs/ARCHITECTURE_STATUS.md to accurately document v2 edge semantics, portal
  separation, and real editor status.
  ──────
  8. Exact Files and Verification Commands

  Exact Files to Modify/Add:

  1. src/components/devkit/BattleMapEditor/types/battleMap.ts
  2. src/components/devkit/BattleMapEditor/geometry/coordinates.ts
  3. src/components/devkit/BattleMapEditor/persistence/battleMapValidator.ts
  4. src/components/devkit/BattleMapEditor/persistence/battleMapMigration.ts
  5. src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid.ts
  6. src/components/devkit/BattleMapEditor/state/editorStore.ts
  7. src/components/devkit/BattleMapEditor/rendering/renderMap.ts
  8. src/components/devkit/CombatTester.tsx
  9. src/components/combat/combatUtils.ts
  10. src/store/useGameStore.ts
  11. public/assets/atlas/combat/combat_maps/canonical_integration_map.json
  12. docs/modules/mapEditor.md
  13. docs/ARCHITECTURE_STATUS.md
  14. tests/combat_integration.test.ts (updated)
  15. tests/battle_map_v2_schema.test.ts (new)

  Verified Verification Commands:

  • bun test tests/combat_integration.test.ts
  • bun test tests/battle_map_v2_schema.test.ts
  • npm run test:workflow
  • npm run lint
  • npm run validate:assets
  • git diff --check
  ──────
  9. Remaining Product Decisions for Jaap

  1. Door Interaction in CombatGrid:
      • Now that a door is an edge rather than an entire cell, a player standing at (5, 5) wants to open the door at
      the North edge h:5,5 (between (5, 5) and (5, 4)).
      • Question: Should clicking either adjacent cell ((5, 5) or (5, 4)) while adjacent trigger the door toggle, or
      should clicking the doorway threshold/line directly trigger it?
      • Recommendation: Clicking either adjacent cell within 5ft range toggles the door, preserving seamless
      clickability on canvas without requiring micro-precision pixel clicks on a 2-pixel line.

  ──────
  This refined plan is complete and read-only. No files were modified. Ready for Jaap's approval to begin Phase 1.

> /config
  ⎿  Exited /config command

────────────────────────────────────────────────────────────
> Issue #369 is approved for implementation. Use the refined architectural plan from the preceding planning session as
  the implementation contract.

  Do not repeat the planning phase or redo the completed architecture audit.

  **Important: preserve the findings for future sessions.**

  Before changing implementation code:

  1. Inspect the existing documentation structure.
  2. Create a durable BattleMap v2 architecture/design document in the appropriate `docs/` location.
  3. Record the verified architecture audit, ownership boundaries, v2 schema decisions, edge coordinate conventions,
  migration rules, hazard boundaries, portal/token separation, CombatTester map/background distinction, scope
  restrictions and verification requirements.
  4. Link this document from `docs/modules/mapEditor.md` and `docs/ARCHITECTURE_STATUS.md`.
  5. Correct the inaccurate production-readiness claims immediately. Clearly distinguish existing working
  functionality, scaffolding and planned v2 functionality. Never describe unimplemented functionality as complete.

  The documentation must be committed as part of this Issue's implementation, not left in the chat or terminal session.

  Use the approved design decisions:
  - No inferred terrain movement costs or invented hazard mechanics.
  - Player tokens remain separate from portals.
  - Only entrance/exit markers migrate to portals.
  - Preserve independent backdrop selection while using canonical BattleMaps for map loading.
  - Keep edge types limited to the agreed scope.
  - Represent doors as edges, never by overwriting terrain cells.
  - Door interaction uses a generous edge-centered hitbox; the active character must be within 5 ft.
  - Preserve geometry for future cover resolution without implementing the full cover system.

  Then implement the refined plan in its agreed phases, keeping all work within Issue #369.

  Run the verified tests and checks. Update the documentation again to reflect the actual implementation and test
  results.

  One Issue, one implementation branch, one PR. No unrelated Atlas or Magic Items work. Do not invent gameplay rules or
  silently omit acceptance criteria.

  Jaap retains final review and merge authority.

○ Thought for 5m 35s (The `createAddWallCommand` function constructs a command object for adding a wall segment to...)
● Ran 2 commands (+1 · Get-ChildItem -Path docs/architecture -Name; Get-ChildItem -Path docs/systems -Name)
● Explored 1 file (MAP_SYSTEM_SPEC.md)
… 48 more actions (22 reads, 21 edits, 5 commands: 1 failed) …
● Explored 2 files (editorStore.ts, mapCommands.ts)
● Edited 1 file (mapCommands.ts) (ctrl+o to expand)

⚠ Individual quota reached. Please upgrade your subscription to increase your limits. Resets in 145h21m14s.
Error ID: 6abe02a2-1da1-43f7-983e-70dda655b310-430

 How's the CLI experience so far? Help us improve:
 [1] Good  [2] Fine  [3] Bad  [0] Skip
