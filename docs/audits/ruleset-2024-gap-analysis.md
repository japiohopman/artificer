# 📊 Ruleset Data Audit & 2024 Gap Analysis

**Branch:** `feat/character-creator-species-mirror`
**Date:** August 31, 2026
**Scope:** Evaluation of D&D 5e (2014) vs D&D 5.5e (2024) ruleset data support across Artificer Atlas datasets, storage loaders, and the Character Creator.

---

## 1. Executive Summary & Core Finding

### Critical Test Result
Selecting 2014 vs. 2024 in the Character Creator currently resolves the **EXACT SAME DATASET** for almost all core character creation steps:

```text
Select 2014 ruleset -> Fighter resolves /public/assets/atlas/class/json/fighter.json
Select 2024 ruleset -> Fighter resolves /public/assets/atlas/class/json/fighter.json (SAME FILE)

Select 2014 ruleset -> Human resolves /public/assets/atlas/species/json/human.json
Select 2024 ruleset -> Human resolves /public/assets/atlas/species/json/human.json (SAME FILE)

Select 2014 ruleset -> Acolyte resolves /public/assets/atlas/backgrounds/json/acolyte.json
Select 2024 ruleset -> Acolyte resolves /public/assets/atlas/backgrounds/json/acolyte.json (SAME FILE)
```

### Key Conclusion
While the Character Creator UI exposes a ruleset toggle (`2014` vs `2024`), **Artificer currently contains only a classic 2014 dataset for Species, Classes, Subclasses, Class Features, Backgrounds, and Spells.**

Only Equipment (`14/` vs `24/`), Feats (`14/` vs `24/`), Rules (`14/` vs `24/`), and Tables (`14/` vs `24/`) have physical versioned directory structures in `public/assets/atlas/`.

> **Architectural Rule:**
> *A ruleset selector is only meaningful when the selected ruleset controls the underlying canonical data/rules resolution.*

---

## 2. Ruleset Support Matrix

| Domain | 2014 Status | 2024 Status | Resolution Path / Current State |
| :--- | :--- | :--- | :--- |
| **Species** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/species/json/`. 2024 trait revisions and background ability score shifts are missing. |
| **Classes** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/class/json/`. 2024 class feature progression, level 3 subclass standardization, and weapon masteries are missing. |
| **Subclasses** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/subclasses/json/`. |
| **Class Features** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/features/json/`. |
| **Backgrounds / Origins** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/backgrounds/json/`. 2024 Origin Feats and +3 ability score choices are missing. |
| **Feats** | Supported | **Partial** | Versioned directories exist (`/feats/json/14/` vs `/24/`). 2024 origin, general, and epic boon feats populated in `/24/`. |
| **Equipment** | Supported | **Partial** | Versioned directories exist (`/equipment/json/14/` vs `/24/`). |
| **Spells** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/spell/json/`. 2024 spell text/scaling updates missing. |
| **Spellcasting Rules** | Supported | **Not Supported** | Embedded in classic 2014 class JSON records. |
| **Level Progression** | Supported | **Partial** | Versioned folder `/class/levels/14/` exists; `/class/levels/24/` is unpopulated. |
| **Starting Equipment** | Supported | **Not Supported** | Hardcoded in `CLASS_DATA` (`characterUtils.ts`) and 2014 background JSON records. |
| **Proficiencies** | Supported | **Not Supported** | Derived from 2014 `CLASS_DATA` and 2014 background templates. |
| **Derived Calculations** | Supported | **Not Supported** | Standard 2014 formulas (HP, AC, Initiative). |

---

## 3. Data Flow & Loader Trace

### Character Creator Flow
1. Player selects ruleset in `WelcomeStep.tsx` -> updates `newChar.ruleset` ('2014' | '2024') in `CharacterCreator.tsx`.
2. `CharacterCreator` synchronizes `useGameStore.getState().setRuleset(ruleset)`.
3. In `storageService.ts`, loaders use `getActiveRulesetContext(ruleset)` and `getRulesetVersionFolder(ruleset)` ('14' vs '24').

### Where Versioning Works
- `fetchEquipmentData(index, ruleset)`: Checks `/assets/atlas/equipment/json/14/` vs `/24/`.
- `fetchFeatData(index, ruleset)`: Checks `/assets/atlas/feats/json/14/` vs `/24/`.
- `fetchClassLevels(classIndex, ruleset)`: Checks `/assets/atlas/class/levels/14/` vs `/24/`.
- `fetchMonsterData(index, ruleset)`: Checks `/assets/atlas/enemies/json/14/` vs `/24/`.

### Where Versioning Breaks (Missing Loaders)
The following core loaders in `storageService.ts` and `atlasService.ts` **do NOT accept a `ruleset` parameter** and query unversioned root folders:
- `fetchSpeciesData(index)` -> `/assets/atlas/species/json/${index}.json`
- `fetchClassData(index)` -> `/assets/atlas/class/json/${index}.json`
- `fetchBackgroundData(index)` -> `/assets/atlas/backgrounds/json/${index}.json`
- `fetchSubraceData(index)` -> `/assets/atlas/subraces/json/${index}.json`
- `fetchFeatureData(index)` -> `/assets/atlas/features/json/${index}.json`

---

## 4. Foundry dnd5e 6.0.x Source Reference Comparison

The Foundry dnd5e v6.0.x repository contains explicit 2024 source packages. The table below maps Artificer datasets against Foundry 2024 source locations for future ingestion:

| Domain | Artificer Dataset Path | Foundry 6.0.x 2024 Source Location | Ingestion Priority |
| :--- | :--- | :--- | :--- |
| **Species / Races** | `public/assets/atlas/species/json/` | `packs/_source/origins24/species/` | High (Phase 2) |
| **Backgrounds** | `public/assets/atlas/backgrounds/json/` | `packs/_source/origins24/backgrounds/` | High (Phase 2) |
| **Classes** | `public/assets/atlas/class/json/` | `packs/_source/classes24/` | High (Phase 2) |
| **Subclasses** | `public/assets/atlas/subclasses/json/` | `packs/_source/subclasses24/` | Medium (Phase 2) |
| **Class Features** | `public/assets/atlas/features/json/` | `packs/_source/classfeatures24/` | Medium (Phase 2) |
| **Feats** | `public/assets/atlas/feats/json/24/` | `packs/_source/feats24/` | Partially Ingested |
| **Spells** | `public/assets/atlas/spell/json/` | `packs/_source/spells24/` | Low (Phase 3) |

---

## 5. Recommended Target Atlas Data Architecture

To achieve true 2014 / 2024 ruleset isolation without duplicating shared assets (such as monster artwork or generic equipment images), the filesystem structure must follow a clean versioned subfolder hierarchy:

```text
public/assets/atlas/
├── species/
│   ├── index.json
│   └── json/
│       ├── 14/         <-- 2014 Species (Human, Dwarf, Elf, etc.)
│       └── 24/         <-- 2024 Revised Species (2024 Species Traits)
├── class/
│   ├── index.json
│   ├── json/
│   │   ├── 14/         <-- 2014 Core Classes
│   │   └── 24/         <-- 2024 Revised Classes
│   └── levels/
│       ├── 14/         <-- 2014 Level progression tables
│       └── 24/         <-- 2024 Level progression tables
├── backgrounds/
│   ├── index.json
│   └── json/
│       ├── 14/         <-- 2014 Backgrounds
│       └── 24/         <-- 2024 Origins & Backgrounds (with Origin Feats)
├── feats/
│   ├── json/
│   │   ├── 14/         <-- 2014 Feats
│   │   └── 24/         <-- 2024 Feats (origin-feats, general-feats, etc.)
├── spell/
│   ├── index.json
│   └── json/
│       ├── 14/         <-- 2014 Spells
│       └── 24/         <-- 2024 Spells
└── equipment/
    ├── index.json
    └── json/
        ├── 14/         <-- 2014 Equipment
        └── 24/         <-- 2024 Equipment
```

### Data Resolution Rules
1. **Version First:** All Atlas loaders must accept `ruleset?: '2014' | '2024'`, deriving `versionFolder` ('14' vs '24').
2. **Fallback Chain:**
   `public/assets/atlas/<domain>/json/${versionFolder}/${index}.json`
   → `public/assets/atlas/<domain>/json/${index}.json` (unversioned root fallback)
   → `public/assets/atlas/<domain>/json/${altFolder}/${index}.json`
3. **Explicit Context Tagging:** All loaded domain records must attach `rulesetContext: '2014' | '2024'` to the returned object, indicating the actual resolved version.
4. **Shared Artwork:** Images (`/assets/ui/official/`, `/assets/atlas/<domain>/images/`) remain unversioned and shared across rulesets.

---

## 6. Recommended Next Steps

1. **Loader Versioning (Immediate):** Update `fetchSpeciesData`, `fetchClassData`, `fetchBackgroundData`, `fetchSubraceData`, and `fetchFeatureData` to accept `ruleset?: '2014' | '2024'` and resolve through `versionFolder` ('14' vs '24').
2. **2024 Data Ingestion Pipeline (Next Phase):** Ingest 2024 Species (`origins24/species`), 2024 Backgrounds (`origins24/backgrounds`), and 2024 Classes (`classes24`) into `/assets/atlas/<domain>/json/24/`.
3. **Character Creator UI Notice (Current Phase):** In `WelcomeStep.tsx`, clarify that 2024 Revised ruleset selection activates available 2024 Origin Feats, Weapon Masteries, and 2024 Equipment while core species/class templates use 2014 rules until the 2024 Atlas dataset ingestion is complete.
