import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  getEdgeId,
  parseEdgeId,
  isValidEdgeCoordinate,
  getCellSpineIds,
  getCellEdges
} from '../src/components/devkit/BattleMapEditor/geometry/coordinates';
import { validateBattleMap } from '../src/components/devkit/BattleMapEditor/persistence/battleMapValidator';
import { migrateBattleMap } from '../src/components/devkit/BattleMapEditor/persistence/battleMapMigration';
import { deserializeBattleMap } from '../src/components/devkit/BattleMapEditor/persistence/battleMapSerializer';
import { MapEdge, BattleMap } from '../src/components/devkit/BattleMapEditor/types/battleMap';

describe('BattleMap v2 Schema, Edge Coordinates & Migration Unit Tests', () => {
  const mapPath = join(process.cwd(), 'public/assets/atlas/combat/combat_maps/canonical_integration_map.json');

  describe('1. Edge Coordinates & Boundary Spine Math', () => {
    it('generates and parses deterministic edge identifiers', () => {
      expect(getEdgeId('horizontal', 5, 3)).toBe('h:5,3');
      expect(getEdgeId('vertical', 2, 7)).toBe('v:2,7');

      expect(parseEdgeId('h:5,3')).toEqual({ orientation: 'horizontal', x: 5, y: 3 });
      expect(parseEdgeId('v:2,7')).toEqual({ orientation: 'vertical', x: 2, y: 7 });
      expect(parseEdgeId('invalid-edge')).toBeNull();
    });

    it('enforces exact coordinate bounds for horizontal and vertical spines, including borders', () => {
      const W = 12;
      const H = 10;

      // Horizontal spines: valid for x in [0, W-1] and y in [0, H]
      expect(isValidEdgeCoordinate('horizontal', 0, 0, W, H)).toBe(true); // North-West border
      expect(isValidEdgeCoordinate('horizontal', W - 1, 0, W, H)).toBe(true); // North-East border
      expect(isValidEdgeCoordinate('horizontal', 5, 5, W, H)).toBe(true); // Internal spine
      expect(isValidEdgeCoordinate('horizontal', 0, H, W, H)).toBe(true); // South border spine
      expect(isValidEdgeCoordinate('horizontal', W - 1, H, W, H)).toBe(true); // South border spine
      expect(isValidEdgeCoordinate('horizontal', W, 5, W, H)).toBe(false); // x out of bounds
      expect(isValidEdgeCoordinate('horizontal', 5, H + 1, W, H)).toBe(false); // y out of bounds
      expect(isValidEdgeCoordinate('horizontal', -1, 5, W, H)).toBe(false); // negative x

      // Vertical spines: valid for x in [0, W] and y in [0, H-1]
      expect(isValidEdgeCoordinate('vertical', 0, 0, W, H)).toBe(true); // West border
      expect(isValidEdgeCoordinate('vertical', 0, H - 1, W, H)).toBe(true); // West border
      expect(isValidEdgeCoordinate('vertical', 5, 5, W, H)).toBe(true); // Internal spine
      expect(isValidEdgeCoordinate('vertical', W, 0, W, H)).toBe(true); // East border
      expect(isValidEdgeCoordinate('vertical', W, H - 1, W, H)).toBe(true); // East border
      expect(isValidEdgeCoordinate('vertical', W + 1, 5, W, H)).toBe(false); // x out of bounds
      expect(isValidEdgeCoordinate('vertical', 5, H, W, H)).toBe(false); // y out of bounds
      expect(isValidEdgeCoordinate('vertical', 5, -1, W, H)).toBe(false); // negative y
    });

    it('proves mathematically that a shared boundary is represented once and returned symmetrically', () => {
      const x = 5;
      const y = 4;

      const currentCell = getCellSpineIds(x, y);
      const northNeighbor = getCellSpineIds(x, y - 1);
      const southNeighbor = getCellSpineIds(x, y + 1);
      const westNeighbor = getCellSpineIds(x - 1, y);
      const eastNeighbor = getCellSpineIds(x + 1, y);

      // Horizontal shared boundary with North neighbor
      expect(currentCell.north).toBe(northNeighbor.south);
      expect(currentCell.north).toBe('h:5,4');

      // Horizontal shared boundary with South neighbor
      expect(currentCell.south).toBe(southNeighbor.north);
      expect(currentCell.south).toBe('h:5,5');

      // Vertical shared boundary with West neighbor
      expect(currentCell.west).toBe(westNeighbor.east);
      expect(currentCell.west).toBe('v:5,4');

      // Vertical shared boundary with East neighbor
      expect(currentCell.east).toBe(eastNeighbor.west);
      expect(currentCell.east).toBe('v:6,4');
    });

    it('getCellEdges resolves the exact same edge entity from both adjacent cells', () => {
      const sharedDoor: MapEdge = {
        id: 'h:5,5',
        orientation: 'horizontal',
        x: 5,
        y: 5,
        type: 'door',
        doorState: 'closed'
      };

      const edgeMap = new Map<string, MapEdge>();
      edgeMap.set(sharedDoor.id, sharedDoor);

      const cellFromNorth = getCellEdges(5, 4, edgeMap);
      const cellFromSouth = getCellEdges(5, 5, edgeMap);

      expect(cellFromNorth.south).toBe(sharedDoor);
      expect(cellFromSouth.north).toBe(sharedDoor);
      expect(cellFromNorth.south).toBe(cellFromSouth.north);
    });
  });

  describe('2. Validator Contract', () => {
    it('validates a correct BattleMap v2 object', () => {
      const validV2Map: any = {
        version: 2,
        id: 'test-v2-map',
        name: 'Test V2 Map',
        dimensions: { width: 10, height: 10 },
        terrain: [{ x: 1, y: 1, type: 'stone' }],
        edges: [
          { id: 'h:1,1', orientation: 'horizontal', x: 1, y: 1, type: 'wall' },
          { id: 'v:1,1', orientation: 'vertical', x: 1, y: 1, type: 'door', doorState: 'closed' }
        ],
        portals: [{ id: 'p-1', type: 'entrance', name: 'Start', x: 1, y: 1 }],
        objects: [],
        tokens: [],
        labels: [],
        markers: [],
        layers: []
      };

      const result = validateBattleMap(validV2Map);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('rejects unsupported future schema versions', () => {
      const futureMap: any = {
        version: 3,
        name: 'Future Map',
        dimensions: { width: 10, height: 10 },
        terrain: [{ x: 1, y: 1, type: 'stone' }]
      };

      const result = validateBattleMap(futureMap);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Unsupported map schema version: 3'))).toBe(true);
    });

    it('rejects duplicate edge identifiers on the same boundary', () => {
      const dupEdgeMap: any = {
        version: 2,
        name: 'Duplicate Edge Map',
        dimensions: { width: 10, height: 10 },
        edges: [
          { id: 'h:5,5', orientation: 'horizontal', x: 5, y: 5, type: 'wall' },
          { id: 'h:5,5', orientation: 'horizontal', x: 5, y: 5, type: 'door', doorState: 'closed' }
        ]
      };

      const result = validateBattleMap(dupEdgeMap);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("Duplicate edge detected for deterministic boundary key 'h:5,5'"))).toBe(true);
    });

    it('rejects edges with coordinates exceeding map dimensions', () => {
      const outOfBoundsMap: any = {
        version: 2,
        name: 'OOB Edge Map',
        dimensions: { width: 8, height: 8 },
        edges: [
          { id: 'h:9,5', orientation: 'horizontal', x: 9, y: 5, type: 'wall' } // x >= 8 is invalid for horizontal
        ]
      };

      const result = validateBattleMap(outOfBoundsMap);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('exceed valid map bounds'))).toBe(true);
    });
  });

  describe('3. Lossless v1 to v2 Migration', () => {
    let rawJson: string;

    it('migrates canonical integration map into v2 format without data loss', () => {
      rawJson = readFileSync(mapPath, 'utf-8');
      const parsed = deserializeBattleMap(rawJson);
      expect(parsed.version).toBe(1);

      const migrated = migrateBattleMap(parsed);
      expect(migrated.version).toBe(2);
      expect(migrated.name).toBe('Canonical Integration Test Map');
      expect(migrated.dimensions.width).toBe(12);
      expect(migrated.dimensions.height).toBe(10);

      // Verify edges were created with deterministic IDs
      expect(migrated.edges).toBeDefined();
      expect(migrated.edges!.length).toBe(2);

      const wall = migrated.edges!.find(e => e.id === 'h:5,5');
      expect(wall).toBeDefined();
      expect(wall!.type).toBe('wall');
      expect(wall!.orientation).toBe('horizontal');
      expect(wall!.x).toBe(5);
      expect(wall!.y).toBe(5);

      const door = migrated.edges!.find(e => e.id === 'v:5,6');
      expect(door).toBeDefined();
      expect(door!.type).toBe('door');
      expect(door!.doorState).toBe('closed');
      expect(door!.orientation).toBe('vertical');
      expect(door!.x).toBe(5);
      expect(door!.y).toBe(6);

      // Verify portal migration from entrance marker
      expect(migrated.portals).toBeDefined();
      expect(migrated.portals!.length).toBe(1);
      const entrancePortal = migrated.portals![0];
      expect(entrancePortal.type).toBe('entrance');
      expect(entrancePortal.x).toBe(2);
      expect(entrancePortal.y).toBe(2);
      expect(entrancePortal.name).toBe('Main Entrance');

      // Verify player token is PRESERVED in tokens (not converted to portal)
      const playerToken = migrated.tokens.find(t => t.type === 'player');
      expect(playerToken).toBeDefined();
      expect(playerToken!.name).toBe('Party Spawn Point');
      expect(playerToken!.x).toBe(2);
      expect(playerToken!.y).toBe(2);

      // Verify enemy token preserved
      const enemyToken = migrated.tokens.find(t => t.type === 'enemy');
      expect(enemyToken).toBeDefined();
      expect(enemyToken!.name).toBe('Goblin Scout');

      // Verify terrain preserved without inferred movement costs
      const mudCell = migrated.terrain.find(t => t.type === 'mud');
      expect(mudCell).toBeDefined();
      expect(mudCell!.movementCost).toBeUndefined(); // MUST NOT INFER movementCost: 2
    });

    it('validates successfully after migration', () => {
      rawJson = readFileSync(mapPath, 'utf-8');
      const migrated = migrateBattleMap(deserializeBattleMap(rawJson));
      const validation = validateBattleMap(migrated);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });
});
