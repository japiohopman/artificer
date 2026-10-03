import { extractStructuredOptionsFromFeature, getChoiceLimit } from './atlasUtils';
import { Character } from '../store/useCharacterStore';
import { fetchSubclassesList, fetchFeatsList, fetchFeatData } from '../services/storageService';

export interface ActiveLevelUpSession {
  characterId: string;
  targetLevel: number;
  features: any[];
  classHitDie: number;
  hpRollResult: number;
  hpIncrease: number;
  hasASI: boolean;
  asiMode?: 'asi' | 'feat';
  statIncreases: Record<string, number>;
  featChoice?: string;
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

export function evaluateFeatPrerequisites(
  character: Character,
  featData: any,
  targetLevel?: number
): { eligible: boolean; reason?: string } {
  if (!featData || !featData.prerequisites || !Array.isArray(featData.prerequisites) || featData.prerequisites.length === 0) {
    return { eligible: true };
  }

  const effectiveLevel = targetLevel ?? (character.level + 1);

  const getStat = (statName: string): number => {
    const key = statName.toLowerCase().slice(0, 3) as keyof Character['stats'];
    return character.stats?.[key] ?? 10;
  };

  const statMap: Record<string, string> = {
    strength: 'str',
    dexterity: 'dex',
    constitution: 'con',
    intelligence: 'int',
    wisdom: 'wis',
    charisma: 'cha'
  };

  for (const prereq of featData.prerequisites) {
    if (typeof prereq === 'string') {
      const trimmed = prereq.trim();

      // String Pattern 1: "Level N+"
      const levelMatch = trimmed.match(/^level\s+(\d+)\+/i);
      if (levelMatch) {
        const minLevel = parseInt(levelMatch[1], 10);
        if (effectiveLevel < minLevel) {
          return { eligible: false, reason: `Requires character level ${minLevel}+ (current: ${effectiveLevel}).` };
        }
        continue;
      }

      // String Pattern 2: Ability score requirement, e.g., "Charisma 13+", "Strength or Dexterity 13+", "Intelligence, Wisdom, or Charisma 13+"
      const statMatch = trimmed.match(/^([A-Za-z,\s]+)\s+(\d+)\+/i);
      if (statMatch) {
        const statsStr = statMatch[1];
        const minVal = parseInt(statMatch[2], 10);
        const statsToTest = statsStr
          .split(/,\s*|\s+or\s+/i)
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);

        const meetsStat = statsToTest.some(s => {
          const abbr = statMap[s] || s.slice(0, 3);
          const currentVal = (character.stats as any)?.[abbr] ?? 10;
          return currentVal >= minVal;
        });

        if (!meetsStat) {
          return { eligible: false, reason: `Requires ${statsStr} ${minVal}+.` };
        }
        continue;
      }

      // String Pattern 3: Spellcasting feature requirement
      if (trimmed.toLowerCase().includes('spellcasting') || trimmed.toLowerCase().includes('pact magic') || trimmed.toLowerCase().includes('ability to cast at least one spell')) {
        const spellcasterClasses = ['wizard', 'cleric', 'druid', 'bard', 'sorcerer', 'paladin', 'ranger', 'warlock', 'artificer'];
        const isCasterClass = spellcasterClasses.includes((character.class || '').toLowerCase());
        const hasKnownSpells = Array.isArray(character.knownSpells) && character.knownSpells.length > 0;
        if (!isCasterClass && !hasKnownSpells) {
          return { eligible: false, reason: 'Requires Spellcasting or Pact Magic feature.' };
        }
        continue;
      }

      // String Pattern 4: Armor / Shield Training
      if (trimmed.toLowerCase().includes('armor training') || trimmed.toLowerCase().includes('shield training')) {
        const reqStr = trimmed.toLowerCase();
        const profs = (character.proficiencies || []).map(p => (typeof p === 'string' ? p : p.name || p.index || '').toLowerCase());
        let met = false;

        if (reqStr.includes('light armor')) {
          met = profs.some(p => p.includes('light armor') || p.includes('light_armor') || p === 'light');
        } else if (reqStr.includes('medium armor')) {
          met = profs.some(p => p.includes('medium armor') || p.includes('medium_armor') || p === 'medium');
        } else if (reqStr.includes('heavy armor')) {
          met = profs.some(p => p.includes('heavy armor') || p.includes('heavy_armor') || p === 'heavy');
        } else if (reqStr.includes('shield')) {
          met = profs.some(p => p.includes('shield'));
        }

        if (!met) {
          return { eligible: false, reason: `Requires ${trimmed}.` };
        }
        continue;
      }

      // String Pattern 5: Fighting Style Feature
      if (trimmed.toLowerCase().includes('fighting style')) {
        const hasFightingStyle = (character.features || []).some(f => (f.name || f.index || '').toLowerCase().includes('fighting_style') || (f.name || '').toLowerCase().includes('fighting style'));
        if (!hasFightingStyle) {
          return { eligible: false, reason: 'Requires Fighting Style Feature.' };
        }
        continue;
      }
    } else if (typeof prereq === 'object' && prereq !== null) {
      // Structured 2014 object prerequisites
      if (prereq.stat === 'level') {
        const minLvl = prereq.value || 1;
        if (effectiveLevel < minLvl) {
          return { eligible: false, reason: `Requires level ${minLvl}+.` };
        }
      } else if (prereq.stat === 'species') {
        const charSpecies = (character.race || '').toLowerCase().replace(/[\s-]/g, '_');
        if (Array.isArray(prereq.value)) {
          if (!prereq.value.some((val: string) => charSpecies.includes(val.toLowerCase()))) {
            return { eligible: false, reason: `Requires species ${prereq.value.join('/')}.` };
          }
        } else if (typeof prereq.value === 'string') {
          if (!charSpecies.includes(prereq.value.toLowerCase())) {
            return { eligible: false, reason: `Requires species ${prereq.value}.` };
          }
        }
      } else if (prereq.stat && statMap[prereq.stat.toLowerCase()]) {
        const val = getStat(prereq.stat);
        const reqVal = prereq.value || 13;
        if (val < reqVal) {
          return { eligible: false, reason: `Requires ${prereq.stat} ${reqVal}+.` };
        }
      } else if (prereq.stat === 'spellcasting') {
        const spellcasterClasses = ['wizard', 'cleric', 'druid', 'bard', 'sorcerer', 'paladin', 'ranger', 'warlock', 'artificer'];
        const isCasterClass = spellcasterClasses.includes((character.class || '').toLowerCase());
        const hasKnownSpells = Array.isArray(character.knownSpells) && character.knownSpells.length > 0;
        if (!isCasterClass && !hasKnownSpells) {
          return { eligible: false, reason: 'Requires Spellcasting feature.' };
        }
      }
    }
  }

  return { eligible: true };
}

export async function fetchAsiEligibleFeats(
  ruleset?: '2014' | '2024',
  character?: Character,
  targetLevel?: number
): Promise<{ name: string; index: string; category?: string }[]> {
  const activeRuleset = ruleset || character?.ruleset || '2014';
  const categoryFilter = activeRuleset === '2024' ? 'general' : undefined;

  const allFeats = await fetchFeatsList(activeRuleset, categoryFilter);
  // Exclude canonical ability_score_improvement from selectable Feat replacement set
  const nonAsiFeats = allFeats.filter(f => f.index.toLowerCase() !== 'ability_score_improvement');

  if (!character) return nonAsiFeats;

  const { atlasService } = await import('../services/atlasService');

  const eligibleFeats: { name: string; index: string; category?: string }[] = [];
  for (const featSummary of nonAsiFeats) {
    const featData = await atlasService.loadFeat(featSummary.index, activeRuleset);
    if (!featData) continue;

    // Strict 2024 rule: ASI replacement strictly allows General feats
    if (activeRuleset === '2024' && featData.category && featData.category !== 'general') {
      continue;
    }

    const prereqEval = evaluateFeatPrerequisites(character, featData, targetLevel);
    if (prereqEval.eligible) {
      eligibleFeats.push(featSummary);
    }
  }

  return eligibleFeats;
}

export async function resolveLevelUpFeatures(
  character: Character,
  targetLevel: number,
  subclassChoice?: string
): Promise<any[]> {
  const { atlasService } = await import('../services/atlasService');

  const levelData = await atlasService.loadLevelData(character.class, targetLevel, character.ruleset);
  if (!levelData) return [];

  const rawFeatures = levelData.features || [];
  const fullFeatures: any[] = await Promise.all(
    rawFeatures.map(async (f: any) => {
      const details = await atlasService.loadFeature(f.index);
      return details ? { ...f, ...details } : f;
    })
  );

  const effectiveSubclass = character.subclass || subclassChoice;
  if (effectiveSubclass) {
    const subData = await atlasService.loadSubclass(effectiveSubclass, character.ruleset);
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

  return fullFeatures;
}

export async function evaluateNextLevelStep(character: Character, overrideSubclassChoice?: string): Promise<ActiveLevelUpSession | null> {
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

  const fullFeatures = await resolveLevelUpFeatures(character, targetLevel, overrideSubclassChoice);

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
    asiMode: 'asi',
    statIncreases: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    choices: {},
    subclassChoice: overrideSubclassChoice || character.subclass,
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
  const canonicalStep = await evaluateNextLevelStep(character, session.subclassChoice);
  if (!canonicalStep) {
    return { valid: false, reason: 'Failed to evaluate canonical level-up step for validation.' };
  }

  // Synchronize session features if subclass choice newly populated subclass features
  if (session.subclassChoice && session.features.length < canonicalStep.features.length) {
    session.features = canonicalStep.features;
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
    if (session.asiMode === 'feat' || session.featChoice) {
      if (!session.featChoice || session.featChoice.trim() === '') {
        return { valid: false, reason: 'A feat must be selected when Feat choice is active.' };
      }

        if (session.featChoice.toLowerCase() === 'ability_score_improvement') {
          return { valid: false, reason: 'Ability Score Improvement cannot be selected as a Feat choice.' };
        }

      const { atlasService } = await import('../services/atlasService');
      const featData = await atlasService.loadFeat(session.featChoice, character.ruleset);
      if (!featData) {
        return { valid: false, reason: `Selected feat "${session.featChoice}" could not be loaded from canonical Atlas.` };
      }

      // Check feat category for 2024 ruleset (ASI replacement strictly allows general feats)
      if (character.ruleset === '2024') {
        if (featData.category && featData.category !== 'general') {
          return { valid: false, reason: `Feat "${featData.name || session.featChoice}" (category: ${featData.category}) is not eligible for ASI replacement in 2024 ruleset.` };
        }
      }

      // Check prerequisites
      const prereqEval = evaluateFeatPrerequisites(character, featData, session.targetLevel);
      if (!prereqEval.eligible) {
        return { valid: false, reason: `Character does not meet prerequisites for feat "${featData.name || session.featChoice}": ${prereqEval.reason}` };
      }

      const pointsAllocated = Object.values(session.statIncreases || {}).reduce((a, b) => a + (b || 0), 0);
      if (pointsAllocated !== 0) {
        return { valid: false, reason: 'Stat increases must be 0 when selecting a Feat.' };
      }
    } else {
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
  } else if (session.subclassChoice && session.subclassChoice !== character.subclass) {
    return { valid: false, reason: `subclassChoice "${session.subclassChoice}" provided but target level does not grant a subclass.` };
  }

  return { valid: true };
}
