# 📇 Artificer Documentation Index

Welcome to the central documentation index for the Artificer project. This file is the navigation layer for humans and AI agents; it is not an execution queue.

## 🧭 Workflow hierarchy & contract precedence

Development execution contracts follow a strict precedence hierarchy:

1. **Assigned GitHub Issue** → authoritative execution contract
2. **Specialist contract (`.github/agents/*`)** → domain constraints and routing
3. **`AGENT.MD` & `AGENT_RULES.md`** → shared agent guidance and safety rules
4. **Canonical reference context** → source code, tests, and named documentation
5. **`GOALS.md` & `ROADMAP.md`** → strategic priority and long-term vision context (non-execution authorities)

`docs/WORKFLOW.md` defines the authoritative operating model.

`docs/TASK_BOARD.md` is retained strictly as a historical migration/reference document and is **not** an active execution queue.

`CHATGPT.md` is advisory working memory maintained by ChatGPT; implementation agents treat it as read-only.

## 🗺️ Navigation

- **[Operating Model & Workflow](./docs/WORKFLOW.md)** - 🛠️ **Authoritative workflow, role contracts, and repository autonomy guide.**
- **[ChatGPT Project Memory](./CHATGPT.md)** - 🧠 **ChatGPT-maintained advisory project memory & working context (non-authoritative).**
- **[Master Project Goals](./GOALS.md)** - 🎯 Long-term project direction.
- **[Project Hub](./docs/PROJECT_HUB.md)** - Main documentation navigation and system index.
- **[Phase Safety Gate](./docs/PHASE_SAFETY_GATE.md)** - 🛡️ Persistent issue/PR contract and automated safety checks.
- **[Architecture & Capability Map](./docs/ARCHITECTURE_CAPABILITY_MAP.md)** - 🏛️ **Authoritative domain, capability, gameplay gap, and specialist agent map.**
- **[Architecture](./docs/modules/atlasService.md)** - Technical overview of the Atlas Service.
- **[Sound System](./docs/modules/soundService.md)** - Audio engine architecture.
- **[Audio Registry](./docs/systems/AUDIO_REGISTRY.md)** - Index of sound assets.
- **[Crafting System](./docs/systems/CRAFTING_SYSTEM.md)** - ⚒️ Material and recipe architecture.
- **[Quest System](./docs/systems/QUEST_SYSTEM.md)** - ⚔️ Quest and mission architecture.
- **[AI Orchestration](./docs/systems/AI_ORCHESTRATION.md)** - 🎭 Narrator vs. engine architecture.
- **[Foundry VTT Porting Guide](./docs/systems/FOUNDRY_PORTING_GUIDE.md)** - VTT system mapping and porting reference.
- **[Dice & Chat](./docs/modules/dice_system.md)** - 3D dice and AI chat systems.
- **[Icon System](./docs/modules/icons.md)** - 🎨 Custom icon mapping and architecture.
- **[Skill Database](./docs/modules/skills.md)** - 📊 Skill database and proficiency specification.
- **[Deep Dive Report](./docs/reports/DEEP_DIVE_RAPPORT.md)** - Analysis and historical technical findings.
- **[Optimization Strategy](./docs/reports/OPTIMALISATIE_ADVIES.md)** - Evaluation and scaling analysis.
- **[Future Modules](./docs/FUTURE_MODULES.md)** - Blueprint/reference for future systems.

## 🤖 Specialist agent contracts

These are the active repository-local specialist contracts:

- [Architecture Specialist](./.github/agents/architecture-specialist.agent.md)
- [Ruleset & Data Specialist](./.github/agents/ruleset-data-specialist.agent.md)
- [UI Specialist](./.github/agents/ui-specialist.agent.md)
- [Assets Specialist](./.github/agents/assets-specialist.agent.md)
- [Gameplay Specialist](./.github/agents/gameplay-specialist.agent.md)
- [Verification Specialist](./.github/agents/verification-specialist.agent.md)

Legacy named-agent instruction files are retained as migration/history material and are not active routing targets.

## 📂 Key Directories

- `/src` - Frontend application logic.
- `/public/assets/atlas` - Canonical Atlas data and assets.
- `/docs` - Architecture, systems, status, and reference documentation.
- `/.github/agents` - Active specialist contracts.
- `/skills` - LLM/agent skill definitions.

---
*Note: Documentation links should describe current repository structure and workflow contracts. Do not use this index as a task queue.*
