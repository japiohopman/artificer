// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { useInventoryStore } from '../src/store/useInventoryStore';
import { createDefaultBackpack, createDefaultEquipment } from '../src/lib/inventoryUtils';

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
});
