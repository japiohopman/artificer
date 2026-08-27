/**
 * Artificer Naming Domain Core Entrypoint
 * Reusable, deterministic, application-wide content generation capability.
 */

import {
  NamingContext,
  NamingResult,
  NamingDomainError,
  Candidate
} from './types';
import { resolveNamingProfile } from './rules/namingRules';
import { generateCandidatesForRule } from './pipeline/generator';
import { composeCandidateName } from './pipeline/composer';
import { validateCandidate, scoreCandidate } from './pipeline/validatorAndScorer';
import { SeedableRNG } from './rng';

export * from './types';
export * from './rng';
export { resolveNamingProfile } from './rules/namingRules';

/**
 * Generates a high-quality, deterministic name result based on input context and seed.
 */
export function generateName(ctx: NamingContext): NamingResult {
  const seed = ctx.seed ?? Date.now();
  const rng = new SeedableRNG(seed);

  // 1. Resolve Naming Profile
  const { rule, profileRef } = resolveNamingProfile(ctx);

  // 2. Generate Candidate Set
  const candidateCount = Math.max(3, ctx.candidateCount ?? 10);
  const rawCandidates = generateCandidatesForRule(rule, ctx, rng, candidateCount);

  // 3. Validate & Score Candidates
  const evaluatedCandidates: { candidate: Candidate; displayName: string; score: number }[] = [];
  const existingNamesSet = new Set<string>();
  const warnings: string[] = [];

  for (const rawCandidate of rawCandidates) {
    const validation = validateCandidate(rawCandidate, rule, ctx);
    if (!validation.isValid) {
      warnings.push(...validation.errors);
      continue;
    }

    const displayName = composeCandidateName(rawCandidate.components, rawCandidate.compositionPattern);
    const { score, scoreBreakdown } = scoreCandidate(rawCandidate, rule, ctx, displayName, existingNamesSet);

    rawCandidate.score = score;
    rawCandidate.scoreBreakdown = scoreBreakdown;

    evaluatedCandidates.push({
      candidate: rawCandidate,
      displayName,
      score
    });

    existingNamesSet.add(displayName);
  }

  if (evaluatedCandidates.length === 0) {
    throw new NamingDomainError(
      'INSUFFICIENT_DATA',
      `Failed to generate valid candidate name for profile '${rule.id}'`,
      ctx
    );
  }

  // 4. Select best candidate deterministically
  evaluatedCandidates.sort((a, b) => b.score - a.score);
  const best = evaluatedCandidates[0];

  return {
    displayName: best.displayName,
    resolvedProfile: profileRef,
    components: best.candidate.components,
    score: best.score,
    metadata: {
      seed,
      candidatesEvaluated: evaluatedCandidates.length,
      warnings: warnings.length > 0 ? warnings : undefined,
      ruleId: rule.id
    }
  };
}

/**
 * Generates multiple candidates for inspection or selection UI.
 */
export function generateCandidates(ctx: NamingContext, count: number = 5): NamingResult[] {
  const results: NamingResult[] = [];
  const baseSeed = ctx.seed ?? Date.now();
  const rng = new SeedableRNG(baseSeed);

  for (let i = 0; i < count; i++) {
    const childSeed = rng.nextInt(0, 0x7fffffff);
    results.push(generateName({ ...ctx, seed: childSeed }));
  }

  return results;
}
