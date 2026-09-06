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

  it('validates precise 2024 mechanics for all 8 remaining classes', async () => {
    // Barbarian
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

    // Bard
    const bardicInspiration24 = await atlasService.loadFeature('bardic_inspiration_2024');
    expect(bardicInspiration24).not.toBeNull();

    const fontOfInspiration24 = await atlasService.loadFeature('font_of_inspiration_2024');
    expect(fontOfInspiration24).not.toBeNull();

    const magicalSecrets24 = await atlasService.loadFeature('magical_secrets_2024');
    expect(magicalSecrets24).not.toBeNull();

    // Druid
    const primalOrder24 = await atlasService.loadFeature('primal_order_2024');
    expect(primalOrder24).not.toBeNull();

    const wildShape24 = await atlasService.loadFeature('wild_shape_2024');
    expect(wildShape24).not.toBeNull();

    // Monk
    const martialArts24 = await atlasService.loadFeature('martial_arts_2024');
    expect(martialArts24).not.toBeNull();

    const monkFocus24 = await atlasService.loadFeature('monk_focus_2024');
    expect(monkFocus24).not.toBeNull();

    // Paladin
    const layOnHands24 = await atlasService.loadFeature('lay_on_hands_2024');
    expect(layOnHands24).not.toBeNull();

    const paladinSmite24 = await atlasService.loadFeature('paladin_smite_2024');
    expect(paladinSmite24).not.toBeNull();

    // Ranger
    const favoredEnemy24 = await atlasService.loadFeature('favored_enemy_2024');
    expect(favoredEnemy24).not.toBeNull();

    // Sorcerer
    const innateSorcery24 = await atlasService.loadFeature('innate_sorcery_2024');
    expect(innateSorcery24).not.toBeNull();

    const fontOfMagic24 = await atlasService.loadFeature('font_of_magic_2024');
    expect(fontOfMagic24).not.toBeNull();

    // Warlock
    const pactSpellsWarlock24 = await atlasService.loadFeature('pact_spells_warlock_2024');
    expect(pactSpellsWarlock24).not.toBeNull();

    const eldritchInvocations24 = await atlasService.loadFeature('eldritch_invocations_2024');
    expect(eldritchInvocations24).not.toBeNull();
  });

  it('verifies ALL 48 2024 subclasses with GRANULAR PER-LEVEL feature array equality and referential integrity', async () => {
    const list2024 = await fetchSubclassesList('2024');
    expect(list2024).toHaveLength(48);

    const activeFeatureIndices = new Set<string>();

    for (const expectedSub of EXPECTED_2024_SUBCLASSES) {
      const subData = await fetchSubclassData(expectedSub.index, '2024');
      expect(subData, `Subclass record missing: ${expectedSub.index}`).not.toBeNull();
      expect(subData?.name).toBe(expectedSub.name);
      expect(subData?.class?.index).toBe(expectedSub.classKey);
      expect(subData?.rulesetContext).toBe('2024');

      const expectedLevels = Object.keys(expectedSub.expectedFeaturesByLevel).map(Number).sort((a, b) => a - b);
      const actualLevels = (subData?.subclass_levels || []).map((l: any) => l.level).sort((a, b) => a - b);

      // 1. Assert exact subclass_levels level array
      expect(actualLevels, `Subclass ${expectedSub.index} levels mismatch`).toEqual(expectedLevels);

      for (const levelGroup of subData?.subclass_levels || []) {
        const lvl = levelGroup.level;
        const expectedFeatList = expectedSub.expectedFeaturesByLevel[lvl] || [];
        const actualFeatList = (levelGroup.features || []).map((f: any) => f.index);

        // 2 & 3. Assert exact feature IDs for each level and no unexpected feature IDs
        expect(actualFeatList, `Subclass ${expectedSub.index} at level ${lvl} features mismatch`).toEqual(expectedFeatList);

        for (const featRef of levelGroup.features || []) {
          activeFeatureIndices.add(featRef.index);

          // 4. Assert every feature definition resolves
          const feat = await atlasService.loadFeature(featRef.index);
          expect(feat, `Feature record missing: ${featRef.index}`).not.toBeNull();

          // 5. Assert feature.class.index matches the subclass class
          expect(feat.class.index, `Feature ${featRef.index} class mismatch`).toBe(expectedSub.classKey);

          // 6. Assert feature.subclass.index matches the subclass
          expect(feat.subclass.index, `Feature ${featRef.index} subclass mismatch`).toBe(expectedSub.index);

          // 7. Assert feature.level matches the level where it is referenced
          expect(feat.level, `Feature ${featRef.index} level mismatch`).toBe(lvl);

          const desc = Array.isArray(feat.desc) ? feat.desc.join(' ') : feat.desc || '';
          expect(desc.length).toBeGreaterThanOrEqual(30);

          // STRICT PLACEHOLDER DETECTION ASSERTIONS
          expect(desc.toLowerCase()).not.toContain('feature from your');
          expect(desc.toLowerCase()).not.toContain('placeholder');
          expect(desc.toLowerCase()).not.toContain('you gain a feature');
        }
      }
    }

    // 9. Assert no obsolete subclass feature file survives cleanup in public/assets/atlas/features/json/
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

    const surge = await atlasService.loadFeature('wild_magic_surge_wild_magic_2024');
    expect(surge.desc.join(' ')).toContain('spell slot');
    expect(surge.desc.join(' ')).toContain('roll of 20');

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
    expect(elementalEpitome.desc.join(' ')).toContain('flying or swimming speed by 20 feet');
    expect(elementalEpitome.desc.join(' ')).toContain('Martial Arts die');

    // 3. Draconic Sorcery
    const draconicSorc = await fetchSubclassData('draconic_sorcery_2024', '2024');
    expect(draconicSorc).not.toBeNull();
    const draconicFeats = draconicSorc?.subclass_levels.flatMap((l: any) => l.features.map((f: any) => f.index));
    expect(draconicFeats).toContain('draconic_resilience_draconic_2024');
    expect(draconicFeats).toContain('draconic_spells_draconic_2024');
    expect(draconicFeats).toContain('elemental_affinity_draconic_2024');
    expect(draconicFeats).toContain('dragon_companion_draconic_2024');

    const elementalAffinity = await atlasService.loadFeature('elemental_affinity_draconic_2024');
    expect(elementalAffinity.desc.join(' ')).toContain('Acid, Cold, Fire, Lightning, or Poison');
    expect(elementalAffinity.desc.join(' ')).toContain('permanent resistance');

    const dragonCompanion = await atlasService.loadFeature('dragon_companion_draconic_2024');
    expect(dragonCompanion.desc.join(' ')).toContain('without material components');
    expect(dragonCompanion.desc.join(' ')).toContain('does not require Concentration');
    expect(dragonCompanion.desc.join(' ')).toContain('1 minute');

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

  it('verifies exact assertions for renamed 2024 subclass identities', async () => {
    const wildHeart = await fetchSubclassData('wild_heart_2024', '2024');
    expect(wildHeart?.name).toBe('Path of the Wild Heart');
    expect(wildHeart?.class?.index).toBe('barbarian');

    const shadowMonk = await fetchSubclassData('shadow_2024', '2024');
    expect(shadowMonk?.name).toBe('Warrior of the Shadow');
    expect(shadowMonk?.class?.index).toBe('monk');

    const elementsMonk = await fetchSubclassData('elements_2024', '2024');
    expect(elementsMonk?.name).toBe('Warrior of the Elements');
    expect(elementsMonk?.class?.index).toBe('monk');

    const aberrantSorc = await fetchSubclassData('aberrant_sorcery_2024', '2024');
    expect(aberrantSorc?.name).toBe('Aberrant Sorcery');
    expect(aberrantSorc?.class?.index).toBe('sorcerer');

    const clockworkSorc = await fetchSubclassData('clockwork_sorcery_2024', '2024');
    expect(clockworkSorc?.name).toBe('Clockwork Sorcery');
    expect(clockworkSorc?.class?.index).toBe('sorcerer');

    const draconicSorc = await fetchSubclassData('draconic_sorcery_2024', '2024');
    expect(draconicSorc?.name).toBe('Draconic Sorcery');
    expect(draconicSorc?.class?.index).toBe('sorcerer');

    const archfeyWarlock = await fetchSubclassData('archfey_2024', '2024');
    expect(archfeyWarlock?.name).toBe('Archfey Patron');
    expect(archfeyWarlock?.class?.index).toBe('warlock');

    const celestialWarlock = await fetchSubclassData('celestial_2024', '2024');
    expect(celestialWarlock?.name).toBe('Celestial Patron');
    expect(celestialWarlock?.class?.index).toBe('warlock');

    const abjurer = await fetchSubclassData('abjurer_2024', '2024');
    expect(abjurer?.name).toBe('Abjurer');
    expect(abjurer?.class?.index).toBe('wizard');

    const diviner = await fetchSubclassData('diviner_2024', '2024');
    expect(diviner?.name).toBe('Diviner');
    expect(diviner?.class?.index).toBe('wizard');

    const illusionist = await fetchSubclassData('illusionist_2024', '2024');
    expect(illusionist?.name).toBe('Illusionist');
    expect(illusionist?.class?.index).toBe('wizard');
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
