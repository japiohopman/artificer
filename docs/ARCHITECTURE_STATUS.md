# Artificer Architecture Status

> Living snapshot for human developers and coding agents. Update this document when architecture changes materially.

## Current direction

Artificer is a React/TypeScript application with domain-oriented Zustand stores, Atlas-backed data, Canvas-based tactical rendering, and a DevKit for authoring/testing content.

The current architectural priority is to keep **authoring tools separate from runtime systems** while reusing the same domain models and geometry rules wherever possible.

## State ownership

- `useGameStore` — runtime game/combat state.
- `useUIStore` — UI/navigation state.
- `useWorldStore` — world/time/weather/discovery state.
- `useAtlasStore` — Atlas data and registries.
- Feature-local state — temporary editor/UI state that does not belong in global runtime stores.

Do not recreate the old monolithic store pattern.

## Tactical systems

`CombatGrid` is the runtime tactical representation. It is not the map-authoring editor.

The intended relationship is:

```text
BattleMapEditor
      ↓
BattleMap authoring data
      ↓
serializer / validator / adapter
      ↓
Combat runtime representation
      ↓
CombatGrid
```

The Battle Map Editor may contain authoring-only information such as DM notes, hidden objects, layers, generator metadata and editing state. Runtime combat should receive only the information it needs.

## Battle Map Editor

The editor now lives under:

```text
src/components/devkit/BattleMapEditor/
```

`BattleMapEditor.tsx` is the composition root. Supporting code belongs in the module's `components`, `state`, `types`, `tools`, `rendering`, `geometry`, `commands` and `persistence` areas as appropriate.

The current editor contains early UI/tool placeholders. These are **scaffolding, not completed features**. Agents must not mark Wall, Room, Door, Terrain, Object, Token, Layers, Inspector or Undo/Redo as implemented merely because a placeholder exists.

See `docs/modules/mapEditor.md` for the authoritative Battle Map Editor design.

## Geometry rule

Walls are represented as geometry between cells, not as ordinary blocked cells. This is required for consistent doors, line-of-sight, collision, pathfinding and future lighting/cover calculations.

## Agent rules

1. Inspect existing stores, services and runtime components before introducing new infrastructure.
2. Reuse existing Atlas/asset registries instead of creating parallel registries.
3. Do not move authoring state into global runtime stores without a documented reason.
4. Do not duplicate CombatGrid rules inside the editor.
5. Treat placeholder UI as incomplete functionality.
6. Update the relevant module documentation when a design decision changes.
7. Keep `docs/TASK_BOARD.md` focused on actual outstanding work.
8. Use `docs/PROGRESS.md` for project-level status, not speculative task lists.
