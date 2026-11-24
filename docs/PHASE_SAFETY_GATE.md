# Artificer Phase Safety Gate

## Purpose

The Phase Safety Gate makes substantial, multi-step work durable and reviewable without depending on conversation history or an agent's completion claim.

GitHub Issues and Pull Requests are the persistent execution record. CI and the safety gate provide automated evidence; human review remains mandatory.

## Source-of-truth hierarchy

1. Assigned GitHub Issue — authoritative implementation contract.
2. Specialist contract (`.github/agents/*`) — domain constraints and routing.
3. Task branch and commits — implementation history.
4. Pull Request — implementation evidence and review surface.
5. CI / Phase Safety Gate — automated verification evidence.
6. Human review — final architectural and functional approval.
7. `main` — confirmed integrated state.

Do not create a second roadmap or competing task-state system.

## Phase lifecycle

`proposal → investigation → evidence-backed Issue → human scope approval → local AGY implementation → PR → CI / Phase Safety Gate → ChatGPT review → human review → merge`

An agent completion summary is not approval. A green CI run is not approval. A merged PR is not automatically proof of product acceptance; Jaap remains responsible for manual checks and final merge.

## When to create a Phase Issue

Use a Phase Issue when work has multiple subtasks, crosses architectural boundaries, migrates canonical data, changes a ruleset-sensitive domain, or is large enough that losing conversation context would make the task ambiguous.

Small isolated fixes may use a normal Issue and PR without the full phase contract.

## Required Phase Issue content

Every substantial phase should define:

- Goal / desired end state.
- Explicit scope and subtasks.
- Objective acceptance criteria.
- Architecture and safety constraints.
- Explicit out-of-scope boundaries.
- Verification plan.
- Canonical references.
- Execution Metadata: status, priority, specialist, dependencies, one-issue-at-a-time policy, and required task branch.

The Issue should describe what must be true, not prescribe unnecessary implementation details.

## Required PR evidence

A substantial PR should identify its Phase Issue and document:

- Completed scope.
- Architecture/ruleset safety checks.
- Verification commands and observed results.
- Canonical data/content integrity.
- Documentation impact.
- Important design decisions or limitations.
- Definition of Done status.

## Automated gates

`phase-safety-gate.yml` checks two independent concerns. It does not trust whether a PR was created manually or by a local coding agent.

### Phase contract

The PR must:

- Target a branch other than `main`.
- Contain all required review sections.
- Reference the governing Issue with an explicit GitHub reference such as `Closes #<number>`, `Refs #<number>`, or `Part of #<number>`.

### Repository health

The gate must pass:

- `npm ci`
- `npm run lint`
- `npm run validate:assets`
- `npm run build`

The existing `ci.yml` remains separate. The Safety Gate is an additional contract/review gate, not a replacement for normal CI.

## Ruleset safety invariants

For ruleset-sensitive work:

- `useGameStore.ruleset` remains canonical.
- `getActiveRulesetContext` remains the canonical resolver where applicable.
- Do not introduce a second ruleset store.
- Do not silently fall back from requested 2024 data to 2014 data (or vice versa).
- Preserve canonical IDs and established versioned data boundaries.
- Shared data remains shared when rules do not differ.
- Do not introduce fake or generic placeholder mechanics to satisfy a dataset shape.

## Review rule

The reviewer checks the PR against the Phase Issue, not against the author's claim that the task is complete.

Minimum review sequence:

1. Confirm the PR is based on the intended `main` state.
2. Compare the complete diff against the Phase Issue scope.
3. Inspect canonical data and architectural boundaries.
4. Verify automated checks are green.
5. Run targeted tests/manual checks required by the phase.
6. Record `MERGE` or `CHANGES REQUIRED`.
7. Only Jaap approves and merges the PR into `main`.

## Why this exists

Conversation context is finite. A Phase Issue, PR, tests, and repository documentation survive context-window boundaries and make the project recoverable by another contributor or future AI session.

The goal is not to slow implementation. It is to make it difficult for a plausible-looking implementation to silently become the new architecture.
