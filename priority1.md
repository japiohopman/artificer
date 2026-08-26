

Context

PR #265 established the canonical Inventory & Equipment Visual Asset Foundation.

The intended architecture is:

Canonical Item / ItemInstance
→ canonical template identity
→ visualId
→ SPRITE_MANIFEST
→ sprite sheet definition + cell
→ sprite renderer
→ Inventory / Equipment UI

The foundation now contains:

canonical visual identity resolution in src/lib/inventoryVisuals/visualIdentity.ts
authoritative sprite-sheet definitions and manifest mappings in src/lib/inventoryVisuals/spriteManifest.ts
inventory visual asset types
audit tooling and generated reports
tests for identity, bounds, collisions, pack coverage, and real Atlas JSON references

The sprite assets are currently 1024×1792 and use a 4-column × 7-row layout.

The current application UI, however, still contains an older rendering path based on:

src/components/character/equipment/EquipmentSprite.tsx
src/components/character/equipment/equipmentSpriteMap.ts

The current inventory UI also still calls getEquipmentSpriteCoord() and therefore bypasses the new inventoryVisuals architecture.

The purpose of this task is to complete the migration from the old renderer/source-of-truth to the canonical asset foundation.

This is an architectural integration task, not simply a visual styling task.

Goal

Make the canonical Inventory Asset Foundation the actual runtime source of truth for inventory and equipment sprites.

After this task, the intended production flow must be:

Canonical item/template reference
→ resolveVisualIdentity(...)
→ getSpriteCellForVisual(...)
→ canonical sprite renderer
→ actual sprite sheet crop
→ Inventory / Equipment UI

There must no longer be a second production source of truth containing duplicated sprite-sheet paths or cell coordinates.

Phase 1 — Repository-wide rendering audit BEFORE CODE CHANGES

Before modifying code, inspect the repository and identify every production rendering path that can display an equipment/inventory item image or sprite.

Inspect at minimum:

src/components/character/equipment/EquipmentSprite.tsx
src/components/character/equipment/equipmentSpriteMap.ts
src/components/character/inventory/DraggableInventoryItem.tsx
src/components/character/inventory/FullInventoryMenu.tsx
src/components/character/equipment/*
inventory item inspection/detail UI
equipment slot / equipment doll UI
any character sheet / loadout UI
any other production component importing:
equipmentSpriteMap
getEquipmentSpriteCoord
EquipmentSprite
direct equipment sprite paths
direct sprite-sheet coordinates

Search repository-wide for:

equipmentSpriteMap
getEquipmentSpriteCoord
SPRITE_SHEET_PATHS
/assets/atlas/equipment/sprites/
starter_weapons_
starter_armor_
starter_adventuring_
starter_tools_
starter_spellcasting_
starter_personal_
hardcoded row
hardcoded col
sprite crop calculations
direct image rendering for inventory/equipment items

Do not begin the migration until the rendering surface has been understood.

Do not assume the currently known components are the only consumers.

Phase 2 — Define the canonical runtime boundary

The new src/lib/inventoryVisuals/ layer is the authoritative asset source.

Production UI code must NOT:

contain sprite-sheet cell coordinates;
contain duplicated sprite-sheet path registries;
calculate sprite-sheet dimensions independently;
maintain a parallel item→sprite mapping;
maintain a second alias registry for visual identity.

UI components may receive:

an ItemInstance;
an Atlas/template reference;
a canonical template ID;
or a previously resolved visualId;

but they must resolve/render through the canonical inventory visual layer.

Use the existing resolver and manifest rather than creating replacement APIs unless the current API is genuinely insufficient.

Phase 3 — Build/repair the canonical sprite renderer

Refactor EquipmentSprite or replace it with a better-named canonical renderer if necessary.

The renderer must use:

resolveVisualIdentity(...)
getSpriteCellForVisual(...)
getSpriteSheetDefinition(...)

from src/lib/inventoryVisuals/.

Do not copy manifest data into the renderer.

Do not recreate the sprite map.

The renderer must derive crop dimensions from the authoritative sheet definition.

The current sprite assets are 4 columns × 7 rows.

Do NOT hardcode 4 × 4 anywhere in the renderer.

The renderer should calculate:

cellWidth = imageWidth / sheet.grid.cols

cellHeight = imageHeight / sheet.grid.rows

and then use:

col → x offset

row → y offset

Use the manifest definition as the canonical source for both grid dimensions and cell location.

Phase 4 — Canonical identity handling

The renderer must be able to accept the real item references used by the application.

Preserve the established normalization behavior:

canonical template IDs;
hyphen/underscore variants where supported;
source/path references when supported by the current resolver;
2014/2024 equivalent visual identities;
explicit visual divergence only when registered;
equipment packs as their own visual identities;
pack contents as separate visual identities.

Do not add arbitrary UI-specific aliases.

If the current runtime passes a shape that the canonical resolver cannot handle, determine whether:

the existing resolver should be extended at the domain boundary, or
the caller is passing the wrong canonical identifier.

Prefer correcting the domain boundary over adding UI-specific workarounds.

Phase 5 — Migrate all inventory/equipment UI consumers

Migrate every production component discovered in Phase 1.

At minimum, verify:

inventory grid mode;
inventory list mode;
full inventory view;
equipment slots;
equipment doll;
item inspection/details;
equipped item presentation;
any other character inventory/equipment surface.

Every surface that represents the same canonical item should resolve to the same visual identity and therefore the same manifest cell.

A Longsword shown in:

Fighter starting equipment;
Soldier background inventory;
character inventory;
equipped weapon;
inspection panel;

must ultimately resolve through the same canonical visual identity.

Phase 6 — Preserve UX behavior while changing the asset source

Do not break existing inventory behavior while replacing the rendering source.

Preserve:

drag/drop;
inspect behavior;
quantity display;
hover states;
equipment interactions;
fallback image behavior where appropriate;
accessibility / alt text;
existing item click behavior;
existing responsive sizing.

The task is primarily an asset-rendering architecture migration.

Do not use this task to redesign the entire inventory UI.

However, fix obvious rendering UX problems caused directly by the old sprite implementation, including:

wrong crop dimensions;
empty sprite regions;
incorrect aspect ratio;
sprite stretching;
loading flicker;
broken fallback behavior;
image error handling.
Phase 7 — Loading and error behavior

The renderer must handle the following states cleanly:

Loading

Avoid rendering a visibly broken image while the sprite sheet is loading.

Use the existing UI conventions where possible.

Successful render

Display exactly the manifest-defined cell.

Do not distort the sprite.

Do not stretch the entire sprite sheet into the item frame.

Missing visual identity

The renderer must not crash.

Use an appropriate fallback behavior.

Missing manifest entry

The renderer must not crash.

Use the existing fallback image mechanism when available.

Sprite-sheet load failure

Do not leave a permanently broken image element.

Use the existing fallback image path when appropriate.

Do not invent an unrelated placeholder system unless the repository already has one.

Phase 8 — Retire the old source of truth

After all production consumers have been migrated:

equipmentSpriteMap.ts

must no longer be required as a production source of sprite coordinates.

Remove it only after repository-wide verification shows that no production component depends on it.

Likewise eliminate any obsolete SPRITE_SHEET_PATHS or duplicated coordinate registries that exist solely because of the old renderer.

Do not retain a duplicate map "just in case".

If a test or tooling script still needs transitional compatibility, document why.

The goal is:

ONE source of truth.

Not:

new manifest + old map + compatibility map.

Phase 9 — Inventory visual contract tests

Add or update tests so the new runtime path is actually covered.

At minimum test:

Identity

A canonical item resolves to the expected visualId.

Manifest

The visualId resolves to the expected sheet and cell.

Crop dimensions

For a known 1024×1792 sheet:

width = 256
height = 256

The test should derive these values from the sheet grid rather than hardcoding a production implementation shortcut.

Coordinates

A known item such as Longsword resolves to the expected manifest coordinates.

Equivalent source records

Equivalent references resolve to the same visualId.

2014 / 2024 equivalence

Equivalent items resolve to one visual unless explicit divergence exists.

Pack separation

Pack visual and pack-content visual remain separate.

Fallbacks

Missing visual/manifest references fail gracefully.

Consumer architecture

Add a repository-level guard where practical so that production code cannot silently reintroduce:

direct sprite-sheet coordinate maps;
direct equipment sprite sheet registries;
direct coordinate calculation outside inventoryVisuals.

The exact implementation of this guard should fit the project's existing testing/tooling conventions.

Phase 10 — Verify actual UI integration

Do not stop at unit tests.

Verify that the actual application components now invoke the canonical asset system.

Repository inspection must demonstrate:

Old path:

DraggableInventoryItem → getEquipmentSpriteCoord → equipmentSpriteMap

no longer exists.

New path must be equivalent to:

DraggableInventoryItem → canonical renderer → inventoryVisuals resolver/manifest

Likewise verify the equipment UI.

Where possible, use existing integration/component tests.

If the repository has a browser/e2e validation path for the character/inventory UI, use it.

Phase 11 — Documentation

Update the relevant architecture documentation to explicitly state that the runtime UI now uses the canonical inventory visual foundation.

Document:

canonical resolver;
canonical manifest;
renderer boundary;
fallback behavior;
4×7 sprite-grid architecture;
prohibited duplicate sprite maps;
migration status.

Do not document an architecture that the implementation does not actually follow.

Scope

Primary scope:

inventory/equipment sprite rendering;
canonical asset resolution;
migration away from the old sprite map;
related tests;
relevant architecture documentation.

Likely affected files:

src/lib/inventoryVisuals/*
src/components/character/equipment/EquipmentSprite.tsx
inventory components
equipment components
tests related to inventory/equipment rendering
relevant architecture documentation

Potentially removed:

src/components/character/equipment/equipmentSpriteMap.ts

Only modify unrelated files if required to complete the canonical runtime migration.

Do not perform unrelated inventory or character-store refactors.

Important Architectural Constraints
src/lib/inventoryVisuals/ is the canonical visual asset layer.
Atlas/static item definitions remain the canonical source for item identity.
ItemInstance remains a runtime reference to an Atlas/template item.
UI components must not become a second domain/data layer.
No duplicated sprite coordinate registries.
No duplicated sprite-sheet path registries.
No hardcoded 4 × 4 crop assumptions.
No hardcoded sprite coordinates in React components.
Do not silently change item identity merely to make a sprite render.
Do not create UI-only item aliases.
Do not introduce a renderer-specific source of truth.
Do not remove valid fallback behavior until an equivalent or better path exists.
Do not perform a broad visual redesign.
Do not create a new inventory state model.
Do not modify canonical inventory state architecture as part of this task.
Verification Checklist

Before declaring the task ready:

Repository-wide search confirms all known old sprite-map consumers were identified.

Inventory grid uses canonical visual resolution.

Inventory list uses canonical visual resolution.

Full inventory uses canonical visual resolution.

Equipment slots use canonical visual resolution.

Equipment doll uses canonical visual resolution.

Item inspection/details use canonical visual resolution where sprites are shown.

No production UI uses getEquipmentSpriteCoord().

No production UI imports equipmentSpriteMap.ts.

No production UI contains sprite coordinates.

No production UI contains duplicated sprite-sheet paths.

Renderer uses SPRITE_MANIFEST.

Renderer uses SPRITE_SHEETS.

Renderer derives cell size from grid.rows and grid.cols.

1024×1792 assets render as 256×256 cells.

4×7 coordinates are rendered correctly.

Missing visual identity has graceful fallback behavior.

Missing manifest entries have graceful fallback behavior.

Sprite-sheet loading errors have graceful fallback behavior.

Drag/drop still works.

Inspect behavior still works.

Quantity display still works.

Existing equipment/inventory interactions still work.

Identity equivalence tests pass.

Manifest tests pass.

Renderer tests pass.

Integration/component tests pass where available.

Full project test suite passes.

CI passes.

Architecture documentation matches the implementation.

No unrelated refactor was introduced.

Definition of Done

This task is complete only when the canonical inventory visual foundation is the actual runtime source of truth for inventory and equipment sprites.

The final production architecture must be:

Atlas item definition
→ template ID
→ ItemInstance / canonical item reference
→ visual identity resolver
→ sprite manifest
→ sprite renderer
→ UI

and NOT:

Atlas item definition
→ old sprite map
→ UI

The old equipmentSpriteMap.ts architecture must be removed or demonstrably unused in production.

The renderer must correctly support the actual 4×7 sprite-sheet structure.

The user-facing inventory and equipment UI must visibly render the canonical starter sprites rather than relying on the legacy map.

All relevant tests and CI must pass.

Required Final Report from Jules

Before declaring the branch ready for review, report:

Which production consumers of the old sprite map were found.
Which components were migrated.
Whether equipmentSpriteMap.ts was removed.
Which canonical resolver/manifest APIs are now used by the renderer.
How 4×7 crop calculations are implemented.
How missing assets and load errors fall back.
Which tests were added or changed.
Test results.
CI result.
Any remaining known limitation.

Do not declare the task ready if any production component still depends on the old sprite coordinate source of truth.


# Inventory Drag & Drop — Premium RPG Interaction Pass

## Objective

The current inventory functionality works, but the interaction does not yet feel like a premium RPG inventory.

Do NOT treat this as a simple "make drag and drop work" task.

The goal is to make picking up, dragging, hovering, targeting and dropping an item feel **physical, responsive and intentional**, while keeping the implementation lightweight and browser-friendly.

Repository:

`https://github.com/japiohopman/artificer`

Primary area:

`src/components/character/inventory/`

Relevant current files include:

* `DraggableInventoryItem.tsx`
* `Inventory.tsx`
* `FullInventoryMenu.tsx`
* `PartyInventory.tsx`
* `SpellInventory.tsx`

The current `DraggableInventoryItem` already uses `@dnd-kit/core/useDraggable`, but while dragging it currently applies `opacity-0`. That makes the item visually disappear instead of creating a convincing drag experience.

The backpack already has an `isOver` state, but this is only a very basic container-level feedback mechanism.

---

# 1. Core UX principle

The inventory should communicate continuously:

**PICK UP → HOLD → TARGET → DROP**

At every stage the player should know:

1. What item am I holding?
2. Where is it going?
3. Is this destination valid?
4. What will happen when I release?
5. Did the action succeed?

Never make the player guess.

---

# 2. The dragged item must NEVER simply disappear

Current behaviour:

```tsx
isDragging && "opacity-0 z-50 scale-105"
```

This should be removed/reworked.

When the player starts dragging:

* Keep the original inventory slot visible.
* Render a visual drag representation that follows the pointer.
* The original item can become slightly dimmed/ghosted rather than disappearing.
* The dragged representation should feel lifted above the UI.

Recommended visual behaviour:

### Pickup

Approximately:

* scale: `1.05`
* slight upward visual lift
* stronger shadow
* slightly increased brightness/contrast
* cursor becomes grabbing

### While dragging

The item follows the pointer naturally.

Use the existing dnd-kit transform rather than introducing a heavy animation/physics system.

The drag representation should have:

* elevated shadow
* subtle scale
* `z-index` above inventory
* slight visual separation from the UI
* no layout shifting

The original slot should remain visible as a "source position".

---

# 3. Add proper drag lifecycle states

We need clear states:

```text
idle
↓
hover
↓
pickup
↓
dragging
↓
valid target
or
invalid target
↓
drop success / drop rejected
```

Do not implement this as a collection of unrelated CSS hacks.

Use the dnd-kit lifecycle and keep the state centralized where possible.

Prefer:

* `onDragStart`
* `onDragOver`
* `onDragEnd`
* `onDragCancel`

at the appropriate `DndContext` level.

---

# 4. Cursor feedback

The cursor should communicate the current interaction.

Normal:

```text
cursor-grab
```

While dragging:

```text
cursor-grabbing
```

For an invalid target, visually communicate rejection without relying only on the cursor.

Do not introduce a custom browser cursor image unless there is a compelling reason.

Native cursor states + visual target feedback are preferable.

---

# 5. Inventory slots need to become real interaction targets

The backpack currently behaves largely like a container.

We need to think in terms of **individual inventory slots**, not simply "the backpack".

There are 120 logical slots.

Even when an individual slot is empty, it should be visually identifiable enough to communicate:

> "This is a place where an item can live."

However, do NOT make the UI noisy.

Empty slots should remain subtle.

When dragging:

### Valid empty slot

The slot should:

* brighten
* receive a subtle border highlight
* show a soft glow/ring
* slightly scale or lift
* optionally show a small visual "drop here" cue

### Invalid slot

The slot should:

* remain stable or subtly reject
* use a restrained red/error state
* never violently shake
* never create excessive animation

### Current source slot

Keep a subtle "origin" state so the player can understand where the item came from.

---

# 6. Equipment doll interaction is especially important

The equipment/character doll is the most important drop target.

When the player drags a weapon toward the character:

The appropriate equipment slot should react.

Example:

```text
Dragging sword
        ↓
Main hand slot detects proximity
        ↓
Main hand highlights
        ↓
Other incompatible slots remain neutral/rejected
        ↓
Release
        ↓
Sword equips
```

For armor:

```text
Dragging helmet
        ↓
Head slot highlights
```

For boots:

```text
Dragging boots
        ↓
Feet slot highlights
```

For ring:

```text
Dragging ring
        ↓
Ring slots become valid targets
```

etc.

Do NOT simply highlight the entire character doll.

The player should understand exactly where the item will land.

---

# 7. Valid vs invalid target language

The interaction should have a clear visual language.

### Valid

Use the existing Artificer visual language:

* subtle gold/red highlight
* stronger border
* soft glow
* small scale increase
* maybe a gentle pulse

### Invalid

Use:

* restrained red
* reduced glow
* optional tiny rejection animation

Do not use huge flashing effects.

This should feel like a polished RPG UI, not a web form.

---

# 8. Drop animation

A successful drop should have a short confirmation animation.

Example:

```text
drag
↓
release
↓
item snaps toward destination
↓
destination briefly pulses
↓
item settles
```

Keep it short.

Approximately:

`150–300ms`

Do not animate the entire inventory.

Only animate:

* dragged item
* source slot
* destination slot

---

# 9. Pickup feedback

The moment the player begins dragging should feel different from simply clicking.

Use a tiny pickup animation:

```text
scale 1 → 1.05
shadow increases
opacity remains visible
```

Optionally add a very short sound cue.

The pickup sound should be extremely short and subtle.

Think:

**click / leather / small item movement**

Not a long UI sound.

---

# 10. Drag-over feedback

While moving over valid equipment slots:

Use a gentle animated state.

Example:

```text
idle
border opacity: low

dragging over valid slot
border opacity: high
glow: subtle
scale: 1.03
```

Avoid continuous expensive animations.

A CSS pulse or Motion opacity/scale animation is enough.

Do NOT use:

* canvas effects
* WebGL
* particle systems
* physics engines
* requestAnimationFrame loops

---

# 11. Sound design

Add sound feedback only at meaningful moments.

Suggested events:

### Pickup

Very short:

`inventory_pickup`

### Valid target entered

Very subtle:

`inventory_hover_valid`

This should NOT fire continuously while moving over the same target.

Only fire when the valid target changes.

### Invalid target

Optional very subtle:

`inventory_hover_invalid`

Again, debounce/state-change only.

### Successful drop

`inventory_drop`

### Equip

Potentially a different sound:

`equipment_equip`

### Cancel

Optional:

`inventory_cancel`

The system should use the existing project audio infrastructure if one exists.

DO NOT create a second unrelated audio system.

If an appropriate sound system already exists, integrate with it.

If no suitable sound exists, create the smallest reusable abstraction possible.

---

# 12. Important: prevent sound spam

This is critical.

Do NOT do:

```text
on every mouse movement → play sound
```

Instead:

```text
currentTarget !== previousTarget
    ↓
play target-change sound
```

Likewise, pickup/drop sounds should fire exactly once per interaction.

---

# 13. Drag overlay

Investigate whether the inventory's current `DndContext` architecture can support:

```tsx
<DragOverlay>
   <InventoryDragPreview />
</DragOverlay>
```

If appropriate, create a lightweight reusable component such as:

```text
InventoryDragPreview.tsx
```

The preview should visually match the inventory item but feel lifted from the UI.

It should contain:

* item image
* item name if appropriate
* quantity
* rarity treatment
* subtle shadow
* slight scale

Do not duplicate the entire inventory component.

Extract only the visual representation necessary for the drag preview.

---

# 14. Do not break click-to-inspect

The current item supports inspection via click.

Dragging must NOT accidentally open the inspection panel.

The interaction should distinguish:

```text
click
→ inspect

drag
→ move item
```

Preserve the existing inspection behaviour.

Do not remove it.

---

# 15. Do not break existing inventory data architecture

This task is primarily an interaction/UI task.

Do NOT redesign:

* character storage
* inventory persistence
* item schema
* V1/V2 migration
* equipment data model
* item catalog
* save system

unless absolutely necessary for correct drag/drop behaviour.

The current `Inventory.tsx` already normalizes V1/V2 inventory data. Preserve that architecture.

---

# 16. Keep the browser workload extremely light

This is an explicit requirement.

The inventory should remain fast with:

* 120 slots
* many item images
* drag interactions
* character equipment
* animations

Use:

* CSS transforms
* opacity
* box-shadow
* border/background transitions
* Motion only where useful
* dnd-kit state
* event-driven sound

Avoid:

* layout-triggering animations
* width/height animation
* expensive blur effects everywhere
* continuous JavaScript animation loops
* DOM measurement on every pointer movement
* rendering duplicate large item trees unnecessarily
* unnecessary React state updates during drag

Prefer transforms:

```css
transform: translate(...)
transform: scale(...)
```

over layout properties.

---

# 17. Performance rule

During dragging, the UI must NOT re-render the entire 120-slot inventory on every pointer movement.

This is important.

If necessary:

* isolate drag state
* use `DragOverlay`
* memoize inventory item components
* avoid putting rapidly changing drag coordinates into global Zustand state
* use dnd-kit primitives correctly

The drag pointer should remain smooth.

Target highlighting should only update the relevant targets.

---

# 18. Visual polish

The final result should feel like:

**a premium fantasy RPG inventory**

Not:

**a React admin dashboard with draggable cards.**

The visual hierarchy should communicate:

```text
ITEM
  ↓
I PICK IT UP
  ↓
ITEM IS LIFTED
  ↓
I MOVE IT
  ↓
VALID TARGET REACTS
  ↓
I RELEASE
  ↓
ITEM LANDS
  ↓
UI CONFIRMS THE ACTION
```

The user should be able to understand the interaction without reading instructions.

---

# 19. Use the existing visual language

Do not introduce an entirely new design system.

Reuse existing:

* `dragon-red`
* `dragon-gold`
* parchment tones
* existing shadows
* existing border treatments
* existing `GameIcon`
* existing Motion setup
* existing inventory/equipment styling

The inventory should feel like one coherent Artificer system.

---

# 20. Suggested implementation architecture

Before coding, inspect the complete inventory drag/drop path.

Specifically find:

1. The top-level `DndContext`.
2. Existing `onDragStart`.
3. Existing `onDragOver`.
4. Existing `onDragEnd`.
5. Existing equipment slot droppables.
6. Inventory store actions for:

   * equip
   * unequip
   * move
   * remove
   * swap
7. Existing audio service.
8. Existing Motion conventions.
9. Existing equipment slot components.

Do not blindly create duplicate systems.

Then implement the interaction layer around the existing architecture.

Potential components:

```text
inventory/
├── DraggableInventoryItem.tsx
├── InventoryDragPreview.tsx
├── Inventory.tsx
└── ...
```

Only create additional components when they improve separation of concerns.

---

# 21. Required interaction scenarios

Test all of these:

### Scenario A — Backpack → backpack

Drag an item from one inventory position to another.

Expected:

* source remains visible as ghost
* dragged item follows pointer
* destination highlights
* drop animates
* item remains visible in destination

### Scenario B — Backpack → equipment slot

Drag sword to main-hand.

Expected:

* main-hand becomes valid target
* other equipment slots do not falsely highlight
* release equips item
* equip feedback plays
* destination animates

### Scenario C — Invalid equipment target

Drag sword toward helmet slot.

Expected:

* helmet slot communicates invalid target
* sword does not equip
* item returns cleanly to source
* optional rejection sound

### Scenario D — Cancel drag

Pick up item and release outside a valid target.

Expected:

* item returns to original position
* no data corruption
* no disappearing item
* optional subtle cancel animation

### Scenario E — Click without dragging

Click item.

Expected:

* inspect panel still opens
* no drag state is triggered

### Scenario F — Stackable item

Drag a quantity >1 item.

Expected:

* quantity remains visible
* quantity is not accidentally lost
* drop behaviour follows existing inventory rules

### Scenario G — Magic/rare item

Dragging a rare item should preserve its rarity treatment.

---

# 22. Acceptance criteria

This task is complete only when:

* [ ] Dragged items never visually disappear.
* [ ] The player always sees what they are dragging.
* [ ] Cursor communicates grab/grabbing state.
* [ ] Source slot remains understandable.
* [ ] Valid drop targets visibly react.
* [ ] Invalid targets visibly communicate rejection.
* [ ] Equipment slots react individually.
* [ ] Successful drops have a short landing/confirmation animation.
* [ ] Pickup has subtle feedback.
* [ ] Sound feedback exists only at meaningful interaction moments.
* [ ] Sound does not spam during pointer movement.
* [ ] Click-to-inspect still works.
* [ ] Drag cancellation restores the item cleanly.
* [ ] Existing inventory persistence remains intact.
* [ ] 120 inventory slots remain performant.
* [ ] No continuous animation loops are introduced.
* [ ] No WebGL/canvas/physics system is introduced.
* [ ] No unnecessary global drag-coordinate state is introduced.
* [ ] Existing Artificer visual language is preserved.

---

# 23. Important implementation mindset

Do not solve this by simply adding more CSS classes.

The missing piece is **interaction design**.

We need a small, coherent feedback system around the existing dnd-kit architecture.

Think of the drag interaction as a miniature game mechanic:

**Pick up → hold → target → commit/cancel.**

Every transition should have visual feedback.

The result should feel satisfying even before the underlying inventory logic becomes more sophisticated.

Before opening a PR, inspect the complete existing architecture and make the smallest clean changes necessary to achieve this experience.

Run the relevant TypeScript/build/lint checks.

Then provide a concise summary of:

1. What changed.
2. Where drag state is managed.
3. How valid/invalid targets are detected.
4. How sounds are triggered.
5. What was done specifically for performance.
6. How the interaction was tested.




