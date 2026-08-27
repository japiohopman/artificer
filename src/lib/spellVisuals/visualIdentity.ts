import { SpellVisualIdentityResolution } from './types';

/**
 * Common spell index/name alias mappings to canonical spell keys.
 */
const SPELL_ALIASES: Record<string, string> = {
  'acid-arrow': 'acid_arrow',
  'melfs-acid-arrow': 'acid_arrow',
  'acid-splash': 'acid_splash',
  'alter-self': 'alter_self',
  'animal-friendship': 'animal_friendship',
  'animal-messenger': 'animal_messenger',
  'animal-shapes': 'animal_shapes',
  'animate-dead': 'animate_dead',
  'animate-objects': 'animate_objects',
  'antilife-shell': 'antilife_shell',
  'antimagic-field': 'antimagic_field',
  'antipathy-sympathy': 'antipathy_sympathy',
  'arcane-eye': 'arcane_eye',
  'arcane-hand': 'arcane_hand',
  'bigbys-hand': 'arcane_hand',
  'arcane-lock': 'arcane_lock',
  'arcane-sword': 'arcane_sword',
  'mordenkainens-sword': 'arcane_sword',
  'arcanists-magic-aura': 'arcanists_magic_aura',
  'nystuls-magic-aura': 'arcanists_magic_aura',
  'astral-projection': 'astral_projection',
  'beacon-of-hope': 'beacon_of_hope',
  'bestow-curse': 'bestow_curse',
  'black-tentacles': 'black_tentacles',
  'evards-black-tentacles': 'black_tentacles',
  'blade-barrier': 'blade_barrier',
  'blindness-deafness': 'blindness_deafness',
  'branding-smite': 'branding_smite',
  'burning-hands': 'burning_hands',
  'call-lightning': 'call_lightning',
  'calm-emotions': 'calm_emotions',
  'chain-lightning': 'chain_lightning',
  'charm-person': 'charm_person',
  'chill-touch': 'chill_touch',
  'circle-of-death': 'circle_of_death',
  'color-spray': 'color_spray',
  'commune-with-nature': 'commune_with_nature',
  'comprehend-languages': 'comprehend_languages',
  'cone-of-cold': 'cone_of_cold',
  'conjure-animals': 'conjure_animals',
  'conjure-celestial': 'conjure_celestial',
  'conjure-elemental': 'conjure_elemental',
  'conjure-fey': 'conjure_fey',
  'conjure-minor-elementals': 'conjure_minor_elementals',
  'conjure-woodland-beings': 'conjure_woodland_beings',
  'contact-other-plane': 'contact_other_plane',
  'continual-flame': 'continual_flame',
  'control-water': 'control_water',
  'control-weather': 'control_weather',
  'create-food-and-water': 'create_food_and_water',
  'create-or-destroy-water': 'create_or_destroy_water',
  'create-undead': 'create_undead',
  'cure-wounds': 'cure_wounds',
  'dancing-lights': 'dancing_lights',
  'darkness': 'darkness',
  'darkvision': 'darkvision',
  'daylight': 'daylight',
  'death-ward': 'death_ward',
  'delayed-blast-fireball': 'delayed_blast_fireball',
  'detect-evil-and-good': 'detect_evil_and_good',
  'detect-magic': 'detect_magic',
  'detect-poison-and-disease': 'detect_poison_and_disease',
  'detect-thoughts': 'detect_thoughts',
  'dimension-door': 'dimension_door',
  'disguise-self': 'disguise_self',
  'dispel-evil-and-good': 'dispel_evil_and_good',
  'dispel-magic': 'dispel_magic',
  'divine-favor': 'divine_favor',
  'divine-word': 'divine_word',
  'dominate-beast': 'dominate_beast',
  'dominate-monster': 'dominate_monster',
  'dominate-person': 'dominate_person',
  'eldritch-blast': 'eldritch_blast',
  'enhance-ability': 'enhance_ability',
  'enlarge-reduce': 'enlarge_reduce',
  'expeditious-retreat': 'expeditious_retreat',
  'faerie-fire': 'faerie_fire',
  'faithful-hound': 'faithful_hound',
  'false-life': 'false_life',
  'feather-fall': 'feather_fall',
  'find-familiar': 'find_familiar',
  'find-steed': 'find_steed',
  'find-the-path': 'find_the_path',
  'find-traps': 'find_traps',
  'finger-of-death': 'finger_of_death',
  'fire-bolt': 'fire_bolt',
  'fire-shield': 'fire_shield',
  'fire-storm': 'fire_storm',
  'flame-blade': 'flame_blade',
  'flame-strike': 'flame_strike',
  'flaming-sphere': 'flaming_sphere',
  'flesh-to-stone': 'flesh_to_stone',
  'floating-disk': 'floating_disk',
  'fog-cloud': 'fog_cloud',
  'freedom-of-movement': 'freedom_of_movement',
  'freezing-sphere': 'freezing_sphere',
  'gaseous-form': 'gaseous_form',
  'gentle-repose': 'gentle_repose',
  'giant-insect': 'giant_insect',
  'globe-of-invulnerability': 'globe_of_invulnerability',
  'glyph-of-warding': 'glyph_of_warding',
  'greater-invisibility': 'greater_invisibility',
  'greater-restoration': 'greater_restoration',
  'guardian-of-faith': 'guardian_of_faith',
  'guards-and-wards': 'guards_and_wards',
  'guiding-bolt': 'guiding_bolt',
  'gust-of-wind': 'gust_of_wind',
  'hallucinatory-terrain': 'hallucinatory_terrain',
  'healing-word': 'healing_word',
  'heat-metal': 'heat_metal',
  'hellish-rebuke': 'hellish_rebuke',
  'heroes-feast': 'heroes_feast',
  'hideous-laughter': 'hideous_laughter',
  'tashas-hideous-laughter': 'hideous_laughter',
  'hold-monster': 'hold_monster',
  'hold-person': 'hold_person',
  'holy-aura': 'holy_aura',
  'hunters-mark': 'hunters_mark',
  'hypnotic-pattern': 'hypnotic_pattern',
  'ice-storm': 'ice_storm',
  'illusory-script': 'illusory_script',
  'incendiary-cloud': 'incendiary_cloud',
  'inflict-wounds': 'inflict_wounds',
  'insect-plague': 'insect_plague',
  'instant-summons': 'instant_summons',
  'irresistible-dance': 'irresistible_dance',
  'lesser-restoration': 'lesser_restoration',
  'lightning-bolt': 'lightning_bolt',
  'locate-animals-or-plants': 'locate_animals_or_plants',
  'locate-creature': 'locate_creature',
  'locate-object': 'locate_object',
  'mage-armor': 'mage_armor',
  'mage-hand': 'mage_hand',
  'magic-circle': 'magic_circle',
  'magic-jar': 'magic_jar',
  'magic-missile': 'magic_missile',
  'magic-mouth': 'magic_mouth',
  'magic-weapon': 'magic_weapon',
  'magnificent-mansion': 'magnificent_mansion',
  'major-image': 'major_image',
  'mass-cure-wounds': 'mass_cure_wounds',
  'mass-heal': 'mass_heal',
  'mass-healing-word': 'mass_healing_word',
  'mass-suggestion': 'mass_suggestion',
  'meld-into-stone': 'meld_into_stone',
  'meteor-swarm': 'meteor_swarm',
  'mind-blank': 'mind_blank',
  'minor-illusion': 'minor_illusion',
  'mirage-arcane': 'mirage_arcane',
  'mirror-image': 'mirror_image',
  'misty-step': 'misty_step',
  'modify-memory': 'modify_memory',
  'move-earth': 'move_earth',
  'pass-without-trace': 'pass_without_trace',
  'phantasmal-killer': 'phantasmal_killer',
  'phantom-steed': 'phantom_steed',
  'planar-ally': 'planar_ally',
  'planar-binding': 'planar_binding',
  'plane-shift': 'plane_shift',
  'plant-growth': 'plant_growth',
  'poison-spray': 'poison_spray',
  'power-word-kill': 'power_word_kill',
  'power-word-stun': 'power_word_stun',
  'prayer-of-healing': 'prayer_of_healing',
  'prismatic-spray': 'prismatic_spray',
  'prismatic-wall': 'prismatic_wall',
  'private-sanctum': 'private_sanctum',
  'produce-flame': 'produce_flame',
  'programmed-illusion': 'programmed_illusion',
  'project-image': 'project_image',
  'protection-from-energy': 'protection_from_energy',
  'protection-from-evil-and-good': 'protection_from_evil_and_good',
  'protection-from-poison': 'protection_from_poison',
  'purify-food-and-drink': 'purify_food_and_drink',
  'raise-dead': 'raise_dead',
  'ray-of-enfeeblement': 'ray_of_enfeeblement',
  'ray-of-frost': 'ray_of_frost',
  'remove-curse': 'remove_curse',
  'resilient-sphere': 'resilient_sphere',
  'reverse-gravity': 'reverse_gravity',
  'rope-trick': 'rope_trick',
  'sacred-flame': 'sacred_flame',
  'scorching-ray': 'scorching_ray',
  'secret-chest': 'secret_chest',
  'see-invisibility': 'see_invisibility',
  'shapechange': 'shapechange',
  'shield-of-faith': 'shield_of_faith',
  'shocking-grasp': 'shocking_grasp',
  'silent-image': 'silent_image',
  'sleet-storm': 'sleet_storm',
  'spare-the-dying': 'spare_the_dying',
  'speak-with-animals': 'speak_with_animals',
  'speak-with-dead': 'speak_with_dead',
  'speak-with-plants': 'speak_with_plants',
  'spider-climb': 'spider_climb',
  'spike-growth': 'spike_growth',
  'spirit-guardians': 'spirit_guardians',
  'spiritual-weapon': 'spiritual_weapon',
  'stinking-cloud': 'stinking_cloud',
  'stone-shape': 'stone_shape',
  'storm-of-vengeance': 'storm_of_vengeance',
  'tashas-caustic-brew': 'tashas_caustic_brew',
  'telepathic-bond': 'telepathic_bond',
  'teleportation-circle': 'teleportation_circle',
  'thorn-whip': 'thorn_whip',
  'time-stop': 'time_stop',
  'tiny-hut': 'tiny_hut',
  'transport-via-plants': 'transport_via_plants',
  'tree-stride': 'tree_stride',
  'true-polymorph': 'true_polymorph',
  'true-resurrection': 'true_resurrection',
  'true-seeing': 'true_seeing',
  'true-strike': 'true_strike',
  'unseen-servant': 'unseen_servant',
  'vampiric-touch': 'vampiric_touch',
  'vicious-mockery': 'vicious_mockery',
  'wall-of-fire': 'wall_of_fire',
  'wall-of-force': 'wall_of_force',
  'wall-of-ice': 'wall_of_ice',
  'wall-of-stone': 'wall_of_stone',
  'wall-of-thorns': 'wall_of_thorns',
  'warding-bond': 'warding_bond',
  'water-breathing': 'water_breathing',
  'water-walk': 'water_walk',
  'wind-walk': 'wind_walk',
  'wind-wall': 'wind_wall',
  'word-of-recall': 'word_of_recall',
  'zone-of-truth': 'zone_of_truth',
};

const RULESET_SPECIFIC_SPELL_VISUALS = new Set<string>([]);

/**
 * Normalizes any spell identifier (index, slug, filename, or object) into a canonical key.
 */
export function normalizeCanonicalSpellId(spellInput: string | { index?: string; id?: string; name?: string }): string {
  let raw = '';
  if (typeof spellInput === 'string') {
    raw = spellInput;
  } else if (spellInput && typeof spellInput === 'object') {
    raw = spellInput.index || spellInput.id || spellInput.name || '';
  }

  if (!raw) return 'unknown_spell';

  let clean = raw.toLowerCase().trim();
  clean = clean.split('/').pop() || clean;
  clean = clean.replace(/\.json$/, '').replace(/\.webp$/, '');

  if (SPELL_ALIASES[clean]) {
    return SPELL_ALIASES[clean];
  }

  const underscore = clean.replace(/-/g, '_');
  if (SPELL_ALIASES[underscore]) {
    return SPELL_ALIASES[underscore];
  }

  return underscore;
}

/**
 * Resolves any spell reference into a canonical VisualIdentity string (e.g., `spell.magic_missile`).
 */
export function resolveSpellVisualIdentity(
  spellInput: string | { index?: string; id?: string; name?: string },
  ruleset?: '2014' | '2024'
): string {
  const canonicalId = normalizeCanonicalSpellId(spellInput);
  const isCustomRuleset = ruleset && RULESET_SPECIFIC_SPELL_VISUALS.has(`${canonicalId}_${ruleset}`);
  const visualKey = isCustomRuleset ? `${canonicalId}_${ruleset}` : canonicalId;

  return `spell.${visualKey}`;
}

/**
 * Detailed resolution helper returning metadata.
 */
export function resolveSpellVisualIdentityDetails(
  spellInput: string | { index?: string; id?: string; name?: string },
  ruleset?: '2014' | '2024'
): SpellVisualIdentityResolution {
  const canonicalId = normalizeCanonicalSpellId(spellInput);
  const visualId = resolveSpellVisualIdentity(spellInput, ruleset);
  const isCustomRulesetVisual = visualId.endsWith('_2014') || visualId.endsWith('_2024');

  return {
    visualId,
    canonicalId,
    isCustomRulesetVisual,
  };
}
