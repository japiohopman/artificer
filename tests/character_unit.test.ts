import { calculateCharacterWeight, resolveItemTemplateWeight, ensureCharacterEquipmentLoaded } from '../src/lib/inventoryUtils';
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

// 3. V2 Registry-based item weight tests (canonical resolution via ensureCharacterEquipmentLoaded lifecycle)
const v2Char: any = {
  id: 'v2_multi',
  saveVersion: 2,
  items: {
    inst_1: { id: 'inst_1', template: 'plate-armor', quantity: 1 },        // 65 lbs
    inst_2: { id: 'inst_2', template: 'shield', quantity: 1 },             // 6 lbs
    inst_3: { id: 'inst_3', template: 'potion-of-healing', quantity: 4 },  // 0.1 * 4 = 0.4 lbs
    inst_4: { id: 'inst_4', template: 'unknown_magic_orb', quantity: 1 }   // 0 lbs
  },
  money: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 } // 100 coins = 2 lbs
};

// 3a. Prior to lifecycle preloading, calculateCharacterWeight returns only currency weight (2 lbs)
const weightBeforeLoad = calculateCharacterWeight(v2Char);
if (weightBeforeLoad !== 2) throw new Error(`Expected weight 2 before preloading, got ${weightBeforeLoad}`);

// 3b. Execute canonical character equipment preloader lifecycle
await ensureCharacterEquipmentLoaded(v2Char);

// 3c. After lifecycle preloading, calculateCharacterWeight resolves full canonical template weights from Atlas: 65 + 6 + 0.4 + 0 + 2 = 73.4
const weightAfterLoad = calculateCharacterWeight(v2Char);
if (weightAfterLoad !== 73.4) throw new Error(`Expected weight 73.4 after preloading, got ${weightAfterLoad}`);

// 3c. Derived stats feature speed_bonus check
import { calculateDerivedStats } from '../src/lib/statCalculations';
const speedFeatChar: any = {
  id: 'speed_char',
  race: 'Human',
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  features: [
    {
      index: 'fast_movement',
      name: 'Fast Movement',
      feature_specific: {
        passive_modifiers: { speed_bonus: 10 }
      }
    }
  ]
};
const derivedStats = calculateDerivedStats(speedFeatChar);
if (derivedStats.speed !== 40) throw new Error(`Expected speed 40 with +10 speed bonus feature, got ${derivedStats.speed}`);

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
