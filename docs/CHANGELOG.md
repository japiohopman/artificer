# Changelog

All notable changes to the Artificer project are documented here. The changelog is a project history; current implementation status belongs in `docs/PROGRESS.md`.

## [Unreleased] - 2026-08-11

### Added
- **Battle Map Editor architecture**: moved the editor into `src/components/devkit/BattleMapEditor/` as a dedicated authoring module.
- **Architecture Status**: added `docs/ARCHITECTURE_STATUS.md` as a living source of truth for architectural boundaries and coding-agent rules.
- **Battle Map module documentation**: documented authoring/runtime separation, map data, geometry, tools, persistence, performance and implementation phases.

### Changed
- **Component Map**: synchronized `docs/COMPONENT_MAP.md` with the current DevKit/BattleMapEditor structure.
- **Project Hub**: made `docs/PROJECT_HUB.md` the clearer canonical documentation entrypoint.
- **Task Board**: replaced the stale mixed historical/actionable list with an active engineering queue and explicit placeholder rules.
- **Project Progress**: updated `docs/PROGRESS.md` to reflect the current 2026 development state and Battle Map Editor work.

### Documentation policy
- Planned/scaffolded functionality is no longer documented as implemented.
- Major architectural decisions should be reflected in documentation in the same change that introduces them.

## [0.1.2] - 2025-02-21

### Added
- Integrated sound effects for 3D dice rolls via `soundService`.
- Added customizable dice colors in the `AdvancedRoller` panel.
- Expanded icon library with new subclass/core feature paths.

### Changed
- Refactored the World Panel visual presentation.
- Corrected Ability Score icon mapping.
- Enhanced Atlas mapping logic for subclasses and features.

## [0.1.1] - 2025-02-17

### Added
- Added `docs/STYLE_GUIDE.md`.
- Added deep-dive architecture and optimization reports.
- Added Atlas data-fetching and XP progression documentation.

## [0.1.0] - 2025-01-24

### Added
- Created the central `docs/` orchestration structure.
- Initialized `PROJECT_HUB.md`, `TASK_BOARD.md`, and `CHANGELOG.md`.
- Added module documentation placeholders.

### Changed
- Standardized sound asset hierarchy.
- Migrated legacy documentation to `docs/archive/`.
