import { FeatureOption, extractOptionsFromFeature, getChoiceLimit } from './atlasUtils';
import { getLevelFromXP, CLASS_DATA } from './characterUtils';

/**
 * Shared utility for D&D 5e character progression logic.
 * Unifies logic for Character Creation (Level 1) and Level Up (Level 2+).
 */

export interface ActiveLevelUpSession {
  characterId: string;
  currentLevel: number;
  targetLevel: number;
  classHitDie: number;
  features: any[];
  hpIncrease: number;
  hasASI: boolean;
  levelData?: any;
}

export interface LevelUpCommitPayload {
  characterId: string;
  targetLevel: number;
  finalHpGain: number;
  stats?: Record<string, number>;
  choices?: Record<string, any>;
  features?: any[];
  subclass?: string;
}

export interface ProgressionChoices {
  features: any[];
  skillChoices: { choose: number; from: string[] }[];
  toolChoices: { choose: number; from: string[] }[];
  languageChoices: { choose: number; from: string[] }[];
  spellsGained?: number;
  cantripsGained?: number;
}

/**
 * Evaluates the next single level progression step (currentLevel -> currentLevel + 1)
 * without mutating canonical character state.
 */
export async function evaluateNextLevelStep(character: any): Promise<ActiveLevelUpSession | null> {
  if (!character) return null;

  const currentLevel = character.level || 1;
  const eligibleLevel = getLevelFromXP(character.xp || 0);

  if (eligibleLevel <= currentLevel) {
    return null;
  }

  const targetLevel = currentLevel + 1;
  const { atlasService } = await import('../services/atlasService');
  const classData = await atlasService.loadClass(character.class, character.ruleset);

  // Fail-closed ruleset boundary: enforce classData resolution when ruleset is specified
  let hitDie: number | undefined = classData?.hit_die;
  if (!hitDie && !character.ruleset) {
    hitDie = CLASS_DATA[character.class]?.hitDie;
  }

  if (!hitDie) {
    return null;
  }

  const levelData = await atlasService.loadLevelData(character.class, targetLevel, character.ruleset);
  if (!levelData) {
    return null;
  }

  const features = levelData.features || [];
  const hasASI = (levelData.ability_score_bonuses || 0) > 0;

  const conModifier = Math.floor(((character.stats?.con || 10) - 10) / 2);
  const hpIncrease = Math.max(1, Math.floor(hitDie / 2) + 1 + conModifier);

  return {
    characterId: character.id,
    currentLevel,
    targetLevel,
    classHitDie: hitDie,
    features,
    hpIncrease,
    hasASI,
    levelData
  };
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
    // Some classes might gain spellcasting at later levels (e.g. Paladin/Ranger at 2)
    // But usually the presence of spellcasting object in class data is enough for Lvl 1 check
    return true;
}
