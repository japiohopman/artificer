import { BattleMap, WallSegment } from '../types/battleMap';
import { TacticalCell, CombatMonster } from '../../../../store/useGameStore';
import { useAtlasStore } from '../../../../store/useAtlasStore';

export interface CombatGridRepresentation {
  grid: TacticalCell[][];
  monsters: CombatMonster[];
  background: string | null;
  walls: WallSegment[];
  partySpawnPos: { x: number; y: number } | null;
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

  // 2. Map painted cell terrain (stone, grass, wood, water, mud, ice, lava, sand, etc.)
  if (map.terrain && Array.isArray(map.terrain)) {
    for (const t of map.terrain) {
      if (t.x >= 0 && t.x < width && t.y >= 0 && t.y < height) {
        grid[t.y][t.x].type = (t.type || 'floor') as any;
      }
    }
  }

  // 3. Map doors onto the grid for interactability while leaving walls as boundary line segments
  if (map.walls && Array.isArray(map.walls)) {
    for (const w of map.walls) {
      if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
        if (w.type === 'door' || w.type === 'secret-door') {
          grid[w.y][w.x].type = 'door';
          grid[w.y][w.x].isOpen = w.doorState === 'open';
        }
      }
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

  // Check map markers for explicit entry/entrance point if partySpawnPos not found in tokens
  if (!partySpawnPos && map.markers && Array.isArray(map.markers)) {
    const entranceMarker = map.markers.find(m => m.type === 'entrance' || m.name.toLowerCase().includes('entrance') || m.name.toLowerCase().includes('spawn'));
    if (entranceMarker) {
      partySpawnPos = { x: entranceMarker.x, y: entranceMarker.y };
    }
  }

  // 5. Resolve background
  const background = map.metadata.theme ? `${map.metadata.theme}.png` : 'fay_forest.png';

  return {
    grid,
    monsters,
    background,
    walls: map.walls || [],
    partySpawnPos
  };
}
