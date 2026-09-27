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
