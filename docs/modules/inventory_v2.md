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
- party transport/vehicle inventory metadata.

The `useInventoryStore` provides inventory UI state and orchestration, while character persistence/state remains in `useCharacterStore`. fileciteturn96file0

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

and places their IDs into backpack/equipment slots. fileciteturn96file0

### Legacy compatibility

Characters without `saveVersion === 2` still use the older shape, including `backpack` arrays and direct `inventory` equipment mappings.

This compatibility path is currently part of the production code and must not be removed as though V2 were already the only representation. fileciteturn96file0

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
- transfers.

Some actions delegate to `useCharacterStore` because character inventory is persisted as part of character state. This boundary should be considered when future inventory refactoring is planned. fileciteturn96file0

## Inventory packs

The store resolves item packs through `getPackContents` when adding a pack. This keeps starting/equipment pack expansion separate from the inventory UI itself. fileciteturn96file0

## Party inventory and logistics

The inventory domain also has party-level inventory and vehicle metadata.

Current state includes:

- `partyInventory`;
- `partyVehicles`;
- `partyStats` including capacity-related values.

These are distinct from an individual character's V2 `items`/`containers` representation. fileciteturn96file0

## Known limitations

The current implementation has technical debt that should be treated as real implementation constraints rather than hidden by the documentation:

- legacy and V2 representations coexist;
- several inventory types are still typed as `any`;
- inventory actions dynamically import `useCharacterStore`;
- the current store combines UI state, party inventory and character-inventory orchestration;
- transfer/equip logic has compatibility branches for both models.

These are candidates for future refactoring, but should not be turned into a large speculative rewrite without a defined migration plan.

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

## Related documentation

- `docs/systems/DATA_FLOW.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/modules/atlasService.md`
- `docs/modules/journal.md`
