## Phase
<!-- Link the phase Issue. Every substantial phase must have one. -->
Closes #

## Goal
<!-- State the end state this PR delivers. -->

## Scope completed
- [ ] All requested subtasks are complete
- [ ] No unrelated scope was introduced

## Safety / architecture
- [ ] `useGameStore.ruleset` remains the canonical ruleset state
- [ ] `getActiveRulesetContext` remains the canonical resolver where applicable
- [ ] No competing ruleset store or hidden ruleset state was introduced
- [ ] Existing versioned data boundaries are preserved
- [ ] No fake, generic, or placeholder mechanics were introduced
- [ ] Canonical IDs and data contracts are preserved

## Verification
- [ ] `npm run lint`
- [ ] `npm run validate:assets`
- [ ] `npm run build`
- [ ] Relevant targeted tests were run
- [ ] Relevant Playwright/regression tests were run when applicable

## Data / content integrity
- [ ] Canonical sources were used
- [ ] Required dataset coverage was checked
- [ ] Ruleset-specific requests do not silently fall back to another ruleset

## Documentation
- [ ] `ROADMAP.md` updated if phase status/dispatch changed
- [ ] `docs/TASK_BOARD.md` updated if applicable
- [ ] Relevant architecture/audit documentation updated

## Review notes
<!-- Explain important design decisions, known limitations, and anything a reviewer should inspect carefully. -->

## Definition of Done
- [ ] Acceptance criteria from the phase Issue are satisfied
- [ ] CI is green
- [ ] Working tree contains only intentional changes
- [ ] Ready for human review
