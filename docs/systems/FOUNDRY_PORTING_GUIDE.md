# 📦 Foundry VTT to Artificer Porting Guide

This document serves as the architectural specification and implementation guide for porting, aligning, and migrating game system data (Actors, Items, Spells, Rules, and Classes) from the Foundry Virtual Tabletop (VTT) **Dungeons & Dragons Fifth Edition Game System (v6.0.x)** to the **Artificer** local ecosystem database (`/public/assets/atlas/`).

---

## 🎯 Purpose and Goals

Foundry VTT's `dnd5e-6.0.x` is a highly mature, community-standardized game system implementing the Fifth Edition System Reference Document (SRD 5.1 & SRD 5.2). Its codebase provides complete, structured definitions for standard monsters, weapons, armor, spells, classes, and mechanics.

By aligning Artificer's schema definitions and asset pipelines with Foundry VTT's system:
1. **Rule Parity**: Ensure absolute mechanical alignment with 5e rules.
2. **Data Enrichment**: Streamline the creation/porting of missing spells, items, and monster definitions using parsed YAML sources.
3. **Reference Standard**: Establish a direct translation key between Foundry's nested actor/item/spell properties and Artificer's schema-compliant JSON representations.

---

## 📂 Source and Target Directories

Foundry's unpacked YAML data files and Artificer's target JSON asset folders are structured as follows:

| Asset Category | Foundry VTT Source (`dnd5e-6.0.x/packs/_source/`) | Artificer Target (`public/assets/atlas/`) | Schema |
| :--- | :--- | :--- | :--- |
| **Monsters / NPCs** | `monsters/` / `actors24/` (YAML) | `enemies/json/` | `enemy.schema.json` |
| **Weapons / Gear** | `items/` / `equipment24/` (YAML) | `equipment/json/` | `weapon.schema.json` / `armor.schema.json` / `equipment.schema.json` |
| **Spells** | `spells/` / `spells24/` (YAML) | `spell/json/` | `spell.schema.json` |
| **Rule Wiki / Docs** | `rules/` / `content24/` (YAML) | `mechanic/rule_sections/json/` | `proficiency.schema.json` etc. |

---

## 🧠 Schema & Data Mapping Specifications

### 1. Actor (NPC / Monster) to Enemy Mapping

Foundry's YAML Actor files (e.g., `bandit.yml`, `acolyte.yml`) are mapped to Artificer's `enemy.schema.json`:

| Artificer Target Field | Source Foundry Path | Transformation / Logic |
| :--- | :--- | :--- |
| `index` | `_id` or lowercased `name` | Slugify/lowercase and replace spaces with underscores. |
| `name` | `name` | Direct string copy. |
| `desc` | `system.details.biography.value` | Clean HTML tags, strip wrapper elements, output description text. |
| `size` | `system.traits.size` | Map `tiny` ➔ `Tiny`, `sm` ➔ `Small`, `med` ➔ `Medium`, `lg` ➔ `Large`, `huge` ➔ `Huge`, `grg` ➔ `Gargantuan`. |
| `type` | `system.details.type.value` | Direct string copy (e.g., `humanoid`, `beast`). |
| `subtype` | `system.details.type.subtype` | Direct copy (default to `"any race"` or empty string if null). |
| `alignment` | `system.details.alignment` | Direct string copy (e.g., `"Any Non-Lawful"`). |
| `strength` | `system.abilities.str.value` | Integer representation. |
| `dexterity` | `system.abilities.dex.value` | Integer representation. |
| `constitution` | `system.abilities.con.value` | Integer representation. |
| `intelligence` | `system.abilities.int.value` | Integer representation. |
| `wisdom` | `system.abilities.wis.value` | Integer representation. |
| `charisma` | `system.abilities.cha.value` | Integer representation. |
| `stats` | `system.abilities.*.value` | Nested object matching individual ability scores. |
| `hit_points` | `system.attributes.hp.max` | Integer. |
| `hit_dice` | `system.attributes.hp.formula` | Extract dice notation (e.g., `"2d8"` from `"2d8 + 2"`). |
| `hit_points_roll` | `system.attributes.hp.formula` | Complete HP formula string (e.g., `"2d8 + 2"`). |
| `armor_class` | `system.attributes.ac.flat` / `.calc` | If flat is null, calculate based on Dexterity + base/armor values (e.g. `[ { "type": "dex", "value": 10 + dexMod } ]`). |
| `speed` | `system.attributes.movement` | Convert nested object to string-based map (e.g., `{ "walk": "30 ft." }`). |
| `senses` | `system.attributes.senses` | Extract fields like `darkvision`, calculation of `passive_perception` based on Wisdom mod + proficiency. |
| `challenge_rating` | `system.details.cr` | Map challenge rating float/fraction (e.g., `0.125` ➔ `0.125` or `1/8`). |
| `proficiency_bonus` | Calculated from CR | Standard D&D 5e progression table (+2 to +9 based on CR thresholds). |
| `xp` | Calculated from CR | Standard D&D 5e XP by CR values table (e.g., CR 1/8 ➔ 25 XP, CR 1 ➔ 200 XP). |
| `damage_resistances` | `system.traits.dr.value` | Array of damage types (e.g., `["fire", "poison"]`). |
| `damage_immunities` | `system.traits.di.value` | Array of damage types. |
| `damage_vulnerabilities`| `system.traits.dv.value` | Array of damage types. |
| `condition_immunities` | `system.traits.ci.value` | Array of condition strings (e.g., `["charmed", "frightened"]`). |
| `languages` | `system.traits.languages.custom` | Combine standard language codes with custom text overrides. |

#### Parsing Actions and Special Abilities from Actors:
Foundry Actors contain a nested list of item definitions under the `items` array. These must be parsed and distributed:
1. **Special Abilities**: `type: "feat"` with an activation type other than action/bonus action (or passive properties like *Magic Resistance* or *Pack Tactics*) are mapped into the `special_abilities` list.
2. **Actions**: `type: "weapon"` or `type: "feat"` with `system.activities.*` defined as attacks are mapped into the `actions` array:
   - Action Name: Item `name`.
   - Description: Parse `system.description.value` or custom chat templates.
   - Attack Bonus: Calculate based on active attribute modifier + proficiency bonus + magical bonus.
   - Damage Dice & Type: Extract from `system.damage.base` or activity definitions (e.g. `1d6` slashing).

---

### 2. Item to Equipment Mapping

Foundry VTT Items of types `weapon`, `equipment`, `consumable`, `tool`, `loot`, `container` map directly to Artificer's unified `equipment.schema.json` with kind-specific subclasses:

```yaml
# Foundry VTT Item Structure
_id: fbC0Mg1a73wdFbqO
name: Scimitar
type: weapon
img: icons/weapons/swords/scimitar-leather.webp
system:
  description:
    value: "<p>A curved, single-edged sword...</p>"
  quantity: 1
  weight: 3
  price:
    value: 25
    denomination: gp
  type:
    value: martialM
    baseItem: scimitar
  damage:
    base:
      number: 1
      denomination: 6
      types: ["slashing"]
  properties: ["fin", "lgt"]
```

#### Mapping Logic:
1. **`index`**: Slugified/lowercased `fbC0Mg1a73wdFbqO` or `scimitar`.
2. **`name`**: `"Scimitar"`.
3. **`kind`**: Derived from Foundry `type` (e.g. `weapon` ➔ `"weapon"`, `equipment` ➔ `"armor"` or `"clothing"` based on armor type, `consumable` ➔ `"consumable"`).
4. **`cost`**:
   ```json
   "cost": {
     "quantity": 25,
     "unit": "gp"
   }
   ```
5. **`weight`**: `system.weight.value` (converted to number).
6. **`desc`**: Extract paragraphs from `system.description.value` into a string array.
7. **`equipSlots`**: Map based on weapon type/armor type (e.g., martial/simple melee weapons ➔ `["main_hand"]`, armor ➔ `["chest"]`, rings ➔ `["ring_1", "ring_2"]`).
8. **Weapon-Specific Fields (`weapon.schema.json`)**:
   - `weapon_category`: `"Simple"` or `"Martial"`.
   - `weapon_range`: `"Melee"` or `"Ranged"` based on properties (`"thr"` / `"amm"`).
   - `damage`:
     ```json
     "damage": {
       "damage_dice": "1d6",
       "damage_type": {
         "index": "slashing",
         "name": "slashing",
         "url": "/assets/atlas/damage_types/json/slashing.json"
       }
     }
     ```
   - `range`: Extract normal/long from `system.range`.

---

### 3. Spell to Spell Mapping

Foundry Spells are mapped directly to Artificer's `spell.schema.json`:

| Artificer Target Field | Source Foundry Path | Transformation / Logic |
| :--- | :--- | :--- |
| `index` | `_id` or lowercased `name` | Slugify/lowercase. |
| `name` | `name` | Direct copy. |
| `desc` | `system.description.value` | Array of text strings (paragraphs cleaned of HTML tags). |
| `level` | `system.level` | Integer (0 for cantrip, 1-9 for spell levels). |
| `school` | `system.school` | Map single letters (e.g., `abj` ➔ `"abjuration"`, `con` ➔ `"conjuration"`, `div` ➔ `"divination"`, `evo` ➔ `"evocation"`, `ill` ➔ `"illusion"`, `nec` ➔ `"necromancy"`, `tra` ➔ `"transmutation"`, `enc` ➔ `"enchantment"`). Create the standardized Artificer school object. |
| `components` | `system.properties` | Array containing subsets of `"V"`, `"S"`, `"M"` based on spell properties. |
| `material` | `system.materials.value` | Material component requirements string. |
| `ritual` | `system.properties` | Boolean (checks if `"rit"` is in properties list). |
| `concentration` | `system.properties` | Boolean (checks if `"con"` is in properties list). |
| `duration` | `system.duration.value` + `units` | Human readable string (e.g., `"1 Minute"`, `"Instantaneous"`). |
| `casting_time` | `system.activation.value` + `type` | Human readable string (e.g., `"1 action"`, `"1 bonus action"`). |
| `range` | `system.range.value` + `units` | Human readable string (e.g., `"Self"`, `"60 feet"`). |
| `damage` | `system.damage` / activities | Convert damage formulae to level-based/slot-based maps. |

---

## 🎨 Asset & Image Preservation Architecture

> ⚠️ **CRITICAL REQUIREMENT:** The Artificer repository contains a highly developed and customized set of local media assets, hand-made sprites, sprite sheets, sprite indices, and high-resolution icons.

To prevent overwriting manually adjusted layouts, hand-crafted sprites, and sprite maps:
- The porting tool (**`portFoundryAssets.cjs`**) implements a **smart-merge algorithm**.
- If a target JSON database record already exists locally under `public/assets/atlas/`, the tool reads the existing file first.
- The tool preserves the following critical media fields:
  - `image` (legacy fallback path)
  - `imageUrl` / `image` (canonical WebP/PNG path)
  - `sprite_sheet` (sprite sheet texture link)
  - `sprite_index` (the exact cell index on the grid sheet)
- Only mechanical descriptions, abilities, rules, and raw statistical values are imported from the raw YAML source.

### 🪙 Automated Enemy Token Bindings

To leverage newly added high-quality token images uploaded to `/public/assets/atlas/enemies/tokens/` (supporting formats such as `.webp`, `.png`, `.jpg`, and `.jpeg`):
1. During the Actor mapping step, the migration tool dynamically scans the `/public/assets/atlas/enemies/tokens/` directory.
2. If it finds a token asset matching the enemy's slugified index (e.g., `acolyte.webp` or `bandit.png`), the tool automatically sets `/assets/atlas/enemies/tokens/<index>.<extension>` as the canonical `image` value.
3. This ensures seamless visual integration of professional tokens onto the tactical grid and HUD elements without requiring manual file path stitching.

---

## 🔄 The Data Porting & Transformation Pipeline

To automate the import of massive D&D reference files without introducing human syntax errors, the project provides a targeted script located in `/tools/portFoundryAssets.cjs`.

### Step-by-Step Porting Pipeline:
```
[Foundry YAML pack] ➔ [YAML to JS Object Parsing] ➔ [Check for existing Local Asset File] ➔ [Preserve custom Local Sprite Sheets / Images] ➔ [Sanitize HTML to Markdown/Text] ➔ [Validate with JSON Schema] ➔ [Write JSON to /public/assets/atlas/]
```

### Key Sanitize Rules:
1. **HTML Parsing**: Parse HTML description texts (like `system.description.value`) to strip complex wrappers, table classes, and nested system variables while keeping simple standard tags or formatting as markdown or plain string paragraphs.
2. **References Normalization**: References to other entities must use the canonical pathing:
   - Spell references: `/assets/atlas/spell/json/<spell_index>.json`
   - Skill references: `/assets/atlas/skills/json/<skill_index>.json`
   - Damage types: `/assets/atlas/damage_types/json/<type>.json`
3. **JSON Structure Validation**: Output files must be run through validation tests to ensure no broken reference paths or missing mandatory fields.

---

## 🛠️ Verification & Quality Assurance

Once data is imported or mapped, run the following verification checks:

1. **Asset Validation**:
   Run the central asset validator to verify schema matching, reference checking, and ensure zero duplicate keys exist:
   ```bash
   npm run validate:assets
   ```

2. **Codebase Compilation**:
   Ensure no TypeScript compilation or structural asset loading fails:
   ```bash
   npm run lint
   ```

3. **Check Output Assets**:
   Inspect newly generated asset JSONs in `/public/assets/atlas/` to confirm that all nested properties (such as AC structures, speeds, and action rolls) are populated correctly.
