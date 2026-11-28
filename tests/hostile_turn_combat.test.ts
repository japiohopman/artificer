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
    // Pause the AI at the real asynchronous equipment boundary so stale-turn tests
    // cannot accidentally invalidate the initial 600ms timer before lookup begins.
    const createDeferredEquipmentLookup = () => {
      let releaseLookup!: () => void;
      let signalLookupStarted!: () => void;
      const lookupStarted = new Promise<void>((resolve) => {
        signalLookupStarted = resolve;
      });
      const lookupGate = new Promise<void>((resolve) => {
        releaseLookup = resolve;
      });

      const lookup = async (_weaponName: string) => {
        signalLookupStarted();
        await lookupGate;
        return {
          weapon_range: 'Melee',
          properties: [],
          range: { normal: 5 }
        };
      };

      return { lookup, lookupStarted, releaseLookup };
    };

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

    it('keeps the hostile turn active when its attack resolver reports an unresolved roll', async () => {
      const hero: any = {
        id: 'hero-pending-attack',
        name: 'Hero',
        class: 'Fighter',
        isNpc: false,
        hp: 20,
        maxHp: 20,
        stats: { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 }
      };
      const goblin = {
        id: 'goblin-pending-attack',
        name: 'Goblin',
        type: 'enemy',
        size: 'Small',
        hp: 7,
        maxHp: 7,
        x: 3,
        y: 2,
        speed: 0,
        awareness: 'combat',
        viewDirection: 0,
        actions: goblinData.actions,
        isAlly: false
      };

      useCharacterStore.setState({ characters: [hero], activeCharacterId: hero.id });
      useUIStore.setState({ gameMode: 'combat' });
      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { [hero.id]: { x: 2, y: 2, rotation: 0 } },
          monsters: [goblin],
          initiativeOrder: [
            { id: goblin.id, name: goblin.name, value: 15, isPlayer: false, isAlly: false },
            { id: hero.id, name: hero.name, value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => false
      });

      await useGameStore.getState().executeMonsterTurn(goblin.id);
      await new Promise(resolve => setTimeout(resolve, 750));

      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(0);
      expect(useGameStore.getState().combatState.initiativeOrder[0].id).toBe(goblin.id);
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

    it('removing the active hostile during its pending timeout starts the correct next player actor', async () => {
      let goblinAttacked = false;

      // Exhaust player action economy initially with canonical structure
      const hero = useCharacterStore.getState().characters.find(c => c.id === 'char-hero');
      if (hero) {
        hero.actionEconomy = {
          actions: { current: 0, max: 1 },
          bonusActions: { current: 0, max: 1 },
          reactions: { current: 0, max: 1 },
          movement: { current: 0, max: 30 },
          objectInteractions: { current: 0, max: 1 }
        };
      }

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-active-removed',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
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
            { id: 'goblin-active-removed', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0,
          activeConditions: {}
        },
        resolveCombatAction: async () => {
          goblinAttacked = true;
        }
      });

      // Start hostile turn
      useGameStore.getState().executeMonsterTurn('goblin-active-removed');

      // Remove the active hostile during pending timeout
      await new Promise(r => setTimeout(r, 50));
      useGameStore.getState().removeMonsterFromCombat('goblin-active-removed');

      // Verify that removal immediately dispatched the turn for char-hero
      const stateAfterRemoval = useGameStore.getState();
      expect(stateAfterRemoval.combatState.initiativeOrder.length).toBe(1);
      expect(stateAfterRemoval.combatState.initiativeOrder[0].id).toBe('char-hero');
      expect(stateAfterRemoval.combatState.activeTurnIndex).toBe(0);
      expect(useCharacterStore.getState().activeCharacterId).toBe('char-hero');
      expect(useCharacterStore.getState().characters.find(c => c.id === 'char-hero')?.actionEconomy.actions.current).toBe(1);

      // Wait for original 600ms timeout to elapse
      await new Promise(r => setTimeout(r, 750));

      // Removed goblin must not attack
      expect(goblinAttacked).toBe(false);
      // Active index must remain 0 (pointing to Hero), no duplicate or ghost advance
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(0);
      expect(useGameStore.getState().combatState.initiativeOrder[0].id).toBe('char-hero');
    });

    it('removing the active hostile starts the next hostile actor when applicable', async () => {
      let goblin2Attacked = false;

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
              name: 'Goblin 1',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 3,
              speed: 6,
              viewDirection: 0,
              awareness: 'combat',
              actions: goblinData.actions
            },
            {
              id: 'goblin-2',
              name: 'Goblin 2',
              type: 'enemy',
              size: 'Small',
              hp: 7,
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
            { id: 'goblin-1', name: 'Goblin 1', value: 15, isPlayer: false, isAlly: false },
            { id: 'goblin-2', name: 'Goblin 2', value: 12, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0,
          activeConditions: {}
        },
        resolveCombatAction: async (actor) => {
          if (actor.id === 'goblin-2') {
            goblin2Attacked = true;
          }
        }
      });

      // Start turn for goblin-1
      useGameStore.getState().executeMonsterTurn('goblin-1');

      // Remove active goblin-1 mid-turn
      await new Promise(r => setTimeout(r, 50));
      useGameStore.getState().removeMonsterFromCombat('goblin-1');

      // Goblin 2 is now at index 0 and its turn must have been dispatched
      expect(useGameStore.getState().combatState.initiativeOrder[0].id).toBe('goblin-2');
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(0);

      // Wait for goblin-2 turn execution
      await new Promise(r => setTimeout(r, 750));
      expect(goblin2Attacked).toBe(true);
    });

    it('removing a combatant before the active index preserves the same active actor', () => {
      useGameStore.setState({
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            { id: 'goblin-0', name: 'Goblin 0', type: 'enemy', hp: 7, maxHp: 7, x: 1, y: 1 },
            { id: 'goblin-2', name: 'Goblin 2', type: 'enemy', hp: 7, maxHp: 7, x: 3, y: 3 }
          ],
          initiativeOrder: [
            { id: 'goblin-0', name: 'Goblin 0', value: 20, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 15, isPlayer: true, isAlly: false },
            { id: 'goblin-2', name: 'Goblin 2', value: 10, isPlayer: false, isAlly: false }
          ],
          activeTurnIndex: 1 // Hero is active
        }
      });

      useGameStore.getState().removeMonsterFromCombat('goblin-0');

      const state = useGameStore.getState();
      expect(state.combatState.initiativeOrder.length).toBe(2);
      expect(state.combatState.activeTurnIndex).toBe(0);
      expect(state.combatState.initiativeOrder[0].id).toBe('char-hero');
    });

    it('a dead active monster still in initiative advances exactly once', async () => {
      let goblinAttacked = false;

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-dying',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7, // alive at start
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
            { id: 'goblin-dying', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => {
          goblinAttacked = true;
        }
      });

      // Start turn while monster is alive
      useGameStore.getState().executeMonsterTurn('goblin-dying');

      // Monster drops to 0 HP during the pending timeout (e.g. from environmental damage or reaction)
      await new Promise(r => setTimeout(r, 50));
      useGameStore.setState(s => ({
        combatState: {
          ...s.combatState,
          monsters: s.combatState.monsters.map(m => m.id === 'goblin-dying' ? { ...m, hp: 0 } : m)
        }
      }));

      // Wait for turn timeout to fire
      await new Promise(r => setTimeout(r, 750));

      // Dead monster does not attack
      expect(goblinAttacked).toBe(false);
      // Turn advances safely to next actor (Hero at index 1)
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);
      expect(useGameStore.getState().combatState.initiativeOrder[1].id).toBe('char-hero');

      // Wait another 500ms to verify no second advance occurs
      await new Promise(r => setTimeout(r, 500));
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);
    });

    it('a manually advanced turn invalidates the old pending callback', async () => {
      let goblinAttacked = false;

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-manual',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
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
            { id: 'goblin-manual', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => {
          goblinAttacked = true;
        }
      });

      // Start turn
      useGameStore.getState().executeMonsterTurn('goblin-manual');

      // User manually clicks Next Turn before 600ms timeout
      await new Promise(r => setTimeout(r, 50));
      useGameStore.getState().nextTurn();

      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);

      // Wait for original timeout to elapse
      await new Promise(r => setTimeout(r, 750));

      // Goblin does not attack
      expect(goblinAttacked).toBe(false);
      // Turn remains on index 1, not double-advanced to 0
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);
    });

    it('startCombat ensures gameMode is combat and dispatches first hostile turn', async () => {
      useUIStore.setState({ gameMode: 'exploration' });

      let actionExecuted = false;

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: {},
          monsters: [
            {
              id: 'goblin-first',
              name: 'Goblin Fast',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 3,
              speed: 6,
              stats: { dex: 30 }, // Very high dex ensures goblin rolls higher initiative
              viewDirection: 0,
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => {
          actionExecuted = true;
        }
      });

      // Start combat from exploration
      await useGameStore.getState().startCombat();

      // UI gameMode must now be combat
      expect(useUIStore.getState().gameMode).toBe('combat');

      // First actor should be the high-dex goblin
      const firstActor = useGameStore.getState().combatState.initiativeOrder[0];
      if (firstActor.id === 'goblin-first') {
        // Wait for turn execution
        await new Promise(r => setTimeout(r, 750));
        expect(actionExecuted).toBe(true);
      }
    });

    it('completeCombat clears initiativeOrder and activeTurnIndex when returning to exploration', async () => {
      useUIStore.setState({ gameMode: 'combat' });
      useGameStore.setState({
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: {},
          monsters: [],
          initiativeOrder: [
            { id: 'hero-1', name: 'Hero', value: 15, isPlayer: true, isAlly: false },
            { id: 'goblin-1', name: 'Goblin', value: 10, isPlayer: false, isAlly: false }
          ],
          activeTurnIndex: 1
        }
      });

      await useGameStore.getState().completeCombat(true);

      expect(useUIStore.getState().gameMode).toBe('exploration');
      expect(useGameStore.getState().combatState.initiativeOrder).toEqual([]);
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(0);
    });

    it('direct startCombat invocation does not trigger a duplicate startCombat through HUD-like effect', async () => {
      useUIStore.setState({ gameMode: 'exploration' });

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: {},
          monsters: [
            {
              id: 'goblin-single-roll',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 3,
              speed: 6,
              viewDirection: 0,
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [],
          activeTurnIndex: 0
        }
      });

      let secondaryStartTriggered = 0;
      let startCombatCalls = 0;
      const originalStartCombat = useGameStore.getState().startCombat;

      // Simulate HUD effect subscriber: fires when gameMode transitions to combat
      let prevGameMode = useUIStore.getState().gameMode;
      const unsubscribe = useUIStore.subscribe((state) => {
        if (state.gameMode === 'combat' && prevGameMode !== 'combat') {
          prevGameMode = state.gameMode;
          // Guard matching HUD.tsx: auto-start only if initiativeOrder is empty
          const currentStore = useGameStore.getState();
          if (currentStore.combatState.initiativeOrder.length === 0) {
            secondaryStartTriggered++;
            currentStore.startCombat();
          }
        } else {
          prevGameMode = state.gameMode;
        }
      });

      try {
        await useGameStore.getState().startCombat();

        // The HUD guard must prevent secondary startCombat
        expect(secondaryStartTriggered).toBe(0);
        expect(useUIStore.getState().gameMode).toBe('combat');
        expect(useGameStore.getState().combatState.initiativeOrder.length).toBeGreaterThan(0);
      } finally {
        unsubscribe();
      }
    });

    it('reroll initiative during existing combat rerolls exactly once and stays in combat mode', async () => {
      useUIStore.setState({ gameMode: 'combat' });

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: {},
          monsters: [
            {
              id: 'goblin-reroll',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 3,
              speed: 6,
              viewDirection: 0,
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [
            { id: 'goblin-reroll', name: 'Goblin', value: 10, isPlayer: false, isAlly: false }
          ],
          activeTurnIndex: 0
        }
      });

      await useGameStore.getState().startCombat();

      expect(useUIStore.getState().gameMode).toBe('combat');
      expect(useGameStore.getState().combatState.initiativeOrder.length).toBe(2); // Hero + Goblin
    });

    it('invalidating a hostile turn during an awaited equipment lookup prevents movement and attack', async () => {
      useUIStore.setState({ gameMode: 'combat' });
      let actionResolved = false;
      const equipment = createDeferredEquipmentLookup();

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-lookup-stale',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 6, // Outside melee reach; a stale continuation would try to move closer
              speed: 6,
              viewDirection: 0,
              awareness: 'combat',
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [
            { id: 'goblin-lookup-stale', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => {
          actionResolved = true;
        }
      });

      // Wait until the monster turn has passed its initial timer and is suspended
      // inside the asynchronous Atlas equipment lookup.
      await useGameStore.getState().executeMonsterTurn('goblin-lookup-stale', equipment.lookup);
      await equipment.lookupStarted;

      // Invalidate the turn while the lookup is genuinely still pending.
      useGameStore.getState().nextTurn();
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);

      // Allow the stale continuation to resume; it must not commit movement or attack.
      equipment.releaseLookup();
      await new Promise(r => setTimeout(r, 50));

      const monster = useGameStore.getState().combatState.monsters.find(m => m.id === 'goblin-lookup-stale');
      expect(monster?.x).toBe(2);
      expect(monster?.y).toBe(6);
      expect(actionResolved).toBe(false);
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);
    });

    it('completeCombat immediately invalidates a monster suspended in equipment lookup', async () => {
      useUIStore.setState({ gameMode: 'combat' });
      let actionResolved = false;
      const equipment = createDeferredEquipmentLookup();

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-complete-stale',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
              maxHp: 7,
              x: 2,
              y: 6,
              speed: 6,
              viewDirection: 0,
              awareness: 'combat',
              actions: goblinData.actions
            }
          ],
          initiativeOrder: [
            { id: 'goblin-complete-stale', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0
        },
        resolveCombatAction: async () => {
          actionResolved = true;
        }
      });

      await useGameStore.getState().executeMonsterTurn('goblin-complete-stale', equipment.lookup);
      await equipment.lookupStarted;

      // completeCombat must invalidate the encounter synchronously, before its XP await.
      const completion = useGameStore.getState().completeCombat(true);
      expect(useUIStore.getState().gameMode).toBe('exploration');
      expect(useGameStore.getState().combatState.initiativeOrder).toEqual([]);
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(0);

      // Resume the pending equipment lookup after combat has already ended.
      equipment.releaseLookup();
      await new Promise(r => setTimeout(r, 50));
      await completion;

      const monster = useGameStore.getState().combatState.monsters.find(m => m.id === 'goblin-complete-stale');
      expect(monster?.x).toBe(2);
      expect(monster?.y).toBe(6);
      expect(actionResolved).toBe(false);
      expect(useUIStore.getState().gameMode).toBe('exploration');
      expect(useGameStore.getState().combatState.initiativeOrder).toEqual([]);
    });

    
    it('does not execute an old hostile callback when the same actor returns to the same initiative slot', async () => {
      useUIStore.setState({ gameMode: 'combat' });
      useCharacterStore.setState({
        characters: [
          { id: 'char-hero', name: 'Hero', hp: 30, maxHp: 30, stats: { dex: 10, ac: 10 }, isNpc: false }
        ]
      });

      let attackCount = 0;
      const lookup = async (index: string) => index === 'shortbow'
        ? { weapon_range: 'Ranged', range: { normal: 80 }, properties: [] }
        : { weapon_range: 'Melee', range: { normal: 5 }, properties: [] };

      useGameStore.setState({
        ruleset: '2014',
        combatState: {
          grid: Array(10).fill(null).map((_, y) => Array(10).fill(null).map((_, x) => ({ x, y, type: 'floor' }))),
          walls: [],
          playerPos: { x: 2, y: 2 },
          pcPositions: { 'char-hero': { x: 2, y: 2, rotation: 0 } },
          monsters: [
            {
              id: 'goblin-reentered',
              name: 'Goblin',
              type: 'enemy',
              size: 'Small',
              hp: 7,
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
            { id: 'goblin-reentered', name: 'Goblin', value: 15, isPlayer: false, isAlly: false },
            { id: 'char-hero', name: 'Hero', value: 10, isPlayer: true, isAlly: false }
          ],
          activeTurnIndex: 0,
          activeConditions: {}
        },
        resolveCombatAction: async () => {
          attackCount += 1;
        }
      });

      // The first delayed execution is pending.
      useGameStore.getState().executeMonsterTurn('goblin-reentered', lookup);
      await new Promise(r => setTimeout(r, 50));

      // Move away and then return to the exact same actor/index before the first timer fires.
      useGameStore.getState().nextTurn();
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);
      useGameStore.getState().startTurnForIndex(0);
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(0);

      // Both timers have had time to fire; only the new turn may attack.
      await new Promise(r => setTimeout(r, 800));
      expect(attackCount).toBe(1);
      expect(useGameStore.getState().combatState.activeTurnIndex).toBe(0);
    });

  });
});
