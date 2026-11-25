import { BattleMap, MapEdge, WallSegment, MapPortal } from '../types/battleMap';
import { TacticalCell, CombatMonster } from '../../../../store/useGameStore';
import { useAtlasStore } from '../../../../store/useAtlasStore';

export interface CombatGridRepresentation {
  grid: TacticalCell[][];
  monsters: CombatMonster[];
  background: string | null;
  walls: (WallSegment | MapEdge)[];
  partySpawnPos: { x: number; y: number } | null;
  portals?: MapPortal[];
}

/**
 * Maps BattleMap Authoring schema structure into the CombatGrid runtime representations.
 */
export function battleMapToCombatGrid(map: BattleMap): CombatGridRepresentation {
  const { width, height } = map.dimensions;

  // 1. Initialize empty cellular tactical grid
  const grid: TacticalCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TacticalCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        type: 'floor',
        explored: true
      });
    }
    grid.push(row);
  }

  // 2. Map painted cell terrain (stone, grass, wood, water, mud, ice, lava, sand, etc.) and hazards
  if (map.terrain && Array.isArray(map.terrain)) {
    for (const t of map.terrain) {
      if (t.x >= 0 && t.x < width && t.y >= 0 && t.y < height) {
        grid[t.y][t.x].type = (t.type || 'floor') as any;
        if (t.elevation !== undefined) grid[t.y][t.x].elevation = t.elevation;
        if (t.movementCost !== undefined) grid[t.y][t.x].movementCost = t.movementCost;
        if (t.hazards && t.hazards.length > 0) grid[t.y][t.x].hazards = t.hazards;
      }
    }
  }

  // 3. Resolve boundary edges / walls for movement and LoS without destroying cell terrain
  const walls: (WallSegment | MapEdge)[] = [];
  if (map.edges && Array.isArray(map.edges) && map.edges.length > 0) {
    for (const e of map.edges) {
      walls.push({
        id: e.id,
        orientation: e.orientation,
        x: e.x,
        y: e.y,
        type: e.type,
        doorState: e.doorState
      });
    }
  } else if (map.walls && Array.isArray(map.walls)) {
    for (const w of map.walls) {
      walls.push({
        id: w.id,
        orientation: w.orientation,
        x: w.x,
        y: w.y,
        type: w.type,
        doorState: w.doorState
      });
    }
  }

  // 4. Extract tokens: resolve enemy/NPC monsters and player spawn/entry points
  const monstersList = useAtlasStore.getState().monstersList;
  let partySpawnPos: { x: number; y: number } | null = null;
  const monsters: CombatMonster[] = [];

  if (map.tokens && Array.isArray(map.tokens)) {
    for (const t of map.tokens) {
      if (t.type === 'player' || (t.type === 'marker' && t.name.toLowerCase().includes('spawn'))) {
        if (!partySpawnPos) {
          partySpawnPos = { x: t.x, y: t.y };
        }
        if (t.type === 'player') continue; // Player spawn tokens define entry point, not active CombatMonster entities
      }

      const isAlly = t.type === 'npc';
      const foundMonster = monstersList.find(m => m.index === t.index || m.name.toLowerCase() === t.name.toLowerCase()) as any;

      monsters.push({
        id: t.id,
        name: t.name,
        type: t.type === 'enemy' ? 'enemy' : (t.type === 'npc' ? 'npc' : 'neutral'),
        hp: foundMonster?.hit_points || 30,
        maxHp: foundMonster?.hit_points || 30,
        x: t.x,
        y: t.y,
        imageUrl: t.imageUrl || foundMonster?.imageUrl || '/assets/atlas/enemies/tokens/orc_sentry.webp',
        awareness: 'idle',
        viewDirection: 3,
        perception: foundMonster?.senses?.passive_perception || 12,
        speed: foundMonster?.speed?.walk ? Math.max(1, Math.round(parseInt(foundMonster.speed.walk) / 5)) : 6,
        size: t.size,
        isAlly,
        stats: foundMonster ? {
          str: foundMonster.strength || 10,
          dex: foundMonster.dexterity || 10,
          con: foundMonster.constitution || 10,
          int: foundMonster.intelligence || 10,
          wis: foundMonster.wisdom || 10,
          cha: foundMonster.charisma || 10
        } : undefined,
        actions: foundMonster?.actions || [],
        special_abilities: foundMonster?.special_abilities || []
      });
    }
  }

  // Check explicit portals for entrance point if partySpawnPos not found in tokens
  if (!partySpawnPos && map.portals && Array.isArray(map.portals)) {
    const entrancePortal = map.portals.find(p => p.type === 'entrance');
    if (entrancePortal) {
      partySpawnPos = { x: entrancePortal.x, y: entrancePortal.y };
    }
  }

  // Check map markers for explicit entry/entrance point if still not found
  if (!partySpawnPos && map.markers && Array.isArray(map.markers)) {
    const entranceMarker = map.markers.find(m => m.type === 'entrance' || m.name.toLowerCase().includes('entrance') || m.name.toLowerCase().includes('spawn'));
    if (entranceMarker) {
      partySpawnPos = { x: entranceMarker.x, y: entranceMarker.y };
    }
  }

  // 5. Resolve background
  const background = map.metadata?.theme ? `${map.metadata.theme}.png` : 'fay_forest.png';

  return {
    grid,
    monsters,
    background,
    walls,
    partySpawnPos,
    portals: map.portals || []
  };
}
