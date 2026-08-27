import { describe, it, expect } from 'vitest';
import {
  generateName,
  generateCandidates,
  resolveNamingProfile,
  NamingDomainError,
  SeedableRNG,
  SOURCE_NAMING_DATA
} from '../src/lib/naming';

describe('Naming Domain Foundation v1 Remediation & Quality Test Suite', () => {
  describe('Seedable PRNG & Determinism', () => {
    it('produces identical outputs for identical context and seed', () => {
      const ctx = { species: 'Tiefling', gender: 'female', seed: 'test_seed_123' };
      const res1 = generateName(ctx);
      const res2 = generateName(ctx);

      expect(res1.displayName).toBe(res2.displayName);
      expect(res1.resolvedProfile.id).toBe(res2.resolvedProfile.id);
      expect(res1.score).toBe(res2.score);
      expect(res1.components).toEqual(res2.components);
    });

    it('produces different valid outputs when seed changes', () => {
      const ctx1 = { species: 'Dwarf', gender: 'male', seed: 100 };
      const ctx2 = { species: 'Dwarf', gender: 'male', seed: 200 };

      const res1 = generateName(ctx1);
      const res2 = generateName(ctx2);

      expect(res1.displayName).toBeDefined();
      expect(res2.displayName).toBeDefined();
      expect(res1.displayName).not.toBe(res2.displayName);
    });

    it('maintains deterministic PRNG sequence across runs', () => {
      const rng1 = new SeedableRNG('alpha_seed');
      const rng2 = new SeedableRNG('alpha_seed');

      const seq1 = Array.from({ length: 5 }, () => rng1.nextInt(1, 1000));
      const seq2 = Array.from({ length: 5 }, () => rng2.nextInt(1, 1000));

      expect(seq1).toEqual(seq2);
    });
  });

  describe('Tiefling Naming Traditions', () => {
    it('generates Tiefling Infernal male and female names', () => {
      const maleRes = generateName({ species: 'Tiefling', gender: 'male', seed: 'infernal_m' });
      const femaleRes = generateName({ species: 'Tiefling', gender: 'female', seed: 'infernal_f' });

      expect(maleRes.resolvedProfile.id).toBe('tiefling_infernal');
      expect(femaleRes.resolvedProfile.id).toBe('tiefling_infernal');
      expect(maleRes.displayName).toBeTruthy();
      expect(femaleRes.displayName).toBeTruthy();
    });

    it('generates Tiefling Virtue names when style is virtue', () => {
      const res = generateName({ species: 'Tiefling', traditionStyle: 'virtue', seed: 'virtue_1' });
      expect(res.resolvedProfile.id).toBe('tiefling_virtue');
      expect(res.components[0].type).toBe('virtue');
    });

    it('does not silently convert Infernal style requests to Virtue or vice versa', () => {
      const infernalRes = generateName({ species: 'Tiefling', traditionStyle: 'infernal', seed: 'seed_inf' });
      const virtueRes = generateName({ species: 'Tiefling', traditionStyle: 'virtue', seed: 'seed_virt' });

      expect(infernalRes.resolvedProfile.id).toBe('tiefling_infernal');
      expect(virtueRes.resolvedProfile.id).toBe('tiefling_virtue');
    });
  });

  describe('Half-Elf Delegated Naming (Dual Cultural Delegation)', () => {
    it('resolves Half-Elf to Elven tradition when traditionStyle or origin is elven', () => {
      const res = generateName({ species: 'Half-Elf', traditionStyle: 'elven', seed: 'he_elf_seed' });
      expect(res.resolvedProfile.id).toBe('half_elf_elven');
      const elfFamilies = SOURCE_NAMING_DATA.elf.familyNames;
      expect(elfFamilies).toContain(res.components.find((c) => c.type === 'family')?.value);
    });

    it('resolves Half-Elf to Human tradition when traditionStyle or origin is human', () => {
      const res = generateName({
        species: 'Half-Elf',
        traditionStyle: 'human',
        culture: 'Illuskan',
        seed: 'he_hum_seed'
      });
      expect(res.resolvedProfile.id).toBe('half_elf_human');
      const illuskanSurnames = SOURCE_NAMING_DATA.human.illuskan.surnames;
      expect(illuskanSurnames).toContain(res.components.find((c) => c.type === 'surname')?.value);
    });

    it('supports cross-cultural delegation without hardcoding solely to Elven names', () => {
      const elfRes = generateName({ species: 'Half-Elf', traditionStyle: 'elven', seed: 42 });
      const humRes = generateName({ species: 'Half-Elf', traditionStyle: 'human', seed: 42 });

      expect(elfRes.resolvedProfile.id).not.toBe(humRes.resolvedProfile.id);
    });
  });

  describe('Human Regional Cultural Naming & Explicit Fallback', () => {
    const cultures = [
      'Calishite',
      'Chondathan',
      'Damaran',
      'Illuskan',
      'Mulan',
      'Rashemi',
      'Shou',
      'Tethyrian',
      'Turami'
    ];

    cultures.forEach((culture) => {
      it(`generates valid name for human culture: ${culture}`, () => {
        const res = generateName({ species: 'Human', culture, gender: 'female', seed: `h_${culture}` });
        expect(res.resolvedProfile.cultureStatus).toBe('known');
        expect(res.displayName).toBeTruthy();
      });
    });

    it('enforces surname-first ordering for Shou cultural names ({surname} {given})', () => {
      const res = generateName({ species: 'Human', culture: 'Shou', gender: 'male', seed: 'shou_test' });
      expect(res.resolvedProfile.id).toBe('human_shou');
      const parts = res.displayName.split(' ');
      expect(parts.length).toBe(2);

      const surname = res.components.find((c) => c.type === 'surname')?.value;
      const given = res.components.find((c) => c.type === 'given')?.value;

      expect(parts[0]).toBe(surname);
      expect(parts[1]).toBe(given);
    });

    it('handles missing human culture explicitly without identity corruption', () => {
      const res = generateName({ species: 'Human', seed: 'missing_culture_seed' });
      expect(res.metadata.cultureStatus).toBe('missing');
      expect(res.metadata.fallbackApplied).toBe(true);
      expect(res.displayName).toBeTruthy();
    });

    it('handles unknown human culture explicitly without identity corruption', () => {
      const res = generateName({ species: 'Human', culture: 'Atlantian', seed: 'unknown_culture_seed' });
      expect(res.metadata.cultureStatus).toBe('unknown');
      expect(res.metadata.fallbackApplied).toBe(true);
      expect(res.displayName).toBeTruthy();
    });
  });

  describe('Multi-Component Species Rules', () => {
    it('generates Gnome 3-part multi-component names (given, nickname, clan)', () => {
      const res = generateName({ species: 'Gnome', gender: 'male', seed: 'gnome_seed' });
      expect(res.resolvedProfile.id).toBe('gnome_traditional');
      expect(res.displayName).toContain("'"); // Nickname in quotes
      const types = res.components.map((c) => c.type);
      expect(types).toContain('given');
      expect(types).toContain('clan');
    });

    it('generates Dragonborn clan-first names', () => {
      const res = generateName({ species: 'Dragonborn', gender: 'male', seed: 'db_seed' });
      expect(res.resolvedProfile.id).toBe('dragonborn_honor');
      const parts = res.displayName.split(' ');
      expect(parts.length).toBe(2);
      expect(res.components[0].type).toBe('clan');
    });

    it('generates Dragonborn childhood names for children', () => {
      const res = generateName({ species: 'Dragonborn', lifeStage: 'child', seed: 'db_child' });
      expect(res.resolvedProfile.id).toBe('dragonborn_childhood');
      expect(res.displayName).toContain("'");
    });

    it('generates Elf child vs adult names', () => {
      const childRes = generateName({ species: 'Elf', lifeStage: 'child', seed: 'elf_c' });
      const adultRes = generateName({ species: 'Elf', lifeStage: 'adult', seed: 'elf_a' });

      expect(childRes.resolvedProfile.id).toBe('elf_child');
      expect(adultRes.resolvedProfile.id).toBe('elf_adult');
    });

    it('generates Dwarf personal and clan names', () => {
      const res = generateName({ species: 'Dwarf', gender: 'female', seed: 'dwarf_f' });
      expect(res.resolvedProfile.id).toBe('dwarf_clan');
      expect(res.components.some((c) => c.type === 'clan')).toBe(true);
    });

    it('generates Halfling given + family names', () => {
      const res = generateName({ species: 'Halfling', gender: 'male', seed: 'half_1' });
      expect(res.resolvedProfile.id).toBe('halfling_family');
    });

    it('generates Half-Orc names', () => {
      const res = generateName({ species: 'Half-Orc', gender: 'male', seed: 'ho_1' });
      expect(res.resolvedProfile.id).toBe('half_orc_traditional');
    });
  });

  describe('Invalid Context & Fallback Error Handling', () => {
    it('throws typed NamingDomainError for unknown species', () => {
      expect(() => {
        resolveNamingProfile({ species: 'MartianAlien' });
      }).toThrow(NamingDomainError);
    });
  });

  describe('Candidate Set Generation & Diversity Regression', () => {
    it('generates multiple candidate names for UI/inspection via generateCandidates()', () => {
      const candidates = generateCandidates({ species: 'Dwarf', gender: 'male', seed: 'multi_seed' }, 5);
      expect(candidates.length).toBe(5);
      const names = candidates.map((c) => c.displayName);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBeGreaterThan(1);
    });

    it('produces high candidate variety without collapsing into a repeated subset', () => {
      const generatedNames = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const res = generateName({ species: 'Elf', gender: 'female', seed: `diversity_run_${i}` });
        generatedNames.add(res.displayName);
      }
      expect(generatedNames.size).toBeGreaterThanOrEqual(15);
    });
  });
});
