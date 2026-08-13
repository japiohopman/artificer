import { BattleMap } from '../types/battleMap';
import { TacticalCell, CombatMonster } from '../../../../store/useGameStore';
import { useAtlasStore } from '../../../../store/useAtlasStore';

export interface CombatGridRepresentation {
  grid: TacticalCell[][];
  monsters: CombatMonster[];
  background: string | null;
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

  // 2. Map cells painted as wall/door terrain or walls in close proximity to cell boundaries
  // Note: Standard combat engine matches cells containing doors/walls. We adapt the segments safely.
  // Walls are boundary segments rather than full blocked cells, so they are not set to 'wall' type on cells.
  // Doors are mapped so they can be clicked/interacted with.
  for (const w of map.walls) {
    if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
      if (w.type === 'door' || w.type === 'secret-door') {
        grid[w.y][w.x].type = 'door';
        grid[w.y][w.x].isOpen = w.doorState === 'open';
      }
    }
  }

  // 3. Map tokens to standard CombatMonsters referencing the Atlas store Bestiary definitions
  const monstersList = useAtlasStore.getState().monstersList;

  const monsters: CombatMonster[] = map.tokens.map((t) => {
    const isAlly = t.type === 'player' || t.type === 'npc';
    const foundMonster = monstersList.find(m => m.index === t.index || m.name === t.name);

    return {
      id: t.id,
      name: t.name,
      type: t.type === 'enemy' ? 'enemy' : 'neutral',
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
    };
  });

  // 4. Resolve background
  const background = map.metadata.theme ? `${map.metadata.theme}.png` : 'fay_forest.png';

  return {
    grid,
    monsters,
    background
  };
}
