/**
 * Utility functions for validating and calculating 2024 Background ability score allocations.
 */

export type BackgroundAbilityScoreAllocations = Record<string, number>;

export interface ValidationResult {
  valid: boolean;
  mode: 'A (+2/+1)' | 'B (+1/+1/+1)' | 'invalid';
  reason?: string;
}

/**
 * Normalizes an array of string choices (e.g. ['int', 'int', 'wis']) or an object map into a normalized Record<string, number>.
 */
export function normalizeAllocations(
  input: BackgroundAbilityScoreAllocations | string[] | undefined | null
): BackgroundAbilityScoreAllocations {
  if (!input) return {};
  if (Array.isArray(input)) {
    const record: Record<string, number> = {};
    for (const item of input) {
      if (!item) continue;
      const key = item.toLowerCase().trim();
      record[key] = (record[key] || 0) + 1;
    }
    return record;
  }
  const record: Record<string, number> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === 'number' && v > 0) {
      record[k.toLowerCase().trim()] = v;
    }
  }
  return record;
}

/**
 * Validates whether a given background ability score allocation is valid under 2024 PHB rules.
 *
 * Rules:
 * 1. Total points must be exactly 3.
 * 2. All selected abilities must be included in `allowedAbilities`.
 * 3. Mode A: One ability gets +2, one ability gets +1 (2 distinct abilities).
 * 4. Mode B: Three distinct abilities each get +1 (3 distinct abilities).
 * 5. No single ability can receive +3 or more.
 * 6. Duplicate choices in +1/+1/+1 mode are rejected.
 */
export function validate2024BackgroundAbilityScores(
  allocationsInput: BackgroundAbilityScoreAllocations | string[] | undefined | null,
  allowedAbilities: string[]
): ValidationResult {
  const normalizedAllowed = (allowedAbilities || []).map(a => a.toLowerCase().trim());
  const allocations = normalizeAllocations(allocationsInput);
  const entries = Object.entries(allocations).filter(([_, bonus]) => bonus > 0);

  if (entries.length === 0) {
    return { valid: false, mode: 'invalid', reason: 'No ability score bonuses allocated' };
  }

  let totalPoints = 0;
  for (const [ability, bonus] of entries) {
    const normAbility = ability.toLowerCase().trim();
    if (!normalizedAllowed.includes(normAbility)) {
      return {
        valid: false,
        mode: 'invalid',
        reason: `Ability '${ability}' is not in allowed background options: ${allowedAbilities.join(', ')}`
      };
    }
    if (bonus > 2) {
      return {
        valid: false,
        mode: 'invalid',
        reason: `Ability '${ability}' cannot receive more than +2 bonus`
      };
    }
    totalPoints += bonus;
  }

  if (totalPoints !== 3) {
    return {
      valid: false,
      mode: 'invalid',
      reason: `Total allocated bonus points must equal exactly 3 (currently ${totalPoints})`
    };
  }

  if (entries.length === 2) {
    const bonuses = entries.map(([_, b]) => b).sort((a, b) => b - a);
    if (bonuses[0] === 2 && bonuses[1] === 1) {
      return { valid: true, mode: 'A (+2/+1)' };
    }
  } else if (entries.length === 3) {
    const bonuses = entries.map(([_, b]) => b);
    if (bonuses.every(b => b === 1)) {
      return { valid: true, mode: 'B (+1/+1/+1)' };
    }
  }

  return {
    valid: false,
    mode: 'invalid',
    reason: 'Invalid bonus distribution (must be +2/+1 across 2 abilities or +1/+1/+1 across 3 abilities)'
  };
}

/**
 * Calculates total background ability score bonuses for a character given their choices and background.
 */
export function calculate2024BackgroundBonuses(
  allocationsInput: BackgroundAbilityScoreAllocations | string[] | undefined | null,
  allowedAbilities: string[]
): Record<string, number> {
  const result: Record<string, number> = {
    str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0
  };

  const validation = validate2024BackgroundAbilityScores(allocationsInput, allowedAbilities);
  if (!validation.valid) {
    return result; // return 0s if invalid
  }

  const allocations = normalizeAllocations(allocationsInput);
  for (const [ability, bonus] of Object.entries(allocations)) {
    const key = ability.toLowerCase().trim();
    if (key in result) {
      result[key] = bonus;
    }
  }

  return result;
}
