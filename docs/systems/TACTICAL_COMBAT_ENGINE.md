# ⚔️ Tactical Combat Engine

The **Tactical Combat Engine** provides a grid-based interface for resolving encounters within Faerûn. It translates the abstract stats in the Atlas (Enemies, Spells, Weapons) into spatial actions.

## 🧩 Spatial Mechanics

### 1. The Tactical Grid (`CombatGrid.tsx`)
- **Dimensions**: 12 x 8 grid.
- **Scale**: 1 Square = 5 Feet (60px in the UI).
- **Coordinate System**: `[x, y]` integer-based grid.
- **Unit Representation**:
    - **Players**: Circular tokens with avatar images or user icons, highlighted with a blue border and movement pulse.
    - **Monsters**: Circular tokens with monster images or identity icons, highlighted with a "Dragon Red" border.

### 2. Movement
- **Range**: Standard movement is limited to **6 cells** (30ft) per turn.
- **Calculation**: Uses Chebyshev distance (max difference between X or Y coordinates) to allow for diagonal movement.
- **Interaction**: Clicking an empty cell within range updates the `playerPos` in the state.

### 3. Initiative System
Combatants are organized into an **Initiative Queue**.
- **Roll**: `1d20 + Initiative Modifier`.
- **Turn Sequence**: The `activeTurnIndex` tracks which unit's turn it is.
- **Visuals**: The active unit is highlighted in the Initiative Tracker with a golden glow and pulse animation.

## 🔄 State Management (`useGameStore.ts`)

### `combatState`
```typescript
interface CombatState {
  playerPos: { x: number; y: number };
  monsters: Array<{
    id: string;
    name: string;
    type: string;
    hp: number;
    maxHp: number;
    x: number;
    y: number;
    imageUrl?: string;
  }>;
  initiativeOrder: Array<{
    id: string;
    name: string;
    value: number;
    isPlayer?: boolean;
  }>;
  activeTurnIndex: number;
}
```

### Key Actions
- `startCombat()`: Rolls initiative for all participants and sorts the queue.
- `nextTurn()`: Advances the `activeTurnIndex`.
- `updateMonsterHp(id, hp)`: Updates the current health of a target.
- `addMonsterToCombat(monster)`: Spawns a monster onto the grid at the nearest available position.

## 🤖 AI Interaction
- **Triggers**: The AI DM can transition the game into `combat` mode via tool calls.
- **Action Resolution**: When the AI declares an attack, it triggers system-side HP updates and log entries.

---
*Status: Phase 2 Tactical Foundations Implemented.*
