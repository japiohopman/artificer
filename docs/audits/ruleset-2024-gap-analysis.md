# 📊 Ruleset Data Audit & 2024 Gap Analysis

**Branch:** `feat/character-creator-species-mirror`
**Date:** August 31, 2026
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
The 2024 Species Foundation (Human, Dwarf, Elf, Halfling, Orc) and 2024 Class Foundation (12/12 core classes), along with complete 2024 levels 1-20 progressions and canonical 2024 class feature dependency layer for 4/12 classes (Fighter, Wizard, Cleric, Rogue), are fully implemented with ruleset-aware resolution:

```text
2024 Species Foundation
✓ 5/10 species (Human, Dwarf, Elf, Halfling, Orc)

2024 Class Foundation
✓ 12/12 core classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard)

2024 Class Progression
✓ 4/12 classes:
  - Fighter (levels 1-20)
  - Wizard (levels 1-20)
  - Cleric (levels 1-20)
  - Rogue (levels 1-20)

2024 Class Features
✓ 4/12 classes:
  - Fighter (features)
  - Wizard (features, including Spell Mastery at-will rules)
  - Cleric (features, including Blessed Strikes Improvement twice WIS mod temp HP, Channel Divinity Divine Spark/Turn Undead, Greater Divine Intervention Wish effect)
  - Rogue (features, including Level 1 Expertise skill proficiencies, Cunning Strike, Devious Strikes 2d6/6d6/3d6, and Stroke of Luck D20 Test)

Remaining 8 classes
→ progression/features still pending

Next active dependency: Backgrounds & Origins / Remaining 8 Classes Progression & Features
```

Subclasses, Backgrounds/Origins, and Spells currently resolve shared/unversioned classic 2014 data. Note: Foundation implemented ≠ complete 2024 coverage across all records.

Equipment (`14/` vs `24/`), Feats (`14/` vs `24/`), Classes (`14/` vs `24/`), Class Levels (`14/` vs `24/`), Rules (`14/` vs `24/`), and Tables (`14/` vs `24/`) have physical versioned directory structures in `public/assets/atlas/`. Canonical 2024 features reside in `public/assets/atlas/features/json/` with distinct `_2024` IDs for mechanically modified features.

> **Architectural Rule:**
> *A ruleset selector is only meaningful when the selected ruleset controls the underlying canonical data/rules resolution.*

---

## 2. Ruleset Support Matrix

| Domain | 2014 Status | 2024 Status | Resolution Path / Current State |
| :--- | :--- | :--- | :--- |
| **Species** | Supported | **Foundation Implemented** | Versioned directories exist (`/species/json/14/` vs `/24/`). 2024 species foundation dataset implemented for Human, Dwarf, Elf, Halfling, Orc. Loader returns `rulesetContext`. (Full coverage ongoing). |
| **Classes** | Supported | **Foundation Implemented** | Versioned directories exist (`/class/json/14/` vs `/24/`). All 12 core 2024 class definitions implemented (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard). |
| **Class Features** | Supported | **Implemented for 4/12 Classes** | Canonical 2024 feature definitions in `/assets/atlas/features/json/` for Fighter, Wizard, Cleric, and Rogue with distinct 2024 feature IDs (e.g., `second_wind_2024`, `action_surge_2024`, `tactical_mind_2024`, `indomitable_2024`, `scholar_wizard_2024`, `spell_mastery_wizard_2024`, `divine_order_cleric`, `channel_divinity_cleric_2024`, `sear_undead_cleric_2024`, `rogue_expertise_2024`, `cunning_strike_2024`, `devious_strikes_2024`, `reliable_talent_2024`, `stroke_of_luck_2024`). Remaining 8 classes pending. |
| **Level Progression** | Supported | **Implemented for 4/12 Classes** | Versioned folder `/class/levels/24/` populated with complete 1-20 level arrays and level files for Fighter, Wizard, Cleric, Rogue. Remaining 8 classes pending. |
| **Subclasses** | Supported | **Not Supported** | Resolves unversioned `/assets/atlas/subclasses/json/`. |
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
- `fetchFeatureData(index)`: Loads canonical feature JSON by ID (e.g. `action_surge_2024`, `cunning_strike_2024`).
