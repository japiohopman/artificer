import { describe, it, expect } from 'vitest';
import { fetchEquipmentData, fetchFeatData, fetchSpeciesData, fetchClassData, fetchClassesList, fetchClassLevels, fetchSubclassData, fetchSubclassesList, fetchBackgroundsList, fetchBackgroundData } from '../src/services/storageService';
import { atlasService } from '../src/services/atlasService';
import { validate2024BackgroundAbilityScores, calculate2024BackgroundBonuses } from '../src/lib/backgroundUtils';
import fs from 'fs';
import path from 'path';

describe('Ruleset Resolution Audit Tests', () => {
  const ALL_12_CLASSES = [
    'barbarian', 'bard', 'cleric', 'druid', 'fighter',
    'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
  ];

  // Granular per-level mapping for ALL 48 2024 subclasses
  const EXPECTED_2024_SUBCLASSES = [
    // BARBARIAN
    {
      index: 'berserker_2024',
      name: 'Path of the Berserker',
      classKey: 'barbarian',
      expectedFeaturesByLevel: {
        3: ['frenzy_berserker_2024'],
        6: ['mindless_rage_berserker_2024'],
        10: ['retaliation_berserker_2024'],
        14: ['intimidating_presence_berserker_2024']
      }
    },
    {
      index: 'wild_heart_2024',
      name: 'Path of the Wild Heart',
      classKey: 'barbarian',
      expectedFeaturesByLevel: {
        3: ['animal_speaker_wild_heart_2024', 'rage_of_the_wild_wild_heart_2024'],
        6: ['aspect_of_the_wild_wild_heart_2024'],
        10: ['nature_speaker_wild_heart_2024'],
        14: ['power_of_the_wild_wild_heart_2024']
      }
    },
    {
      index: 'world_tree_2024',
      name: 'Path of the World Tree',
      classKey: 'barbarian',
      expectedFeaturesByLevel: {
        3: ['vitality_of_the_tree_world_tree_2024'],
        6: ['branches_of_the_tree_world_tree_2024'],
        10: ['battering_roots_world_tree_2024'],
        14: ['travel_along_the_tree_world_tree_2024']
      }
    },
    {
      index: 'zealot_2024',
      name: 'Path of the Zealot',
      classKey: 'barbarian',
      expectedFeaturesByLevel: {
        3: ['divine_fury_zealot_2024', 'warrior_of_the_gods_zealot_2024'],
        6: ['fanatical_focus_zealot_2024'],
        10: ['zealous_presence_zealot_2024'],
        14: ['rage_beyond_death_zealot_2024']
      }
    },

    // BARD
    {
      index: 'dance_2024',
      name: 'College of Dance',
      classKey: 'bard',
      expectedFeaturesByLevel: {
        3: ['dazzling_footwork_dance_2024'],
        6: ['inspiring_movement_dance_2024', 'tandem_footwork_dance_2024'],
        14: ['leading_evasion_dance_2024']
      }
    },
    {
      index: 'glamour_2024',
      name: 'College of Glamour',
      classKey: 'bard',
      expectedFeaturesByLevel: {
        3: ['beguiling_magic_glamour_2024', 'mantle_of_inspiration_glamour_2024'],
        6: ['mantle_of_majesty_glamour_2024'],
        14: ['unbreakable_majesty_glamour_2024']
      }
    },
    {
      index: 'lore_2024',
      name: 'College of Lore',
      classKey: 'bard',
      expectedFeaturesByLevel: {
        3: ['bonus_proficiencies_lore_2024', 'cutting_words_lore_2024'],
        6: ['magical_discoveries_lore_2024'],
        14: ['peerless_skill_lore_2024']
      }
    },
    {
      index: 'valor_2024',
      name: 'College of Valor',
      classKey: 'bard',
      expectedFeaturesByLevel: {
        3: ['combat_inspiration_valor_2024', 'martial_training_valor_2024'],
        6: ['extra_attack_valor_2024'],
        14: ['battle_magic_valor_2024']
      }
    },

    // CLERIC
    {
      index: 'life_domain_2024',
      name: 'Life Domain',
      classKey: 'cleric',
      expectedFeaturesByLevel: {
        3: ['life_domain_spells_2024', 'disciple_of_life_life_2024', 'preserve_life_life_2024'],
        6: ['blessed_healer_life_2024'],
        17: ['supreme_healing_life_2024']
      }
    },
    {
      index: 'light_domain_2024',
      name: 'Light Domain',
      classKey: 'cleric',
      expectedFeaturesByLevel: {
        3: ['light_domain_spells_2024', 'warding_flare_light_2024', 'radiance_of_the_dawn_light_2024'],
        6: ['improved_flare_light_2024'],
        17: ['corona_of_light_light_2024']
      }
    },
    {
      index: 'trickery_domain_2024',
      name: 'Trickery Domain',
      classKey: 'cleric',
      expectedFeaturesByLevel: {
        3: ['trickery_domain_spells_2024', 'blessing_of_the_trickster_trickery_2024', 'invoke_duplicity_trickery_2024'],
        6: ['tricksters_transposition_trickery_2024'],
        17: ['improved_duplicity_trickery_2024']
      }
    },
    {
      index: 'war_domain_2024',
      name: 'War Domain',
      classKey: 'cleric',
      expectedFeaturesByLevel: {
        3: ['war_domain_spells_2024', 'war_priest_war_2024', 'guided_strike_war_2024'],
        6: ['war_gods_blessing_war_2024'],
        17: ['avatar_of_battle_war_2024']
      }
    },

    // DRUID
    {
      index: 'land_2024',
      name: 'Circle of the Land',
      classKey: 'druid',
      expectedFeaturesByLevel: {
        3: ['circle_spells_land_2024', 'lands_aid_land_2024'],
        6: ['natural_recovery_land_2024'],
        10: ['natures_ward_land_2024'],
        14: ['natures_sanctuary_land_2024']
      }
    },
    {
      index: 'moon_2024',
      name: 'Circle of the Moon',
      classKey: 'druid',
      expectedFeaturesByLevel: {
        3: ['circle_forms_moon_2024', 'combat_wild_shape_moon_2024'],
        6: ['improved_circle_forms_moon_2024'],
        10: ['moonlight_step_moon_2024'],
        14: ['lunar_form_moon_2024']
      }
    },
    {
      index: 'sea_2024',
      name: 'Circle of the Sea',
      classKey: 'druid',
      expectedFeaturesByLevel: {
        3: ['circle_spells_sea_2024', 'wrath_of_the_sea_sea_2024'],
        6: ['aquatic_affinity_sea_2024'],
        10: ['stormborn_sea_2024'],
        14: ['oceanic_gift_sea_2024']
      }
    },
    {
      index: 'stars_2024',
      name: 'Circle of the Stars',
      classKey: 'druid',
      expectedFeaturesByLevel: {
        3: ['star_map_stars_2024', 'starry_form_stars_2024'],
        6: ['cosmic_omen_stars_2024'],
        10: ['twinkling_constellations_stars_2024'],
        14: ['full_of_stars_stars_2024']
      }
    },

    // FIGHTER
    {
      index: 'battle_master_2024',
      name: 'Battle Master',
      classKey: 'fighter',
      expectedFeaturesByLevel: {
        3: ['combat_superiority_battle_master_2024', 'student_of_war_battle_master_2024'],
        7: ['know_your_enemy_battle_master_2024'],
        10: ['improved_combat_superiority_battle_master_2024'],
        15: ['relentless_battle_master_2024'],
        18: ['ultimate_combat_superiority_battle_master_2024']
      }
    },
    {
      index: 'champion_2024',
      name: 'Champion',
      classKey: 'fighter',
      expectedFeaturesByLevel: {
        3: ['improved_critical_champion_2024', 'remarkable_athlete_champion_2024'],
        7: ['additional_fighting_style_champion_2024'],
        10: ['heroic_warrior_champion_2024'],
        15: ['superior_critical_champion_2024'],
        18: ['survivor_champion_2024']
      }
    },
    {
      index: 'eldritch_knight_2024',
      name: 'Eldritch Knight',
      classKey: 'fighter',
      expectedFeaturesByLevel: {
        3: ['spellcasting_eldritch_knight_2024', 'weapon_bond_eldritch_knight_2024'],
        7: ['war_magic_eldritch_knight_2024'],
        10: ['eldritch_strike_eldritch_knight_2024'],
        15: ['arcane_charge_eldritch_knight_2024'],
        18: ['improved_war_magic_eldritch_knight_2024']
      }
    },
    {
      index: 'psi_warrior_2024',
      name: 'Psi Warrior',
      classKey: 'fighter',
      expectedFeaturesByLevel: {
        3: ['psionic_power_psi_warrior_2024'],
        7: ['telekinetic_movement_psi_warrior_2024', 'psi_powered_leap_psi_warrior_2024'],
        10: ['guarded_mind_psi_warrior_2024'],
        15: ['bulwark_of_force_psi_warrior_2024'],
        18: ['telekinetic_master_psi_warrior_2024']
      }
    },

    // MONK
    {
      index: 'mercy_2024',
      name: 'Warrior of Mercy',
      classKey: 'monk',
      expectedFeaturesByLevel: {
        3: ['implements_of_mercy_mercy_2024', 'hand_of_harm_mercy_2024', 'hand_of_healing_mercy_2024'],
        6: ['physicians_touch_mercy_2024'],
        11: ['flurry_of_healing_and_harm_mercy_2024'],
        17: ['hand_of_ultimate_mercy_mercy_2024']
      }
    },
    {
      index: 'elements_2024',
      name: 'Warrior of the Elements',
      classKey: 'monk',
      expectedFeaturesByLevel: {
        3: ['elemental_attunement_elements_2024', 'manipulate_elements_elements_2024'],
        6: ['elemental_burst_elements_2024'],
        11: ['stride_of_the_elements_elements_2024'],
        17: ['elemental_epitome_elements_2024']
      }
    },
    {
      index: 'open_hand_2024',
      name: 'Warrior of the Open Hand',
      classKey: 'monk',
      expectedFeaturesByLevel: {
        3: ['open_hand_technique_open_hand_2024'],
        6: ['wholeness_of_body_open_hand_2024'],
        11: ['fleet_step_open_hand_2024'],
        17: ['quivering_palm_open_hand_2024']
      }
    },
    {
      index: 'shadow_2024',
      name: 'Warrior of the Shadow',
      classKey: 'monk',
      expectedFeaturesByLevel: {
        3: ['shadow_arts_shadow_2024'],
        6: ['shadow_step_shadow_2024'],
        11: ['improved_shadow_step_shadow_2024'],
        17: ['cloak_of_shadows_shadow_2024']
      }
    },

    // PALADIN
    {
      index: 'ancients_2024',
      name: 'Oath of the Ancients',
      classKey: 'paladin',
      expectedFeaturesByLevel: {
        3: ['oath_spells_ancients_2024', 'natures_wrath_ancients_2024'],
        7: ['aura_of_warding_ancients_2024'],
        15: ['undying_sentinel_ancients_2024'],
        20: ['elder_champion_ancients_2024']
      }
    },
    {
      index: 'devotion_2024',
      name: 'Oath of Devotion',
      classKey: 'paladin',
      expectedFeaturesByLevel: {
        3: ['oath_spells_devotion_2024', 'sacred_weapon_devotion_2024'],
        7: ['aura_of_devotion_devotion_2024'],
        15: ['smite_of_protection_devotion_2024'],
        20: ['holy_nimbus_devotion_2024']
      }
    },
    {
      index: 'glory_2024',
      name: 'Oath of Glory',
      classKey: 'paladin',
      expectedFeaturesByLevel: {
        3: ['oath_spells_glory_2024', 'peerless_athlete_glory_2024', 'inspiring_smite_glory_2024'],
        7: ['aura_of_alacrity_glory_2024'],
        15: ['glorious_defense_glory_2024'],
        20: ['living_legend_glory_2024']
      }
    },
    {
      index: 'vengeance_2024',
      name: 'Oath of Vengeance',
      classKey: 'paladin',
      expectedFeaturesByLevel: {
        3: ['oath_spells_vengeance_2024', 'vow_of_enmity_vengeance_2024'],
        7: ['relentless_avenger_vengeance_2024'],
        15: ['soul_of_vengeance_vengeance_2024'],
        20: ['avenging_angel_vengeance_2024']
      }
    },

    // RANGER
    {
      index: 'beast_master_2024',
      name: 'Beast Master',
      classKey: 'ranger',
      expectedFeaturesByLevel: {
        3: ['primal_companion_beast_master_2024'],
        7: ['exceptional_training_beast_master_2024'],
        11: ['bestial_fury_beast_master_2024'],
        15: ['share_spells_beast_master_2024']
      }
    },
    {
      index: 'fey_wanderer_2024',
      name: 'Fey Wanderer',
      classKey: 'ranger',
      expectedFeaturesByLevel: {
        3: ['dreadful_strikes_fey_wanderer_2024', 'fey_wanderer_spells_2024', 'otherworldly_glamour_fey_wanderer_2024'],
        7: ['beguiling_twist_fey_wanderer_2024'],
        11: ['fey_reinforcements_fey_wanderer_2024'],
        15: ['misty_wanderer_fey_wanderer_2024']
      }
    },
    {
      index: 'gloom_stalker_2024',
      name: 'Gloom Stalker',
      classKey: 'ranger',
      expectedFeaturesByLevel: {
        3: ['dread_ambusher_gloom_stalker_2024', 'gloom_stalker_spells_2024', 'umbral_sight_gloom_stalker_2024'],
        7: ['iron_mind_gloom_stalker_2024'],
        11: ['stalkers_flurry_gloom_stalker_2024'],
        15: ['shadowy_dodge_gloom_stalker_2024']
      }
    },
    {
      index: 'hunter_2024',
      name: 'Hunter',
      classKey: 'ranger',
      expectedFeaturesByLevel: {
        3: ['hunters_prey_hunter_2024', 'hunters_lore_hunter_2024'],
        7: ['defensive_tactics_hunter_2024'],
        11: ['superior_hunters_prey_hunter_2024'],
        15: ['superior_hunters_defense_hunter_2024']
      }
    },

    // ROGUE
    {
      index: 'arcane_trickster_2024',
      name: 'Arcane Trickster',
      classKey: 'rogue',
      expectedFeaturesByLevel: {
        3: ['spellcasting_arcane_trickster_2024', 'mage_hand_legerdemain_arcane_trickster_2024'],
        9: ['magical_ambush_arcane_trickster_2024'],
        13: ['versatile_trickster_arcane_trickster_2024'],
        17: ['spell_thief_arcane_trickster_2024']
      }
    },
    {
      index: 'assassin_2024',
      name: 'Assassin',
      classKey: 'rogue',
      expectedFeaturesByLevel: {
        3: ['assassinate_assassin_2024', 'assassins_tools_assassin_2024'],
        9: ['infiltration_expertise_assassin_2024'],
        13: ['envenomed_weapons_assassin_2024'],
        17: ['death_strike_assassin_2024']
      }
    },
    {
      index: 'soulknife_2024',
      name: 'Soulknife',
      classKey: 'rogue',
      expectedFeaturesByLevel: {
        3: ['psychic_blades_soulknife_2024', 'psionic_power_soulknife_2024'],
        9: ['soul_blades_soulknife_2024'],
        13: ['psychic_veil_soulknife_2024'],
        17: ['rend_mind_soulknife_2024']
      }
    },
    {
      index: 'thief_2024',
      name: 'Thief',
      classKey: 'rogue',
      expectedFeaturesByLevel: {
        3: ['fast_hands_thief_2024', 'second_story_work_thief_2024'],
        9: ['supreme_sneak_thief_2024'],
        13: ['use_magic_device_thief_2024'],
        17: ['thiefs_reflexes_thief_2024']
      }
    },

    // SORCERER
    {
      index: 'aberrant_sorcery_2024',
      name: 'Aberrant Sorcery',
      classKey: 'sorcerer',
      expectedFeaturesByLevel: {
        3: ['psionic_spells_aberrant_2024', 'telepathic_speech_aberrant_2024'],
        6: ['psionic_sorcery_aberrant_2024', 'psychic_defenses_aberrant_2024'],
        14: ['revelation_in_flesh_aberrant_2024'],
        18: ['warping_implosion_aberrant_2024']
      }
    },
    {
      index: 'clockwork_sorcery_2024',
      name: 'Clockwork Sorcery',
      classKey: 'sorcerer',
      expectedFeaturesByLevel: {
        3: ['clockwork_spells_clockwork_2024', 'restore_balance_clockwork_2024'],
        6: ['bastion_of_law_clockwork_2024'],
        14: ['trance_of_order_clockwork_2024'],
        18: ['clockwork_cavalcade_clockwork_2024']
      }
    },
    {
      index: 'draconic_sorcery_2024',
      name: 'Draconic Sorcery',
      classKey: 'sorcerer',
      expectedFeaturesByLevel: {
        3: ['draconic_resilience_draconic_2024', 'draconic_spells_draconic_2024'],
        6: ['elemental_affinity_draconic_2024'],
        14: ['dragon_wings_draconic_2024'],
        18: ['dragon_companion_draconic_2024']
      }
    },
    {
      index: 'wild_magic_sorcery_2024',
      name: 'Wild Magic Sorcery',
      classKey: 'sorcerer',
      expectedFeaturesByLevel: {
        3: ['wild_magic_surge_wild_magic_2024', 'tides_of_chaos_wild_magic_2024'],
        6: ['bend_luck_wild_magic_2024'],
        14: ['controlled_chaos_wild_magic_2024'],
        18: ['tamed_surge_wild_magic_2024']
      }
    },

    // WARLOCK
    {
      index: 'archfey_2024',
      name: 'Archfey Patron',
      classKey: 'warlock',
      expectedFeaturesByLevel: {
        3: ['archfey_spells_2024', 'steps_of_the_fey_archfey_2024'],
        6: ['misty_escape_archfey_2024'],
        10: ['beguiling_defenses_archfey_2024'],
        14: ['bewitching_vanish_archfey_2024']
      }
    },
    {
      index: 'celestial_2024',
      name: 'Celestial Patron',
      classKey: 'warlock',
      expectedFeaturesByLevel: {
        3: ['celestial_spells_2024', 'healing_light_celestial_2024'],
        6: ['radiant_soul_celestial_2024'],
        10: ['celestial_resilience_celestial_2024'],
        14: ['searing_vengeance_celestial_2024']
      }
    },
    {
      index: 'fiend_2024',
      name: 'Fiend Patron',
      classKey: 'warlock',
      expectedFeaturesByLevel: {
        3: ['fiend_spells_2024', 'dark_ones_blessing_fiend_2024'],
        6: ['dark_ones_own_luck_fiend_2024'],
        10: ['fiendish_resilience_fiend_2024'],
        14: ['hurl_through_hell_fiend_2024']
      }
    },
    {
      index: 'great_old_one_2024',
      name: 'Great Old One Patron',
      classKey: 'warlock',
      expectedFeaturesByLevel: {
        3: ['great_old_one_spells_2024', 'awakened_mind_great_old_one_2024', 'psychic_spells_great_old_one_2024'],
        6: ['clairvoyant_combatant_great_old_one_2024'],
        10: ['eldritch_hex_great_old_one_2024'],
        14: ['create_thrall_great_old_one_2024']
      }
    },

    // WIZARD
    {
      index: 'abjurer_2024',
      name: 'Abjurer',
      classKey: 'wizard',
      expectedFeaturesByLevel: {
        3: ['abjuration_savant_abjurer_2024', 'arcane_ward_abjurer_2024'],
        6: ['projected_ward_abjurer_2024'],
        10: ['spell_breaker_abjurer_2024'],
        14: ['spell_resistance_abjurer_2024']
      }
    },
    {
      index: 'diviner_2024',
      name: 'Diviner',
      classKey: 'wizard',
      expectedFeaturesByLevel: {
        3: ['divination_savant_diviner_2024', 'portent_diviner_2024'],
        6: ['expert_divination_diviner_2024'],
        10: ['the_third_eye_diviner_2024'],
        14: ['greater_portent_diviner_2024']
      }
    },
    {
      index: 'evocation_2024',
      name: 'Evoker',
      classKey: 'wizard',
      expectedFeaturesByLevel: {
        3: ['evocation_savant_evoker_2024', 'sculpt_spells_evoker_2024'],
        6: ['potent_cantrip_evoker_2024'],
        10: ['empowered_evocation_evoker_2024'],
        14: ['overchannel_evoker_2024']
      }
    },
    {
      index: 'illusionist_2024',
      name: 'Illusionist',
      classKey: 'wizard',
      expectedFeaturesByLevel: {
        3: ['illusion_savant_illusionist_2024', 'improved_phantasms_illusionist_2024'],
        6: ['malleable_illusions_illusionist_2024'],
        10: ['illusory_self_illusionist_2024'],
        14: ['illusory_reality_illusionist_2024']
      }
    }
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

  it('verifies 2024 Backgrounds/Origins dataset integrity, Origin Feat linking, and ability score choice space', async () => {
    const list2024 = await fetchBackgroundsList('2024');
    expect(list2024.length).toBe(16);

    const ALL_16_2024_BACKGROUNDS = [
      { index: 'acolyte', name: 'Acolyte', allowedAbilities: ['int', 'wis', 'cha'], expectedFeat: 'magic_initiate' },
      { index: 'artisan', name: 'Artisan', allowedAbilities: ['str', 'dex', 'int'], expectedFeat: 'crafter' },
      { index: 'charlatan', name: 'Charlatan', allowedAbilities: ['dex', 'con', 'cha'], expectedFeat: 'skilled' },
      { index: 'criminal', name: 'Criminal', allowedAbilities: ['dex', 'con', 'int'], expectedFeat: 'alert' },
      { index: 'entertainer', name: 'Entertainer', allowedAbilities: ['str', 'dex', 'cha'], expectedFeat: 'musician' },
      { index: 'farmer', name: 'Farmer', allowedAbilities: ['str', 'con', 'wis'], expectedFeat: 'tough' },
      { index: 'guard', name: 'Guard', allowedAbilities: ['str', 'int', 'wis'], expectedFeat: 'alert' },
      { index: 'guide', name: 'Guide', allowedAbilities: ['dex', 'con', 'wis'], expectedFeat: 'magic_initiate' },
      { index: 'hermit', name: 'Hermit', allowedAbilities: ['con', 'wis', 'cha'], expectedFeat: 'healer' },
      { index: 'merchant', name: 'Merchant', allowedAbilities: ['con', 'int', 'cha'], expectedFeat: 'lucky' },
      { index: 'noble', name: 'Noble', allowedAbilities: ['str', 'int', 'cha'], expectedFeat: 'skilled' },
      { index: 'sage', name: 'Sage', allowedAbilities: ['con', 'int', 'wis'], expectedFeat: 'magic_initiate' },
      { index: 'sailor', name: 'Sailor', allowedAbilities: ['str', 'dex', 'wis'], expectedFeat: 'tavern_brawler' },
      { index: 'scribe', name: 'Scribe', allowedAbilities: ['dex', 'int', 'wis'], expectedFeat: 'skilled' },
      { index: 'soldier', name: 'Soldier', allowedAbilities: ['str', 'dex', 'con'], expectedFeat: 'savage_attacker' },
      { index: 'wayfarer', name: 'Wayfarer', allowedAbilities: ['dex', 'wis', 'cha'], expectedFeat: 'lucky' }
    ];

    for (const expectedBg of ALL_16_2024_BACKGROUNDS) {
      const bgData = await fetchBackgroundData(expectedBg.index, '2024');
      expect(bgData, `2024 Background missing: ${expectedBg.index}`).not.toBeNull();
      expect(bgData?.rulesetContext).toBe('2024');
      expect(bgData?.name).toBe(expectedBg.name);

      // Verify 2024 Ability Score Choice Space (allowed 3 abilities)
      expect(bgData?.allowed_ability_scores).toEqual(expectedBg.allowedAbilities);

      // Verify canonical Origin Feat URL and reference
      expect(bgData?.feat?.index).toBe(expectedBg.expectedFeat);
      expect(bgData?.feat?.url).toBe(`/assets/atlas/feats/json/24/origin-feats/${expectedBg.expectedFeat}.json`);

      const originFeat = await fetchFeatData(bgData.feat.index, '2024');
      expect(originFeat, `Origin feat definition missing: ${bgData.feat.index}`).not.toBeNull();
      expect(originFeat.rulesetContext).toBe('2024');

      // Verify proficiencies and equipment
      expect(bgData?.starting_proficiencies?.length).toBeGreaterThanOrEqual(2);
      expect(bgData?.starting_equipment?.length).toBeGreaterThan(0);

      // Verify zero placeholder language
      const desc = bgData.description || '';
      expect(desc.toLowerCase()).not.toContain('placeholder');
      expect(desc.toLowerCase()).not.toContain('feature from your');
      expect(desc.toLowerCase()).not.toContain('you gain a feature');
    }
  });

  it('verifies 2014 vs 2024 Background isolation, cache separation, and strict non-fallback', async () => {
    const soldier14 = await fetchBackgroundData('soldier', '2014');
    const soldier24 = await fetchBackgroundData('soldier', '2024');

    expect(soldier14).not.toBeNull();
    expect(soldier24).not.toBeNull();

    expect(soldier14?.rulesetContext).toBe('2014');
    expect(soldier24?.rulesetContext).toBe('2024');

    // 2014 has feature 'Military Rank', 2024 has Origin Feat 'savage_attacker' and allowed_ability_scores
    expect(soldier14?.feature?.name).toBe('Military Rank');
    expect(soldier24?.feat?.index).toBe('savage_attacker');
    expect(soldier24?.allowed_ability_scores).toEqual(['str', 'dex', 'con']);

    // AtlasService cache test
    const atlasSoldier14 = await atlasService.loadBackground('soldier', '2014');
    const atlasSoldier24 = await atlasService.loadBackground('soldier', '2024');
    expect(atlasSoldier14?.rulesetContext).toBe('2014');
    expect(atlasSoldier24?.rulesetContext).toBe('2024');

    // Strict non-fallback for nonexistent 2024 background
    const nonexistent24 = await fetchBackgroundData('nonexistent_background_2024', '2024');
    expect(nonexistent24).toBeNull();
  });

  it('verifies unit test assertions for 2024 ability-score choice model validation and calculation', () => {
    const allowed = ['str', 'dex', 'con'];

    // 1. Valid Mode A (+2 / +1 across 2 distinct allowed abilities)
    const validModeA = { str: 2, dex: 1 };
    const resA = validate2024BackgroundAbilityScores(validModeA, allowed);
    expect(resA.valid).toBe(true);
    expect(resA.mode).toBe('A (+2/+1)');
    const bonusesA = calculate2024BackgroundBonuses(validModeA, allowed);
    expect(bonusesA).toEqual({ str: 2, dex: 1, con: 0, int: 0, wis: 0, cha: 0 });

    // 2. Valid Mode B (+1 / +1 / +1 across 3 distinct allowed abilities)
    const validModeB = { str: 1, dex: 1, con: 1 };
    const resB = validate2024BackgroundAbilityScores(validModeB, allowed);
    expect(resB.valid).toBe(true);
    expect(resB.mode).toBe('B (+1/+1/+1)');
    const bonusesB = calculate2024BackgroundBonuses(validModeB, allowed);
    expect(bonusesB).toEqual({ str: 1, dex: 1, con: 1, int: 0, wis: 0, cha: 0 });

    // 3. Reject +3 on a single ability
    const invalidPlus3 = { str: 3 };
    const resPlus3 = validate2024BackgroundAbilityScores(invalidPlus3, allowed);
    expect(resPlus3.valid).toBe(false);
    expect(calculate2024BackgroundBonuses(invalidPlus3, allowed)).toEqual({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });

    // 4. Reject duplicate +1 choices resulting in invalid count/sum (e.g. { str: 2, dex: 2 } or { str: 1, dex: 1 } totaling 2)
    const invalidSum2 = { str: 1, dex: 1 };
    const resSum2 = validate2024BackgroundAbilityScores(invalidSum2, allowed);
    expect(resSum2.valid).toBe(false);

    // 5. Reject abilities outside allowed background set
    const invalidOutsideAbility = { str: 2, int: 1 };
    const resOutside = validate2024BackgroundAbilityScores(invalidOutsideAbility, allowed);
    expect(resOutside.valid).toBe(false);
    expect(resOutside.reason).toContain("is not in allowed background options");
  });

  it('verifies official Background Markdown content resolves for all backgrounds with exact 1-to-1 matching, title matching, and uniqueness', async () => {
    const bgList = await fetchBackgroundsList('2024');
    expect(bgList.length).toBe(16);

    const seenContents = new Set<string>();

    for (const bgRef of bgList) {
      const bgData = await fetchBackgroundData(bgRef.index, '2024');
      expect(bgData, `Background missing: ${bgRef.index}`).not.toBeNull();
      expect(bgData?.markdownGuide, `Background ${bgRef.index} missing markdownGuide`).toBeTruthy();

      const md = bgData.markdownGuide || '';
      expect(md.length).toBeGreaterThan(300);

      // Verify Markdown starts with correct Background identity/title
      expect(md.toLowerCase()).toContain(`# ${bgData.name.toLowerCase()}`);

      // Verify content uniqueness across files
      expect(seenContents.has(md), `Duplicate markdown content detected for ${bgRef.index}`).toBe(false);
      seenContents.add(md);

      // Verify no placeholder, Rogue, or coming soon content
      expect(md.toLowerCase()).not.toContain('# rogue');
      expect(md.toLowerCase()).not.toContain('placeholder');
      expect(md.toLowerCase()).not.toContain('coming soon');
      expect(md.toLowerCase()).not.toContain('feature from your');
    }
  });
});
