import { describe, it, expect } from 'vitest';
import { fetchEquipmentData, fetchFeatData, fetchSpeciesData, fetchClassData, fetchClassesList } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';

describe('Ruleset Resolution Audit Tests', () => {
  it('correctly resolves versioned class dataset (14 vs 24)', async () => {
    const fighter14 = await fetchClassData('fighter', '2014');
    const fighter24 = await fetchClassData('fighter', '2024');

    expect(fighter14).not.toBeNull();
    expect(fighter24).not.toBeNull();
    expect(fighter14?.rulesetContext).toBe('2014');
    expect(fighter24?.rulesetContext).toBe('2024');

    // Assertion for Fighter 2024 Weapon Mastery metadata
    expect(fighter14?.weapon_mastery).toBeUndefined();
    expect(fighter24?.weapon_mastery).toBeDefined();
    expect(fighter24?.weapon_mastery?.count).toBe(3);

    // Assertion for Wizard 2014 vs 2024 class dataset
    const wizard14 = await fetchClassData('wizard', '2014');
    const wizard24 = await fetchClassData('wizard', '2024');
    expect(wizard14?.rulesetContext).toBe('2014');
    expect(wizard24?.rulesetContext).toBe('2024');
    expect(wizard24?.spellcasting?.info?.some((i: any) => i.name === 'Spellbook')).toBe(true);

    // Assertion for Cleric 2014 vs 2024 class dataset
    const cleric14 = await fetchClassData('cleric', '2014');
    const cleric24 = await fetchClassData('cleric', '2024');
    expect(cleric14?.rulesetContext).toBe('2014');
    expect(cleric24?.rulesetContext).toBe('2024');

    // Assertion for Rogue 2014 vs 2024 class dataset
    const rogue14 = await fetchClassData('rogue', '2014');
    const rogue24 = await fetchClassData('rogue', '2024');
    expect(rogue14?.rulesetContext).toBe('2014');
    expect(rogue24?.rulesetContext).toBe('2024');
    expect(rogue24?.weapon_mastery?.count).toBe(2);

    // Assertion for strict resolution: missing 2024 class returns null (no cross-ruleset fallback to 2014)
    const sorcerer24 = await fetchClassData('sorcerer', '2024');
    expect(sorcerer24).toBeNull();
  });

  it('correctly filters fetchClassesList by ruleset context', async () => {
    const list14 = await fetchClassesList('2014');
    const list24 = await fetchClassesList('2024');

    const indices14 = list14.map(c => c.index);
    const indices24 = list24.map(c => c.index);

    expect(indices14).toContain('fighter');
    expect(indices14).toContain('sorcerer');
    expect(indices14.length).toBe(12);

    expect(indices24).toContain('fighter');
    expect(indices24).toContain('wizard');
    expect(indices24).toContain('cleric');
    expect(indices24).toContain('rogue');
    expect(indices24).not.toContain('sorcerer');
    expect(indices24.length).toBe(4);
  });

  it('verifies atlasService class loading with explicit ruleset and cache key separation', async () => {
    const fighter14 = await atlasService.loadClass('fighter', '2014');
    const fighter24 = await atlasService.loadClass('fighter', '2024');

    expect(fighter14).not.toBeNull();
    expect(fighter24).not.toBeNull();
    expect(fighter14?.rulesetContext).toBe('2014');
    expect(fighter24?.rulesetContext).toBe('2024');
  });
  it('correctly resolves versioned species dataset (14 vs 24)', async () => {
    const sp14 = await fetchSpeciesData('human', '2014');
    const sp24 = await fetchSpeciesData('human', '2024');

    expect(sp14).not.toBeNull();
    expect(sp24).not.toBeNull();
    expect(sp14?.rulesetContext).toBe('2014');
    expect(sp24?.rulesetContext).toBe('2024');

    // Assertion for 2014 vs 2024 Human differences
    expect(sp14?.ability_bonuses?.length).toBeGreaterThan(0);
    const traitIndices24 = sp24?.traits?.map((t: any) => t.index || t.name);
    expect(traitIndices24).toContain('resourceful');
    expect(traitIndices24).toContain('versatile');

    // Assertion for 2014 vs 2024 Dwarf differences (speed 25 vs 30)
    const dwarf14 = await fetchSpeciesData('dwarf', '2014');
    const dwarf24 = await fetchSpeciesData('dwarf', '2024');
    expect(dwarf14?.speed).toBe(25);
    expect(dwarf24?.speed).toBe(30);

    // Assertion for 2024 Elf dataset
    const elf14 = await fetchSpeciesData('elf', '2014');
    const elf24 = await fetchSpeciesData('elf', '2024');
    expect(elf14?.rulesetContext).toBe('2014');
    expect(elf24?.rulesetContext).toBe('2024');
    const elfTraits24 = elf24?.traits?.map((t: any) => t.index || t.name);
    expect(elfTraits24).toContain('elven_lineage');

    // Assertion for 2024 Halfling dataset
    const halfling14 = await fetchSpeciesData('halfling', '2014');
    const halfling24 = await fetchSpeciesData('halfling', '2024');
    expect(halfling14?.rulesetContext).toBe('2014');
    expect(halfling24?.rulesetContext).toBe('2024');
    expect(halfling14?.speed).toBe(25);
    expect(halfling24?.speed).toBe(30);

    // Assertion for 2024 Orc dataset
    const orc24 = await fetchSpeciesData('orc', '2024');
    expect(orc24).not.toBeNull();
    expect(orc24?.rulesetContext).toBe('2024');
    const orcTraitIndices = orc24?.traits?.map((t: any) => t.index || t.name);
    expect(orcTraitIndices).toContain('adrenaline_rush');

    // Assertion for strict resolution: missing 2024 species returns null (no cross-ruleset fallback to 2014)
    const gnome24 = await fetchSpeciesData('gnome', '2024');
    expect(gnome24).toBeNull();
  });

  it('verifies atlasService species loading with explicit ruleset', async () => {
    const sp14 = await atlasService.loadSpecies('human', '2014');
    const sp24 = await atlasService.loadSpecies('human', '2024');

    expect(sp14).not.toBeNull();
    expect(sp24).not.toBeNull();
    expect(sp14?.rulesetContext).toBe('2014');
    expect(sp24?.rulesetContext).toBe('2024');
  });

  it('correctly resolves versioned equipment dataset (14 vs 24)', async () => {
    const eq14 = await fetchEquipmentData('dagger', '2014');
    const eq24 = await fetchEquipmentData('dagger', '2024');

    expect(eq14).not.toBeNull();
    expect(eq24).not.toBeNull();
    expect(eq14?.rulesetContext).toBe('2014');
    expect(eq24?.rulesetContext).toBe('2024');
  });

  it('correctly resolves versioned feat dataset (14 vs 24)', async () => {
    const feat14 = await fetchFeatData('alert', '2014');
    const feat24 = await fetchFeatData('alert', '2024');

    expect(feat14).not.toBeNull();
    expect(feat24).not.toBeNull();
    expect(feat14?.rulesetContext).toBe('2014');
    expect(feat24?.rulesetContext).toBe('2024');
  });

  it('verifies atlasService equipment and feat loading with explicit ruleset', async () => {
    const eq14 = await atlasService.loadEquipment('dagger', '2014');
    const eq24 = await atlasService.loadEquipment('dagger', '2024');

    expect(eq14).not.toBeNull();
    expect(eq24).not.toBeNull();
    expect(eq14?.rulesetContext).toBe('2014');
    expect(eq24?.rulesetContext).toBe('2024');
  });
});
