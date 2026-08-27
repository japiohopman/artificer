/**
 * Candidate Validator & Quality Scorer
 * Validates candidate component selections and evaluates quality scores.
 */

import { Candidate, NamingContext, ScoreBreakdown } from '../types';
import { NamingRule } from '../rules/namingRules';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCandidate(
  candidate: Candidate,
  rule: NamingRule,
  _ctx: NamingContext
): ValidationResult {
  const errors: string[] = [];

  for (const compRule of rule.componentRules) {
    if (compRule.required) {
      const found = candidate.components.some((c) => c.type === compRule.type && Boolean(c.value));
      if (!found) {
        errors.push(`Missing required component '${compRule.type}' for rule '${rule.id}'`);
      }
    }
  }

  // Check for malformed or empty component values
  for (const comp of candidate.components) {
    if (!comp.value || comp.value.trim().length === 0) {
      errors.push(`Empty component value for type '${comp.type}'`);
    }
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
  if (ctx.culture) contextMatch += 3;
  if (ctx.lifeStage) contextMatch += 2;

  // Evaluate component completeness
  const totalRules = rule.componentRules.length;
  const fulfilledRules = candidate.components.filter((c) => Boolean(c.value)).length;
  componentCompleteness = Math.min(10, Math.round((fulfilledRules / Math.max(1, totalRules)) * 10));

  // Diversity & repetition penalty within the generation batch
  if (existingNamesSet.has(displayName)) {
    diversityPenalty = 15;
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
