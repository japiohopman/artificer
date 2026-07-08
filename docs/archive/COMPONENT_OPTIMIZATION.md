# Component Optimization & Documentation Report

## Current State Analysis

The `src/components/` directory has grown organically, resulting in a mix of specific feature directories and many root-level components. This makes it harder to navigate and understand the relationship between components.

### Root Components
- `ArcaneCodex.tsx` (Main App Container)
- `ChromaKeyImage.tsx` (Utility for green-screen removal)
- `DiceRollOverlay.tsx`, `DiceRollerPanel.tsx`, `DiceText.tsx` (Dice system UI)
- `DraggableCard.tsx`, `EquipmentCard.tsx`, `MaterialCard.tsx`, `MonsterCard.tsx`, `SpellCard.tsx` (Atlas data visualization)
- `ErrorBoundary.tsx` (Utility)
- `FirebaseProvider.tsx` (Context Provider)
- `FocusView.tsx` (Global UI Overlay)
- `PartyLogistics.tsx` (Navbar component)
- `TitleScreen.tsx` (Entry screen)

### Existing Folders
- `audio/`: Audio mixer.
- `bookreader/`: In-game book UI.
- `character/`: Character management, inventory, and creation.
- `devkit/`: Developer tools.
- `hud/`: Heads-up display, chat, and game views.

---

## Proposed Optimization

### 1. Folder Reorganization
We will group components into logical categories to reduce root-level clutter.

- **`src/components/atlas/`**: Focuses on the "Atlas" data (Spells, Monsters, Items).
  - `DraggableCard.tsx`
  - `EquipmentCard.tsx`
  - `MaterialCard.tsx`
  - `MonsterCard.tsx`
  - `SpellCard.tsx`
- **`src/components/dice/`**: Everything related to the 3D dice UI.
  - `DiceRollOverlay.tsx`
  - `DiceRollerPanel.tsx`
  - `DiceText.tsx`
- **`src/components/core/`**: Essential app-level components.
  - `ArcaneCodex.tsx`
  - `TitleScreen.tsx`
  - `FirebaseProvider.tsx`
  - `ErrorBoundary.tsx`
- **`src/components/ui/`**: Shared, reusable UI components.
  - `ChromaKeyImage.tsx`
  - `FocusView.tsx`
  - `PartyLogistics.tsx`
- **`src/components/hud/`**: Refine existing structure.
  - Move `ChatPanel.tsx` into `hud/chat/`.
  - Ensure consistent naming.

### 2. Documentation Mapping
Create a new documentation file `docs/COMPONENT_MAP.md` that serves as a directory for all components, explaining their purpose, props, and where they are used.

### 3. Import Updates
All import paths in `src/` will be updated to reflect the new structure.

---

## Implementation Plan

1. **Phase 1: Preparation**
   - Create new directories.
   - Verify all components are accounted for.

2. **Phase 2: Migration**
   - Move files to their respective new directories.
   - Update `ArcaneCodex.tsx` and other consumers.
   - Fix all broken imports across the codebase.

3. **Phase 3: Documentation**
   - Generate `docs/COMPONENT_MAP.md`.
   - Update `docs/PROJECT_HUB.md` to link to the new map.

4. **Phase 4: Verification**
   - Run build/tests to ensure everything still works.
