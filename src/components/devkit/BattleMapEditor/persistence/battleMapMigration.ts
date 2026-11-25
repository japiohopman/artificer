import { BattleMap, MapEdge, MapPortal, MapMarker, EdgeType } from '../types/battleMap';
import { createDefaultMap } from '../state/editorDefaults';
import { getEdgeId } from '../geometry/coordinates';

export const migrateBattleMap = (data: any): BattleMap => {
  if (!data) {
    return createDefaultMap();
  }

  // If already version 2, normalize arrays and return
  if (data.version === 2) {
    return {
      ...data,
      edges: data.edges || [],
      portals: data.portals || [],
      terrain: data.terrain || [],
      objects: data.objects || [],
      tokens: data.tokens || [],
      labels: data.labels || [],
      markers: data.markers || [],
      layers: data.layers || []
    } as BattleMap;
  }

  // If version 1, migrate to version 2
  if (data.version === 1) {
    return migrateV1ToV2(data);
  }

  // Pre-v1 legacy schema parsing: map legacy arrays into v1 intermediate, then to v2
  const defaultMap = createDefaultMap(data.gridSize?.width || 16, data.gridSize?.height || 12);

  const legacyWalls = (data.walls || []).map((key: string) => {
    const [xStr, yStr] = key.split(',');
    return {
      id: `wall-${Math.random().toString(36).substr(2, 5)}`,
      orientation: 'horizontal' as const,
      x: parseInt(xStr, 10),
      y: parseInt(yStr, 10),
      type: 'wall' as const
    };
  });

  const legacyTerrain = (data.rooms || []).map((key: string) => {
    const [xStr, yStr] = key.split(',');
    return {
      x: parseInt(xStr, 10),
      y: parseInt(yStr, 10),
      type: 'stone'
    };
  });

  const legacyTokens: any[] = [];
  (data.enemies || []).forEach(([key, name]: [string, string]) => {
    const [xStr, yStr] = key.split(',');
    legacyTokens.push({
      id: `tok-${Math.random().toString(36).substr(2, 5)}`,
      name,
      type: 'enemy' as const,
      x: parseInt(xStr, 10),
      y: parseInt(yStr, 10),
      size: 'Medium' as const
    });
  });

  const legacyMarkers: any[] = [];
  if (data.entrance) {
    legacyMarkers.push({
      id: `mrk-${Math.random().toString(36).substr(2, 5)}`,
      name: 'Main Entrance',
      type: 'entrance',
      x: data.entrance.x,
      y: data.entrance.y
    });
    // Also provide player spawn token for legacy entrance
    legacyTokens.push({
      id: `tok-player-spawn`,
      name: 'Spawn Point',
      type: 'player' as const,
      x: data.entrance.x,
      y: data.entrance.y,
      size: 'Medium' as const
    });
  }

  const v1Map: BattleMap = {
    ...defaultMap,
    version: 1,
    metadata: {
      ...defaultMap.metadata,
      theme: data.theme || 'dungeon'
    },
    grid: {
      ...defaultMap.grid,
      scale: data.scale || 5
    },
    walls: legacyWalls,
    terrain: legacyTerrain,
    tokens: legacyTokens,
    markers: legacyMarkers
  };

  return migrateV1ToV2(v1Map);
};

/**
 * Losslessly migrates a Version 1 BattleMap into a Version 2 BattleMap:
 * 1. Walls -> Canonical deterministic edges (h:x,y and v:x,y).
 * 2. Entrance/Exit markers -> Portals (while preserving player tokens).
 * 3. Preserves authored terrain as authored (zero inferred movement costs).
 */
function migrateV1ToV2(v1: any): BattleMap {
  // 1. Transform walls to canonical MapEdge collection with deterministic keys
  const edgeMap = new Map<string, MapEdge>();

  if (v1.walls && Array.isArray(v1.walls)) {
    for (const w of v1.walls) {
      if (!w || typeof w.x !== 'number' || typeof w.y !== 'number' || !w.orientation) continue;
      const orientation: 'horizontal' | 'vertical' = w.orientation === 'vertical' ? 'vertical' : 'horizontal';
      const edgeId = getEdgeId(orientation, w.x, w.y);

      let edgeType: EdgeType = 'wall';
      if (w.type === 'door' || w.type === 'secret-door' || w.type === 'low-wall') {
        edgeType = w.type;
      }

      const doorState = (edgeType === 'door' || edgeType === 'secret-door')
        ? (w.doorState || 'closed')
        : undefined;

      // If an edge already exists at this key, merge cleanly (doors take precedence over plain walls)
      if (edgeMap.has(edgeId)) {
        const existing = edgeMap.get(edgeId)!;
        if (edgeType === 'door' || edgeType === 'secret-door') {
          edgeMap.set(edgeId, {
            id: edgeId,
            orientation,
            x: w.x,
            y: w.y,
            type: edgeType,
            doorState
          });
        }
      } else {
        edgeMap.set(edgeId, {
          id: edgeId,
          orientation,
          x: w.x,
          y: w.y,
          type: edgeType,
          doorState
        });
      }
    }
  }

  // Also include any pre-existing v2 edges if present
  if (v1.edges && Array.isArray(v1.edges)) {
    for (const e of v1.edges) {
      const edgeId = getEdgeId(e.orientation, e.x, e.y);
      edgeMap.set(edgeId, {
        id: edgeId,
        orientation: e.orientation,
        x: e.x,
        y: e.y,
        type: e.type || 'wall',
        doorState: e.doorState
      });
    }
  }

  // 2. Separate entrance/exit markers into portals; retain other markers
  const portals: MapPortal[] = [];
  const retainedMarkers: MapMarker[] = [];

  if (v1.portals && Array.isArray(v1.portals)) {
    portals.push(...v1.portals);
  }

  if (v1.markers && Array.isArray(v1.markers)) {
    for (const m of v1.markers) {
      if (m.type === 'entrance' || m.type === 'exit') {
        // Only add if not already in portals
        if (!portals.some(p => p.x === m.x && p.y === m.y && p.type === m.type)) {
          portals.push({
            id: m.id || `portal-${m.type}-${m.x}-${m.y}`,
            type: m.type,
            name: m.name || (m.type === 'entrance' ? 'Entrance' : 'Exit'),
            x: m.x,
            y: m.y,
            description: m.description
          });
        }
      } else {
        retainedMarkers.push(m);
      }
    }
  }

  // 3. Tokens: Player tokens MUST remain in tokens (NOT converted to portals)
  const tokens = Array.isArray(v1.tokens) ? [...v1.tokens] : [];

  // 4. Terrain: Preserved as authored, no inferred movement costs
  const terrain = Array.isArray(v1.terrain) ? v1.terrain.map((t: any) => ({ ...t })) : [];

  const edges = Array.from(edgeMap.values());

  return {
    ...v1,
    version: 2,
    edges,
    portals,
    terrain,
    tokens,
    markers: retainedMarkers,
    // Keep legacy walls array mirrored for backward-compatibility with unupdated readers
    walls: edges.map(e => ({
      id: e.id,
      orientation: e.orientation,
      x: e.x,
      y: e.y,
      type: e.type === 'low-wall' ? 'wall' : (e.type as any),
      doorState: e.doorState
    }))
  };
}
