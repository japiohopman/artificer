import { describe, it, expect, beforeEach } from 'vitest';
import { Character } from '../src/store/useCharacterStore';
import {
  calculateDerivedStats,
  calculateWeaponAttackBonus,
  getEquippedItemWithMetadata,
  getEquippedWeapons
} from '../src/lib/character';
import {
  isProficientWithEquipment,
  isItemCompatibleWithSlot
} from '../src/lib/equipmentCompatibility';
import { ensureCharacterEquipmentLoaded } from '../src/lib/inventoryUtils';

describe('V2 Equipment Combat Synchronization & Proficiency Tests', () => {
  let wizardCharacter: Character;

  beforeEach(async () => {
    wizardCharacter = {
      id: 'test_wizard_1',
      saveVersion: 2,
      name: 'Gandalf Test',
      class: 'wizard',
      race: 'human',
      gender: 'Male',
      level: 1,
      xp: 0,
      alignment: 'neutral_good',
      background: 'sage',
      stats: {
        str: 10,
        dex: 14, // +2
        con: 12, // +1
        int: 16, // +3
        wis: 10,
        cha: 8
      },
      proficiencies: [
        'daggers',
        'darts',
        'slings',
        'quarterstaffs',
        'crossbows, light'
      ],
      traits: [],
      features: [],
      flaws: [],
      ideals: [],
      bonds: [],
      backstory: '',
      languages: ['common'],
      appearance: {
        hairColor: 'grey',
        hairStyle: 'long',
        bodyType: 'Medium',
        eyeColor: 'blue',
        skinColor: '#ffdbac',
        height: "6'0\"",
        weight: '170 lbs'
      },
      inventory: {},
      backpack: [],
      knownSpells: [],
      preparedSpells: [],
      spellSlots: {},
      choices: {},
      hp: 7,
      maxHp: 7,
      money: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
      items: {
        item_dagger_1: {
          id: 'item_dagger_1',
          template: 'dagger',
          quantity: 1,
          addedAt: 1000,
          kind: 'weapon'
        },
        item_greatsword_1: {
          id: 'item_greatsword_1',
          template: 'greatsword',
          quantity: 1,
          addedAt: 1001,
          kind: 'weapon'
        },
        item_leather_armor_1: {
          id: 'item_leather_armor_1',
          template: 'leather_armor',
          quantity: 1,
          addedAt: 1002,
          kind: 'armor'
        },
        item_shield_1: {
          id: 'item_shield_1',
          template: 'shield',
          quantity: 1,
          addedAt: 1003,
          kind: 'shield'
        }
      },
      containers: {},
      equipment: {
        containerId: 'equipment_test_wizard_1',
        slots: [
          { id: 'main_hand', itemId: null },
          { id: 'off_hand', itemId: null },
          { id: 'chest', itemId: null },
          { id: 'head', itemId: null },
          { id: 'hands', itemId: null },
          { id: 'feet', itemId: null },
          { id: 'back', itemId: null },
          { id: 'neck', itemId: null }
        ]
      }
    };

    await ensureCharacterEquipmentLoaded(wizardCharacter);
  });

  it('1. Unarmed Base State: AC equals 10 + Dex (+2) = 12, no weapons equipped', () => {
    const derived = calculateDerivedStats(wizardCharacter);
    expect(derived.ac).toBe(12); // 10 + 2 (Dex)

    const weapons = getEquippedWeapons(wizardCharacter);
    expect(weapons.length).toBe(0);
    expect(derived.nonProficientEquippedItems).toEqual([]);
  });

  it('2. V2 Weapon Equipped: Equipping proficient weapon (Dagger) reflects in getEquippedWeapons and calculates correct attack bonus', () => {
    // Equip Dagger in main_hand
    const mainSlot = wizardCharacter.equipment!.slots.find(s => s.id === 'main_hand');
    mainSlot!.itemId = 'item_dagger_1';

    const weapons = getEquippedWeapons(wizardCharacter);
    expect(weapons.length).toBe(1);
    expect(weapons[0].slotId).toBe('main_hand');
    expect(weapons[0].item.template).toBe('dagger');

    // Proficiency (+2) + Dex Mod (+2) = +4
    const daggerMeta = getEquippedItemWithMetadata(wizardCharacter, 'main_hand');
    const attackBonus = calculateWeaponAttackBonus(wizardCharacter, daggerMeta);
    expect(attackBonus).toBe(4);

    expect(isProficientWithEquipment(wizardCharacter, daggerMeta)).toBe(true);
  });

  it('3. Weapon Replacement: Replacing Dagger with non-proficient Greatsword updates attack actions and omits proficiency bonus', () => {
    // Equip Greatsword in main_hand
    const mainSlot = wizardCharacter.equipment!.slots.find(s => s.id === 'main_hand');
    mainSlot!.itemId = 'item_greatsword_1';

    const weapons = getEquippedWeapons(wizardCharacter);
    expect(weapons.length).toBe(1);
    expect(weapons[0].item.template).toBe('greatsword');

    const gsMeta = getEquippedItemWithMetadata(wizardCharacter, 'main_hand');
    const isProficient = isProficientWithEquipment(wizardCharacter, gsMeta);
    expect(isProficient).toBe(false);

    // Non-proficient weapon: Attack Bonus = Str Mod (+0) + 0 (Proficiency omitted) = 0
    const attackBonus = calculateWeaponAttackBonus(wizardCharacter, gsMeta);
    expect(attackBonus).toBe(0);

    const derived = calculateDerivedStats(wizardCharacter);
    expect(derived.nonProficientEquippedItems.length).toBe(1);
    expect(derived.nonProficientEquippedItems[0].slotId).toBe('main_hand');
  });

  it('4. Armor & AC: Equipping and removing armor changes calculated AC based on Atlas armor metadata', () => {
    // Unarmored AC = 12
    expect(calculateDerivedStats(wizardCharacter).ac).toBe(12);

    // Equip Leather Armor (Base 11 + Dex) in chest
    const chestSlot = wizardCharacter.equipment!.slots.find(s => s.id === 'chest');
    chestSlot!.itemId = 'item_leather_armor_1';

    // Leather Armor (Base 11) + Dex (+2) = 13
    const armoredStats = calculateDerivedStats(wizardCharacter);
    expect(armoredStats.ac).toBe(13);

    // Remove armor -> AC returns to 12
    chestSlot!.itemId = null;
    expect(calculateDerivedStats(wizardCharacter).ac).toBe(12);
  });

  it('5. Shield & AC: Equipping a shield adds +2 AC and reports non-proficiency if character lacks shield proficiency', () => {
    const offSlot = wizardCharacter.equipment!.slots.find(s => s.id === 'off_hand');
    offSlot!.itemId = 'item_shield_1';

    // Base 12 + Shield (+2) = 14 AC
    const derived = calculateDerivedStats(wizardCharacter);
    expect(derived.ac).toBe(14);

    // Wizard is not proficient with shields
    const shieldMeta = getEquippedItemWithMetadata(wizardCharacter, 'off_hand');
    expect(isProficientWithEquipment(wizardCharacter, shieldMeta)).toBe(false);

    expect(derived.nonProficientEquippedItems.some(i => i.slotId === 'off_hand')).toBe(true);
  });

  it('6. Compatibility & Non-Proficiency: Non-proficient equipment IS allowed to be equipped without rejection', () => {
    const itemGreatsword = wizardCharacter.items!.item_greatsword_1;
    const canEquip = isItemCompatibleWithSlot(itemGreatsword, 'main_hand', {});
    expect(canEquip).toBe(true);

    const isProficient = isProficientWithEquipment(wizardCharacter, itemGreatsword);
    expect(isProficient).toBe(false);
  });
});
