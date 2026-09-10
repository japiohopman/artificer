import { describe, it, expect, beforeEach } from 'vitest';
import { fetchSpellData, fetchSpellList, getActiveRulesetContext } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';
import { useAtlasStore } from '../src/store/useAtlasStore';
import { useGameStore } from '../src/store/useGameStore';
import fs from 'fs';
import path from 'path';

describe('2024 Spells Domain Unit & Integration Tests', () => {

  beforeEach(() => {
    useGameStore.getState().setRuleset('2014');
  });

  describe('Ruleset Isolation & Boundary Enforcement', () => {
    it('fetchSpellData(index, "2014") resolves strictly 2014 dataset with 2014 rulesetContext', async () => {
      const cure14 = await fetchSpellData('cure_wounds', '2014');
      expect(cure14).not.toBeNull();
      expect(cure14.rulesetContext).toBe('2014');
      expect(cure14.heal_at_slot_level['1']).toBe('1d8 + MOD');
    });

    it('fetchSpellData(index, "2024") resolves strictly 2024 dataset with 2024 rulesetContext', async () => {
      const cure24 = await fetchSpellData('cure_wounds', '2024');
      expect(cure24).not.toBeNull();
      expect(cure24.rulesetContext).toBe('2024');
      expect(cure24.heal_at_slot_level['1']).toBe('2d8 + MOD');
    });

    it('returns null for missing 2024 spell without silent fallback to 2014', async () => {
      const nonExistent24 = await fetchSpellData('non_existent_spell_xyz_2024', '2024');
      expect(nonExistent24).toBeNull();
    });

    it('returns null for missing 2014 spell without silent fallback to 2024', async () => {
      const nonExistent14 = await fetchSpellData('non_existent_spell_xyz_2014', '2014');
      expect(nonExistent14).toBeNull();
    });

    it('returned rulesetContext truthfully matches the dataset actually resolved', async () => {
      const spell14 = await fetchSpellData('fireball', '2014');
      const spell24 = await fetchSpellData('fireball', '2024');

      expect(spell14.rulesetContext).toBe('2014');
      expect(spell24.rulesetContext).toBe('2024');
    });
  });

  describe('Catalogue & Index Integrity', () => {
    it('resolves index_14.json correctly and verifies index entries point to /14/', async () => {
      const list14 = await fetchSpellList('2014');
      expect(list14.length).toBe(323);
      list14.forEach(item => {
        expect(item.rulesetContext).toBe('2014');
        const resolvedPath = item.json_path || item.url || '';
        expect(resolvedPath).toContain('/14/');
      });
    });

    it('resolves index_24.json correctly and verifies index entries point to /24/', async () => {
      const list24 = await fetchSpellList('2024');
      expect(list24.length).toBe(323);
      list24.forEach(item => {
        expect(item.rulesetContext).toBe('2024');
        const resolvedPath = item.json_path || item.url || '';
        expect(resolvedPath).toContain('/24/');
      });
    });

    it('verifies exact 1-to-1 match between index entries and files on disk', () => {
      const baseDir = path.resolve(process.cwd(), 'public/assets/atlas/spell');
      const index14Path = path.join(baseDir, 'index_14.json');
      const index24Path = path.join(baseDir, 'index_24.json');

      const index14Data = JSON.parse(fs.readFileSync(index14Path, 'utf8'));
      const index24Data = JSON.parse(fs.readFileSync(index24Path, 'utf8'));

      const dir14 = path.join(baseDir, 'json/14');
      const dir24 = path.join(baseDir, 'json/24');

      const files14 = fs.readdirSync(dir14).filter(f => f.endsWith('.json'));
      const files24 = fs.readdirSync(dir24).filter(f => f.endsWith('.json'));

      expect(index14Data.length).toBe(files14.length);
      expect(index24Data.length).toBe(files24.length);

      const index14Indices = new Set(index14Data.map((s: any) => s.index));
      const index24Indices = new Set(index24Data.map((s: any) => s.index));

      files14.forEach(f => {
        const idx = f.replace('.json', '');
        expect(index14Indices.has(idx), `Missing index_14 entry for ${f}`).toBe(true);
      });

      files24.forEach(f => {
        const idx = f.replace('.json', '');
        expect(index24Indices.has(idx), `Missing index_24 entry for ${f}`).toBe(true);
      });
    });
  });

  describe('Audited 2024 Spell Mechanics & Specific Field Values', () => {
    it('verifies chill_touch 2024 damage scaling is 1d10 necrotic (up from 1d8)', async () => {
      const chill24 = await fetchSpellData('chill_touch', '2024');
      expect(chill24).not.toBeNull();
      expect(chill24.damage.damage_type.index).toBe('necrotic');
      expect(chill24.damage.damage_at_character_level).toEqual({
        '1': '1d10',
        '5': '2d10',
        '11': '3d10',
        '17': '4d10'
      });
    });

    it('verifies true_strike 2024 contains radiant weapon damage scaling at 5th, 11th, and 17th level', async () => {
      const strike24 = await fetchSpellData('true_strike', '2024');
      expect(strike24).not.toBeNull();
      expect(strike24.damage.damage_type.index).toBe('radiant');
      expect(strike24.damage.damage_at_character_level).toEqual({
        '5': '1d6',
        '11': '2d6',
        '17': '3d6'
      });
    });

    it('verifies cure_wounds 2024 base healing is 2d8 + MOD', async () => {
      const cure24 = await fetchSpellData('cure_wounds', '2024');
      expect(cure24).not.toBeNull();
      expect(cure24.heal_at_slot_level['1']).toBe('2d8 + MOD');
      expect(cure24.heal_at_slot_level['2']).toBe('4d8 + MOD');
    });

    it('verifies healing_word 2024 base healing is 2d4 + MOD', async () => {
      const word24 = await fetchSpellData('healing_word', '2024');
      expect(word24).not.toBeNull();
      expect(word24.heal_at_slot_level['1']).toBe('2d4 + MOD');
      expect(word24.heal_at_slot_level['2']).toBe('4d4 + MOD');
    });
  });

  describe('Runtime Consumer Integration', () => {
    it('atlasService.loadSpell delegates to fetchSpellData with explicit ruleset', async () => {
      const spell14 = await atlasService.loadSpell('cure_wounds', '2014');
      const spell24 = await atlasService.loadSpell('cure_wounds', '2024');

      expect(spell14.rulesetContext).toBe('2014');
      expect(spell14.heal_at_slot_level['1']).toBe('1d8 + MOD');

      expect(spell24.rulesetContext).toBe('2024');
      expect(spell24.heal_at_slot_level['1']).toBe('2d8 + MOD');
    });

    it('useAtlasStore consumes active game ruleset when fetching spell list and spell details', async () => {
      // 1. Set active game ruleset to 2024
      useGameStore.getState().setRuleset('2024');
      await useAtlasStore.getState().loadList('spells');
      const storeState24 = useAtlasStore.getState();
      expect(storeState24.spellsList.length).toBe(323);
      expect(storeState24.spellsList[0].rulesetContext).toBe('2024');

      await useAtlasStore.getState().selectItem('cure_wounds', 'spells');
      expect(useAtlasStore.getState().selectedItem.rulesetContext).toBe('2024');
      expect(useAtlasStore.getState().selectedItem.heal_at_slot_level['1']).toBe('2d8 + MOD');

      // 2. Switch active game ruleset to 2014
      useGameStore.getState().setRuleset('2014');
      await useAtlasStore.getState().loadList('spells');
      const storeState14 = useAtlasStore.getState();
      expect(storeState14.spellsList.length).toBe(323);
      expect(storeState14.spellsList[0].rulesetContext).toBe('2014');

      await useAtlasStore.getState().selectItem('cure_wounds', 'spells');
      expect(useAtlasStore.getState().selectedItem.rulesetContext).toBe('2014');
      expect(useAtlasStore.getState().selectedItem.heal_at_slot_level['1']).toBe('1d8 + MOD');
    });
  });
});
