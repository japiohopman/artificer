# 🌊 Data Flow & Orchestration

This document defines how data moves through Artificer between UI components, domain stores, services, AI actions and runtime systems.

The central principle is **state-first architecture**: UI projects state and requests actions; domain stores/services own state transitions and validation.

## 1. State ownership

Artificer uses domain-oriented Zustand stores. The exact ownership must remain clear so that no store becomes a catch-all "God Store".

| Store | Responsibility |
|---|---|
| `useUIStore` | UI/navigation state and presentation-level global state |
| `useWorldStore` | World/time/travel/environment state |
| `useCharacterStore` | Character and party character state |
| `useInventoryStore` | Inventory/container/equipment state |
| `useGameStore` | Transient game-session and combat state |
| `useAtlasStore` | Canonical Atlas entity loading/indexing |
| `useJournalStore` | Journal/campaign-memory state where implemented |
| `useAudioStore` | Audio state where applicable |
| `useBookStore` | In-game book/reading state |
| `useAuthStore` | Authentication/session state |

Before adding state to a store, check whether the responsibility already belongs to another domain store or can remain feature-local.

## 2. Services

Services perform operations that should not live inside presentational components.

Examples include:

- `atlasService` — loads and resolves canonical Atlas data.
- `saveService` / persistence services — save/load and external persistence concerns.
- `diceService` — dice/physics integration and result handling.
- audio services — playback and audio-engine orchestration.
- BattleMap persistence/adapter services — serialization, validation, storage and conversion of authoring maps where implemented.

Service names and exact responsibilities are defined by the current source tree. Documentation must not invent service boundaries that do not exist.

## 3. UI → state flow

The normal pattern is:

```text
User interaction
      ↓
React component
      ↓
store action / domain service
      ↓
validation + state transition
      ↓
Zustand state
      ↓
React projection
```

Components should not directly mutate unrelated domain state.

## 4. Atlas data flow

Static game entities should resolve through the Atlas data layer rather than being duplicated inside UI components.

```text
Atlas JSON/assets
      ↓
Atlas service / loader
      ↓
useAtlasStore
      ↓
feature UI / runtime systems
```

Examples include monsters, equipment, materials, classes, species and other canonical definitions.

## 5. World travel

The intended high-level flow is:

```text
World Map / travel UI
      ↓
useWorldStore action
      ↓
travel/time/environment state transition
      ↓
world state update
      ↓
map + HUD + other consumers re-render
```

Travel calculations belong to the world/travel domain, not to the map presentation component.

## 6. Tactical combat flow

Combat is runtime state, while battle-map authoring is a separate concern.

```text
BattleMap authoring asset
      ↓
BattleMap Loader
      ↓
BattleMap definition
   ↙             ↘
Editor       Combat Adapter
                 ↓
          combat runtime state
                 ↓
             CombatGrid
```

The intended permanent authoring location for combat maps is:

```text
public/assets/atlas/combat/combat_maps/*.json
```

The browser cannot directly overwrite repository files. A controlled development/server persistence boundary is therefore required for repository-backed authoring. Until that write path is verified, import/export and transitional local development storage must not be described as permanent repository persistence.

`CombatTester` should consume the same BattleMap definition and loader rather than inventing a second map format.

### Wall geometry

Walls are **boundaries between cells**, not complete blocked cells. Both BattleMap authoring and tactical runtime must use this semantic.

```text
cell A | wall boundary | cell B
```

`CombatGrid` is responsible for runtime tactical representation; it should not reinterpret a wall segment as an entire blocked cell.

### Runtime boundary

BattleMapEditor should not directly patch unrelated combat stores. A deliberate test/deploy action may call the adapter boundary, but authoring state and runtime combat state remain separate.

See:

- `docs/modules/mapEditor.md`
- `docs/systems/TACTICAL_COMBAT_ENGINE.md`

## 7. DevKit flow

The DevKit is an authoring/debug surface. A typical generator/editor flow is:

```text
DevKit tool
      ↓
Atlas/domain service or feature-local state
      ↓
validation / transformation
      ↓
persistence or canonical registry
      ↓
runtime consumes canonical data
```

Large DevKit tools should remain feature modules rather than expanding `DevKit.tsx` indefinitely.

Common editor capabilities may be shared as infrastructure, but domain state remains feature-local. See `docs/systems/DEVKIT_SHARED_TOOLS.md`.

## 8. AI as an actor

The AI Dungeon Master should not directly declare arbitrary state mutations.

The intended model is:

```text
Narrative context
      ↓
LLM
      ↓
validated tool call
      ↓
domain action/service
      ↓
validation
      ↓
canonical state mutation
      ↓
UI/runtime projection
```

This keeps AI actions subject to the same mechanical constraints as user actions.

## 9. Persistence boundary

Persistence should serialize canonical domain data rather than UI implementation details.

For editor modules, distinguish:

- persisted authoring data
- transient editor state
- runtime state

For BattleMap specifically:

```text
Authoring data
  walls / doors / terrain / objects / tokens / layers
          ↓
versioned BattleMap JSON

Transient editor state
  selection / active tool / viewport / zoom / snap UI

Runtime state
  initiative / current turn / combatants / combat effects
```

Authoring assets and player save-game state are different persistence concerns.

## 10. Mechanical integrity

Use the following rules when extending the architecture:

- UI is a projection, not the source of truth.
- Stores/services own domain transitions.
- Canonical Atlas definitions are not duplicated casually.
- Runtime state and authoring state have separate boundaries.
- Pure calculations should be isolated and testable where practical.
- AI actions must pass through validation.
- Feature-local state is preferable to global state when the state has no cross-feature ownership.
- Shared DevKit tooling must not merge unrelated domain histories or state.

## 11. Documentation contract

When implementation changes the data flow:

1. Update the relevant TypeScript architecture.
2. Update this document if the boundary/ownership changed.
3. Update `docs/ARCHITECTURE_STATUS.md` for significant architectural decisions.
4. Update module-specific documentation for feature details.
5. Do not document placeholders as implemented systems.
