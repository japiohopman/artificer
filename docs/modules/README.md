# Artificer Modules

This directory contains **current module-level documentation** for Artificer.

Module documentation answers:

- What does this module own?
- Where does its implementation live?
- What state/data does it use?
- How does it interact with other modules?
- What is actually implemented today?
- What are its known limitations?
- What work is planned?

## Documentation rules

### Status vocabulary

Use these terms consistently:

- **Implemented** — working behavior exists and is verified.
- **In progress** — actively being implemented.
- **Scaffolded** — architecture/UI exists, but behavior is incomplete.
- **Planned** — design exists; implementation has not started.
- **Historical** — no longer current; belongs in `docs/archive/`.

A placeholder button, panel or component is **not** an implemented feature.

### Module vs system documentation

Use `docs/modules/` for one feature/domain module.

Use `docs/systems/` when the subject describes a cross-cutting architectural system or contract, such as data flow or tactical runtime behavior.

Use `docs/FUTURE_MODULES.md` for future modules and broader design direction.

Use `docs/TASK_BOARD.md` for actionable work, not module documentation checklists.

## Current modules

| Module | Status | Documentation |
|---|---|---|
| Atlas Service | Implemented / evolving | `atlasService.md` |
| Character Creation | Implemented / evolving | `character_creation_architecture.md` |
| Dice System | Implemented | `dice_system.md` |
| Inventory | Implemented / evolving | `inventory_v2.md` |
| Journal | Implemented / evolving | `journal.md` |
| Battle Map Editor | In progress | `mapEditor.md` |
| DevKit | Implemented / evolving | `devkit_workings.md` |
| Jane World Builder | In progress / evolving | `jane_world_builder.md` |
| Sound Service | Implemented / evolving | `soundService.md` |
| Save Service | Implemented / evolving | `saveService.md` |
| Skills | Implemented / evolving | `skills.md` |
| Minigames | Evolving | `minigames.md` |

## Supporting technical documents

The following documents are useful but are not necessarily standalone product modules:

- `icons.md` — icon/asset architecture
- `performance_optimization.md` — legacy optimization material; see archive/reports status before using it as guidance
- `tactical_combat_blueprint.md` — tactical design/roadmap; current runtime architecture is in `docs/systems/TACTICAL_COMBAT_ENGINE.md`

## Missing documentation

Module documentation should be added when a substantial domain exists in the source tree and agents need architectural guidance to work on it safely.

Candidates must be confirmed against the current source tree before adding a document. Do not create documentation merely because a name appears in an old roadmap.

## Related documentation

- `docs/ARCHITECTURE_STATUS.md` — architectural contract
- `docs/systems/` — cross-cutting systems
- `docs/COMPONENT_MAP.md` — source/component map
- `docs/FUTURE_MODULES.md` — future architecture
- `docs/TASK_BOARD.md` — active work
- `docs/PROGRESS.md` — project status
