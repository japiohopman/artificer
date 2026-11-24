# 🧠 CHATGPT.md — ChatGPT Project Memory & Advisory Context

> **MAINTENANCE & AUTHORITY NOTICE FOR ALL AGENTS AND CONTRIBUTORS**
> - **Maintained by ChatGPT**: This file is a durable project-memory note maintained by ChatGPT across chat sessions. Jaap is not expected to maintain it manually.
> - **Read-Only for Implementation Agents**: Antigravity CLI (AGY) and other implementation agents must treat `CHATGPT.md` as **read-only** and must **NOT** edit, mutate, or update this file.
> - **Non-Authoritative / Advisory Only**: This file provides non-authoritative working context and architectural memory. It is **NOT** an execution queue, task database, source of implementation scope, or implementation contract for local AGY work.
> - **Precedence Boundary**: This file must **NEVER** override an assigned GitHub Issue, specialist contract (`.github/agents/*`), `AGENT.MD`, `AGENT_RULES.md`, or repository source code. Chat history and memory are optional context, never a required source of truth.

---

## 🛠️ GitHub Project Management Boundary

ChatGPT acts as Jaap's interactive architecture advisor and project management assistant across chat sessions. Through connected repository tools, ChatGPT may perform the following operational project-management responsibilities on Jaap's behalf:

- **Issues**: Create, update, reopen, or close GitHub Issues.
- **State & Reason**: Update Issue state or resolution reason (e.g., completed, duplicate, or not planned).
- **Labels & Assignees**: Add, remove, or replace Issue labels and assignees.
- **Metadata**: Update Issue titles, bodies, and milestones where supported by repository tooling.
- **Comments & Context**: Add Issue or PR comments, maintain review notes, and summarize technical discussions.
- **Inspection**: Inspect Issues, PRs, implementation branches, workflow runs, and repository files to perform management tasks safely.

**Key Rule:** These are project-management functions. Implementation scope belongs strictly in an assigned GitHub Issue that passes the Issue Quality Gate. AGY executes locally on the approved task branch; ChatGPT manages sequencing and review.

---

## 🏛️ Project Overview & Architecture Memory

### Core Vision
**Arcane Codex** (also known as *Artificer*) is a high-fantasy tabletop RPG simulation suite built for D&D 5.5e (2024 PHB) mechanics. It features a high-fidelity parchment UI, Leaflet world map, inventory V2 logistics, 3D WebGL dice engine, and AI-assisted narration.

### Tech Stack Summary
- **Frontend**: React 19, Vite 6, Tailwind CSS 4, TypeScript.
- **State Management**: Zustand 5 sliced store architecture (`useCharacterStore`, `useGameStore`, `useWorldStore`, `useInventoryStore`, `useAtlasStore`, `useUIStore`).
- **Drag & Drop**: `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Audio & Visual**: Howler.js, `@3d-dice/dice-box`, Leaflet.
- **Backend & AI**: Express proxy server, `@google/genai` (Gemini 1.5 Flash).

### Key Architectural Invariants
1. **Single Source of Truth**:
   - `useCharacterStore` owns canonical active character and save-slot state.
   - `useGameStore` owns runtime combat/game context and active ruleset selection (`2014` vs `2024`).
   - `useWorldStore` owns canonical world environment, calendar time, and physical position state.
   - `useInventoryStore` acts as a command/controller layer executing transactions against canonical character inventory state.
2. **Ruleset-Aware Isolation**:
   - Data fetches explicitly resolve versioned directories (`/assets/atlas/<domain>/json/14/` vs `/24/`).
   - Requesting a ruleset must strictly load from that ruleset folder without silent cross-ruleset fallback.
3. **Inventory V2 Architecture**:
   - Items use registry/slot architecture (`char.items` map + equipment slots / backpack slots).
   - Slot compatibility is strictly validated fail-closed (`evaluateSlotCompatibility`).
4. **World Environment Domain**:
   - Derived deterministic snapshots (`getEnvironmentSnapshot()`) calculate time blocks, calendar date, temperature, and weather without per-tick random rerolls.
   - Physical context is strictly bound to `partyLocation`.

---

## 🎮 Game-First Product Lens

Artificer is a game first. Atlas browsers, DevKit tools, schemas, generators, cards, inspectors, and technical services exist to support the playable game and its content pipeline; they are not the product goal by themselves.

For every planned feature, implementation issue, or review, ChatGPT must explicitly test the following before treating the work as complete:

1. **Player action:** What does the player actually do with this feature during play?
2. **Game-state consequence:** Which canonical game state changes, or which real game rule is resolved?
3. **Gameplay value:** What meaningful decision, challenge, capability, risk, reward, or consequence does this create?
4. **Runtime connection:** Can the resulting data/state be consumed by the playable game loop, not merely displayed or browsed?
5. **Reference vs. gameplay:** Is this a player-facing mechanic, a necessary authoring/data infrastructure component, or merely an informational/reference surface? Reference surfaces must justify themselves as support for the game/content pipeline.
6. **Playable verification:** Prefer tests that prove a real state transition or player interaction over tests that only prove rendering, file presence, or static shape.

### Anti-Wiki / Anti-Toolbox Rule

Do not plan or approve features merely because they make Artificer look complete, informative, beautiful, or technically sophisticated. A feature that only displays rules, generates assets, exposes data, or provides convenience tooling is not sufficient unless its role in the playable game or authoritative content pipeline is explicit.

When reviewing an issue, PR, or roadmap proposal, actively ask whether we are building:
- a playable game system;
- content/data infrastructure that directly feeds that game system; or
- tooling required to create, debug, verify, or maintain that game system.

If none of those is clear, stop and challenge the scope before dispatch.

### Product Review Rule

A passing technical implementation is not automatically a passing product implementation. ChatGPT reviews must separately check:
- architecture/correctness;
- player experience;
- gameplay consequence;
- connection to the canonical runtime state;
- whether the feature solves a real game problem rather than adding a wiki/tool/page.

## 🤝 Operational Workflow & Collaboration Conventions

1. **Issue-First Execution**:
   - The GitHub Issue is the only authoritative implementation contract.
   - Issue Quality Contract v2 validates required scope, acceptance criteria, specialist routing, canonical references, and execution metadata.
   - `AGENTS.md` is the root workspace instruction file automatically discovered by Google's Antigravity CLI.
2. **Local Implementation**:
   - AGY runs locally from the Artificer repository, normally through Windows PowerShell.
   - Start substantial work in planning mode (`agy --mode=plan`), review the proposed plan, then execute with normal approval prompts.
   - Work on one dedicated Issue branch at a time. Never edit or commit directly to `main`.
   - GitHub Actions never launches or manages local AGY sessions.
3. **Review & PR Lifecycle**:
   - AGY reports exact changes and verification evidence on the same task branch.
   - PRs reference the governing Issue and must pass CI and the Phase Safety Gate.
   - ChatGPT performs the technical / architectural PR review; Jaap performs product acceptance and retains final merge authority.
   - Do not push, force-push, change GitHub metadata, or merge without Jaap's explicit approval.
4. **Context Recovery**:
   - Fresh sessions reconstruct repository state from: assigned Issue → specialist contract → `AGENTS.md` → `AGENT.MD` / `AGENT_RULES.md` → named source and tests.
   - `CHATGPT.md` is advisory only; it is not an execution contract.

## 📜 Key Architectural History & Lessons Learned
- **Foundry Enemy Parity Audit (#358)**: Enemy data is mapped 1:1 with Foundry source records (`14` and `24`), retaining WebP images as shared media while maintaining token artwork under `/enemies/tokens/`.
- **Subclass Domain (#351)**: 2024 subclasses load 4 canonical options per class from `/subclasses/json/24/`.
- **Feat & Background Domain (#353, #355)**: 2024 origin backgrounds integrate origin feats and ability score allocation rules (+2/+1 or +1/+1/+1).
- **Z-Index Layering Standard**: Global UI surfaces adhere to explicit constants in `src/constants/uiStack.ts`.


---

## 🧭 Current Project Control & Sequencing Model — 2026-11-24

### Active operating model

ChatGPT and Jaap curate the project sequence. GitHub Issues remain the authoritative task contracts. Google Antigravity CLI (`agy`) performs local implementation on Jaap's Windows workstation. GitHub Actions provides CI, the Phase Safety Gate, and the PR review relay only; it does not dispatch local agents.

### Current verified repository state

- Last commit on `main`: `be3e790` on 2026-10-08 (`docs(roadmap): advance execution sequence after NPC pipeline`).
- PR #386 is an abandoned Draft and is not to be resumed or merged. Issue #381 was closed as `not_planned`.
- The replacement level-up implementation is complete: Issue #401 / PR #403, canonical HP dice integration #382 / PR #404, and ASI / feat / follow-up choices #383 / PR #405.
- Character Creator / 2024 foundation work #365, #376, #396, and #393 is complete.
- DevKit foundations #366, #408, #367, and #368 are complete through PRs #410–413.
- Issue #409 remains proposed backlog work for DevKit housekeeping.
- The curated roadmap identifies #369 (canonical BattleMap schema and edge semantics) as the next implementation, followed by #372 (canonical deterministic dice resolution), then #370 (random encounters).
- Issue #415 tracks the migration from Jules to ChatGPT + local Antigravity CLI. Complete and verify this workflow before starting the next implementation Issue.

### Level-up review lessons retained from #386–405

- Keep player-controlled progression separate from automatic eligibility and canonical state commits.
- Derive grants and choices from structured, versioned Atlas data rather than feature-description heuristics.
- Validate a fresh canonical progression step at the store commit boundary; do not trust mutable presentation-session state.
- HP dice must have one authoritative result; presentation must never reroll or override the mechanical result.
- Tests must exercise the real store / persistence entry point as well as pure helpers.
- Review the actual branch diff and CI evidence; stale PR descriptions and unverifiable test claims are review defects.

### Project sequencing rules

- `ROADMAP.md` records strategic order and factual progress, not detailed implementation scope.
- Every active task is represented by a GitHub Issue with explicit acceptance and verification criteria.
- ChatGPT may recommend sequencing after inspecting dependencies and repository evidence; Jaap approves product direction and scope.
- AGY implements only the assigned Issue and must not reorder the roadmap or promote unrelated work.
- Keep one active implementation Issue / branch / PR by default.
- No direct commits to `main`, no automated dispatch, and no merge without Jaap's explicit approval.
