# ⚔️ Tactical Combat Blueprint & Architecture Report

This document details the current state of the **Tactical Combat Engine**, evaluates existing limitations, addresses key design questions (such as AI enemy behavior and NPC control), and proposes a cleaner component folder reorganization structure.

---

## 1. 🔍 Current Implementation State

The tactical combat engine utilizes a mix of React components, Zustand store slices, an HTML5 canvas layer, and optimized math utility helpers.

### Currently Implemented Features:
- [x] **HTML5 Canvas Drawing Layer (`CombatGrid.tsx`)**
  - High-performance rendering of grid lines, field boundaries, and dynamic fog of war.
  - Interactive highlights of attack and movement range boundaries based on chosen actions.
  - Sphere target overlays with configurable radius highlights on hover.
  - **Dynamic Threat Range:** Hovering over an enemy draws a red threat boundary indicating their maximum movement/attack range.
- [x] **Pathfinding & Spatial Math Utilities (`combatUtils.ts`)**
  - **A* Pathfinding:** Calculates optimal paths around walls, closed doors, and other occupied cells.
  - **Chebyshev Grid Distance:** Calculates grid distance measurements (5 feet per cell grid system).
  - **Bresenham's Line Algorithm:** Computes instant Line-of-Sight (LoS) calculations between coordinates.
  - **Size Footprints:** Collision calculations supporting Medium (1x1) and Large (2x2) creature grids.
- [x] **Token Action HUD (`TokenActionHUD.tsx`)**
  - A contextual hover menu wrapped directly around the selected player token to prevent UI tray clutter.

---

## 2. 🤖 Enemy AI Logic (Movement & Attacks)

Right now, enemy tokens in `combatState.monsters` are passive targets. They take damage and record conditions but do not execute automated tactical actions.

### 🚨 Current Limitations:
- Enemies have no active turns.
- There is no automated pathfinding loop for enemies to close distance to targets.
- Enemy attack and spell parameters are not resolved on the grid.

### 💡 Proposed Enemy AI State Machine & Logic Loop:
To integrate automated enemy actions, we propose an automated AI scheduler integrated into the turn sequence.

```
                  [ Enemy Turn Begins ]
                           │
                           ▼
          [ Search: Any Visible Target? ] ──(No)──► [ Idle / Search Move ]
                           │ (Yes)
                           ▼
              [ Within Attack Range? ] ──(No)───► [ A* Move Toward Target ]
                           │ (Yes)
                           ▼
           [ Execute Attack / Cast Spell ]
```

### 🛠️ AI Implementation Checklist:
- [ ] **AI Grid Movement Subroutines**
  - [ ] Implement an automated `moveMonster(monsterId, targetPos)` function utilizing the existing A* `findPath` utility.
  - [ ] Implement simple target priority algorithms (e.g., "Attack nearest target", "Target lowest HP", or "Protect allies").
- [ ] **AI Attack Execution**
  - [ ] Parse actions array inside `CombatMonster` to automatically execute range/melee attacks when within distance.
  - [ ] Push results automatically to the Combat Log and trigger relevant character store HP reductions.

---

## 3. 👥 Controlling NPCs & Companions

The application currently manages character selection via a single `activeCharacterId` in `useCharacterStore`. Swapping the active character shifts the map focus and token control to that target character.

### 🚨 The Question: Has NPC control been designed?
Currently, secondary party members are treated identically to the lead character in terms of control—whoever is selected is controlled. However, there is no system for **simplified summon/NPC companion management** (where the user controls the main character, and companions are directed with simplified, non-full-sheet interfaces).

### 💡 The Solution:
Introduce a dual-layered control model:
1. **Full Sheet PC (Selected Active Character):** Full character sheet options, action bars, and spell lists.
2. **Companions / Minions / Summons:** Controlled via the active character's action HUD as secondary actions (similar to "directed attacks" or "pet actions").

### 🛠️ Companion Implementation Checklist:
- [ ] **Establish Summon/Minion Schema**
  - [ ] Create a `minions` or `summons` array inside `useCharacterStore` linked to the owner's `characterId`.
  - [ ] Render summons on the grid as green-bordered allied tokens.
- [ ] **NPC Control Interface**
  - [ ] Add companion direction controls ("Move here", "Attack target") directly to the owner's `TokenActionHUD`.
  - [ ] Block full-sheet opening triggers on allied companion tokens to preserve clean, lightweight interactions.

---

## 4. 📁 Proposed Directory Reorganization

Currently, combat code is spread across multiple folders:
- Component: `src/components/hud/game/CombatGrid.tsx`
- Component: `src/components/hud/game/Token.tsx`
- Component: `src/components/hud/game/TokenActionHUD.tsx`
- Utilities: `src/lib/combatUtils.ts`

### 💡 The Proposed Directory Structure: `src/components/combat/`
To consolidate the combat loop and prepare for scale, we should group all combat assets into a dedicated `/combat/` directory.

```
src/components/combat/
├── CombatGrid.tsx          # Main map canvas render component
├── Token.tsx               # Renders players, summons, and enemy tokens
├── TokenActionHUD.tsx      # Floating contextual action triggers
├── combatUtils.ts          # Consolidated pathfinding, A*, and collision math
└── CombatTester.tsx        # DevKit tester component (migrated from devkit/)
```

### 🛠️ Reorganization Checklist:
- [ ] **Move and Refactor Files**
  - [ ] Create `src/components/combat/` directory.
  - [ ] Migrate `CombatGrid.tsx`, `Token.tsx`, and `TokenActionHUD.tsx` to the new directory.
  - [ ] Move `src/lib/combatUtils.ts` into `src/components/combat/combatUtils.ts` to keep combat math local.
- [ ] **Update Import Trees**
  - [ ] Audit and update import paths inside `ArcaneCodex.tsx`, `useGameStore.ts`, and tester components.
  - [ ] Recompile and build to verify complete import tree resolution.

---

## 🚀 Future Implementation Roadmap

### Phase 1: Reorganization (High Priority)
- [ ] Reorganize files into `src/components/combat/` as outlined above.
- [ ] Verify that the game builds successfully without broken import references.

### Phase 2: Simple AI Automated Turns (Medium Priority)
- [ ] Integrate an "AI Turn Runner" inside the turn sequence store.
- [ ] Enable basic A* movement for monsters to pursue the nearest party member during their turn.
- [ ] Implement standard melee/ranged attacks for basic beasts.

### Phase 3: Allied NPCs & Summons (Low Priority)
- [ ] Map allied minion tokens to owners.
- [ ] Add basic summon triggers and direction controls to the active character's action HUD.


---

## 5. 📄 Mini Game Design Document (GDD): Tactical Overhaul

### Overview
This mini-GDD outlines core design specs for enhancing our combat mechanics. It addresses layout expansion, interactive zooming, turn sequence restrictions, melee range checks, TokenActionHUD targeting, and Area-of-Effect (AOE) spell templates.

### 📐 Feature Design Checklist & Roadmap

#### 1. Maximize Viewport Screen Space (Layout Optimization)
- **Goal:** Expand tactical combat grid to take up full available width and height when sidebars are collapsed, matching the Leaflet map mechanics.
- **Spec:** Remove rigid max-width (`max-w-5xl`) restrictions in combat mode from `GameScreen.tsx`.

#### 2. Interactive Panning and Zooming
- **Goal:** Enable comfortable mouse scroll-wheel zooming and direct canvas drag-to-pan.
- **Spec:** Handle wheel events on the canvas wrapper and scale mouse client coordinates by current zoom factor, allowing accurate tile snapping.

#### 3. Target Range Correction (The Melee Bug)
- **Goal:** Fix the melee range "too far away" bug where distance checks are miscalculated.
- **Spec:** Use the actual active PC token position (`activeTokenPos`) for weapon/spell range checks rather than the global, legacy `playerPos` (Slot 1).

#### 4. Turn and Token Movement Restrictions
- **Goal:** Restrict token movement strictly to the actor taking their turn in initiative. Ensure Round 1 initialized active turns correctly assign actions to the initiative winner.
- **Spec:** Check `activeTurnActor?.id === char.id` inside token move handlers and block dragging/movement if it is not their active turn.

#### 5. Area of Effect (AOE) Targeting Systems
- **Goal:** Add visual indicators and hit registration for Area-of-Effect zones.
- **Spec:**
  - **Sphere (Circle):** Select origin point, highlights all cells within `radius` Chebyshev distance.
  - **Cone:** Originates from casting PC towards cursor, extending in a 90-degree fan-out (facing North, South, East, West).
  - Hovering a spell with target type `sphere` or `cone` draws a red hazard boundary. Clicking triggers damage calculation on all tokens captured within the cells.
