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

### 2. Movement & Pathfinding
- **Range**: Standard movement is limited to **6 cells** (30ft) per turn, or governed by the unit's `speed` stat.
- **Pathfinding**: Uses the **A* Algorithm** to calculate optimal paths around obstacles (walls and closed doors).
- **Collision**: Movement is blocked by `wall` types and `door` types where `isOpen` is false.
- **Interaction**: Clicking a valid, reachable cell updates the `playerPos`.

### 3. Exploration & Interactivity
- **Environment**: The grid supports multiple rooms defined by `wall` and `door` cells.
- **Doors**: Interactive elements that can be toggled (`open`/`close`) when a player is adjacent (Distance <= 1.5).
- **Line of Sight (LoS)**: Uses **Bresenham's Line Algorithm** to determine visibility between points.
- **Fog of War**: Cells and entities not in the player's direct LoS are rendered with reduced visibility or hidden entirely.

### 4. AI Awareness & Perception
Monsters operate on a state machine driven by spatial awareness:
- **Awareness States**:
    - `idle`: Standard patrol/waiting.
    - `alert`: Searching for the player (usually triggered by sound or moving to the `lastKnownPlayerPos`).
    - `combat`: Actively engaging the player.
- **View Cones**: Monsters have a 90-degree field of vision based on their `viewDirection` (N, E, S, W).
- **Detection**: Entering a monster's view cone while in LoS triggers immediate combat. High proximity may trigger an `alert` state even outside the view cone.

### 5. Initiative System
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
