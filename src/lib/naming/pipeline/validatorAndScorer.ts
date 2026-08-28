/**
 * Candidate Validator & Quality Scorer
 * Validates candidate component selections and evaluates quality scores.
 */

import { Candidate, NamingContext, ScoreBreakdown } from '../types';
import { NamingRule, resolveDataPool, resolveHumanCulture } from '../rules/namingRules';
import { composeCandidateName } from './composer';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCandidate(
  candidate: Candidate,
  rule: NamingRule,
  ctx: NamingContext
): ValidationResult {
  const errors: string[] = [];

  // 1. Verify required component presence and non-empty values
  for (const compRule of rule.componentRules) {
    if (compRule.required) {
      const found = candidate.components.find((c) => c.type === compRule.type && Boolean(c.value));
      if (!found || !found.value.trim()) {
        errors.push(`Missing required component '${compRule.type}' for rule '${rule.id}'`);
      }
    }
  }

  // 2. Verify selected component source pool integrity
  for (const comp of candidate.components) {
    if (!comp.value || !comp.value.trim()) {
      errors.push(`Empty component value for type '${comp.type}'`);
      continue;
    }

    if (comp.sourceCategory) {
      const pool = resolveDataPool(comp.sourceCategory, ctx);
      if (pool && pool.length > 0 && !pool.includes(comp.value)) {
        errors.push(
          `Component '${comp.value}' of type '${comp.type}' does not belong to expected pool '${comp.sourceCategory}'`
        );
      }
    }
  }

  // 3. Verify pattern placeholder resolution & composed display name validity
  const composedName = composeCandidateName(candidate.components, candidate.compositionPattern);
  if (!composedName || composedName.trim().length === 0) {
    errors.push(`Composed display name is empty for rule '${rule.id}'`);
  }

  if (/{[a-zA-Z0-9_]+}/.test(composedName)) {
    errors.push(`Composed display name contains unreplaced placeholders: '${composedName}'`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function scoreCandidate(
  candidate: Candidate,
  rule: NamingRule,
  ctx: NamingContext,
  displayName: string,
  existingNamesSet: Set<string>
): { score: number; scoreBreakdown: ScoreBreakdown } {
  let profileMatch = rule.scoreMatch(ctx);
  let contextMatch = 10;
  let componentCompleteness = 10;
  let diversityPenalty = 0;

  // Evaluate context match bonuses
  if (ctx.gender && ctx.gender !== 'unspecified') contextMatch += 2;
  if (ctx.culture) {
    const cul = resolveHumanCulture(ctx.culture);
    if (cul.status === 'known') contextMatch += 3;
    else if (cul.status === 'unknown') contextMatch -= 2;
  }
  if (ctx.lifeStage) contextMatch += 2;
  if (ctx.traditionStyle) contextMatch += 3;

  // Evaluate component completeness
  const totalRules = rule.componentRules.length;
  const fulfilledRules = candidate.components.filter((c) => Boolean(c.value && c.value.trim())).length;
  componentCompleteness = Math.min(10, Math.round((fulfilledRules / Math.max(1, totalRules)) * 10));

  // Diversity & repetition penalty within candidate batch
  if (existingNamesSet.has(displayName)) {
    diversityPenalty = 20;
  }

  const total = Math.max(0, profileMatch + contextMatch + componentCompleteness - diversityPenalty);

  return {
    score: total,
    scoreBreakdown: {
      profileMatch,
      contextMatch,
      componentCompleteness,
      diversityPenalty,
      total
    }
  };
}
