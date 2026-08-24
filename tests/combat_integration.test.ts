// @ts-nocheck
import { describe, it, expect, beforeEach } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { deserializeBattleMap } from '../src/components/devkit/BattleMapEditor/persistence/battleMapSerializer';
import { validateBattleMap } from '../src/components/devkit/BattleMapEditor/persistence/battleMapValidator';
import { migrateBattleMap } from '../src/components/devkit/BattleMapEditor/persistence/battleMapMigration';
import { battleMapToCombatGrid } from '../src/components/devkit/BattleMapEditor/persistence/battleMapToCombatGrid';
import { isMoveBlockedByWalls, checkLoS, findPath } from '../src/components/combat/combatUtils';

describe('Combat Integration v1 — BattleMap -> CombatGrid Adapter Unit Tests', () => {
  const mapPath = join(process.cwd(), 'public/assets/atlas/combat/combat_maps/canonical_integration_map.json');
  let rawJson: string;

  beforeEach(() => {
    rawJson = readFileSync(mapPath, 'utf-8');
  });

  describe('1. Loading & Schema Migration', () => {
    it('loads and validates the canonical integration test map file', () => {
      const parsed = deserializeBattleMap(rawJson);
      const validation = validateBattleMap(parsed);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);

      const migrated = migrateBattleMap(parsed);
      expect(migrated.name).toBe('Canonical Integration Test Map');
      expect(migrated.dimensions.width).toBe(12);
      expect(migrated.dimensions.height).toBe(10);
    });

    it('produces a useful validation error for invalid map data', () => {
      const invalidMap = { name: '', dimensions: { width: 2, height: 2 } };
      const validation = validateBattleMap(invalidMap);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Map name is empty'))).toBe(true);
      expect(validation.errors.some(e => e.includes('Map dimensions must be at least 4x4'))).toBe(true);
    });
  });

  describe('2. BattleMap -> CombatGrid Adapter Direct Conversion', () => {
    it('maps cell terrain identity (stone, grass, mud) into TacticalCell types', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const converted = battleMapToCombatGrid(map);

      expect(converted.grid.length).toBe(10);
      expect(converted.grid[0].length).toBe(12);

      // Verify stone, grass, mud terrain identity survival
      expect(converted.grid[0][0].type).toBe('stone');
      expect(converted.grid[0][1].type).toBe('stone');
      expect(converted.grid[2][2].type).toBe('grass');
      expect(converted.grid[2][4].type).toBe('mud');
      expect(converted.grid[5][5].type).toBe('floor'); // unpainted default
    });

    it('returns authored wall/door boundary segments in the adapter output', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const converted = battleMapToCombatGrid(map);

      expect(converted.walls).toBeDefined();
      expect(converted.walls.length).toBe(2);
      expect(converted.walls[0].type).toBe('wall');
      expect(converted.walls[1].type).toBe('door');
    });

    it('resolves explicit party spawn entry point without turning spawn tokens into active combatants', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const converted = battleMapToCombatGrid(map);

      // Entry point output
      expect(converted.partySpawnPos).toEqual({ x: 2, y: 2 });

      // Ensure player spawn token is NOT added as a monster combatant
      expect(converted.monsters.some(m => m.name === 'Party Spawn Point')).toBe(false);
    });

    it('resolves enemy tokens to CombatMonster objects referencing Atlas store data', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const converted = battleMapToCombatGrid(map);

      expect(converted.monsters.length).toBe(1);
      const goblin = converted.monsters[0];
      expect(goblin.name).toBe('Goblin Scout');
      expect(goblin.type).toBe('enemy');
      expect(goblin.x).toBe(8);
      expect(goblin.y).toBe(8);
      expect(goblin.hp).toBeGreaterThan(0);
    });

    it('maps doors to interactive tactical cells on the grid', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const converted = battleMapToCombatGrid(map);

      const doorCell = converted.grid[6][5];
      expect(doorCell.type).toBe('door');
      expect(doorCell.isOpen).toBe(false);
    });
  });

  describe('3. Wall Semantics & Boundary Interactions', () => {
    it('treats walls as cell edge boundaries rather than globally blocking entire cells', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const converted = battleMapToCombatGrid(map);
      const walls = converted.walls;

      const fromSouth = { x: 5, y: 5 };
      const toNorth = { x: 5, y: 4 };
      const toEast = { x: 6, y: 5 };

      // Crossing horizontal wall segment boundary from (5,5) to (5,4) is blocked
      expect(isMoveBlockedByWalls(fromSouth, toNorth, walls)).toBe(true);

      // Moving sideways from (5,5) to (6,5) does not cross the horizontal segment
      expect(isMoveBlockedByWalls(fromSouth, toEast, walls)).toBe(false);

      // Verify that cell (5,5) is not globally blocked
      expect(converted.grid[5][5].type).not.toBe('wall');
    });

    it('blocks Line of Sight across wall boundaries and allows LoS through open doors', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const converted = battleMapToCombatGrid(map);
      const walls = converted.walls;

      const posA = { x: 5, y: 5 };
      const posB = { x: 5, y: 4 };

      expect(checkLoS(posA, posB, [], walls)).toBe(false);

      const openWalls = walls.map(w => w.type === 'door' ? { ...w, doorState: 'open' } : w);
      const doorFrom = { x: 5, y: 6 };
      const doorTo = { x: 6, y: 6 };
      expect(checkLoS(doorFrom, doorTo, [], openWalls)).toBe(true);
    });

    it('pathfinding respects boundary wall crossings', () => {
      const map = migrateBattleMap(deserializeBattleMap(rawJson));
      const runtime = battleMapToCombatGrid(map);

      const path = findPath({ x: 5, y: 5 }, { x: 5, y: 4 }, runtime.grid, [], { x: -1, y: -1 }, 'Medium', runtime.walls);
      expect(path).not.toBeNull();
      if (path) {
        expect(path.length).toBeGreaterThan(1);
      }
    });
  });
});
