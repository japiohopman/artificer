import { BattleMap } from '../types/battleMap';
import { createDefaultMap } from '../state/editorDefaults';

export const migrateBattleMap = (data: any): BattleMap => {
  if (!data) {
    return createDefaultMap();
  }

  // If already version 1, return as is
  if (data.version === 1) {
    return data as BattleMap;
  }

  // Parse legacy map schema if detected, or bind into version 1 format
  const defaultMap = createDefaultMap(data.gridSize?.width || 16, data.gridSize?.height || 12);

  // Map legacy arrays
  const mappedWalls = (data.walls || []).map((key: string) => {
    const [xStr, yStr] = key.split(',');
    return {
      id: `wall-${Math.random().toString(36).substr(2, 5)}`,
      orientation: 'horizontal' as const,
      x: parseInt(xStr),
      y: parseInt(yStr),
      type: 'wall' as const
    };
  });

  const mappedTerrain = (data.rooms || []).map((key: string) => {
    const [xStr, yStr] = key.split(',');
    return {
      x: parseInt(xStr),
      y: parseInt(yStr),
      type: 'stone'
    };
  });

  const mappedTokens: any[] = [];
  (data.enemies || []).forEach(([key, name]: [string, string]) => {
    const [xStr, yStr] = key.split(',');
    mappedTokens.push({
      id: `tok-${Math.random().toString(36).substr(2, 5)}`,
      name,
      type: 'enemy' as const,
      x: parseInt(xStr),
      y: parseInt(yStr),
      size: 'Medium' as const
    });
  });

  if (data.entrance) {
    mappedTokens.push({
      id: `tok-${Math.random().toString(36).substr(2, 5)}`,
      name: 'Spawn Point',
      type: 'player' as const,
      x: data.entrance.x,
      y: data.entrance.y,
      size: 'Medium' as const
    });
  }

  return {
    ...defaultMap,
    metadata: {
      ...defaultMap.metadata,
      theme: data.theme || 'dungeon'
    },
    grid: {
      ...defaultMap.grid,
      scale: data.scale || 5
    },
    walls: mappedWalls,
    terrain: mappedTerrain,
    tokens: mappedTokens
  };
};
