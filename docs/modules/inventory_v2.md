# Inventory Module

## Status

**Inventory V2 foundation implemented; runtime workspace refinement active in Issue #300.**

The inventory domain currently supports both a legacy inventory representation and the newer versioned item/container model used by characters with `saveVersion === 2`.

The newer model is the intended direction, but the codebase still contains compatibility paths for the legacy representation. Issue #300 is the current completion phase for the runtime Inventory + Equipment experience; it must not introduce another persistence model.

## Responsibility

The inventory domain owns:

- character item ownership;
- backpack/container contents;
- equipment slot assignment;
- party inventory;
- item transfer between supported containers/party members;
- party transport/vehicle inventory metadata.

The `useInventoryStore` provides inventory UI state and orchestration, while character persistence/state remains in `useCharacterStore`.

## Current architecture

### Versioned item/container model

For characters using save version 2, item instances are stored separately from their container/equipment placement.

Conceptually:

```text
Character
├── items
│   └── itemId → ItemInstance
├── containers
│   └── containerId → Container
│       └── slots[] → itemId
└── equipment
    └── slots[] → itemId
```

The current store creates item instances with fields such as:

```typescript
{
  id,
  template,
  quantity,
  addedAt
}
```

and places their IDs into backpack/equipment slots.

### Legacy compatibility

Characters without `saveVersion === 2` still use the older shape, including `backpack` arrays and direct `inventory` equipment mappings.

This compatibility path is currently part of the production code and must not be removed as though V2 were already the only representation.

## Registry / instance / template model

The intended V2 relationship is:

```text
Atlas item definition
        ↓
      template
        ↓
   ItemInstance
        ↓
container/equipment slot
```

The Atlas remains the source for canonical static item definitions. Inventory state records ownership, quantity and placement rather than duplicating the complete item definition.

In V2, `ItemInstance.template` holds the template ID string. `calculateCharacterWeight()` resolves static properties (such as item weight) synchronously via `resolveItemTemplateWeight()`, which queries loaded Atlas definitions in storageService (`getCachedEquipment()`).

To ensure definitions are available before presentation components render, canonical Atlas equipment definitions are preloaded at the store/lifecycle boundary (`useCharacterStore` methods `setActiveCharacter`, `setMainCharacter`, `loadCharacters`) via `ensureCharacterEquipmentLoaded()`. Presentation components remain pure synchronous consumers of already-available canonical data and perform no fetch effects or forced rerenders for weight calculation. Unloaded item templates resolve weight as 0 until cached. Each physical instance in `character.items` is counted exactly once scaled by `quantity`.

## Equipment Workspace — Issue #300

The runtime Equipment tab is the canonical gear-management workspace. It is an interaction surface, not a second inventory model.

### Target composition

```text
EquipmentWorkspace
├── InventoryArea
│   ├── InventoryToolbar
│   └── InventoryGrid
│       └── InventorySlot
│           └── DraggableItem
└── EquipmentArea
    └── EquipmentDoll
        └── EquipmentSlot
```

The intended player mental model is:

```text
INVENTORY  <──────────────>  EQUIPMENT DOLL
available gear               equipped gear
```

There must be one authoritative Equipment Doll in the workspace. Party/shared storage is a separate concern and must not dominate individual gear management.

### Layout principles

- Inventory and Equipment Doll remain visible simultaneously.
- The inventory is a dense slot field; empty and occupied slots are both explicit.
- Item icons and quantities are the dominant inventory information.
- Search/filter/inspection controls remain compact.
- Large decorative cards, excessive margins/padding and duplicate identity/equipment chrome should not consume the space needed by the slot field.
- The Equipment workspace must not render underneath navigation or be clipped by an accidental stacking context.
- A dedicated global overlay surface/portal is preferred for full-screen inventory UI rather than arbitrary z-index escalation.

### Drag/drop contract

Inventory and Equipment participate in one coherent dnd-kit interaction context. Do not create separate drag systems for each panel.

Conceptually:

```text
DndContext
├── InventorySlot (droppable + item source)
├── EquipmentSlot (droppable + item source)
└── DragOverlay (visible dragged item)
```

Inventory slots are real droppable targets; the backpack as one broad drop zone is not sufficient for slot-aware movement.

Supported operations are determined by the domain rules and container model, including:

- Inventory → Equipment;
- Equipment → Inventory;
- compatible Equipment → Equipment;
- supported Inventory → Inventory.

Dragging must retain a visible item representation. Valid and invalid equipment targets must communicate state before drop, and successful drops must immediately update canonical state.

Equipment compatibility belongs in the canonical equipment/domain layer. UI components must not duplicate compatibility rules.

### State invariants

A successful movement must update the same canonical ownership/placement state used by the rest of the game:

```text
item ownership
      ↓
container/equipment placement
      ↓
rendered inventory + equipment
```

Do not create local shadow copies of inventory/equipment state. No operation may produce duplicate item ownership, disappearing items, stale UI or divergent character state.

## Inventory packs

The canonical starting/equipment pack definitions live in `src/lib/itemPacks.ts` and the inventory store already contains pack-expansion behavior through `getPackContents` when adding a pack.

The runtime requirement is stronger than merely rendering a pack reference: when Character Creator assigns an equipment pack, the character-creation/normalization boundary must resolve the pack, expand its contents and create real V2 ItemInstances in the character's backpack/container state, preserving quantities, template IDs and placement.

The UI must render the resulting canonical ownership state and must not fake pack contents.

Issue #300 tracks verification and correction of this ingestion boundary.

## Equipment visual assets

Equipment visuals follow the existing visual-identity → sprite-manifest → sprite-sheet architecture where a canonical sprite identity is available.

The preferred runtime order is:

```text
Item template
   ↓
visual identity
   ↓
sprite manifest
   ↓
sprite sheet + cell
```

Individual `.webp` assets remain valid only as fallback assets where a canonical sprite identity is not yet available. Fallback images should be optimized for their actual small inventory display role rather than loading oversized source imagery into slots.

The runtime should avoid repeated sprite-sheet loading work per slot and should not replace the existing manifest architecture with a parallel image system.

Issue #300 covers the audit and optimization of these visual paths.

## Store responsibilities

`useInventoryStore` currently handles both domain actions and some presentation/session state:

- inventory panel visibility;
- party inventory;
- party vehicles;
- party capacity statistics;
- add/remove operations;
- equip/unequip;
- transfers.

Some actions delegate to `useCharacterStore` because character inventory is persisted as part of character state. This boundary should be considered when future inventory refactoring is planned.

## Party inventory and logistics

The inventory domain also has party-level inventory and vehicle metadata.

Current state includes:

- `partyInventory`;
- `partyVehicles`;
- `partyStats` including capacity-related values.

These are distinct from an individual character's V2 `items`/`containers` representation. Party/shared storage should remain a separate surface from the individual Equipment Workspace.

## Known limitations / active work

The following are current implementation constraints or tracked problems, not design assumptions to hide in presentation:

- legacy and V2 representations coexist;
- several inventory types are still typed as `any`;
- inventory actions dynamically import `useCharacterStore`;
- the current store combines UI state, party inventory and character-inventory orchestration;
- transfer/equip logic has compatibility branches for both models;
- the current full inventory composition is too broad and should be refined into the focused Equipment Workspace described above;
- slot-aware drag/drop, drag preview and target feedback require further implementation/verification;
- equipment-pack ingestion needs an end-to-end Character Creator → ItemInstance verification path;
- global inventory overlay layering needs correction so the workspace cannot sit behind navigation;
- sprite-sheet preference and fallback `.webp` optimization need runtime verification.

These limitations are tracked together in Issue #300 because they form one coherent gear-management workflow. They must not be addressed by inventing a second inventory system.

## Migration direction

The long-term direction is to converge on the versioned item-instance/container model while preserving save compatibility until migration is explicitly complete.

A future migration should define:

1. canonical V2 schema;
2. migration/read compatibility strategy;
3. save-version guarantees;
4. validation of item/container references;
5. tests for equip, transfer, stacking and persistence.

Do not remove the legacy branch merely because the V2 architecture is preferred.

## Data integrity rules

- Atlas definitions are canonical for static item templates.
- Character/inventory state is canonical for ownership and placement.
- Item IDs must remain stable within a saved character state.
- Container/equipment slots should reference valid item instances.
- UI components should request inventory actions rather than directly rewriting character item structures.
- Equipment-pack contents must become real owned ItemInstances before the runtime inventory presents them.
- Drag/drop operations must mutate canonical ownership/placement state rather than a visual-only representation.

## Related documentation

- `docs/systems/DATA_FLOW.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/modules/atlasService.md`
- `docs/modules/character_creation_architecture.md`
- Issue #300: Inventory & Equipment Workspace — interaction, ingestion and asset UX overhaul
