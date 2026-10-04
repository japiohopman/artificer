import { describe, it } from 'node:test';
import assert from 'node:assert';
import { searchExplorerItems, type ExplorerItem } from '../src/domain/explorer/explorerSearch.ts';

describe('Explorer Domain & Deterministic Search', () => {
  const sampleItems: ExplorerItem[] = [
    {
      id: 'goblin',
      index: 'goblin',
      name: 'Goblin',
      domain: 'enemies',
      category: 'humanoid',
      type: 'small humanoid',
      description: 'A small, greedy humanoid.',
      rulesetContext: '2014',
      raw: { isCategory: false }
    },
    {
      id: 'goblin_boss',
      index: 'goblin_boss',
      name: 'Goblin Boss',
      domain: 'enemies',
      category: 'humanoid',
      type: 'small humanoid',
      description: 'A stronger goblin leader.',
      rulesetContext: '2014',
      raw: { isCategory: false }
    },
    {
      id: 'humanoid',
      index: 'humanoid',
      name: 'Humanoids',
      domain: 'enemies',
      category: 'Category',
      raw: { isCategory: true }
    },
    {
      id: 'longsword',
      index: 'longsword',
      name: 'Longsword',
      domain: 'equipment',
      category: 'martial_weapon',
      description: 'A versatile martial weapon.',
      rulesetContext: '2024',
      raw: { isCategory: false }
    },
    {
      id: 'fireball',
      index: 'fireball',
      name: 'Fireball',
      domain: 'spells',
      category: 'evocation',
      description: 'A bright streak flashes from your pointing finger to a point you choose.',
      rulesetContext: '2024',
      raw: { isCategory: false }
    },
    {
      id: 'waterdeep',
      index: 'waterdeep',
      name: 'Waterdeep',
      domain: 'locations',
      category: 'city',
      tags: ['major city'],
      description: 'The City of Splendors.',
      raw: { isCategory: false }
    },
    {
      id: 'region-sword_coast',
      index: 'sword_coast',
      name: 'Sword Coast',
      domain: 'locations',
      category: 'Region',
      tags: ['region'],
      description: 'A region along the western coast of Faerûn.',
      raw: { isRegion: true, regionId: 'sword_coast', isCategory: false }
    }
  ];

  it('matches exact id and places exact match first', () => {
    const results = searchExplorerItems(sampleItems, 'goblin');
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].id, 'goblin');
    assert.strictEqual(results[1].id, 'goblin_boss');
  });

  it('regression: finds an underlying asset at root-level domain search without selecting a category', () => {
    // Filter sampleItems to enemies assets (non-category records)
    const enemyAssetItems = sampleItems.filter(i => i.domain === 'enemies' && !i.raw.isCategory);
    const results = searchExplorerItems(enemyAssetItems, 'Goblin', { domainFilter: 'enemies' });

    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].id, 'goblin');
    assert.strictEqual(results[0].raw.isCategory, false);
    assert.strictEqual(results[1].id, 'goblin_boss');
  });

  it('filters results by domain', () => {
    const locations = searchExplorerItems(sampleItems, 'Coast', { domainFilter: 'locations' });
    assert.strictEqual(locations.length, 1);
    assert.strictEqual(locations[0].id, 'region-sword_coast');

    const equipment = searchExplorerItems(sampleItems, 'Longsword', { domainFilter: 'equipment' });
    assert.strictEqual(equipment.length, 1);
    assert.strictEqual(equipment[0].id, 'longsword');
  });

  it('filters results by ruleset when specified', () => {
    const res2024 = searchExplorerItems(sampleItems, '', { rulesetFilter: '2024' });
    const ids = res2024.map(i => i.id);
    assert.strictEqual(ids.includes('fireball'), true);
    assert.strictEqual(ids.includes('longsword'), true);
    assert.strictEqual(ids.includes('goblin'), false);
  });

  it('coexists locations and assets in the same dataset', () => {
    const allEnemies = searchExplorerItems(sampleItems, '', { domainFilter: 'enemies' });
    assert.strictEqual(allEnemies.length, 3); // 2 assets + 1 category

    const allLocations = searchExplorerItems(sampleItems, '', { domainFilter: 'locations' });
    assert.strictEqual(allLocations.length, 2);
  });

  it('returns stable alphabetical order when query is empty', () => {
    const results = searchExplorerItems(sampleItems, '');
    const names = results.map(r => r.name);
    const sortedNames = [...names].sort();
    assert.deepStrictEqual(names, sortedNames);
  });
});
