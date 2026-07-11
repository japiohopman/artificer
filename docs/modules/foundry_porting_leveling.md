# 🗺️ Foundry VTT Porting & Leveling Integration Blueprint

This document analyzes the current status of the **Foundry VTT Asset Porting Pipeline**, identifies additional data packs to be migrated from the unpacked `dnd5e-6.0.x` reference folders, and provides a technical blueprint to rewire these files into a fully data-driven **Character Level-Up System**.

---

## 1. 🔄 Current Porting Pipeline Status

We currently run automation scripts (e.g. `tools/portFoundryAssets.cjs` and `tools/portMonsterFeatures.cjs`) to translate Foundry VTT unpacked YAML sources into Artificer-compliant JSON schemas.

### Currently Supported Domains:
- [x] **Enemies / Monsters (`monsters` source pack)**
  - Maps basic properties, HP/AC, speed, challenge ratings, experience points, ability scores, and attacks/features.
  - Features smart merging to protect manually curated tokens, sprites, background locations, and wiki lore.
- [x] **Spells (`spells` source pack)**
  - Maps magic school codes, ranges, verbal/somatic/material components, casting times, ritual/concentration flags, and spell description text.
- [x] **Equipment / Items (`items` source pack)**
  - Parses weapons, shields, armors, containers, and consumables into structured item kinds, cost variables, and weight profiles.

---

## 2. 📦 Unported Foundry Packs to Migrate

To transition character progression and creation from static/hardcoded logic into a fully dynamic, data-driven system, several other unpacked Foundry packs need to be migrated.

These unpacked packs are located at:
`dit is de ttf map waar of naar toe moeten of heel erg van af moeten kijken/dnd5e-6.0.x/packs/_source/`

### Packs Targeted for Porting:
- [ ] **`classes` / `subclasses`**
  - **Why:** Contains hit die scales (e.g. d10 for Fighter, d6 for Wizard), spellcasting ability modifiers, and class saving throw proficiencies.
- [ ] **`classfeatures`**
  - **Why:** Contains features, actions, and traits granted at specific levels (e.g., *Action Surge* at Fighter Level 2, *Sneak Attack* increments at Rogue levels).
- [ ] **`races` (Ancestries/Species)**
  - **Why:** Contains baseline movement speeds, ability score increases, size templates, and innate species traits (e.g., Elven Trance, Dwarven Resilience).
- [ ] **`backgrounds`**
  - **Why:** Holds starting skill/tool proficiencies and background feature flavor entries.

### 🛠️ Porting Automation Tasks:
- [ ] **Extend `portFoundryAssets.cjs`**
  - [ ] Write a mapper function for `classes` to extract `hitDice` (e.g., `d10`), saving throws, and primary spellcasting attributes.
  - [ ] Write a mapper for `classfeatures` to parse name, description, and the target `system.requirements` (which denotes Class and Level, e.g., "Fighter 2").
  - [ ] Write a mapper for `races` to capture species speed, size, and racial trait lists.

---

## 3. 📈 Leveling & Level-Up Screen Rewiring

Integrating these newly ported assets into the character leveling cycle creates a dynamic progression loop.

```
                    [ Trigger Level Up ]
                             │
                             ▼
         [ Query Classes Registry for Active Class ]
            (Fetch Hit Die scale & Spellcasting)
                             │
                             ▼
     [ Query Class Features matching (Class + New Level) ]
            (E.g., Query Fighter Level 2 features)
                             │
                             ▼
            [ Calculate & Apply Level Changes ]
         - HP Increment: Roll Hit Die + CON Modifier
         - Append New Traits/Features to Character Save
         - Update Spell Slot maximum counts
                             │
                             ▼
                [ Update Character Store ]
```

### 🛠️ Step-by-Step Level-Up Screen Rewiring:

#### 1. Dynamic Class Metadata Selection
Instead of using hardcoded rules, the level-up system reads the class index from the active character profile and fetches the class template:
```typescript
// Example conceptual loading inside level-up action
const classTemplate = await atlasService.loadClass(character.class.toLowerCase());
const hitDie = classTemplate.hit_die || 8; // e.g., 10 for Fighter
```

#### 2. Fully Automated HP Calculations
When stepping up a level, the application calculates HP increments based on the class’s parsed hit die:
- **Fixed/Average Method:** `(Hit_Die / 2) + 1 + CON_Modifier` (e.g., `6 + CON` for d10).
- **Roll Method:** Simulate a die roll of `1d{Hit_Die}` + `CON_Modifier` (using the 3D Dice physics box or random engine), guaranteeing a minimum increase of `1`.

#### 3. Class Feature Injection
Query `classfeatures` to find features whose requirement matches `"{Class} {New_Level}"`:
```typescript
// Query class features granted at the new level
const newLevelFeatures = await atlasService.loadClassFeatures(character.class, newLevel);
// Append to character's active traits array
updateCharacter(characterId, {
  traits: [...character.traits, ...newLevelFeatures],
  level: newLevel,
  xp: getXPForLevel(newLevel)
});
```

---

## 🚀 Level-Up Rewiring Checklist

- [ ] **Data Model & Service Expansion**
  - [ ] Implement `loadClass(classId)` and `loadClassFeatures(classId, level)` endpoints inside `atlasService.ts`.
  - [ ] Ensure that `useAtlasStore` compiles indexed listings of classes, classfeatures, and races.
- [ ] **Level-Up UI Panel Rewiring (`Simulator.tsx` and custom Level-Up screen)**
  - [ ] Renders class hit die icons dynamically fetched from class templates.
  - [ ] Displays a visual preview list of incoming class features for the next level.
  - [ ] Implement an interactive "Roll HP" button using the 3D physics dice roller or a random seed, applying the CON modifier.
  - [ ] Inject the new features and hit point updates into the active character save on level-up commit.
