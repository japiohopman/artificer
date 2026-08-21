import { calculateCharacterWeight } from '../src/lib/inventoryUtils';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { selectActiveCharacter, selectCharacterById, selectMainCharacterSlots, selectPartyCharacters } from '../src/lib/character/selectors';

console.log('Running Character Architecture Unit Tests...');

// 1. Empty inventory weight
const emptyChar: any = {
  id: 'empty_char',
  name: 'Empty Hero',
  inventory: {},
  backpack: [],
  money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
};
const emptyWeight = calculateCharacterWeight(emptyChar);
if (emptyWeight !== 0) throw new Error(`Expected empty weight 0, got ${emptyWeight}`);

// 2. V1 Legacy inventory weight
const v1Char: any = {
  id: 'v1_char',
  name: 'V1 Hero',
  saveVersion: 1,
  inventory: {
    chest: { name: 'Chain Mail', weight: 55, quantity: 1 },
    main_hand: { name: 'Longsword', weight: 3, quantity: 1 }
  },
  backpack: [
    { name: 'Rations', weight: '2 lbs', quantity: 5 }, // 10 lbs
    { name: 'Torch', weight: 1, quantity: 2 } // 2 lbs
  ],
  money: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 } // 50 coins = 1 lb
};
const v1Weight = calculateCharacterWeight(v1Char); // 55 + 3 + 10 + 2 + 1 = 71
if (v1Weight !== 71) throw new Error(`Expected V1 weight 71, got ${v1Weight}`);

// 3. V2 Registry-based item weight
const v2Char: any = {
  id: 'v2_char',
  name: 'V2 Hero',
  saveVersion: 2,
  items: {
    inst_1: { id: 'inst_1', template: 'plate_armor', weight: 65, quantity: 1 },
    inst_2: { id: 'inst_2', template: 'shield', weight_lbs: 6, quantity: 1 },
    inst_3: { id: 'inst_3', template: 'potion', metadata: { weight: 0.5 }, quantity: 4 } // 2 lbs
  },
  money: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 } // 100 coins = 2 lbs
};
const v2Weight = calculateCharacterWeight(v2Char); // 65 + 6 + 2 + 2 = 75
if (v2Weight !== 75) throw new Error(`Expected V2 weight 75, got ${v2Weight}`);

// 4. Character Store A/B Switching & State Isolation
const store = useCharacterStore.getState();

const charA: any = {
  id: 'char_a',
  name: 'Thorin',
  class: 'Fighter',
  level: 5,
  hp: 45,
  maxHp: 45,
  stats: { str: 18, dex: 12, con: 16, int: 10, wis: 10, cha: 8 },
  inventory: { main_hand: { name: 'Greatsword', weight: 6 } }
};

const charB: any = {
  id: 'char_b',
  name: 'Elrond',
  class: 'Wizard',
  level: 5,
  hp: 28,
  maxHp: 28,
  stats: { str: 8, dex: 14, con: 12, int: 18, wis: 14, cha: 12 },
  inventory: { main_hand: { name: 'Staff', weight: 4 } }
};

store.setCharacters([charA, charB]);

// Test Canonical Selector Layer
// Activate A
store.setActiveCharacter('char_a');
const selectedActiveA = selectActiveCharacter(useCharacterStore.getState());
if (selectedActiveA?.name !== 'Thorin' || selectedActiveA?.stats?.str !== 18) {
  throw new Error('selectActiveCharacter failed for Thorin');
}

// Select by ID
const selectedByIdB = selectCharacterById(useCharacterStore.getState(), 'char_b');
if (selectedByIdB?.name !== 'Elrond' || selectedByIdB?.stats?.int !== 18) {
  throw new Error('selectCharacterById failed for Elrond');
}

// Activate B
store.setActiveCharacter('char_b');
const selectedActiveB = selectActiveCharacter(useCharacterStore.getState());
if (selectedActiveB?.name !== 'Elrond' || selectedActiveB?.stats?.int !== 18) {
  throw new Error('selectActiveCharacter failed for Elrond');
}

// Modify B's HP
store.updateCharacter('char_b', { hp: 20 });
const bUpdated = selectCharacterById(useCharacterStore.getState(), 'char_b');
if (bUpdated?.hp !== 20) throw new Error('Elrond HP update failed');

// Switch back to A and verify A's state is preserved
store.setActiveCharacter('char_a');
const selectedActiveA2 = selectActiveCharacter(useCharacterStore.getState());
if (selectedActiveA2?.name !== 'Thorin' || selectedActiveA2?.hp !== 45) {
  throw new Error('Thorin state persistence failed after switching');
}

// Select party
const party = selectPartyCharacters(useCharacterStore.getState());
if (party.length !== 2) throw new Error('selectPartyCharacters failed');

// 5. Save slot integrity
const slot1Char: any = { id: 'slot1', name: 'Slot 1 Hero', level: 1 };
const slot2Char: any = { id: 'slot2', name: 'Slot 2 Hero', level: 2 };

useCharacterStore.getState().setMainCharacterSlots([slot1Char, slot2Char, null]);
const slotsBefore = selectMainCharacterSlots(useCharacterStore.getState());
if (slotsBefore[0]?.name !== 'Slot 1 Hero' || slotsBefore[1]?.name !== 'Slot 2 Hero') {
  throw new Error('Main character slots setting failed');
}

useCharacterStore.getState().setMainCharacter(slot1Char);
const slotsAfter = selectMainCharacterSlots(useCharacterStore.getState());
if (slotsAfter[0]?.id !== 'slot1' || slotsAfter[1]?.id !== 'slot2' || slotsAfter[2] !== null) {
  throw new Error('Save slots overwritten during setMainCharacter');
}

console.log('✓ All Character Architecture Unit Tests Passed Successfully!');
