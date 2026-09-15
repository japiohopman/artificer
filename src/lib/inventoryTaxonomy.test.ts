import { describe, it, expect } from 'vitest';
import { resolveItemTaxonomy } from './inventoryTaxonomy';

describe('inventoryTaxonomy', () => {
  it('resolves weapons correctly', () => {
    const item = { kind: 'weapon', id: 'longsword' };
    const res = resolveItemTaxonomy(item);
    expect(res.rootCategory).toBe('EQUIPMENT');
    expect(res.subcategory).toBe('weapons');
  });

  it('resolves armor correctly', () => {
    const item = { kind: 'armor', id: 'leather_armor' };
    const res = resolveItemTaxonomy(item);
    expect(res.rootCategory).toBe('EQUIPMENT');
    expect(res.subcategory).toBe('armor');
  });

  it('resolves materials correctly', () => {
    const item = { kind: 'material', id: 'iron_ore' };
    const res = resolveItemTaxonomy(item);
    expect(res.rootCategory).toBe('MATERIALS');
    expect(res.subcategory).toBe('crafting_materials');
  });

  it('resolves keys and quest items correctly', () => {
    const itemKey = { id: 'rusty_key' };
    expect(resolveItemTaxonomy(itemKey).subcategory).toBe('keys');

    const itemQuest = { isQuestItem: true, id: 'ancient_relic' };
    expect(resolveItemTaxonomy(itemQuest).subcategory).toBe('quest_items');
  });
});
