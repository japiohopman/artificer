import { WallSegment, MapObject, MapToken } from '../types/battleMap';

export function findWallAt(
  walls: WallSegment[],
  gx: number,
  gy: number,
  orientation: 'horizontal' | 'vertical'
): WallSegment | undefined {
  return walls.find((w) => w.x === gx && w.y === gy && w.orientation === orientation);
}

export function findObjectAt(
  objects: MapObject[],
  wx: number, // world coordinate
  wy: number,
  cellSize: number
): MapObject | undefined {
  // Sort reverse to prioritize topmost objects (z-index ordering)
  const sorted = [...objects].reverse();
  return sorted.find((o) => {
    if (o.isLocked) return false;
    const px = o.x * cellSize;
    const py = o.y * cellSize;
    // Simple radius bounding box check (1 cell size default bounding box)
    const size = cellSize * o.scale;
    const half = size / 2;
    return wx >= px - half && wx <= px + half && wy >= py - half && wy <= py + half;
  });
}

export function findTokenAt(
  tokens: MapToken[],
  gx: number,
  gy: number
): MapToken | undefined {
  return tokens.find((t) => {
    const footprint = t.size === 'Large' ? 2 : 1;
    return gx >= t.x && gx < t.x + footprint && gy >= t.y && gy < t.y + footprint;
  });
}
