# Artificer Architecture Status

> Living snapshot for human developers and coding agents. Update this document when architecture changes materially.

## Current direction

Artificer is a React/TypeScript application with domain-oriented Zustand stores, Atlas-backed data, Canvas-based tactical rendering, and a DevKit for authoring/testing content.

The current architectural priority is to keep **authoring tools separate from runtime systems** while reusing the same domain models and geometry rules wherever possible.

## State ownership & Ruleset Context

- `useGameStore` — runtime game/combat state and canonical campaign ruleset context (`ruleset: '2014' | '2024'`).
- `useUIStore` — UI/navigation state.
- `useWorldStore` — world/time/weather/discovery state.
- `useAtlasStore` — Atlas data and registries.
- Feature-local state — temporary editor/UI state that does not belong in global runtime stores.

### Ruleset Context Ownership Contract

- **Canonical Ruleset Owner:** `useGameStore` holds the single canonical ruleset identifier (`'2014'` or `'2024'`).
- **Canonical Resolution Boundary:** `getActiveRulesetContext(explicitRuleset?)` and `getRulesetVersionFolder(explicitRuleset?)` in `src/services/storageService.ts` form the single resolution boundary.
- **Scope Proven (Foundation Pass):** Representative loaders (`fetchEquipmentData`, `fetchMonsterData`, `atlasService.loadEquipment`, `atlasService.loadEnemy`) resolve versioned Atlas content (`/14/` vs `/24/`) through this boundary without hardcoded guesses.
- **Character Persistence Relationship:** `Character.ruleset` remains saved character metadata. Loading character saves into slots does not alter the active global game ruleset. Activating a character session (`setActiveCharacter` / `setMainCharacter`) explicitly synchronizes `useGameStore.ruleset` to the character's ruleset.
- **Remaining Downstream Work:** Other rules-sensitive systems (classes, species, subraces, backgrounds, feats, spells, conditions, feature rulesets) remain to be audited and migrated to consume this canonical boundary in subsequent focused tasks. This foundation pass does NOT claim universal downstream adoption.

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
