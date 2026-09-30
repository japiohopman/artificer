import { FeatureOption, extractOptionsFromFeature, getChoiceLimit } from './atlasUtils';
import { atlasService } from '../services/atlasService';

/**
 * Shared utility for D&D 5e character progression logic.
 * Unifies logic for Character Creation (Level 1) and Level Up (Level 2+).
 */

export interface ActiveLevelUpSession {
  characterId: string;
  targetLevel: number;
  features: any[]; // Target-level granted class and subclass features
  hasASI: boolean;
  hpIncrease: number; // default fixed HP increase
  hpMethod: 'fixed' | 'roll';
  rolledHpValue: number | null;
  choices: Record<string, string[]>; // featureIndex -> array of selected option indices
  statIncreases: Record<string, number>; // stat -> allocated points (e.g. { str: 1, dex: 1 })
  subclassChoice?: string;
  validationError?: string | null;
}

export interface ProgressionChoices {
  features: any[];
  skillChoices: { choose: number; from: string[] }[];
  toolChoices: { choose: number; from: string[] }[];
  languageChoices: { choose: number; from: string[] }[];
  spellsGained?: number;
  cantripsGained?: number;
}

export const CUMULATIVE_XP_TABLE: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000
};

export function getLevelFromXP(xp: number): number {
  if (!xp || xp < 0) return 1;
  let level = 1;
  for (let l = 1; l <= 20; l++) {
    if (xp >= CUMULATIVE_XP_TABLE[l]) {
      level = l;
    } else {
      break;
    }
  }
  return level;
}

export function getXpForLevel(level: number): number {
  const target = Math.min(Math.max(1, level), 20);
  return CUMULATIVE_XP_TABLE[target] || 0;
}

export function isEligibleForLevelUp(character: any): boolean {
  if (!character) return false;
  const currentLevel = character.level || 0;
  if (currentLevel >= 20) return false;
  const xpLevel = getLevelFromXP(character.xp || 0);
  return xpLevel > currentLevel;
}

export function getNextLevelTarget(character: any): number | null {
  if (!isEligibleForLevelUp(character)) return null;
  return (character.level || 0) + 1;
}

/**
 * Prepares the level-up session for a character targeting exactly level + 1.
 * Loads class/subclass features granted explicitly at the target level.
 */
export async function evaluateNextLevelStep(
  character: any,
  ruleset?: '2014' | '2024'
): Promise<ActiveLevelUpSession | null> {
  if (!character || !character.class) return null;
  const targetLevel = getNextLevelTarget(character);
  if (!targetLevel) return null;

  const activeRuleset = ruleset || character.ruleset || '2014';
  const levelData = await atlasService.loadLevelData(character.class, targetLevel, activeRuleset);
  if (!levelData) return null;

  const classData = await atlasService.loadClass(character.class, activeRuleset);
  const hitDie = classData?.hit_die || 8;
  const conMod = Math.floor(((character.stats?.con || 10) - 10) / 2);
  const fixedHpGain = Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);

  // Load class features granted at target level
  const rawClassFeatures = levelData.features || [];
  const classFeatures = await Promise.all(
    rawClassFeatures.map(async (f: any) => {
      const details = await atlasService.loadFeature(f.index);
      return details ? { ...f, ...details } : f;
    })
  );

  // Load subclass features granted at target level if character already has subclass
  let subclassFeatures: any[] = [];
  if (character.subclass) {
    const subData = await atlasService.loadSubclass(character.subclass, activeRuleset);
    if (subData?.subclass_levels) {
      const levelGroup = subData.subclass_levels.find((l: any) => l.level === targetLevel);
      if (levelGroup?.features) {
        subclassFeatures = await Promise.all(
          levelGroup.features.map(async (f: any) => {
            const details = await atlasService.loadFeature(f.index);
            return details ? { ...f, ...details } : f;
          })
        );
      }
    }
  }

  const allFeatures = [...classFeatures, ...subclassFeatures];

  // Determine if target level grants Ability Score Improvement
  let hasASI = allFeatures.some((f: any) =>
    f.index?.toLowerCase().includes('ability_score_improvement') ||
    f.name?.toLowerCase().includes('ability score improvement')
  );

  if (!hasASI && levelData.ability_score_bonuses !== undefined) {
    if (targetLevel === 1) {
      hasASI = levelData.ability_score_bonuses > 0;
    } else {
      const prevLevelData = await atlasService.loadLevelData(character.class, targetLevel - 1, activeRuleset);
      const prevBonuses = prevLevelData?.ability_score_bonuses || 0;
      hasASI = levelData.ability_score_bonuses > prevBonuses;
    }
  }

  return {
    characterId: character.id,
    targetLevel,
    features: allFeatures,
    hasASI,
    hpIncrease: fixedHpGain,
    hpMethod: 'fixed',
    rolledHpValue: null,
    choices: {},
    statIncreases: {},
    subclassChoice: undefined,
    validationError: null
  };
}

/**
 * Validates whether the active level-up session satisfies all requirements for the target level.
 * Performs fail-closed validation.
 */
export function validateLevelUpCommit(
  session: ActiveLevelUpSession,
  character: any
): { valid: boolean; reason?: string } {
  if (!session || !character) {
    return { valid: false, reason: 'Invalid progression session or character state.' };
  }

  // 1. ASI Validation
  if (session.hasASI) {
    const totalPointsSpent = Object.values(session.statIncreases || {}).reduce(
      (sum, val) => sum + (val || 0),
      0
    );
    if (totalPointsSpent < 2) {
      return {
        valid: false,
        reason: 'Ability Score Improvement requires spending all 2 points.'
      };
    }
  }

  // 2. Feature Choice Validation
  for (const feature of session.features || []) {
    const limit = getChoiceLimit(feature);
    const isSubclassFeatureChoice =
      feature.feature_specific?.subfeature_options?.type === 'subclass' ||
      feature.index?.toLowerCase().includes('martial_archetype') ||
      feature.index?.toLowerCase().includes('subclass');

    if (limit > 0 && !isSubclassFeatureChoice) {
      const selections = session.choices?.[feature.index] || [];
      if (selections.length < limit) {
        return {
          valid: false,
          reason: `Selection required: ${feature.name || 'Feature Specialty'} requires ${limit} choice(s).`
        };
      }
    }

    if (isSubclassFeatureChoice) {
      const selections = session.choices?.[feature.index] || [];
      const selectedSubclass = session.subclassChoice || selections[0];
      if (!selectedSubclass && !character.subclass) {
        return {
          valid: false,
          reason: `Subclass selection required for ${feature.name || 'Archetype'}.`
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Extracts all choices available at a specific level for a given class.
 */
export function getChoicesForLevel(levelData: any, featureDetails: any[]): ProgressionChoices {
  const features: any[] = [];
  const skillChoices: { choose: number; from: string[] }[] = [];
  const toolChoices: { choose: number; from: string[] }[] = [];
  const languageChoices: { choose: number; from: string[] }[] = [];

  // 1. Process Class Proficiency Choices (usually at level 1)
  if (levelData?.proficiency_choices) {
    levelData.proficiency_choices.forEach((choice: any) => {
      const options = choice.from?.options || choice.from || [];
      const from = options.map((o: any) => o.name?.replace('Skill: ', '') || o.index || o);

      if (choice.type === 'proficiencies' || (choice.from?.option_set_type === 'proficiencies')) {
        if (from.some((s: string) => s.toLowerCase().includes('skill'))) {
          skillChoices.push({ choose: choice.choose, from: from.map((s: string) => s.replace('Skill: ', '')) });
        } else {
          toolChoices.push({ choose: choice.choose, from });
        }
      }
    });
  }

  // 2. Process Feature Choices
  featureDetails.forEach(feat => {
    const options = extractOptionsFromFeature(feat);
    const limit = getChoiceLimit(feat);

    if (options.length > 0 && limit > 0) {
      features.push({
        ...feat,
        availableOptions: options,
        selectionLimit: limit
      });
    }
  });

  return {
    features,
    skillChoices,
    toolChoices,
    languageChoices,
  };
}

/**
 * Filter out already possessed proficiencies from choices.
 */
export function filterChoices(choices: string[], possessed: string[]): string[] {
  const possessedLower = possessed.map(p => p.toLowerCase());
  return choices.filter(c => !possessedLower.includes(c.toLowerCase()));
}

/**
 * Check if a character has spellcasting at a given level.
 */
export function hasSpellcasting(classData: any, level: number): boolean {
  if (!classData?.spellcasting) return false;
  return true;
}
