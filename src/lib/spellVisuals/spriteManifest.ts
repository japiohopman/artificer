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
  spells_level1_01: {
    id: 'spells_level1_01',
    path: '/assets/atlas/spell/sprites/spells_level1_01.webp',
    grid: SPELL_SPRITE_SHEET_GRID,
    aspectRatio: '1:1',
    level: 1,
    description: '1st-Level Standard Combat Spells'
  }
};

/**
 * Authoritative Canonical Spell Asset Manifest.
 * Maps `spell.<canonical_id>` to status ('READY' | 'PLANNED' | 'MISSING'),
 * image path (standalone or sheet crop coordinates), and fallbackVisualId.
 */
export const SPELL_SPRITE_MANIFEST: Record<string, SpellSpriteCellMapping> = {
  // READY standalone webp images matching actual files in public/assets/atlas/spell/images/
  'spell.acid_arrow': { visualId: 'spell.acid_arrow', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/acid_arrow.webp', school: 'evocation' },
  'spell.acid_splash': { visualId: 'spell.acid_splash', level: 0, status: 'READY', standalonePath: '/assets/atlas/spell/images/acid_splash.webp', school: 'conjuration' },
  'spell.aid': { visualId: 'spell.aid', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/aid.webp', school: 'abjuration' },
  'spell.alarm': { visualId: 'spell.alarm', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/alarm.webp', school: 'abjuration' },
  'spell.alter_self': { visualId: 'spell.alter_self', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/alter_self.webp', school: 'transmutation' },
  'spell.animal_friendship': { visualId: 'spell.animal_friendship', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/animal_friendship.webp', school: 'enchantment' },
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
  'spell.bane': { visualId: 'spell.bane', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/bane.webp', school: 'enchantment' },
  'spell.banishment': { visualId: 'spell.banishment', level: 4, status: 'READY', standalonePath: '/assets/atlas/spell/images/banishment.webp', school: 'abjuration' },
  'spell.barkskin': { visualId: 'spell.barkskin', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/barkskin.webp', school: 'transmutation' },
  'spell.beacon_of_hope': { visualId: 'spell.beacon_of_hope', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/beacon_of_hope.webp', school: 'abjuration' },
  'spell.bestow_curse': { visualId: 'spell.bestow_curse', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/bestow_curse.webp', school: 'necromancy' },
  'spell.black_tentacles': { visualId: 'spell.black_tentacles', level: 4, status: 'READY', standalonePath: '/assets/atlas/spell/images/black_tentacles.webp', school: 'conjuration' },
  'spell.blade_barrier': { visualId: 'spell.blade_barrier', level: 6, status: 'READY', standalonePath: '/assets/atlas/spell/images/blade_barrier.webp', school: 'evocation' },
  'spell.bless': { visualId: 'spell.bless', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/bless.webp', school: 'enchantment' },
  'spell.blight': { visualId: 'spell.blight', level: 4, status: 'READY', standalonePath: '/assets/atlas/spell/images/blight.webp', school: 'necromancy' },
  'spell.blindness_deafness': { visualId: 'spell.blindness_deafness', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/blindness_deafness.webp', school: 'necromancy' },
  'spell.blink': { visualId: 'spell.blink', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/blink.webp', school: 'transmutation' },
  'spell.blur': { visualId: 'spell.blur', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/blur.webp', school: 'illusion' },
  'spell.branding_smite': { visualId: 'spell.branding_smite', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/branding_smite.webp', school: 'evocation' },
  'spell.burning_hands': { visualId: 'spell.burning_hands', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/burning_hands.webp', school: 'evocation' },
  'spell.call_lightning': { visualId: 'spell.call_lightning', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/call_lightning.webp', school: 'conjuration' },
  'spell.calm_emotions': { visualId: 'spell.calm_emotions', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/calm_emotions.webp', school: 'enchantment' },
  'spell.chain_lightning': { visualId: 'spell.chain_lightning', level: 6, status: 'READY', standalonePath: '/assets/atlas/spell/images/chain_lightning.webp', school: 'evocation' },
  'spell.charm_person': { visualId: 'spell.charm_person', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/charm_person.webp', school: 'enchantment' },
  'spell.chill_touch': { visualId: 'spell.chill_touch', level: 0, status: 'READY', standalonePath: '/assets/atlas/spell/images/chill_touch.webp', school: 'necromancy' },
  'spell.circle_of_death': { visualId: 'spell.circle_of_death', level: 6, status: 'READY', standalonePath: '/assets/atlas/spell/images/circle_of_death.webp', school: 'necromancy' },
  'spell.clairvoyance': { visualId: 'spell.clairvoyance', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/clairvoyance.webp', school: 'divination' },
  'spell.clone': { visualId: 'spell.clone', level: 8, status: 'READY', standalonePath: '/assets/atlas/spell/images/clone.webp', school: 'necromancy' },
  'spell.cloudkill': { visualId: 'spell.cloudkill', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/cloudkill.webp', school: 'conjuration' },
  'spell.color_spray': { visualId: 'spell.color_spray', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/color_spray.webp', school: 'illusion' },
  'spell.command': { visualId: 'spell.command', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/command.webp', school: 'enchantment' },
  'spell.commune': { visualId: 'spell.commune', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/commune.webp', school: 'divination' },
  'spell.commune_with_nature': { visualId: 'spell.commune_with_nature', level: 5, status: 'READY', standalonePath: '/assets/atlas/spell/images/commune_with_nature.webp', school: 'divination' },
  'spell.comprehend_languages': { visualId: 'spell.comprehend_languages', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/comprehend_languages.webp', school: 'divination' },
  'spell.cure_wounds': { visualId: 'spell.cure_wounds', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/cure_wounds.webp', school: 'evocation' },
  'spell.fireball': { visualId: 'spell.fireball', level: 3, status: 'READY', standalonePath: '/assets/atlas/spell/images/fireball.webp', school: 'evocation' },
  'spell.magic_missile': { visualId: 'spell.magic_missile', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/magic_missile.webp', school: 'evocation' },
  'spell.shield': { visualId: 'spell.shield', level: 1, status: 'READY', standalonePath: '/assets/atlas/spell/images/shield.webp', school: 'abjuration' },
  'spell.misty_step': { visualId: 'spell.misty_step', level: 2, status: 'READY', standalonePath: '/assets/atlas/spell/images/misty_step.webp', school: 'conjuration' },

  // PLANNED spells with explicit fallbackVisualId (No fake sprite coordinates assigned)
  'spell.absorb_elements': { visualId: 'spell.absorb_elements', level: 1, status: 'PLANNED', fallbackVisualId: 'spell.shield', school: 'abjuration' },
  'spell.catapult': { visualId: 'spell.catapult', level: 1, status: 'PLANNED', fallbackVisualId: 'spell.magic_missile', school: 'transmutation' },
  'spell.tashas_caustic_brew': { visualId: 'spell.tashas_caustic_brew', level: 1, status: 'PLANNED', fallbackVisualId: 'spell.acid_splash', school: 'evocation' },
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
