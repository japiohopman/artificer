# Inventory Module

## Status

**Implemented / evolving**

The inventory domain currently supports both a legacy inventory representation and the newer versioned item/container model used by characters with `saveVersion === 2`.

The newer model is the intended direction, but the codebase still contains compatibility paths for the legacy representation.

## Responsibility

The inventory domain owns:

- character item ownership;
- backpack/container contents;
- equipment slot assignment;
- party inventory;
- item transfer between supported containers/party members;
- party transport/vehicle inventory metadata;
- contextual ammunition requirements and combat consumption.

The `useInventoryStore` provides inventory UI state, slot-to-slot transaction orchestration, and party inventory, while character persistence/state remains in `useCharacterStore`.

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

### Gear & Equipment Workspace

The canonical gear interaction surface (`EquipmentWorkspace.tsx`) pairs the compact inventory slot field (`Inventory.tsx`) on the left with the single authoritative `EquipmentDoll` (`EquipmentDoll.tsx`) on the right under a single `DndContext` and `DragOverlay`.

Key architectural principles:

- **React Portal Overlay:** The global inventory modal (`FullInventoryMenu.tsx`) renders via `createPortal(..., document.body)` at top-level `z-[9999]`, guaranteeing visual isolation above all HUD/nav elements.
- **Single Equipment Doll:** Exactly one `EquipmentDoll` instance is active when the workspace is open.
- **Dynamic Capacity:** Inventory grid slot count is derived dynamically from `character.containers.backpack.slots.length` rather than a hardcoded constant.
- **Atomic Slot Transactions:** `useInventoryStore.moveItem` supports all 4 drag directions (`Inventory -> Inventory`, `Inventory -> Equipment`, `Equipment -> Inventory`, `Equipment -> Equipment`), swapping or replacing slot occupants deterministically.
- **Template-Aware Compatibility:** Drop validity is evaluated by `evaluateSlotCompatibility()` in `src/lib/equipmentCompatibility.ts`, resolving `ItemInstance` template references via cached Atlas metadata before validating slot types (`VALID`, `INVALID`, `REPLACE`).
- **Contextual Ammunition Slot:** The `EquipmentDoll` automatically exposes an `ammo` slot when an equipped main-hand weapon requires ammunition (e.g. shortbow -> arrow, crossbow -> bolt). Ranged weapon attacks in combat (`ActionPanel.tsx`) consume 1 ammunition unit per attack from the equipped ammunition instance.

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

To ensure definitions are available before presentation components render, canonical Atlas equipment definitions are preloaded at the store/lifecycle boundary (`useCharacterStore` methods `setActiveCharacter`, `setMainCharacter`, `loadCharacters`) via `ensureCharacterEquipmentLoaded()`. Presentation components (such as `CharacterProfile` and `CharacterStats`) remain pure synchronous consumers of already-available canonical data and perform no fetch effects or forced rerenders for weight calculation. Unloaded item templates resolve weight as 0 until cached. Each physical instance in `character.items` is counted exactly once scaled by `quantity`.

## Store responsibilities

`useInventoryStore` currently handles both domain actions and some presentation/session state:

- inventory panel visibility;
- party inventory;
- party vehicles;
- party capacity statistics;
- add/remove operations;
- equip/unequip;
- atomic slot-to-slot move (`moveItem`);
- transfers.

Some actions delegate to `useCharacterStore` because character inventory is persisted as part of character state.

## Equipment pack expansion

The Character Creator equipment ingestion pipeline (`characterPipeline.ts` method `expandAndCreateItemInstances()` and `EquipmentStep.tsx`) resolves selected equipment packs (e.g. `explorers-pack`, `dungeoneers-pack`) via `getPackContents()`, creates canonical `ItemInstance` records for each item, and inserts them into the character's backpack container state at character creation time.

## Party inventory and logistics

The inventory domain also has party-level inventory and vehicle metadata.

Current state includes:

- `partyInventory`;
- `partyVehicles`;
- `partyStats` including capacity-related values.

These are distinct from an individual character's V2 `items`/`containers` representation.

## Data integrity rules

- Atlas definitions are canonical for static item templates.
- Character/inventory state is canonical for ownership and placement.
- Item IDs must remain stable within a saved character state.
- Container/equipment slots should reference valid item instances.
- UI components should request inventory actions rather than directly rewriting character item structures.

## Related documentation

- `docs/systems/DATA_FLOW.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/modules/atlasService.md`
- `docs/modules/journal.md`
