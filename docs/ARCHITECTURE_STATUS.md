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
- `useInventoryStore` — domain command & controller layer for party inventory, equip/unequip, and transfers operating directly against canonical character state (`useCharacterStore`).
- Feature-local state — temporary editor/UI state that does not belong in global runtime stores.

### Ruleset Context Ownership Contract

- **Canonical Ruleset Owner:** `useGameStore` holds the single canonical ruleset identifier (`'2014'` or `'2024'`).
- **Canonical Resolution Boundary:** `getActiveRulesetContext(explicitRuleset?)` and `getRulesetVersionFolder(explicitRuleset?)` in `src/services/storageService.ts` form the single resolution boundary.
- **Scope Proven (Downstream Integration v1 Pass):**
  - Equipment: `fetchEquipmentData` & `atlasService.loadEquipment`
  - Monsters: `fetchMonsterData` & `atlasService.loadEnemy`
  - Feats: `fetchFeatData` & `atlasService.loadFeat` (resolving `/feats/json/14/` vs `/24/` subcategories)
  - Class Levels: `fetchClassLevels` & `atlasService.loadLevelData` (resolving `/class/levels/14/` vs `/24/`)
  - Spells: `fetchSpellData` & `atlasService.loadSpell` (resolving versioned subpaths)
- **Ruleset-Neutral / Inherited Audit:** Species, Subraces, Backgrounds, Alignments, Languages, and Features are audited; their data structures remain ruleset-neutral or inherit resolution from parent class/equipment context, attaching truthful `rulesetContext` metadata upon resolution.
- **Character Persistence Relationship:** `Character.ruleset` remains saved character metadata. Loading character saves into slots does not alter the active global game ruleset. Activating a character session (`setActiveCharacter` / `setMainCharacter`) explicitly synchronizes `useGameStore.ruleset` to the character's ruleset.

Do not recreate the old monolithic store pattern.

## Tactical systems

`CombatGrid` is the runtime tactical representation. It is not the map-authoring editor.

The integration relationship is established:

```text
BattleMapEditor
      ↓
BattleMap authoring JSON (public/assets/atlas/combat/combat_maps/)
      ↓
loader (battleMapStorage.ts)
      ↓
adapter (battleMapToCombatGrid.ts)
      ↓
CombatTester / runtime combatState
      ↓
CombatGrid
```

### Integration & Boundary Rules
- **Authoring Source:** `public/assets/atlas/combat/combat_maps/` holds canonical JSON authoring files.
- **Loader Ownership:** `battleMapStorage.ts` owns server map fetching, validation, and migration.
- **Adapter Ownership:** `battleMapToCombatGrid.ts` converts authoring data into runtime `TacticalCell[][]` grid, monster references, background, and player entry points (`partySpawnPos`).
- **Wall Semantics:** Walls are represented as boundary line segments in `combatState.walls`, keeping cells navigable while enforcing physical edge collisions for movement and line-of-sight.
- **Terrain Semantics:** Authoring cell terrain types (stone, grass, wood, mud, water, ice, etc.) survive conversion into `TacticalCell.type`.

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
