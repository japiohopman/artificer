import { FeatureOption, extractOptionsFromFeature, getChoiceLimit } from './atlasUtils';

/**
 * Shared utility for D&D 5e character progression logic.
 * Unifies logic for Character Creation (Level 1) and Level Up (Level 2+).
 */

export interface ProgressionChoices {
  features: any[];
  skillChoices: { choose: number; from: string[] }[];
  toolChoices: { choose: number; from: string[] }[];
  languageChoices: { choose: number; from: string[] }[];
  spellsGained?: number;
  cantripsGained?: number;
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
