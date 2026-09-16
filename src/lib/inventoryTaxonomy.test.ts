import { describe, it, expect } from 'vitest';
import { resolveItemTaxonomy } from './inventoryTaxonomy';

describe('resolveItemTaxonomy', () => {
  it('resolves ammunition items explicitly under EQUIPMENT root', () => {
    const arrow = { id: 'arrows_20', name: 'Arrows (20)', kind: 'ammunition' };
    const bolt = { id: 'crossbow_bolts', name: 'Crossbow Bolts' };
    const needle = { id: 'blowgun_needles', name: 'Blowgun Needles' };

    expect(resolveItemTaxonomy(arrow)).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'ammunition',
      subcategoryLabel: 'Ammunition'
    });
    expect(resolveItemTaxonomy(bolt)).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'ammunition',
      subcategoryLabel: 'Ammunition'
    });
    expect(resolveItemTaxonomy(needle)).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'ammunition',
      subcategoryLabel: 'Ammunition'
    });
  });

  it('resolves weapons, armor, and shields correctly under EQUIPMENT root', () => {
    const sword = { id: 'longsword', kind: 'weapon' };
    const plate = { id: 'plate_armor', kind: 'armor' };
    const shield = { id: 'shield', kind: 'shield' };

    expect(resolveItemTaxonomy(sword).subcategory).toBe('weapons');
    expect(resolveItemTaxonomy(plate).subcategory).toBe('armor');
    expect(resolveItemTaxonomy(shield).subcategory).toBe('shields');
  });

  it('resolves books, keys, and valuables under MATERIALS root', () => {
    const book = { id: 'tome_of_clear_thought', kind: 'book' };
    const key = { id: 'iron_key', kind: 'key' };
    const ruby = { id: 'ruby_gem', kind: 'trinket' };

    expect(resolveItemTaxonomy(book)).toEqual({
      rootCategory: 'MATERIALS',
      subcategory: 'books',
      subcategoryLabel: 'Books'
    });
    expect(resolveItemTaxonomy(key)).toEqual({
      rootCategory: 'MATERIALS',
      subcategory: 'keys',
      subcategoryLabel: 'Keys'
    });
    expect(resolveItemTaxonomy(ruby)).toEqual({
      rootCategory: 'MATERIALS',
      subcategory: 'valuables',
      subcategoryLabel: 'Valuables'
    });
  });

  it('provides safe fallback for undefined or unknown items', () => {
    expect(resolveItemTaxonomy(null)).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'adventuring_gear',
      subcategoryLabel: 'Adventuring Gear'
    });
    expect(resolveItemTaxonomy({ id: 'mysterious_gadget' })).toEqual({
      rootCategory: 'EQUIPMENT',
      subcategory: 'adventuring_gear',
      subcategoryLabel: 'Adventuring Gear'
    });
  });
});
