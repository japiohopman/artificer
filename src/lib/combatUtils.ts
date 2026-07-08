
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
 * Checks if a cell or area is occupied by a monster or player.
 */
export const isCellOccupied = (x: number, y: number, currentPos: Point, monsters: CombatMonster[], playerPos: Point, size: 'Medium' | 'Large' = 'Medium'): boolean => {
  const footprint = size === 'Large' ? 2 : 1;
  
  for (let fy = 0; fy < footprint; fy++) {
    for (let fx = 0; fx < footprint; fx++) {
      const tx = x + fx;
      const ty = y + fy;

      // Check player collision
      if (tx === playerPos.x && ty === playerPos.y) {
        if (currentPos.x !== playerPos.x || currentPos.y !== playerPos.y) return true;
      }

      // Check monster collision
      for (const m of monsters) {
        if (currentPos.x === m.x && currentPos.y === m.y) continue; // Skip self

        const mFootprint = m.size === 'Large' ? 2 : 1;
        if (tx >= m.x && tx < m.x + mFootprint && ty >= m.y && ty < m.y + mFootprint) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * A* Pathfinding algorithm for the tactical grid.
 * Treats 'wall', closed 'door', and occupied cells as impassable.
 * Optimized with indexed arrays and reduced allocations.
 */
export const findPath = (start: Point, end: Point, grid: TacticalCell[][], monsters: CombatMonster[] = [], playerPos: Point = { x: -1, y: -1 }, creatureSize: 'Medium' | 'Large' = 'Medium'): Point[] | null => {
  const width = grid[0].length;
  const height = grid.length;
  const size = width * height;

  const getIdx = (p: Point) => p.y * width + p.x;
  const fromIdx = (idx: number): Point => ({ x: idx % width, y: Math.floor(idx / width) });

  const dists = new Float32Array(size).fill(Infinity);
  const parents = new Int32Array(size).fill(-1);
  const startIdx = getIdx(start);
  const endIdx = getIdx(end);

  dists[startIdx] = 0;
  const openSet = [startIdx];

  while (openSet.length > 0) {
    let bestI = 0;
    let minF = Infinity;

    for (let i = 0; i < openSet.length; i++) {
      const idx = openSet[i];
      const p = fromIdx(idx);
      const f = dists[idx] + getDistance(p, end);
      if (f < minF) {
        minF = f;
        bestI = i;
      }
    }

    const currentIdx = openSet.splice(bestI, 1)[0];

    if (currentIdx === endIdx) {
      const path: Point[] = [];
      let curr = currentIdx;
      while (parents[curr] !== -1) {
        path.push(fromIdx(curr));
        curr = parents[curr];
      }
      return path.reverse();
    }

    const cx = currentIdx % width;
    const cy = Math.floor(currentIdx / width);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        
        const cell = grid[ny][nx];
        if (cell.type === 'wall' || (cell.type === 'door' && !cell.isOpen)) continue;
        
        // Footprint check for larger creatures
        const footprint = creatureSize === 'Large' ? 2 : 1;
        let areaBlocked = false;
        for (let fy = 0; fy < footprint; fy++) {
          for (let fx = 0; fx < footprint; fx++) {
            const tx = nx + fx;
            const ty = ny + fy;
            if (tx >= width || ty >= height) { areaBlocked = true; break; }
            const tCell = grid[ty][tx];
            if (tCell.type === 'wall' || (tCell.type === 'door' && !tCell.isOpen)) { areaBlocked = true; break; }
          }
          if (areaBlocked) break;
        }
        if (areaBlocked) continue;

        // Collision check (only if not at the destination, to allow targeting)
        if (!(nx === end.x && ny === end.y) && isCellOccupied(nx, ny, start, monsters, playerPos, creatureSize)) continue;

        const nIdx = ny * width + nx;
        const newDist = dists[currentIdx] + 1;

        if (newDist < dists[nIdx]) {
          parents[nIdx] = currentIdx;
          dists[nIdx] = newDist;
          if (!openSet.includes(nIdx)) {
            openSet.push(nIdx);
          }
        }
      }
    }
  }

  return null;
};

/**
 * Calculates all reachable cells within a range using Dijkstra/BFS.
 * Returns a Set of "x,y" strings.
 */
export const getReachableCells = (start: Point, range: number, grid: TacticalCell[][], monsters: CombatMonster[] = [], playerPos: Point = { x: -1, y: -1 }, creatureSize: 'Medium' | 'Large' = 'Medium'): Set<string> => {
  const width = grid[0].length;
  const height = grid.length;
  const size = width * height;
  
  const reachable = new Set<string>();
  const dists = new Float32Array(size).fill(Infinity);
  const startIdx = start.y * width + start.x;
  dists[startIdx] = 0;
  
  const queue = [startIdx];
  
  while (queue.length > 0) {
    const currentIdx = queue.shift()!;
    const d = dists[currentIdx];
    
    const cx = currentIdx % width;
    const cy = Math.floor(currentIdx / width);
    reachable.add(`${cx},${cy}`);

    if (d >= range) continue;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const cell = grid[ny][nx];
        if (cell.type === 'wall' || (cell.type === 'door' && !cell.isOpen)) continue;

        // Footprint check for larger creatures
        const footprint = creatureSize === 'Large' ? 2 : 1;
        let areaBlocked = false;
        for (let fy = 0; fy < footprint; fy++) {
          for (let fx = 0; fx < footprint; fx++) {
            const tx = nx + fx;
            const ty = ny + fy;
            if (tx >= width || ty >= height) { areaBlocked = true; break; }
            const tCell = grid[ty][tx];
            if (tCell.type === 'wall' || (tCell.type === 'door' && !tCell.isOpen)) { areaBlocked = true; break; }
          }
          if (areaBlocked) break;
        }
        if (areaBlocked) continue;

        // Collision check
        if (isCellOccupied(nx, ny, start, monsters, playerPos, creatureSize)) continue;

        const nIdx = ny * width + nx;
        const newDist = d + 1;
        if (newDist < dists[nIdx]) {
          dists[nIdx] = newDist;
          queue.push(nIdx);
        }
      }
    }
  }
  return reachable;
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
