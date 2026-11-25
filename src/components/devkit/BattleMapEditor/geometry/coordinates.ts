export interface Point {
  x: number;
  y: number;
}

export function worldToGrid(
  px: number,
  py: number,
  panX: number,
  panY: number,
  zoom: number,
  cellSize: number
): Point {
  const worldX = (px - panX) / zoom;
  const worldY = (py - panY) / zoom;
  return {
    x: Math.floor(worldX / cellSize),
    y: Math.floor(worldY / cellSize)
  };
}

export function gridToWorld(
  gx: number,
  gy: number,
  panX: number,
  panY: number,
  zoom: number,
  cellSize: number
): Point {
  const worldX = gx * cellSize;
  const worldY = gy * cellSize;
  return {
    x: worldX * zoom + panX,
    y: worldY * zoom + panY
  };
}

/**
 * Returns the exact snap position within a cell depending on target requirements.
 * E.g., snapping a wall segment to vertical or horizontal grid boundary lines.
 */
export function getWallSnap(
  px: number,
  py: number,
  panX: number,
  panY: number,
  zoom: number,
  cellSize: number
): { x: number; y: number; orientation: 'horizontal' | 'vertical' } {
  const worldX = (px - panX) / zoom;
  const worldY = (py - panY) / zoom;

  const cellX = Math.floor(worldX / cellSize);
  const cellY = Math.floor(worldY / cellSize);

  const localX = worldX - cellX * cellSize;
  const localY = worldY - cellY * cellSize;

  // Determine if closer to a horizontal grid line or vertical grid line
  const distToLeft = localX;
  const distToRight = cellSize - localX;
  const distToTop = localY;
  const distToBottom = cellSize - localY;

  const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

  if (minDist === distToTop) {
    return { x: cellX, y: cellY, orientation: 'horizontal' };
  } else if (minDist === distToBottom) {
    return { x: cellX, y: cellY + 1, orientation: 'horizontal' };
  } else if (minDist === distToLeft) {
    return { x: cellX, y: cellY, orientation: 'vertical' };
  } else {
    return { x: cellX + 1, y: cellY, orientation: 'vertical' };
  }
}

/**
 * Returns deterministic edge identifier for a given boundary spine.
 * Horizontal: "h:x,y" (along grid line y, from x to x+1)
 * Vertical: "v:x,y" (along grid line x, from y to y+1)
 */
export function getEdgeId(orientation: 'horizontal' | 'vertical', x: number, y: number): string {
  return `${orientation === 'horizontal' ? 'h' : 'v'}:${x},${y}`;
}

/**
 * Parses an edge ID back to its orientation and coordinate components.
 */
export function parseEdgeId(id: string): { orientation: 'horizontal' | 'vertical'; x: number; y: number } | null {
  const match = String(id || '').match(/^([hv]):(-?\d+),(-?\d+)$/);
  if (!match) return null;
  return {
    orientation: match[1] === 'h' ? 'horizontal' : 'vertical',
    x: parseInt(match[2], 10),
    y: parseInt(match[3], 10)
  };
}

/**
 * Validates edge coordinates against map dimensions:
 * Horizontal: 0 <= x < width, 0 <= y <= height
 * Vertical: 0 <= x <= width, 0 <= y < height
 */
export function isValidEdgeCoordinate(
  orientation: 'horizontal' | 'vertical',
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
  if (width < 1 || height < 1) return false;

  if (orientation === 'horizontal') {
    return x >= 0 && x < width && y >= 0 && y <= height;
  }
  return x >= 0 && x <= width && y >= 0 && y < height;
}

/**
 * Returns the four deterministic spine IDs bounding a cell at (x, y):
 * North: h:x,y
 * South: h:x,y+1
 * West: v:x,y
 * East: v:x+1,y
 */
export function getCellSpineIds(x: number, y: number): {
  north: string;
  south: string;
  west: string;
  east: string;
} {
  return {
    north: `h:${x},${y}`,
    south: `h:${x},${y + 1}`,
    west: `v:${x},${y}`,
    east: `v:${x + 1},${y}`
  };
}

/**
 * Resolves the 4 edge objects surrounding a cell from an edge map or collection.
 */
export function getCellEdges<T extends { id: string }>(
  x: number,
  y: number,
  edges: T[] | Map<string, T> | Record<string, T>
): {
  north?: T;
  south?: T;
  west?: T;
  east?: T;
} {
  const spines = getCellSpineIds(x, y);

  if (edges instanceof Map) {
    return {
      north: edges.get(spines.north),
      south: edges.get(spines.south),
      west: edges.get(spines.west),
      east: edges.get(spines.east)
    };
  }

  if (Array.isArray(edges)) {
    const map = new Map<string, T>();
    for (const e of edges) map.set(e.id, e);
    return {
      north: map.get(spines.north),
      south: map.get(spines.south),
      west: map.get(spines.west),
      east: map.get(spines.east)
    };
  }

  return {
    north: edges[spines.north],
    south: edges[spines.south],
    west: edges[spines.west],
    east: edges[spines.east]
  };
}
