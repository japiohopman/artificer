# Artificer — Antigravity workspace instructions

This is the repository-level entry point for Google's Antigravity CLI (`agy`). Antigravity automatically discovers `AGENTS.md`; the legacy shared guide is named `AGENT.MD` and is not a substitute for this file.

## Required reading before implementation

For every task, follow this order:

1. Read the complete assigned GitHub Issue. It is the only authoritative implementation contract.
2. Read the applicable specialist contract in `.github/agents/`.
3. Read `AGENT.MD`, `AGENT_RULES.md`, and `docs/WORKFLOW.md`.
4. Read the canonical source files, consumers, tests, and documentation named by the Issue.
5. Consult `CHATGPT.md` only as optional advisory project memory. It never overrides the Issue, specialist contract, shared rules, or source code.

If there is no clearly assigned Issue, stop before editing and ask Jaap which Issue governs the work. Never infer implementation scope from a roadmap row, discussion, task board, or chat memory.

## Execution boundaries

- Work on one GitHub Issue at a time and keep one active task branch / PR.
- The assigned Issue defines scope, acceptance criteria, safety constraints, and verification. Record adjacent discoveries as follow-up Issues rather than absorbing them.
- Never edit or commit directly to `main`. Use a dedicated task branch, normally `agent/<issue-number>-<short-slug>`.
- Do not force-push, delete remote branches, push commits, create or modify GitHub Issues, open/close/merge PRs, or change repository settings unless Jaap explicitly authorizes that action.
- Never approve or merge a PR. Jaap retains final review and merge authority.
- GitHub Actions runs repository CI, the Phase Safety Gate, and the PR review relay. It does not launch, control, or clean up local Antigravity sessions.
- Do not expose, copy, commit, or rewrite secrets or local environment files.
- Treat destructive commands, production data changes, migrations, external writes, and permission changes as approval-required actions.
- Do not claim a test, build, browser check, or manual verification passed unless its actual result was observed.

## Implementation discipline

- Inspect the current implementation, consumers, tests, canonical owner, persistence boundary, and nearby architecture before changing an existing system.
- Preserve canonical ownership and ruleset isolation. Do not add parallel stores, duplicate domain models, or silent cross-ruleset fallbacks.
- Keep changes within the Issue. Update canonical documentation when an established contract changes.
- Prefer the repository's existing npm scripts. Report exact commands and outcomes, including failures and checks not run.
- Use Windows PowerShell syntax for Windows-specific instructions. Do not assume Bash utilities are available.
- For substantial or unfamiliar work, begin in planning mode with `agy --mode=plan`; present the investigation and implementation plan before making edits. Use the normal reviewed permission mode for execution; do not switch to automatic mode just to bypass approvals.

## Completion handoff

Before handing work back, report:

1. What changed and how each acceptance criterion is addressed.
2. Files and modules changed.
3. Exact verification commands and observed results.
4. Any manual runtime checks still required from Jaap.
5. Remaining risks and separately tracked follow-up Issues.

The implementation branch and PR are evidence. A successful agent response is not proof of correctness.
