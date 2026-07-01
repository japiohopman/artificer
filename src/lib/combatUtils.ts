
import { TacticalCell, CombatMonster } from '../store/useGameStore';

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates Chebyshev distance between two points (grid movement).
 */
export const getDistance = (a: Point, b: Point): number => {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
};

/**
 * A* Pathfinding algorithm for the tactical grid.
 * Treats 'wall' and closed 'door' as impassable.
 */
export const findPath = (start: Point, end: Point, grid: TacticalCell[][]): Point[] | null => {
  const width = grid[0].length;
  const height = grid.length;

  const openSet: Point[] = [start];
  const cameFrom = new Map<string, Point>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const pointToString = (p: Point) => `${p.x},${p.y}`;

  gScore.set(pointToString(start), 0);
  fScore.set(pointToString(start), getDistance(start, end));

  while (openSet.length > 0) {
    // Get point with lowest fScore
    openSet.sort((a, b) => (fScore.get(pointToString(a)) || Infinity) - (fScore.get(pointToString(b)) || Infinity));
    const current = openSet.shift()!;

    if (current.x === end.x && current.y === end.y) {
      const path: Point[] = [];
      let temp = current;
      while (cameFrom.has(pointToString(temp))) {
        path.push(temp);
        temp = cameFrom.get(pointToString(temp))!;
      }
      return path.reverse();
    }

    // Neighbors (8 directions)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const neighbor = { x: current.x + dx, y: current.y + dy };

        if (neighbor.x < 0 || neighbor.x >= width || neighbor.y < 0 || neighbor.y >= height) continue;

        const cell = grid[neighbor.y][neighbor.x];
        const isImpassable = cell.type === 'wall' || (cell.type === 'door' && !cell.isOpen);

        if (isImpassable) continue;

        const tentativeGScore = (gScore.get(pointToString(current)) || 0) + 1;

        if (tentativeGScore < (gScore.get(pointToString(neighbor)) || Infinity)) {
          cameFrom.set(pointToString(neighbor), current);
          gScore.set(pointToString(neighbor), tentativeGScore);
          fScore.set(pointToString(neighbor), tentativeGScore + getDistance(neighbor, end));

          if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  }

  return null; // No path found
};

/**
 * Bresenham's Line Algorithm for Line of Sight.
 * Returns true if the line between start and end is not blocked.
 */
export const checkLoS = (start: Point, end: Point, grid: TacticalCell[][]): boolean => {
  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (x0 === x1 && y0 === y1) return true;

    // Don't check the starting cell
    if (x0 !== start.x || y0 !== start.y) {
      const cell = grid[y0]?.[x0];
      if (cell && (cell.type === 'wall' || (cell.type === 'door' && !cell.isOpen))) {
        return false;
      }
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
};

/**
 * Checks if a target position is within a 90-degree view cone of a monster.
 * viewDirection: 0:N, 1:E, 2:S, 3:W
 */
export const isInViewCone = (monster: CombatMonster, targetPos: Point): boolean => {
  const dx = targetPos.x - monster.x;
  const dy = targetPos.y - monster.y;

  if (dx === 0 && dy === 0) return true;

  // Simple quadrant check for 90-degree cone
  switch (monster.viewDirection) {
    case 0: // North (negative Y)
      return dy < 0 && Math.abs(dx) <= Math.abs(dy);
    case 1: // East (positive X)
      return dx > 0 && Math.abs(dy) <= Math.abs(dx);
    case 2: // South (positive Y)
      return dy > 0 && Math.abs(dx) <= Math.abs(dy);
    case 3: // West (negative X)
      return dx < 0 && Math.abs(dy) <= Math.abs(dx);
    default:
      return false;
  }
};
