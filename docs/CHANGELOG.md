# Changelog

All notable changes to the Artificer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-02-21
### Added
- Integrated sound effects for 3D dice rolls via `soundService`.
- Added customizable dice colors in the `AdvancedRoller` panel.
- Expanded icon library with new paths for subclasses (Thief, Life Domain, Open Hand, Assassin, Battle Master, Eldritch Knight) and core features.

### Changed
- Refactored `WorldPanel` aside with 'Parchment & Dragonstone' aesthetic and enhanced location/temporal data.
- Corrected Ability Score icon mapping in `CharacterProfile`.
- Enhanced `atlasUtils` mapping logic to strip prefixes and resolve specific subclasses and features automatically.

## [0.1.1] - 2025-02-17
### Added
- Added `docs/STYLE_GUIDE.md` defining the "Parchment & Dragonstone" aesthetic and visual language.
- Created `docs/reports/DEEP_DIVE_RAPPORT.md` providing a comprehensive analysis of Character Creation, Class systems, and Leveling logic.
- Created `docs/reports/OPTIMALISATIE_ADVIES.md` evaluating system architecture and providing scaling recommendations.
- Documentation for internal Atlas data fetching and XP progression mechanics.

## [0.1.0] - 2025-01-24
### Added
- Created `docs/` structure for central project orchestration.
- Initialized `PROJECT_HUB.md`, `TASK_BOARD.md`, and `CHANGELOG.md`.
- Added module documentation placeholders.

### Changed
- Restructured `public/assets/sounds/` to a standardized hierarchy.
- Migrated legacy documentation to `docs/archive/`.
