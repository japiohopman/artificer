# 📊 Ruleset Data Audit & 2024 Gap Analysis

**Branch:** `feat/2024-subclasses-foundation`
**Date:** March 2026
**Scope:** Evaluation of D&D 5e (2014) vs D&D 5.5e (2024) ruleset data support across Artificer Atlas datasets, storage loaders, and the Character Creator.

---

## 1. Executive Summary & Core Finding

### Critical Test Result
Selecting 2014 vs. 2024 in the Character Creator resolves canonical datasets with ruleset-aware resolution for implemented domains:

```text
Select 2014 ruleset -> Fighter resolves /public/assets/atlas/class/json/14/fighter.json
Select 2024 ruleset -> Fighter resolves /public/assets/atlas/class/json/24/fighter.json (VERSIONED)

Select 2014 ruleset -> Human resolves /public/assets/atlas/species/json/14/human.json
Select 2024 ruleset -> Human resolves /public/assets/atlas/species/json/24/human.json (VERSIONED)
```

### Key Conclusion
The 2024 Species Foundation (Human, Dwarf, Elf, Halfling, Orc), 2024 Class Foundation, Progressions, Feature Definitions, and Subclasses for all 12 core classes are fully implemented with ruleset-aware resolution derived from official 2024 D&D Player's Handbook mechanics:

```text
2024 Species Foundation
✓ 5/10 species (Human, Dwarf, Elf, Halfling, Orc)

2024 Base Class Definitions
✓ 12/12 core base class JSONs in /assets/atlas/class/json/24/

2024 Class Progressions & Feature Definitions (All 12 Core Classes)
✓ 12/12 core classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard complete for levels 1–20 and canonical 2024 features)

2024 Subclasses & Subclass Features (All 12 Core Classes)
✓ 48/48 canonical subclasses fully audited and verified across all 12 core classes (4 subclasses per class)

Next active dependency: 2024 Backgrounds & Origins / Origin Feats / 2024 Spells
```

Backgrounds/Origins and Spells currently resolve shared/unversioned classic 2014 data, while Subclasses resolve versioned `/24/` data for all 48 canonical 2024 subclasses across all 12 core classes.

Equipment (`14/` vs `24/`), Feats (`14/` vs `24/`), Classes (`14/` vs `24/`), Class Levels (`14/` vs `24/`), Subclasses (`14/` vs `24/`), Rules (`14/` vs `24/`), and Tables (`14/` vs `24/`) have physical versioned directory structures in `public/assets/atlas/`. Canonical 2024 features reside in `public/assets/atlas/features/json/` with distinct `_2024` IDs for mechanically modified features.

> **Architectural Rule:**
> *A ruleset selector is only meaningful when the selected ruleset controls the underlying canonical data/rules resolution.*

---

## 2. Ruleset Support Matrix

| Domain | 2014 Status | 2024 Status | Resolution Path / Current State |
| :--- | :--- | :--- | :--- |
| **Species** | Supported | **Foundation Implemented** | Versioned directories exist (`/species/json/14/` vs `/24/`). 2024 species foundation dataset implemented for Human, Dwarf, Elf, Halfling, Orc. Loader returns `rulesetContext`. |
| **Classes (Base)** | Supported | **Implemented (12/12)** | Versioned directories exist (`/class/json/14/` vs `/24/`). All 12 core 2024 base class definitions implemented in `/assets/atlas/class/json/24/`. |
| **Class Progressions (1-20)** | Supported | **Implemented (12/12)** | Versioned folder `/class/levels/24/` populated with complete 1-20 base level files for all 12 core classes. |
| **Class Features** | Supported | **Implemented (12/12)** | Canonical 2024 feature definitions in `/assets/atlas/features/json/` for all 12 core classes with distinct `_2024` IDs. |
| **Subclasses & Subclass Features** | Supported | **Implemented (48/48)** | Versioned directories exist (`/subclasses/json/14/` vs `/24/`). All 48 canonical 2024 subclasses audited and implemented across all 12 core classes (4 per class) with ruleset-aware resolution. |
| **Backgrounds / Origins** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/backgrounds/json/`. 2024 Origin Feats and +3 ability score choices are missing. |
| **Feats** | Supported | **Partial** | Versioned directories exist (`/feats/json/14/` vs `/24/`). 2024 origin, general, and epic boon feats populated in `/24/`. |
| **Equipment** | Supported | **Partial** | Versioned directories exist (`/equipment/json/14/` vs `/24/`). |
| **Spells** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/spell/json/`. 2024 spell text/scaling updates missing. |
| **Spellcasting Rules** | Supported | **Supported** | Embedded in versioned 2024 class and level JSON records. |
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
- `fetchClassData(index, ruleset)`: Checks `/assets/atlas/class/json/14/` vs `/24/`.
- `fetchClassLevels(classIndex, ruleset)`: Checks `/assets/atlas/class/levels/14/` vs `/24/`.
- `fetchSpeciesData(index, ruleset)`: Checks `/assets/atlas/species/json/14/` vs `/24/`.
- `fetchEquipmentData(index, ruleset)`: Checks `/assets/atlas/equipment/json/14/` vs `/24/`.
- `fetchFeatData(index, ruleset)`: Checks `/assets/atlas/feats/json/14/` vs `/24/`.
- `fetchMonsterData(index, ruleset)`: Checks `/assets/atlas/enemies/json/14/` vs `/24/`.
- `fetchSubclassData(index, ruleset)`: Checks `/assets/atlas/subclasses/json/14/` vs `/24/`.
- `fetchFeatureData(index)`: Loads canonical feature JSON by ID (e.g. `bend_luck_wild_magic_2024`, `elemental_epitome_elements_2024`, `quivering_palm_open_hand_2024`).
