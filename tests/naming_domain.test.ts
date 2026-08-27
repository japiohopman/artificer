import { describe, it, expect } from 'vitest';
import {
  generateName,
  generateCandidates,
  resolveNamingProfile,
  NamingDomainError,
  SeedableRNG
} from '../src/lib/naming';

describe('Naming Domain Foundation v1 Test Suite', () => {
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

    it('maintains deterministic PRNG sequence', () => {
      const rng1 = new SeedableRNG('alpha_seed');
      const rng2 = new SeedableRNG('alpha_seed');

      const seq1 = Array.from({ length: 5 }, () => rng1.nextInt(1, 1000));
      const seq2 = Array.from({ length: 5 }, () => rng2.nextInt(1, 1000));

      expect(seq1).toEqual(seq2);
    });
  });

  describe('Rule Correctness & Source Material Coverage', () => {
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

    it('generates Gnome 3-part multi-component names', () => {
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

    it('generates Half-Elf delegated names', () => {
      const res = generateName({ species: 'Half-Elf', gender: 'female', seed: 'he_1' });
      expect(res.resolvedProfile.id).toBe('half_elf_delegated');
    });

    it('generates Half-Orc names', () => {
      const res = generateName({ species: 'Half-Orc', gender: 'male', seed: 'ho_1' });
      expect(res.resolvedProfile.id).toBe('half_orc_traditional');
    });

    it('generates Human ethnic cultural names', () => {
      const illuskan = generateName({ species: 'Human', culture: 'Illuskan', seed: 'h_ill' });
      const turami = generateName({ species: 'Human', culture: 'Turami', seed: 'h_tur' });

      expect(illuskan.resolvedProfile.id).toBe('human_cultural');
      expect(turami.resolvedProfile.id).toBe('human_cultural');
      expect(illuskan.displayName).not.toBe(turami.displayName);
    });
  });

  describe('Invalid Context & Fallback Handling', () => {
    it('throws typed NamingDomainError for unknown species', () => {
      expect(() => {
        resolveNamingProfile({ species: 'MartianAlien' });
      }).toThrow(NamingDomainError);
    });

    it('handles missing gender or culture gracefully with safe defaults', () => {
      const res = generateName({ species: 'Human', seed: 'no_gender' });
      expect(res.displayName).toBeDefined();
      expect(res.displayName.length).toBeGreaterThan(0);
    });
  });

  describe('Candidate Set Generation & Diversity', () => {
    it('generates multiple candidate names for UI/inspection', () => {
      const candidates = generateCandidates({ species: 'Dwarf', gender: 'male', seed: 'multi_seed' }, 5);
      expect(candidates.length).toBe(5);
      const names = candidates.map((c) => c.displayName);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBeGreaterThan(1); // Diversity across candidate set
    });
  });
});
