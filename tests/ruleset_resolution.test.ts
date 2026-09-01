import { describe, it, expect } from 'vitest';
import { fetchEquipmentData, fetchFeatData, fetchSpeciesData } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';

describe('Ruleset Resolution Audit Tests', () => {
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

    // Assertion for 2024 Orc dataset
    const orc24 = await fetchSpeciesData('orc', '2024');
    expect(orc24).not.toBeNull();
    expect(orc24?.rulesetContext).toBe('2024');
    const orcTraitIndices = orc24?.traits?.map((t: any) => t.index || t.name);
    expect(orcTraitIndices).toContain('adrenaline_rush');
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
