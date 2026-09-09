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

2024 Backgrounds & Origins Foundation
✓ 16/16 PHB Origin Backgrounds in /backgrounds/json/24/, 10 Origin Feats in /feats/json/24/origin-feats/, ability score choice model (+2/+1 or +1/+1/+1), official markdown lore guides (/ui/official/backgrounds/*.md), and ruleset-aware resolution in Character Creator

Next active dependency: 2024 Feats integration / 2024 Spells migration
```

Spells currently resolve unversioned classic 2014 data, while Backgrounds, Subclasses, Species, and Base Classes resolve versioned `/24/` data with full ruleset-aware loaders.

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
| **Backgrounds / Origins** | Supported | **Implemented (16/16)** | Versioned directories exist (`/backgrounds/json/14/` vs `/24/`). All 16 2024 PHB Origin Backgrounds implemented with allowed ability scores, canonical Origin Feats, proficiencies, equipment, and official markdown guides in `/ui/official/backgrounds/*.md`. Loader returns `rulesetContext`. |
| **Feats** | Supported | **Implemented** | Versioned directories exist (`/feats/json/14/` vs `/24/`). Strict ruleset-aware resolution in place for Origin, General, Fighting Style, and Epic Boon subcategories with index_14.json / index_24.json catalogs and zero silent cross-ruleset fallbacks. |
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
- `fetchBackgroundData(index, ruleset)`: Checks `/assets/atlas/backgrounds/json/14/` vs `/24/`.
- `fetchFeatureData(index)`: Loads canonical feature JSON by ID (e.g. `bend_luck_wild_magic_2024`, `elemental_epitome_elements_2024`, `quivering_palm_open_hand_2024`).
