# Inventory & Equipment Visual Identity Asset Architecture

This document defines the canonical visual identity and sprite resolution architecture for equipment, weapons, armor, tools, packs, and adventuring gear across the application.

---

## 1. Core Architecture & Pipeline

Game item template IDs and runtime item instances are decoupled from UI rendering coordinates and sprite sheet layout.

The canonical resolution pipeline follows:

```
Canonical Item (Template ID / Instance)
    ↓
Visual Identity (e.g., equipment.longsword)
    ↓
Sprite Manifest (e.g., starter_weapons_01, row 2, col 2)
    ↓
Sprite Renderer (<EquipmentSprite />)
    ↓
Inventory & Equipment UI
```

### Critical Rules
- **GAME ITEM ID ≠ SPRITE SHEET CELL:** An item template ID (e.g., `longsword` or `2014/longsword`) never directly encodes sprite sheet cell coordinates.
- **UI Decoupling:** Components such as `Inventory.tsx`, `FullInventoryMenu.tsx`, and `EquipmentDoll.tsx` must never contain hardcoded sprite sheet coordinates or sheet paths. All visual coordinate resolution is owned by `src/lib/inventoryVisuals/`.

---

## 2. Visual Identity Layer

The visual identity layer (`src/lib/inventoryVisuals/visualIdentity.ts`) provides a stable visual identity (`visualId`) for any game item reference.

### Resolution Function
```ts
resolveVisualIdentity(
  itemInput: string | { template?: string; index?: string; id?: string },
  options?: { ruleset?: '2014' | '2024' }
): string
```

### Visual Deduplication
Items that look visually identical share the exact same `visualId` across all contexts:
- Fighter starting longsword → `equipment.longsword`
- Soldier background longsword → `equipment.longsword`
- NPC inventory longsword → `equipment.longsword`
- Random dungeon loot longsword → `equipment.longsword`

Class-specific or context-specific visual duplicates (e.g., `fighter_longsword` or `soldier_longsword`) are strictly forbidden.

---

## 3. Ruleset Semantics (2014 vs. 2024)

Ruleset versions (2014 and 2024) do **NOT** automatically force distinct visual identities.

1. **Visually Equivalent Items:**
   - 2014 Longsword & 2024 Longsword → `equipment.longsword`
   - 2014 Leather Armor & 2024 Leather Armor → `equipment.leather_armor`

2. **Visually Distinct Items:**
   - If a 2024 item revision introduces a genuinely unique visual appearance, it resolves to a versioned visual ID (e.g., `equipment.longsword_2024`).

---

## 4. Starter Asset Sheets vs. Progression Tiers

Starter equipment assets are strictly items legally obtainable as starting equipment choices (classes, backgrounds, starter packs).

### First Canonical Asset Groups
The starter asset manifest (`src/lib/inventoryVisuals/spriteManifest.ts`) defines 7 primary starter asset groups:

1. `starter_weapons_01` (Simple & Martial Melee Weapons)
2. `starter_weapons_02` (Ranged & Heavy Weapons)
3. `starter_armor_01` (Light, Medium, Heavy Armor & Shields)
4. `starter_adventuring_01` (Adventuring Gear, Packs & Containers)
5. `starter_tools_01` (Artisan Tools, Musical Instruments & Kits)
6. `starter_spellcasting_01` (Arcane/Druidic Foci, Holy Symbols, Spellbooks)
7. `starter_personal_01` (Clothing, Roleplay Items & Personal Effects)

### Progression Tier Segregation
Starter sheets must **NOT** contain:
- High-tier progression weapons or armor
- Rare magic items or artifacts
- Random dungeon treasure

Future progression sheets will be established separately as content demands without corrupting starter asset grids.

---

## 5. Equipment Packs & Pack Contents

Starter packs (such as *Explorer's Pack* or *Burglar's Pack*) require dual visual representations:

1. **Pack Choice Visual:** The overall pack bundle itself is a selectable visual identity (`equipment.explorers_pack`).
2. **Pack Contents Visuals:** Individual items inside the pack (rope, bedroll, rations, tinderbox, waterskin) resolve to separate visual identities (`equipment.rope_hempen_50`, `equipment.bedroll`, `equipment.rations`).

A pack choice is never collapsed into its contents or stripped of its container identity.

---

## 6. Sprite Manifest Structure & Ownership

The sprite manifest (`src/lib/inventoryVisuals/spriteManifest.ts`) is the single source of truth for sheet specifications and cell assignments.

### Data Types (`src/lib/inventoryVisuals/types.ts`)
- `SpriteSheetSpec`: Defines `id`, `name`, `rows`, `cols`, `cellWidth`, `cellHeight`, `assetPath`, `isStarter`.
- `SpriteCellLocation`: Defines `sheetId`, `row`, `col`, `width`, `height`, `aspectRatio`, `ruleset`, `fallbackVisualId`.

### Manifest Validation
`validateManifest()` verifies:
- Every referenced sheet exists in `SPRITE_SHEET_SPECS`.
- All `row` and `col` cell coordinates remain strictly within bounds.
- No duplicate cell assignments exist within the same sprite sheet.

---

## 7. Tooling & Audit Reporting

The audit script `tools/auditStarterEquipment.cjs` scans all class starting equipment choices, background equipment, equipment packs, and versioned 2014/2024 databases.

### Generated Reports
- **Machine-Readable Audit:** `docs/inventory_asset_audit.json`
- **Human-Readable Report:** `docs/INVENTORY_ASSET_AUDIT.md`

### Status Lifecycle
- `READY`: Visual identity mapped, cell assigned, and sprite sheet image file physically exists on disk.
- `PLANNED`: Visual identity mapped and cell assigned in manifest; awaiting image generation.
- `MISSING`: Visual identity mapped but sprite cell assignment is pending.
- `DUPLICATE`: Multiple items improperly mapped to the same cell.
- `VERIFY`: Requires manual review or classification check.

---

## 8. Separation of Concerns & Roadmap Tracking

The inventory asset lifecycle is divided into three distinct phases:

1. **Asset Foundation (THIS TASK):** Visual identity layer, sprite manifest contract, ruleset semantics, deduplication, audit tooling, and architecture specs.
2. **Asset Production (FUTURE TASK):** Rendering and committing full high-resolution sprite sheet image assets (`starter_weapons_01.webp`, etc.).
3. **Inventory UX Integration (FUTURE TASK):** Updating Inventory UI components to consume `resolveVisualIdentity` and `<EquipmentSprite />` across all views.
