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
    const coreClasses = ['fighter', 'wizard', 'cleric', 'rogue', 'barbarian', 'paladin'];

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

  it('correctly resolves versioned class levels dataset (14 vs 24) for representative classes', async () => {
    // 1. Fighter Level 1
    const fighterLvl14 = await atlasService.loadLevelData('fighter', 1, '2014');
    const fighterLvl24 = await atlasService.loadLevelData('fighter', 1, '2024');

    expect(fighterLvl14).not.toBeNull();
    expect(fighterLvl24).not.toBeNull();
    expect(fighterLvl14?.rulesetContext).toBe('2014');
    expect(fighterLvl24?.rulesetContext).toBe('2024');
    expect(fighterLvl24?.weapon_mastery?.count).toBe(3);
    expect(fighterLvl24?.class_specific?.second_wind_uses).toBe(2);

    // 2. Wizard Level 1
    const wizardLvl14 = await atlasService.loadLevelData('wizard', 1, '2014');
    const wizardLvl24 = await atlasService.loadLevelData('wizard', 1, '2024');

    expect(wizardLvl14).not.toBeNull();
    expect(wizardLvl24).not.toBeNull();
    expect(wizardLvl14?.rulesetContext).toBe('2014');
    expect(wizardLvl24?.rulesetContext).toBe('2024');
    const wizard24Features = wizardLvl24?.features?.map((f: any) => f.index);
    expect(wizard24Features).toContain('ritual_adept_wizard');
    expect(wizard24Features).not.toContain('ritual_study_wizard');
    expect(wizardLvl24?.prof_bonus).toBe(2);
    expect(wizardLvl24?.spellcasting?.cantrips_known).toBe(3);
    expect(wizardLvl24?.spellcasting?.prepared_spells).toBe(4);
    expect(wizardLvl24?.spellcasting?.spell_slots_level_1).toBe(2);

    // Verify Ritual Adept feature description requirement to read from book
    const ritualAdeptFeature = await atlasService.loadFeature('ritual_adept_wizard');
    expect(ritualAdeptFeature).not.toBeNull();
    const descText = Array.isArray(ritualAdeptFeature?.desc) ? ritualAdeptFeature.desc.join(' ') : ritualAdeptFeature?.desc || '';
    expect(descText.toLowerCase()).toContain('read from the book');

    // 3. Cleric Level 1
    const clericLvl14 = await atlasService.loadLevelData('cleric', 1, '2014');
    const clericLvl24 = await atlasService.loadLevelData('cleric', 1, '2024');

    expect(clericLvl14).not.toBeNull();
    expect(clericLvl24).not.toBeNull();
    expect(clericLvl14?.rulesetContext).toBe('2014');
    expect(clericLvl24?.rulesetContext).toBe('2024');
    const cleric24Features = clericLvl24?.features?.map((f: any) => f.index);
    expect(cleric24Features).toContain('divine_order_cleric');

    // 4. Rogue Level 1
    const rogueLvl14 = await atlasService.loadLevelData('rogue', 1, '2014');
    const rogueLvl24 = await atlasService.loadLevelData('rogue', 1, '2024');

    expect(rogueLvl14).not.toBeNull();
    expect(rogueLvl24).not.toBeNull();
    expect(rogueLvl14?.rulesetContext).toBe('2014');
    expect(rogueLvl24?.rulesetContext).toBe('2024');
    expect(rogueLvl24?.weapon_mastery?.count).toBe(2);
  });

  it('verifies complete 2024 class progressions (levels 1-20) and resolves ALL referenced feature definitions', async () => {
    const classes = ['fighter', 'wizard', 'cleric', 'rogue'];

    for (const className of classes) {
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

    expect(fighter19?.ability_score_bonuses).toBe(6);
    expect(wizard19?.ability_score_bonuses).toBe(4);
    expect(cleric19?.ability_score_bonuses).toBe(4);
    expect(rogue19?.ability_score_bonuses).toBe(5);
  });

  it('validates precise 2024 mechanics for Fighter, Wizard, Cleric, and Rogue features', async () => {
    // 1. Fighter 2024 features
    const actionSurge24 = await atlasService.loadFeature('action_surge_2024');
    expect(actionSurge24).not.toBeNull();
    expect(actionSurge24.desc.join(' ')).toContain('except the Magic action');

    const tacticalMind24 = await atlasService.loadFeature('tactical_mind_2024');
    expect(tacticalMind24).not.toBeNull();

    const tacticalShift24 = await atlasService.loadFeature('tactical_shift_2024');
    expect(tacticalShift24).not.toBeNull();

    const indomitable24 = await atlasService.loadFeature('indomitable_2024');
    expect(indomitable24).not.toBeNull();
    expect(indomitable24.feature_specific?.bonus).toBe('fighter_level');

    const tacticalMaster24 = await atlasService.loadFeature('tactical_master_2024');
    expect(tacticalMaster24).not.toBeNull();
    expect(tacticalMaster24.desc.join(' ')).toContain('weapon whose mastery property you can use');

    const studiedAttacks24 = await atlasService.loadFeature('studied_attacks_2024');
    expect(studiedAttacks24).not.toBeNull();

    // 2. Wizard 2024 features
    const scholar24 = await atlasService.loadFeature('scholar_wizard_2024');
    expect(scholar24).not.toBeNull();

    const memorizeSpell24 = await atlasService.loadFeature('memorize_spell_wizard_2024');
    expect(memorizeSpell24).not.toBeNull();

    const spellMastery24 = await atlasService.loadFeature('spell_mastery_wizard_2024');
    expect(spellMastery24).not.toBeNull();
    expect(spellMastery24.feature_specific?.at_will_casting).toBe(true);
    expect(spellMastery24.feature_specific?.slot_expenditure).toBe(false);
    expect(spellMastery24.desc.join(' ')).toContain('cast them at will');
    expect(spellMastery24.desc.join(' ')).not.toContain('once per rest');

    const signatureSpells24 = await atlasService.loadFeature('signature_spells_wizard_2024');
    expect(signatureSpells24).not.toBeNull();

    // 3. Cleric 2024 features
    const divineOrder24 = await atlasService.loadFeature('divine_order_cleric');
    expect(divineOrder24).not.toBeNull();
    expect(divineOrder24.desc.join(' ')).toContain('Protector');
    expect(divineOrder24.desc.join(' ')).toContain('Thaumaturge');

    const channelDivinityCleric24 = await atlasService.loadFeature('channel_divinity_cleric_2024');
    expect(channelDivinityCleric24).not.toBeNull();
    expect(channelDivinityCleric24.feature_specific?.recharge).toBe('short_rest_1_all_long_rest');
    expect(channelDivinityCleric24.feature_specific?.divine_spark?.save).toBe('CON');

    const searUndead24 = await atlasService.loadFeature('sear_undead_cleric_2024');
    expect(searUndead24).not.toBeNull();

    const divineIntervention24 = await atlasService.loadFeature('divine_intervention_cleric_2024');
    expect(divineIntervention24).not.toBeNull();
    expect(divineIntervention24.desc.join(' ')).toContain('level 5 or lower');

    const blessedStrikesImp24 = await atlasService.loadFeature('blessed_strikes_improvement_cleric_2024');
    expect(blessedStrikesImp24).not.toBeNull();
    expect(blessedStrikesImp24.desc.join(' ')).toContain('twice your Wisdom modifier');
    expect(blessedStrikesImp24.feature_specific?.potent_spellcasting_temp_hp).toBe('2_x_wis_modifier');

    const greaterDivineIntervention24 = await atlasService.loadFeature('greater_divine_intervention_cleric_2024');
    expect(greaterDivineIntervention24).not.toBeNull();
    expect(greaterDivineIntervention24.desc.join(' ')).toContain('Wish');
    expect(greaterDivineIntervention24.feature_specific?.recharge).toBe('2d4_long_rests');

    // 4. Rogue 2024 features
    const rogueExpertise24 = await atlasService.loadFeature('rogue_expertise_2024');
    expect(rogueExpertise24).not.toBeNull();
    expect(rogueExpertise24.desc.join(' ')).toContain('two of your skill proficiencies');

    const cunningAction24 = await atlasService.loadFeature('cunning_action_2024');
    expect(cunningAction24).not.toBeNull();

    const steadyAim24 = await atlasService.loadFeature('steady_aim_rogue_2024');
    expect(steadyAim24).not.toBeNull();

    const cunningStrike24 = await atlasService.loadFeature('cunning_strike_2024');
    expect(cunningStrike24).not.toBeNull();
    expect(cunningStrike24.feature_specific?.save_dc).toBe('8 + PB + DEX');
    expect(cunningStrike24.feature_specific?.options?.poison?.requires).toBe("Poisoner's Kit");

    const reliableTalent24 = await atlasService.loadFeature('reliable_talent_2024');
    expect(reliableTalent24).not.toBeNull();
    expect(reliableTalent24.level).toBe(7);

    const deviousStrikes24 = await atlasService.loadFeature('devious_strikes_2024');
    expect(deviousStrikes24).not.toBeNull();
    expect(deviousStrikes24.feature_specific?.options?.daze?.cost).toBe('2d6');
    expect(deviousStrikes24.feature_specific?.options?.knock_out?.cost).toBe('6d6');
    expect(deviousStrikes24.feature_specific?.options?.obscure?.cost).toBe('3d6');

    const slipperyMind24 = await atlasService.loadFeature('slippery_mind_2024');
    expect(slipperyMind24).not.toBeNull();

    const strokeOfLuck24 = await atlasService.loadFeature('stroke_of_luck_2024');
    expect(strokeOfLuck24).not.toBeNull();
    expect(strokeOfLuck24.desc.join(' ')).toContain('fail a D20 Test');
    expect(strokeOfLuck24.feature_specific?.effect).toBe('turn_failed_d20_test_into_20');
  });
});
