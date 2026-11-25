import { BattleMap } from '../types/battleMap';
import { isValidEdgeCoordinate } from '../geometry/coordinates';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateBattleMap = (map: any): ValidationResult => {
  const errors: string[] = [];

  if (!map) {
    errors.push('Map data is empty.');
    return { isValid: false, errors };
  }

  // Schema version validation: Only versions 1 and 2 are recognized
  if (map.version !== undefined && map.version !== 1 && map.version !== 2) {
    errors.push(`Unsupported map schema version: ${map.version}. Only versions 1 and 2 are supported.`);
    return { isValid: false, errors };
  }

  if (!map.name || typeof map.name !== 'string' || map.name.trim() === '') {
    errors.push('Map name is empty.');
  }

  if (!map.dimensions || typeof map.dimensions.width !== 'number' || typeof map.dimensions.height !== 'number' || map.dimensions.width < 4 || map.dimensions.height < 4) {
    errors.push('Map dimensions must be at least 4x4 (minimum 4x4).');
  }

  const width = map.dimensions?.width || 0;
  const height = map.dimensions?.height || 0;

  // v2 Edge Validation
  if (map.version === 2 && map.edges && Array.isArray(map.edges)) {
    const seenEdgeIds = new Set<string>();

    for (let i = 0; i < map.edges.length; i++) {
      const edge = map.edges[i];
      if (!edge || typeof edge !== 'object') {
        errors.push(`Edge at index ${i} is not a valid object.`);
        continue;
      }

      if (edge.orientation !== 'horizontal' && edge.orientation !== 'vertical') {
        errors.push(`Edge '${edge.id || i}' has invalid orientation '${edge.orientation}'. Must be 'horizontal' or 'vertical'.`);
      }

      const expectedId = `${edge.orientation === 'horizontal' ? 'h' : 'v'}:${edge.x},${edge.y}`;
      if (edge.id && edge.id !== expectedId) {
        errors.push(`Edge at index ${i} has ID '${edge.id}' which does not match expected deterministic key '${expectedId}'.`);
      }

      if (seenEdgeIds.has(expectedId)) {
        errors.push(`Duplicate edge detected for deterministic boundary key '${expectedId}'.`);
      }
      seenEdgeIds.add(expectedId);

      if (width >= 4 && height >= 4 && !isValidEdgeCoordinate(edge.orientation, edge.x, edge.y, width, height)) {
        errors.push(`Edge '${expectedId}' coordinates (${edge.x}, ${edge.y}) exceed valid map bounds for orientation '${edge.orientation}' on a ${width}x${height} map.`);
      }

      const validTypes = ['wall', 'low-wall', 'door', 'secret-door'];
      if (!validTypes.includes(edge.type)) {
        errors.push(`Edge '${expectedId}' has invalid type '${edge.type}'.`);
      }

      if (edge.doorState && !['open', 'closed', 'locked'].includes(edge.doorState)) {
        errors.push(`Edge '${expectedId}' has invalid doorState '${edge.doorState}'.`);
      }
    }
  }

  // Terrain Cell Validation
  if (map.terrain && Array.isArray(map.terrain)) {
    for (const cell of map.terrain) {
      if (width >= 4 && height >= 4) {
        if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height) {
          errors.push(`Terrain cell at (${cell.x}, ${cell.y}) is out of bounds for a ${width}x${height} map.`);
        }
      }
      if (cell.hazards && Array.isArray(cell.hazards)) {
        for (const h of cell.hazards) {
          if (!h.category || !['surface', 'cloud', 'pit', 'trap'].includes(h.category)) {
            errors.push(`Hazard '${h.id || 'unnamed'}' on cell (${cell.x}, ${cell.y}) has invalid category '${h.category}'.`);
          }
        }
      }
    }
  }

  // Portal Validation (v2)
  if (map.portals && Array.isArray(map.portals)) {
    for (const p of map.portals) {
      if (p.type !== 'entrance' && p.type !== 'exit') {
        errors.push(`Portal '${p.name || p.id}' has invalid type '${p.type}'. Must be 'entrance' or 'exit'.`);
      }
      if (width >= 4 && height >= 4) {
        if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height) {
          errors.push(`Portal '${p.name || p.id}' coordinates (${p.x}, ${p.y}) are out of bounds for a ${width}x${height} map.`);
        }
      }
    }
  }

  const hasEdges = (map.edges && map.edges.length > 0) || (map.walls && map.walls.length > 0);
  const hasTerrain = map.terrain && map.terrain.length > 0;
  const hasObjects = map.objects && map.objects.length > 0;
  const hasTokens = map.tokens && map.tokens.length > 0;
  const hasPortals = map.portals && map.portals.length > 0;

  if (!hasEdges && !hasTerrain && !hasObjects && !hasTokens && !hasPortals) {
    errors.push('The map has no edges, walls, terrain, objects, portals, or tokens.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
