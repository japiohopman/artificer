import { UI_ICONS } from './ui';
// Icon system index - Refactored for consistency
import { ATTACK_ICONS } from './attacks';
import { EQUIPMENT_ICONS } from './equipment';
import { DAMAGE_TYPE_ICONS } from './damage_types';
import { CONDITION_ICONS } from './conditions';
import { CREATURE_TYPE_ICONS } from './creatures';
import { DICE_ICONS } from './dice';
import { CHARACTER_ICONS } from './character';
import { POUCH_ICONS } from './pouch';
import { MATERIALS_ICONS } from './materials';
import { WORLD_ATLAS_ICONS } from './world_atlas';
import { ABILITY_SCORE_ICONS } from './ability_score_icons';
import { SKILL_ICONS } from './skill_icons';
import { FEAT_ICONS } from './feats';
import { FEATURE_ICONS } from './features';
import { TRAIT_ICONS } from './traits';
import { MAGIC_SCHOOL_ICONS } from './magic_schools';
import { ACTION_ICONS } from './actions';
import { SUBCLASS_ICONS } from './subclasses';
import { STAT_COMPARISON_ICONS } from './stat_comparison';
import { EDITOR_ICONS } from './editor';
import { MUSICAL_INSTRUMENT_ICONS } from './musical_instruments';
import { BOOK_READER_ICONS } from './book_reader';
import { TAROT_ICONS } from './tarot';
import { EQUIPMENT_DOLL } from './equipment_doll';
import { MINI_GAME_ICONS } from './mini_game_icons';

/**
 * @deprecated Use tactical imports from specific icon files instead of ALL_ICONS
 * to reduce bundle size.
 */
export const ALL_ICONS = {
  ...UI_ICONS,
  ...ATTACK_ICONS,
  ...EQUIPMENT_ICONS,
  ...DAMAGE_TYPE_ICONS,
  ...CONDITION_ICONS,
  ...CREATURE_TYPE_ICONS,
  ...DICE_ICONS,
  ...CHARACTER_ICONS,
  ...POUCH_ICONS,
  ...EDITOR_ICONS,
  ...WORLD_ATLAS_ICONS,
  ...ABILITY_SCORE_ICONS,
  ...SKILL_ICONS,
  ...FEAT_ICONS,
  ...FEATURE_ICONS,
  ...TRAIT_ICONS,
  ...MAGIC_SCHOOL_ICONS,
  ...ACTION_ICONS,
  ...SUBCLASS_ICONS,
  ...STAT_COMPARISON_ICONS,
  ...MATERIALS_ICONS,
  ...MUSICAL_INSTRUMENT_ICONS,
  ...BOOK_READER_ICONS,
  ...TAROT_ICONS,
  ...EQUIPMENT_DOLL,
  ...MINI_GAME_ICONS,
};

export {
  UI_ICONS,
  ATTACK_ICONS,
  EQUIPMENT_ICONS,
  DAMAGE_TYPE_ICONS,
  CONDITION_ICONS,
  CREATURE_TYPE_ICONS,
  DICE_ICONS,
  CHARACTER_ICONS,
  POUCH_ICONS,
  EDITOR_ICONS,
  WORLD_ATLAS_ICONS,
  ABILITY_SCORE_ICONS,
  SKILL_ICONS,
  FEAT_ICONS,
  FEATURE_ICONS,
  TRAIT_ICONS,
  MAGIC_SCHOOL_ICONS,
  ACTION_ICONS,
  SUBCLASS_ICONS,
  STAT_COMPARISON_ICONS,
  MATERIALS_ICONS,
  MUSICAL_INSTRUMENT_ICONS,
  BOOK_READER_ICONS,
  TAROT_ICONS,
  EQUIPMENT_DOLL,
  MINI_GAME_ICONS,
};
