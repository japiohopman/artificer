# 🧠 CHATGPT.md — ChatGPT Project Memory & Advisory Context

> **MAINTENANCE & AUTHORITY NOTICE FOR ALL AGENTS AND CONTRIBUTORS**
> - **Maintained by ChatGPT**: This file is a durable project-memory note maintained by ChatGPT across chat sessions. Jaap is not expected to maintain it manually.
> - **Read-Only for Implementation Agents**: Jules and other automated implementation agents must treat `CHATGPT.md` as **read-only** and must **NOT** edit, mutate, or update this file.
> - **Non-Authoritative / Advisory Only**: This file provides non-authoritative working context and architectural memory. It is **NOT** an execution queue, task database, source of implementation scope, or dispatch contract for Jules.
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

**Key Rule:** These capabilities are **project-management functions**, not execution authority over Jules. Implementation scope for Jules exists strictly within assigned GitHub Issues passing the Issue Quality Gate.

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

## 🤝 Operational Workflow & Collaboration Conventions

1. **Issue-First Execution**:
   - GitHub Issues passing Issue Quality Gate v2 serve as the authoritative contract for Jules.
   - One-at-a-time preflight model prevents duplicate session dispatches (`.github/workflows/jules-issue-dispatcher.yml`).
   - Live session creation requires manual workflow dispatch with exact confirmation `DISPATCH`.
2. **Review & PR Lifecycle**:
   - Review fixes remain on the active task branch and open PR.
   - Material scope expansion requires a separate GitHub Issue created for sequential dispatch after the active task reaches a terminal state (merged or closed).
   - Only Jaap merges Pull Requests into `main`.
3. **Context Recovery**:
   - Fresh AI chats reconstruct repository state by reading: Assigned GitHub Issue → Specialist Contract (`.github/agents/*`) → `AGENT.MD` & `AGENT_RULES.md` → Canonical Reference Context → Source code.
   - Missing context is never inferred from chat memory.

---

## 📜 Key Architectural History & Lessons Learned
- **Foundry Enemy Parity Audit (#358)**: Enemy data is mapped 1:1 with Foundry source records (`14` and `24`), retaining WebP images as shared media while maintaining token artwork under `/enemies/tokens/`.
- **Subclass Domain (#351)**: 2024 subclasses load 4 canonical options per class from `/subclasses/json/24/`.
- **Feat & Background Domain (#353, #355)**: 2024 origin backgrounds integrate origin feats and ability score allocation rules (+2/+1 or +1/+1/+1).
- **Z-Index Layering Standard**: Global UI surfaces adhere to explicit constants in `src/constants/uiStack.ts`.


---

## 🧭 Current Project Control & Sequencing Model — 2026-09-29

### ChatGPT-owned sequencing

ChatGPT is the project sequencing and review layer for Artificer together with Jaap. The durable execution contract remains the GitHub Issue. ChatGPT may determine which well-formed Issue should become the next `ready` candidate after inspecting repository evidence, dependencies, open PRs, and current architectural state.

The important distinction is:

- **ROADMAP.md** records the curated project order and factual progress.
- **GitHub Issue** contains the authoritative implementation contract, acceptance criteria, verification plan, and specialist routing.
- **`status: ready`** means an Issue has passed the Issue Quality Gate and is intentionally released for dispatch.
- **Jules** implements only its assigned Issue and may report factual progress for that Issue; Jules does not choose the next project task.
- **Automation** may advance the next pre-approved Issue only after the current execution context is verified terminal and the next Issue still passes all gates.

The roadmap therefore becomes a sequencing aid, not a second task database or source of implementation scope.

### Current foundation sequence

The current character/ruleset lane is intentionally ordered as follows:

1. **#387 — Roadmap sequencing & automatic readiness handoff** — completed and merged workflow foundation.
2. **#365 — 2024 species source parity** — completed and merged.
3. **#376 — Remaining 2024 runtime gaps** — completed and merged.
4. **#396 — Restore runtime Species selection data loading** — active discovered blocker; must be resolved before #393.
5. **#393 — Character Creator stability checkpoint** — blocked until #396 is resolved and the real runtime flow is re-verified.
6. **#381 — Player-controlled level-up lifecycle** — resume only after the foundation and creator flow are stable.
7. **#382 — Canonical level-up HP/dice integration** — build on #381 without mixing dice-engine redesign into the lifecycle work.
8. **#383 — Canonical feature/ASI/feat/follow-up choices** — build the generic progression-choice chain on the stabilized lifecycle.

This order is deliberately different from simply sorting all `ready` Issues by numeric priority. A technically valid Issue can still be strategically premature because an upstream foundation is incomplete.

### Level-up work parked

PR #386 is intentionally parked as a Draft. Its implementation contains useful lifecycle groundwork, but the complete feature should not be merged into `main` while the 2024 ruleset foundation and Character Creator stability are still being established.

Observed lessons from the #386 review loop:

- shared Character UI changes can affect Character Creator navigation and therefore need end-to-end browser regression coverage;
- automatic progression gains, player choices, and canonical resource state must be kept distinct;
- showing a calculated spell-slot change without committing the canonical `Character.spellSlots` state is an incomplete feature, not merely a presentation issue;
- level-up HP should begin with the player's method choice, then resolve the authoritative roll once, without presenting reroll as an arbitrary extra gameplay decision;
- fail-closed helper tests should also prove the real store entrypoint, not only an isolated pure/helper function;
- stale PR descriptions and test-count claims are review defects and should be corrected before approval.

### Dispatcher lesson

The Issue-first sequencing model from **#387** is now active. The current lesson is that a newly discovered blocking Issue must also be inserted into the curated sequence when the live selector needs to dispatch it; otherwise a valid `ready` Issue outside the sequence is intentionally not selected. The current sequence therefore places **#396 before #393** and keeps #393 non-ready until the blocker is resolved.

### Jules handoff convention

For future implementation PRs, the Jules handoff should explicitly state:

- what was completed for the assigned Issue;
- what verification actually passed;
- what roadmap checkpoint was updated, when applicable;
- any newly discovered follow-up Issue numbers.

Jules must not silently reorder the roadmap, promote unrelated Issues to `ready`, or create a new execution queue.
