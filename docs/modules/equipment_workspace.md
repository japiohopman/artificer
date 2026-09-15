# Equipment Workspace — UI Architecture Contract

**Status:** Active design contract for PR #299 / Issue #300 and the current implementation branch `inventory-equipment-overhaul-verification-3647826190140842018`.

## 1. Purpose

The Gear & Equipment experience is a dedicated, full-screen application surface for managing one character's inventory and equipment. It is not a modal dashboard and it does not introduce a second inventory model.

The runtime model remains:

- Atlas = canonical static item/template definitions.
- Inventory V2 / character state = canonical ownership, quantity and placement.
- Equipment Workspace = presentation + interaction layer over that state.

## 2. Physical Atlas vs player-facing taxonomy

Do **not** reorganize the physical Atlas directories for this UI work. The existing 2014/2024 Atlas layout remains a source/data concern.

The inventory UI exposes a player-oriented taxonomy:

```text
EQUIPMENT
├── Weapons
├── Armor
├── Shields
├── Tools
├── Accessories
│   ├── Rings
│   ├── Belts
│   ├── Neck
│   └── other accessory families
├── Containers
├── Adventuring Gear
├── Spellcasting Gear
└── Consumables

MATERIALS
├── Crafting Materials
├── Components
├── Keys
├── Quest Items
├── Books
└── Valuables
```

A single taxonomy resolver maps canonical Atlas items into these UI groups. Do not duplicate item definitions to support tabs.

## 3. Full-screen composition

The workspace follows the same dedicated-screen philosophy used by the DevKit.

```text
EquipmentScreen
├── Header
├── CharacterSelector
├── MainTabs
│   ├── Equipment
│   └── Materials
├── CategoryTabs / filters
└── MainContent
    ├── Inventory / equipment display
    └── Equipment Doll
```

The old centered modal + dark backdrop composition should not be the primary Gear & Equipment experience.

## 4. Character selector

The upper-left inventory header area is reserved for character switching, not an `Available Gear` heading.

Display six character positions:

1. active/main character;
2. five reserved party character slots.

Each populated position displays the character avatar/profile image. Reserved empty positions remain visually recognizable as reserved party positions. Clicking a populated character switches the active character and causes the inventory + Equipment Doll to re-render from canonical character state.

Do not create a local shadow copy of inventory/equipment per character.

## 5. Equipment display

Prefer upgrading and reusing `src/components/atlas/EquipmentCard.tsx` as the visual presentation basis rather than introducing another unrelated equipment-card implementation.

Equipment tiles are image-first:

```text
┌─────────────┐
│             │
│             │
│   FULL      │
│   ARTWORK   │  <- 9:16 presentation frame
│             │
│             │
│        x15  │  <- optional quantity badge
└─────────────┘
```

Rules:

- artwork is the primary information;
- one consistent 9:16 UI presentation frame;
- show the complete artwork inside that frame;
- no permanent name/type block below the artwork;
- quantity may be a small overlay badge;
- rarity/magic state may be a subtle frame treatment;
- detailed text belongs in hover/tooltip/inspect/detail UI.

A square inventory slot is an interaction target, not the artwork's final aspect ratio.

## 6. Sprite pipeline

The source sprite geometry and UI presentation geometry are separate concepts:

```text
Atlas item
  -> canonical visual identity
  -> sprite sheet + cell
  -> extracted source art
  -> 9:16 presentation frame
  -> Inventory / Equipment Doll / Drag Preview
```

A 1:1 sprite-sheet cell must not force the final inventory card to become square or cause artwork to become a small square inside a tall card.

Reuse the existing `spriteManifest.ts`, visual identity resolver and `EquipmentSprite` architecture.

## 7. Equipment Doll

The Equipment Doll must visibly contain the character's existing SVG body/character rendering as its central visual anchor.

Equipment slots should visually surround/overlay the body in a deliberate paper-doll composition. Avoid presenting the doll as a set of mostly empty grey rectangles disconnected from the character.

The SVG body is presentation. Canonical equipped ownership and placement remain in character/inventory state.

## 8. Interaction architecture

Keep one coherent dnd-kit context for the workspace and one `DragOverlay`.

Supported interactions remain:

- Inventory -> Equipment
- Equipment -> Inventory
- compatible Equipment -> Equipment
- supported Inventory -> Inventory

Every drag must carry canonical source location information. Every drop must resolve a canonical target location. Compatibility is decided by the domain resolver, not by cosmetic UI state.

The drag preview must preserve the same equipment visual identity and 9:16 presentation used by the inventory.

## 9. Visual identity consistency

The following surfaces must agree visually for the same item:

- inventory tile;
- equipped Equipment Doll slot;
- drag preview;
- inspect/detail view where appropriate.

An item should be recognizable from its artwork without needing the text label.

## 10. Ammunition

Ammunition follows the same equipment visual system.

- weapons declare their ammunition requirement from canonical Atlas/template data;
- compatible ammunition remains a canonical ItemInstance quantity;
- the contextual ammo slot appears only when the equipped weapon requires ammunition;
- quiver is a container with explicit capacity, not an arrow-count item;
- normal quiver capacity is represented by canonical container data (currently 20 arrows in the Atlas); special variants may expose a higher capacity without changing the rendering architecture.

No separate ammo renderer should be created.

## 11. Engineering constraints

- No second inventory data model.
- No physical Atlas reorganization as part of UI work.
- No duplicated compatibility rules in components.
- No separate DndContext for inventory and equipment.
- No direct store mutation in browser E2E tests as a fallback for failed UI interaction.
- No arbitrary z-index escalation to preserve a modal architecture.
- Preserve legacy/V2 compatibility until an explicit migration phase.
- Keep generated test artifacts such as `test-results/.last-run.json` out of source changes.

## 12. Documentation relationship

The equipment sprite documentation should follow the structure of the existing spell sprite-sheet markdown manifests: explicit sheet file, grid, cell mapping, canonical ID, visual concept and READY/PLANNED status.

This workspace document defines the player-facing composition and taxonomy. The sprite documentation defines the asset/sheet mapping. Neither replaces the canonical Atlas data.
