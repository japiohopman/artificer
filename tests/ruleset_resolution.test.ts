import { describe, it, expect } from 'vitest';
import { fetchEquipmentData, fetchFeatData, fetchSpeciesData, fetchClassData, fetchClassesList, fetchClassLevels, fetchSubclassData } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';

describe('Ruleset Resolution Audit Tests', () => {
  const SUPPORTED_2024_CLASSES = ['fighter', 'wizard', 'cleric', 'rogue'];
  const PENDING_2024_CLASSES = ['barbarian', 'bard', 'druid', 'monk', 'paladin', 'ranger', 'sorcerer', 'warlock'];
  const ALL_12_CLASSES = [...SUPPORTED_2024_CLASSES, ...PENDING_2024_CLASSES];

  it('correctly resolves versioned class dataset (14 vs 24) for supported 2024 classes', async () => {
    for (const className of SUPPORTED_2024_CLASSES) {
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

    const spellcastingWizard24 = await atlasService.loadFeature('spellcasting_wizard_2024');
    expect(spellcastingWizard24).not.toBeNull();
    expect(spellcastingWizard24?.desc.join(' ').toLowerCase()).toContain('spellbook');

    const rogue24 = await fetchClassData('rogue', '2024');
    expect(rogue24?.weapon_mastery?.count).toBe(2);

    // Assertion for strict availability truth: unsupported 2024 classes return null
    for (const className of PENDING_2024_CLASSES) {
      const class24 = await fetchClassData(className, '2024');
      expect(class24).toBeNull();
    }
  });

  it('correctly filters fetchClassesList by ruleset context', async () => {
    const list14 = await fetchClassesList('2014');
    const list24 = await fetchClassesList('2024');

    const indices14 = list14.map(c => c.index);
    const indices24 = list24.map(c => c.index);

    expect(indices14.length).toBe(12);
    expect(indices24.length).toBe(4);

    SUPPORTED_2024_CLASSES.forEach(c => {
      expect(indices24).toContain(c);
      expect(indices14).toContain(c);
    });

    PENDING_2024_CLASSES.forEach(c => {
      expect(indices24).not.toContain(c);
      expect(indices14).toContain(c);
    });
  });

  it('verifies atlasService class loading with explicit ruleset and cache key separation', async () => {
    for (const className of SUPPORTED_2024_CLASSES) {
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

  it('verifies complete 2024 class progressions (levels 1-20) for supported 2024 classes and ensures NO placeholder definitions exist', async () => {
    for (const className of SUPPORTED_2024_CLASSES) {
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

  it('verifies unsupported 2024 classes return empty class levels and null level data', async () => {
    for (const className of PENDING_2024_CLASSES) {
      const levels = await fetchClassLevels(className, '2024');
      expect(levels).toEqual([]);

      const lvl1Data = await atlasService.loadLevelData(className, 1, '2024');
      expect(lvl1Data).toBeNull();
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

  it('verifies 2024 subclass data resolution, level timing, referential integrity, and placeholder protection', async () => {
    const subclasses2024 = [
      { index: 'champion_2024', expectedClass: 'fighter', expectedLevels: [3, 7, 10, 15] },
      { index: 'battle_master_2024', expectedClass: 'fighter', expectedLevels: [3, 7, 10, 15] },
      { index: 'evocation_2024', expectedClass: 'wizard', expectedLevels: [3, 6, 10, 14] },
      { index: 'life_domain_2024', expectedClass: 'cleric', expectedLevels: [3, 6, 17] },
      { index: 'thief_2024', expectedClass: 'rogue', expectedLevels: [3, 9, 13, 17] },
      { index: 'assassin_2024', expectedClass: 'rogue', expectedLevels: [3, 9, 13, 17] }
    ];

    for (const subConfig of subclasses2024) {
      const subclassData = await fetchSubclassData(subConfig.index, '2024');
      expect(subclassData).not.toBeNull();
      expect(subclassData?.rulesetContext).toBe('2024');
      expect(subclassData?.class?.index).toBe(subConfig.expectedClass);

      const actualLevels = subclassData?.subclass_levels?.map((l: any) => l.level);
      expect(actualLevels).toEqual(subConfig.expectedLevels);

      for (const levelGroup of subclassData?.subclass_levels || []) {
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
});
