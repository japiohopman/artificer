# Equipment Sprites Architecture & Specification

## Status
**Authoritative Specification / Implemented Foundation**

This document defines the canonical architecture, visual identity pipeline, sprite-sheet specifications, asset tiering strategy, and UI presentation rules for equipment items across the application. Implemented features are marked **[READY]** while planned expansion tiers are marked **[PLANNED]**.

---

## 1. Core Architectural Principle

```
SPRITE CELL SOURCE (1:1 Square) != UI PRESENTATION FRAME (9:16 Portrait)
```

The equipment sprite system strictly separates the **source asset domain** from the **UI presentation domain**:

1. **Source Asset Domain (1:1 Square):**
   Sprite sheets store artwork in square cells (256×256px within 1024×1024px WebP sheets, organized in a 4×4 grid).
2. **UI Presentation Domain (9:16 Portrait):**
   All equipment items—whether rendered in the **Inventory Grid**, **Equipment Doll**, **Drag Preview Overlay**, or **Item Inspector**—are presented inside a unified **9:16 portrait visual frame**.
3. **Slot Container Target:**
   The inventory or equipment slot container acts as the interaction drop target (`useDroppable`), while the item rendered inside consumes the standardized 9:16 visual presentation frame.

### Canonical Data Pipeline

```text
Atlas Item Definition (`longsword`)
        ↓
Visual Identity Resolution (`equipment.longsword`)
        ↓
Sprite Manifest Lookup (`starter_weapons_01`, Row 2, Col 2)
        ↓
ChromaKey 1:1 Cell Extraction (256×256px)
        ↓
9:16 Equipment Visual Frame (object-contain, transparent margins)
        ↓
UI Surface (Inventory / Equipment Doll / Drag Preview / Inspector)
```

---

## 2. Sprite-Sheet Specifications

### Grid Geometry & Canvas Dimensions
- **Grid Layout:** 4 columns × 4 rows (16 cells per spritesheet).
- **Sheet Canvas Size:** 1024px × 1024px pixels.
- **Cell Dimension:** 256px × 256px pixels (1:1 aspect ratio).
- **Format:** Transparent WebP with green-screen chroma key or direct alpha channel.
- **Coordinate Formula:**
  $$\text{Row} = \lfloor \text{cell\_index} / 4 \rfloor, \quad \text{Col} = \text{cell\_index} \pmod 4$$
- **Cell Crop Calculation:**
  $$\text{sx} = \text{Col} \times \text{cellWidth}, \quad \text{sy} = \text{Row} \times \text{cellHeight}, \quad \text{sw} = \text{cellWidth}, \quad \text{sh} = \text{cellHeight}$$

### Sheet Naming Convention
Sheets follow the category-based naming pattern:
`starter_<category>_<number>.webp`

Canonical sheet identifiers:
- `starter_weapons_01` — Core simple & martial melee starter weapons
- `starter_weapons_02` — Ranged weapons & heavy martial melee weapons
- `starter_weapons_03` — Ammunition & secondary weapons
- `starter_armor_01` — Light, medium, heavy armor & shields
- `starter_adventuring_01` — Equipment packs, containers, ropes, survival gear
- `starter_adventuring_02` — Additional adventuring gear
- `starter_tools_01` — Artisan tools, thieves' tools, musical instruments, gaming sets
- `starter_tools_02` — Secondary tools
- `starter_spellcasting_01` — Arcane foci, holy symbols, druidic foci, spellbooks
- `starter_spellcasting_02` — Secondary spellcasting items
- `starter_personal_01` — Clothing, trinkets, writing supplies, roleplay items
- `starter_personal_02` — Secondary personal items

---

## 3. Visual Identity & Resolution Hierarchy

1. **Explicit Identity:** `item.visualId` or resolved via `resolveVisualIdentity(itemKey, ruleset)`.
2. **Canonical Mapping:** `equipment.<template_id>` (e.g. `equipment.longsword`, `equipment.shortbow`, `equipment.arrow`).
3. **Manifest Lookup (`SPRITE_MANIFEST`):**
   - If `status === 'READY'` and cell coordinates `(row, col)` are present, extract 1:1 cell from sheet WebP.
   - If `status === 'PLANNED'` and `fallbackVisualId` is specified, resolve fallback mapping cell.
4. **Static Image Fallback:**
   - If no READY cell mapping exists, fallback to normalized static WebP image (`/assets/atlas/equipment/images/<template>.webp` or `/assets/atlas/equipment/images/<template_with_underscores>.webp`).

---

## 4. UI Presentation Rules

### 4.1 Image-First Inventory Item Face
- **Frame Ratio:** Standardized 9:16 portrait aspect ratio.
- **Artwork Display:** Full artwork visible centered using `object-contain` without clipping or stretching.
- **Clean Interface:** **No text labels** (name, type) stacked beneath the image in grid mode.
- **Badges:** Quantity badge (`x20`) rendered as a subtle bottom-right overlay badge.
- **Rarity / Magic Indicators:** Subtle border/glow treatment (e.g. `ring-1 ring-dragon-gold/50` for magical items).
- **Interactions:** Hover/tooltip displays full item name; right-click context menu opens action options; left-click opens full inspector modal.

### 4.2 Equipment Doll Slots
- **Frame Ratio:** Standardized 9:16 portrait aspect ratio.
- **Consistency:** Uses the exact same 9:16 item visual rendering system as inventory grid cards.
- **Empty State:** Renders category icon (`GameIcon`) and slot name label when unoccupied.
- **Occupied State:** Renders full 9:16 item visual frame with hover tooltip for item details.

### 4.3 Drag Overlay Preview
- **Consistency:** When dragging an item (`useDraggable`), `DragOverlay` renders the exact same 9:16 item visual frame.
- **Visual Feedback:** Slightly scaled (`scale-105`), elevated shadow (`shadow-2xl`), semi-transparent backdrop.

### 4.4 Ammunition & Quivers
- **Canonical Visual Identities:** `equipment.arrow`, `equipment.crossbow_bolt`, `equipment.quiver`.
- **Equipped Contextual Slot:** When a ranged weapon requiring ammo (shortbow, longbow, crossbow, blowgun) is equipped in `main_hand`, `EquipmentDoll` dynamically exposes the `ammo` slot.
- **Rendering:** Uses the unified 9:16 item visual frame in both inventory and the `ammo` slot.

### 4.5 Player-Facing Inventory Taxonomy Resolver
- **Source Filesystem Decoupling:** Physical Atlas directory structure under `public/assets/atlas/equipment/14` and `/24` remains source organization.
- **UI Taxonomy Hierarchy:** The `resolveItemTaxonomy()` utility maps items into two root categories (`EQUIPMENT` vs `MATERIALS`) and player-facing subcategories:
  - **EQUIPMENT:** `weapons`, `armor`, `shields`, `ammunition`, `tools`, `accessories` (Rings, Belts, Neck, Head, Boots, Bracers, Cloaks), `containers`, `adventuring_gear`, `spellcasting_gear`, `consumables`.
  - **MATERIALS:** `crafting_materials`, `components`, `keys`, `quest_items`, `books`, `valuables`.

---

## 5. Asset Tiering & Sheet Family Strategy

Visual sheet families are organized by equipment category and progression tier grounded directly in existing Atlas equipment definitions:

1. **Starter / Basic Tier (`starter_*`):** Core 2014 / 2024 Player's Handbook starting weapons, armors, packs, foci, and tools.
2. **Upgraded / Variant Tier (`variant_*`):** Fine, masterwork, or exotic non-magical variants (PLANNED expansion).
3. **Magical & Artifact Tier (`magic_*`):** Potions, scrolls, rings, wands, and enchanted armors/weapons (PLANNED expansion).
4. **Containers & Logistics (`containers_*`):** Quivers, backpacks, pouches, chests, and transport inventory (PLANNED expansion).

All tiers share the single unified renderer pipeline (`EquipmentSprite` + 9:16 visual container).

---

## 6. Full-Screen Workspace & SVG Paper Doll Surface

### 6.1 DevKit Application Surface
- **Full-Screen Workspace Surface:** The Gear & Equipment Workspace operates as a full-viewport application surface (`fixed inset-0 z-[9999]`), avoiding backdrop/modal framing.
- **Top 6-Position Character Selector Bar:** Hosts 1 main active character slot and 5 reserved party slots (`data-testid="reserved-party-slot"`). Clicking a character slot switches the active character in canonical `useCharacterStore` state without duplicate local inventory state.

### 6.2 SVG Character Paper Doll Visual Anchor
- **SVG Body Anchor:** `EquipmentDoll` uses `GenderBodySvg` as a central visual silhouette anchor (`Male` / `Female` body, species ears/tail, height/weight scaling) behind equipment slots.
- **Equipped Placement:** Equipment slot frames sit around and over the SVG body silhouette while strictly driving canonical V2 `character.equipment` and `character.items` state.

---

## 7. Manifest Index & Master List
Detailed cell layout specifications for all equipment sheets are documented under:
- `public/assets/atlas/equipment/sprites/INDEX.md`
- Sheet manifest markdown files (`starter_weapons_01.md`, `starter_weapons_02.md`, etc.)
