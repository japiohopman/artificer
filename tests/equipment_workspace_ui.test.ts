import { describe, it, expect, beforeEach } from 'vitest';
import { resolveItemTaxonomy } from '../src/lib/inventoryTaxonomy';
import { useCharacterStore } from '../src/store/useCharacterStore';
import { useUIStore } from '../src/store/useUIStore';

describe('Equipment Workspace UI Architecture Unit Tests', () => {
  beforeEach(() => {
    useCharacterStore.setState({
      characters: [
        {
          id: 'char_1',
          name: 'Valerius',
          class: 'Fighter',
          level: 5,
          gender: 'Male',
          saveVersion: 2,
          equipment: {
            slots: [
              { id: 'main_hand', itemId: 'item_1' },
              { id: 'chest', itemId: 'item_2' }
            ]
          },
          items: {
            item_1: { id: 'item_1', template: 'longsword', quantity: 1, kind: 'weapon' },
            item_2: { id: 'item_2', template: 'chain-mail', quantity: 1, kind: 'armor' },
            item_3: { id: 'item_3', template: 'potion-of-healing', quantity: 3, kind: 'consumable' }
          },
          containers: {
            backpack_1: {
              id: 'backpack_1',
              type: 'backpack',
              slots: [{ itemId: 'item_3' }, { itemId: null }, { itemId: null }, { itemId: null }]
            }
          }
        },
        {
          id: 'char_2',
          name: 'Lyra',
          class: 'Wizard',
          level: 5,
          gender: 'Female',
          saveVersion: 2,
          equipment: { slots: [] },
          items: {},
          containers: {}
        }
      ],
      activeCharacterId: 'char_1'
    });

    useUIStore.setState({ inspectingItem: null });
  });

  it('1. Taxonomy Resolution: Correctly classifies Equipment vs Materials subcategories', () => {
    const sword = { id: 'longsword', kind: 'weapon' };
    const plate = { id: 'plate_armor', kind: 'armor' };
    const arrow = { id: 'arrows', kind: 'ammunition' };
    const tome = { id: 'spell_book', kind: 'book' };
    const gem = { id: 'ruby', kind: 'trinket' };

    expect(resolveItemTaxonomy(sword)).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'weapons',
      subcategoryLabel: 'Weapons'
    });

    expect(resolveItemTaxonomy(plate)).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'armor',
      subcategoryLabel: 'Armor'
    });

    expect(resolveItemTaxonomy(arrow)).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'ammunition',
      subcategoryLabel: 'Ammunition'
    });

    expect(resolveItemTaxonomy(tome)).toEqual({
      rootCategory: 'MATERIALS',
      subcategory: 'books',
      subcategoryLabel: 'Books'
    });

    expect(resolveItemTaxonomy(gem)).toEqual({
      rootCategory: 'MATERIALS',
      subcategory: 'valuables',
      subcategoryLabel: 'Valuables'
    });
  });

  it('2. Character Selector: Switching active character updates canonical store state', () => {
    const initialCharId = useCharacterStore.getState().activeCharacterId;
    expect(initialCharId).toBe('char_1');

    useCharacterStore.getState().setActiveCharacter('char_2');

    const updatedCharId = useCharacterStore.getState().activeCharacterId;
    expect(updatedCharId).toBe('char_2');

    const activeChar = useCharacterStore.getState().characters.find(c => c.id === updatedCharId);
    expect(activeChar?.name).toBe('Lyra');
    expect(activeChar?.class).toBe('Wizard');
  });

  it('3. Canonical State Integrity: Inventory & Equipment stay synchronized upon character switch', () => {
    const char1 = useCharacterStore.getState().characters.find(c => c.id === 'char_1');
    expect(char1?.equipment?.slots?.length).toBe(2);
    expect(char1?.items?.['item_1'].template).toBe('longsword');

    useCharacterStore.getState().setActiveCharacter('char_2');
    const char2 = useCharacterStore.getState().characters.find(c => c.id === 'char_2');
    expect(char2?.equipment?.slots?.length).toBe(0);

    // Switch back to char_1 and verify zero data loss or shadow corruption
    useCharacterStore.getState().setActiveCharacter('char_1');
    const char1Restored = useCharacterStore.getState().characters.find(c => c.id === 'char_1');
    expect(char1Restored?.equipment?.slots?.find((s: any) => s.id === 'main_hand')?.itemId).toBe('item_1');
    expect(char1Restored?.items?.['item_2'].template).toBe('chain-mail');
  });
});
