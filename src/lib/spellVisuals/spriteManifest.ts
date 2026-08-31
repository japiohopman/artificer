import {
  SpellSpriteSheetDefinition,
  SpellSpriteCellMapping
} from './types';

/**
 * Standard 4x4 Grid definition for spell sprite sheets.
 */
export const SPELL_SPRITE_SHEET_GRID = { rows: 4, cols: 4 };

/**
 * Registry of declared spell sprite sheets.
 */
export const SPELL_SPRITE_SHEETS: Record<string, SpellSpriteSheetDefinition> = {
  cantrips_01: {
    id: 'cantrips_01',
    path: '/assets/atlas/spell/sprites/cantrips_01.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 0,
    description: 'Cantrips & Evocation/Utility Orbs'
  },
  cantrips_sheet_01: {
    id: 'cantrips_sheet_01',
    path: '/assets/atlas/spell/sprites/cantrips_sheet_01.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 0,
    description: 'Primary Cantrips Spritesheet 01'
  },
  cantrips_sheet_02: {
    id: 'cantrips_sheet_02',
    path: '/assets/atlas/spell/sprites/cantrips_sheet_02.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 0,
    description: 'Primary Cantrips Spritesheet 02'
  },
  spells_level1_01: {
    id: 'spells_level1_01',
    path: '/assets/atlas/spell/sprites/spells_level1_01.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 1,
    description: '1st-Level Standard Combat Spells'
  },
  spells_level1_sheet_01: {
    id: 'spells_level1_sheet_01',
    path: '/assets/atlas/spell/sprites/spells_level1_sheet_01.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 1,
    description: '1st-Level Spells Sheet 01'
  },
  spells_level1_sheet_02: {
    id: 'spells_level1_sheet_02',
    path: '/assets/atlas/spell/sprites/spells_level1_sheet_02.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 1,
    description: '1st-Level Spells Sheet 02'
  },
  spells_level1_sheet_03: {
    id: 'spells_level1_sheet_03',
    path: '/assets/atlas/spell/sprites/spells_level1_sheet_03.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 1,
    description: '1st-Level Spells Sheet 03'
  },
  spells_level1_sheet_04: {
    id: 'spells_level1_sheet_04',
    path: '/assets/atlas/spell/sprites/spells_level1_sheet_04.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 1,
    description: '1st-Level Spells Sheet 04'
  }
};

/**
 * Authoritative Canonical Spell Asset Manifest.
 * Maps `spell.<canonical_id>` to status ('READY' | 'PLANNED' | 'MISSING'),
 * image path (standalone or sheet crop coordinates), and fallbackVisualId.
 */
export const SPELL_SPRITE_MANIFEST: Record<string, SpellSpriteCellMapping> = {
  // --- CANTRIPS SHEET 01 ---
  'spell.acid_splash': { visualId: 'spell.acid_splash', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 0, col: 0, school: 'conjuration' },
  'spell.chill_touch': { visualId: 'spell.chill_touch', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 0, col: 1, school: 'necromancy' },
  'spell.dancing_lights': { visualId: 'spell.dancing_lights', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 0, col: 2, school: 'evocation' },
  'spell.druidcraft': { visualId: 'spell.druidcraft', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 0, col: 3, school: 'transmutation' },
  'spell.eldritch_blast': { visualId: 'spell.eldritch_blast', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 1, col: 0, school: 'evocation' },
  'spell.fire_bolt': { visualId: 'spell.fire_bolt', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 1, col: 1, school: 'evocation' },
  'spell.guidance': { visualId: 'spell.guidance', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 1, col: 2, school: 'divination' },
  'spell.light': { visualId: 'spell.light', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 1, col: 3, school: 'evocation' },
  'spell.mage_hand': { visualId: 'spell.mage_hand', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 2, col: 0, school: 'conjuration' },
  'spell.mending': { visualId: 'spell.mending', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 2, col: 1, school: 'transmutation' },
  'spell.message': { visualId: 'spell.message', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 2, col: 2, school: 'transmutation' },
  'spell.minor_illusion': { visualId: 'spell.minor_illusion', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 2, col: 3, school: 'illusion' },
  'spell.poison_spray': { visualId: 'spell.poison_spray', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 3, col: 0, school: 'conjuration' },
  'spell.prestidigitation': { visualId: 'spell.prestidigitation', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 3, col: 1, school: 'transmutation' },
  'spell.produce_flame': { visualId: 'spell.produce_flame', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 3, col: 2, school: 'conjuration' },
  'spell.ray_of_frost': { visualId: 'spell.ray_of_frost', level: 0, status: 'READY', sheetId: 'cantrips_sheet_01', row: 3, col: 3, school: 'evocation' },

  // --- CANTRIPS SHEET 02 ---
  'spell.resistance': { visualId: 'spell.resistance', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 0, col: 0, school: 'abjuration' },
  'spell.sacred_flame': { visualId: 'spell.sacred_flame', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 0, col: 1, school: 'evocation' },
  'spell.shillelagh': { visualId: 'spell.shillelagh', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 0, col: 2, school: 'transmutation' },
  'spell.shocking_grasp': { visualId: 'spell.shocking_grasp', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 0, col: 3, school: 'evocation' },
  'spell.spare_the_dying': { visualId: 'spell.spare_the_dying', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 1, col: 0, school: 'necromancy' },
  'spell.thaumaturgy': { visualId: 'spell.thaumaturgy', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 1, col: 1, school: 'transmutation' },
  'spell.thorn_whip': { visualId: 'spell.thorn_whip', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 1, col: 2, school: 'transmutation' },
  'spell.true_strike': { visualId: 'spell.true_strike', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 1, col: 3, school: 'divination' },
  'spell.vicious_mockery': { visualId: 'spell.vicious_mockery', level: 0, status: 'READY', sheetId: 'cantrips_sheet_02', row: 2, col: 0, school: 'enchantment' },

  // --- LEVEL 1 SPELLS SHEET 01 ---
  'spell.absorb_elements': { visualId: 'spell.absorb_elements', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 0, col: 0, school: 'abjuration' },
  'spell.alarm': { visualId: 'spell.alarm', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 0, col: 1, school: 'abjuration' },
  'spell.animal_friendship': { visualId: 'spell.animal_friendship', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 0, col: 2, school: 'enchantment' },
  'spell.bane': { visualId: 'spell.bane', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 0, col: 3, school: 'enchantment' },
  'spell.bless': { visualId: 'spell.bless', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 1, col: 0, school: 'enchantment' },
  'spell.burning_hands': { visualId: 'spell.burning_hands', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 1, col: 1, school: 'evocation' },
  'spell.catapult': { visualId: 'spell.catapult', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 1, col: 2, school: 'transmutation' },
  'spell.charm_person': { visualId: 'spell.charm_person', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 1, col: 3, school: 'enchantment' },
  'spell.color_spray': { visualId: 'spell.color_spray', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 2, col: 0, school: 'illusion' },
  'spell.command': { visualId: 'spell.command', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 2, col: 1, school: 'enchantment' },
  'spell.comprehend_languages': { visualId: 'spell.comprehend_languages', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 2, col: 2, school: 'divination' },
  'spell.create_or_destroy_water': { visualId: 'spell.create_or_destroy_water', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 2, col: 3, school: 'transmutation' },
  'spell.cure_wounds': { visualId: 'spell.cure_wounds', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 3, col: 0, school: 'evocation' },
  'spell.detect_evil_and_good': { visualId: 'spell.detect_evil_and_good', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 3, col: 1, school: 'divination' },
  'spell.detect_magic': { visualId: 'spell.detect_magic', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 3, col: 2, school: 'divination' },
  'spell.detect_poison_and_disease': { visualId: 'spell.detect_poison_and_disease', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_01', row: 3, col: 3, school: 'divination' },

  // --- LEVEL 1 SPELLS SHEET 02 ---
  'spell.disguise_self': { visualId: 'spell.disguise_self', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 0, col: 0, school: 'illusion' },
  'spell.divine_favor': { visualId: 'spell.divine_favor', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 0, col: 1, school: 'evocation' },
  'spell.entangle': { visualId: 'spell.entangle', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 0, col: 2, school: 'conjuration' },
  'spell.expeditious_retreat': { visualId: 'spell.expeditious_retreat', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 0, col: 3, school: 'transmutation' },
  'spell.faerie_fire': { visualId: 'spell.faerie_fire', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 1, col: 0, school: 'evocation' },
  'spell.false_life': { visualId: 'spell.false_life', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 1, col: 1, school: 'necromancy' },
  'spell.feather_fall': { visualId: 'spell.feather_fall', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 1, col: 2, school: 'transmutation' },
  'spell.find_familiar': { visualId: 'spell.find_familiar', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 1, col: 3, school: 'conjuration' },
  'spell.floating_disk': { visualId: 'spell.floating_disk', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 2, col: 0, school: 'conjuration' },
  'spell.fog_cloud': { visualId: 'spell.fog_cloud', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 2, col: 1, school: 'conjuration' },
  'spell.goodberry': { visualId: 'spell.goodberry', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 2, col: 2, school: 'transmutation' },
  'spell.grease': { visualId: 'spell.grease', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 2, col: 3, school: 'conjuration' },
  'spell.guiding_bolt': { visualId: 'spell.guiding_bolt', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 3, col: 0, school: 'evocation' },
  'spell.healing_word': { visualId: 'spell.healing_word', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 3, col: 1, school: 'evocation' },
  'spell.hellish_rebuke': { visualId: 'spell.hellish_rebuke', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 3, col: 2, school: 'evocation' },
  'spell.heroism': { visualId: 'spell.heroism', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_02', row: 3, col: 3, school: 'enchantment' },

  // --- LEVEL 1 SPELLS SHEET 03 ---
  'spell.hideous_laughter': { visualId: 'spell.hideous_laughter', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 0, col: 0, school: 'enchantment' },
  'spell.hunters_mark': { visualId: 'spell.hunters_mark', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 0, col: 1, school: 'divination' },
  'spell.identify': { visualId: 'spell.identify', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 0, col: 2, school: 'divination' },
  'spell.illusory_script': { visualId: 'spell.illusory_script', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 0, col: 3, school: 'illusion' },
  'spell.inflict_wounds': { visualId: 'spell.inflict_wounds', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 1, col: 0, school: 'necromancy' },
  'spell.jump': { visualId: 'spell.jump', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 1, col: 1, school: 'transmutation' },
  'spell.longstrider': { visualId: 'spell.longstrider', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 1, col: 2, school: 'transmutation' },
  'spell.mage_armor': { visualId: 'spell.mage_armor', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 1, col: 3, school: 'abjuration' },
  'spell.magic_missile': { visualId: 'spell.magic_missile', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 2, col: 0, school: 'evocation' },
  'spell.protection_from_evil_and_good': { visualId: 'spell.protection_from_evil_and_good', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 2, col: 1, school: 'abjuration' },
  'spell.purify_food_and_drink': { visualId: 'spell.purify_food_and_drink', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 2, col: 2, school: 'transmutation' },
  'spell.sanctuary': { visualId: 'spell.sanctuary', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 2, col: 3, school: 'abjuration' },
  'spell.shield': { visualId: 'spell.shield', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 3, col: 0, school: 'abjuration' },
  'spell.shield_of_faith': { visualId: 'spell.shield_of_faith', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 3, col: 1, school: 'abjuration' },
  'spell.silent_image': { visualId: 'spell.silent_image', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 3, col: 2, school: 'illusion' },
  'spell.sleep': { visualId: 'spell.sleep', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_03', row: 3, col: 3, school: 'enchantment' },

  // --- LEVEL 1 SPELLS SHEET 04 ---
  'spell.speak_with_animals': { visualId: 'spell.speak_with_animals', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_04', row: 0, col: 0, school: 'divination' },
  'spell.tashas_caustic_brew': { visualId: 'spell.tashas_caustic_brew', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_04', row: 0, col: 1, school: 'evocation' },
  'spell.thunderwave': { visualId: 'spell.thunderwave', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_04', row: 0, col: 2, school: 'evocation' },
  'spell.unseen_servant': { visualId: 'spell.unseen_servant', level: 1, status: 'READY', sheetId: 'spells_level1_sheet_04', row: 0, col: 3, school: 'conjuration' },

  // Other READY standalone webp images matching actual files in public/assets/atlas/spell/images/
  'spell.acid_arrow': { visualId: 'spell.acid_arrow', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/acid_arrow.webp', school: 'evocation' },
  'spell.aid': { visualId: 'spell.aid', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/aid.webp', school: 'abjuration' },
  'spell.alter_self': { visualId: 'spell.alter_self', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/alter_self.webp', school: 'transmutation' },
  'spell.animal_messenger': { visualId: 'spell.animal_messenger', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/animal_messenger.webp', school: 'enchantment' },
  'spell.animal_shapes': { visualId: 'spell.animal_shapes', level: 8, status: 'READY', standalonePath: '/assets/atlas/spell/images/animal_shapes.webp', school: 'transmutation' },
  'spell.animate_dead': { visualId: 'spell.animate_dead', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/animate_dead.webp', school: 'necromancy' },
  'spell.animate_objects': { visualId: 'spell.animate_objects', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/animate_objects.webp', school: 'transmutation' },
  'spell.antilife_shell': { visualId: 'spell.antilife_shell', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/antilife_shell.webp', school: 'abjuration' },
  'spell.antimagic_field': { visualId: 'spell.antimagic_field', level: 8, status: 'READY', standalonePath: '/assets/atlas/spell/images/antimagic_field.webp', school: 'abjuration' },
  'spell.antipathy_sympathy': { visualId: 'spell.antipathy_sympathy', level: 8, status: 'READY', standalonePath: '/assets/atlas/spell/images/antipathy_sympathy.webp', school: 'enchantment' },
  'spell.arcane_eye': { visualId: 'spell.arcane_eye', level: 4, status: 'READY', standalonePath: '/assets/atlas/spell/images/arcane_eye.webp', school: 'divination' },
  'spell.arcane_hand': { visualId: 'spell.arcane_hand', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/arcane_hand.webp', school: 'evocation' },
  'spell.arcane_lock': { visualId: 'spell.arcane_lock', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/arcane_lock.webp', school: 'abjuration' },
  'spell.arcane_sword': { visualId: 'spell.arcane_sword', level: 7, status: 'READY', standalonePath: '/assets/atlas/spell/images/arcane_sword.webp', school: 'evocation' },
  'spell.arcanists_magic_aura': { visualId: 'spell.arcanists_magic_aura', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/arcanists_magic_aura.webp', school: 'illusion' },
  'spell.astral_projection': { visualId: 'spell.astral_projection', level: 9, status: 'READY', standalonePath: '/assets/atlas/spell/images/astral_projection.webp', school: 'necromancy' },
  'spell.augury': { visualId: 'spell.augury', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/augury.webp', school: 'divination' },
  'spell.awaken': { visualId: 'spell.awaken', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/awaken.webp', school: 'transmutation' },
  'spell.banishment': { visualId: 'spell.banishment', level: 4, status: 'READY', standalonePath: '/assets/atlas/spell/images/banishment.webp', school: 'abjuration' },
  'spell.barkskin': { visualId: 'spell.barkskin', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/barkskin.webp', school: 'transmutation' },
  'spell.beacon_of_hope': { visualId: 'spell.beacon_of_hope', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/beacon_of_hope.webp', school: 'abjuration' },
  'spell.bestow_curse': { visualId: 'spell.bestow_curse', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/bestow_curse.webp', school: 'necromancy' },
  'spell.black_tentacles': { visualId: 'spell.black_tentacles', level: 4, status: 'READY', standalonePath: '/assets/atlas/spell/images/black_tentacles.webp', school: 'conjuration' },
  'spell.blade_barrier': { visualId: 'spell.blade_barrier', level: 6, status: 'READY', standalonePath: '/assets/atlas/spell/images/blade_barrier.webp', school: 'evocation' },
  'spell.blight': { visualId: 'spell.blight', level: 4, status: 'READY', standalonePath: '/assets/atlas/spell/images/blight.webp', school: 'necromancy' },
  'spell.blindness_deafness': { visualId: 'spell.blindness_deafness', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/blindness_deafness.webp', school: 'necromancy' },
  'spell.blink': { visualId: 'spell.blink', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/blink.webp', school: 'transmutation' },
  'spell.blur': { visualId: 'spell.blur', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/blur.webp', school: 'illusion' },
  'spell.branding_smite': { visualId: 'spell.branding_smite', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/branding_smite.webp', school: 'evocation' },
  'spell.call_lightning': { visualId: 'spell.call_lightning', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/call_lightning.webp', school: 'conjuration' },
  'spell.calm_emotions': { visualId: 'spell.calm_emotions', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/calm_emotions.webp', school: 'enchantment' },
  'spell.chain_lightning': { visualId: 'spell.chain_lightning', level: 6, status: 'READY', standalonePath: '/assets/atlas/spell/images/chain_lightning.webp', school: 'evocation' },
  'spell.circle_of_death': { visualId: 'spell.circle_of_death', level: 6, status: 'READY', standalonePath: '/assets/atlas/spell/images/circle_of_death.webp', school: 'necromancy' },
  'spell.clairvoyance': { visualId: 'spell.clairvoyance', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/clairvoyance.webp', school: 'divination' },
  'spell.clone': { visualId: 'spell.clone', level: 8, status: 'READY', standalonePath: '/assets/atlas/spell/images/clone.webp', school: 'necromancy' },
  'spell.cloudkill': { visualId: 'spell.cloudkill', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/cloudkill.webp', school: 'conjuration' },
  'spell.commune': { visualId: 'spell.commune', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/commune.webp', school: 'divination' },
  'spell.commune_with_nature': { visualId: 'spell.commune_with_nature', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/commune_with_nature.webp', school: 'divination' },
  'spell.fireball': { visualId: 'spell.fireball', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/fireball.webp', school: 'evocation' },
  'spell.misty_step': { visualId: 'spell.misty_step', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/misty_step.webp', school: 'conjuration' },

  // PLANNED spells with explicit fallbackVisualId
  'spell.arms_of_hadar': { visualId: 'spell.arms_of_hadar', level: 1, status: 'PLANNED', fallbackVisualId: 'spell.inflict_wounds', school: 'conjuration' },
  'spell.hex': { visualId: 'spell.hex', level: 1, status: 'PLANNED', fallbackVisualId: 'spell.bane', school: 'enchantment' },
};

/**
 * Returns sheet definition by ID.
 */
export function getSpellSpriteSheetDefinition(sheetId: string): SpellSpriteSheetDefinition | undefined {
  return SPELL_SPRITE_SHEETS[sheetId];
}

/**
 * Look up cell mapping for a given visual ID.
 */
export function getSpellSpriteCellForVisual(visualId: string): SpellSpriteCellMapping | undefined {
  return SPELL_SPRITE_MANIFEST[visualId];
}

/**
 * Returns all manifest mappings.
 */
export function getAllSpellManifestMappings(): SpellSpriteCellMapping[] {
  return Object.values(SPELL_SPRITE_MANIFEST);
}
