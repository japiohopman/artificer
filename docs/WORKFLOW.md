# 🛠️ Artificer Operating Model & Workflow

This document defines the canonical operating model and workflow contracts for Artificer. It serves as the durable source of truth so that the project remains completely understandable and operational even when a chat session, AI model, or personal memory is unavailable.

---

## 1. Canonical Hierarchy & Contract Precedence

Development execution contracts follow a strict, deterministic precedence hierarchy:

```text
Assigned GitHub Issue (AUTHORITATIVE EXECUTION CONTRACT)
  ├─ Selected Specialist Contract (.github/agents/*)
  ├─ Shared Agent Instructions (AGENT.MD & AGENT_RULES.md)
  └─ Canonical Reference Context (Source code, tests, & named documentation)
```

### Precedence Order
1. **Assigned GitHub Issue**: The persistent, authoritative execution contract for any unit of work. Defines goals, scope, acceptance criteria, constraints, verification steps, and out-of-scope boundaries.
2. **Selected Specialist Contract (`.github/agents/*`)**: Domain-specific routing and architectural constraints (Architecture, Ruleset/Data, UI, Assets, Gameplay, Verification).
3. **Shared Agent Instructions (`AGENT.MD` & `AGENT_RULES.md`)**: Repository-wide AI entry point, working rules, groundedness, and safety boundaries.
4. **Canonical Reference Context**: Implementation source code, tests, and documentation files named by the assigned Issue or specialist contract.

### Strategic Orientation Documents (Non-Execution Authorities)
- **`GOALS.md`**: Defines long-term destination and project vision.
- **`ROADMAP.md`**: Provides ChatGPT-curated strategic priority orientation and feature sequence. It defines execution order while GitHub Issues remain authoritative for implementation scope.
- **`docs/TASK_BOARD.md`**: Retained strictly as a historical migration reference and audit matrix. It is **not** an active execution queue.

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
- Must treat `CHATGPT.md` as read-only project context and must **not** edit it.

### Architecture & Review AI Assistant (ChatGPT)
- Interactive project management, architecture advisor, and review assistant across chat sessions.
- Maintains root `CHATGPT.md` as durable working project memory across fresh chats.
- Assists Jaap with design exploration, code review, threat modeling, issue creation, labeling, and project management.
- **Crucial Rule:** The AI Assistant is **not** an execution authority over Jules and **not** a replacement for GitHub Issues. All execution contracts must exist as assigned GitHub Issues.

---

## 3. Work Cycle & Execution Flow

Development follows an evidence-backed lifecycle:
`proposal → investigation → evidence-backed Issue → human validation → quality gate → ready → dispatch`

1. **Issue Creation & Quality Gate Validation**
   - Work begins as an investigation resulting in an evidence-backed GitHub Issue.
   - The Issue must satisfy **Issue Quality Contract v2** (required sections, valid metadata, existing specialist, canonical references resolving on `main`, concrete repository evidence, acceptance criteria, verification plan, and out-of-scope boundary).
   - Only Issues passing the Quality Gate become eligible as `status: ready`.

2. **Jules Dispatch & Execution**
   - The active automated dispatcher is `.github/workflows/jules-issue-dispatcher.yml`.
   - Dispatch pipeline runs preflight checks (`scripts/jules-orchestrator-preflight.mjs`), Issue selection (`scripts/jules-issue-selector.mjs`), and session dispatch (`scripts/jules-issue-dispatch.mjs`).
   - **Safety Gate:** Live Jules session creation strictly requires explicit manual workflow dispatch confirmation with the exact value `DISPATCH` (`confirmation: DISPATCH`).
   - Jules executes the task on the designated branch, strictly respecting the Issue contract and specialist constraints.

3. **Phase Safety Gate & Pull Request**
   - Substantial architectural or domain changes submit a Pull Request governed by `docs/PHASE_SAFETY_GATE.md`.
   - The PR includes implementation summaries, testing/verification evidence, and references the governing GitHub Issue.

4. **Human Review & Revision Loop**
   - CI runs automated test suites (`npm test`, `npm run test:workflow`).
   - The Human Project Owner (supported by the Architecture & Review AI Assistant) reviews the PR and verification evidence.
   - If findings or required fixes are identified during review, findings are recorded in the PR review/conversation.
   - Jules continues work on the existing task using the same implementation branch and PR where possible.
   - New commits pushed to the branch automatically rerun CI and Phase Safety Gate checks.
   - The PR is re-reviewed until implementation and verification evidence satisfy requirements.
   - Upon final approval, only the Human Project Owner merges the PR into `main`, closing the GitHub Issue and clearing the dispatch lock.

### 3.1. Dispatch Boundary & Review Context

To preserve execution safety and prevent duplicate session dispatches:

- **Single Execution Context**: Do not start a new Jules dispatch merely because a review identifies required fixes for an open PR. The active Jules task, implementation branch, and open PR remain the active execution context while the PR is open.
- **New Dispatch Trigger**: A new Issue dispatch is appropriate only after the current task/PR is complete (merged or closed), or when newly requested work materially expands beyond the original Issue contract.
- **One-at-a-Time Preflight Model**: The orchestrator preflight safety gate enforces a strict one-Issue-at-a-time dispatch model. An active or open PR blocks duplicate dispatches until the active execution context reaches a terminal state.

### 3.2. Evidence-Based Discovery Loop

When ready work is low (`ready Issues <= 2 AND no active Discovery Issue`), a controlled Discovery Loop triggers:

- **Audits & Findings**: Discovery audits the repository, cites concrete evidence, explains risk/impact, records rejected findings, and proposes candidate follow-up Issues.
- **Strict Non-Dispatch Boundary**: Candidate Issues created by discovery begin as `status: proposed`. They require human review before becoming `status: ready`.
- **No Direct Dispatch**: Discovery findings never dispatch implementation work automatically.

### 3.3. Scope Protection & Creep Prevention

Review feedback must remain grounded in the original execution contract:

- **Scope Boundary**: If review feedback or architectural discussion identifies changes that materially expand beyond the assigned Issue contract, stop expanding the active task.
- **Decomposition**: Record adjacent or material expansion items as separate, dedicated GitHub Issues rather than allowing PR review iterations to become unbounded scope creep.
- **Sequential Dispatch Constraint**: Review feedback that materially exceeds the current Issue contract requires a separate GitHub Issue. That new Issue must **NOT** be dispatched while the current Jules task or PR is still active or open. The next Issue becomes dispatchable only after the current execution context is terminal (merged or closed).

### 3.4. ChatGPT-Curated Roadmap Sequencing & Handoff

To prevent premature dispatch of strategically dependent work, dispatch candidates are evaluated against the `ChatGPT-Curated Execution Sequence` in `ROADMAP.md`:

- **Sequence Enforcement**: ChatGPT defines the sequence in `ROADMAP.md`. The Issue selector selects candidates in sequence order, blocking later sequence items when an earlier sequence item or checkpoint is incomplete.
- **Authoritative Scope**: `ROADMAP.md` provides sequence order; implementation scope, acceptance criteria, and specialist routing belong exclusively in the assigned GitHub Issue.
- **Factual Handoff Reporting**: Upon completing an assigned Issue, Jules may update the factual progress status of its completed task in `ROADMAP.md` within its PR. Jules must not reorder tasks, alter other sequence items, or invent new tasks.
- **Automatic Readiness Advancement**: Merging or closing a completed task permits automation to evaluate the next sequence candidate, which becomes dispatchable only if it is marked `status: ready` and satisfies all Quality Gate and dependency checks.

---

## 4. New AI / New Chat Context Recovery & Repository Autonomy

A fresh contributor or AI agent (ChatGPT, Jules, or any AI session) must reconstruct the current Artificer workflow and repository state using **only** the repository itself.

### 4.1. Reading Order for Fresh AI Sessions

When starting or recovering a session, read files in this exact order:

1. **Assigned GitHub Issue**: The single persistent execution contract (or query open GitHub Issues / open PRs via GitHub API).
2. **Selected Specialist Contract**: Read the applicable contract under `.github/agents/`.
3. **`AGENT.MD` & `AGENT_RULES.md`**: Shared repository entry point, working rules, and safety boundaries.
4. **Canonical Reference Context**: Read implementation files, tests, and canonical documentation named by the Issue or specialist contract.
5. **Inspect Source Code Directly**: Always inspect source code and existing tests directly before making modifications.

### 4.2. Context Authority Rules

- **Do Not Infer Missing Context From Chat Memory**: Chat session history or external chat memory is optional context, never a required source or execution authority. An AI session must never invent task scope or override repository rules based on chat history.
- **Durable Advisory Memory (`CHATGPT.md`)**: Root `CHATGPT.md` is maintained by ChatGPT for durable working memory across chats. It is advisory project memory only and must never override an assigned Issue, specialist contract, `AGENT.MD`, `AGENT_RULES.md`, or repository source code.
- **Historical Artifacts Are Non-Executable**: `docs/TASK_BOARD.md`, former Jules Queue Orchestrator files (`jules-orchestrator.mjs`, `jules-queue-state.json`), and old named-agent instruction files are historical references only. They are not active execution queues or context recovery sources.

---
*Authoritative Artificer Workflow Specification.*
