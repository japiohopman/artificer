/**
 * Authoritative Canonical Spell Area-of-Effect (AOE) Grid Geometry Module.
 *
 * Implements 2024 / D&D 5e standard grid targeting shapes:
 * - Sphere / Circle
 * - Cone
 * - Cube / Square
 * - Line
 * - Cylinder
 * - Emanation
 *
 * Pure mathematical grid calculations decoupled from UI canvas rendering.
 */

export type AOETargetType = 'sphere' | 'cone' | 'cube' | 'line' | 'cylinder' | 'emanation';

export interface GridPoint {
  x: number;
  y: number;
}

export interface AOEDefinition {
  targetType: AOETargetType;
  radius?: number;
  length?: number;
  width?: number;
  size?: number;
}

/**
 * Calculates set of grid cell coordinate strings ("x,y") covered by an AOE.
 *
 * @param aoe The AOE shape definition.
 * @param origin Grid origin point (e.g. caster position or emanator position).
 * @param target Targeted grid position (for directional or focal spells).
 * @returns Set of "x,y" string coordinates inside the area of effect.
 */
export function calculateAOECells(
  aoe: AOEDefinition,
  origin: GridPoint,
  target: GridPoint
): Set<string> {
  const cells = new Set<string>();
  if (!aoe || !aoe.targetType) return cells;

  switch (aoe.targetType) {
    case 'sphere':
    case 'cylinder': {
      // Sphere & Cylinder share 2D grid footprint (circle centered on target)
      const radius = aoe.radius || aoe.size || 1;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) <= radius) {
            cells.add(`${target.x + dx},${target.y + dy}`);
          }
        }
      }
      break;
    }

    case 'emanation': {
      // Emanation expands outward in all directions centered on the origin
      const radius = aoe.radius || aoe.size || 1;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx === 0 && dy === 0) continue; // standard emanation originates around caster cell
          if (Math.max(Math.abs(dx), Math.abs(dy)) <= radius) {
            cells.add(`${origin.x + dx},${origin.y + dy}`);
          }
        }
      }
      break;
    }

    case 'cube': {
      // Cube / Square centered on target or originating from target
      const size = aoe.size || aoe.length || 1;
      const half = Math.floor(size / 2);
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          cells.add(`${target.x + dx},${target.y + dy}`);
        }
      }
      break;
    }

    case 'cone': {
      // Cone originates from origin pointing toward target
      const length = aoe.length || aoe.radius || 3;
      const dx = target.x - origin.x;
      const dy = target.y - origin.y;

      if (dx !== 0 || dy !== 0) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          // Horizontal orientation (East / West)
          const dirX = dx > 0 ? 1 : -1;
          for (let step = 1; step <= length; step++) {
            for (let perp = -step; perp <= step; perp++) {
              cells.add(`${origin.x + (step * dirX)},${origin.y + perp}`);
            }
          }
        } else {
          // Vertical orientation (South / North)
          const dirY = dy > 0 ? 1 : -1;
          for (let step = 1; step <= length; step++) {
            for (let perp = -step; perp <= step; perp++) {
              cells.add(`${origin.x + perp},${origin.y + (step * dirY)}`);
            }
          }
        }
      }
      break;
    }

    case 'line': {
      // Line spell originating from origin pointing toward target
      const length = aoe.length || aoe.radius || 6;
      const width = aoe.width || 1;
      const halfWidth = Math.floor((width - 1) / 2);

      const dx = target.x - origin.x;
      const dy = target.y - origin.y;

      if (dx !== 0 || dy !== 0) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          const dirX = dx > 0 ? 1 : -1;
          for (let step = 1; step <= length; step++) {
            for (let w = -halfWidth; w <= halfWidth; w++) {
              cells.add(`${origin.x + (step * dirX)},${origin.y + w}`);
            }
          }
        } else {
          const dirY = dy > 0 ? 1 : -1;
          for (let step = 1; step <= length; step++) {
            for (let w = -halfWidth; w <= halfWidth; w++) {
              cells.add(`${origin.x + w},${origin.y + (step * dirY)}`);
            }
          }
        }
      }
      break;
    }
  }

  return cells;
}
