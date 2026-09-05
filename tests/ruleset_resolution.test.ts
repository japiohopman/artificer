import { describe, it, expect } from 'vitest';
import { fetchEquipmentData, fetchFeatData, fetchSpeciesData, fetchClassData, fetchClassesList, fetchClassLevels, fetchSubclassData, fetchSubclassesList } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';

describe('Ruleset Resolution Audit Tests', () => {
  const ALL_12_CLASSES = [
    'barbarian', 'bard', 'cleric', 'druid', 'fighter',
    'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
  ];

  it('correctly resolves versioned class dataset (14 vs 24) for all 12 core classes', async () => {
    for (const className of ALL_12_CLASSES) {
      const class14 = await fetchClassData(className, '2014');
      const class24 = await fetchClassData(className, '2024');

      expect(class14).not.toBeNull();
      expect(class24).not.toBeNull();
      expect(class14?.rulesetContext).toBe('2014');
      expect(class24?.rulesetContext).toBe('2024');
      expect(class24?.url).toContain('/24/');
    }

    // Specific 2024 feature assertions for newly enabled classes
    const barbarian24 = await fetchClassData('barbarian', '2024');
    expect(barbarian24?.weapon_mastery?.count).toBe(2);

    const bard24 = await fetchClassData('bard', '2024');
    expect(bard24).not.toBeNull();

    const druid24 = await fetchClassData('druid', '2024');
    expect(druid24).not.toBeNull();

    const monk24 = await fetchClassData('monk', '2024');
    expect(monk24).not.toBeNull();

    const paladin24 = await fetchClassData('paladin', '2024');
    expect(paladin24?.weapon_mastery?.count).toBe(2);

    const ranger24 = await fetchClassData('ranger', '2024');
    expect(ranger24?.weapon_mastery?.count).toBe(2);

    const sorcerer24 = await fetchClassData('sorcerer', '2024');
    expect(sorcerer24).not.toBeNull();

    const warlock24 = await fetchClassData('warlock', '2024');
    expect(warlock24).not.toBeNull();
  });

  it('correctly filters fetchClassesList by ruleset context', async () => {
    const list14 = await fetchClassesList('2014');
    const list24 = await fetchClassesList('2024');

    const indices14 = list14.map(c => c.index);
    const indices24 = list24.map(c => c.index);

    expect(indices14.length).toBe(12);
    expect(indices24.length).toBe(12);

    ALL_12_CLASSES.forEach(c => {
      expect(indices24).toContain(c);
      expect(indices14).toContain(c);
    });
  });

  it('verifies atlasService class loading with explicit ruleset and cache key separation', async () => {
    for (const className of ALL_12_CLASSES) {
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

  it('verifies complete 2024 class progressions (levels 1-20) for all 12 core classes and ensures NO placeholder definitions exist', async () => {
    for (const className of ALL_12_CLASSES) {
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

            const desc = Array.isArray(featData.desc) ? featData.desc.join(' ') : featData.desc || '';
            expect(desc.length).toBeGreaterThanOrEqual(30);

            // STRICT PLACEHOLDER DETECTION ASSERTIONS
            expect(desc.toLowerCase()).not.toContain('feature from your');
            expect(desc.toLowerCase()).not.toContain('placeholder');
            expect(desc.toLowerCase()).not.toContain('you gain a feature');
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

  it('verifies Level 19 Ability Score Improvement counts across classes (excluding Epic Boon)', async () => {
    const fighter19 = await atlasService.loadLevelData('fighter', 19, '2024');
    const wizard19 = await atlasService.loadLevelData('wizard', 19, '2024');
    const cleric19 = await atlasService.loadLevelData('cleric', 19, '2024');
    const rogue19 = await atlasService.loadLevelData('rogue', 19, '2024');
    const barbarian19 = await atlasService.loadLevelData('barbarian', 19, '2024');
    const monk19 = await atlasService.loadLevelData('monk', 19, '2024');

    expect(fighter19?.ability_score_bonuses).toBe(6);
    expect(rogue19?.ability_score_bonuses).toBe(5);
    expect(wizard19?.ability_score_bonuses).toBe(4);
    expect(cleric19?.ability_score_bonuses).toBe(4);
    expect(barbarian19?.ability_score_bonuses).toBe(4);
    expect(monk19?.ability_score_bonuses).toBe(4);
  });

  it('verifies exact 2024 Bard level progressions, cantrips, prepared spells, and feature timing', async () => {
    const expectedBardPrepared = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
    for (let lvl = 1; lvl <= 20; lvl++) {
      const bardLvl = await atlasService.loadLevelData('bard', lvl, '2024');
      expect(bardLvl?.spellcasting?.prepared_spells).toBe(expectedBardPrepared[lvl - 1]);
    }

    const bard15 = await atlasService.loadLevelData('bard', 15, '2024');
    const bard16 = await atlasService.loadLevelData('bard', 16, '2024');
    const bard17 = await atlasService.loadLevelData('bard', 17, '2024');
    const bard18 = await atlasService.loadLevelData('bard', 18, '2024');
    const bard19 = await atlasService.loadLevelData('bard', 19, '2024');
    const bard20 = await atlasService.loadLevelData('bard', 20, '2024');

    expect(bard15?.spellcasting?.prepared_spells).toBe(18);
    expect(bard16?.spellcasting?.prepared_spells).toBe(18);
    expect(bard17?.spellcasting?.prepared_spells).toBe(19);
    expect(bard18?.spellcasting?.prepared_spells).toBe(20);
    expect(bard19?.spellcasting?.prepared_spells).toBe(21);
    expect(bard20?.spellcasting?.prepared_spells).toBe(22);

    const bard5 = await atlasService.loadLevelData('bard', 5, '2024');
    const bard6 = await atlasService.loadLevelData('bard', 6, '2024');
    const bard7 = await atlasService.loadLevelData('bard', 7, '2024');
    const bard9 = await atlasService.loadLevelData('bard', 9, '2024');
    const bard10 = await atlasService.loadLevelData('bard', 10, '2024');

    const bard5FeatIndices = bard5?.features.map((f: any) => f.index);
    const bard6FeatIndices = bard6?.features.map((f: any) => f.index);
    const bard7FeatIndices = bard7?.features.map((f: any) => f.index);
    const bard9FeatIndices = bard9?.features.map((f: any) => f.index);
    const bard10FeatIndices = bard10?.features.map((f: any) => f.index);

    expect(bard5FeatIndices).toContain('bardic_inspiration_d8_2024');
    expect(bard6FeatIndices).not.toContain('countercharm_2024');
    expect(bard7FeatIndices).toContain('countercharm_2024');
    expect(bard7FeatIndices).not.toContain('expertise_bard_2_2024');
    expect(bard9FeatIndices).toContain('expertise_bard_2_2024');
    expect(bard9FeatIndices).not.toContain('bardic_inspiration_d10_2024');
    expect(bard10FeatIndices).toContain('bardic_inspiration_d10_2024');
    expect(bard10FeatIndices).toContain('magical_secrets_2024');
  });

  it('verifies exact 2024 Druid level progressions, cantrips, prepared spells, and Wild Shape timing', async () => {
    const expectedDruidCantrips = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
    const expectedDruidPrepared = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];

    for (let lvl = 1; lvl <= 20; lvl++) {
      const druidLvl = await atlasService.loadLevelData('druid', lvl, '2024');
      expect(druidLvl?.spellcasting?.cantrips_known).toBe(expectedDruidCantrips[lvl - 1]);
      expect(druidLvl?.spellcasting?.prepared_spells).toBe(expectedDruidPrepared[lvl - 1]);
    }

    const druid1 = await atlasService.loadLevelData('druid', 1, '2024');
    const druid3 = await atlasService.loadLevelData('druid', 3, '2024');
    const druid4 = await atlasService.loadLevelData('druid', 4, '2024');
    const druid9 = await atlasService.loadLevelData('druid', 9, '2024');
    const druid10 = await atlasService.loadLevelData('druid', 10, '2024');
    const druid18 = await atlasService.loadLevelData('druid', 18, '2024');
    const druid19 = await atlasService.loadLevelData('druid', 19, '2024');
    const druid20 = await atlasService.loadLevelData('druid', 20, '2024');

    expect(druid1?.spellcasting?.cantrips_known).toBe(2);
    expect(druid3?.spellcasting?.cantrips_known).toBe(2);
    expect(druid4?.spellcasting?.cantrips_known).toBe(3);
    expect(druid9?.spellcasting?.cantrips_known).toBe(3);
    expect(druid10?.spellcasting?.cantrips_known).toBe(4);
    expect(druid20?.spellcasting?.cantrips_known).toBe(4);

    expect(druid18?.spellcasting?.prepared_spells).toBe(20);
    expect(druid19?.spellcasting?.prepared_spells).toBe(21);
    expect(druid20?.spellcasting?.prepared_spells).toBe(22);

    const druid2 = await atlasService.loadLevelData('druid', 2, '2024');
    const druid6 = await atlasService.loadLevelData('druid', 6, '2024');
    const druid17 = await atlasService.loadLevelData('druid', 17, '2024');

    expect(druid2?.class_specific?.wild_shape_uses).toBe(2);
    expect(druid6?.class_specific?.wild_shape_uses).toBe(3);
    expect(druid17?.class_specific?.wild_shape_uses).toBe(4);
  });

  it('verifies exact 2024 Sorcerer level progressions, cantrips, prepared spells, and feature timing', async () => {
    const expectedSorcererCantrips = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    const expectedSorcererPrepared = [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];

    for (let lvl = 1; lvl <= 20; lvl++) {
      const sorcLvl = await atlasService.loadLevelData('sorcerer', lvl, '2024');
      expect(sorcLvl?.spellcasting?.cantrips_known).toBe(expectedSorcererCantrips[lvl - 1]);
      expect(sorcLvl?.spellcasting?.prepared_spells).toBe(expectedSorcererPrepared[lvl - 1]);
    }

    const sorc1 = await atlasService.loadLevelData('sorcerer', 1, '2024');
    const sorc3 = await atlasService.loadLevelData('sorcerer', 3, '2024');
    const sorc4 = await atlasService.loadLevelData('sorcerer', 4, '2024');
    const sorc7 = await atlasService.loadLevelData('sorcerer', 7, '2024');
    const sorc10 = await atlasService.loadLevelData('sorcerer', 10, '2024');
    const sorc13 = await atlasService.loadLevelData('sorcerer', 13, '2024');
    const sorc17 = await atlasService.loadLevelData('sorcerer', 17, '2024');
    const sorc19 = await atlasService.loadLevelData('sorcerer', 19, '2024');
    const sorc20 = await atlasService.loadLevelData('sorcerer', 20, '2024');

    expect(sorc1?.spellcasting?.cantrips_known).toBe(4);
    expect(sorc1?.spellcasting?.prepared_spells).toBe(2);

    expect(sorc3?.spellcasting?.cantrips_known).toBe(4);
    expect(sorc3?.spellcasting?.prepared_spells).toBe(6);

    expect(sorc4?.spellcasting?.cantrips_known).toBe(5);
    expect(sorc4?.spellcasting?.prepared_spells).toBe(7);

    expect(sorc10?.spellcasting?.cantrips_known).toBe(6);
    expect(sorc10?.spellcasting?.prepared_spells).toBe(15);

    expect(sorc13?.spellcasting?.prepared_spells).toBe(17);

    expect(sorc17?.spellcasting?.prepared_spells).toBe(19);

    expect(sorc19?.spellcasting?.prepared_spells).toBe(21);

    expect(sorc20?.spellcasting?.cantrips_known).toBe(6);
    expect(sorc20?.spellcasting?.prepared_spells).toBe(22);

    // Feature timing assertions
    const sorc7FeatIndices = sorc7?.features.map((f: any) => f.index);
    const sorc10FeatIndices = sorc10?.features.map((f: any) => f.index);
    const sorc13FeatIndices = sorc13?.features.map((f: any) => f.index);
    const sorc17FeatIndices = sorc17?.features.map((f: any) => f.index);
    const sorc19FeatIndices = sorc19?.features.map((f: any) => f.index);
    const sorc20FeatIndices = sorc20?.features.map((f: any) => f.index);

    expect(sorc7FeatIndices).toContain('sorcery_incarnate_2024');
    expect(sorc7FeatIndices).not.toContain('metamagic_options_2_2024');

    expect(sorc10FeatIndices).toContain('metamagic_2024');

    expect(sorc13FeatIndices).not.toContain('metamagic_options_3_2024');

    expect(sorc17FeatIndices).toContain('metamagic_2024');

    expect(sorc19FeatIndices).toContain('epic_boon_sorcerer_2024');

    expect(sorc20FeatIndices).toContain('arcane_apotheosis_2024');

    const sorceryIncarnate = await atlasService.loadFeature('sorcery_incarnate_2024');
    expect(sorceryIncarnate).not.toBeNull();
    expect(sorceryIncarnate.class.index).toBe('sorcerer');
    expect(sorceryIncarnate.level).toBe(7);
    expect(sorceryIncarnate.desc.join(' ')).toContain('Innate Sorcery');
  });

  it('verifies exact 2024 Paladin level progressions and feature timing', async () => {
    const paladin1 = await atlasService.loadLevelData('paladin', 1, '2024');
    const paladin5 = await atlasService.loadLevelData('paladin', 5, '2024');
    const paladin10 = await atlasService.loadLevelData('paladin', 10, '2024');
    const paladin19 = await atlasService.loadLevelData('paladin', 19, '2024');
    const paladin20 = await atlasService.loadLevelData('paladin', 20, '2024');

    expect(paladin1?.spellcasting?.prepared_spells).toBe(2);
    expect(paladin5?.spellcasting?.prepared_spells).toBe(6);
    expect(paladin20?.spellcasting?.prepared_spells).toBe(15);

    const paladin10FeatIndices = paladin10?.features.map((f: any) => f.index);
    const paladin19FeatIndices = paladin19?.features.map((f: any) => f.index);
    const paladin20FeatIndices = paladin20?.features.map((f: any) => f.index);

    expect(paladin10FeatIndices).toContain('aura_of_courage_2024');
    expect(paladin19FeatIndices).toContain('epic_boon_paladin_2024');
    expect(paladin20FeatIndices).toContain('holy_nimbus_2024');

    const auraOfCourage = await atlasService.loadFeature('aura_of_courage_2024');
    expect(auraOfCourage).not.toBeNull();
    expect(auraOfCourage.class.index).toBe('paladin');
    expect(auraOfCourage.level).toBe(10);

    const holyNimbus = await atlasService.loadFeature('holy_nimbus_2024');
    expect(holyNimbus).not.toBeNull();
    expect(holyNimbus.class.index).toBe('paladin');
    expect(holyNimbus.level).toBe(20);
  });

  it('verifies exact 2024 Warlock level progressions, resources, and Invocations', async () => {
    const warlock1 = await atlasService.loadLevelData('warlock', 1, '2024');
    const warlock2 = await atlasService.loadLevelData('warlock', 2, '2024');
    const warlock9 = await atlasService.loadLevelData('warlock', 9, '2024');
    const warlock11 = await atlasService.loadLevelData('warlock', 11, '2024');
    const warlock17 = await atlasService.loadLevelData('warlock', 17, '2024');
    const warlock20 = await atlasService.loadLevelData('warlock', 20, '2024');

    expect(warlock1?.spellcasting?.cantrips_known).toBe(2);
    expect(warlock1?.spellcasting?.prepared_spells).toBe(2);
    expect(warlock1?.spellcasting?.pact_slots).toBe(1);
    expect(warlock1?.spellcasting?.pact_slot_level).toBe(1);

    expect(warlock9?.spellcasting?.pact_slots).toBe(2);
    expect(warlock9?.spellcasting?.pact_slot_level).toBe(5);
    expect(warlock9?.spellcasting?.prepared_spells).toBe(10);

    expect(warlock1?.class_specific?.pact_slots).toBe(1);
    expect(warlock2?.class_specific?.pact_slots).toBe(2);
    expect(warlock9?.class_specific?.pact_slots).toBe(2);
    expect(warlock11?.class_specific?.pact_slots).toBe(3);
    expect(warlock17?.class_specific?.pact_slots).toBe(4);
    expect(warlock20?.class_specific?.pact_slots).toBe(4);

    expect(warlock1?.class_specific?.invocations_known).toBe(1);
    expect(warlock2?.class_specific?.invocations_known).toBe(3);
    expect(warlock9?.class_specific?.invocations_known).toBe(7);
    expect(warlock17?.class_specific?.invocations_known).toBe(9);
    expect(warlock20?.class_specific?.invocations_known).toBe(10);

    const warlock9FeatIndices = warlock9?.features.map((f: any) => f.index);
    expect(warlock9FeatIndices).toContain('contact_patron_2024');

    const contactPatron = await atlasService.loadFeature('contact_patron_2024');
    expect(contactPatron).not.toBeNull();
    expect(contactPatron.class.index).toBe('warlock');
    expect(contactPatron.level).toBe(9);
  });

  it('verifies exact 2024 Monk level progressions and feature timing', async () => {
    const monk7 = await atlasService.loadLevelData('monk', 7, '2024');
    const monk10 = await atlasService.loadLevelData('monk', 10, '2024');
    const monk18 = await atlasService.loadLevelData('monk', 18, '2024');
    const monk20 = await atlasService.loadLevelData('monk', 20, '2024');

    const monk7FeatIndices = monk7?.features.map((f: any) => f.index);
    const monk10FeatIndices = monk10?.features.map((f: any) => f.index);
    const monk18FeatIndices = monk18?.features.map((f: any) => f.index);
    const monk20FeatIndices = monk20?.features.map((f: any) => f.index);

    expect(monk7FeatIndices).toContain('evasion_monk_2024');
    expect(monk7FeatIndices).not.toContain('heightened_focus_2024');
    expect(monk10FeatIndices).toContain('heightened_focus_2024');
    expect(monk10FeatIndices).toContain('self_restoration_2024');
    expect(monk18FeatIndices).toContain('superior_defense_2024');
    expect(monk18FeatIndices).not.toContain('empty_body_2024');
    expect(monk20FeatIndices).toContain('body_and_mind_2024');

    const superiorDefense = await atlasService.loadFeature('superior_defense_2024');
    expect(superiorDefense).not.toBeNull();
    expect(superiorDefense.class.index).toBe('monk');
    expect(superiorDefense.level).toBe(18);
  });

  it('verifies exact 2024 Ranger level progressions and feature timing', async () => {
    const ranger1 = await atlasService.loadLevelData('ranger', 1, '2024');
    const ranger5 = await atlasService.loadLevelData('ranger', 5, '2024');
    const ranger18 = await atlasService.loadLevelData('ranger', 18, '2024');

    expect(ranger1?.spellcasting?.prepared_spells).toBe(2);
    expect(ranger5?.spellcasting?.prepared_spells).toBe(6);

    const ranger18FeatIndices = ranger18?.features.map((f: any) => f.index);

    expect(ranger18FeatIndices).toContain('feral_senses_2024');

    const feralSenses = await atlasService.loadFeature('feral_senses_2024');
    expect(feralSenses).not.toBeNull();
    expect(feralSenses.class.index).toBe('ranger');
    expect(feralSenses.level).toBe(18);
  });

  it('validates precise 2024 mechanics for all 8 remaining classes (Barbarian, Bard, Druid, Monk, Paladin, Ranger, Sorcerer, Warlock)', async () => {
    // 1. Barbarian
    const rage24 = await atlasService.loadFeature('rage_2024');
    expect(rage24).not.toBeNull();
    expect(rage24.class.index).toBe('barbarian');

    const brutalStrike24 = await atlasService.loadFeature('brutal_strike_2024');
    expect(brutalStrike24).not.toBeNull();
    expect(brutalStrike24.desc.join(' ')).toContain('Reckless Attack');

    const relentlessRage24 = await atlasService.loadFeature('relentless_rage_2024');
    expect(relentlessRage24).not.toBeNull();

    const primalChampion24 = await atlasService.loadFeature('primal_champion_2024');
    expect(primalChampion24).not.toBeNull();
    expect(primalChampion24.desc.join(' ')).toContain('Strength and Constitution');

    // 2. Bard
    const bardicInspiration24 = await atlasService.loadFeature('bardic_inspiration_2024');
    expect(bardicInspiration24).not.toBeNull();
    expect(bardicInspiration24.class.index).toBe('bard');

    const fontOfInspiration24 = await atlasService.loadFeature('font_of_inspiration_2024');
    expect(fontOfInspiration24).not.toBeNull();

    const magicalSecrets24 = await atlasService.loadFeature('magical_secrets_2024');
    expect(magicalSecrets24).not.toBeNull();

    const wordsOfCreation24 = await atlasService.loadFeature('words_of_creation_2024');
    expect(wordsOfCreation24).not.toBeNull();

    // 3. Druid
    const primalOrder24 = await atlasService.loadFeature('primal_order_2024');
    expect(primalOrder24).not.toBeNull();
    expect(primalOrder24.desc.join(' ')).toContain('Magician');

    const wildShape24 = await atlasService.loadFeature('wild_shape_2024');
    expect(wildShape24).not.toBeNull();

    const wildResurgence24 = await atlasService.loadFeature('wild_resurgence_2024');
    expect(wildResurgence24).not.toBeNull();

    const archdruid24 = await atlasService.loadFeature('archdruid_2024');
    expect(archdruid24).not.toBeNull();

    // 4. Monk
    const martialArts24 = await atlasService.loadFeature('martial_arts_2024');
    expect(martialArts24).not.toBeNull();

    const monkFocus24 = await atlasService.loadFeature('monk_focus_2024');
    expect(monkFocus24).not.toBeNull();

    const uncannyMetabolism24 = await atlasService.loadFeature('uncanny_metabolism_2024');
    expect(uncannyMetabolism24).not.toBeNull();

    const deflectAttacks24 = await atlasService.loadFeature('deflect_attacks_2024');
    expect(deflectAttacks24).not.toBeNull();

    const bodyAndMind24 = await atlasService.loadFeature('body_and_mind_2024');
    expect(bodyAndMind24).not.toBeNull();

    // 5. Paladin
    const layOnHands24 = await atlasService.loadFeature('lay_on_hands_2024');
    expect(layOnHands24).not.toBeNull();

    const paladinSmite24 = await atlasService.loadFeature('paladin_smite_2024');
    expect(paladinSmite24).not.toBeNull();

    const auraOfProtection24 = await atlasService.loadFeature('aura_of_protection_2024');
    expect(auraOfProtection24).not.toBeNull();

    const radiantStrikes24 = await atlasService.loadFeature('radiant_strikes_2024');
    expect(radiantStrikes24).not.toBeNull();

    // 6. Ranger
    const favoredEnemy24 = await atlasService.loadFeature('favored_enemy_2024');
    expect(favoredEnemy24).not.toBeNull();
    expect(favoredEnemy24.desc.join(' ')).toContain("Hunter's Mark");

    const deftExplorer24 = await atlasService.loadFeature('deft_explorer_2024');
    expect(deftExplorer24).not.toBeNull();

    const roving24 = await atlasService.loadFeature('roving_2024');
    expect(roving24).not.toBeNull();

    const foeSlayer24 = await atlasService.loadFeature('foe_slayer_2024');
    expect(foeSlayer24).not.toBeNull();

    // 7. Sorcerer
    const innateSorcery24 = await atlasService.loadFeature('innate_sorcery_2024');
    expect(innateSorcery24).not.toBeNull();

    const fontOfMagic24 = await atlasService.loadFeature('font_of_magic_2024');
    expect(fontOfMagic24).not.toBeNull();

    const sorcerousRestoration24 = await atlasService.loadFeature('sorcerous_restoration_2024');
    expect(sorcerousRestoration24).not.toBeNull();

    const arcaneApotheosis24 = await atlasService.loadFeature('arcane_apotheosis_2024');
    expect(arcaneApotheosis24).not.toBeNull();

    // 8. Warlock
    const pactSpellsWarlock24 = await atlasService.loadFeature('pact_spells_warlock_2024');
    expect(pactSpellsWarlock24).not.toBeNull();

    const eldritchInvocations24 = await atlasService.loadFeature('eldritch_invocations_2024');
    expect(eldritchInvocations24).not.toBeNull();

    const magicalCunning24 = await atlasService.loadFeature('magical_cunning_2024');
    expect(magicalCunning24).not.toBeNull();

    const eldritchMaster24 = await atlasService.loadFeature('eldritch_master_2024');
    expect(eldritchMaster24).not.toBeNull();
  });

  it('verifies 2024 subclass data resolution, level timing, exact feature mapping, referential integrity, and placeholder protection', async () => {
    const subclasses2024 = [
      {
        index: 'champion_2024',
        expectedClass: 'fighter',
        expectedFeaturesByLevel: {
          3: ['improved_critical_champion_2024', 'remarkable_athlete_champion_2024'],
          7: ['additional_fighting_style_champion_2024'],
          10: ['heroic_warrior_champion_2024'],
          15: ['superior_critical_champion_2024'],
          18: ['survivor_champion_2024']
        }
      },
      {
        index: 'battle_master_2024',
        expectedClass: 'fighter',
        expectedFeaturesByLevel: {
          3: ['combat_superiority_battle_master_2024', 'student_of_war_battle_master_2024'],
          7: ['know_your_enemy_battle_master_2024'],
          10: ['improved_combat_superiority_battle_master_2024'],
          15: ['relentless_battle_master_2024'],
          18: ['ultimate_combat_superiority_battle_master_2024']
        }
      },
      {
        index: 'evocation_2024',
        expectedClass: 'wizard',
        expectedFeaturesByLevel: {
          3: ['evocation_savant_2024', 'potent_cantrip_2024'],
          6: ['sculpt_spells_2024'],
          10: ['empowered_evocation_2024'],
          14: ['overchannel_2024']
        }
      },
      {
        index: 'life_domain_2024',
        expectedClass: 'cleric',
        expectedFeaturesByLevel: {
          3: ['domain_spells_life_2024', 'disciple_of_life_2024', 'channel_divinity_preserve_life_2024'],
          6: ['blessed_healer_2024'],
          17: ['supreme_healing_2024']
        }
      },
      {
        index: 'thief_2024',
        expectedClass: 'rogue',
        expectedFeaturesByLevel: {
          3: ['fast_hands_thief_2024', 'second_story_work_thief_2024'],
          9: ['supreme_sneak_thief_2024'],
          13: ['use_magic_device_thief_2024'],
          17: ['thiefs_reflexes_2024']
        }
      },
      {
        index: 'assassin_2024',
        expectedClass: 'rogue',
        expectedFeaturesByLevel: {
          3: ['assassinate_2024', 'bonus_proficiencies_assassin_2024'],
          9: ['infiltrator_expertise_assassin_2024'],
          13: ['envenom_weapons_assassin_2024'],
          17: ['death_strike_assassin_2024']
        }
      }
    ];

    for (const subConfig of subclasses2024) {
      const subclassData = await fetchSubclassData(subConfig.index, '2024');
      expect(subclassData).not.toBeNull();
      expect(subclassData?.rulesetContext).toBe('2024');
      expect(subclassData?.class?.index).toBe(subConfig.expectedClass);

      const actualLevels = subclassData?.subclass_levels?.map((l: any) => l.level);
      const expectedLevels = Object.keys(subConfig.expectedFeaturesByLevel).map(Number);
      expect(actualLevels).toEqual(expectedLevels);

      for (const levelGroup of subclassData?.subclass_levels || []) {
        const lvl = levelGroup.level;
        const expectedFeatureIds = subConfig.expectedFeaturesByLevel[lvl as keyof typeof subConfig.expectedFeaturesByLevel];
        const actualFeatureIds = (levelGroup.features || []).map((f: any) => f.index);
        expect(actualFeatureIds).toEqual(expectedFeatureIds);

        for (const featRef of levelGroup.features || []) {
          const feat = await atlasService.loadFeature(featRef.index);
          expect(feat).not.toBeNull();
          expect(feat.index).toBe(featRef.index);
          expect(feat.name).toBeTruthy();

          const desc = Array.isArray(feat.desc) ? feat.desc.join(' ') : feat.desc || '';
          expect(desc.length).toBeGreaterThanOrEqual(30);

          expect(desc.toLowerCase()).not.toContain('feature from your');
          expect(desc.toLowerCase()).not.toContain('placeholder');
          expect(desc.toLowerCase()).not.toContain('you gain a feature');
        }
      }
    }

    const champion24 = await atlasService.loadSubclass('champion_2024', '2024');
    expect(champion24).not.toBeNull();
    expect(champion24?.rulesetContext).toBe('2024');

    const champion14 = await fetchSubclassData('champion', '2014');
    expect(champion14).not.toBeNull();
    expect(champion14?.rulesetContext).toBe('2014');

    const unmigrated24 = await fetchSubclassData('wild_heart_2024', '2024');
    expect(unmigrated24).toBeNull();
  });

  it('verifies ruleset-aware fetchSubclassesList and class filtering', async () => {
    const list2024 = await fetchSubclassesList('2024');
    const indices2024 = list2024.map(s => s.index);
    expect(indices2024).toContain('champion_2024');
    expect(indices2024).toContain('battle_master_2024');
    expect(indices2024).toContain('evocation_2024');
    expect(indices2024).toContain('life_domain_2024');
    expect(indices2024).toContain('thief_2024');
    expect(indices2024).toContain('assassin_2024');
    expect(indices2024).not.toContain('champion');
    expect(indices2024).not.toContain('berserker');

    const fighterSubclasses2024 = await fetchSubclassesList('2024', 'fighter');
    const fighterIndices2024 = fighterSubclasses2024.map(s => s.index);
    expect(fighterIndices2024.sort()).toEqual(['battle_master_2024', 'champion_2024']);

    const wizardSubclasses2024 = await fetchSubclassesList('2024', 'wizard');
    expect(wizardSubclasses2024.map(s => s.index)).toEqual(['evocation_2024']);

    const rogueSubclasses2024 = await fetchSubclassesList('2024', 'rogue');
    expect(rogueSubclasses2024.map(s => s.index).sort()).toEqual(['assassin_2024', 'thief_2024']);

    const barbarianSubclasses2024 = await fetchSubclassesList('2024', 'barbarian');
    expect(barbarianSubclasses2024).toEqual([]);

    const list2014 = await fetchSubclassesList('2014');
    const indices2014 = list2014.map(s => s.index);
    expect(indices2014.length).toBeGreaterThan(0);
    expect(indices2014).not.toContain('champion_2024');

    const fighterSubclasses2014 = await fetchSubclassesList('2014', 'fighter');
    const fighterIndices2014 = fighterSubclasses2014.map(s => s.index);
    expect(fighterIndices2014).toContain('champion');
    expect(fighterIndices2014).toContain('battle_master');
  });
});
