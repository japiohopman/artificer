import { REGION_PATH_REGISTRY } from '../data/regions';

interface Point {
  x: number;
  y: number;
}

/**
 * Parses a simple SVG path string into an array of points (polygon).
 */
export const parseSVGPath = (pathStr: string): Point[] => {
  const points: Point[] = [];
  let currentX = 0;
  let currentY = 0;

  // Improved regex to handle numbers more robustly
  const commands = pathStr.match(/[a-df-z][^a-df-z]*/ig) || [];

  for (const cmdStr of commands) {
    const type = cmdStr[0];
    // Better split for numbers, handling negative signs and multiple spaces
    const args = cmdStr.slice(1).trim().split(/[\s,]+|(?=-)/).filter(s => s.trim() !== '').map(Number);

    switch (type.toLowerCase()) {
      case 'm': // moveto
        for (let i = 0; i < args.length; i += 2) {
          if (isNaN(args[i]) || isNaN(args[i+1])) continue;
          if (type === 'm') {
            currentX += args[i];
            currentY += args[i + 1];
          } else {
            currentX = args[i];
            currentY = args[i + 1];
          }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'l': // lineto
        for (let i = 0; i < args.length; i += 2) {
          if (isNaN(args[i]) || isNaN(args[i+1])) continue;
          if (type === 'l') {
            currentX += args[i];
            currentY += args[i + 1];
          } else {
            currentX = args[i];
            currentY = args[i + 1];
          }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'h': // horizontal lineto
        for (let i = 0; i < args.length; i++) {
          if (isNaN(args[i])) continue;
          if (type === 'h') {
            currentX += args[i];
          } else {
            currentX = args[i];
          }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'v': // vertical lineto
        for (let i = 0; i < args.length; i++) {
          if (isNaN(args[i])) continue;
          if (type === 'v') {
            currentY += args[i];
          } else {
            currentY = args[i];
          }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'c': // curve (simplified)
        for (let i = 0; i < args.length; i += 6) {
          if (type === 'c') {
            currentX += args[i + 4];
            currentY += args[i + 5];
          } else {
            currentX = args[i + 4];
            currentY = args[i + 5];
          }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'z': // closepath
        if (points.length > 0) {
          points.push({ x: points[0].x, y: points[0].y });
        }
        break;
    }
  }

  return points;
};

export const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const MAP_WIDTH_PROTO = 4763;
const MAP_HEIGHT_PROTO = 3185;
const SVG_VIEWBOX_WIDTH = 1600;
const SVG_VIEWBOX_HEIGHT = 1070;

const polygonCache: Record<string, Point[]> = {};

export const getRegionAt = (protoX: number, protoY: number): string => {
  const svgX = (protoX / MAP_WIDTH_PROTO) * SVG_VIEWBOX_WIDTH;
  const svgY = (protoY / MAP_HEIGHT_PROTO) * SVG_VIEWBOX_HEIGHT;
  const point = { x: svgX, y: svgY };

  for (const [id, path] of Object.entries(REGION_PATH_REGISTRY)) {
    if (!polygonCache[id]) {
      polygonCache[id] = parseSVGPath(path);
    }
    
    if (isPointInPolygon(point, polygonCache[id])) {
      return id;
    }
  }

  return 'water';
};
