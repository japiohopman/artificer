# Equipment Workspace Architecture

## Status
Authoritative design contract for the Gear & Equipment runtime surface.

## Player-facing inventory model

The physical Atlas remains the canonical source/data structure. The Inventory UI exposes a player-facing taxonomy over that data:

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
│   └── Other Accessories
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

Atlas item definitions stay canonical. A taxonomy resolver maps an Atlas item/template to a player-facing root/category without duplicating item definitions.

## Full-screen surface

Gear & Equipment is a dedicated full-screen application surface, not a centered modal with a dark backdrop.

```text
EquipmentScreen
├── Header
├── CharacterSelector (6 positions)
├── RootTabs (Equipment / Materials)
└── MainWorkspace
    ├── Left Display
    │   ├── Category navigation
    │   ├── Dense item grid
    │   └── Item Inspection Panel
    └── Right Equipment Doll
        └── SVG character body + equipment slots
```

The screen owns the viewport. Do not introduce arbitrary z-index escalation to compensate for modal architecture.

## Character selector

The top selector exposes six character positions:

- one active/main character;
- five reserved party slots.

Populated positions show the character avatar/profile image. Clicking a populated position switches the active character and updates the workspace from canonical character state. Empty positions remain visibly identifiable as reserved party positions.

## Left display and inspection

The left side is the primary equipment/material browsing surface. `EquipmentCard.tsx` is the preferred presentation basis and should be upgraded rather than replaced with an unrelated item-card system.

Item tiles are image-first:

- consistent 9:16 presentation frame;
- complete artwork visible without clipping or stretching;
- no permanent name/type block underneath the artwork;
- quantity may be a small overlay badge;
- rarity/magic may use subtle visual treatment;
- names, type, rules and actions are secondary information.

Clicking an item should provide a dedicated Item Inspection Panel within the Equipment Workspace. Reuse the existing inspection state/actions (`useUIStore.inspectingItem` and the existing item action/inspection components) where appropriate rather than creating a duplicate item-action model.

The inspection panel is secondary to the item artwork, but it must remain a first-class workspace surface rather than disappearing entirely in the full-screen redesign.

## Equipment Doll

The right-side Equipment Doll must include the character's existing SVG body as the visual anchor. Equipment slots are composed around/over the body so the character silhouette remains visible.

The Equipment Doll width must align with the existing Character Panel right-aside baseline: **320px (`w-80`)**. The same width baseline should be used for the right equipment surface unless responsive constraints require a smaller breakpoint-specific value.

Do not use a separate character-body renderer if the canonical `GenderBodySvg` / Character Panel body rendering can be reused.

## Visual pipeline

```text
Atlas item
  -> canonical visual identity
  -> sprite sheet + cell
  -> source-cell extraction
  -> unified 9:16 presentation frame
  -> Inventory / Equipment Doll / DragOverlay / Inspection
```

A square sprite-sheet cell is source geometry, not UI card geometry.

## Drag and state architecture

Keep Inventory V2 as the canonical runtime state. Keep one dnd-kit context and one DragOverlay for the workspace. Source and target locations must reference canonical inventory/equipment slots. Compatibility must be enforced by the domain resolver, not only by visual highlighting.

## Non-goals

- no physical reorganization of Atlas directories for UI taxonomy;
- no second inventory persistence model;
- no duplicate item registry;
- no duplicate compatibility system;
- no speculative backend/database redesign.
