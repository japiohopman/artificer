# Battle Map Editor

The Battle Map Editor is the Artificer DevKit authoring environment for creating tactical encounter maps. It is an **authoring module**, not a second combat engine.

## Status

The editor has a modular architecture and functional foundations for walls, rooms, doors, terrain painting, objects/stamps, spawn tokens, layers, inspection, validation, persistence isolation and command-based Undo/Redo. The current v1.1 hardening work focuses on UX, persistent combat-map authoring, shared DevKit infrastructure and tighter CombatTester/runtime integration.

The module lives under:

```text
src/components/devkit/BattleMapEditor/
```

Status terminology used by this document:

- **Implemented** — working behavior exists and has been verified.
- **In progress** — implementation is actively being developed.
- **Scaffolded** — structure/UI exists but behavior is incomplete.
- **Planned** — design exists but implementation has not started.

## Architecture

```text
BattleMapEditor
      ↓
BattleMap authoring data
      ↓
validation / serialization / persistence
      ↓
BattleMap loader / Combat adapter
      ↓
Combat runtime
      ↓
CombatGrid
```

The editor owns **authoring data**. Runtime combat state remains owned by the tactical combat systems. Do not create a parallel combat engine inside the editor.

## Module Structure

```text
src/components/devkit/BattleMapEditor/
├── BattleMapEditor.tsx
├── index.ts
├── components/
├── tools/
├── state/
├── commands/
├── rendering/
├── geometry/
├── persistence/
├── types/
└── utils/
```

`BattleMapEditor.tsx` is the composition root. Rendering, editor state, tools, geometry, persistence and history belong in dedicated module areas rather than being accumulated in the root component.

## Core Authoring Model

A battle map is a versioned data structure rather than merely an image or collection of UI state.

The model contains, where applicable:

- map metadata
- dimensions
- grid configuration
- background/terrain imagery
- terrain
- rooms/floors
- walls
- doors
- objects/assets
- tokens/spawn points
- labels
- lighting metadata
- fog of war metadata
- entrances and exits
- ordered layers
- generator metadata

Use stable IDs for persisted entities. Runtime `Map`/`Set` collections may be used internally, but persistence must use explicit serializable structures.

## Walls and Doors

Walls are **segments between cells**, not blocked cells themselves.

```text
      cell
   ┌───────┐
   │       │
wall      wall
   │       │
   └───────┘
      wall
```

A wall segment has a stable ID, orientation, grid position and type. Doors belong to wall geometry and support states such as open, closed, or locked.

This representation is required for reliable line of sight, collision, pathfinding, door interaction, cover calculations, future lighting and map export.

**Runtime rule:** `CombatGrid` must consume wall boundaries using the same geometry semantics. A wall must not be interpreted as an entire blocked cell.

## Layers

Initial layers:

1. Background
2. Terrain
3. Rooms/Floors
4. Walls
5. Doors
6. Objects
7. Lighting
8. Fog of War
9. Tokens
10. Labels
11. DM Notes

Layers support visibility and locking. Opacity and ordering may also be exposed where useful.

## Viewport and Input

The map workspace is canvas-first and navigation-first.

Supported behavior:

- **Pan is the default tool** when the editor opens.
- mouse-wheel zoom around cursor position
- middle-mouse panning
- space + drag panning
- dedicated Pan tool
- fit map to viewport
- reset zoom
- grid snapping

The right mouse button is a deliberate editor interaction and must not fall through to the browser context menu during map interaction.

Right-click behavior is context-sensitive:

- selected entity → entity actions such as Edit, Duplicate, Delete, Layer, Lock/Unlock and Properties
- empty map → map actions such as Create Room, Add Object, Add Token, Paste, Select All and Map Properties

Right-click interaction belongs to the editor's interaction layer and must remain compatible with pan, selection and active tools.

The canvas renders map primitives directly rather than creating a React component for every grid cell.

## Tools

The editor supports or is implementing:

- Select
- Pan
- Wall
- Room (atomic wall and floor placement)
- Door
- Terrain/Brush (continuous drawing and erasing grouped into atomic undo steps)
- Object/Stamp
- Token/Spawn
- Measure
- Text/Label
- Eraser

Tool-specific pointer behavior should live in the `tools/` interaction layer. `MapViewport` should primarily translate pointer input into map coordinates and dispatch interaction rather than accumulating every tool's behavior.

## Editor Layout

The intended DM workflow uses three primary zones:

```text
┌──────────────────────────────────────────────────────────┐
│ File  Edit  View  Map  Tools                         ... │
├────────────┬───────────────────────────────┬─────────────┤
│            │                               │             │
│  EXPLORER  │                               │  INSPECTOR  │
│            │          BATTLE MAP           │             │
│            │                               │             │
│            │                               │             │
├────────────┴───────────────────────────────┴─────────────┤
│ Pan • Grid • Snap • X:12 Y:08             Zoom 100%      │
└──────────────────────────────────────────────────────────┘
```

The canvas remains the dominant area. The left Explorer is intended to unify maps, assets and Atlas access; the right Inspector handles selected entity properties; the bottom status area exposes coordinates, zoom and snap state.

## File and Map Workflow

Map/file actions should be grouped under a coherent File/Maps menu rather than occupying the primary toolbar individually.

Recommended actions:

```text
File
├── New Map
├── Open Map
├── Save
├── Save As
├── Import JSON
├── Export JSON
└── Delete Map
```

The editor should expose a clear dirty/modified state before saving.

## Persistence

The native map format is a versioned JSON document. Serialization, deserialization, validation, migrations and storage are isolated under `persistence/`.

Combat maps are **authoring assets**, not player save-game state.

The intended permanent authoring location is:

```text
public/assets/atlas/combat/combat_maps/
```

Because the browser cannot directly overwrite repository files, persistent authoring requires the project's development/server write boundary or an equivalent controlled persistence service. Do not replace localStorage with direct browser filesystem assumptions.

The intended flow is:

```text
BattleMapEditor
      ↓
BattleMap persistence service
      ↓
DevKit development/API write boundary
      ↓
public/assets/atlas/combat/combat_maps/*.json
```

Until that repository-backed write path is implemented and verified, local development storage/import/export must be treated as transitional rather than canonical permanent map storage.

## CombatTester and Runtime Integration

`CombatTester` must consume the same BattleMap definition and loading path as the editor rather than maintaining a second map representation.

```text
combat_maps/*.json
      ↓
BattleMap Loader
      ↓
BattleMap
   ↙       ↘
Editor    Combat Adapter
             ↓
        CombatGrid/runtime
```

The adapter `persistence/battleMapToCombatGrid.ts` translates authoring data into the runtime representation required by the tactical combat engine.

The editor must not directly patch unrelated combat stores. A deliberate `Test Map`/`Deploy to Combat` action may invoke the adapter/loader boundary, but authoring and combat state remain separate concerns.

## Tactical Authoring

Supported concepts include:

- player spawn
- enemy/monster spawn
- encounter markers
- entrances
- exits
- doors
- blocking walls
- terrain
- measurements

Monster placements reference Artificer Atlas data rather than embedding a second hardcoded Bestiary.

A token should store a stable Atlas reference where appropriate, for example:

```json
{
  "id": "token-42",
  "type": "monster",
  "atlasId": "goblin",
  "position": { "x": 4, "y": 7 }
}
```

The Atlas remains the canonical source for creature definitions.

## Atlas and Asset Integration

The editor reuses Artificer's existing Atlas and asset infrastructure.

Do not create hardcoded creature/bestiary lists inside BattleMapEditor when canonical Atlas data already exists. Relevant creature/enemy data is under the existing Atlas asset hierarchy, including `public/assets/atlas/enemies_categories/`.

The Explorer/Asset UI should resolve canonical assets and references rather than duplicating domain definitions.

## Icons

Use the existing Artificer icon registry under `public/assets/icons/svg/` before introducing new icon assets or another icon library.

Editor actions to map against the existing registry include:

- Pan
- Select
- Wall
- Room
- Door
- Terrain
- Object
- Token
- Measure
- Eraser
- Layers
- Grid
- Snap
- Undo
- Redo
- Save
- Open
- New
- Delete

Only add a new icon when no suitable existing Artificer icon exists.

## Shared DevKit Infrastructure

Common editor capabilities should be reusable across DevKit modules, but **shared tooling must not imply shared domain state**.

Examples of potential shared infrastructure:

- Undo/Redo command/history primitives
- ColorPicker
- ContextMenu
- File/Maps menu primitives
- AssetBrowser
- Search
- Inspector primitives
- keyboard shortcut handling
- icon helpers

Each editor keeps its own domain history and feature-local state. A BattleMap undo action must never undo an Audio or World editor action.

See `docs/systems/DEVKIT_SHARED_TOOLS.md`.

## Selection and Inspector

Selection is centralized rather than implemented independently by each tool.

The Inspector displays properties for the selected entity, such as position, rotation, scale, layer, asset, terrain type, door state, token/monster reference and lock state.

## Undo / Redo

Editor mutations use command-based history rather than storing complete BattleMap snapshots for every action.

Reversible actions include drawing/removing walls, painting terrain, placing/moving/deleting stamps and tokens, adding room cells/walls and resizing the map.

Continuous terrain brush draws/erases must be grouped into one logical transaction so one user gesture produces one meaningful undo step.

## Grid

The target is a square tactical grid using Artificer's existing spatial conventions, with 5 ft per cell as the primary scale.

The adapter preserves the spatial conventions required by `CombatGrid`.

## Geometry

Geometry utilities are independent of React UI and testable in isolation (coordinate conversion, snapping, bounds, hit testing, wall intersection, line of sight, distance/measurement and cover geometry).

## Fog of War

Fog of War is an explicit map layer distinguishing hidden, revealed and explored states where implemented.

## Performance

The map canvas is Canvas-based for high-frequency rendering such as grid, terrain, walls, doors, fog, selection highlights and measurement overlays.

React primarily manages editor UI such as toolbars, panels, inspectors, dialogs and other controls.

Large maps do not create a React component per grid cell.

## Testing

Regression coverage should include coordinate conversion, snapping, wall geometry, door placement, line of sight, map serialization, validation, command-based Undo/Redo, terrain brush transactions, persistence loading and CombatTester integration as those paths become canonical.
