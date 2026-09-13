# Character Panel Architecture & Character Mirror Specification

## 1. Overview

The **Character Panel** (`src/components/character/panel/CharacterPanel.tsx`) is the single canonical reusable UI layer for character presentation in Artificer. It provides a unified, game-like **Character Mirror** visual model consumed across all character surfaces:

1. **Character Creator** (`src/components/character/CreatorRightPanel.tsx`)
2. **Main Game HUD Drawer** (`src/components/hud/CharacterPanel.tsx`)
3. **Character Profile / Application Screen** (`src/components/character/CharacterProfile.tsx`)
4. **DevKit & Companion Inspection Surfaces**

---

## 2. Character Mirror Visual Model

The Character Panel operates on a single persistent **Character Mirror** layer hierarchy:

```text
Panel Container
└── Persistent Environment Atmosphere & Background
    └── Body SVG Silhouette (GenderBodySvg)
        ├── Identity Context Badges (Species, Class, Background, Alignment)
        ├── Combat Metrics (HP, AC, Speed, Initiative, Proficiency)
        ├── Ability Score Strip (STR, DEX, CON, INT, WIS, CHA)
        └── Active Tab Content Overlay (Stats | Traits | Bio | Equipment | Spells)
```

### Key Visual Rules
- **Persistent Body Mirror**: Changing tabs does NOT unmount or swap out the body silhouette or environment backdrop.
- **Translucent Overlays**: Tabs (`Traits`, `Bio`, `Equipment`, `Spells`) render as backdrop-filtered overlays on top of the character mirror.
- **Single Visual Contract**: The HUD panel, Character Creator, and Profile screens share identical visual proportions, font styling, and parchment design language.

---

## 3. Component Architecture & Responsibilities

```text
Host / Shell Layer
 (CreatorRightPanel / HUD CharacterPanel / CharacterProfile)
       ↓
Canonical CharacterPanel (src/components/character/panel/CharacterPanel.tsx)
       ↓
┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ CharacterPanelStats  │ CharacterPanelTraits │ EquipmentDoll        │ CharacterPanelSpells │ CharacterPanelBio    │
└──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

### A. Canonical Entry Point: `src/components/character/panel/CharacterPanel.tsx`
- **Facade Re-export**: `src/components/character/CharacterPanel.tsx` re-exports `CharacterPanel` as a clean public entry point.
- **Props**:
  - `character`: `Partial<Character>`
  - `activeTab`: `'stats' | 'traits' | 'equipment' | 'spells' | 'bio'`
  - `onTabChange`: `(tab: CharacterPanelTab) => void`
  - `isEditable`: `boolean`
  - `onUpdate`: `(updates: Partial<Character>) => void`
  - `currentStep`: `string`
  - `hideTabs`: `boolean`

### B. Primary Surface: `CharacterPanelStats.tsx`
- Combines `CharacterPanelBody` (silhouette backdrop + alignment atmosphere), identity badges, `CharacterPanelAbilities` (6 ability score tabs), and primary combat metrics.
- Consumes canonical calculation utilities (`calculateDerivedStats`, `getEffectiveStats`) to calculate HP, AC, Speed, Initiative, Proficiency Bonus, and Spellcasting DC without duplicating rules calculations.

### C. Traits Surface: `CharacterPanelTraits.tsx`
- Displays derived saving throw proficiencies, weapon/armor proficiencies, skill proficiencies, languages, condition immunities, and damage resistances.

### D. Spells & Resource Surface: `CharacterPanelSpells.tsx`
- **Spell Slots Resource UI**: Visualizes slot availability as expendable resource dots (e.g., Level 1 ● ● ○ ○, Level 2 ● ○).
- **Lexicon / Known Spells**: Lists cantrips and prepared/known spells.
- **Modal Sheet Inspection**: Clicking "Sheet" opens the canonical `SpellSheet.tsx` modal.

### E. Bio & Narrative Surface: `CharacterPanelBio.tsx`
- Displays personality traits, ideals, bonds, flaws, backstory, and narrative notes with optional editing capabilities.

---

## 4. Spell UX: Grid Tile vs SpellSheet

### A. Naming & Concept
- **`SpellGridTile`**: Small selectable cards rendered in selection grids (`SpellsStep.tsx`, `SpellInventory.tsx`).
- **`SpellSheet`** (`src/components/atlas/SpellSheet.tsx`): Large (460px × 680px) inspection modal styled as an authentic D&D spell sheet.
- **Compatibility Export**: `src/components/atlas/SpellCard.tsx` re-exports `SpellSheet` for backwards compatibility.

### B. Spell Detail Data Contract & Lazy Hydration
- Index summary objects (e.g., from `index_14.json` / `index_24.json`) contain list metadata but lack descriptions, components, or casting times.
- `SpellsStep.tsx` and `SpellSheet.tsx` automatically hydrate complete spell JSON records via `fetchSpellData(spellIndex, ruleset)`.
- Guarantees complete rendering of spell descriptions, components, casting time, duration, range, and higher-level scaling without "No description available" placeholder bugs.

---

## 5. Ruleset Isolation & State Authority

- **Single Store Authority**: `useCharacterStore` owns active party state and character saves. No parallel character store exists.
- **Ruleset Context**: Data resolution respects `useGameStore.ruleset` context (`'2014'` vs `'2024'`), loading versioned datasets under `/14/` or `/24/` subdirectories without silent cross-ruleset fallbacks.
