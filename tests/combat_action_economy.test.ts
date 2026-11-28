import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getEquippedWeapons } from '../src/lib/statCalculations';
import { useCharacterStore, type Character } from '../src/store/useCharacterStore';
import { useGameStore } from '../src/store/useGameStore';

const readSource = (relativePath: string) =>
  readFileSync(join(import.meta.dir, '..', relativePath), 'utf8');

const originalCombatState = useGameStore.getState().combatState;
const originalRollDice3D = useGameStore.getState().rollDice3D;
const originalRollDiceBackground = useGameStore.getState().rollDiceBackground;
const originalIsRolling3D = useGameStore.getState().isRolling3D;
const originalAddLog = useGameStore.getState().addLog;
const originalCharacters = useCharacterStore.getState().characters;
const originalActiveCharacterId = useCharacterStore.getState().activeCharacterId;

const createHero = (actions = 1): Character => ({
  id: 'hero-action-test',
  saveVersion: 2,
  ruleset: '2014',
  name: 'Test Hero',
  class: 'fighter',
  race: 'human',
  gender: 'Male',
  level: 1,
  xp: 0,
  alignment: 'neutral_good',
  background: 'soldier',
  stats: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
  proficiencies: [],
  traits: [],
  features: [],
  flaws: [],
  ideals: [],
  bonds: [],
  backstory: '',
  languages: [],
  appearance: {
    hairColor: '',
    hairStyle: '',
    bodyType: 'Medium',
    eyeColor: '',
    skinColor: '',
    height: '',
    weight: ''
  },
  inventory: {},
  backpack: [],
  items: {},
  containers: {},
  equipment: {
    containerId: 'equipment-hero-action-test',
    slots: [
      { id: 'main_hand', itemId: null },
      { id: 'off_hand', itemId: null },
      { id: 'ranged', itemId: null },
      { id: 'chest', itemId: null }
    ]
  },
  knownSpells: [],
  preparedSpells: [],
  spellSlots: {},
  choices: {},
  hp: 20,
  maxHp: 20,
  money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  actionEconomy: {
    actions: { current: actions, max: 1 },
    bonusActions: { current: 1, max: 1 },
    reactions: { current: 1, max: 1 },
    movement: { current: 30, max: 30 },
    objectInteractions: { current: 1, max: 1 }
  }
});

const createGoblin = (overrides: Record<string, unknown> = {}) => ({
  id: 'goblin-action-test',
  name: 'Goblin',
  type: 'enemy',
  x: 3,
  y: 2,
  size: 'Small',
  hp: 12,
  maxHp: 12,
  armor_class: 99,
  isAlly: false,
  ...overrides
});

const createAllyCharacter = (): Character => ({
  ...createHero(),
  id: 'ally-action-test',
  name: 'Allied Companion'
});

const createAllyCombatant = () => ({
  id: 'ally-action-test',
  name: 'Allied Companion',
  type: 'npc',
  x: 8,
  y: 2,
  size: 'Medium',
  hp: 20,
  maxHp: 20,
  isAlly: true
});

const weaponAttack = {
  id: 'attack-unarmed',
  name: 'Unarmed Strike',
  category: 'Standard',
  actionType: 'actions',
  range: 1,
  attack_bonus: 0,
  damage: [{ damage_dice: '1+3', damage_type: { name: 'bludgeoning' } }]
};

let rollCount = 0;
let logMessages: string[] = [];

beforeEach(() => {
  rollCount = 0;
  logMessages = [];

  useCharacterStore.setState({
    characters: [createHero()],
    activeCharacterId: 'hero-action-test'
  });

  useGameStore.setState(state => ({
    activeCharacterId: 'hero-action-test',
    rollDice3D: async () => {
      rollCount += 1;
      return {
        id: `attack-roll-${rollCount}`,
        notation: '1d20',
        total: 11,
        label: 'Mock Attack',
        rolls: [{ die: 20, result: 11, valid: true }],
        modifier: 0,
        timestamp: Date.now(),
        source: '3d' as const
      };
    },
    addLog: (message: string) => {
      logMessages.push(message);
    },
    combatState: {
      ...state.combatState,
      grid: Array.from({ length: 10 }, (_, y) =>
        Array.from({ length: 10 }, (_, x) => ({ x, y, type: 'floor' }))
      ),
      walls: [],
      playerPos: { x: 2, y: 2 },
      pcPositions: {
        'hero-action-test': { x: 2, y: 2, rotation: 0 }
      },
      monsters: [createGoblin()],
      initiativeOrder: [
        { id: 'hero-action-test', name: 'Test Hero', value: 15, isPlayer: true, isAlly: false },
        { id: 'goblin-action-test', name: 'Goblin', value: 10, isPlayer: false, isAlly: false }
      ],
      activeTurnIndex: 0,
      activeConditions: {}
    }
  }));
});

afterEach(() => {
  useGameStore.setState({
    combatState: originalCombatState,
    rollDice3D: originalRollDice3D,
    rollDiceBackground: originalRollDiceBackground,
    isRolling3D: originalIsRolling3D,
    addLog: originalAddLog
  });
  useCharacterStore.setState({
    characters: originalCharacters,
    activeCharacterId: originalActiveCharacterId
  });
});

describe('Canonical player weapon action economy (#421)', () => {
  it('uses the allied combatant position when pcPositions has no entry', async () => {
    const ally = createAllyCombatant();
    const target = createGoblin({ x: 9, y: 2 });

    useCharacterStore.setState({
      characters: [createAllyCharacter()],
      activeCharacterId: ally.id
    });
    useGameStore.setState(state => ({
      activeCharacterId: ally.id,
      combatState: {
        ...state.combatState,
        playerPos: { x: 2, y: 2 },
        pcPositions: {},
        monsters: [ally, target]
      }
    }));

    await useGameStore.getState().resolveCombatAction(
      { id: ally.id, name: ally.name },
      target,
      weaponAttack
    );

    expect(rollCount).toBe(1);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(0);
  });

  it('does not use playerPos to accept a target far from an ally without pcPositions', async () => {
    const ally = createAllyCombatant();
    // This hostile is adjacent to playerPos (2,2), but five cells from the ally at (8,2).
    const target = createGoblin({ x: 3, y: 2 });

    useCharacterStore.setState({
      characters: [createAllyCharacter()],
      activeCharacterId: ally.id
    });
    useGameStore.setState(state => ({
      activeCharacterId: ally.id,
      combatState: {
        ...state.combatState,
        playerPos: { x: 2, y: 2 },
        pcPositions: {},
        monsters: [ally, target]
      }
    }));

    await useGameStore.getState().resolveCombatAction(
      { id: ally.id, name: ally.name },
      target,
      weaponAttack
    );

    expect(rollCount).toBe(0);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(1);
  });

  it('consumes exactly one action at resolution, including on a miss, and rejects a second attack', async () => {
    const actor = { id: 'hero-action-test', name: 'Test Hero' };
    const target = useGameStore.getState().combatState.monsters[0];

    // The test double returns an authoritative visible d20 result of 11.
    await useGameStore.getState().resolveCombatAction(actor, target, weaponAttack);

    expect(rollCount).toBe(1);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(0);
    expect(logMessages.some(message => message.includes('MISS!'))).toBe(true);

    await useGameStore.getState().resolveCombatAction(actor, target, weaponAttack);

    expect(rollCount).toBe(1);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(0);
    expect(logMessages.some(message => message.includes('actions remaining'))).toBe(true);
  });

  it('discards a pending weapon result when the initiating turn has ended', async () => {
    const actor = { id: 'hero-action-test', name: 'Test Hero' };
    const target = createGoblin({ armor_class: 1 });
    const nextHero = { ...createHero(), id: 'next-hero-action-test', name: 'Next Hero' };
    let releaseRoll!: (result: any) => void;

    useCharacterStore.setState({
      characters: [createHero(), nextHero],
      activeCharacterId: 'hero-action-test'
    });
    useGameStore.setState(state => ({
      combatState: {
        ...state.combatState,
        monsters: [target],
        initiativeOrder: [
          { id: 'hero-action-test', name: 'Test Hero', value: 15, isPlayer: true, isAlly: false },
          { id: nextHero.id, name: nextHero.name, value: 10, isPlayer: true, isAlly: false }
        ],
        activeTurnIndex: 0
      },
      rollDice3D: async () => new Promise(resolve => {
        releaseRoll = resolve;
      })
    }));

    const pendingAttack = useGameStore.getState().resolveCombatAction(actor, target, weaponAttack);
    expect(releaseRoll).toBeDefined();

    // Advance before DiceBox settles. The previous turn generation is now invalid.
    useGameStore.getState().nextTurn();
    releaseRoll({
      id: 'late-attack-roll',
      notation: '1d20',
      total: 15,
      label: 'Attack: Unarmed Strike',
      rolls: [{ die: 20, result: 15, valid: true }],
      modifier: 0,
      timestamp: Date.now(),
      source: '3d'
    });

    await pendingAttack;

    expect(useGameStore.getState().combatState.activeTurnIndex).toBe(1);
    expect(useGameStore.getState().combatState.monsters[0].hp).toBe(12);
    expect(useCharacterStore.getState().characters.find(char => char.id === actor.id)?.actionEconomy?.actions.current).toBe(1);
  });

  it('resolves a hostile attack through the canonical background resolver while DiceBox is busy', async () => {
    const hero = createHero();
    const monster = {
      id: 'monster-busy-dice-test',
      name: 'Goblin',
      type: 'enemy',
      x: 3,
      y: 2,
      size: 'Small',
      hp: 12,
      maxHp: 12,
      armor_class: 12,
      isAlly: false
    };
    const backgroundRolls: string[] = [];

    useCharacterStore.setState({ characters: [hero], activeCharacterId: hero.id });
    useGameStore.setState(state => ({
      isRolling3D: true,
      rollDice3D: async () => null,
      rollDiceBackground: async (notation: string, label: string) => {
        backgroundRolls.push(notation);
        const isAttack = notation.startsWith('1d20');
        return {
          id: `monster-roll-${backgroundRolls.length}`,
          notation,
          total: isAttack ? 18 : 4,
          label,
          rolls: isAttack
            ? [{ die: 20, result: 14, valid: true }]
            : [{ die: 6, result: 4, valid: true }],
          modifier: isAttack ? 4 : 0,
          timestamp: Date.now(),
          source: 'background' as const
        };
      },
      combatState: {
        ...state.combatState,
        monsters: [monster],
        pcPositions: { [hero.id]: { x: 2, y: 2, rotation: 0 } },
        initiativeOrder: [
          { id: monster.id, name: monster.name, value: 15, isPlayer: false, isAlly: false },
          { id: hero.id, name: hero.name, value: 10, isPlayer: true, isAlly: false }
        ],
        activeTurnIndex: 0
      }
    }));

    const resolved = await useGameStore.getState().resolveCombatAction(
      { id: monster.id, name: monster.name, x: monster.x, y: monster.y },
      { id: hero.id, name: hero.name, x: 2, y: 2, armor_class: 12, stats: hero.stats },
      {
        name: 'Scimitar',
        attack_bonus: 4,
        damage: [{ damage_dice: '1d6', damage_type: { name: 'slashing' } }]
      }
    );

    expect(resolved).toBe(true);
    expect(backgroundRolls).toEqual(['1d20+4', '1d6']);
    expect(useCharacterStore.getState().characters.find(char => char.id === hero.id)?.hp).toBe(16);
  });

  it('does not consume an action or roll against a target outside the active encounter', async () => {
    const actor = { id: 'hero-action-test', name: 'Test Hero' };
    const invalidTarget = createGoblin({ id: 'not-in-combat' });

    await useGameStore.getState().resolveCombatAction(actor, invalidTarget, weaponAttack);

    expect(rollCount).toBe(0);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(1);
  });

  it('does not consume an action or roll when the hostile is out of weapon range', async () => {
    const actor = { id: 'hero-action-test', name: 'Test Hero' };
    const outOfRangeTarget = createGoblin({ x: 6, y: 2 });

    useGameStore.setState(state => ({
      combatState: {
        ...state.combatState,
        monsters: [outOfRangeTarget as any]
      }
    }));

    await useGameStore.getState().resolveCombatAction(actor, outOfRangeTarget, weaponAttack);

    expect(rollCount).toBe(0);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(1);
  });

  it('does not consume an action when a wall blocks line of sight', async () => {
    const actor = { id: 'hero-action-test', name: 'Test Hero' };
    const target = useGameStore.getState().combatState.monsters[0];

    useGameStore.setState(state => ({
      combatState: {
        ...state.combatState,
        walls: [{ id: 'blocking-wall', x: 3, y: 2, orientation: 'vertical', type: 'wall' }]
      }
    }));

    await useGameStore.getState().resolveCombatAction(actor, target, weaponAttack);

    expect(rollCount).toBe(0);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(1);
  });

  it('rejects attacks when canonical action economy data is missing', async () => {
    const actor = { id: 'hero-action-test', name: 'Test Hero' };
    const target = useGameStore.getState().combatState.monsters[0];
    const hero = useCharacterStore.getState().characters[0];
    const { actionEconomy: _actionEconomy, ...characterWithoutEconomy } = hero;

    useCharacterStore.setState({ characters: [characterWithoutEconomy as Character] });

    await useGameStore.getState().resolveCombatAction(actor, target, weaponAttack);

    expect(rollCount).toBe(0);
    expect(logMessages.some(message => message.includes('resource is unavailable'))).toBe(true);
  });

  it('uses the V2 equipped-slot resolver for attack choices and includes supplied thrown range', () => {
    const hero = createHero();
    hero.items = {
      'dagger-instance': {
        id: 'dagger-instance',
        template: 'dagger',
        quantity: 1,
        addedAt: 1,
        kind: 'weapon',
        name: 'Dagger',
        weapon_range: 'Melee',
        range: { normal: 20, long: 60 },
        properties: [{ index: 'finesse' }, { index: 'thrown' }],
        damage: { damage_dice: '1d4', damage_type: { name: 'piercing' } }
      } as any,
      greatsword: {
        id: 'backpack-greatsword',
        template: 'greatsword',
        quantity: 1,
        addedAt: 2,
        kind: 'weapon',
        name: 'Greatsword'
      } as any
    };

    const weaponsBeforeEquip = getEquippedWeapons(hero);
    expect(weaponsBeforeEquip).toHaveLength(0);

    const mainHandSlot = hero.equipment?.slots.find(slot => slot.id === 'main_hand');
    expect(mainHandSlot).toBeDefined();
    if (mainHandSlot) mainHandSlot.itemId = 'dagger-instance';
    const equipped = getEquippedWeapons(hero);

    expect(equipped).toHaveLength(1);
    expect(equipped[0].slotId).toBe('main_hand');
    expect(equipped[0].item.template).toBe('dagger');
    expect(equipped[0].item.properties.map((property: any) => property.index)).toContain('thrown');

    const actionPanel = readSource('src/components/hud/game/ActionPanel.tsx');
    expect(actionPanel).toContain('getEquippedWeapons(activeChar).map');
    expect(actionPanel).toContain('const isThrown =');
    expect(actionPanel).toContain('isRanged || isThrown ? Number(item.range?.normal)');
  });

  it('keeps action consumption out of attack selection and cancellation UI', () => {
    const source = readSource('src/components/hud/game/ActionPanel.tsx');
    const attackBranchStart = source.indexOf("if (action.id === 'attack' || action.id.startsWith('attack-'))");
    const attackBranchEnd = source.indexOf("} else if (action.id === 'move')", attackBranchStart);
    const attackBranch = source.slice(attackBranchStart, attackBranchEnd);
    const cancelBranch = source.slice(
      source.indexOf('if (isActive) {'),
      attackBranchStart
    );

    expect(attackBranch).not.toContain('consumeAction(');
    expect(cancelBranch).not.toContain('consumeAction(');
  });
});
