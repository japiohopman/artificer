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
The 2024 Species Foundation (Human, Dwarf, Elf, Halfling, Orc) and 2024 Class Foundation, Progressions, and Feature Definitions for Fighter, Wizard, Cleric, and Rogue are fully implemented with ruleset-aware resolution derived from official 2024 D&D PHB mechanics and Foundry `classes24` structural mapping:

```text
2024 Species Foundation
✓ 5/10 species (Human, Dwarf, Elf, Halfling, Orc)

2024 Base Class Definitions
✓ 12/12 core base class JSONs in /assets/atlas/class/json/24/

2024 Class Progressions & Feature Definitions (Active 4 Classes)
✓ Fighter (Levels 1-20 progression & canonical 2024 feature definitions)
✓ Wizard (Levels 1-20 progression & canonical 2024 feature definitions)
✓ Cleric (Levels 1-20 progression & canonical 2024 feature definitions)
✓ Rogue (Levels 1-20 progression & canonical 2024 feature definitions)

2024 Class Progressions (Remaining 8 Classes)
⏳ Pending (Barbarian, Bard, Druid, Monk, Paladin, Ranger, Sorcerer, Warlock)

2024 Subclasses & Subclass Features
✓ Implemented 6 subclasses across 4 supported 2024 classes (Fighter: Champion, Battle Master; Wizard: Evoker; Cleric: Life Domain; Rogue: Thief, Assassin)
⏳ Pending remaining 2024 subclasses for Barbarian, Bard, Druid, Monk, Paladin, Ranger, Sorcerer, Warlock

Next active dependency: 2024 Progressions for remaining 8 classes / remaining 2024 Subclasses / 2024 Backgrounds & Origins / Origin Feats
```

Subclasses, Backgrounds/Origins, and Spells currently resolve shared/unversioned classic 2014 data. Note: Base foundation implemented ≠ complete 2024 coverage across all subclass/origin records.

Equipment (`14/` vs `24/`), Feats (`14/` vs `24/`), Classes (`14/` vs `24/`), Class Levels (`14/` vs `24/`), Rules (`14/` vs `24/`), and Tables (`14/` vs `24/`) have physical versioned directory structures in `public/assets/atlas/`. Canonical 2024 features reside in `public/assets/atlas/features/json/` with distinct `_2024` IDs for mechanically modified features.

> **Architectural Rule:**
> *A ruleset selector is only meaningful when the selected ruleset controls the underlying canonical data/rules resolution.*

---

## 2. Ruleset Support Matrix

| Domain | 2014 Status | 2024 Status | Resolution Path / Current State |
| :--- | :--- | :--- | :--- |
| **Species** | Supported | **Foundation Implemented** | Versioned directories exist (`/species/json/14/` vs `/24/`). 2024 species foundation dataset implemented for Human, Dwarf, Elf, Halfling, Orc. Loader returns `rulesetContext`. |
| **Classes (Base)** | Supported | **Implemented (12/12)** | Versioned directories exist (`/class/json/14/` vs `/24/`). All 12 core 2024 base class definitions implemented in `/assets/atlas/class/json/24/`. |
| **Class Progressions (1-20)** | Supported | **Implemented (4/12)** | Versioned folder `/class/levels/24/` populated with complete 1-20 base level files for Fighter, Wizard, Cleric, and Rogue. |
| **Class Features** | Supported | **Implemented (4/12)** | Canonical 2024 feature definitions in `/assets/atlas/features/json/` for Fighter, Wizard, Cleric, and Rogue with distinct `_2024` IDs. |
| **Subclasses & Subclass Features** | Supported | **Implemented (4/12 classes)** | Versioned directories exist (`/subclasses/json/14/` vs `/24/`). 6 subclasses implemented for Fighter, Wizard, Cleric, Rogue with ruleset-aware resolution. |
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
- `fetchFeatureData(index)`: Loads canonical feature JSON by ID (e.g. `action_surge_2024`, `improved_critical_champion_2024`, `sculpt_spells_2024`).

---

## 4. Foundry dnd5e `classes24` Ingestion Pipeline & Source Provenance

The 2024 class progression files (`public/assets/atlas/class/levels/24/`) and feature definitions (`public/assets/atlas/features/json/`) are generated via deterministic NodeJS authoring scripts located in `tools/`:

* `tools/generate_2024_classes.cjs`
* `tools/generate_2024_features.cjs`
* `tools/generate_2024_class_levels.cjs`

### Mapping Rules from Foundry `classes24` Source
1. **Source Mapping:** Structural data maps directly from official 2024 PHB rules and Foundry dnd5e `6.0.x` `packs/_source/classes24/` schema definitions.
2. **Canonical Versioned Feature IDs:** Every 2024 feature is assigned a versioned canonical index ending in `_2024` (or class-prefixed e.g. `spellcasting_wizard_2024`, `rogue_expertise_2024`) to guarantee zero silent resolution to 2014 records.
3. **Structured Mechanical Metadata:** Complex mechanics are represented as first-class JSON fields (e.g. `feature_specific.at_will_casting`, `feature_specific.save_dc`, `weapon_mastery.count`).
4. **Availability Truth:** `storageService.ts` gates runtime selection of 2024 classes via `SUPPORTED_2024_CLASSES = ['fighter', 'wizard', 'cleric', 'rogue']`, exposing only fully playable classes while preserving strict 2024/2014 boundaries.
