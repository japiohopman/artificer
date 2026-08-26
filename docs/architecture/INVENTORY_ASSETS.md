# Inventory & Equipment Visual Asset Architecture

## Core Architectural Principle

```
Canonical Item (JSON / Instance)
       ↓
Visual Identity (`visualId`, e.g., `equipment.longsword`)
       ↓
Sprite Manifest Cell (`sheetId`, `row`, `col`)
       ↓
Sprite Renderer (`EquipmentSprite.tsx`)
       ↓
Inventory & Equipment UI
```

### Critical Rules

1. **GAME ITEM ID ≠ SPRITE SHEET CELL**
   - The game item template or instance ID never dictates UI sprite sheet coordinates directly.
   - Components MUST NOT hardcode sprite cell coordinates or construct sheet paths directly.

2. **Deduplication Across Sources**
   - The same item visual (e.g., Longsword) may appear in Fighter starting equipment, Soldier background choices, NPC inventories, or random loot.
   - All resolve to the same canonical `visualId`: `equipment.longsword`.
   - Source-specific duplicate IDs (such as `fighter_longsword` or `soldier_longsword`) are strictly prohibited.

3. **Ruleset Branching (2014 vs. 2024)**
   - 2014 and 2024 equipment records use the **SAME** visual identity when the item is visually identical.
   - Separate visual IDs (e.g., `equipment.longsword_2024`) are created ONLY when explicit visual divergence is required.

4. **Canonical Item Identity vs. Visual Identity (Rope Case Study)**
   - Canonical item identity and visual identity remain separate concepts.
   - Distinct D&D items with distinct mechanics (such as `hempen_rope_50_ft` vs `silk_rope_50_ft`) retain separate canonical item IDs and visual IDs (`equipment.hempen_rope_50_ft` vs `equipment.silk_rope_50_ft`).
   - Manifest entries support explicit `fallbackVisualId` mappings so distinct items can reuse existing fallback visuals gracefully when specific assets are still `PLANNED`.

5. **Equipment Packs vs. Pack Contents**
   - Equipment packs (e.g., `Explorer's Pack`) have a dedicated pack visual identity (`equipment.explorers_pack`) representing the pack as a container choice.
   - Individual pack contents (e.g., `rope`, `bedroll`, `rations`, `torch`, `tinderbox`, `waterskin`, `mess_kit`) resolve separately to their own individual visual identities.
   - Packs are NOT collapsed into their contents during visual resolution.

6. **Starter vs. Progression Equipment Separation**
   - Starter assets are strictly items legally obtainable as starting equipment choices across Classes, Backgrounds, and Packs.
   - High-tier weapons, magic items, progression gear, and random treasure belong to separate future progression sheets and MUST NOT pollute starter sprite sheets.

---

## Verified Sprite Sheet Layout & Dimensions

Physical WebP assets under `public/assets/atlas/equipment/sprites/` are **1024 × 1024 pixels**:
- **Grid Layout**: 4 columns × 4 rows (16 total cell slots per sheet).
- **Cell Dimensions**: 256 × 256 pixels per cell (`1:1` cell aspect ratio).
- **Coordinate System**: 0-based indices (`row: 0..3`, `col: 0..3`).

### Core Asset Groups
- `starter_weapons_01` (4 cols × 4 rows)
- `starter_weapons_02` (4 cols × 4 rows)
- `starter_weapons_03` (4 cols × 4 rows)
- `starter_armor_01` (4 cols × 4 rows)
- `starter_adventuring_01` (4 cols × 4 rows)
- `starter_adventuring_02` (4 cols × 4 rows)
- `starter_tools_01` (4 cols × 4 rows)
- `starter_tools_02` (4 cols × 4 rows)
- `starter_spellcasting_01` (4 cols × 4 rows)
- `starter_spellcasting_02` (4 cols × 4 rows)
- `starter_personal_01` (4 cols × 4 rows)
- `starter_personal_02` (4 cols × 4 rows)

---

## Audit Terminology & Coverage

- **READY**: Sprite image asset exists on disk AND manifest cell contract is complete.
- **PLANNED**: Canonical visual ID and manifest cell coordinate assigned; awaiting sprite image production.
- **MISSING**: Item reference exists in starter data but lacks a visual identity / manifest cell assignment.

_Note: "0 MISSING" indicates 100% manifest/identity coverage (every canonical starter item has an assigned visual ID and sheet cell coordinate). It does NOT mean 100% of final image sprite sheets have been rendered._

---

## Audit & Verification Tooling

### Machine-Readable & Human-Readable Reports
- Audit script: `tools/auditStarterEquipment.cjs`
- Machine-readable audit: `docs/inventory_asset_audit.json`
- Human-readable report: `docs/INVENTORY_ASSET_AUDIT.md`

### Automated Unit Tests
- Unit test suite: `tests/inventory_visual_assets.test.ts`
- Validates Visual Identity resolution, ruleset equivalence, strict grid coordinate bounds (`row < sheet.grid.rows`, `col < sheet.grid.cols`), no cell collisions, out-of-bounds coordinate rejection, and 100% starter equipment manifest coverage.

---

## Future Inventory UI Integration Strategy

In subsequent UI integration tasks:
1. `EquipmentSprite.tsx` will receive an item template or `visualId`.
2. It will call `resolveVisualIdentity(templateId)` to retrieve the canonical `visualId`.
3. It will lookup `getSpriteCellForVisual(visualId)` to retrieve `{ sheetId, row, col }`.
4. The canvas or sprite renderer component will calculate CSS background offsets or render canvas crops based on the manifest's `grid` and cell coordinates.
