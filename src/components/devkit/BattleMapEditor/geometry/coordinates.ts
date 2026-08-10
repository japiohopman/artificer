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
