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
    addLog: originalAddLog
  });
  useCharacterStore.setState({
    characters: originalCharacters,
    activeCharacterId: originalActiveCharacterId
  });
});

describe('Canonical player weapon action economy (#421)', () => {
  it('consumes exactly one action at resolution, including on a miss, and rejects a second attack', async () => {
    const actor = { id: 'hero-action-test', name: 'Test Hero' };
    const target = useGameStore.getState().combatState.monsters[0];

    await useGameStore.getState().resolveCombatAction(actor, target, weaponAttack);

    expect(rollCount).toBe(1);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(0);
    expect(logMessages.some(message => message.includes('MISS!'))).toBe(true);

    await useGameStore.getState().resolveCombatAction(actor, target, weaponAttack);

    expect(rollCount).toBe(1);
    expect(useCharacterStore.getState().characters[0].actionEconomy?.actions.current).toBe(0);
    expect(logMessages.some(message => message.includes('no actions remaining'))).toBe(true);
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
      dagger: {
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

    hero.equipment?.slots.find(slot => slot.id === 'main_hand')!.itemId = 'dagger-instance';
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
