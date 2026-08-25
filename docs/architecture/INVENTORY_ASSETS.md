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

4. **Equipment Packs vs. Pack Contents**
   - Equipment packs (e.g., `Explorer's Pack`) have a dedicated pack visual identity (`equipment.explorers_pack`) representing the pack as a container choice.
   - Individual pack contents (e.g., `rope`, `bedroll`, `rations`, `torch`, `tinderbox`, `waterskin`, `mess_kit`) resolve separately to their own individual visual identities.
   - Packs are NOT collapsed into their contents during visual resolution.

5. **Starter vs. Progression Equipment Separation**
   - Starter assets are strictly items legally obtainable as starting equipment choices across Classes, Backgrounds, and Packs.
   - High-tier weapons, magic items, progression gear, and random treasure belong to separate future progression sheets and MUST NOT pollute starter sprite sheets.

---

## Key Domain Modules

### 1. Visual Identity Resolver (`src/lib/inventoryVisuals/visualIdentity.ts`)
Provides canonical item ID normalization, alias translation, source deduplication, and ruleset resolution:
- `resolveVisualIdentity(itemInput, ruleset?)`: Returns canonical `visualId` (e.g. `equipment.longsword`).
- `resolveVisualIdentityDetails(itemInput, ruleset?)`: Returns full resolution metadata.

### 2. Sprite Manifest (`src/lib/inventoryVisuals/spriteManifest.ts`)
Authoritative mapping of visual identities to sprite sheet cell locations:
- Sheet definitions (`starter_weapons_01`, `starter_weapons_02`, `starter_armor_01`, `starter_adventuring_01`, `starter_tools_01`, `starter_spellcasting_01`, `starter_personal_01`).
- `SPRITE_MANIFEST`: Record mapping `equipment.<id>` to `{ sheetId, row, col, status, category, aspectRatio }`.
- Status fields (`READY`, `PLANNED`, `MISSING`, `DUPLICATE`, `VERIFY`).

---

## Audit & Verification Tooling

### Machine-Readable & Human-Readable Reports
- Audit script: `tools/auditStarterEquipment.cjs`
- Machine-readable audit: `docs/inventory_asset_audit.json`
- Human-readable report: `docs/INVENTORY_ASSET_AUDIT.md`

### Automated Unit Tests
- Unit test suite: `tests/inventory_visual_assets.test.ts`
- Validates Visual Identity resolution, ruleset equivalence, manifest coordinate bounds, no cell collisions, and 100% starter equipment coverage.

---

## Future Inventory UI Integration Strategy

In subsequent UI integration tasks:
1. `EquipmentSprite.tsx` will receive an item template or `visualId`.
2. It will call `resolveVisualIdentity(templateId)` to retrieve the canonical `visualId`.
3. It will lookup `getSpriteCellForVisual(visualId)` to retrieve `{ sheetId, row, col }`.
4. The canvas or sprite renderer component will calculate CSS background offsets or render canvas crops based on the manifest's `grid` and cell coordinates.
