# 🛠️ Artificer DevKit

The DevKit is Artificer's internal **DM/developer authoring and diagnostics workspace**. It is not part of normal player gameplay.

## Entry point

- Component: `src/components/devkit/DevKit.tsx`
- Mounted from the application shell.
- The DevKit currently groups Inspectors, Generators, Testers, Audio and related developer tools.

## Current navigation

The current `DevKit.tsx` defines these top-level workspaces:

### Inspectors

- **Codex** — `AssetExplorer`
- **World** — `WorldExplorer`
- **Flags** — `FlagManager`

Inspectors are primarily for examining and manipulating existing development/game data.

### Generators

The generator workspace currently exposes:

- NPC Generator — `NPCGenerator`
- Monster tooling — integrated into `DevKit.tsx` and `EnemyImageGenerator`
- Material tooling — `MaterialImageGenerator`
- Equipment tooling — `EquipmentImageGenerator`
- Gods/Lore tooling — `GodsLore`
- Jane / World Builder — `Jane`
- Background generation
- **Battle Map Editor — `BattleMapEditor`**

The Battle Map Editor is a substantial module and therefore lives independently under:

```text
src/components/devkit/BattleMapEditor/
```

See `docs/modules/mapEditor.md` for its architecture and implementation status.

### Testers

The current tester workspace includes:

- `NPCTester`
- `CombatTester`
- `Simulator`

These are development tools. A tester existing in the navigation does not mean the underlying production feature is complete.

### Audio / hardware tooling

The DevKit also exposes development tooling for audio and connected lighting, including the Sound Studio/Mixer path and Hue-related controls.

These tools should remain thin UI layers over the existing audio/Hue services and stores rather than becoming alternate runtime systems.

## Architectural rules

### 1. DevKit is an authoring/debug surface

The DevKit may inspect, generate, edit and test data that is later consumed by the runtime. It should not duplicate production game rules unnecessarily.

### 2. Reuse canonical data

Use the existing Atlas services/stores and domain types. Do not create a second registry for monsters, equipment, materials, locations or other canonical entities merely for the DevKit.

### 3. Keep large tools modular

Large DevKit features must be split into their own module directory. Do not turn `DevKit.tsx` into a God Component.

Current example:

```text
DevKit.tsx
   ↓
BattleMapEditor/
   ├── components/
   ├── tools/
   ├── state/
   ├── rendering/
   ├── geometry/
   ├── commands/
   └── persistence/
```

### 4. Placeholder ≠ implemented

A button, tab, panel or placeholder tool must **not** be recorded as a completed feature.

Use these status meanings:

- **Implemented** — working behavior exists and is verified.
- **In progress** — implementation is actively being developed.
- **Scaffolded** — UI/architecture exists but behavior is incomplete.
- **Planned** — design exists, implementation has not started.

### 5. Runtime boundary

Authoring tools should produce canonical data that runtime systems can consume. They should not silently write editor-only state into unrelated global stores.

For the Battle Map Editor specifically:

```text
BattleMapEditor
      ↓
BattleMap authoring data
      ↓
validation / serialization / adapter
      ↓
combat runtime
      ↓
CombatGrid
```

## Maintenance guidance

This document describes the **current DevKit architecture**, not a permanent checklist of every button in every component.

When DevKit navigation or ownership changes:

1. Update this document.
2. Update `docs/COMPONENT_MAP.md` if component ownership changes.
3. Update `docs/TASK_BOARD.md` only for actual remaining work.
4. Do not add speculative `[ ]` checklists for features that have not been designed.

For feature-specific details, prefer the module's own documentation instead of expanding this file indefinitely.
