# 📐 Foundry VTT Porting & Integration Guide: Tactical Grid & D&D 5e

This document serves as an architectural blueprint, comparison, and practical implementation guide for porting industry-standard virtual tabletop (VTT) mechanics from **Foundry Virtual Tabletop (Foundry VTT)** and **Aedif's Tactical Grid** into the **Artificer** React/Zustand-based framework.

It covers architectural paradigms, data schema mapping, spatial math, and provides ready-to-use **TSX / Zustand** code blueprints to enhance our `CombatGrid.tsx` with high-fidelity, skeuomorphic, and automated tabletop behaviors.

---

## 🏛️ 1. Architectural Philosophy Comparison

| Paradigm | Foundry VTT Architecture | Artificer Architecture | Porting Strategy (The "Why" and "How") |
| :--- | :--- | :--- | :--- |
| **Rendering Engine** | **HTML5 Canvas + PIXI.js (WebGL)**<br>Everything (grid, tokens, lighting, templates) is a PIXI DisplayObject. Highly performant for thousands of tokens, but high complexity. | **Hybrid HTML5 Canvas + React (DOM)**<br>Canvas handles heavy static background tasks (grid lines, walls, Fog of War, selective masks). React handles dynamic tokens (`motion.div`) and UI HUD elements. | **Keep the Hybrid Approach**.<br>Use Canvas for high-performance calculations and overlays (like selective grid lighting and range circles), while keeping tokens reactive in React/Zustand. |
| **State & Event Flow** | **Global Hooks Pub-Sub (`Hooks.on`)**<br>Decoupled systems and community modules hook into global events (e.g., `hoverToken`, `combatStart`). | **Zustand Reactive State Stores**<br>Specialized, centralized stores (`useGameStore`, `useCharacterStore`, `useUIStore`) govern the reactive visual state of the sandbox. | **Encapsulate Hook Logic in Zustand Actions**.<br>Instead of dynamic callback registration, write direct handlers in our Zustand stores that trigger React state changes. |
| **Modularity & Loading** | **Runtime Manifest ESM Loading**<br>Loads modules on-the-fly using `module.json` metadata and system-level JavaScript classes. | **Compile-Time Static Imports**<br>All subsystems, assets, and layouts are bundled at compile-time, ensuring strict type-safety and bundle optimization. | **Static Registry Pattern**.<br>Compile-time type-safety ensures that our AI DM and combat grid do not suffer from runtime dependency conflicts or broken paths. |

---

## ⚔️ 2. Deep Dive: Tactical Grid Mechanics (`tactical-grid-main`)

We analyzed the `tactical-grid-main` source files (`tactical-grid.js`, `rangeHighlighter.js`, `calculator.js`) to extract three crucial mechanics:

### A. Weapon & Spell Range Highlighting
*   **How Foundry does it**: `RangeHighlighter.js` evaluates equipped weapons or cast activities on a token. It parses fields like `item.system.range.value` (short range) and `item.system.range.long` (long range). It caches the calculated grid offset lists (`_cachedRangeOffsets`) to prevent expensive distance calculations during mouse movement.
*   **The Math**: It checks the actor's flags (e.g., `Spell Sniper` to double range, `Sharpshooter` to ignore long range disadvantage) and draws concentric colored ring overlays.

### B. Precision Distance Measurement & Ruler (The 5-10-5 Rule)
*   **How Foundry does it**: D&D 5e rules dictate that diagonal movement does not cost a flat 5 feet. Instead:
    *   The 1st diagonal costs **5 ft**.
    *   The 2nd diagonal costs **10 ft** (total 15 ft).
    *   The 3rd diagonal costs **5 ft** (total 20 ft).
    *   And so on.
*   **The Math**:
    $$\text{Distance} = (\max(dx, dy) + \lfloor \min(dx, dy) / 2 \rfloor) \times 5 \text{ ft}$$
    This is also known as the **D&D 5e diagonal rule** (or alternative Chebyshev distance approximation). It is essential for combat grid integrity.

### C. Selective Grid Display (Masking)
*   **How Foundry does it**: Uses a custom mask container (`GridMaskContainer`) that applies a WebGL blend mode (`PIXI.BLEND_MODES.ADD`). It only renders grid lines in a designated radius around hovered or controlled tokens, fading out into the darkness.
*   **Why we need it**: This preserves the antique, skeuomorphic "carved antique atlas" theme by hiding grid lines except where tactical measurement is currently occurring.

---

## 📋 3. Schema Harmonization: Atlas vs. Foundry D&D 5e

To make our AI Dungeon Master and automated enemies completely standard-compliant, we can harmonize our `public/assets/atlas/` JSON models with standard Foundry schemas:

### A. Character & Monster Schema Alignment

```json
{
  "name": "Goblin",
  "size": "Small",
  "type": "humanoid",
  "stats": {
    "str": 8, "dex": 14, "con": 10, "int": 10, "wis": 8, "cha": 8
  },
  "hp": {
    "value": 7,
    "max": 7
  },
  "ac": {
    "value": 15
  },
  "actions": [
    {
      "name": "Scimitar",
      "actionType": "mwak", 
      "range": {
        "value": 5,
        "units": "ft",
        "reach": 5
      },
      "damage": {
        "parts": [["1d6 + 2", "slashing"]]
      }
    }
  ]
}
```
*Key Foundry terms we adopt:*
*   `mwak` / `rwak`: Melee Weapon Attack / Ranged Weapon Attack.
*   `msak` / `rsak`: Melee Spell Attack / Ranged Spell Attack.
*   `parts`: Damage dice and type breakdown.

---

## 🛠️ 4. Concrete React (TSX) & Zustand Implementation Blueprints

Below are complete, production-ready code blocks designed to be ported directly into the **Artificer** codebase to implement Foundry-style range highlighting and precision rulers.

### Blueprint A: The Precision Distance & Coordinate Store (`useCombatGridStore.ts`)
This store manages active weapon range indicators, current drag coordinates, grid visibility thresholds, and diagonal calculations.

```typescript
import { create } from 'zustand';

export interface GridPos {
  x: number;
  y: number;
}

export interface RangeIndicator {
  range: number;      // e.g., 5 for melee, 30 for short range
  longRange?: number; // e.g., 120 for long range
  color: string;      // RGBA color string
}

interface CombatGridState {
  // Measurement state
  dragStart: GridPos | null;
  dragCurrent: GridPos | null;
  hoveredCell: GridPos | null;
  
  // Tactical Range Overlays
  activeRanges: RangeIndicator[];
  isSelectiveGrid: boolean;
  gridFadeRadius: number; // radius in cells (e.g. 4)

  // Actions
  setHoveredCell: (pos: GridPos | null) => void;
  setDragState: (start: GridPos | null, current: GridPos | null) => void;
  setActiveRanges: (ranges: RangeIndicator[]) => void;
  toggleSelectiveGrid: () => void;
  
  // Mathematical utility
  calculateDiagonalDistance: (start: GridPos, end: GridPos) => number;
}

export const useCombatGridStore = create<CombatGridState>((set, get) => ({
  dragStart: null,
  dragCurrent: null,
  hoveredCell: null,
  activeRanges: [],
  isSelectiveGrid: true,
  gridFadeRadius: 4,

  setHoveredCell: (pos) => set({ hoveredCell: pos }),
  
  setDragState: (start, current) => set({ dragStart: start, dragCurrent: current }),
  
  setActiveRanges: (ranges) => set({ activeRanges: ranges }),
  
  toggleSelectiveGrid: () => set((state) => ({ isSelectiveGrid: !state.isSelectiveGrid })),

  /**
   * Calculates distance using the D&D 5e (5-10-5) diagonal movement rule.
   */
  calculateDiagonalDistance: (start, end) => {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    
    const maxDelta = Math.max(dx, dy);
    const minDelta = Math.min(dx, dy);
    
    // Every second diagonal counts as double cost (10ft instead of 5ft)
    const diagonals = minDelta;
    const straights = maxDelta - minDelta;
    
    const diagonalFeet = Math.floor(diagonals / 2) * 10 + (diagonals % 2) * 5;
    const straightFeet = straights * 5;
    
    return diagonalFeet + straightFeet;
  }
}));
```

---

### Blueprint B: Upgrading `CombatGrid.tsx` with Precision Canvas Renderers

By adding these dedicated rendering modules to `CombatGrid.tsx`, we draw crisp concentric circles, 5-10-5 highlighted paths, and implement the stunning **Selective Grid Masking** seen in Foundry VTT.

```typescript
// Insert these rendering functions inside your Canvas useEffect hook in CombatGrid.tsx

/**
 * 1. Draw Concentric Range Indicators (Melee Reach, Weapon Short Range, Long Range)
 */
const drawConcentricRanges = (
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  ranges: RangeIndicator[],
  cellSize: number
) => {
  if (ranges.length === 0) return;

  // Render from longest to shortest to ensure proper layered overlapping
  const sortedRanges = [...ranges].sort((a, b) => (b.longRange || b.range) - (a.longRange || a.range));

  sortedRanges.forEach((r) => {
    const drawCircle = (radiusFeet: number, strokeColor: string, fillColor: string) => {
      const radiusPixels = (radiusFeet / 5) * cellSize;
      const cx = center.x * cellSize + cellSize / 2;
      const cy = center.y * cellSize + cellSize / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, radiusPixels, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]); // Dashed rings for skeuomorphic "blueprint" feel
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash
    };

    // Draw Long Range (if specified)
    if (r.longRange) {
      drawCircle(r.longRange, 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.05)'); // Red dashed
    }
    // Draw Optimal/Short Range
    drawCircle(r.range, r.color, r.color.replace(/[\d\.]+\)$/, '0.15)')); // Solid accent
  });
};

/**
 * 2. Draw Precision Selective Grid (Immersion Mode)
 */
const drawSelectiveGridMask = (
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  gridWidth: number,
  gridHeight: number,
  cellSize: number,
  fadeRadiusCells: number
) => {
  ctx.save();
  
  // Create circular radial gradient around active character to fade the grid out beautifully
  const cx = center.x * cellSize + cellSize / 2;
  const cy = center.y * cellSize + cellSize / 2;
  const outerRadius = fadeRadiusCells * cellSize;
  
  const gradient = ctx.createRadialGradient(cx, cy, cellSize, cx, cy, outerRadius);
  gradient.addColorStop(0, 'rgba(212, 175, 55, 0.35)'); // Dragon Gold bright close
  gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.15)'); // Soft glow
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fades into darkness

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1;

  ctx.beginPath();
  // Render grid lines restricted to the fade boundary
  const startX = Math.max(0, center.x - fadeRadiusCells);
  const endX = Math.min(gridWidth, center.x + fadeRadiusCells);
  const startY = Math.max(0, center.y - fadeRadiusCells);
  const endY = Math.min(gridHeight, center.y + fadeRadiusCells);

  for (let x = startX; x <= endX; x++) {
    ctx.moveTo(x * cellSize, startY * cellSize);
    ctx.lineTo(x * cellSize, endY * cellSize);
  }
  for (let y = startY; y <= endY; y++) {
    ctx.moveTo(startX * cellSize, y * cellSize);
    ctx.lineTo(endX * cellSize, y * cellSize);
  }
  ctx.stroke();
  ctx.restore();
};

/**
 * 3. Draw 5-10-5 Rule Path Highlights
 * Highlight each grid square on the path with a sequential movement value
 */
const drawPathDistanceBreakdown = (
  ctx: CanvasRenderingContext2D,
  path: { x: number; y: number }[],
  cellSize: number
) => {
  if (!path || path.length < 2) return;

  let cumulativeDistance = 0;
  
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    
    const dx = Math.abs(curr.x - prev.x);
    const dy = Math.abs(curr.y - prev.y);
    
    // Diagonal step is index-dependent for 5-10-5
    const isDiagonal = dx > 0 && dy > 0;
    if (isDiagonal) {
      // Determine if this is an odd or even diagonal step in the current path sequence
      const diagonalCount = path.slice(0, i + 1).filter((node, idx) => {
        if (idx === 0) return false;
        const pNode = path[idx - 1];
        return Math.abs(node.x - pNode.x) > 0 && Math.abs(node.y - pNode.y) > 0;
      }).length;

      cumulativeDistance += (diagonalCount % 2 === 0) ? 10 : 5;
    } else {
      cumulativeDistance += 5;
    }

    // Draw green/gold tinted footstep block on canvas
    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.fillRect(curr.x * cellSize + 2, curr.y * cellSize + 2, cellSize - 4, cellSize - 4);
    
    // Render micro numeric distance label directly inside the grid square
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 10px "font-elan", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cumulativeDistance}ft`, curr.x * cellSize + cellSize / 2, curr.y * cellSize + cellSize / 2);
  }
};
```

---

## 🎯 5. Immediate Action & Implementation Plan

To adopt these industry-proven VTT standards into the Artificer Sandbox, the developer should follow these incremental steps:

1.  **Introduce the `useCombatGridStore`**: Create `src/store/useCombatGridStore.ts` to host reactive measurements, active range filters, and the 5-10-5 diagonal engine.
2.  **Integrate equipped item ranges**: Hook up `useCharacterStore` with `useCombatGridStore` so that when a character is selected, their equipped weapon's ranges (`mwak` / `rwak`) dynamically register as range ring overlays.
3.  **Upgrade `CombatGrid.tsx` Canvas loop**: 
    - Inject the selective radial gold grid mask.
    - Render concentric weapon range overlays dynamically.
    - Override the basic Chebyshev/Euclidean visual line overlay with the D&D 5-10-5 custom diagonal path.
4.  **Enrich the Bestiary JSON files**: Align `/public/assets/atlas/monsters/` JSON schemas to support direct `.system.range.value` structures for seamless AI DM spatial ability execution.

---
*This guide bridges standard VTT physics with custom React architecture, delivering an elite, immersive single-player tactical simulator.*
