# 📊 Skill Database & Proficiencies Module

## Purpose
The Skill Database module defines, loads, and manages the 18 standard skill proficiencies from D&D 5.5e. It integrates database JSON schema definitions with Character Creation (`SkillsStep.tsx`), Level-Up systems, and character sheet modifiers to enable real-time, rule-compliant attribute checks.

## Owner
Jules Agent

## Dependencies
- `src/services/atlasService.ts`: Core data loader for the Skill database.
- `src/store/useCharacterStore.ts`: Tracks character skills, background proficiencies, and expertise.
- `public/assets/atlas/skills/json/`: Location of the 18 individual skill files.

---

## 📂 Data Architecture & Directory Structure
The 18 core skill definitions are maintained as individual JSON files under the Atlas data storage system:
```
public/assets/atlas/skills/
└── json/
    ├── acrobatics.json
    ├── animal_handling.json
    ├── arcana.json
    ├── athletics.json
    ├── deception.json
    ├── history.json
    ├── insight.json
    ├── intimidation.json
    ├── investigation.json
    ├── medicine.json
    ├── nature.json
    ├── perception.json
    ├── performance.json
    ├── persuasion.json
    ├── religion.json
    ├── sleight_of_hand.json
    ├── stealth.json
    └── survival.json
```

### Skill JSON Schema Structure
Each skill record conforms to a unified structure:
```json
{
  "index": "acrobatics",
  "name": "acrobatics",
  "desc": [
    "Your Dexterity (Acrobatics) check covers your attempt to stay on your feet in a tricky situation, such as when you're trying to run across a sheet of ice, balance on a tightrope, or stay upright on a rocking ship's deck..."
  ],
  "ability_score": {
    "index": "dex",
    "name": "dex",
    "url": "/assets/atlas/ability_scores/json/dex.json"
  },
  "url": "/assets/atlas/skills/json/acrobatics.json",
  "updated_at": "2025-10-24T20:42:14.523Z",
  "image": "/assets/atlas/skills/json/acrobatics.webp"
}
```

---

## 🛠️ Store Integration & Character Pipeline
The player character's skill state is fully integrated within `useCharacterStore.ts` and managed via specialized slices:

1. **Proficiencies Registry**: Tracks which skills the character has proficiency in.
2. **Expertise Registry**: Tracks double-proficiency multipliers (e.g., Rogue's expertise).
3. **Calculation Pipeline (`src/lib/statCalculations.ts`)**:
   - Resolves the character's base Ability Score modifier.
   - Adds the character's **Proficiency Bonus** (based on level) if the skill index is registered in the character's proficiencies.
   - Adds double the proficiency bonus if the skill is marked as expertise.
   - Returns the final skill check modifier.

---

## 🎨 UI & Character Creator Integration
Skills are prominently featured across two main gameplay areas:

### 🎭 Character Creator (`SkillsStep.tsx`)
During the character creation wizard, the `SkillsStep` component manages the distribution of skill proficiencies:
- **Class-Based Choices**: Filters and presents a list of selectable skill choices granted by the character's class.
- **Background & Race Inheritances**: Automatically locks skills already acquired from the player's background or racial traits, preventing redundant selections.
- **Dynamic Counters**: Computes and displays remaining choices, giving the player instant visual feedback.

### 📜 Character Profile Sheet (`CharacterProfile.tsx`)
Displays a comprehensive list of all 18 skills, highlighting proficiencies and expertises with themed markers, and displaying the pre-calculated, ready-to-roll modifiers for each skill check.

---

## 💻 API & Loading Services (`atlasService.ts`)
To fetch data asynchronously without blocking UI hydration, `atlasService` provides a clean accessor:

```typescript
async loadSkill(index: string): Promise<any | null> {
  return this.fetchAtlasData(
    `/assets/atlas/skills/json/${index.toLowerCase().replace(/[\s-]/g, '_')}.json`
  );
}
```

---

## 🚀 Known Limitations & Next Steps
- **Dynamic Tooltips**: Integrate hover tooltips on the Character Sheet to show the official description (`desc` array) loaded dynamically from the JSON file.
- **LMM Interaction**: Ensure the AI Dungeon Master reads the skills schema when requesting skill check rolls from the user, linking roll parameters directly to the database.
