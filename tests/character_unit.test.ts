import { calculateCharacterWeight, resolveItemTemplateWeight, ensureCharacterEquipmentLoaded } from '../src/lib/inventoryUtils';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { selectActiveCharacter, selectCharacterById, selectMainCharacterSlots, selectPartyCharacters } from '../src/lib/character/selectors';

import { getActiveRulesetContext, getRulesetVersionFolder, fetchEquipmentData, fetchMonsterData } from '../src/services/storageService';
import { useGameStore } from '../src/store/useGameStore';

import fs from 'fs';
import path from 'path';

// Polyfill relative fetch for Node CLI unit test environment
if (typeof window === 'undefined') {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: any, init?: any) => {
    const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    if (urlStr.startsWith('/assets/atlas/')) {
      const localPath = path.resolve(process.cwd(), 'public' + urlStr);
      if (fs.existsSync(localPath)) {
        const content = fs.readFileSync(localPath, 'utf8');
        return new Response(content, { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(null, { status: 404, statusText: 'Not Found' });
    }
    return originalFetch(input, init);
  };
}

console.log('Running Character Architecture Unit Tests...');

// 0. Ruleset Context Boundary Unit Tests
if (getActiveRulesetContext() !== '2014') {
  throw new Error(`Expected default active ruleset context '2014', got '${getActiveRulesetContext()}'`);
}
if (getActiveRulesetContext('2024') !== '2024') {
  throw new Error(`Expected explicit ruleset override '2024', got '${getActiveRulesetContext('2024')}'`);
}
if (getRulesetVersionFolder('2014') !== '14' || getRulesetVersionFolder('2024') !== '24') {
  throw new Error(`Ruleset version folder resolution failed`);
}

// Test Zustand gameStore integration
useGameStore.getState().setRuleset('2024');
if (getActiveRulesetContext() !== '2024' || getRulesetVersionFolder() !== '24') {
  throw new Error(`gameStore setRuleset('2024') did not update canonical context boundary`);
}
useGameStore.getState().setRuleset('2014');
if (getActiveRulesetContext() !== '2014' || getRulesetVersionFolder() !== '14') {
  throw new Error(`gameStore setRuleset('2014') did not restore canonical context boundary`);
}

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

// 3. V2 Registry-based item weight tests (canonical resolution via domain lifecycle preloading)

async function runAsyncUnitTests() {
  const v2Char: any = {
    id: 'v2_char',
    saveVersion: 2,
    ruleset: '2014',
    items: {
      inst_1: { id: 'inst_1', template: 'plate-armor', quantity: 1 }, // 65 lbs
      inst_2: { id: 'inst_2', template: 'shield', quantity: 1 },      // 6 lbs
      inst_3: { id: 'inst_3', template: 'potion-of-healing', quantity: 4 }, // 0.5 * 4 = 2 lbs
      inst_4: { id: 'inst_4', template: 'unknown_magic_orb', quantity: 1 } // 0 lbs
    },
    money: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 } // 100 coins = 2 lbs
  };

  // 3a. Prior to domain lifecycle preload, weight calculation returns currency weight (2 lbs) synchronously without errors
  const weightBeforeLoad = calculateCharacterWeight(v2Char);
  if (weightBeforeLoad !== 2) throw new Error(`Expected weight before load to be 2, got ${weightBeforeLoad}`);

  // 3b. Execute domain lifecycle preload (ensures canonical Atlas definitions are loaded into cache)
  await ensureCharacterEquipmentLoaded(v2Char);

  // 3c. After domain lifecycle preload, weight resolves deterministically (65 + 6 + 0.4 + 0 + 2 = 73.4 lbs)
  const weightAfterLoad = calculateCharacterWeight(v2Char);
  if (weightAfterLoad !== 73.4) throw new Error(`Expected weight after load to be 73.4, got ${weightAfterLoad}`);

  // 3d. Ruleset-aware consumer resolution test (distinguish versioned records on disk via explicit ruleset parameter and active store context)
  const solvent2014 = await fetchEquipmentData('universal-solvent', '2014');
  if (!solvent2014 || !solvent2014.url?.includes('/14/') || solvent2014.kind !== 'consumable' || solvent2014.rulesetContext !== '2014') {
    throw new Error(`fetchEquipmentData for 2014 failed to resolve 2014 record. Got: ${JSON.stringify(solvent2014)}`);
  }
  const solvent2024 = await fetchEquipmentData('universal-solvent', '2024');
  if (!solvent2024 || !solvent2024.url?.includes('/24/') || solvent2024.kind !== 'equipment' || solvent2024.rulesetContext !== '2024') {
    throw new Error(`fetchEquipmentData for 2024 failed to resolve 2024 record. Got: ${JSON.stringify(solvent2024)}`);
  }

  // Test implicit context resolution through useGameStore without explicit ruleset param
  useGameStore.getState().setRuleset('2014');
  const storeSolvent2014 = await fetchEquipmentData('universal-solvent');
  if (!storeSolvent2014 || !storeSolvent2014.url?.includes('/14/') || storeSolvent2014.rulesetContext !== '2014') {
    throw new Error('fetchEquipmentData failed to resolve via active gameStore ruleset 2014');
  }

  useGameStore.getState().setRuleset('2024');
  const storeSolvent2024 = await fetchEquipmentData('universal-solvent');
  if (!storeSolvent2024 || !storeSolvent2024.url?.includes('/24/') || storeSolvent2024.rulesetContext !== '2024') {
    throw new Error('fetchEquipmentData failed to resolve via active gameStore ruleset 2024');
  }
  useGameStore.getState().setRuleset('2014'); // restore default

  // Test monster fallback behavior: beholders exist in the base 2014 monsters folder.
  // A 2014 request loads 2014 data -> rulesetContext = '2014'
  const mon2014 = await fetchMonsterData('beholder', '2014');
  if (!mon2014 || !mon2014.name || mon2014.rulesetContext !== '2014') {
    throw new Error(`fetchMonsterData for 2014 failed to resolve with canonical 2014 context. Got: ${mon2014?.rulesetContext}`);
  }
  // A 2024 request for beholder fails to find a /24/ beholder and falls back to 2014 data.
  // The returned rulesetContext MUST truthfully report '2014' (the version actually loaded), NOT '2024'.
  const mon2024 = await fetchMonsterData('beholder', '2024');
  if (!mon2024 || !mon2024.name || mon2024.rulesetContext !== '2014') {
    throw new Error(`fetchMonsterData for 2024 with 2014 fallback failed to truthfully report actual loaded ruleset '2014'. Got: ${mon2024?.rulesetContext}`);
  }
}

await runAsyncUnitTests();

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

// 6. Comprehensive Character Calculation Integrity Pass Tests
import { getEffectiveStats, calculateMaxSpellSlots } from '../src/lib/statCalculations';
import { getModifier } from '../src/lib/npcGeneratorUtils';

// 6a. Ability Modifiers & Proficiency Progression
const levelTests = [
  { level: 1, expectedProf: 2 },
  { level: 4, expectedProf: 2 },
  { level: 5, expectedProf: 3 },
  { level: 8, expectedProf: 3 },
  { level: 9, expectedProf: 4 },
  { level: 13, expectedProf: 5 },
  { level: 17, expectedProf: 6 },
  { level: 20, expectedProf: 6 }
];
levelTests.forEach(({ level, expectedProf }) => {
  const d = calculateDerivedStats({ level, stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } } as any);
  if (d.proficiencyBonus !== expectedProf) {
    throw new Error(`Expected level ${level} prof bonus ${expectedProf}, got ${d.proficiencyBonus}`);
  }
});

if (getModifier(10) !== 0 || getModifier(18) !== 4 || getModifier(8) !== -1 || getModifier(15) !== 2) {
  throw new Error('Ability modifier calculation error');
}

// 6b. Effective Stats with Item Set (Headband of Intellect) and Additive Bonuses
const statsChar: any = {
  stats: { str: 14, dex: 12, con: 14, int: 8, wis: 10, cha: 10 },
  inventory: {
    head: { name: 'Headband of Intellect', intelligence_set: 19 },
    ring: { name: 'Ring of Strength', strength_bonus: 2 }
  }
};
const effStats = getEffectiveStats(statsChar);
if (effStats.int !== 19 || effStats.str !== 16) {
  throw new Error(`Expected effective INT 19 and STR 16, got INT ${effStats.int}, STR ${effStats.str}`);
}

// 6c. Armor Class Construction & Features
// Base leather + DEX (maxDex unlimited)
const rogueChar: any = {
  stats: { str: 10, dex: 16, con: 12, int: 10, wis: 10, cha: 10 },
  inventory: {
    chest: { name: 'Leather Armor', armor_class: { base: 11, dex_bonus: true } }
  }
};
if (calculateDerivedStats(rogueChar).ac !== 14) {
  throw new Error(`Expected Leather + DEX 16 AC 14, got ${calculateDerivedStats(rogueChar).ac}`);
}

// Medium armor with max DEX cap
const mediumArmorChar: any = {
  stats: { str: 14, dex: 16, con: 12, int: 10, wis: 10, cha: 10 },
  inventory: {
    chest: { name: 'Scale Mail', armor_class: { base: 14, dex_bonus: true, max_bonus: 2 } }
  }
};
if (calculateDerivedStats(mediumArmorChar).ac !== 16) {
  throw new Error(`Expected Scale Mail + capped DEX AC 16, got ${calculateDerivedStats(mediumArmorChar).ac}`);
}

// Real Atlas-shaped Barbarian Unarmored Defense (unarmored_defense_barbarian, feature_specific: {})
const barbChar: any = {
  class: 'Barbarian',
  stats: { str: 16, dex: 14, con: 16, int: 8, wis: 10, cha: 8 }, // dexMod 2, conMod 3
  features: [{
    index: 'unarmored_defense_barbarian',
    class: { index: 'barbarian', name: 'barbarian' },
    name: 'unarmored defense (barbarian)',
    feature_specific: {}
  }]
};
if (calculateDerivedStats(barbChar).ac !== 15) {
  throw new Error(`Expected Barbarian Unarmored AC 15, got ${calculateDerivedStats(barbChar).ac}`);
}

// Real Atlas-shaped Barbarian Unarmored Defense WITH Shield (+2 AC allowed)
const barbWithShield: any = {
  class: 'Barbarian',
  stats: { str: 16, dex: 14, con: 16, int: 8, wis: 10, cha: 8 }, // dexMod 2, conMod 3
  inventory: { 'off-hand': { index: 'shield', armor_category: 'Shield' } },
  features: [{
    index: 'unarmored_defense_barbarian',
    class: { index: 'barbarian', name: 'barbarian' },
    name: 'unarmored defense (barbarian)',
    feature_specific: {}
  }]
};
if (calculateDerivedStats(barbWithShield).ac !== 17) {
  throw new Error(`Expected Barbarian Unarmored + Shield AC 17, got ${calculateDerivedStats(barbWithShield).ac}`);
}

// Real Atlas-shaped Monk Unarmored Defense (unarmored_defense, feature_specific: {})
const monkChar: any = {
  class: 'Monk',
  stats: { str: 10, dex: 18, con: 12, int: 10, wis: 16, cha: 8 }, // dexMod 4, wisMod 3
  features: [{
    index: 'unarmored_defense',
    class: { index: 'monk', name: 'monk' },
    name: 'unarmored defense',
    feature_specific: {}
  }]
};
if (calculateDerivedStats(monkChar).ac !== 17) {
  throw new Error(`Expected Monk Unarmored AC 17, got ${calculateDerivedStats(monkChar).ac}`);
}

// Monk WITH Shield equipped MUST PROHIBIT Monk Unarmored Defense (reverting to normal 10 + DEX + Shield)
const monkWithShield: any = {
  class: 'Monk',
  stats: { str: 10, dex: 18, con: 12, int: 10, wis: 16, cha: 8 }, // dexMod 4, wisMod 3
  inventory: { 'off-hand': { index: 'shield', armor_category: 'Shield' } },
  features: [{
    index: 'unarmored_defense',
    class: { index: 'monk', name: 'monk' },
    name: 'unarmored defense',
    feature_specific: {}
  }]
};
// 10 base + 4 dex + 2 shield = 16 (wisdom modifier of 3 is NOT added)
if (calculateDerivedStats(monkWithShield).ac !== 16) {
  throw new Error(`Expected Monk with Shield AC 16 (unarmored wis mod disabled), got ${calculateDerivedStats(monkWithShield).ac}`);
}

// Real Atlas-shaped Draconic Resilience (draconic_resilience, passive_modifiers.ac_set = "13 + dexterity_modifier")
const draconicChar: any = {
  class: 'Sorcerer',
  subclass: 'Draconic Bloodline',
  stats: { str: 8, dex: 16, con: 14, int: 10, wis: 10, cha: 16 }, // dexMod 3
  features: [{
    index: 'draconic_resilience',
    name: 'draconic resilience',
    feature_specific: {
      passive_modifiers: {
        ac_set: '13 + dexterity_modifier'
      }
    }
  }]
};
if (calculateDerivedStats(draconicChar).ac !== 16) {
  throw new Error(`Expected Draconic Resilience AC 16 (13 + DEX 3), got ${calculateDerivedStats(draconicChar).ac}`);
}

// Armored Character with Barbarian/Monk feature MUST BYPASS Unarmored Defense and use armor AC
const armoredBarb: any = {
  class: 'Barbarian',
  stats: { str: 16, dex: 14, con: 16, int: 8, wis: 10, cha: 8 }, // dexMod 2, conMod 3
  inventory: {
    chest: { name: 'Chain Mail', armor_class: { base: 16, dex_bonus: false } }
  },
  features: [{
    index: 'unarmored_defense_barbarian',
    class: { index: 'barbarian', name: 'barbarian' },
    name: 'unarmored defense (barbarian)',
    feature_specific: {}
  }]
};
if (calculateDerivedStats(armoredBarb).ac !== 16) {
  throw new Error(`Expected Armored Barbarian to use Chain Mail AC 16, got ${calculateDerivedStats(armoredBarb).ac}`);
}

// 6d. Speed, Initiative, and Carrying Capacity
const halflingChar: any = {
  race: 'Halfling',
  stats: { str: 12, dex: 14, con: 10, int: 10, wis: 10, cha: 10 }
};
const halflingDerived = calculateDerivedStats(halflingChar);
if (halflingDerived.speed !== 25 || halflingDerived.initiative !== 2 || halflingDerived.weightCapacity !== 180) {
  throw new Error(`Expected halfling speed 25, init 2, weightCap 180; got speed ${halflingDerived.speed}, init ${halflingDerived.initiative}, weightCap ${halflingDerived.weightCapacity}`);
}

// 6e. Attack Bonus Tests (Melee, Ranged, Ranged + Archery, Finesse, Magic Bonuses)
import { calculateWeaponAttackBonus } from '../src/lib/statCalculations';

const fighterWithArchery: any = {
  level: 5, // prof 3
  stats: { str: 14, dex: 18, con: 14, int: 10, wis: 10, cha: 10 }, // strMod 2, dexMod 4
  choices: { 'fighting-style': ['Archery'] }
};

const longbow = { name: 'Longbow', weapon_range: 'Ranged', properties: [] };
const longsword = { name: 'Longsword', weapon_range: 'Melee', properties: [] };
const rapier = { name: 'Rapier', weapon_range: 'Melee', properties: [{ index: 'finesse', name: 'Finesse' }] };
const magicDagger = { name: 'Dagger +1', weapon_range: 'Melee', attack_bonus: 1, properties: [{ index: 'finesse', name: 'Finesse' }] };

// Melee weapon (STR mod 2 + prof 3 = 5)
const meleeAtk = calculateWeaponAttackBonus(fighterWithArchery, longsword);
if (meleeAtk !== 5) throw new Error(`Expected longsword attack bonus 5, got ${meleeAtk}`);

// Ranged weapon + Archery (DEX mod 4 + prof 3 + 2 archery = 9)
const rangedAtk = calculateWeaponAttackBonus(fighterWithArchery, longbow);
if (rangedAtk !== 9) throw new Error(`Expected longbow + archery attack bonus 9, got ${rangedAtk}`);

// Finesse weapon (DEX mod 4 > STR mod 2 + prof 3 = 7)
const finesseAtk = calculateWeaponAttackBonus(fighterWithArchery, rapier);
if (finesseAtk !== 7) throw new Error(`Expected rapier attack bonus 7, got ${finesseAtk}`);

// Magic dagger +1 (DEX mod 4 + prof 3 + 1 weapon = 8)
const magicAtk = calculateWeaponAttackBonus(fighterWithArchery, magicDagger);
if (magicAtk !== 8) throw new Error(`Expected +1 dagger attack bonus 8, got ${magicAtk}`);

// 6e. 1/3 Casters Spell Save DC & Spell Attack Bonus
const eldritchKnight: any = {
  class: 'Fighter',
  subclass: 'Eldritch Knight',
  level: 7, // prof 3
  stats: { str: 16, dex: 10, con: 14, int: 16, wis: 10, cha: 8 }, // strMod 3, intMod 3
  inventory: {
    'main-hand': { name: 'Longsword', attack_bonus: 1, properties: [] }
  }
};
const ekDerived = calculateDerivedStats(eldritchKnight);
if (ekDerived.attackBonus !== 7) { // 3 prof + 3 str + 1 weapon
  throw new Error(`Expected Eldritch Knight attack bonus 7, got ${ekDerived.attackBonus}`);
}
if (ekDerived.spellSaveDC !== 14 || ekDerived.spellAttackBonus !== 6) { // 8 + 3 prof + 3 int = 14 DC; 3 prof + 3 int = 6 attack
  throw new Error(`Expected Eldritch Knight DC 14 / Attack 6, got DC ${ekDerived.spellSaveDC} / Attack ${ekDerived.spellAttackBonus}`);
}

// 6f. Passive Perception with Skill/Proficiency/Expertise
const perceptionChar: any = {
  level: 5, // prof 3
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 14, cha: 10 }, // wisMod 2
  skills: ['skill_perception'],
  choices: { expertise: ['Perception'] }
};
const percDerived = calculateDerivedStats(perceptionChar);
if (percDerived.passivePerception !== 18) { // 10 + 2 wis + 3 prof + 3 expertise
  throw new Error(`Expected Passive Perception 18, got ${percDerived.passivePerception}`);
}

// 6g. Spell Slot Maximums (Warlock vs Full Caster vs 1/3 Caster)
const warlock: any = { class: 'Warlock', level: 5 };
const warlockSlots = calculateMaxSpellSlots(warlock);
if (warlockSlots['3'] !== 2 || Object.keys(warlockSlots).length !== 1) {
  throw new Error(`Expected Warlock 2 level 3 slots, got ${JSON.stringify(warlockSlots)}`);
}

const eldritchKnightSlots = calculateMaxSpellSlots(eldritchKnight); // Level 7 1/3 caster -> floor(7/3)=2 -> 1st level: 3 slots
if (eldritchKnightSlots['1'] !== 3) {
  throw new Error(`Expected Eldritch Knight level 7 to have 3 level 1 slots, got ${JSON.stringify(eldritchKnightSlots)}`);
}

console.log('✓ All Character Architecture Unit Tests Passed Successfully!');
