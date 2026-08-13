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

### Wall geometry is canonical

Walls are **segments/boundaries between cells**, not full blocked cells. This semantic must be shared by the BattleMap model, geometry utilities, CombatGrid adapter and tactical runtime.

```text
cell A | wall boundary | cell B
```

This is required for consistent doors, line-of-sight, collision, pathfinding, cover and future lighting calculations.

## Battle Map Editor

The editor lives under:

```text
src/components/devkit/BattleMapEditor/
```

`BattleMapEditor.tsx` is the composition root. Supporting code belongs in the module's `components`, `state`, `types`, `tools`, `rendering`, `geometry`, `commands` and `persistence` areas as appropriate.

The editor has functional foundations for authoring tools, persistence isolation, validation and command-based history. New work should harden the authoring workflow rather than recreate the module.

The intended DM interaction model is canvas-first with three primary areas:

```text
Explorer | Battle Map | Inspector
```

Pan is the default navigation tool. Right-click is an intentional context interaction and should be handled by an editor context-action layer rather than allowing the browser context menu to dominate map interaction.

## Battle Map persistence

Battle maps are **authoring assets**, not player save-game state.

The intended permanent authoring location is:

```text
public/assets/atlas/combat/combat_maps/*.json
```

Repository-backed persistence requires a controlled development/server write boundary because browser code cannot directly overwrite files in `public/`.

The canonical direction is:

```text
BattleMapEditor
      ↓
BattleMap persistence service
      ↓
DevKit development/API write boundary
      ↓
combat_maps/*.json
```

Until that path is implemented and verified, local development storage/import/export should not be described as permanent repository persistence.

## Atlas ownership

Atlas remains the canonical source for creatures, enemies and other reusable domain entities.

BattleMap tokens should store stable Atlas references where appropriate rather than duplicating complete creature definitions.

Do not create hardcoded Bestiary lists inside editor modules when canonical Atlas data already exists.

## Shared DevKit tooling

Common editor capabilities may be shared through reusable infrastructure:

- Undo/Redo command/history primitives
- ColorPicker
- ContextMenu
- File/Maps menu primitives
- AssetBrowser
- Search
- Inspector primitives
- keyboard shortcut handling
- icon helpers

**Shared infrastructure does not mean shared domain state.** Each editor keeps its own history, selection and editor-local state unless a documented cross-module owner exists.

See `docs/systems/DEVKIT_SHARED_TOOLS.md`.

## Agent rules

1. Inspect existing stores, services and runtime components before introducing new infrastructure.
2. Reuse existing Atlas/asset registries instead of creating parallel registries.
3. Do not move authoring state into global runtime stores without a documented reason.
4. Do not duplicate CombatGrid rules inside the editor.
5. Treat placeholder UI as incomplete functionality.
6. Update the relevant module documentation when a design decision changes.
7. Keep `docs/TASK_BOARD.md` focused on actual outstanding work.
8. Use `docs/PROGRESS.md` for project-level status, not speculative task lists.
9. Shared DevKit tooling must not merge unrelated domain histories or state.
10. When a browser-only implementation cannot perform repository persistence, use the existing server/development boundary rather than inventing direct filesystem access.
