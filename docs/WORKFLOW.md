# 🛠️ Artificer Operating Model & Workflow

This document defines the canonical operating model and workflow contracts for Artificer. It serves as the durable source of truth so that the project remains completely understandable and operational even when a chat session, AI model, or personal memory is unavailable.

---

## 1. Canonical Hierarchy

Development execution contracts follow a strict, deterministic precedence hierarchy:

```text
GOALS.md (Long-term vision)
  └─ ROADMAP.md (Strategic priority & order context)
      └─ Assigned GitHub Issue (AUTHORITATIVE EXECUTION CONTRACT)
          ├─ Selected Specialist Contract (.github/agents/*)
          ├─ Shared Agent Instructions (AGENT.MD & AGENT_RULES.md)
          └─ Implementation Source Code & Tests
```

- **`GOALS.md`**: Defines the long-term destination and project vision. Changes infrequently.
- **`ROADMAP.md`**: Provides strategic priority orientation and feature sequence. It is **not** an execution queue or dispatch source.
- **Assigned GitHub Issue**: The single persistent execution contract for any unit of work. Defines goals, scope, acceptance criteria, constraints, and verification steps.
- **`.github/agents/*`**: Domain-specific routing and architectural constraints (Architecture, Ruleset/Data, UI, Assets, Gameplay, Verification).
- **`main` Branch**: The ultimate durable source of truth for all repository state.

---

## 2. Roles & Responsibilities

### Human Project Owner
- Owns overall project strategy, scope boundaries, and merge authority on `main`.
- Creates, prioritizes, and assigns GitHub Issues.
- Performs human code review and final approval on Pull Requests before merging.

### AI Implementation Engineer (Jules)
- Autonomous software engineering agent dispatched against a single assigned GitHub Issue.
- Operates on a dedicated task branch created for the assigned Issue.
- Reads task scope exclusively from the assigned GitHub Issue and applicable specialist contracts.
- Modifies code, runs verification tests, and opens a Pull Request referencing the Issue upon completion.

### Architecture & Review AI Assistant
- Interactive architecture advisor and review assistant (e.g., ChatGPT or equivalent AI model).
- Assists with design exploration, code review, threat modeling, and issue definition.
- **Crucial Rule:** The AI Assistant is **not** a source of truth, **not** a merge authority, and **not** a replacement for GitHub Issues. All decisions must be committed to the repository or recorded in GitHub Issues to take effect.

---

## 3. Work Cycle & Execution Flow

1. **Issue Creation & Assignment**
   - Work begins when a GitHub Issue is created and formatted with standard metadata (`status`, `priority`, `specialist`, `implementation-branch`).

2. **Jules Dispatch & Execution**
   - The automated dispatcher (`scripts/jules-issue-dispatch.mjs`) selects the highest-priority ready Issue.
   - Preflight checks (`scripts/jules-orchestrator-preflight.mjs`) ensure no conflicting sessions or open PRs block dispatch.
   - Jules executes the task on the designated branch, strictly respecting the Issue contract and specialist constraints.

3. **Phase Safety Gate & Pull Request**
   - Substantial architectural or domain changes submit a Pull Request governed by `docs/PHASE_SAFETY_GATE.md`.
   - The PR includes implementation summaries, testing/verification evidence, and references the governing GitHub Issue.

4. **Human Review & Merge**
   - CI runs automated test suites (`npm test`, `npm run test:workflow`).
   - The Human Project Owner reviews the PR and verification evidence.
   - Upon approval, the PR is merged into `main`, closing the GitHub Issue and clearing the dispatch lock.

---

## 4. Repository Autonomy & Context Recovery

A fresh contributor or AI agent can reconstruct the entire workflow and state of the project using **only** the repository:

1. **Check Active Work:** Query open GitHub Issues or inspect `.github/jules-queue-state.json`.
2. **Understand Domain Constraints:** Read `AGENT.MD`, `AGENT_RULES.md`, and the relevant specialist contract under `.github/agents/`.
3. **Start Next Work Cycle:**
   - Ensure local workspace is clean and on latest `main` (`git checkout main && git pull`).
   - Pick or assign an open GitHub Issue.
   - Create the implementation branch specified by the Issue metadata.
   - Execute, verify, and submit via Pull Request.

Chat session history or external notes must never be required to understand or resume development.

---
*Authoritative Artificer Workflow Specification.*
