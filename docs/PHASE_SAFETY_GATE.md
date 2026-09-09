# Artificer Phase Safety Gate

## Purpose

The Phase Safety Gate makes substantial multi-step work durable and reviewable without depending on conversation history alone.

GitHub is the persistent execution record; conversation context is used for architecture, reasoning, and review.

## Source of truth hierarchy

1. `ROADMAP.md` — current dispatch priority. Jules only receives work from `### Ready`.
2. Phase Issue — execution contract for one substantial phase.
3. Jules branch / commits — implementation history.
4. Pull request — implementation evidence and review surface.
5. CI / Safety Gate — automated evidence.
6. Human review — final architectural and functional approval.
7. `main` — confirmed integrated state.

Do not create a second roadmap or competing task-state system.

## Phase lifecycle

`PLANNED → IN PROGRESS → IMPLEMENTED → PR OPEN → REVIEW REQUIRED → APPROVED → MERGED`

A Jules session reaching `IMPLEMENTED` is not approval. A green CI run is not approval. A merged PR is not automatically a completed roadmap task: the existing Jules orchestrator intentionally keeps a human confirmation gate before advancing the queue.

## When to create a Phase Issue

Use a Phase Issue when work has multiple subtasks, touches multiple architectural boundaries, migrates canonical data, changes a ruleset-sensitive domain, or is otherwise large enough that losing conversation context would make the task ambiguous.

Small isolated fixes may use a normal issue/PR without the full phase contract.

## Required Phase Issue content

Every substantial phase should define:

- Goal / desired end state
- Explicit scope
- Subtasks
- Objective acceptance criteria
- Architecture and safety constraints
- Explicit out-of-scope boundaries
- Verification plan
- Canonical references

The Issue should describe what must be true, not prescribe unnecessary implementation details.

## Required PR evidence

A substantial PR should identify its Phase Issue and document:

- completed scope
- architecture/ruleset safety checks
- verification commands and results
- canonical data/content integrity
- documentation impact
- important design decisions or limitations
- Definition of Done status

The PR template is intentionally repetitive: this is a checklist, not bureaucracy. Repetition makes review independent of memory.

## Automated gates

`phase-safety-gate.yml` checks two independent concerns:

### Phase contract

The PR must:

- target a branch other than `main`
- contain the required review sections
- reference the Phase Issue using `Closes #<number>`

### Repository health

The PR must pass:

- `npm ci`
- `npm run lint`
- `npm run validate:assets`
- `npm run build`

The existing `ci.yml` remains separate. The Safety Gate is deliberately an additional contract/review gate, not a replacement for normal CI.

## Ruleset safety invariants

For ruleset-sensitive work:

- `useGameStore.ruleset` remains canonical.
- `getActiveRulesetContext` remains the canonical resolver where applicable.
- Do not introduce a second ruleset store.
- Do not silently fall back from a requested 2024 dataset to 2014 data (or vice versa).
- Preserve canonical IDs and established versioned data boundaries.
- Shared data should remain shared when rules do not differ.
- Do not introduce fake or generic placeholder mechanics to satisfy a dataset shape.

## Review rule

The reviewer checks the PR against the Phase Issue, not against the author's claim that the task is complete.

The minimum human review sequence is:

1. Confirm the PR is based on the intended `main` state.
2. Compare the complete diff against the Phase Issue scope.
3. Inspect canonical data and architectural boundaries.
4. Verify automated checks are green.
5. Run targeted tests/manual checks when the phase requires them.
6. Decide `MERGE` or `CHANGES REQUIRED`.
7. Only after confirmation should the roadmap/orchestrator advance the phase.

## Why this exists

Conversation context is valuable but finite. A phase Issue, PR, tests, and repository documentation survive context-window boundaries and make the project recoverable by another agent or by a future review session.

The goal is not to make Jules slower. The goal is to make it difficult for a plausible-looking implementation to silently become the new architecture.
