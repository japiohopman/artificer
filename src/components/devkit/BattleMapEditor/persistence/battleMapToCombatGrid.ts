import { BattleMap } from '../types/battleMap';
import { TacticalCell, CombatMonster } from '../../../../store/useGameStore';

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
  for (const w of map.walls) {
    if (w.x >= 0 && w.x < width && w.y >= 0 && w.y < height) {
      if (w.type === 'wall') {
        grid[w.y][w.x].type = 'wall';
      } else if (w.type === 'door' || w.type === 'secret-door') {
        grid[w.y][w.x].type = 'door';
        grid[w.y][w.x].isOpen = w.doorState === 'open';
      }
    }
  }

  // 3. Map tokens to standard CombatMonsters
  const monsters: CombatMonster[] = map.tokens.map((t) => {
    const isAlly = t.type === 'player' || t.type === 'npc';
    return {
      id: t.id,
      name: t.name,
      type: t.type === 'enemy' ? 'enemy' : 'neutral',
      hp: 30, // standard default
      maxHp: 30,
      x: t.x,
      y: t.y,
      imageUrl: t.imageUrl || '/assets/atlas/enemies/tokens/orc_sentry.webp',
      awareness: 'idle',
      viewDirection: 3,
      perception: 12,
      speed: 6,
      size: t.size,
      isAlly
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
