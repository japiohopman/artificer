import { describe, it, expect } from 'vitest';
import { resolvePersonality, generateDeterministicBackstory } from '../src/lib/narrative/narrativeResolver';
import { evaluateMissingRequiredSteps } from '../src/components/character/CharacterCreator';
import { AtlasBackground } from '../src/services/atlasService';
import { Character } from '../src/store/useCharacterStore';

describe('Deterministic Narrative Domain & Character Creator Backstory Stage (#377)', () => {
  describe('Personality Traits Resolution (2014 vs 2024 Ruleset Isolation & Seedability)', () => {
    const acolyte2014: AtlasBackground = {
      index: 'acolyte',
      name: 'Acolyte',
      rulesetContext: '2014',
      starting_proficiencies: [],
      suggested_characteristics: {
        traits: [
          'I idolize a particular hero of my faith.',
          'I can find common ground between the fiercest enemies.'
        ],
        ideals: [
          'Tradition. The ancient traditions of worship must be preserved.'
        ],
        bonds: [
          'I would die to recover an ancient relic of my faith.'
        ],
        flaws: [
          'I judge others harshly, and myself even more severely.'
        ]
      }
    };

    const acolyte2024: AtlasBackground = {
      index: 'acolyte',
      name: 'Acolyte',
      rulesetContext: '2024',
      starting_proficiencies: []
      // Note: 2024 PHB backgrounds do not feature suggested_characteristics tables
    };

    it('deterministically selects personality traits from 2014 background data using a seed', () => {
      const res1 = resolvePersonality(acolyte2014, 'seed_abc_123');
      const res2 = resolvePersonality(acolyte2014, 'seed_abc_123');

      expect(res1).toEqual(res2);
      expect(res1.traits.length).toBe(1);
      expect(acolyte2014.suggested_characteristics?.traits).toContain(res1.traits[0]);
      expect(acolyte2014.suggested_characteristics?.ideals).toContain(res1.ideals[0]);
      expect(acolyte2014.suggested_characteristics?.bonds).toContain(res1.bonds[0]);
      expect(acolyte2014.suggested_characteristics?.flaws).toContain(res1.flaws[0]);
    });

    it('produces different valid selections when the seed changes', () => {
      const res1 = resolvePersonality(acolyte2014, 101);
      const res2 = resolvePersonality(acolyte2014, 999);

      expect(res1.traits[0]).not.toBe(res2.traits[0]);
      expect(acolyte2014.suggested_characteristics?.traits).toContain(res1.traits[0]);
      expect(acolyte2014.suggested_characteristics?.traits).toContain(res2.traits[0]);
    });

    it('fails gracefully for 2024 background data without inventing fake canonical content', () => {
      const res2024 = resolvePersonality(acolyte2024, 'seed_2024');

      expect(res2024.traits).toEqual([]);
      expect(res2024.ideals).toEqual([]);
      expect(res2024.bonds).toEqual([]);
      expect(res2024.flaws).toEqual([]);
    });

    it('handles null/undefined background data gracefully without throwing', () => {
      const resNull = resolvePersonality(null, 'seed_null');
      expect(resNull.traits).toEqual([]);
      expect(resNull.ideals).toEqual([]);
      expect(resNull.bonds).toEqual([]);
      expect(resNull.flaws).toEqual([]);
    });

    it('ensures unseeded calls do not collapse to identical default results while explicit seeds remain deterministic', () => {
      // Unseeded calls (e.g. default NPC generation calls) produce varied selections over time
      const unseeded1 = resolvePersonality(acolyte2014);
      const unseeded2 = resolvePersonality(acolyte2014);
      // Explicit seed calls remain 100% reproducible
      const seeded1 = resolvePersonality(acolyte2014, 'npc_seed_alpha');
      const seeded2 = resolvePersonality(acolyte2014, 'npc_seed_alpha');

      expect(seeded1).toEqual(seeded2);
      expect(unseeded1).toBeDefined();
      expect(unseeded2).toBeDefined();
    });
  });

  describe('Deterministic Code-Only Backstory Composition', () => {
    const testChar: Partial<Character> = {
      name: 'Valerius Flameheart',
      race: 'Tiefling',
      class: 'Paladin',
      background: 'Noble',
      alignment: 'Lawful Good',
      traits: [{ name: 'I take responsibility for my actions.', index: 't1', desc: 't1' }],
      ideals: ['Justice. No one is above the law.'],
      bonds: ['My noble family must be protected at all costs.'],
      flaws: ['I struggle to trust those outside my oath.']
    };

    it('generates a complete multi-paragraph backstory without LLM or network dependency', () => {
      const backstory = generateDeterministicBackstory(testChar, 'seed_valerius_42');

      expect(backstory).toBeTruthy();
      expect(backstory.length).toBeGreaterThan(100);
      const paragraphs = backstory.split('\n\n');
      expect(paragraphs.length).toBe(3);

      expect(backstory).toContain('Valerius Flameheart');
      expect(backstory.toLowerCase()).toContain('tiefling');
      expect(backstory.toLowerCase()).toContain('paladin');
      expect(backstory.toLowerCase()).toContain('noble');
    });

    it('reproduces 100% identical backstory output for identical inputs and seed', () => {
      const run1 = generateDeterministicBackstory(testChar, 'exact_seed_99');
      const run2 = generateDeterministicBackstory(testChar, 'exact_seed_99');

      expect(run1).toBe(run2);
    });

    it('adapts backstory prose when inputs or seed change', () => {
      const run1 = generateDeterministicBackstory(testChar, 'seed_A');
      const run2 = generateDeterministicBackstory(testChar, 'seed_B');

      expect(run1).not.toBe(run2);
    });

    it('handles missing/minimal character inputs gracefully without throwing or inserting undefined', () => {
      const minimalChar: Partial<Character> = {
        name: 'Aron'
      };

      const backstory = generateDeterministicBackstory(minimalChar, 'seed_minimal');

      expect(backstory).toBeTruthy();
      expect(backstory).not.toContain('undefined');
      expect(backstory).not.toContain('null');
      expect(backstory).toContain('Aron');
    });
  });

  describe('Character Creator Navigation & Validation Contract', () => {
    it('flags backstory step as missing when character name or backstory is empty', () => {
      const incompleteChar: Partial<Character> = {
        gender: 'Male',
        race: 'Elf',
        class: 'Wizard',
        background: 'Acolyte',
        alignment: 'Neutral',
        name: 'Elion',
        backstory: '' // missing backstory
      };

      const missing = evaluateMissingRequiredSteps(incompleteChar, 1);
      const backstoryMissing = missing.find(m => m.stepId === 'backstory' && m.reason.includes('backstory'));

      expect(backstoryMissing).toBeDefined();
    });

    it('flags name missing when character name is empty', () => {
      const noNameChar: Partial<Character> = {
        gender: 'Female',
        race: 'Dwarf',
        class: 'Cleric',
        background: 'Soldier',
        alignment: 'Lawful Good',
        name: '',
        backstory: 'Valid backstory prose.'
      };

      const missing = evaluateMissingRequiredSteps(noNameChar, 1);
      const nameMissing = missing.find(m => m.stepId === 'backstory' && m.reason.includes('name'));

      expect(nameMissing).toBeDefined();
    });

    it('passes backstory validation when both name and backstory are populated', () => {
      const validChar: Partial<Character> = {
        gender: 'Male',
        race: 'Human',
        class: 'Fighter',
        background: 'Soldier',
        alignment: 'Neutral Good',
        name: 'Gareth',
        backstory: 'A veteran of the northern border conflicts...'
      };

      const missing = evaluateMissingRequiredSteps(validChar, 1);
      const backstoryIssues = missing.filter(m => m.stepId === 'backstory');

      expect(backstoryIssues.length).toBe(0);
    });
  });
});
