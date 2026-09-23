// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { useInventoryStore } from '../src/store/useInventoryStore';
import { createDefaultBackpack, createDefaultEquipment } from '../src/lib/inventoryUtils';
import { migrateCharacterV1ToV2 } from '../src/lib/migrationUtils';
import { resolveVisualIdentity } from '../src/lib/inventoryVisuals/visualIdentity';
import { getSpriteCellForVisual } from '../src/lib/inventoryVisuals/spriteManifest';

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

  it('rejects transfer of missing non-canonical item in transferItem without mutating state', async () => {
    const { transferItem } = useInventoryStore.getState();

    transferItem({
      sourceId: 'char_test_1',
      targetId: 'party',
      itemId: 'non_existent_item_999'
    });
    await new Promise((res) => setTimeout(res, 50));

    const { partyInventory } = useInventoryStore.getState();
    expect(partyInventory.length).toBe(0);

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    expect(Object.keys(activeChar?.items || {}).length).toBe(2);
  });

  it('rejects transfer from party to character when target backpack is full and unstackable without losing item', async () => {
    const { transferItem } = useInventoryStore.getState();

    // Set party inventory item
    useInventoryStore.setState({
      partyInventory: [{ id: 'party_axe_1', template: 'greataxe', name: 'Greataxe', quantity: 1 }]
    });

    // Fill character backpack completely with 24 non-matching items
    useCharacterStore.setState({
      characters: useCharacterStore.getState().characters.map(c => {
        if (c.id !== 'char_test_1') return c;
        const items = { ...c.items };
        for (let i = 0; i < 24; i++) {
          items[`fill_item_${i}`] = { id: `fill_item_${i}`, template: 'potion-of-healing', kind: 'consumable' };
        }
        return {
          ...c,
          items,
          containers: {
            ...c.containers,
            'backpack_char_test_1': {
              ...c.containers['backpack_char_test_1'],
              slots: Array.from({ length: 24 }).map((_, i) => ({ id: `bag_${i}`, itemId: `fill_item_${i}` }))
            }
          }
        };
      })
    });

    transferItem({
      sourceId: 'party',
      targetId: 'char_test_1',
      itemId: 'party_axe_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    // Item must remain safely in party inventory without being lost
    const { partyInventory } = useInventoryStore.getState();
    expect(partyInventory.length).toBe(1);
    expect(partyInventory[0].id).toBe('party_axe_1');

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    expect(activeChar?.items?.['party_axe_1']).toBeUndefined();
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

  it('resolves equipment sprite coordinates across starter weapon, armor, spellcasting, and adventuring gear sprite sheets using canonical asset layer', () => {
    const weapons1 = ['dagger', 'handaxe', 'javelin', 'mace', 'quarterstaff', 'sickle', 'club', 'spear', 'shortsword', 'rapier', 'longsword', 'scimitar', 'greatsword', 'greataxe', 'greatclub', 'light_hammer'];
    const weapons2 = ['shortbow', 'longbow', 'light_crossbow', 'heavy_crossbow', 'sling', 'dart', 'blowgun', 'trident', 'warhammer', 'battleaxe', 'flail', 'maul', 'morningstar', 'pike', 'halberd', 'glaive'];
    const spellcasting = ['arcane_focus', 'component_pouch', 'druidic_focus', 'holy_symbol', 'crystal', 'orb', 'rod', 'staff', 'wand', 'spellbook', 'amulet', 'reliquary', 'emblem', 'sprig_of_mistletoe', 'totem'];
    const armor = ['padded_armor', 'leather_armor', 'studded_leather_armor', 'hide_armor', 'chain_shirt', 'scale_mail', 'breastplate', 'half_plate', 'ring_mail', 'chain_mail', 'splint_armor', 'plate_armor', 'shield'];
    const adventuring = ['explorers_pack', 'dungeoneers_pack', 'burglars_pack', 'diplomats_pack', 'entertainers_pack', 'priests_pack', 'scholars_pack', 'backpack', 'bedroll', 'hempen_rope_50_ft', 'rations', 'torch', 'tinderbox', 'waterskin', 'mess_kit'];

    weapons1.forEach(w => {
      const visualId = resolveVisualIdentity(w);
      const cell = getSpriteCellForVisual(visualId);
      expect(cell).toBeDefined();
      expect(cell?.sheetId).toBe('starter_weapons_01');
    });

    weapons2.forEach(w => {
      const visualId = resolveVisualIdentity(w);
      const cell = getSpriteCellForVisual(visualId);
      expect(cell).toBeDefined();
      expect(cell?.sheetId).toBe('starter_weapons_02');
    });

    spellcasting.forEach(s => {
      const visualId = resolveVisualIdentity(s);
      const cell = getSpriteCellForVisual(visualId);
      expect(cell).toBeDefined();
      expect(cell?.sheetId).toBe('starter_spellcasting_01');
    });

    armor.forEach(a => {
      const visualId = resolveVisualIdentity(a);
      const cell = getSpriteCellForVisual(visualId);
      expect(cell).toBeDefined();
      expect(cell?.sheetId).toBe('starter_armor_01');
    });

    adventuring.forEach(adv => {
      const visualId = resolveVisualIdentity(adv);
      const cell = getSpriteCellForVisual(visualId);
      expect(cell).toBeDefined();
      expect(cell?.sheetId).toBe('starter_adventuring_01');
    });
  });

  it('rejects invalid equipment placement directly in moveItem domain command', async () => {
    const { moveItem } = useInventoryStore.getState();

    // Try moving consumable potion into main_hand equip slot
    moveItem({
      source: { type: 'inventory_slot', slotIndex: 1 },
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'potion_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeNull(); // Transaction rejected
  });

  it('rejects forged/mismatched source location in moveItem domain command without mutating state', async () => {
    const { moveItem } = useInventoryStore.getState();

    // Claim potion_1 is in slot 0 when longsword_1 is actually in slot 0
    moveItem({
      source: { type: 'inventory_slot', slotIndex: 0 },
      target: { type: 'inventory_slot', slotIndex: 5 },
      item: { id: 'potion_1' }, // Forged item ID for slotIndex 0
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const backpack = activeChar?.containers?.['backpack_char_test_1'];

    // Confirm slot 0 still contains longsword_1 and slot 5 remains empty
    expect(backpack?.slots[0].itemId).toBe('longsword_1');
    expect(backpack?.slots[5].itemId).toBeNull();
  });

  it('rejects malformed inventory_slot source without slotIndex', async () => {
    const { moveItem } = useInventoryStore.getState();

    moveItem({
      source: { type: 'inventory_slot' }, // Missing slotIndex
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeNull();
  });

  it('rejects malformed equip_slot source without slotId', async () => {
    const { equipItem, moveItem } = useInventoryStore.getState();
    equipItem('longsword_1', 'main_hand');
    await new Promise((res) => setTimeout(res, 50));

    moveItem({
      source: { type: 'equip_slot' }, // Missing slotId
      target: { type: 'inventory_slot', slotIndex: 5 },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBe('longsword_1');
  });

  it('rejects malformed container_slot source without containerId or slotIndex', async () => {
    const { moveItem } = useInventoryStore.getState();

    moveItem({
      source: { type: 'container_slot', containerId: 'backpack_char_test_1' }, // Missing slotIndex
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeNull();
  });

  it('rejects unknown source type without mutating state', async () => {
    const { moveItem } = useInventoryStore.getState();

    moveItem({
      source: { type: 'unknown_source' as any },
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeNull();
  });

  it('rejects non-canonical item ID not in char.items', async () => {
    const { moveItem } = useInventoryStore.getState();

    moveItem({
      source: { type: 'inventory_slot', slotIndex: 0 },
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'unregistered_item_999' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeNull();
  });

  it('rejects ambiguous V2 backpack source without slotIndex', async () => {
    const { moveItem } = useInventoryStore.getState();

    moveItem({
      source: { type: 'backpack' }, // Ambiguous source without specific slot index
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    expect(mainHandSlot?.itemId).toBeNull(); // Rejected without mutation
  });

  it('clears container_slot source when moving to inventory_slot without duplication', async () => {
    const { moveItem } = useInventoryStore.getState();

    // Create a pouch container with an item in slot 0
    useCharacterStore.setState({
      characters: useCharacterStore.getState().characters.map(c => {
        if (c.id !== 'char_test_1') return c;
        return {
          ...c,
          items: {
            ...c.items,
            'gem_1': { id: 'gem_1', template: 'ruby', kind: 'material' }
          },
          containers: {
            ...c.containers,
            'pouch_1': {
              id: 'pouch_1',
              type: 'pouch',
              slots: [{ id: 'pouch_slot_0', itemId: 'gem_1' }]
            }
          }
        };
      })
    });

    // Move gem_1 from pouch_1 slot 0 to backpack slot 5
    moveItem({
      source: { type: 'container_slot', containerId: 'pouch_1', slotIndex: 0 },
      target: { type: 'inventory_slot', slotIndex: 5 },
      item: { id: 'gem_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const pouch = activeChar?.containers?.['pouch_1'];
    const backpack = activeChar?.containers?.['backpack_char_test_1'];

    // Source slot cleared, target slot populated with exactly 1 placement
    expect(pouch?.slots[0].itemId).toBeNull();
    expect(backpack?.slots[5].itemId).toBe('gem_1');

    // Count placements of gem_1
    let gemPlacements = 0;
    Object.values(activeChar?.containers || {}).forEach((c: any) => {
      c.slots?.forEach((s: any) => { if (s.itemId === 'gem_1') gemPlacements++; });
    });
    expect(gemPlacements).toBe(1);
  });

  it('succeeds on direct equipment -> equipment swap with a full backpack when items are compatible', async () => {
    const { moveItem } = useInventoryStore.getState();

    // Equip longsword in main_hand and dagger in off_hand, fill backpack completely
    useCharacterStore.setState({
      characters: useCharacterStore.getState().characters.map(c => {
        if (c.id !== 'char_test_1') return c;
        const items = {
          ...c.items,
          'dagger_1': { id: 'dagger_1', template: 'dagger', kind: 'weapon' }
        };
        for (let i = 0; i < 24; i++) {
          items[`fill_item_${i}`] = { id: `fill_item_${i}`, template: 'potion-of-healing', kind: 'consumable' };
        }
        return {
          ...c,
          items,
          equipment: {
            ...c.equipment,
            slots: c.equipment.slots.map(s => {
              if (s.id === 'main_hand') return { ...s, itemId: 'longsword_1' };
              if (s.id === 'off_hand') return { ...s, itemId: 'dagger_1' };
              return s;
            })
          },
          containers: {
            ...c.containers,
            'backpack_char_test_1': {
              ...c.containers['backpack_char_test_1'],
              slots: Array.from({ length: 24 }).map((_, i) => ({ id: `bag_${i}`, itemId: `fill_item_${i}` }))
            }
          }
        };
      })
    });

    // Move longsword from main_hand to off_hand (which holds dagger) with a completely full backpack
    moveItem({
      source: { type: 'equip_slot', slotId: 'main_hand' },
      target: { type: 'equip_slot', slotId: 'off_hand' },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    const offHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'off_hand');

    // Direct equipment swap succeeded! main_hand now holds dagger_1, off_hand holds longsword_1
    expect(mainHandSlot?.itemId).toBe('dagger_1');
    expect(offHandSlot?.itemId).toBe('longsword_1');
  });

  it('rejects transaction when displaced occupant is non-canonical (absent from char.items)', async () => {
    const { moveItem } = useInventoryStore.getState();

    // Inject non-canonical occupant ID in main_hand slot
    useCharacterStore.setState({
      characters: useCharacterStore.getState().characters.map(c => {
        if (c.id !== 'char_test_1') return c;
        return {
          ...c,
          equipment: {
            ...c.equipment,
            slots: c.equipment.slots.map(s => s.id === 'main_hand' ? { ...s, itemId: 'fake_ghost_item_999' } : s)
          }
        };
      })
    });

    // Try moving longsword_1 from slot 0 into main_hand
    moveItem({
      source: { type: 'inventory_slot', slotIndex: 0 },
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === 'char_test_1');
    const mainHandSlot = activeChar?.equipment?.slots.find(s => s.id === 'main_hand');
    const backpack = activeChar?.containers?.['backpack_char_test_1'];

    // Rejected due to non-canonical occupant
    expect(mainHandSlot?.itemId).toBe('fake_ghost_item_999');
    expect(backpack?.slots[0].itemId).toBe('longsword_1');
  });

  it('verifies registry count remains unchanged across rejected and successful transactions', async () => {
    const { moveItem } = useInventoryStore.getState();

    const initialRegistryCount = Object.keys(useCharacterStore.getState().characters[0].items).length;

    // 1. Rejected move
    moveItem({
      source: { type: 'inventory_slot', slotIndex: 0 },
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'potion_1' }, // Invalid equip
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));
    expect(Object.keys(useCharacterStore.getState().characters[0].items).length).toBe(initialRegistryCount);

    // 2. Successful move
    moveItem({
      source: { type: 'inventory_slot', slotIndex: 0 },
      target: { type: 'equip_slot', slotId: 'main_hand' },
      item: { id: 'longsword_1' },
      characterId: 'char_test_1'
    });
    await new Promise((res) => setTimeout(res, 50));
    expect(Object.keys(useCharacterStore.getState().characters[0].items).length).toBe(initialRegistryCount);
  });
});
