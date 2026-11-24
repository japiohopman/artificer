# Google Antigravity CLI — Artificer quick start

Artificer uses Google's local Antigravity CLI (`agy`) as its implementation agent. It runs in Jaap's Windows workspace; it is not started by GitHub Actions.

## 1. Install on Windows 11

Open PowerShell and run Google's official installer:

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
```

Close and reopen the terminal if needed, then verify:

```powershell
agy --version
```

The documented default binary location is `$env:LOCALAPPDATA\agy\bin`. If PowerShell cannot find `agy`, check that this directory is on PATH and reopen the terminal.

Official installation guide: https://antigravity.google/docs/cli-getting-started

## 2. Open Artificer

Navigate to the local repository. Check for unfinished changes before switching branches:

```powershell
Set-Location "C:\path\to\artificer"
git status --short --branch
git fetch origin
```

For an existing task branch:

```powershell
git switch "agent/<issue-number>-<short-slug>"
git pull --ff-only
```

For a new task, start from the current main branch and create the task branch:

```powershell
git switch main
git pull --ff-only
git switch -c "agent/<issue-number>-<short-slug>"
```

Do not discard uncommitted work to make a branch switch succeed. Resolve the working-tree state deliberately first.

## 3. Start with a plan

From the repository root:

```powershell
agy --mode=plan
```

The CLI loads the root `AGENTS.md` workspace instructions. Ask it to read the assigned Issue and applicable specialist contract, inspect the relevant code and tests, and propose a bounded plan before editing.

Example first prompt:

```text
Read the assigned GitHub Issue and the Artificer instructions in AGENTS.md, AGENT.MD, AGENT_RULES.md, docs/WORKFLOW.md, and the applicable .github/agents specialist contract. Inspect the current implementation and tests. Do not edit files yet. Return the Issue scope, canonical ownership, risks, and a step-by-step implementation and verification plan.
```

After reviewing the plan, switch to the normal execution mode in the CLI and proceed with the approved Issue. Keep command/tool approvals enabled. Do not use automatic execution mode to bypass review.

## 4. Verify and hand back

Run the exact verification required by the Issue. Common repository checks include:

```powershell
npm run test:workflow
npm run lint
npm run validate:assets
npm run build
```

Not every Issue requires every command; follow its verification plan and report any skipped checks. If runtime/browser behavior is part of acceptance, record the manual steps and let Jaap complete the product check.

Do not push, open a PR, change GitHub metadata, or merge unless Jaap explicitly authorizes it. When authorized, keep the change on the task branch and include the governing Issue reference (for example, `Closes #415`) in the PR body.

## 5. Team boundaries

- GitHub Issue: authoritative scope and acceptance contract.
- `AGENTS.md`: Antigravity CLI workspace entry point.
- `AGENT.MD` and `AGENT_RULES.md`: shared repository instructions and safety rules.
- `.github/agents/`: domain specialist contracts.
- `CHATGPT.md`: ChatGPT-maintained advisory memory, never task authority.
- `ROADMAP.md`: strategic sequence and project orientation, not implementation scope.
- ChatGPT: project sequencing, Issue preparation, technical investigation, architecture review, PR review, and documentation/workflow maintenance.
- Jaap: product direction, local execution approval, manual acceptance testing, and final merge.
- GitHub Actions: CI, Phase Safety Gate, and safe PR review-queue signaling only.

Antigravity documentation:
- CLI installation and usage: https://antigravity.google/docs/cli-getting-started
- CLI command reference: https://antigravity.google/docs/cli/reference/
- Workspace rules and customization discovery: https://antigravity.google/docs/rules/
