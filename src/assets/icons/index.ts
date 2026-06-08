import { CORE_ICONS } from './core';
import { UI_ICONS } from './ui';
import { ATTACK_ICONS } from './attacks';
import { EQUIPMENT_ICONS } from './equipment';
import { DAMAGE_TYPE_ICONS } from './damage_types';
import { CONDITION_ICONS } from './conditions';
import { CREATURE_TYPE_ICONS } from './creatures';
import { CLASS_ICONS } from './classes';
import { RACE_ICONS } from './races';
import { DICE_ICONS } from './dice';
import { CHARACTER_ICONS } from './character';
import { NAVIGATION_ICONS } from './navigation';
import { LOGISTICS_ICONS } from './logistics';
import { POUCH_ICONS } from './pouch';
import { ARCANE_CODEX_ICONS } from './arcane_codex';
import { ATLAS_ICONS } from './atlas';
import { fightingStyleIcons } from './fighting_styles';
import { abilityScoreIcons } from './ability_score';
import { skillIcons } from './skill';

/**
 * @deprecated Use tactical imports from specific icon files instead of ALL_ICONS
 * to reduce bundle size.
 */
export const ALL_ICONS = {
  ...CORE_ICONS,
  ...UI_ICONS,
  ...ATTACK_ICONS,
  ...EQUIPMENT_ICONS,
  ...DAMAGE_TYPE_ICONS,
  ...CONDITION_ICONS,
  ...CREATURE_TYPE_ICONS,
  ...CLASS_ICONS,
  ...RACE_ICONS,
  ...DICE_ICONS,
  ...CHARACTER_ICONS,
  ...NAVIGATION_ICONS,
  ...LOGISTICS_ICONS,
  ...POUCH_ICONS,
  ...ARCANE_CODEX_ICONS,
  ...ATLAS_ICONS,
  ...fightingStyleIcons,
  ...abilityScoreIcons,
  ...skillIcons,
};

export {
  CORE_ICONS,
  UI_ICONS,
  ATTACK_ICONS,
  EQUIPMENT_ICONS,
  DAMAGE_TYPE_ICONS,
  CONDITION_ICONS,
  CREATURE_TYPE_ICONS,
  CLASS_ICONS,
  RACE_ICONS,
  DICE_ICONS,
  CHARACTER_ICONS,
  NAVIGATION_ICONS,
  LOGISTICS_ICONS,
  POUCH_ICONS,
  ARCANE_CODEX_ICONS,
  ATLAS_ICONS,
  fightingStyleIcons,
  abilityScoreIcons,
  skillIcons,
};
