import { WallSegment, BattleMap } from '../types/battleMap';

export interface Point {
  x: number;
  y: number;
}

export function lineSegmentsIntersect(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point
): boolean {
  const s1_x = p1.x - p0.x;
  const s1_y = p1.y - p0.y;
  const s2_x = p3.x - p2.x;
  const s2_y = p3.y - p2.y;

  const s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y);
  const t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y);

  return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

/**
 * Checks Line of Sight between two coordinates using physical Wall/Door segments instead of cellular lists.
 */
export function checkGeometryLoS(
  start: Point, // grid index centered or fractional
  end: Point,
  walls: WallSegment[]
): boolean {
  // Convert standard grids into floating coordinates (+0.5 for centering)
  const p0 = { x: start.x + 0.5, y: start.y + 0.5 };
  const p1 = { x: end.x + 0.5, y: end.y + 0.5 };

  for (const w of walls) {
    // If door is open, it does not block LoS
    if (w.type === 'door' && w.doorState === 'open') continue;

    let w0: Point;
    let w1: Point;

    if (w.orientation === 'horizontal') {
      w0 = { x: w.x, y: w.y };
      w1 = { x: w.x + 1, y: w.y };
    } else {
      w0 = { x: w.x, y: w.y };
      w1 = { x: w.x, y: w.y + 1 };
    }

    if (lineSegmentsIntersect(p0, p1, w0, w1)) {
      return false; // Intersection blocks LoS
    }
  }

  return true;
}

export const COVER_TYPES = {
  NO_COVER: 'No Cover',
  HALF_COVER: 'Half Cover',
  THREE_QUARTERS_COVER: 'Three-Quarters Cover',
  FULL_COVER: 'Full Cover'
} as const;

/**
 * Calculates Cover by evaluating if walls block lines from the attacker's corners/center to the target's corners/center.
 */
export function calculateGeometryCover(
  attacker: Point,
  target: Point,
  walls: WallSegment[]
): string {
  if (attacker.x === target.x && attacker.y === target.y) return COVER_TYPES.NO_COVER;

  // Let's sample 5 rays: Center-to-Center, and Center-to-4-Corners of target cell
  const start = { x: attacker.x + 0.5, y: attacker.y + 0.5 };
  const targets = [
    { x: target.x + 0.5, y: target.y + 0.5 }, // center
    { x: target.x + 0.1, y: target.y + 0.1 }, // top-left
    { x: target.x + 0.9, y: target.y + 0.1 }, // top-right
    { x: target.x + 0.1, y: target.y + 0.9 }, // bottom-left
    { x: target.x + 0.9, y: target.y + 0.9 }  // bottom-right
  ];

  let blockedRays = 0;

  for (const t of targets) {
    let rayBlocked = false;
    for (const w of walls) {
      if (w.type === 'door' && w.doorState === 'open') continue;

      let w0: Point;
      let w1: Point;

      if (w.orientation === 'horizontal') {
        w0 = { x: w.x, y: w.y };
        w1 = { x: w.x + 1, y: w.y };
      } else {
        w0 = { x: w.x, y: w.y };
        w1 = { x: w.x, y: w.y + 1 };
      }

      if (lineSegmentsIntersect(start, t, w0, w1)) {
        rayBlocked = true;
        break;
      }
    }
    if (rayBlocked) {
      blockedRays++;
    }
  }

  if (blockedRays === 0) return COVER_TYPES.NO_COVER;
  if (blockedRays >= 5) return COVER_TYPES.FULL_COVER;
  if (blockedRays >= 3) return COVER_TYPES.THREE_QUARTERS_COVER;
  return COVER_TYPES.HALF_COVER;
}
