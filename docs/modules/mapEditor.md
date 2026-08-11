# Battle Map Editor

The Battle Map Editor is the Artificer DevKit authoring environment for creating tactical encounter maps. It is an **authoring module**, not a second combat engine.

## Status

The editor is currently under active construction. Its modular foundation exists under:

```text
src/components/devkit/BattleMapEditor/
```

The UI currently contains early tool/component scaffolding. Wall, Room, Door, Terrain, Object, Token, Layers, Inspector and Undo/Redo are **not considered implemented until their underlying behavior is functional and tested**.

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
├── tools/
├── hooks/
├── state/
├── rendering/
├── geometry/
├── commands/
├── persistence/
├── types/
└── utils/
```

`BattleMapEditor.tsx` is the composition root. Rendering, editor state, tools, geometry, persistence and history should not accumulate in the root component.

## Core Authoring Model

A battle map is a versioned data structure rather than merely an image or collection of UI state.

The model should contain, at minimum:

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

A wall segment should have a stable ID, orientation, grid position and type. Doors belong to wall geometry and may have states such as open, closed, locked or secret.

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

Layers should support visibility and locking. Opacity and ordering may also be exposed where useful.

## Viewport

The map workspace is canvas-first.

Required behaviour:

- mouse-wheel zoom
- zoom around cursor position
- middle-mouse panning
- space + drag panning
- dedicated pan tool
- fit map to viewport
- reset zoom
- grid snapping

The canvas should render map primitives directly rather than creating a React component for every grid cell.

## Tools

The editor is intended to support at least:

- Select
- Pan
- Wall
- Room
- Door
- Terrain/Brush
- Object/Stamp
- Token/Spawn
- Measure
- Text/Label
- Eraser

Selection must support moving and deleting entities and, where applicable, resizing, rotating, duplicating and multi-select.

## Tactical Authoring

Map authoring must understand tactical concepts without becoming the combat runtime.

Supported concepts include:

- player spawn
- NPC spawn
- enemy/monster spawn
- encounter markers
- entrances
- exits
- doors
- blocking walls
- terrain
- fog of war
- measurements
- DM-only notes

Monster placements should be able to reference Artificer Atlas data rather than storing only a hard-coded display string.

## Grid

The initial target is a square tactical grid using Artificer's existing spatial conventions, with 5 ft per cell as the primary scale.

The editor should be designed so grid configuration can support square, hex, none, configurable cell size and configurable display/snap behaviour.

The runtime adapter must preserve the spatial conventions required by `CombatGrid`.

## Selection and Inspector

Selection is centralized rather than implemented independently by each tool.

The Inspector displays properties for the selected entity, such as position, rotation, scale, layer, asset, terrain type, door state, token/monster reference, label properties and lock state.

## Undo / Redo

Editor mutations must be undoable.

The target implementation uses an editor command/history abstraction so actions such as drawing/removing walls, painting terrain, moving/deleting objects, adding doors, rotating/scaling objects and resizing a map can be reversed.

## Asset Integration

The editor should reuse Artificer's existing asset and Atlas infrastructure. Do not introduce a second asset registry solely for the editor.

The planned Asset Panel supports search, categories, tags where available, previews, drag and drop and reusable stamps/props.

## Generator

A lightweight procedural generator is planned rather than a large procedural-generation engine.

Initial generator targets:

- dungeon
- rooms
- corridors
- cave

Generator settings should include dimensions, room count/size, corridor width and a persisted random seed so generated maps are reproducible.

## Persistence and Export

The native map format should be a versioned JSON document. The persistence layer should provide serialization, deserialization, schema validation, migration/version handling and import/export.

The editor should eventually support a native battle-map file, JSON export, rendered image export and a runtime-compatible representation.

Persistence must be isolated behind a service/adapter rather than scattered storage calls throughout UI components.

## Combat Integration

The editor should expose an adapter such as:

```text
persistence/battleMapToCombatGrid.ts
```

Its responsibility is to translate authoring data into the runtime representation required by the tactical combat engine.

The editor should not duplicate movement, initiative, action economy or other combat rules.

## Geometry

Geometry utilities should be independent of React UI and testable in isolation.

Planned responsibilities include coordinate conversion, snapping, bounds, hit testing, wall intersection, line of sight, distance/measurement and cover geometry.

Cover calculations should use actual wall/door geometry rather than the prototype's simple blocked-cell ratio.

## Fog of War

Fog of War is an explicit map layer. The authoring model should distinguish at least hidden, revealed and explored states.

## Performance

The map canvas should remain Canvas-based for high-frequency rendering such as grid, terrain, walls, doors, fog, selection highlights and measurement overlays.

React should primarily manage editor UI such as toolbars, panels, inspectors, dialogs and other controls.

Large maps must not create a React component per grid cell.

## Testing

Important test areas include:

- coordinate conversion
- snapping
- wall geometry
- door placement
- line of sight
- cover geometry
- map serialization/deserialization
- validation
- map resizing
- undo/redo
- runtime conversion

At least one end-to-end flow should cover creating a map, editing it, undo/redo and exporting/saving it.

## Development Phases

### Phase 1 — Architecture

Create module boundaries, types, state model and persistence schema.

### Phase 2 — Canvas Engine

Implement viewport, zoom, pan, coordinate conversion, grid and snapping.

### Phase 3 — Core Tools

Implement select, wall, room, door, terrain, eraser and pan.

### Phase 4 — Objects

Implement asset browsing, placement, move, rotate, scale, duplicate and locking.

### Phase 5 — Layers and Inspector

Implement layer management, selection and property inspection.

### Phase 6 — History

Implement robust undo/redo.

### Phase 7 — Runtime Integration

Implement the BattleMap-to-CombatGrid adapter and verify compatibility with tactical combat.

### Phase 8 — Advanced DM Features

Add fog of war, spawn points, encounter markers, labels, lighting, advanced LoS/cover, procedural generation and additional export formats.

## Design Principles

1. **Canvas first.** The map is the primary workspace.
2. **Authoring data is separate from runtime combat state.**
3. **Do not create a second combat engine.**
4. **Keep the root component small.**
5. **Prefer pure geometry and serialization utilities over UI-bound logic.**
6. **Reuse Artificer's existing Atlas, asset and combat infrastructure.**
7. **Every meaningful edit should be undoable.**
8. **Persist explicit, versioned data.**
9. **Do not model walls as ordinary blocked cells.**
10. **Design for large maps and future runtime features from the beginning.**
