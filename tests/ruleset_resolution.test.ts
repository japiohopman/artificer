import { describe, it, expect } from 'vitest';
import { fetchEquipmentData, fetchFeatData, fetchSpeciesData, fetchClassData, fetchClassesList, fetchClassLevels } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';

describe('Ruleset Resolution Audit Tests', () => {
  it('correctly resolves versioned class dataset (14 vs 24) for all 12 core classes', async () => {
    const coreClasses = [
      'barbarian', 'bard', 'cleric', 'druid', 'fighter',
      'monk', 'paladin', 'ranger', 'rogue', 'sorcerer',
      'warlock', 'wizard'
    ];

    for (const className of coreClasses) {
      const class14 = await fetchClassData(className, '2014');
      const class24 = await fetchClassData(className, '2024');

      expect(class14).not.toBeNull();
      expect(class24).not.toBeNull();
      expect(class14?.rulesetContext).toBe('2014');
      expect(class24?.rulesetContext).toBe('2024');
      expect(class24?.url).toContain('/24/');
    }

    // Specific 2024 feature assertions
    const fighter14 = await fetchClassData('fighter', '2014');
    const fighter24 = await fetchClassData('fighter', '2024');
    expect(fighter14?.weapon_mastery).toBeUndefined();
    expect(fighter24?.weapon_mastery).toBeDefined();
    expect(fighter24?.weapon_mastery?.count).toBe(3);

    const wizard24 = await fetchClassData('wizard', '2024');
    expect(wizard24?.spellcasting?.info?.some((i: any) => i.name === 'Spellbook')).toBe(true);

    const rogue24 = await fetchClassData('rogue', '2024');
    expect(rogue24?.weapon_mastery?.count).toBe(2);

    const barbarian24 = await fetchClassData('barbarian', '2024');
    expect(barbarian24?.weapon_mastery?.count).toBe(2);

    const paladin24 = await fetchClassData('paladin', '2024');
    expect(paladin24?.weapon_mastery?.count).toBe(2);

    const ranger24 = await fetchClassData('ranger', '2024');
    expect(ranger24?.weapon_mastery?.count).toBe(2);
  });

  it('correctly lists all 12 classes for both 2014 and 2024 rulesets', async () => {
    const list14 = await fetchClassesList('2014');
    const list24 = await fetchClassesList('2024');

    const indices14 = list14.map(c => c.index);
    const indices24 = list24.map(c => c.index);

    expect(indices14.length).toBe(12);
    expect(indices24.length).toBe(12);

    const expectedClasses = [
      'barbarian', 'bard', 'cleric', 'druid', 'fighter',
      'monk', 'paladin', 'ranger', 'rogue', 'sorcerer',
      'warlock', 'wizard'
    ];

    expectedClasses.forEach(c => {
      expect(indices14).toContain(c);
      expect(indices24).toContain(c);
    });
  });

  it('verifies atlasService class loading with explicit ruleset and cache key separation', async () => {
    const coreClasses = ['fighter', 'wizard', 'cleric', 'rogue', 'barbarian', 'paladin', 'bard', 'druid', 'monk', 'ranger', 'sorcerer', 'warlock'];

    for (const className of coreClasses) {
      const cls14 = await atlasService.loadClass(className, '2014');
      const cls24 = await atlasService.loadClass(className, '2024');

      expect(cls14).not.toBeNull();
      expect(cls24).not.toBeNull();
      expect(cls14?.rulesetContext).toBe('2014');
      expect(cls24?.rulesetContext).toBe('2024');
    }
  });

  it('correctly resolves versioned species dataset (14 vs 24)', async () => {
    const sp14 = await fetchSpeciesData('human', '2014');
    const sp24 = await fetchSpeciesData('human', '2024');

    expect(sp14).not.toBeNull();
    expect(sp24).not.toBeNull();
    expect(sp14?.rulesetContext).toBe('2014');
    expect(sp24?.rulesetContext).toBe('2024');

    expect(sp14?.ability_bonuses?.length).toBeGreaterThan(0);
    const traitIndices24 = sp24?.traits?.map((t: any) => t.index || t.name);
    expect(traitIndices24).toContain('resourceful');
    expect(traitIndices24).toContain('versatile');

    const dwarf14 = await fetchSpeciesData('dwarf', '2014');
    const dwarf24 = await fetchSpeciesData('dwarf', '2024');
    expect(dwarf14?.speed).toBe(25);
    expect(dwarf24?.speed).toBe(30);

    const elf14 = await fetchSpeciesData('elf', '2014');
    const elf24 = await fetchSpeciesData('elf', '2024');
    expect(elf14?.rulesetContext).toBe('2014');
    expect(elf24?.rulesetContext).toBe('2024');
    const elfTraits24 = elf24?.traits?.map((t: any) => t.index || t.name);
    expect(elfTraits24).toContain('elven_lineage');

    const halfling14 = await fetchSpeciesData('halfling', '2014');
    const halfling24 = await fetchSpeciesData('halfling', '2024');
    expect(halfling14?.rulesetContext).toBe('2014');
    expect(halfling24?.rulesetContext).toBe('2024');
    expect(halfling14?.speed).toBe(25);
    expect(halfling24?.speed).toBe(30);

    const orc24 = await fetchSpeciesData('orc', '2024');
    expect(orc24).not.toBeNull();
    expect(orc24?.rulesetContext).toBe('2024');
    const orcTraitIndices = orc24?.traits?.map((t: any) => t.index || t.name);
    expect(orcTraitIndices).toContain('adrenaline_rush');

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

  it('verifies complete 2024 class progressions (levels 1-20) for ALL 12 core classes and resolves ALL referenced feature definitions', async () => {
    const all12Classes = [
      'barbarian', 'bard', 'cleric', 'druid', 'fighter',
      'monk', 'paladin', 'ranger', 'rogue', 'sorcerer',
      'warlock', 'wizard'
    ];

    for (const className of all12Classes) {
      const levels = await fetchClassLevels(className, '2024');
      expect(levels).toHaveLength(20);

      for (let lvl = 1; lvl <= 20; lvl++) {
        const lvlData = await atlasService.loadLevelData(className, lvl, '2024');
        expect(lvlData).not.toBeNull();
        expect(lvlData?.level).toBe(lvl);
        expect(lvlData?.rulesetContext).toBe('2024');

        // Verify every feature reference resolves to an existing canonical feature definition
        if (Array.isArray(lvlData?.features)) {
          for (const featRef of lvlData.features) {
            const featData = await atlasService.loadFeature(featRef.index);
            expect(featData).not.toBeNull();
            expect(featData.index).toBe(featRef.index);
            expect(featData.class.index).toBe(className);
            expect(featData.name).toBeTruthy();
            expect(featData.desc.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('verifies official 2024 Wizard prepared spells progression table', async () => {
    const wiz14 = await atlasService.loadLevelData('wizard', 14, '2024');
    const wiz16 = await atlasService.loadLevelData('wizard', 16, '2024');
    const wiz18 = await atlasService.loadLevelData('wizard', 18, '2024');
    const wiz20 = await atlasService.loadLevelData('wizard', 20, '2024');

    expect(wiz14?.class_specific?.prepared_spells_count).toBe(18);
    expect(wiz16?.class_specific?.prepared_spells_count).toBe(21);
    expect(wiz18?.class_specific?.prepared_spells_count).toBe(23);
    expect(wiz20?.class_specific?.prepared_spells_count).toBe(25);
  });

  it('verifies Level 19 Ability Score Improvement counts (excluding Epic Boon)', async () => {
    const fighter19 = await atlasService.loadLevelData('fighter', 19, '2024');
    const wizard19 = await atlasService.loadLevelData('wizard', 19, '2024');
    const cleric19 = await atlasService.loadLevelData('cleric', 19, '2024');
    const rogue19 = await atlasService.loadLevelData('rogue', 19, '2024');
    const barbarian19 = await atlasService.loadLevelData('barbarian', 19, '2024');
    const paladin19 = await atlasService.loadLevelData('paladin', 19, '2024');

    expect(fighter19?.ability_score_bonuses).toBe(6);
    expect(wizard19?.ability_score_bonuses).toBe(4);
    expect(cleric19?.ability_score_bonuses).toBe(4);
    expect(rogue19?.ability_score_bonuses).toBe(5);
    expect(barbarian19?.ability_score_bonuses).toBe(4);
    expect(paladin19?.ability_score_bonuses).toBe(4);
  });

  it('validates precise 2024 mechanics for all 12 core classes', async () => {
    // Barbarian 2024
    const rage24 = await atlasService.loadFeature('rage_2024');
    expect(rage24).not.toBeNull();
    expect(rage24.desc.join(' ')).toContain('Bonus Action');

    const brutalStrike24 = await atlasService.loadFeature('brutal_strike_2024');
    expect(brutalStrike24).not.toBeNull();
    expect(brutalStrike24.feature_specific?.dice).toBe('1d10');

    // Bard 2024
    const bardicInspiration24 = await atlasService.loadFeature('bardic_inspiration_2024');
    expect(bardicInspiration24).not.toBeNull();

    const magicalSecrets24 = await atlasService.loadFeature('magical_secrets_2024');
    expect(magicalSecrets24).not.toBeNull();

    // Druid 2024
    const wildShape24 = await atlasService.loadFeature('wild_shape_2024');
    expect(wildShape24).not.toBeNull();
    expect(wildShape24.desc.join(' ')).toContain('Temp HP');

    const archdruid24 = await atlasService.loadFeature('archdruid_2024');
    expect(archdruid24).not.toBeNull();

    // Monk 2024
    const martialArts24 = await atlasService.loadFeature('martial_arts_2024');
    expect(martialArts24).not.toBeNull();

    const deflectAttacks24 = await atlasService.loadFeature('deflect_attacks_2024');
    expect(deflectAttacks24).not.toBeNull();

    // Paladin 2024
    const layOnHands24 = await atlasService.loadFeature('lay_on_hands_2024');
    expect(layOnHands24).not.toBeNull();

    const paladinSmite24 = await atlasService.loadFeature('paladin_smite_2024');
    expect(paladinSmite24).not.toBeNull();

    // Ranger 2024
    const favoredEnemy24 = await atlasService.loadFeature('favored_enemy_2024');
    expect(favoredEnemy24).not.toBeNull();

    const foeSlayer24 = await atlasService.loadFeature('foe_slayer_2024');
    expect(foeSlayer24).not.toBeNull();

    // Sorcerer 2024
    const innateSorcery24 = await atlasService.loadFeature('innate_sorcery_2024');
    expect(innateSorcery24).not.toBeNull();

    const fontOfMagic24 = await atlasService.loadFeature('font_of_magic_2024');
    expect(fontOfMagic24).not.toBeNull();

    // Warlock 2024
    const pactSpells24 = await atlasService.loadFeature('pact_spells_warlock_2024');
    expect(pactSpells24).not.toBeNull();

    const eldritchInvocations24 = await atlasService.loadFeature('eldritch_invocations_2024');
    expect(eldritchInvocations24).not.toBeNull();
  });
});
