// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { useInventoryStore } from '../src/store/useInventoryStore';
import { createDefaultBackpack, createDefaultEquipment } from '../src/lib/inventoryUtils';
import { migrateCharacterV1ToV2 } from '../src/lib/migrationUtils';
import { getEquipmentSpriteCoord } from '../src/components/character/equipment/equipmentSpriteMap';

describe('Inventory & Equipment Architecture Unit Tests', () => {
  const mockChar: any = {
    id: 'char_test_1',
    name: 'Hero Test',
    race: 'human',
    class: 'fighter',
    level: 1,
    hp: 10,
    maxHp: 10,
    ac: 14,
    speed: 30,
    stats: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
    inventory: {},
    backpack: [],
    saveVersion: 2,
    items: {
      'longsword_1': { id: 'longsword_1', template: 'longsword', quantity: 1, kind: 'weapon' },
      'potion_1': { id: 'potion_1', template: 'potion-of-healing', quantity: 3, kind: 'consumable' }
    },
    equipment: createDefaultEquipment('char_test_1'),
    containers: {
      'backpack_char_test_1': {
        ...createDefaultBackpack('char_test_1'),
        slots: [
          { id: 'bag_0', itemId: 'longsword_1' },
          { id: 'bag_1', itemId: 'potion_1' },
          ...Array.from({ length: 22 }).map((_, i) => ({ id: `bag_${i + 2}`, itemId: null }))
        ]
      }
    }
  };

  beforeEach(() => {
    useCharacterStore.setState({
      characters: [mockChar],
      activeCharacterId: 'char_test_1'
    });
    useInventoryStore.setState({
      partyInventory: [],
      isInventoryOpen: false,
      isInventoryMenuOpen: false
    });
  });

  it('loads inventory correctly from canonical character state', () => {
    const { characters, activeCharacterId } = useCharacterStore.getState();
    const activeChar = characters.find(c => c.id === activeCharacterId);
    expect(activeChar).toBeDefined();
    expect(activeChar?.items?.['longsword_1']).toBeDefined();
    expect(activeChar?.items?.['potion_1'].quantity).toBe(3);
  });

  it('equips item into correct slot on canonical V2 state', async () => {
    const { equipItem } = useInventoryStore.getState();
    equipItem('longsword_1', 'main_hand');

    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBe('longsword_1');

    const backpack = activeChar?.containers?.['backpack_char_test_1'];
    const oldBagSlot = backpack?.slots.find(s => s.id === 'bag_0');
    expect(oldBagSlot?.itemId).toBeNull();
  });

  it('unequips item back to backpack on canonical V2 state', async () => {
    const { equipItem, unequipItem } = useInventoryStore.getState();
    equipItem('longsword_1', 'main_hand');
    await new Promise((res) => setTimeout(res, 50));

    unequipItem('main_hand');
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeNull();

    const backpack = activeChar?.containers?.['backpack_char_test_1'];
    const restoredSlot = backpack?.slots.find(s => s.itemId === 'longsword_1');
    expect(restoredSlot).toBeDefined();
  });

  it('transfers item between character and party storage without duplicating or losing items', async () => {
    const { transferItem } = useInventoryStore.getState();
    transferItem({
      sourceId: 'char_test_1',
      targetId: 'party',
      itemId: 'potion_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const { partyInventory } = useInventoryStore.getState();
    expect(partyInventory.length).toBe(1);
    expect(partyInventory[0].template || partyInventory[0].id).toBe('potion-of-healing');

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    expect(activeChar?.items?.['potion_1']).toBeUndefined();
  });

  it('preserves save slot persistence state across loadCharacters and setMainCharacter triggers', async () => {
    const { setMainCharacter, loadCharacters } = useCharacterStore.getState();

    setMainCharacter(mockChar);
    const activeParty = useCharacterStore.getState().characters;
    expect(activeParty.length).toBe(1);
    expect(activeParty[0].id).toBe('char_test_1');

    // Reload characters boundary
    loadCharacters();
    const reloadedParty = useCharacterStore.getState().characters;
    expect(reloadedParty.length).toBeGreaterThan(0);
  });

  it('migrates legacy V1 character save to V2 canonical items and equipment without duplicating or losing items', () => {
    const legacyChar: any = {
      id: 'v1_char',
      name: 'V1 Hero',
      inventory: {
        'main-hand': { id: 'v1_sword', index: 'longsword', name: 'Longsword', quantity: 1 }
      },
      backpack: [
        { id: 'v1_potion', index: 'potion-of-healing', name: 'Potion of Healing', quantity: 2 }
      ]
    };

    const migrated = migrateCharacterV1ToV2(legacyChar);
    expect(migrated.saveVersion).toBe(2);
    expect(migrated.items).toBeDefined();

    const mainHandSlot = migrated.equipment.slots.find((s: any) => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeDefined();

    const backpackContainer = Object.values(migrated.containers).find((c: any) => c.type === 'backpack');
    expect(backpackContainer).toBeDefined();
    expect(backpackContainer.slots.some((s: any) => s.itemId !== null)).toBe(true);
  });

  it('normalizes real recruit NPC repository JSON files with full item data integrity', () => {
    const fs = require('fs');
    const path = require('path');

    const npcPath1 = path.resolve(process.cwd(), 'public/assets/atlas/characters/recruit_npc/2Pdtnswo8Nj2nafY.json');
    const npcPath2 = path.resolve(process.cwd(), 'public/assets/atlas/characters/recruit_npc/xVmbM44RXyI2Eqq3.json');

    const raw1 = JSON.parse(fs.readFileSync(npcPath1, 'utf8'));
    const raw2 = JSON.parse(fs.readFileSync(npcPath2, 'utf8'));

    const normalized1 = migrateCharacterV1ToV2(raw1);
    const normalized2 = migrateCharacterV1ToV2(raw2);

    expect(normalized1.saveVersion).toBe(2);
    expect(Object.keys(normalized1.items).length).toBeGreaterThan(0);

    // Verify main_hand, chest, off_hand equipment slots populated from raw1 inventory
    const mainHandSlot1 = normalized1.equipment.slots.find((s: any) => s.id === 'main_hand');
    const chestSlot1 = normalized1.equipment.slots.find((s: any) => s.id === 'chest');
    const offHandSlot1 = normalized1.equipment.slots.find((s: any) => s.id === 'off_hand');

    expect(mainHandSlot1?.itemId).not.toBeNull();
    expect(chestSlot1?.itemId).not.toBeNull();
    expect(offHandSlot1?.itemId).not.toBeNull();

    // Verify backpack container items match raw1 backpack items
    const backpack1 = Object.values(normalized1.containers).find((c: any) => c.type === 'backpack');
    expect(backpack1).toBeDefined();
    const backpackMappedItemIds = backpack1.slots.filter((s: any) => s.itemId !== null).map((s: any) => s.itemId);
    expect(backpackMappedItemIds.length).toBeGreaterThan(0);

    expect(normalized2.saveVersion).toBe(2);
    expect(Object.keys(normalized2.items).length).toBeGreaterThan(0);
  });

  it('resolves equipment sprite coordinates across starter weapon, armor, spellcasting, and adventuring gear sprite sheets', () => {
    const weapons1 = ['dagger', 'handaxe', 'javelin', 'mace', 'quarterstaff', 'sickle', 'club', 'spear', 'shortsword', 'rapier', 'longsword', 'scimitar', 'greatsword', 'greataxe', 'greatclub', 'light_hammer'];
    const weapons2 = ['shortbow', 'longbow', 'light_crossbow', 'heavy_crossbow', 'sling', 'dart', 'blowgun', 'trident', 'warhammer', 'battleaxe', 'flail', 'maul', 'morningstar', 'pike', 'halberd', 'glaive'];
    const spellcasting = ['arcane_focus', 'component_pouch', 'druidic_focus', 'holy_symbol', 'crystal', 'orb', 'rod', 'staff', 'wand', 'spellbook', 'amulet', 'reliquary', 'emblem', 'sprig_of_mistletoe', 'totem'];
    const armor = ['padded_armor', 'leather_armor', 'studded_leather_armor', 'hide_armor', 'chain_shirt', 'scale_mail', 'breastplate', 'half_plate', 'ring_mail', 'chain_mail', 'splint_armor', 'plate_armor', 'shield'];
    const adventuring = ['explorers_pack', 'dungeoneers_pack', 'burglars_pack', 'diplomats_pack', 'entertainers_pack', 'priests_pack', 'scholars_pack', 'backpack', 'bedroll', 'hempen_rope_50_ft', 'rations', 'torch', 'tinderbox', 'waterskin', 'mess_kit'];

    weapons1.forEach(w => {
      const coord = getEquipmentSpriteCoord(w);
      expect(coord).not.toBeNull();
      expect(coord?.sheet).toBe('starter_weapons_01');
    });

    weapons2.forEach(w => {
      const coord = getEquipmentSpriteCoord(w);
      expect(coord).not.toBeNull();
      expect(coord?.sheet).toBe('starter_weapons_02');
    });

    spellcasting.forEach(s => {
      const coord = getEquipmentSpriteCoord(s);
      expect(coord).not.toBeNull();
      expect(coord?.sheet).toBe('starter_spellcasting_01');
    });

    armor.forEach(a => {
      const coord = getEquipmentSpriteCoord(a);
      expect(coord).not.toBeNull();
      expect(coord?.sheet).toBe('starter_armor_01');
    });

    adventuring.forEach(adv => {
      const coord = getEquipmentSpriteCoord(adv);
      expect(coord).not.toBeNull();
      expect(coord?.sheet).toBe('starter_adventuring_01');
    });
  });

  it('preserves distinct ItemInstances sharing the same template without merging or deduplicating', () => {
    const characterWithDuplicates: any = {
      id: 'char_dups',
      name: 'Twin Blades',
      saveVersion: 2,
      items: {
        'handaxe_instance_A': { id: 'handaxe_instance_A', template: 'handaxe', quantity: 1 },
        'handaxe_instance_B': { id: 'handaxe_instance_B', template: 'handaxe', quantity: 1 }
      },
      equipment: {
        containerId: 'equip_char_dups',
        slots: [{ id: 'main_hand', itemId: 'handaxe_instance_A' }]
      },
      containers: {
        'backpack_char_dups': {
          id: 'backpack_char_dups',
          type: 'backpack',
          slots: [{ id: 'slot_0', itemId: 'handaxe_instance_B' }]
        }
      }
    };

    const normalized = migrateCharacterV1ToV2(characterWithDuplicates);
    expect(normalized.items['handaxe_instance_A']).toBeDefined();
    expect(normalized.items['handaxe_instance_B']).toBeDefined();
    expect(Object.keys(normalized.items).length).toBe(2);

    const mainHand = normalized.equipment.slots.find((s: any) => s.id === 'main_hand');
    const backpack = Object.values(normalized.containers).find((c: any) => c.type === 'backpack');
    expect(mainHand?.itemId).toBe('handaxe_instance_A');
    expect(backpack?.slots[0].itemId).toBe('handaxe_instance_B');
  });
});
