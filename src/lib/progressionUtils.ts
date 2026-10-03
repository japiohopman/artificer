import { extractStructuredOptionsFromFeature, getChoiceLimit } from './atlasUtils';
import { Character } from '../store/useCharacterStore';
import { fetchSubclassesList } from '../services/storageService';

export interface ActiveLevelUpSession {
  characterId: string;
  targetLevel: number;
  features: any[];
  classHitDie: number;
  hpRollResult: number;
  hpIncrease: number;
  hasASI: boolean;
  statIncreases: Record<string, number>;
  choices: Record<string, string[]>;
  subclassChoice?: string;
  hpMethod: 'roll' | 'fixed';
  validationError?: string | null;
}

export function getXpForLevel(level: number): number {
  const xpTable: Record<number, number> = {
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
    15: 161000,
    16: 185000,
    17: 210000,
    18: 245000,
    19: 265000,
    20: 305000
  };
  return xpTable[level] ?? 0;
}

export function getLevelFromXP(xp: number): number {
  for (let level = 20; level >= 1; level--) {
    if (xp >= getXpForLevel(level)) {
      return level;
    }
  }
  return 1;
}

export function isEligibleForLevelUp(character?: Partial<Character> | null): boolean {
  if (!character || character.level === undefined || character.level >= 20) return false;
  const targetLevel = character.level + 1;
  const requiredXp = getXpForLevel(targetLevel);
  return (character.xp || 0) >= requiredXp;
}

export function getNextLevelTarget(character?: Partial<Character> | null): number | null {
  if (!character || !isEligibleForLevelUp(character) || character.level === undefined) return null;
  return character.level + 1;
}

export async function evaluateNextLevelStep(character: Character): Promise<ActiveLevelUpSession | null> {
  if (!isEligibleForLevelUp(character)) return null;

  const targetLevel = character.level + 1;
  const { atlasService } = await import('../services/atlasService');

  const [classData, levelData, prevLevelData] = await Promise.all([
    atlasService.loadClass(character.class, character.ruleset),
    atlasService.loadLevelData(character.class, targetLevel, character.ruleset),
    targetLevel > 1 ? atlasService.loadLevelData(character.class, targetLevel - 1, character.ruleset) : null
  ]);

  if (!levelData) {
    return null;
  }

  const rawFeatures = levelData.features || [];
  const fullFeatures = await Promise.all(
    rawFeatures.map(async (f: any) => {
      const details = await atlasService.loadFeature(f.index);
      return details ? { ...f, ...details } : f;
    })
  );

  // If character already has a subclass, load target level subclass features
  if (character.subclass) {
    const subData = await atlasService.loadSubclass(character.subclass, character.ruleset);
    if (subData && Array.isArray(subData.subclass_levels)) {
      const targetSubGroup = subData.subclass_levels.find((l: any) => l.level === targetLevel);
      if (targetSubGroup?.features) {
        const fullSubFeatures = await Promise.all(
          targetSubGroup.features.map(async (f: any) => {
            const details = await atlasService.loadFeature(f.index);
            return details ? { ...f, ...details, source: 'Subclass' } : { ...f, source: 'Subclass' };
          })
        );
        fullSubFeatures.forEach(sf => {
          if (!fullFeatures.some(f => f.index === sf.index)) {
            fullFeatures.push(sf);
          }
        });
      }
    }
  }

  const conModifier = Math.floor(((character.stats?.con || 10) - 10) / 2);
  const classHitDie = classData?.hit_die || levelData.hit_die || 8;
  const defaultHpRollResult = Math.floor(classHitDie / 2) + 1;
  const defaultHpGain = Math.max(1, defaultHpRollResult + conModifier);

  const prevAsiCount = prevLevelData?.ability_score_bonuses || 0;
  const currentAsiCount = levelData.ability_score_bonuses || 0;

  const hasASI = fullFeatures.some(f =>
    f.index === 'ability_score_improvement' ||
    f.index?.includes('ability_score_improvement') ||
    f.feature_specific?.asi === true
  ) || (currentAsiCount > prevAsiCount);

  return {
    characterId: character.id,
    targetLevel,
    features: fullFeatures,
    classHitDie,
    hpRollResult: defaultHpRollResult,
    hpIncrease: defaultHpGain,
    hasASI,
    statIncreases: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    choices: {},
    hpMethod: 'roll',
    validationError: null
  };
}

export async function validateLevelUpCommit(character: Character, session: ActiveLevelUpSession): Promise<{ valid: boolean; reason?: string }> {
  if (!character || !session) {
    return { valid: false, reason: 'Invalid character or level-up session context.' };
  }

  if (session.characterId !== character.id) {
    return { valid: false, reason: 'Session character ID mismatch.' };
  }

  if (session.targetLevel !== character.level + 1) {
    return { valid: false, reason: `Target level ${session.targetLevel} does not match character level ${character.level} + 1.` };
  }

  // Re-evaluating expected canonical step to guard against mutated/tampered session state
  const canonicalStep = await evaluateNextLevelStep(character);
  if (!canonicalStep) {
    return { valid: false, reason: 'Failed to evaluate canonical level-up step for validation.' };
  }

  const totalCon = (character.stats?.con || 10) + (session.statIncreases?.con || 0);
  const conModifier = Math.floor((totalCon - 10) / 2);
  if (session.classHitDie !== canonicalStep.classHitDie) {
    return { valid: false, reason: `Class hit die d${session.classHitDie} does not match canonical class hit die d${canonicalStep.classHitDie}.` };
  }

  if (session.hpMethod === 'fixed') {
    const expectedFixedHp = Math.max(1, Math.floor(canonicalStep.classHitDie / 2) + 1 + conModifier);
    if (session.hpIncrease !== expectedFixedHp) {
      return { valid: false, reason: `Fixed HP increase ${session.hpIncrease} does not match expected average HP increase ${expectedFixedHp}.` };
    }
  } else {
    if (typeof session.hpRollResult !== 'number' || session.hpRollResult < 1 || session.hpRollResult > canonicalStep.classHitDie) {
      return { valid: false, reason: `Invalid HP roll result ${session.hpRollResult} for d${canonicalStep.classHitDie}.` };
    }
    const expectedRolledHp = Math.max(1, session.hpRollResult + conModifier);
    if (session.hpIncrease !== expectedRolledHp) {
      return { valid: false, reason: `HP increase ${session.hpIncrease} does not match calculated roll ${session.hpRollResult} + CON mod ${conModifier} (min 1 = ${expectedRolledHp}).` };
    }
  }

  if (session.hasASI !== canonicalStep.hasASI) {
    return { valid: false, reason: `ASI grant state does not match canonical level-up target.` };
  }

  // Exact 1:1 multiset comparison of session feature indices against canonical feature indices
  const canonicalFeatureIndices = canonicalStep.features.map(f => f.index).sort();
  const sessionFeatureIndices = session.features.map(f => f.index).sort();

  if (canonicalFeatureIndices.length !== sessionFeatureIndices.length) {
    return { valid: false, reason: `Session feature count (${sessionFeatureIndices.length}) does not match canonical target feature count (${canonicalFeatureIndices.length}).` };
  }

  for (let i = 0; i < canonicalFeatureIndices.length; i++) {
    if (canonicalFeatureIndices[i] !== sessionFeatureIndices[i]) {
      return { valid: false, reason: `Session features do not match canonical level ${session.targetLevel} grants exactly.` };
    }
  }

  // Reject choice keys in session.choices that do not correspond to any feature in session.features
  for (const choiceKey of Object.keys(session.choices || {})) {
    if (!sessionFeatureIndices.includes(choiceKey)) {
      return { valid: false, reason: `Choice key "${choiceKey}" does not belong to any feature granted at level ${session.targetLevel}.` };
    }
  }

  if (session.hasASI) {
    const validStatKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    let pointsAllocated = 0;
    for (const [statKey, inc] of Object.entries(session.statIncreases || {})) {
      if (!validStatKeys.includes(statKey)) {
        return { valid: false, reason: `Invalid stat key "${statKey}" in ASI allocation.` };
      }
      if (typeof inc !== 'number' || inc < 0 || inc > 2) {
        return { valid: false, reason: `Invalid ASI point increment ${inc} for ${statKey}.` };
      }
      const currentVal = (character.stats as any)[statKey] || 10;
      if (currentVal + inc > 20) {
        return { valid: false, reason: `Attribute ${statKey.toUpperCase()} cannot exceed 20.` };
      }
      pointsAllocated += inc;
    }

    if (pointsAllocated !== 2) {
      return { valid: false, reason: `Ability Score Improvement requires allocating exactly 2 points (currently allocated: ${pointsAllocated}).` };
    }
  }

  // Validate feature choices and subclass choice coherence
  let subclassFeatureKey: string | null = null;
  for (const feat of session.features) {
    const limit = getChoiceLimit(feat);
    const selected = session.choices?.[feat.index] || [];

    if (limit > 0 && selected.length < limit) {
      return { valid: false, reason: `Feature "${feat.name}" requires selecting ${limit} option(s).` };
    }

    const isSubclassChoice = feat.feature_specific?.subfeature_options?.type === 'subclass';
    if (isSubclassChoice) {
      subclassFeatureKey = feat.index;
      if (selected.length > 0) {
        const chosenSubclass = selected[0];
        const allowedSubclasses = await fetchSubclassesList(character.ruleset, character.class);
        const isValidSubclass = allowedSubclasses.some((s: any) => s.index.toLowerCase() === chosenSubclass.toLowerCase());
        if (!isValidSubclass) {
          return { valid: false, reason: `Subclass "${chosenSubclass}" is not a valid subclass option for class ${character.class}.` };
        }
      }
    } else {
      // Enforce strict structured option extraction (ignoring prose @UUID fallback)
      const availableOptions = extractStructuredOptionsFromFeature(feat);
      if (availableOptions.length > 0) {
        const validIndices = availableOptions.map(o => o.index);
        for (const sel of selected) {
          if (!validIndices.includes(sel)) {
            return { valid: false, reason: `Selected option "${sel}" is not a valid choice for feature "${feat.name}".` };
          }
        }
      }
    }
  }

  // Validate subclassChoice coherence with session.choices
  if (subclassFeatureKey) {
    const selectedSubInChoices = session.choices?.[subclassFeatureKey]?.[0];
    if (session.subclassChoice && session.subclassChoice !== selectedSubInChoices) {
      return { valid: false, reason: `Mismatched subclassChoice "${session.subclassChoice}" vs selected choice "${selectedSubInChoices}".` };
    }
    if (selectedSubInChoices && session.subclassChoice !== selectedSubInChoices) {
      return { valid: false, reason: `Subclass selection "${selectedSubInChoices}" is not synchronized with subclassChoice.` };
    }
  } else if (session.subclassChoice) {
    return { valid: false, reason: `subclassChoice "${session.subclassChoice}" provided but target level does not grant a subclass.` };
  }

  return { valid: true };
}
