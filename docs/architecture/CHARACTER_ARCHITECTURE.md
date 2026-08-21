# Character Architecture Foundation — Single Source of Truth

This document outlines the architectural foundation for character state ownership, calculation utilities, and reusable presentation components.

---

## 1. Core Architectural Principle

```
               useCharacterStore
                      ↓
       Character state / Character model
                      ↓
         shared selectors / calculations
                      ↓
        reusable character presentation
                      ↓
┌─────────────────┬───────────────────┬────────────────┐
│ CharacterStats  │ CharacterProfile  │  TitleScreen   │
└─────────────────┴───────────────────┴────────────────┘
```

- **Store (`useCharacterStore`)** owns canonical character state.
- **Domain/Lib Layer (`src/lib/character/`, `src/lib/statCalculations.ts`, `src/lib/inventoryUtils.ts`)** owns calculations, derived values, selectors, and utilities.
- **React Components** own presentation, user interactions, and layout without duplicating D&D calculation rules or local store logic.

---

## 2. Character State Ownership (`useCharacterStore`)

The store maintains three primary state fields that serve clear, distinct responsibilities:

1. **`characters: Character[]`**
   - The canonical active session party collection in memory.
   - Represents the active player characters currently loaded in the active play session.

2. **`mainCharacterSlots: (Character | null)[]`**
   - The persistent save-slot structure `[slot1 | null, slot2 | null, slot3 | null]`.
   - Loaded from storage by `loadCharacters()` and rendered on `TitleScreen`.

3. **`activeCharacterId: string`**
   - The ID of the currently active player character in the active session party.

### `setMainCharacter(char)` Semantics
`setMainCharacter(char)` initializes or updates the active single-player party session (`characters = [char]`) and sets `activeCharacterId = char.id`. It is explicitly called when booting or continuing a single-player hero session from `TitleScreen`, `CharacterCreator`, or `GameOverScreen`. It does not wipe `mainCharacterSlots`.

---

## 3. Canonical Selectors Layer (`src/lib/character/selectors.ts`)

Active character resolution across all React UI components must consume canonical selectors rather than duplicating `characters.find(c => c.id === activeCharacterId)` lookups locally:

- **`useActiveCharacter()`**: Canonical hook that resolves the currently active player character from `useCharacterStore` with fallback to `characters[0]`.
- **`useCharacter(id)`**: Canonical hook that resolves a specific character by ID from `useCharacterStore`.
- **`selectActiveCharacter(state)`**: State selector returning the active character or `characters[0]`.
- **`selectCharacterById(state, id)`**: State selector returning character by ID.
- **`selectMainCharacterSlots(state)`**: State selector returning the save-slot array `(Character | null)[]`.
- **`selectPartyCharacters(state)`**: State selector returning active party characters `Character[]`.

---

## 4. Calculation & Utility Layer

All derived statistics and calculations are deterministic and calculated dynamically from character data:

- **`calculateDerivedStats(character)`**: Calculates AC, initiative, speed, proficiency bonus, attack bonus, spell DC, spell attack bonus, passive perception, weight capacity, and spell slots.
- **`calculateCharacterWeight(character)`**: Calculates combined carrying weight (equipped items, backpack, currency) normalized across V1 (legacy) and V2 (slot/registry) inventory models:
  - **V1 Model**: Sums items in `character.inventory` (equipped) and `character.backpack` array.
  - **V2 Model**: Iterates over `character.items` (the physical item instance registry) counting each physical item instance exactly once regardless of container/slot placement, scaled by quantity. Resolves canonical item template weight via `resolveItemTemplateWeight()` through `getCachedEquipment()`, `useAtlasStore`, or fallback canonical template definitions (or instance metadata weight overrides).
  - **Currency**: Adds coin weight via `calculateCurrencyWeight(character.money)` (50 coins per lb rule).
- **`calculateMaxSpellSlots(character)`**: Computes class-, level-, and subclass-specific D&D 5e spell slot maximums (full casters, half casters, warlock pact magic, 1/3 casters).
- **`getEffectiveStats(character)`**: Calculates base ability scores adjusted by equipment and feature passive modifiers.

---

## 5. Reusable Presentation Components

1. **`<CharacterStats character={character} variant="compact" | "full" />`**:
   - Data-driven component that receives a `Character` prop and renders derived stats.
   - Used in `CharacterPanel`, `CharacterProfile`, and `TitleScreen` hero preview.
   - Deterministic and prop-driven: renders the passed `character` prop without depending on active store focus.

2. **`CharacterProfile`**:
   - Container component for the full character sheet (Stats, Equipment, Biography, Spells).
   - Consumes centralized selectors (`useActiveCharacter`) and calculations (`calculateCharacterWeight`, `calculateMaxSpellSlots`, `calculateDerivedStats`).
   - Uses `derived.proficiencyBonus` exclusively instead of calculating proficiency locally.

3. **`TitleScreen`**:
   - Manages save slots, slot selection, and character preview.
   - Consumes `<CharacterStats character={selectedChar} variant="compact" />` for stat presentation.

4. **`EnemyStats`**:
   - Tactical entity display for monster/enemy targets.
   - Intentionally maintained as a separate component domain from player character sheets.
