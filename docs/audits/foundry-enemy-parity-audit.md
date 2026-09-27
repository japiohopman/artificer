# Foundry 2014 / 2024 Enemy Source Parity Audit & Architecture Specification

> **Issue:** #358
> **Status:** Completed Audit & Architecture Contract
> **Owner:** Ruleset & Data Specialist
> **Target Dataset:** Foundry VTT dnd5e v6.0.x SRD Source
> **Reproducible Verification Script:** `node tools/auditFoundryParity.cjs`

---

## 1. Executive Summary & Problem Context

Artificer's enemy dataset was historically imported flat into `public/assets/atlas/enemies/json/<id>.json` without explicit ruleset hierarchy (`14/` vs `24/`) or canonical category structure. Furthermore, two distinct indexing paradigms existed simultaneously:

1. **Foundry-ID Indexing**: Import tools used lowercased 16-character Foundry `_id` strings (e.g. `shhhte7b92pefcwb` for Aboleth) as the file index.
2. **Legacy Human-Readable Indexing**: Category definitions (`public/assets/atlas/enemies_categories/`) referenced human-readable slugs (e.g. `aboleth`, `beholder`, `mind_flayer`).

When Foundry v6.0.x introduced the 2024 ruleset under `packs/_source/actors24/`, same-named creatures (such as *Adult Black Dragon*) received distinct stat blocks, distinct 2024 ruleset context (`system.source.rules: '2024'`), and distinct Foundry IDs (`M4eX4Mu5IHCr3TMf` for 2014 vs `mmAdultBlackDrag` for 2024).

This audit establishes:
- Complete record counts and category trees for both Foundry 2014 and 2024 enemy sources (reproducible via `node tools/auditFoundryParity.cjs`).
- Complete classification of all 379 current repository enemy records.
- Reusable monster feature audit across 2014 (`monsterfeatures`) and 2024 (`monsterfeatures24`) sources.
- A combat capability matrix comparing Foundry activity semantics against Artificer's runtime combat contract.
- A media reconciliation matrix restoring curated non-grid artwork (`enemies/images/`) and separating tactical tokens (`enemies/tokens/`).
- An evidence-backed target ruleset-first directory hierarchy and migration plan.

---

## 2. Foundry v6.0.x Enemy Source Audit

A complete audit of the authoritative Foundry v6.0.x source tree (`packs/_source/`) yielded the following exact record counts and category breakdowns:

### 2.1 2014 Source (`packs/_source/monsters/`)
- **Total Files**: 352 files across 15 categories (337 actor records + 15 `_folder.yml` category descriptors).
- **Category Breakdown**:
  | Category | File Count | Description |
  | :--- | :--- | :--- |
  | `aberration` | 6 | Aboleth, Chuul, Cloaker, Gibbering Mouther, Otyugh (+ folder) |
  | `beast` | 99 | Standard 2014 beasts (Ape, Bear, Wolf, etc.) |
  | `celestial` | 7 | Deva, Planetar, Solar, Couatl, Pegasus, Unicorn |
  | `construct` | 10 | Animated Armor, Golems, Shield Guardian |
  | `dragon` | 44 | Chromatic & Metallic Dragons (Wyrmlings to Ancients) |
  | `elemental` | 17 | Elementals, Mephits, Djinni, Efreeti, Salamander |
  | `fey` | 7 | Blink Dog, Dryad, Green Hag, Satyr, Sea Hag, Sprite |
  | `fiend` | 24 | Demons, Devils, Hell Hound, Imp, Quasit, Succubus |
  | `giant` | 11 | Ettin, Hill/Frost/Fire/Cloud/Stone/Storm Giants, Ogre, Oni, Troll |
  | `humanoid` | 41 | Acolyte, Bandit, Cultist, Drow, Goblin, Orc, Guards |
  | `monstrosity` | 40 | Basilisk, Bulette, Chimera, Gorgon, Griffon, Hydra, Minotaur, Owlbear |
  | `ooze` | 5 | Black Pudding, Gelatinous Cube, Gray Ooze, Ochre Jelly |
  | `plant` | 7 | Awakened Shrub/Tree, Shambling Mound, Shrieker, Violet Fungus |
  | `summons` | 14 | Arcane Hand, Dancing Lights, Mage Hand, Unseen Servant |
  | `undead` | 20 | Ghost, Ghoul, Lich, Mummy, Skeleton, Vampire, Wight, Zombie |

### 2.2 2024 Source (`packs/_source/actors24/`)
- **Total Files**: 392 files across 21 categories (371 actor records + 21 `_folder.yml` category descriptors).
- **Category Breakdown**:
  | Category | File Count | Description |
  | :--- | :--- | :--- |
  | `aberration` | 10 | Updated 2024 Aberrations |
  | `beast` | 85 | 2024 PHB / SRD Beast stat blocks |
  | `celestial` | 14 | Expanded 2024 Celestials |
  | `companions` | 1 | Beast Companion templates |
  | `conjurations` | 23 | Summon/Spell Conjuration actors |
  | `construct` | 11 | 2024 Constructs |
  | `dragon` | 46 | 2024 Chromatic & Metallic Dragons |
  | `elemental` | 18 | 2024 Elementals |
  | `fey` | 16 | Expanded 2024 Fey options |
  | `fiend` | 30 | 2024 Fiends |
  | `giant` | 11 | 2024 Giants |
  | `humanoid` | 27 | 2024 Humanoids & NPC archetypes |
  | `magic-items` | 12 | Living/Animated Magic Item actors |
  | `monstrosity` | 38 | 2024 Monstrosities |
  | `ooze` | 5 | 2024 Oozes |
  | `plant` | 7 | 2024 Plants |
  | `premades` | 1 | Premade NPC template |
  | `summons` | 2 | Class Summon templates |
  | `swarm` | 8 | Dedicated Swarm category |
  | `undead` | 19 | 2024 Undead |
  | `vehicles` | 8 | Land & Water Vehicle actors |

---

## 3. Current Artificer Enemy Repository Classification

Auditing Artificer's `public/assets/atlas/enemies/json/` (379 files) and `public/assets/atlas/enemies_categories/json/` (14 files) reveals the exact nature of the legacy identity mismatch:

1. **Foundry-ID Indexed Records (346 files)**:
   - Imported flat into `public/assets/atlas/enemies/json/<foundry-id>.json`.
   - All 346 originate from the **2014** Foundry source (`packs/_source/monsters/`).
   - Example IDs: `shhhte7b92pefcwb` (Aboleth), `m4ex4mu5ihcr3tmf` (Adult Black Dragon), `1es45odwg3pcrkzv` (Bulette).

2. **Legacy Name-Indexed Records (33 files)**:
   - Flat files named after display names or special variants: `beholder`, `annihilator`, `mind_flayer`, `phthisic`, `tiamat`, `tomb_tapper`, `vodyanoi`, `deep_gnome_svirfneblin`, `saber_toothed_tiger`, `severin`, `vampire_bat`, `vampire_mist`, `vampire_vampire`, `werebear_bear`, `werebear_human`, `werebear_hybrid`, `wereboar_boar`, `wereboar_human`, `wereboar_hybrid`, `wererat_human`, `wererat_rat`, `weretiger_human`, `werewolf_human`, `werewolf_hybrid`, `werewolf_wolf`, `will_o_wisp`, etc.

3. **Category Reference Disconnect**:
   - `public/assets/atlas/enemies_categories/json/*.json` files contain **417 total monster references**.
   - **414 of those references** use legacy human-readable slugs (e.g. `aboleth`, `bulette`, `drider`).
   - Because 346 of those records were imported under Foundry IDs (`shhhte7b92pefcwb`, `1es45odwg3pcrkzv`, `1oqbxozi5btlb2me`), **376 category references currently point to non-existent JSON paths** if resolved naively without index mapping.

4. **2014 vs 2024 Identity Collision Findings**:
   - **306 creature names** are shared between 2014 and 2024 sources.
   - Every single shared creature has **distinct Foundry `_id` values** between rulesets:
     - *Aboleth*: 2014 ID `shhHtE7b92PefCWB` vs 2024 ID `mmAboleth0000000`
     - *Adult Black Dragon*: 2014 ID `M4eX4Mu5IHCr3TMf` vs 2024 ID `mmAdultBlackDrag`
     - *Chuul*: 2014 ID `P6qC8jB3pnEH0tIE` vs 2024 ID `mmChuul000000000`
     - *Cloaker*: 2014 ID `HPUO3weiwRQnql0d` vs 2024 ID `mmCloaker0000000`
   - Category taxonomies also shift between rulesets (e.g., *Axe Beak* is categorized under `beast` in 2014, but under `monstrosity` in 2024).

---

## 4. Reusable Monster Features Audit

Auditing Foundry's feature packs against Artificer's `public/assets/atlas/enemies/monsterfeatures/`:

1. **Foundry 2014 `monsterfeatures/`**: 252 features in a flat folder using 16-character hash IDs (e.g. `kobgbikb2tmzv0ch` for *Aberrant Ground*).
2. **Foundry 2024 `monsterfeatures24/`**: 395 features structured across 4 category subdirectories:
   - `actions/`: 141 features
   - `attacks/`: 114 features
   - `legendary-actions/`: 33 features
   - `traits/`: 107 features
   - Uses structured IDs (e.g. `mmacidbreath0000`, `mmbite0000000000`, `mmclaw0000000000`).
3. **Current Repository Defect**:
   - `tools/portMonsterFeatures.cjs` previously dumped all 647 files (252 + 395) into a single flat directory `public/assets/atlas/enemies/monsterfeatures/json/` with an unversioned `index.json`.
   - The output lacked `ruleset` fields (`'2014'` | `'2024'`), stripped category information (`actions`, `attacks`, `traits`), inserted fallback defaults (such as `'bludgeoning'`), and omitted structured Foundry activity semantics.

---

## 5. Combat Mechanics Capability Matrix

The following matrix compares structured Foundry v6.0.x activity semantics against Artificer's current runtime combat capabilities:

| Foundry Mechanic | Foundry Source Representation | Artificer Target JSON | Currently Supported in Combat? | Missing / Partial Behavior | Required Follow-Up Work |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Activation Economy** | `system.activation.type` (`action`, `bonus`, `reaction`, `legendary`, `lair`) | `activation_type`, `action_cost` | **Yes (Basic)** | Action, Bonus Action, and Reaction tracked per turn. Legendary Action point pools (3/round) not automated. | Proposed: Legendary Resource Manager |
| **Melee / Ranged Attack Rolls** | `system.activities.*.type: "attack"`, `attack.type: "melee" \| "ranged"` | `actions[].attack_bonus`, `weapon_range` | **Yes** | `resolveCombatAction()` rolls `1d20 + attack_bonus` against target AC and executes hit/miss. | Fully Supported |
| **Saving Throw Abilities & DCs** | `system.activities.*.type: "save"`, `save.ability`, `save.dc.formula` | `actions[].dc: { dc_ability, dc_value, success_type }` | **Partial** | Supported for Spells in `spellResolver.ts`. Non-spell monster save abilities (e.g. Dragon Breath) execute flat damage without save prompt. | Proposed: Monster Save Action Resolver |
| **Damage Dice & Types** | `system.activities.*.damage.parts`: `[{ formula, types }]` | `actions[].damage: [{ damage_dice, damage_type }]` | **Yes** | Rolls damage dice and deducts HP. Supports crits. | Fully Supported |
| **Range & Reach** | `system.activities.*.range.value`, `units` | `actions[].range` | **Yes** | Evaluates cell distance on `CombatGrid` (5ft = 1 cell). | Fully Supported |
| **Area of Effect (AOE) Templates** | `target.template`: `{ type: "cone" \| "sphere" \| "cube" \| "line", size }` | `actions[].targetType`, `radius`, `length` | **Yes** | `calculateAOECells()` in `geometry.ts` calculates pure grid cells and highlights targets on `CombatGrid`. | Fully Supported |
| **Recharge / Usages** | `uses.max`, `recovery: [{ period: "recharge", formula: "5-6" }]` | `actions[].usage: { type: "recharge", recharge_formula: "5-6" }` | **Partial** | Stored in JSON data. Automatic d6 recharge roll at turn start (`executeMonsterTurn()`) is unbuilt. | Proposed: Monster Recharge Manager |
| **Conditions & Status Effects** | `effects`: Active Effects array, `system.traits.ci` | `combatState.activeConditions`, `condition_immunities` | **Partial** | `defending` (+2 AC) and `unconscious` / `dead` supported. Automatic application of `poisoned`, `stunned`, `paralyzed` is unbuilt. | Proposed: Condition Engine Integration |
| **Multiattack Composition** | `system.description.value` text or activity chain | `actions[].multiattack_chain` | **Partial** | `executeMonsterTurn()` chooses one primary action per turn. Sequential multiattack sequence execution is unbuilt. | Proposed: Multiattack Chain Execution |
| **Reactions & Opportunity Attacks** | `system.activation.type: "reaction"` | `reactions[]` | **Partial** | `reactions[]` array preserved in JSON. Automatic trigger detection on grid movement is unbuilt. | Proposed: Reaction Trigger Manager |
| **Legendary Resistance** | `system.details.legendaryResistances` | `special_abilities[]` | **Partial** | Preserved in JSON text. Automatic prompt to pass failed save is unbuilt. | Proposed: Legendary Resistance Prompt |

---

## 6. Media Reconciliation & Image Contract

Auditing image references across all 379 enemy records against disk assets under `public/assets/atlas/enemies/images/` and `public/assets/atlas/enemies/tokens/`:

### 6.1 Audit Statistics
- **Current Path Classification**:
  - `valid_images_dir` (`/assets/atlas/enemies/images/*.webp`): **29 records**
  - `token_path` (`/assets/atlas/enemies/tokens/...`): **271 records** (incorrectly stored in `imageUrl` / `image`)
  - `obsolete_flat` (`/assets/atlas/enemies/<id>.webp`): **79 records** (obsolete flat references)
- **Asset Reconciliation**:
  - **309 enemy records** match a verified curated non-grid WebP asset under `public/assets/atlas/enemies/images/`.
  - **158 enemy records** match a verified tactical token WebP asset under `public/assets/atlas/enemies/tokens/`.

### 6.2 Sample Reconciliation Entries
| Enemy ID | Display Name | Current Path | Classification | Verified Artwork Asset (`enemies/images/`) | Verified Token Asset (`enemies/tokens/`) | Safe Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `m4ex4mu5ihcr3tmf` | adult black dragon | `/assets/atlas/enemies/m4ex4mu5ihcr3tmf.webp` | `obsolete_flat` | `/assets/atlas/enemies/images/adult_black_dragon.webp` | `/assets/atlas/enemies/tokens/dragon/AdultBlackDragon.webp` | Restore `imageUrl` to artwork asset |
| `13k3xk2a3wwxvkld` | spy | `/assets/atlas/enemies/tokens/humanoid/Spy.webp` | `token_path` | `/assets/atlas/enemies/images/spy.webp` | `/assets/atlas/enemies/tokens/humanoid/Spy.webp` | Restore `imageUrl` to artwork asset |
| `1es45odwg3pcrkzv` | bulette | `/assets/atlas/enemies/tokens/monstrosity/Bulette.webp` | `token_path` | `/assets/atlas/enemies/images/bulette.webp` | `/assets/atlas/enemies/tokens/monstrosity/Bulette.webp` | Restore `imageUrl` to artwork asset |
| `0m8qydn52qw9zzom` | gargoyle | `/assets/atlas/enemies/images/gargoyle.webp` | `valid_images_dir` | `/assets/atlas/enemies/images/gargoyle.webp` | `/assets/atlas/enemies/tokens/elemental/Gargoyle.webp` | Retain valid `imageUrl` |
| `beholder` | beholder | `/assets/atlas/enemies/images/beholder.webp` | `valid_images_dir` | `/assets/atlas/enemies/images/beholder.webp` | `/assets/atlas/enemies/tokens/aberration/Beholder.webp` | Retain valid `imageUrl` |

### 6.3 Media Preservation Rules
1. **Separation**: Non-grid artwork resides in `public/assets/atlas/enemies/images/`. Tactical tokens reside in `public/assets/atlas/enemies/tokens/`.
2. **`imageUrl` Field**: `imageUrl` is strictly reserved for non-grid creature artwork outside CombatGrid.
3. **No Artwork Duplication**: 2014 and 2024 records for the same creature display name (e.g. 2014 Adult Black Dragon and 2024 Adult Black Dragon) share the single verified artwork file `/assets/atlas/enemies/images/adult_black_dragon.webp`. Artwork does NOT need to be duplicated into `images/14/` and `images/24/`.
4. **No Synthesized Paths**: If no verified artwork asset exists under `enemies/images/`, `imageUrl` remains empty or omitted; paths are never invented.

---

## 7. Target Architecture & Storage Model

To establish deterministic ruleset boundaries without breaking existing consumers, the enemy domain shall adopt an **explicit ruleset-first directory hierarchy**:

### 7.1 Enemy JSON Hierarchy
```text
public/assets/atlas/enemies/
├── index_14.json                         # 2014 Enemy Catalog Index
├── index_24.json                         # 2024 Enemy Catalog Index
├── index.json                            # Unified Compatibility Index
├── json/
│   ├── 14/                               # 2014 Ruleset Enemies
│   │   ├── aberration/
│   │   │   └── shhhte7b92pefcwb.json     # Aboleth (2014)
│   │   ├── dragon/
│   │   │   └── m4ex4mu5ihcr3tmf.json     # Adult Black Dragon (2014)
│   │   └── ...
│   └── 24/                               # 2024 Ruleset Enemies
│       ├── aberration/
│       │   └── mmaboleth0000000.json     # Aboleth (2024)
│       ├── dragon/
│       │   └── mmadultblackdrag.json     # Adult Black Dragon (2024)
│       └── ...
├── monsterfeatures/
│   ├── index_14.json                     # 2014 Feature Index
│   ├── index_24.json                     # 2024 Feature Index
│   └── json/
│       ├── 14/                           # 2014 Features
│       │   └── kobgbikb2tmzv0ch.json
│       └── 24/                           # 2024 Features
│           ├── actions/
│           ├── attacks/
│           ├── legendary-actions/
│           └── traits/
├── images/                               # Non-Grid Creature Artwork
│   ├── adult_black_dragon.webp
│   ├── bulette.webp
│   └── ...
└── tokens/                               # Tactical CombatGrid Tokens
    ├── dragon/
    │   └── AdultBlackDragon.webp
    └── ...
```

### 7.2 Category Index Reconciliation (`enemies_categories/`)
`public/assets/atlas/enemies_categories/` shall be updated with ruleset-aware categories (`index_14.json` and `index_24.json`). References inside category JSON files shall store the stable Foundry `index` alongside `json_path` pointing directly to `/assets/atlas/enemies/json/<ruleset>/<category>/<id>.json`.

### 7.3 Runtime Loader Boundary (`storageService.ts`)
`fetchMonsterData(index, ruleset?)` and `fetchMonsterList(ruleset?)` shall consume `getRulesetVersionFolder(ruleset)`:
1. `getRulesetVersionFolder()` maps `2024` -> `'24'` and `2014` -> `'14'`.
2. `fetchMonsterData(index, ruleset)` searches strictly under `/assets/atlas/enemies/json/<versionFolder>/`.
3. If an index is requested by legacy human-readable slug (e.g. `aboleth`), the loader consults `index_14.json` / `index_24.json` to resolve the canonical Foundry ID record for the active ruleset.
4. Returned records derive `rulesetContext` directly from the actual resolved file path (`'2014'` vs `'2024'`).

---

## 8. Migration & Import Strategy

The mass migration (to be executed in a dedicated follow-up issue) shall follow this deterministic pipeline:

1. **`tools/portFoundryAssets.cjs` Update**:
   - Add `--actors24` target mapping `packs/_source/actors24/` to `public/assets/atlas/enemies/json/24/<category>/<id>.json`.
   - Update `--actors` target mapping `packs/_source/monsters/` to `public/assets/atlas/enemies/json/14/<category>/<id>.json`.
   - Incorporate smart-merge algorithm preserving curated `imageUrl` and `sprite_index`.
   - Automatically generate `index_14.json`, `index_24.json`, and unified `index.json`.

2. **`tools/portMonsterFeatures.cjs` Update**:
   - Import 2014 `monsterfeatures` into `enemies/monsterfeatures/json/14/<id>.json`.
   - Import 2024 `monsterfeatures24` into `enemies/monsterfeatures/json/24/<category>/<id>.json`.
   - Preserve structured activity semantics (`activation`, `dc`, `damage`, `range`, `recharge`, `targetType`).
   - Generate versioned `index_14.json` and `index_24.json`.

3. **Media Reconciliation Execution**:
   - Run automated smart-merge correcting `imageUrl` references to point to verified artwork under `enemies/images/`.

---

## 9. Proposed Follow-Up Implementation Issues

The following follow-up issues are proposed to execute the implementation phases identified by this audit:

1. **`feat(data): execute mass Foundry 2014/2024 enemy and feature import migration`**:
   - Update `tools/portFoundryAssets.cjs` and `tools/portMonsterFeatures.cjs`.
   - Generate `enemies/json/14/`, `enemies/json/24/`, `monsterfeatures/json/14/`, and `monsterfeatures/json/24/`.
   - Regenerate versioned indexes and category mappings.

2. **`feat(gameplay): implement monster ability saving throws and recharge mechanics in combat`**:
   - Add start-of-turn recharge d6 rolling in `executeMonsterTurn()`.
   - Add non-spell saving throw action resolution in `resolveCombatAction()`.

3. **`feat(gameplay): implement legendary resource management and reaction triggers`**:
   - Add legendary action point tracking (3/round) and reaction trigger evaluation on `CombatGrid`.
