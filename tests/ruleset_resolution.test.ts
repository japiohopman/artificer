import { describe, it, expect } from 'vitest';
import { fetchEquipmentData, fetchFeatData, fetchSpeciesData, fetchClassData, fetchClassesList, fetchClassLevels, fetchSubclassData, fetchSubclassesList } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';
import fs from 'fs';
import path from 'path';

describe('Ruleset Resolution Audit Tests', () => {
  const ALL_12_CLASSES = [
    'barbarian', 'bard', 'cleric', 'druid', 'fighter',
    'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
  ];

  // Canonical mapping of all 48 2024 subclasses with expected feature IDs per level
  const EXPECTED_2024_SUBCLASSES = [
    // BARBARIAN
    { index: 'berserker_2024', name: 'Path of the Berserker', classKey: 'barbarian', features: ['frenzy_berserker_2024', 'mindless_rage_berserker_2024', 'retaliation_berserker_2024', 'intimidating_presence_berserker_2024'] },
    { index: 'wild_heart_2024', name: 'Path of the Wild Heart', classKey: 'barbarian', features: ['animal_speaker_wild_heart_2024', 'rage_of_the_wild_wild_heart_2024', 'aspect_of_the_wild_wild_heart_2024', 'nature_speaker_wild_heart_2024', 'power_of_the_wild_wild_heart_2024'] },
    { index: 'world_tree_2024', name: 'Path of the World Tree', classKey: 'barbarian', features: ['vitality_of_the_tree_world_tree_2024', 'branches_of_the_tree_world_tree_2024', 'battering_roots_world_tree_2024', 'travel_along_the_tree_world_tree_2024'] },
    { index: 'zealot_2024', name: 'Path of the Zealot', classKey: 'barbarian', features: ['divine_fury_zealot_2024', 'warrior_of_the_gods_zealot_2024', 'fanatical_focus_zealot_2024', 'zealous_presence_zealot_2024', 'rage_beyond_death_zealot_2024'] },

    // BARD
    { index: 'dance_2024', name: 'College of Dance', classKey: 'bard', features: ['dazzling_footwork_dance_2024', 'inspiring_movement_dance_2024', 'tandem_footwork_dance_2024', 'leading_evasion_dance_2024'] },
    { index: 'glamour_2024', name: 'College of Glamour', classKey: 'bard', features: ['beguiling_magic_glamour_2024', 'mantle_of_inspiration_glamour_2024', 'mantle_of_majesty_glamour_2024', 'unbreakable_majesty_glamour_2024'] },
    { index: 'lore_2024', name: 'College of Lore', classKey: 'bard', features: ['bonus_proficiencies_lore_2024', 'cutting_words_lore_2024', 'magical_discoveries_lore_2024', 'peerless_skill_lore_2024'] },
    { index: 'valor_2024', name: 'College of Valor', classKey: 'bard', features: ['combat_inspiration_valor_2024', 'martial_training_valor_2024', 'extra_attack_valor_2024', 'battle_magic_valor_2024'] },

    // CLERIC
    { index: 'life_domain_2024', name: 'Life Domain', classKey: 'cleric', features: ['life_domain_spells_2024', 'disciple_of_life_life_2024', 'preserve_life_life_2024', 'blessed_healer_life_2024', 'supreme_healing_life_2024'] },
    { index: 'light_domain_2024', name: 'Light Domain', classKey: 'cleric', features: ['light_domain_spells_2024', 'warding_flare_light_2024', 'radiance_of_the_dawn_light_2024', 'improved_flare_light_2024', 'corona_of_light_light_2024'] },
    { index: 'trickery_domain_2024', name: 'Trickery Domain', classKey: 'cleric', features: ['trickery_domain_spells_2024', 'blessing_of_the_trickster_trickery_2024', 'invoke_duplicity_trickery_2024', 'tricksters_transposition_trickery_2024', 'improved_duplicity_trickery_2024'] },
    { index: 'war_domain_2024', name: 'War Domain', classKey: 'cleric', features: ['war_domain_spells_2024', 'war_priest_war_2024', 'guided_strike_war_2024', 'war_gods_blessing_war_2024', 'avatar_of_battle_war_2024'] },

    // DRUID
    { index: 'land_2024', name: 'Circle of the Land', classKey: 'druid', features: ['circle_spells_land_2024', 'lands_aid_land_2024', 'natural_recovery_land_2024', 'natures_ward_land_2024', 'natures_sanctuary_land_2024'] },
    { index: 'moon_2024', name: 'Circle of the Moon', classKey: 'druid', features: ['circle_forms_moon_2024', 'combat_wild_shape_moon_2024', 'improved_circle_forms_moon_2024', 'moonlight_step_moon_2024', 'lunar_form_moon_2024'] },
    { index: 'sea_2024', name: 'Circle of the Sea', classKey: 'druid', features: ['circle_spells_sea_2024', 'wrath_of_the_sea_sea_2024', 'aquatic_affinity_sea_2024', 'stormborn_sea_2024', 'oceanic_gift_sea_2024'] },
    { index: 'stars_2024', name: 'Circle of the Stars', classKey: 'druid', features: ['star_map_stars_2024', 'starry_form_stars_2024', 'cosmic_omen_stars_2024', 'twinkling_constellations_stars_2024', 'full_of_stars_stars_2024'] },

    // FIGHTER
    { index: 'battle_master_2024', name: 'Battle Master', classKey: 'fighter', features: ['combat_superiority_battle_master_2024', 'student_of_war_battle_master_2024', 'know_your_enemy_battle_master_2024', 'improved_combat_superiority_battle_master_2024', 'relentless_battle_master_2024', 'ultimate_combat_superiority_battle_master_2024'] },
    { index: 'champion_2024', name: 'Champion', classKey: 'fighter', features: ['improved_critical_champion_2024', 'remarkable_athlete_champion_2024', 'additional_fighting_style_champion_2024', 'heroic_warrior_champion_2024', 'superior_critical_champion_2024', 'survivor_champion_2024'] },
    { index: 'eldritch_knight_2024', name: 'Eldritch Knight', classKey: 'fighter', features: ['spellcasting_eldritch_knight_2024', 'weapon_bond_eldritch_knight_2024', 'war_magic_eldritch_knight_2024', 'eldritch_strike_eldritch_knight_2024', 'arcane_charge_eldritch_knight_2024', 'improved_war_magic_eldritch_knight_2024'] },
    { index: 'psi_warrior_2024', name: 'Psi Warrior', classKey: 'fighter', features: ['psionic_power_psi_warrior_2024', 'telekinetic_movement_psi_warrior_2024', 'psi_powered_leap_psi_warrior_2024', 'guarded_mind_psi_warrior_2024', 'bulwark_of_force_psi_warrior_2024', 'telekinetic_master_psi_warrior_2024'] },

    // MONK
    { index: 'mercy_2024', name: 'Warrior of Mercy', classKey: 'monk', features: ['implements_of_mercy_mercy_2024', 'hand_of_harm_mercy_2024', 'hand_of_healing_mercy_2024', 'physicians_touch_mercy_2024', 'flurry_of_healing_and_harm_mercy_2024', 'hand_of_ultimate_mercy_mercy_2024'] },
    { index: 'elements_2024', name: 'Warrior of the Elements', classKey: 'monk', features: ['elemental_attunement_elements_2024', 'manipulate_elements_elements_2024', 'elemental_burst_elements_2024', 'stride_of_the_elements_elements_2024', 'elemental_epitome_elements_2024'] },
    { index: 'open_hand_2024', name: 'Warrior of the Open Hand', classKey: 'monk', features: ['open_hand_technique_open_hand_2024', 'wholeness_of_body_open_hand_2024', 'fleet_step_open_hand_2024', 'quivering_palm_open_hand_2024'] },
    { index: 'shadow_2024', name: 'Warrior of the Shadow', classKey: 'monk', features: ['shadow_arts_shadow_2024', 'shadow_step_shadow_2024', 'improved_shadow_step_shadow_2024', 'cloak_of_shadows_shadow_2024'] },

    // PALADIN
    { index: 'ancients_2024', name: 'Oath of the Ancients', classKey: 'paladin', features: ['oath_spells_ancients_2024', 'natures_wrath_ancients_2024', 'aura_of_warding_ancients_2024', 'undying_sentinel_ancients_2024', 'elder_champion_ancients_2024'] },
    { index: 'devotion_2024', name: 'Oath of Devotion', classKey: 'paladin', features: ['oath_spells_devotion_2024', 'sacred_weapon_devotion_2024', 'aura_of_devotion_devotion_2024', 'smite_of_protection_devotion_2024', 'holy_nimbus_devotion_2024'] },
    { index: 'glory_2024', name: 'Oath of Glory', classKey: 'paladin', features: ['oath_spells_glory_2024', 'peerless_athlete_glory_2024', 'inspiring_smite_glory_2024', 'aura_of_alacrity_glory_2024', 'glorious_defense_glory_2024', 'living_legend_glory_2024'] },
    { index: 'vengeance_2024', name: 'Oath of Vengeance', classKey: 'paladin', features: ['oath_spells_vengeance_2024', 'vow_of_enmity_vengeance_2024', 'relentless_avenger_vengeance_2024', 'soul_of_vengeance_vengeance_2024', 'avenging_angel_vengeance_2024'] },

    // RANGER
    { index: 'beast_master_2024', name: 'Beast Master', classKey: 'ranger', features: ['primal_companion_beast_master_2024', 'exceptional_training_beast_master_2024', 'bestial_fury_beast_master_2024', 'share_spells_beast_master_2024'] },
    { index: 'fey_wanderer_2024', name: 'Fey Wanderer', classKey: 'ranger', features: ['dreadful_strikes_fey_wanderer_2024', 'fey_wanderer_spells_2024', 'otherworldly_glamour_fey_wanderer_2024', 'beguiling_twist_fey_wanderer_2024', 'fey_reinforcements_fey_wanderer_2024', 'misty_wanderer_fey_wanderer_2024'] },
    { index: 'gloom_stalker_2024', name: 'Gloom Stalker', classKey: 'ranger', features: ['dread_ambusher_gloom_stalker_2024', 'gloom_stalker_spells_2024', 'umbral_sight_gloom_stalker_2024', 'iron_mind_gloom_stalker_2024', 'stalkers_flurry_gloom_stalker_2024', 'shadowy_dodge_gloom_stalker_2024'] },
    { index: 'hunter_2024', name: 'Hunter', classKey: 'ranger', features: ['hunters_prey_hunter_2024', 'hunters_lore_hunter_2024', 'defensive_tactics_hunter_2024', 'superior_hunters_prey_hunter_2024', 'superior_hunters_defense_hunter_2024'] },

    // ROGUE
    { index: 'arcane_trickster_2024', name: 'Arcane Trickster', classKey: 'rogue', features: ['spellcasting_arcane_trickster_2024', 'mage_hand_legerdemain_arcane_trickster_2024', 'magical_ambush_arcane_trickster_2024', 'versatile_trickster_arcane_trickster_2024', 'spell_thief_arcane_trickster_2024'] },
    { index: 'assassin_2024', name: 'Assassin', classKey: 'rogue', features: ['assassinate_assassin_2024', 'assassins_tools_assassin_2024', 'infiltration_expertise_assassin_2024', 'envenomed_weapons_assassin_2024', 'death_strike_assassin_2024'] },
    { index: 'soulknife_2024', name: 'Soulknife', classKey: 'rogue', features: ['psychic_blades_soulknife_2024', 'psionic_power_soulknife_2024', 'soul_blades_soulknife_2024', 'psychic_veil_soulknife_2024', 'rend_mind_soulknife_2024'] },
    { index: 'thief_2024', name: 'Thief', classKey: 'rogue', features: ['fast_hands_thief_2024', 'second_story_work_thief_2024', 'supreme_sneak_thief_2024', 'use_magic_device_thief_2024', 'thiefs_reflexes_thief_2024'] },

    // SORCERER
    { index: 'aberrant_sorcery_2024', name: 'Aberrant Sorcery', classKey: 'sorcerer', features: ['psionic_spells_aberrant_2024', 'telepathic_speech_aberrant_2024', 'psionic_sorcery_aberrant_2024', 'psychic_defenses_aberrant_2024', 'revelation_in_flesh_aberrant_2024', 'warping_implosion_aberrant_2024'] },
    { index: 'clockwork_sorcery_2024', name: 'Clockwork Sorcery', classKey: 'sorcerer', features: ['clockwork_spells_clockwork_2024', 'restore_balance_clockwork_2024', 'bastion_of_law_clockwork_2024', 'trance_of_order_clockwork_2024', 'clockwork_cavalcade_clockwork_2024'] },
    { index: 'draconic_sorcery_2024', name: 'Draconic Sorcery', classKey: 'sorcerer', features: ['draconic_resilience_draconic_2024', 'draconic_spells_draconic_2024', 'elemental_affinity_draconic_2024', 'dragon_wings_draconic_2024', 'dragon_companion_draconic_2024'] },
    { index: 'wild_magic_sorcery_2024', name: 'Wild Magic Sorcery', classKey: 'sorcerer', features: ['wild_magic_surge_wild_magic_2024', 'tides_of_chaos_wild_magic_2024', 'bend_luck_wild_magic_2024', 'controlled_chaos_wild_magic_2024', 'tamed_surge_wild_magic_2024'] },

    // WARLOCK
    { index: 'archfey_2024', name: 'Archfey Patron', classKey: 'warlock', features: ['archfey_spells_2024', 'steps_of_the_fey_archfey_2024', 'misty_escape_archfey_2024', 'beguiling_defenses_archfey_2024', 'bewitching_vanish_archfey_2024'] },
    { index: 'celestial_2024', name: 'Celestial Patron', classKey: 'warlock', features: ['celestial_spells_2024', 'healing_light_celestial_2024', 'radiant_soul_celestial_2024', 'celestial_resilience_celestial_2024', 'searing_vengeance_celestial_2024'] },
    { index: 'fiend_2024', name: 'Fiend Patron', classKey: 'warlock', features: ['fiend_spells_2024', 'dark_ones_blessing_fiend_2024', 'dark_ones_own_luck_fiend_2024', 'fiendish_resilience_fiend_2024', 'hurl_through_hell_fiend_2024'] },
    { index: 'great_old_one_2024', name: 'Great Old One Patron', classKey: 'warlock', features: ['great_old_one_spells_2024', 'awakened_mind_great_old_one_2024', 'psychic_spells_great_old_one_2024', 'clairvoyant_combatant_great_old_one_2024', 'eldritch_hex_great_old_one_2024', 'create_thrall_great_old_one_2024'] },

    // WIZARD
    { index: 'abjurer_2024', name: 'Abjurer', classKey: 'wizard', features: ['abjuration_savant_abjurer_2024', 'arcane_ward_abjurer_2024', 'projected_ward_abjurer_2024', 'spell_breaker_abjurer_2024', 'spell_resistance_abjurer_2024'] },
    { index: 'diviner_2024', name: 'Diviner', classKey: 'wizard', features: ['divination_savant_diviner_2024', 'portent_diviner_2024', 'expert_divination_diviner_2024', 'the_third_eye_diviner_2024', 'greater_portent_diviner_2024'] },
    { index: 'evocation_2024', name: 'Evoker', classKey: 'wizard', features: ['evocation_savant_evoker_2024', 'sculpt_spells_evoker_2024', 'potent_cantrip_evoker_2024', 'empowered_evocation_evoker_2024', 'overchannel_evoker_2024'] },
    { index: 'illusionist_2024', name: 'Illusionist', classKey: 'wizard', features: ['illusion_savant_illusionist_2024', 'improved_phantasms_illusionist_2024', 'malleable_illusions_illusionist_2024', 'illusory_self_illusionist_2024', 'illusory_reality_illusionist_2024'] }
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
  });

  it('verifies 2024 subclass catalog complete coverage for ALL 48 subclasses', async () => {
    const list2024 = await fetchSubclassesList('2024');
    expect(list2024).toHaveLength(48);

    const activeFeatureIndices = new Set<string>();

    for (const expectedSub of EXPECTED_2024_SUBCLASSES) {
      const subData = await fetchSubclassData(expectedSub.index, '2024');
      expect(subData, `Subclass record missing: ${expectedSub.index}`).not.toBeNull();
      expect(subData?.name).toBe(expectedSub.name);
      expect(subData?.class?.index).toBe(expectedSub.classKey);
      expect(subData?.rulesetContext).toBe('2024');

      const resolvedFeatureIndices: string[] = [];
      for (const levelGroup of subData?.subclass_levels || []) {
        for (const featRef of levelGroup.features || []) {
          resolvedFeatureIndices.push(featRef.index);
          activeFeatureIndices.add(featRef.index);

          const feat = await atlasService.loadFeature(featRef.index);
          expect(feat, `Feature record missing: ${featRef.index}`).not.toBeNull();
          expect(feat.index).toBe(featRef.index);
          expect(feat.class.index).toBe(expectedSub.classKey);
          expect(feat.subclass.index).toBe(expectedSub.index);
          expect(feat.name).toBeTruthy();

          const desc = Array.isArray(feat.desc) ? feat.desc.join(' ') : feat.desc || '';
          expect(desc.length).toBeGreaterThanOrEqual(30);

          // STRICT PLACEHOLDER & LEGACY MECHANIC DETECTION ASSERTIONS
          expect(desc.toLowerCase()).not.toContain('feature from your');
          expect(desc.toLowerCase()).not.toContain('placeholder');
          expect(desc.toLowerCase()).not.toContain('you gain a feature');
        }
      }

      // Assert all expected features exist for this subclass
      for (const expFeat of expectedSub.features) {
        expect(resolvedFeatureIndices, `Subclass ${expectedSub.index} missing feature ${expFeat}`).toContain(expFeat);
      }
    }

    // Verify NO obsolete *_2024.json feature files exist in public/assets/atlas/features/json/
    const featuresDir = path.join(process.cwd(), 'public/assets/atlas/features/json');
    const existingFeatureFiles = fs.readdirSync(featuresDir);

    existingFeatureFiles.forEach(fileName => {
      if (fileName.endsWith('_2024.json')) {
        const featIndex = fileName.replace('.json', '');
        const filePath = path.join(featuresDir, fileName);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (content.subclass && content.subclass.index) {
            expect(activeFeatureIndices.has(featIndex), `Obsolete feature file survived cleanup: ${fileName}`).toBe(true);
          }
        } catch (e) {
          // Ignore non-subclass feature errors
        }
      }
    });
  });

  it('verifies exact 2024 PHB mechanics for confirmed blocker subclasses', async () => {
    // 1. Wild Magic Sorcery
    const wildMagic = await fetchSubclassData('wild_magic_sorcery_2024', '2024');
    expect(wildMagic).not.toBeNull();
    const wildMagicFeats = wildMagic?.subclass_levels.flatMap((l: any) => l.features.map((f: any) => f.index));
    expect(wildMagicFeats).toContain('bend_luck_wild_magic_2024');
    expect(wildMagicFeats).not.toContain('bend_fate_wild_magic_2024');

    const bendLuck = await atlasService.loadFeature('bend_luck_wild_magic_2024');
    expect(bendLuck.desc.join(' ')).toContain('Reaction');
    expect(bendLuck.desc.join(' ')).toContain('d4');

    const tamedSurge = await atlasService.loadFeature('tamed_surge_wild_magic_2024');
    expect(tamedSurge.desc.join(' ')).toContain('choose a Wild Magic Surge effect directly');

    // 2. Warrior of the Elements
    const elementsMonk = await fetchSubclassData('elements_2024', '2024');
    expect(elementsMonk).not.toBeNull();
    const elementsFeats = elementsMonk?.subclass_levels.flatMap((l: any) => l.features.map((f: any) => f.index));
    expect(elementsFeats).toContain('manipulate_elements_elements_2024');
    expect(elementsFeats).toContain('elemental_epitome_elements_2024');

    const manipulateElements = await atlasService.loadFeature('manipulate_elements_elements_2024');
    expect(manipulateElements.desc.join(' ')).toContain('Elementalism cantrip');

    const elementalEpitome = await atlasService.loadFeature('elemental_epitome_elements_2024');
    expect(elementalEpitome.desc.join(' ')).toContain('resistance');

    // 3. Draconic Sorcery
    const draconicSorc = await fetchSubclassData('draconic_sorcery_2024', '2024');
    expect(draconicSorc).not.toBeNull();
    const draconicFeats = draconicSorc?.subclass_levels.flatMap((l: any) => l.features.map((f: any) => f.index));
    expect(draconicFeats).toContain('draconic_resilience_draconic_2024');
    expect(draconicFeats).toContain('draconic_spells_draconic_2024');
    expect(draconicFeats).toContain('elemental_affinity_draconic_2024');
    expect(draconicFeats).toContain('dragon_companion_draconic_2024');

    const elementalAffinity = await atlasService.loadFeature('elemental_affinity_draconic_2024');
    expect(elementalAffinity.desc.join(' ')).toContain('permanent resistance');

    const dragonCompanion = await atlasService.loadFeature('dragon_companion_draconic_2024');
    expect(dragonCompanion.desc.join(' ')).toContain('does not require Concentration');

    // 4. Warrior of the Open Hand
    const openHand = await fetchSubclassData('open_hand_2024', '2024');
    expect(openHand).not.toBeNull();
    const fleetStep = await atlasService.loadFeature('fleet_step_open_hand_2024');
    expect(fleetStep.desc.join(' ')).toContain('Step of the Wind');

    const quiveringPalm = await atlasService.loadFeature('quivering_palm_open_hand_2024');
    expect(quiveringPalm.desc.join(' ')).toContain('4 Focus Points');
    expect(quiveringPalm.desc.join(' ')).toContain('10d12 Force damage');

    // 5. Great Old One Patron
    const gooWarlock = await fetchSubclassData('great_old_one_2024', '2024');
    expect(gooWarlock).not.toBeNull();
    const psychicSpells = await atlasService.loadFeature('psychic_spells_great_old_one_2024');
    expect(psychicSpells.desc.join(' ')).toContain('no Verbal or Somatic components');

    const createThrall = await atlasService.loadFeature('create_thrall_great_old_one_2024');
    expect(createThrall.desc.join(' ')).toContain('Summon Aberration');
  });

  it('verifies 2014 vs 2024 subclass isolation and nonexistent subclass returns null', async () => {
    const champion24 = await atlasService.loadSubclass('champion_2024', '2024');
    expect(champion24).not.toBeNull();
    expect(champion24?.rulesetContext).toBe('2024');

    const champion14 = await fetchSubclassData('champion', '2014');
    expect(champion14).not.toBeNull();
    expect(champion14?.rulesetContext).toBe('2014');

    const nonexistent24 = await fetchSubclassData('nonexistent_subclass_2024', '2024');
    expect(nonexistent24).toBeNull();
  });

  it('verifies ruleset-aware fetchSubclassesList and class filtering for all 12 classes', async () => {
    for (const className of ALL_12_CLASSES) {
      const classSubs = await fetchSubclassesList('2024', className);
      expect(classSubs, `Class ${className} must have exactly 4 subclasses`).toHaveLength(4);
    }
  });
});
