# Battle Map Editor

The Battle Map Editor is the Artificer DevKit authoring environment for creating tactical encounter maps. It is an **authoring module**, not a second combat engine.

## Status

The Battle Map Editor is fully implemented with a hardened, production-ready architecture. The modular components reside under:

```text
src/components/devkit/BattleMapEditor/
```

All primary systems (Walls, Rooms, Doors, Terrain painting, Stamp objects, Spawn tokens, Layers, Property inspector, and Command-based Undo/Redo) are fully operational, architecturally sound, and thoroughly tested.

## Architecture

```text
BattleMapEditor
      ↓
Battle Map Definition
      ↓
validation / persistence
      ↓
Map Loader / Adapter
      ↓
Combat State
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
│   ├── EditorToolbar.tsx
│   ├── InspectorPanel.tsx
│   ├── LayerPanel.tsx
│   ├── MapViewport.tsx
│   └── ToolPalette.tsx
├── tools/
│   ├── toolDispatcher.ts
│   └── toolHandlers.ts
├── state/
│   ├── editorDefaults.ts
│   └── editorStore.ts
├── commands/
│   ├── command.ts
│   └── mapCommands.ts
├── rendering/
│   └── renderMap.ts
├── geometry/
│   ├── coordinates.ts
│   ├── hitTesting.ts
│   └── lineOfSight.ts
├── persistence/
│   ├── battleMapMigration.ts
│   ├── battleMapSerializer.ts
│   ├── battleMapStorage.ts
│   ├── battleMapToCombatGrid.ts
│   └── battleMapValidator.ts
├── types/
│   └── battleMap.ts
└── utils/
```

`BattleMapEditor.tsx` is the composition root. Rendering, editor state, tools, geometry, persistence and history are completely separated into dedicated, decoupled directories.

## Core Authoring Model

A battle map is a versioned data structure rather than merely an image or collection of UI state.

The model contains:

- map metadata
- dimensions
- grid configuration
- background
- terrain
- rooms/floors
- walls
- doors
- objects/assets
- tokens/spawn points
- labels
- lighting
- fog of war
- entrances and exits
- ordered layers
- generator metadata where applicable

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

## Viewport

The map workspace is canvas-first.

Supported behavior:
- mouse-wheel zoom around cursor position
- middle-mouse panning
- space + drag panning
- dedicated pan tool
- fit map to viewport
- reset zoom
- grid snapping

The canvas renders map primitives directly rather than creating a React component for every grid cell.

## Tools

The editor supports:
- Select
- Pan
- Wall
- Room (Atomic wall and floor placement)
- Door
- Terrain/Brush (Continuous drawing and erasing grouped in atomic undo steps)
- Object/Stamp
- Token/Spawn
- Measure
- Text/Label
- Eraser

Selection supports moving and deleting entities.

## Tactical Authoring

Map authoring understands tactical concepts without becoming the combat runtime.

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

Monster placements reference Artificer Atlas data.

## Grid

The target is a square tactical grid using Artificer's existing spatial conventions, with 5 ft per cell as the primary scale.

The adapter preserves the spatial conventions required by `CombatGrid`.

## Selection and Inspector

Selection is centralized rather than implemented independently by each tool.

The Inspector displays properties for the selected entity, such as position, rotation, scale, layer, asset, terrain type, door state, token/monster reference, and lock state.

## Undo / Redo

Editor mutations are fully undoable using an elegant **Command Pattern** history queue (`pastCommands` and `futureCommands`).

Reversible actions include drawing/removing walls, painting terrain (as continuous brush strokes), placing/moving/deleting stamps and tokens, adding room cells/walls, and resizing the map.

## Asset Integration

The editor reuses Artificer's existing asset and Atlas infrastructure.

The Asset Panel supports search, categories, previews, and reusable stamps/props.

## Persistence and Export

The native map format is a versioned JSON document. The persistence layer is completely isolated under `persistence/` providing serialization, deserialization, schema validation, legacy migrations, and file import/export.

The UI components call only clean, isolated save/load/import/export routines.

## Combat Integration

The adapter `persistence/battleMapToCombatGrid.ts` translates authoring data into the runtime representation required by the tactical combat engine.

The editor does not duplicate movement, initiative, action economy or other combat rules.

## Geometry

Geometry utilities are independent of React UI and testable in isolation (coordinate conversion, snapping, bounds, hit testing, wall intersection, line of sight, distance/measurement and cover geometry).

## Fog of War

Fog of War is an explicit map layer distinguishing hidden, revealed and explored states.

## Performance

The map canvas is Canvas-based for high-frequency rendering such as grid, terrain, walls, doors, fog, selection highlights and measurement overlays.

React primarily manages editor UI such as toolbars, panels, inspectors, dialogs and other controls.

Large maps do not create a React component per grid cell.

## Testing

Verified test areas include coordinate conversion, snapping, wall geometry, door placement, line of sight, map serialization, validation, and command-based Undo/Redo.
