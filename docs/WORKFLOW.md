# Artificer Operating Model & Workflow

This document is the canonical operating contract for humans, ChatGPT, and local implementation agents. GitHub Issues and Pull Requests are the durable record; conversation history is not required to reconstruct the work.

---

## 1. Canonical hierarchy & contract precedence

```text
Assigned GitHub Issue (authoritative implementation contract)
  ├─ Specialist contract (.github/agents/*)
  ├─ AGENTS.md (Antigravity workspace entry point)
  ├─ AGENT.MD and AGENT_RULES.md (shared repository instructions)
  └─ Canonical source code, tests, and named documentation
```

1. **Assigned GitHub Issue** defines the goal, scope, acceptance criteria, invariants, verification plan, and out-of-scope boundaries.
2. **Specialist contract** defines applicable domain constraints and review expectations.
3. **AGENTS.md** is the root workspace instruction file automatically discovered by Google's Antigravity CLI.
4. **AGENT.MD and AGENT_RULES.md** provide shared repository guidance and safety rules.
5. **Canonical references** are the implementation, tests, and documentation named by the Issue or specialist.

`CHATGPT.md`, `ROADMAP.md`, `GOALS.md`, and `docs/TASK_BOARD.md` are not execution contracts. The task board is historical; the roadmap describes strategic sequence but never substitutes for an Issue.

## 2. Roles & responsibilities

### Human project owner — Jaap

- Owns product direction, task scope, and priority decisions.
- Approves local agent execution and consequential commands.
- Performs required manual/product verification.
- Retains final PR approval and merge authority on `main`.

### ChatGPT — project, architecture & review partner

- Reconstructs repository state from GitHub and canonical files.
- Curates project sequencing with Jaap and maintains `ROADMAP.md` and advisory `CHATGPT.md`.
- Investigates architecture, prepares and validates GitHub Issues, and records adjacent discoveries as separate Issues.
- Reviews implementation diffs, CI evidence, safety constraints, and PRs.
- Maintains repository workflow instructions when the operating model changes.
- Does not invent test results, make product decisions on Jaap's behalf, or merge PRs.

### Google Antigravity CLI (`agy`) — local implementation agent

- Runs locally in Jaap's Windows repository workspace, normally from PowerShell.
- Implements only the assigned GitHub Issue and applicable specialist contract.
- Works on one dedicated task branch and reports exact changes and observed verification.
- Uses the repository's `AGENTS.md` workspace instructions.
- Does not choose the next project task, change Issue scope, or modify `CHATGPT.md`.
- Does not push, create GitHub objects, change settings, force-push, or merge unless Jaap explicitly authorizes the action.

### GitHub Actions — repository gates only

- Runs normal CI and the Phase Safety Gate.
- Maintains a non-authoritative ChatGPT PR review-queue signal for eligible same-repository task branches.
- Does not create, resume, schedule, or clean up local AGY sessions.

## 3. Work cycle

```text
Repository / product investigation
  -> evidence-backed GitHub Issue
  -> Issue Quality Contract v2
  -> Jaap approves scope and local execution
  -> AGY plan and implementation on a task branch
  -> required local verification
  -> Pull Request
  -> GitHub CI + Phase Safety Gate
  -> ChatGPT technical / product review
  -> Jaap manual acceptance and merge
```

### 3.1. Issue quality contract

Every actionable task belongs in a GitHub Issue. Substantial Issues must contain:

- Problem / Desired Outcome and Goal.
- Current Repository Facts and Investigation Required.
- Canonical Ownership and Known Risks / Invariants.
- Scope and Acceptance Criteria.
- Verification Plan and Canonical References.
- Out of Scope.
- Execution Metadata: status, priority, specialist, dependencies, one-issue-at-a-time policy, and required implementation branch.

The Issue Quality Gate v2 validator preserves older metadata headings for existing Issues while new Issues use agent-neutral Execution Metadata. Only a deliberately approved `status: ready` Issue may be started.

### 3.2. Local AGY execution

- Jaap opens the repository root in PowerShell and starts `agy --mode=plan` for substantial or unfamiliar work.
- AGY reads the Issue, specialist contract, `AGENTS.md`, `AGENT.MD`, and `AGENT_RULES.md` before proposing edits.
- Jaap reviews the plan before execution.
- Work is performed on a dedicated branch, normally `agent/<issue-number>-<short-slug>`. Conventional `feat/`, `fix/`, `chore/`, `refactor/`, `test/`, `docs/`, `perf/`, `build/`, and `ci/` task branches are also supported.
- Use reviewed command/tool permissions. Destructive actions, production operations, external writes, and GitHub mutations require explicit Jaap approval.
- Never work directly on `main`.

### 3.3. One active task & scope protection

One active Issue / implementation branch / PR is the default. Continue review fixes on the same branch and PR. Do not open a second implementation task while the current PR remains active unless Jaap explicitly decides to split independent work.

If review or investigation uncovers materially broader work, record it in a follow-up Issue. Do not silently broaden the assigned contract. No agent may choose or start the next task from the roadmap alone.

### 3.4. ChatGPT-curated roadmap

- `ROADMAP.md` records strategic order, dependencies, and factual project checkpoints.
- ChatGPT maintains the intended sequence together with Jaap.
- The GitHub Issue remains the only source of implementation scope and acceptance criteria.
- An Issue becomes `ready` only after the Quality Gate and human scope review.
- No automated readiness promotion or agent dispatch is part of the current workflow.
- AGY may report evidence about its assigned Issue in the PR; it must not reorder the roadmap, promote unrelated Issues, or create a parallel queue.

## 4. Pull Requests, review relay & safety gates

Substantial work uses the persistent contract in `docs/PHASE_SAFETY_GATE.md`. PRs target `main`, reference their governing Issue using `Closes #<number>`, `Refs #<number>`, or `Part of #<number>`, and contain the required review sections.

The ChatGPT PR Review Relay is only a queue signal. It accepts open, non-draft PRs targeting `main`, from this repository, on recognized task branches, with a governing Issue reference. It records the current HEAD SHA and check status using one stable comment and the `chatgpt-review` label.

The relay does not approve, request changes, merge, close, change Issue readiness, run an LLM, or start local AGY sessions. ChatGPT performs the substantive review; Jaap decides whether to merge.

Normal CI and the Phase Safety Gate remain separate required checks. They must not be removed to compensate for a local agent limitation.

## 5. Fresh-chat / fresh-agent context recovery

A new AI session or contributor reconstructs context from the repository:

1. Identify the active GitHub Issue and any active PR / task branch.
2. Read the complete Issue.
3. Read the selected specialist contract.
4. Read `AGENTS.md`, `AGENT.MD`, `AGENT_RULES.md`, and this document.
5. Inspect named source files, consumers, tests, and current CI evidence.
6. Consult `CHATGPT.md` and `ROADMAP.md` only as advisory/strategic context.

Never infer missing acceptance criteria from chat memory or a roadmap sentence. When context is missing, stop and ask Jaap.

---

*Authoritative Artificer workflow specification.*
