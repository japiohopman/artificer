/**
 * Candidate Generator Pipeline
 * Produces valid candidate sets from resolved rule profiles and seedable RNG.
 */

import { Candidate, NameComponent, NamingContext } from '../types';
import { NamingRule, resolveDataPool } from '../rules/namingRules';
import { SeedableRNG } from '../rng';

export function generateCandidatesForRule(
  rule: NamingRule,
  ctx: NamingContext,
  rng: SeedableRNG,
  count: number = 10
): Candidate[] {
  const candidates: Candidate[] = [];

  for (let i = 0; i < count; i++) {
    const iterRng = rng.fork(`cand_${i}`);
    const components: NameComponent[] = [];

    for (const compRule of rule.componentRules) {
      // Handle optional components (e.g. 30% chance to omit optional nicknames or secondary parts)
      if (compRule.isOptional && iterRng.nextFloat() < 0.3) {
        continue;
      }

      const pool = resolveDataPool(compRule.poolSource, ctx);
      if (pool && pool.length > 0) {
        const pickedValue = iterRng.pick(pool);
        components.push({
          type: compRule.type,
          value: pickedValue,
          sourceCategory: compRule.poolSource,
          isOptional: compRule.isOptional
        });
      }
    }

    candidates.push({
      components,
      compositionPattern: rule.compositionPattern
    });
  }

  return candidates;
}
