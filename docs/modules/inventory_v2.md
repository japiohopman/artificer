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
- ammunition ownership and consumption;
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
- supported Inventory → Inventory;
- ammunition → compatible ammunition slot/container.

Dragging must retain a visible item representation. Valid and invalid equipment targets must communicate state before drop, and successful drops must immediately update canonical state.

Equipment compatibility belongs in the canonical equipment/domain layer. UI components must not duplicate compatibility rules.

## Ammunition model

Ammunition is part of the canonical gear-management model and must not be treated as a cosmetic inventory category.

### Static data vs runtime state

Static ammunition facts belong in Atlas equipment JSON:

- item/template identity;
- ammunition family/type;
- weapon compatibility information where needed;
- base weight/cost and other canonical item properties;
- container capacity for quivers or other ammunition containers.

Dynamic state belongs in `ItemInstance` / container state:

- owned quantity;
- exact item instance ID;
- current container/placement;
- loaded/assigned ammunition relationship where the runtime model needs one.

Do not encode current remaining arrow counts directly into the static weapon definition.

### Weapon requirement

A weapon that requires ammunition must expose a canonical machine-readable ammunition requirement. The runtime should derive this from existing Atlas weapon metadata where possible and normalize it through one domain resolver rather than hardcoding individual weapons in UI components.

Conceptually:

```text
Weapon
├── requiresAmmunition: true
└── ammunitionType: arrow | crossbow_bolt | blowgun_needle | sling_bullet | ...
```

The exact stored field names may follow the existing Atlas schema; the important rule is that the runtime has one canonical resolver for the requirement.

### Contextual ammunition slot

The Equipment Doll should not permanently show an empty ammunition slot for every character.

Instead:

```text
weapon equipped
      ↓
weapon requires ammunition?
      ↓
YES ─────────→ show Ammo Slot
NO  ─────────→ no Ammo Slot
```

The slot should show the currently assigned/available compatible ammunition and its quantity. It should be a real drop target participating in the same dnd-kit context as the other equipment slots.

Incompatible ammunition must be rejected before drop.

Examples:

```text
Shortbow + arrows          = valid
Shortbow + crossbow bolts  = invalid
Light crossbow + bolts     = valid
Light crossbow + arrows    = invalid
Sling + sling bullets      = valid
```

### Ammunition consumption

A successful attack with an ammunition-requiring weapon consumes the appropriate quantity from the canonical ammunition source (normally one unit per attack unless the weapon/action explicitly requires another amount).

The consumption path must update the same character inventory/container state used by the Equipment Workspace. It must not merely decrement a local HUD counter.

When ammunition reaches zero, the runtime should clear the assigned ammunition state as appropriate and the UI must immediately reflect the empty state.

### Quivers and ammunition containers

A quiver is a container, not an arrow stack.

The canonical normal quiver record currently describes a quiver that can hold up to 20 arrows and equips to the `back` slot. Its `contents` are empty in the static JSON because the actual arrows should be runtime-owned ItemInstances rather than baked into the quiver template. fileciteturn160file0L2-L2

The runtime model should therefore support:

```text
Quiver ItemInstance
└── ammunition container
    ├── allowed ammunition: arrows
    └── capacity: 20
```

A special/magic quiver can use the same container model with a different canonical capacity (for example 50 arrows) rather than introducing a second ammunition system.

Do not model a mundane quiver as "5 arrows" or "20 arrows" inside the item's `quantity`. The quiver is one owned container; arrows are separate owned ammunition ItemInstances/stacks.

### Where to change the JSON

Do not blindly rewrite every weapon `.json` file.

First audit the existing 2014/2024 weapon metadata and determine whether the ammunition property already provides enough structured information. Existing weapon records already contain the canonical `ammunition` property in their Atlas data; for example the shortbow records expose an ammunition property and the 2024 shortbow record explicitly describes Arrow ammunition. fileciteturn162file0L15-L18 fileciteturn162file5L101-L109

Preferred approach:

1. preserve authoritative source data;
2. create one canonical ammunition requirement/compatibility resolver;
3. add structured metadata only where existing JSON cannot be resolved reliably;
4. represent quiver capacity as static container metadata, not runtime arrow quantity;
5. keep dynamic ammunition ownership/loading/consumption in the V2 instance/container state.

This keeps rules/data in Atlas while keeping runtime behavior in the domain layer.

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
- transfers;
- future ammunition assignment/consumption orchestration where it belongs at the domain boundary.

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
- sprite-sheet preference and fallback `.webp` optimization need runtime verification;
- ammunition requirement/compatibility, contextual ammo-slot presentation, quiver capacity and attack-time ammunition consumption still need a canonical runtime implementation and tests.

These limitations are tracked together in Issue #300 because they form one coherent gear-management workflow. They must not be addressed by inventing a second inventory system.

## Migration direction

The long-term direction is to converge on the versioned item-instance/container model while preserving save compatibility until migration is explicitly complete.

A future migration should define:

1. canonical V2 schema;
2. migration/read compatibility strategy;
3. save-version guarantees;
4. validation of item/container references;
5. tests for equip, transfer, stacking, ammunition consumption and persistence.

Do not remove the legacy branch merely because the V2 architecture is preferred.

## Data integrity rules

- Atlas definitions are canonical for static item templates.
- Character/inventory state is canonical for ownership and placement.
- Item IDs must remain stable within a saved character state.
- Container/equipment slots should reference valid item instances.
- UI components should request inventory actions rather than directly rewriting character item structures.
- Equipment-pack contents must become real owned ItemInstances before the runtime inventory presents them.
- Drag/drop operations must mutate canonical ownership/placement state rather than a visual-only representation.
- Ammunition compatibility must be determined by canonical item/weapon metadata, not item-name string matching in UI components.
- Ammunition consumption must mutate canonical ItemInstance/container state.
- A quiver's capacity is static container metadata; its arrows are separate runtime-owned ammunition.

## Related documentation

- `docs/systems/DATA_FLOW.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/modules/atlasService.md`
- `docs/modules/character_creation_architecture.md`
- Issue #300: Inventory & Equipment Workspace — interaction, ingestion, ammunition and asset UX overhaul
