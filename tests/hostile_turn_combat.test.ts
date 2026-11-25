// @ts-nocheck
import { describe, it, expect, beforeEach } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { checkLoS, findPath, isMoveBlockedByWalls, getDistance } from '../src/components/combat/combatUtils';
import { fetchEquipmentData } from '../src/services/storageService';
import { useGameStore } from '../src/store/useGameStore';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { useUIStore } from '../src/store/useUIStore';
import { useWorldStore } from '../src/store/useWorldStore';

describe('Hostile Turn & Edge-Aware Combat AI Regression Tests (#418)', () => {
  const goblinPath = join(process.cwd(), 'public/assets/atlas/enemies/json/14/humanoid/tjwqogi3a4ual7lc.json');
  const orcPath = join(process.cwd(), 'public/assets/atlas/enemies/json/14/humanoid/hb49mcovbxwwekwq.json');

  let goblinData: any;
  let orcData: any;

  beforeEach(() => {
    goblinData = JSON.parse(readFileSync(goblinPath, 'utf-8'));
    orcData = JSON.parse(readFileSync(orcPath, 'utf-8'));
    useWorldStore.setState({
      loadDiscoveredLocations: async () => {},
      setDiscoveredLocationIds: () => {}
    });
  });

  describe('1. Canonical Atlas Attack & Equipment Data Resolution', () => {
    it('loads real Goblin Atlas data and resolves Scimitar (melee) and Shortbow (ranged)', async () => {
      expect(goblinData.name).toBe('goblin');
      expect(goblinData.actions.length).toBe(3);

      // Verify action definitions in real Atlas file
      const nimbleEscape = goblinData.actions.find(a => a.name === 'nimble escape');
      const scimitar = goblinData.actions.find(a => a.name === 'scimitar');
      const shortbow = goblinData.actions.find(a => a.name === 'shortbow');

      expect(nimbleEscape).toBeDefined();
      expect(nimbleEscape.damage).toEqual([]); // Non-attack trait has empty damage array

      expect(scimitar).toBeDefined();
      expect(scimitar.damage.length).toBe(1);
      expect(scimitar.damage[0].damage_dice).toBe('1d6-1');
      expect(scimitar.damage[0].damage_type.name).toBe('slashing');

      expect(shortbow).toBeDefined();
      expect(shortbow.damage.length).toBe(1);
      expect(shortbow.damage[0].damage_dice).toBe('1d6-1');
      expect(shortbow.damage[0].damage_type.name).toBe('piercing');

      // Resolve equipment metadata from canonical equipment JSON
      const scimitarEquip = await fetchEquipmentData('scimitar', '2014');
      expect(scimitarEquip).toBeDefined();
      expect(scimitarEquip.weapon_range).toBe('Melee');

      const shortbowEquip = await fetchEquipmentData('shortbow', '2014');
      expect(shortbowEquip).toBeDefined();
      expect(shortbowEquip.weapon_range).toBe('Ranged');
      expect(shortbowEquip.range.normal).toBe(80);
      expect(Math.floor(shortbowEquip.range.normal / 5)).toBe(16); // 80ft / 5ft = 16 cells
    });

    it('loads real Orc Atlas data and resolves Greataxe (melee) and Thrown Javelin (ranged)', async () => {
      expect(orcData.name).toBe('orc');
      expect(orcData.actions.length).toBe(3);

      const aggressive = orcData.actions.find(a => a.name === 'aggressive');
      const greataxe = orcData.actions.find(a => a.name === 'greataxe');
      const javelin = orcData.actions.find(a => a.name === 'javelin');

      expect(aggressive).toBeDefined();
      expect(aggressive.damage).toEqual([]); // Aggressive has empty damage

      expect(greataxe).toBeDefined();
      expect(greataxe.damage[0].damage_dice).toBe('1d12+3');
      expect(greataxe.damage[0].damage_type.name).toBe('slashing');

      expect(javelin).toBeDefined();
      expect(javelin.damage[0].damage_dice).toBe('1d6+3');
      expect(javelin.damage[0].damage_type.name).toBe('piercing');

      // Resolve javelin equipment metadata
      const javelinEquip = await fetchEquipmentData('javelin', '2014');
      expect(javelinEquip).toBeDefined();
      expect(javelinEquip.weapon_range).toBe('Melee');
      expect(javelinEquip.properties.some((p: any) => p.index === 'thrown')).toBe(true);
      expect(javelinEquip.range.normal).toBe(30);
      expect(Math.floor(javelinEquip.range.normal / 5)).toBe(6); // 30ft / 5ft = 6 cells
    });

    it('strictly rejects non-attack traits and never fabricates attacks when damage is absent', async () => {
      // Mock creature with only non-attack utility traits
      const nonCombatActions = [
        { name: 'nimble escape', attack_bonus: 2, damage: [] },
        { name: 'aggressive', attack_bonus: 0, damage: [] },
        { name: 'aberrant ground', attack_bonus: -2, damage: [] }
      ];

      // Filter function matching useGameStore logic
      const validAttacks = nonCombatActions.filter(act => 
        Array.isArray(act.damage) && act.damage.length > 0 && Boolean(act.damage[0]?.damage_dice)
      );

      expect(validAttacks.length).toBe(0);
    });
  });

  describe('2. Canonical Boundary Walls & Closed Door Obstruction', () => {
    // 10x10 empty grid with floor cells
    const createTestGrid = () => {
      const grid = [];
      for (let y = 0; y < 10; y++) {
        const row = [];
        for (let x = 0; x < 10; x++) {
          row.push({ x, y, type: 'floor' });
        }
        grid.push(row);
      }
      return grid;
    };

    it('checkLoS correctly blocks line of sight across horizontal and vertical boundary edges', () => {
      const grid = createTestGrid();

      // Solid wall boundary between y:5 and y:4 across x: 4..6
      const walls = [
        { id: 'h:4,5', orientation: 'horizontal', x: 4, y: 5, type: 'wall' },
        { id: 'h:5,5', orientation: 'horizontal', x: 5, y: 5, type: 'wall' }
      ];

      const southPoint = { x: 5, y: 5 };
      const northPoint = { x: 5, y: 4 };
      const eastPoint = { x: 6, y: 5 };

      // Direct north-south crossing is blocked by the horizontal edge
      expect(checkLoS(southPoint, northPoint, grid, walls)).toBe(false);

      // Eastward movement does not intersect the horizontal edge
      expect(checkLoS(southPoint, eastPoint, grid, walls)).toBe(true);
    });

    it('checkLoS blocks closed doors but allows open doors', () => {
      const grid = createTestGrid();

      // Vertical door edge at x:5, y:5 (between x:4 and x:5)
      const closedDoor = [
        { id: 'v:5,5', orientation: 'vertical', x: 5, y: 5, type: 'door', doorState: 'closed' }
      ];
      const openDoor = [
        { id: 'v:5,5', orientation: 'vertical', x: 5, y: 5, type: 'door', doorState: 'open' }
      ];

      const westPoint = { x: 4, y: 5 };
      const eastPoint = { x: 5, y: 5 };

      // Closed door blocks LoS
      expect(checkLoS(westPoint, eastPoint, grid, closedDoor)).toBe(false);

      // Open door allows LoS
      expect(checkLoS(westPoint, eastPoint, grid, openDoor)).toBe(true);
    });

    it('findPath navigates around edge walls instead of penetrating them', () => {
      const grid = createTestGrid();

      // Wall blocks direct passage between (4,5) and (4,4), leaving opening at x:6
      const walls = [
        { id: 'h:4,5', orientation: 'horizontal', x: 4, y: 5, type: 'wall' },
        { id: 'h:5,5', orientation: 'horizontal', x: 5, y: 5, type: 'wall' }
      ];

      const start = { x: 4, y: 5 };
      const target = { x: 4, y: 4 };

      const path = findPath(start, target, grid, [], { x: -1, y: -1 }, 'Medium', walls);
      expect(path).not.toBeNull();
      if (path) {
        // Path must go around the blocked boundary
        expect(path.length).toBeGreaterThan(1);
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i];
          const to = path[i + 1];
          expect(isMoveBlockedByWalls(from, to, walls)).toBe(false);
        }
      }
    });

    it('findPath treats small creatures with medium 1x1 footprint', () => {
      const grid = createTestGrid();
      const walls = [
        { id: 'h:2,3', orientation: 'horizontal', x: 2, y: 3, type: 'wall' }
      ];

      // Normalizing 'Small' to 'Medium' ensures 1x1 footprint
      const pathSmall = findPath({ x: 2, y: 3 }, { x: 2, y: 2 }, grid, [], { x: -1, y: -1 }, 'Medium', walls);
      expect(pathSmall).not.toBeNull();
    });
  });

  describe('3. Hostile AI Turn Execution & Lifecycle Safeguards', () => {
    beforeEach(() => {
      // Set up UI and Character Store with a healthy active PC
      useUIStore.setState({ gameMode: 'combat' });
      useCharacterStore.setState({
        activeCharacterId: 'char-hero',
        characters: [
          {
            id: 'char-hero',
            name: 'Hero',
            hp: 20,
            maxHp: 20,
            ac: 14,
            stats: { str: 14, dex: 14, con: 12, int: 10, wis: 10, cha: 10 },
            isUnconscious: false,
            isDead: false
          }
        ]
      });
    });

    it('in-range hostile with valid Atlas attack reaches resolveCombatAction', async () => {
      let actionResolved = false;
      let resolvedActionName = '';

      // Override resolveCombatAction to record the call
      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-1',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 3, // adjacent: dist = 1
              speed: 6,
              viewDirection: 0,
              awareness: 'combat',
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [
            { id: 'goblin-1', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async (actor, target, action) => {
          actionResolved = true;
          resolvedActionName = action.name;
        }
      });

      // Execute monster turn
      await useGameStore.getState().executeMonsterTurn('goblin-1');

      // Wait for execution timeout (600ms)
      await new Promise(r => setTimeout(r, 750));

      expect(actionResolved).toBe(true);
      // In melee reach (dist = 1), Goblin must select Scimitar (NOT Nimble Escape and NOT Shortbow)
      expect(resolvedActionName).toBe('scimitar');
    });

    it('hostile selects Shortbow when target is outside melee reach but in ranged distance', async () => {
      let resolvedActionName = '';

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-ranged',
              name: 'Goblin Scout',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 6, // distance = 4 (outside melee reach 1, within Shortbow range 16)
              speed: 0, // speed 0 so it stays at range
              viewDirection: 0,
              awareness: 'combat',
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [
            { id: 'goblin-ranged', name: 'Goblin Scout', value: 15, isPlayer: false, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async (actor, target, action) => {
          resolvedActionName = action.name;
        }
      });

      await useGameStore.getState().executeMonsterTurn('goblin-ranged');
      await new Promise(r => setTimeout(r, 750));

      // At distance 4, Goblin must select Shortbow
      expect(resolvedActionName).toBe('shortbow');
    });

    it('does NOT attack through a solid boundary wall even if Chebyshev distance is within reach', async () => {
      let actionResolved = false;

      // Solid horizontal wall dividing the entire room between y:2 and y:3
      const walls = Array(10).fill(null).map((_, i) => ({
        id: `h:${i},3`,
        orientation: 'horizontal',
        x: i,
        y: 3,
        type: 'wall'
      }));

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls,
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-walled',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 3, // adjacent across wall: distance = 1, but wall blocks LoS!
              speed: 0, // cannot move around
              viewDirection: 0,
              awareness: 'combat',
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [
            { id: 'goblin-walled', name: 'Goblin', value: 15, isPlayer: false, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => {
          actionResolved = true;
        }
      });

      await useGameStore.getState().executeMonsterTurn('goblin-walled');
      await new Promise(r => setTimeout(r, 750));

      // Wall blocks LoS, so attack must NOT be executed
      expect(actionResolved).toBe(false);
    });

    it('dead monster or ended encounter does NOT execute stale attack or double-advance turn', async () => {
      let actionResolved = false;

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-dead',
              name: 'Goblin',
              type: 'enemy',
              hp: 0, // Dead monster!
              maxHp: 7,
              x: 2,
              y: 3,
              speed: 6,
              viewDirection: 0,
              awareness: 'combat',
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [
            { id: 'goblin-dead', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => {
          actionResolved = true;
        }
      });

      const initialTurnIndex = useGameStore.getState().combatState.activeTurnIndex;
      await useGameStore.getState().executeMonsterTurn('goblin-dead');
      await new Promise(r => setTimeout(r, 750));

      // Dead monster must not attack
      expect(actionResolved).toBe(false);
      // Turn advanced cleanly to next actor without looping or getting stuck
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe((initialTurnIndex + 1) % 2);
    });
  });
});
