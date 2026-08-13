# DevKit Shared Tooling

This document defines reusable infrastructure for Artificer's DevKit editors.

The goal is to prevent every large editor from implementing its own version of common UI and interaction primitives while keeping each domain's state isolated.

## Core principle

> **Shared infrastructure, isolated domain state.**

A shared tool may provide behavior, UI primitives or command infrastructure. It must not accidentally merge the domain state of unrelated editors.

For example:

```text
Shared Command/History infrastructure
        ↓
┌───────────────┬───────────────┬───────────────┐
│ BattleMap     │ Audio         │ World         │
│ history       │ history       │ history       │
└───────────────┴───────────────┴───────────────┘
```

Undo in BattleMapEditor must never undo an Audio or World editor action.

## Candidate shared capabilities

The following capabilities are candidates for shared DevKit infrastructure when an existing implementation is suitable for reuse:

- Undo/Redo command/history primitives
- ColorPicker
- ContextMenu
- File/Maps menu primitives
- AssetBrowser
- Search/filter controls
- Inspector primitives
- keyboard shortcut handling
- selection helpers
- icon helpers
- status-bar primitives

Before creating a new shared implementation, inspect the existing DevKit and application code. Refactor an existing implementation when it is already a good canonical fit.

## Current examples

### ColorPicker

The existing audio color wheel at:

```text
src/components/devkit/audio/ColorWheel.tsx
```

is a candidate for extraction into shared DevKit tooling if its behavior is sufficiently generic. Do not create a second color picker merely for BattleMapEditor.

### Icons

Use the existing Artificer icon registry/assets under:

```text
public/assets/icons/svg/
```

before adding new editor icons or introducing another icon library.

### Atlas / Asset Browser

Asset selection should resolve through the existing Atlas and asset infrastructure. Shared asset browsing must not become a second registry for creatures, equipment, locations or other canonical data.

## Undo / Redo architecture

Undo/Redo should be reusable at the infrastructure level while remaining scoped to the editor/domain using it.

A suitable abstraction is a command interface with reversible execution:

```text
Command
├── execute()
└── undo()
```

A history controller can maintain:

```text
pastCommands
futureCommands
```

Each editor owns its own history controller or domain-scoped history instance.

Continuous gestures such as terrain painting should be represented as transactions or grouped commands so one user gesture maps to one meaningful history step.

## Context menus

Context menus should be data-driven and context-aware rather than hardcoded directly into a single canvas component.

A generic context menu can receive an action set based on:

- selected entity
- map position
- active editor
- current permissions/lock state
- current tool/mode

BattleMapEditor is the first major consumer expected to use context actions for right-click interaction.

## File / Maps menus

File operations should be exposed through reusable menu primitives where appropriate, but persistence remains domain-specific.

For example:

```text
Shared FileMenu UI
        ↓
BattleMap persistence service
```

The shared menu must not know how BattleMap JSON is serialized or where combat maps are stored.

## Explorer and Inspector

The DevKit can share structural UI primitives for Explorer and Inspector panels while each module supplies its own domain content.

A shared Inspector should provide layout, sections and field controls. Domain-specific property editing remains inside the owning module/service.

## Keyboard and pointer input

Common shortcuts such as:

- Undo / Redo
- Save
- Delete
- Escape
- Space + drag for pan

may be centralized as reusable input utilities where appropriate.

Domain tools remain responsible for interpreting tool-specific pointer gestures.

For BattleMapEditor, the desired input boundary is:

```text
pointer event
      ↓
coordinate conversion
      ↓
active editor interaction/tool dispatcher
      ↓
domain command
      ↓
editor state
```

This prevents `MapViewport` or an equivalent canvas component from becoming a God Component.

## What should NOT be shared globally

Do not create global state for:

- BattleMap selection
- BattleMap active tool
- BattleMap history
- Audio history
- World editor selection
- editor-specific dirty state
- domain-specific undo stacks

These are feature-local unless a documented cross-module owner exists.

## Reuse rules for agents

Before adding a new DevKit utility:

1. Search for an existing implementation.
2. Determine whether it is domain-specific or genuinely reusable.
3. Prefer extracting/refactoring an existing implementation when safe.
4. Keep domain logic out of shared UI primitives.
5. Keep shared state narrowly scoped.
6. Add module documentation when a new shared boundary is introduced.

Do not create abstractions only because another editor might need them someday.

## Status

This document describes the current architectural direction. Individual shared utilities become **Implemented** only when the corresponding reusable code exists and has been verified. Planned shared infrastructure must not be represented as implemented merely because the architecture describes it.
