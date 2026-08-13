import { Command } from './command';
import { BattleMap, WallSegment, MapObject, MapToken, TerrainCell, MapLabel, MapMarker } from '../types/battleMap';

// 1. Walls
export const createAddWallCommand = (wall: WallSegment): Command => ({
  id: `add-wall-${wall.id}`,
  description: `Add Wall at (${wall.x}, ${wall.y})`,
  execute: (map) => ({ ...map, walls: [...map.walls, wall] }),
  undo: (map) => ({ ...map, walls: map.walls.filter(w => w.id !== wall.id) })
});

export const createRemoveWallCommand = (wall: WallSegment): Command => ({
  id: `remove-wall-${wall.id}`,
  description: `Remove Wall at (${wall.x}, ${wall.y})`,
  execute: (map) => ({ ...map, walls: map.walls.filter(w => w.id !== wall.id) }),
  undo: (map) => ({ ...map, walls: [...map.walls, wall] })
});

export const createUpdateWallCommand = (id: string, oldUpdates: Partial<WallSegment>, newUpdates: Partial<WallSegment>): Command => ({
  id: `update-wall-${id}-${Date.now()}`,
  description: `Update Wall ${id}`,
  execute: (map) => ({
    ...map,
    walls: map.walls.map(w => w.id === id ? { ...w, ...newUpdates } : w)
  }),
  undo: (map) => ({
    ...map,
    walls: map.walls.map(w => w.id === id ? { ...w, ...oldUpdates } : w)
  })
});

// 2. Terrain & Painting Transactions
export interface TerrainChange {
  x: number;
  y: number;
  oldType?: string; // undefined means cell had no terrain
  newType?: string; // undefined means cell is erased
}

export const createPaintTerrainCommand = (changes: TerrainChange[]): Command => ({
  id: `paint-terrain-${Date.now()}`,
  description: `Paint Terrain (${changes.length} cells)`,
  execute: (map) => {
    const terrainMap = new Map(map.terrain.map(t => [`${t.x},${t.y}`, t]));
    for (const change of changes) {
      const key = `${change.x},${change.y}`;
      if (change.newType === undefined) {
        terrainMap.delete(key);
      } else {
        terrainMap.set(key, { x: change.x, y: change.y, type: change.newType });
      }
    }
    return { ...map, terrain: Array.from(terrainMap.values()) };
  },
  undo: (map) => {
    const terrainMap = new Map(map.terrain.map(t => [`${t.x},${t.y}`, t]));
    for (const change of changes) {
      const key = `${change.x},${change.y}`;
      if (change.oldType === undefined) {
        terrainMap.delete(key);
      } else {
        terrainMap.set(key, { x: change.x, y: change.y, type: change.oldType });
      }
    }
    return { ...map, terrain: Array.from(terrainMap.values()) };
  }
});

// 3. Objects / Stamps
export const createAddObjectCommand = (obj: MapObject): Command => ({
  id: `add-obj-${obj.id}`,
  description: `Add Stamp ${obj.name}`,
  execute: (map) => ({ ...map, objects: [...map.objects, obj] }),
  undo: (map) => ({ ...map, objects: map.objects.filter(o => o.id !== obj.id) })
});

export const createRemoveObjectCommand = (obj: MapObject): Command => ({
  id: `remove-obj-${obj.id}`,
  description: `Remove Stamp ${obj.name}`,
  execute: (map) => ({ ...map, objects: map.objects.filter(o => o.id !== obj.id) }),
  undo: (map) => ({ ...map, objects: [...map.objects, obj] })
});

export const createUpdateObjectCommand = (id: string, oldUpdates: Partial<MapObject>, newUpdates: Partial<MapObject>): Command => ({
  id: `update-obj-${id}-${Date.now()}`,
  description: `Update Stamp ${id}`,
  execute: (map) => ({
    ...map,
    objects: map.objects.map(o => o.id === id ? { ...o, ...newUpdates } : o)
  }),
  undo: (map) => ({
    ...map,
    objects: map.objects.map(o => o.id === id ? { ...o, ...oldUpdates } : o)
  })
});

// 4. Tokens
export const createAddTokenCommand = (token: MapToken): Command => ({
  id: `add-tok-${token.id}`,
  description: `Add Token ${token.name}`,
  execute: (map) => ({ ...map, tokens: [...map.tokens, token] }),
  undo: (map) => ({ ...map, tokens: map.tokens.filter(t => t.id !== token.id) })
});

export const createRemoveTokenCommand = (token: MapToken): Command => ({
  id: `remove-tok-${token.id}`,
  description: `Remove Token ${token.name}`,
  execute: (map) => ({ ...map, tokens: map.tokens.filter(t => t.id !== token.id) }),
  undo: (map) => ({ ...map, tokens: [...map.tokens, token] })
});

export const createUpdateTokenCommand = (id: string, oldUpdates: Partial<MapToken>, newUpdates: Partial<MapToken>): Command => ({
  id: `update-tok-${id}-${Date.now()}`,
  description: `Update Token ${id}`,
  execute: (map) => ({
    ...map,
    tokens: map.tokens.map(t => t.id === id ? { ...t, ...newUpdates } : t)
  }),
  undo: (map) => ({
    ...map,
    tokens: map.tokens.map(t => t.id === id ? { ...t, ...oldUpdates } : t)
  })
});

// 5. Rooms (Atomic room addition of walls and floor cells)
export const createAddRoomCommand = (
  minX: number, minY: number, maxX: number, maxY: number,
  terrainType: string, wallType: 'wall' | 'door' | 'secret-door' | 'none',
  oldTerrain: TerrainCell[], oldWalls: WallSegment[],
  newTerrain: TerrainCell[], newWalls: WallSegment[]
): Command => ({
  id: `add-room-${Date.now()}`,
  description: `Add Room ${minX},${minY} to ${maxX},${maxY}`,
  execute: (map) => ({ ...map, terrain: newTerrain, walls: newWalls }),
  undo: (map) => ({ ...map, terrain: oldTerrain, walls: oldWalls })
});

// 6. Map Dimensions
export const createUpdateMapDimensionsCommand = (oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): Command => ({
  id: `update-dimensions-${Date.now()}`,
  description: `Resize Map to ${newWidth}x${newHeight}`,
  execute: (map) => ({ ...map, dimensions: { width: newWidth, height: newHeight } }),
  undo: (map) => ({ ...map, dimensions: { width: oldWidth, height: oldHeight } })
});

// 7. Labels
export const createAddLabelCommand = (label: MapLabel): Command => ({
  id: `add-lbl-${label.id}`,
  description: `Add Label ${label.text}`,
  execute: (map) => ({ ...map, labels: [...map.labels, label] }),
  undo: (map) => ({ ...map, labels: map.labels.filter(l => l.id !== label.id) })
});

export const createRemoveLabelCommand = (label: MapLabel): Command => ({
  id: `remove-lbl-${label.id}`,
  description: `Remove Label ${label.text}`,
  execute: (map) => ({ ...map, labels: map.labels.filter(l => l.id !== label.id) }),
  undo: (map) => ({ ...map, labels: [...map.labels, label] })
});

// 8. Markers
export const createAddMarkerCommand = (marker: MapMarker): Command => ({
  id: `add-mrk-${marker.id}`,
  description: `Add Marker ${marker.name}`,
  execute: (map) => ({ ...map, markers: [...map.markers, marker] }),
  undo: (map) => ({ ...map, markers: map.markers.filter(m => m.id !== marker.id) })
});

export const createRemoveMarkerCommand = (marker: MapMarker): Command => ({
  id: `remove-mrk-${marker.id}`,
  description: `Remove Marker ${marker.name}`,
  execute: (map) => ({ ...map, markers: map.markers.filter(m => m.id !== marker.id) }),
  undo: (map) => ({ ...map, markers: [...map.markers, marker] })
});
