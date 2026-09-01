# 🧙‍♂️ Architecture Blueprint: Character Creation & Progression (Leveling)

Dit document bevat de diepgaande analyse en het technische ontwerp voor een volledige, waterdichte en visueel adembenemende herziening van de **Character Creator** (de stappen in de karaktercreatie) en het **Leveling Systeem** (karakter-progressie).

---

## 🖥️ Layout & Viewport Architecture

The Character Creator is a **full-screen application surface** (`fixed inset-0 z-[100] w-full h-full`) styled similarly to structured DevKit tools, consuming 100% of the viewport. It operates without floating card backdrops, outer window borders, or top banner offsets.

### Character Mirror Visibility & Choice Rules
- Character Mirror begins at Species.
- Welcome / Slot / Identity are full-screen with no mirror.
- Steps prior to `species` (`welcome`, `slot`, `identity`) use **100% of the creator content stage**. There is NO reserved empty column or right panel for these steps.
- Starting at `species` (`CHARACTER_MIRROR_START_STEP = 'species'`), the layout transitions to include the persistent **Character Mirror** (`<CreatorRightPanel>`) on the right side.
- The mirror reflects only player-confirmed character choices.
- Ruleset Architecture Rule: A ruleset selector is only meaningful when the selected ruleset controls the underlying canonical data/rules resolution. Versioned Atlas data is supported for Equipment, Feats, and Class Levels, while Species and Classes currently resolve unversioned 2014 datasets (see `docs/audits/ruleset-2024-gap-analysis.md`).

### Shared Presentation Primitives & HUD Integration
Shared primitives (`CharacterPanelBody`, `CharacterPanelAbilities`, `CharacterPanelSkills`, `CharacterPanelTraits`, `CharacterPanelBio`) in `src/components/character/panel/` are consumed by both `CreatorRightPanel` and runtime HUD `CharacterPanel.tsx`. The environment background + body SVG form a single persistent visual backdrop across all tabs without decorative race/class captions underneath the SVG body.

### Mechanical Traits & Canonical Data Enforcement
In `CharacterPanelTraits.tsx`, mechanical traits (Saving Throws, Weapon Proficiencies, Armor Proficiencies, Skills & Proficiencies, Languages) render actual character data only. No fabricated defaults (such as `'Simple Weapons'`, `'Light Armor'`, `'Perception'`, or `'Common'`) are invented when character data is absent. Saving throws are derived directly from actual saving throw proficiencies and class specifications rather than iterating raw ability scores.

### 6-PC Party Scoping & Individual Character Mirror
The Character Mirror is explicitly character-scoped, representing one active player character at a time. The active character is selected dynamically from `useCharacterStore` (`activeCharacterId` or party index 0..5). A single reusable Character Mirror component supports all 6 PCs in a party; switching characters dynamically re-renders all derived metrics, traits, bio, equipment, and inventory without maintaining independent state or retaining stale data across characters.

### Tab Architecture & Interaction Workflows
The canonical Mirror tabs are:
* `Stats` (`ui/chart.svg`): At-a-glance vitals (HP, AC, Speed, Initiative), identity badges, and bottom horizontal ability score strip.
* `Traits` (`trait.svg`): Mechanical proficiencies, saving throws, skills, languages, and condition/damage immunities/resistances.
* `Bio` (`ui/pen_line.svg`): Structured narrative fields (`traits`, `ideals`, `bonds`, `flaws`, `backstory`) bound directly to canonical character state.
* `Equipment` (`items/equipment.svg`): Unifies Equipment Doll overlay framing and Backpack Inventory into a single context workflow, enabling direct drag-and-drop between inventory items and equipment slots.

### Party-Level Logistics Scoping
Logistics (party travel, transport profiles, shared rations/supplies, marching order) is scoped at the Party/Game level rather than inside individual character presentation sheets. The Character Mirror excludes the Logistics tab; runtime logistics manifests exist as party-level views.

---

## 🏛️ Official Character Visuals Asset Contract

Official character presentation artwork is maintained as public, stable, and module-agnostic assets under `public/assets/ui/official/`. These artwork files represent canonical official presentation assets and are shared across current and future application modules (e.g. Character Creator, Rulebook, Character Profile, Atlas Details Cards):

- **Species Visual Path**: `/assets/ui/official/races/`
- **Class Visual Path**: `/assets/ui/official/classes/`
- **Background Visual Path**: `/assets/ui/official/backgrounds/`

### Data vs. Presentation Separation
Canonical gameplay, rules, and stats data reside inside `public/assets/atlas/` (e.g., `public/assets/atlas/class/json/barbarian.json`). Image fields in data JSON files point to public official UI assets (e.g., `/assets/ui/official/classes/barbarian.webp`). Modules consume gameplay data and presentation assets independently without cross-component coupling.

---

## 🎨 Sprite Sheet Contracts & Geometry

### 1. Species Visual Sprite Sheet
- **Canonical Asset Path**: `public/assets/ui/official/races/race_sprite.webp`
- **Layout Grid**: 2 Rows × 7 Columns
- **Cell Aspect Ratio**: 3:2 Aspect Ratio per cell (e.g., 384×256 source cells).
- **Species Ordering**:
  - **Row 1 (0)**: 1. Dragonborn, 2. Hill Dwarf, 3. Mountain Dwarf, 4. Drow, 5. High Elf, 6. Wood Elf, 7. Forest Gnome.
  - **Row 2 (1)**: 1. Rock Gnome, 2. Half-Elf, 3. Half-Orc, 4. Lightfoot Halfling, 5. Stout Halfling, 6. Human, 7. Tiefling.
- **Data Mapping**: Defined in `src/components/character/species/speciesSpriteMap.ts` and rendered via `SpeciesSprite.tsx`.

### 2. Class Visual Sprite Sheet
- **Canonical Asset Path**: `public/assets/ui/official/classes/classSprite.webp`
- **Layout Grid**: 3 Rows × 4 Columns
- **Cell Aspect Ratio**: 2:3 Aspect Ratio per cell (portrait orientation, e.g. 256×331 source cells).
- **Class Ordering**:
  - **Row 0**: 1. Barbarian (0,0), 2. Bard (0,1), 3. Fighter (0,2), 4. Cleric (0,3)
  - **Row 1**: 1. Ranger (1,0), 2. Rogue (1,1), 3. Paladin (1,2), 4. Monk (1,3)
  - **Row 2**: 1. Druid (2,0), 2. Sorcerer (2,1), 3. Warlock (2,2), 4. Wizard (2,3)
- **Data Mapping**: Defined in `src/components/character/classes/classSpriteMap.ts` and rendered via `ClassSprite.tsx`.

### 3. Background Visual Asset Contract
- **Canonical Individual Image Path**: `/assets/ui/official/backgrounds/<name>.webp`
- **Canonical Sprite Sheet Path**: `public/assets/ui/official/backgrounds/backgroundSprite.webp`
- **Layout Grid**: 4 Rows × 4 Columns
- **Cell Aspect Ratio**: 1:1 Aspect Ratio per cell (square presentation).
- **Background Ordering**:
  - **Row 0**: 0_0 Acolyte, 0_1 Artisan, 0_2 Charlatan, 0_3 Criminal
  - **Row 1**: 1_0 Entertainer, 1_1 Farmer, 1_2 Guard, 1_3 Guide
  - **Row 2**: 2_0 Hermit, 2_1 Merchant, 2_2 Noble, 2_3 Sage
  - **Row 3**: 3_0 Sailor, 3_1 Scribe, 3_2 Soldier, 3_3 Wayfarer

### 4. Spell Sprite Asset Contract
- **Canonical Directory Path**: `public/assets/atlas/spell/sprites/`
- **Available Sprite Sheets**:
  - **Cantrip Sheets**: `cantrips_sheet_01.webp`, `cantrips_sheet_02.webp`
  - **Level 1 Sheets**: `spell_level1_sheet_01.webp`, `spell_level1_sheet_02.webp`, `spell_level1_sheet_03.webp`, `spell_level1_sheet_04.webp`
  - Additional higher-level spell sheets (Level 2 to Level 9) reside in the same canonical directory.
- **Rules & Data Boundary**:
  - Sprite sheets are canonical assets; they must NOT be split, converted to individual image files, or relocated.
  - The spell selection UI during the later Arcana phase (`SpellsStep`) will consume the data-driven sprite resolver (`src/lib/spellVisuals/`) to resolve `spell identifier -> sprite sheet + position`.

### Shared Rendering & Chroma-Key Processing
Both `SpeciesSprite` and `ClassSprite` leverage `ChromaKeyImage.tsx` to key out green-screen backgrounds dynamically via offscreen canvas crop geometry (`crop: { sx, sy, sw, sh }`). The image crop occurs before chroma-key processing so each sprite cell is keyed independently. Visual mapping components NEVER alter canonical gameplay IDs (`selectedSpecies` / `selectedClass`).

### Sprite Sheets vs. Detail Artwork Usage
Sprite sheets are intended specifically for compact selector rendering (e.g. species tiles and race selector cards in wizard selection steps), while individual official presentation images under `/assets/ui/official/...` remain available and reusable for larger/detail presentations (e.g. full character sheet passports, inspect modals, and rulebook entries).

---

## 🔬 Deel 1: Lering uit de VTT Module-Architectuur

Uit onze inspectie van `module/documents/actor/` en `module/documents/advancement/` trekken we de volgende belangrijke lessen:

### 1. Keuzevrijheid & Selectie-Logica (`select-choices.mjs`)
- **VTT Werkwijze**: Keuzes (zoals skill proficiencies, talen, of tool proficiencies) worden niet willekeurig opgeslagen, maar gestructureerd als geneste keuzebomen (`SelectChoices`).
- **Onze Toepassing**: In onze `SkillsStep.tsx` en `ChoicesStep.tsx` moeten we voorkomen dat spelers proficiencies kunnen selecteren die ze al uit een andere bron (bijv. hun Species of Background) hebben verkregen. Keuzes moeten dynamisch worden gefilterd om "double-dipping" te voorkomen.

### 2. HP Berekening & Progressie (`hit-points.mjs`)
- **VTT Werkwijze**: Hit point toename is direct gekoppeld aan de klasse hit die (bijv. d10 voor Fighter) en de Constitution modifier van het karakter.
- **Onze Toepassing**: In de creator en bij het levelen berekenen we HP via twee opties:
  - *Gemiddelde (Fixed):* `(HitDie / 2) + 1 + CON-mod`.
  - *Rollen (Roll):* `1dHitDie + CON-mod` (met een minimum van +1 HP per level).

### 3. Modulaire Voortgangsstappen (`item-grant.mjs`, `subclass.mjs`, `ability-score-improvement.mjs`)
- **VTT Werkwijze**: Ieder level triggeren specifieke "Advancement" klassen:
  - `item-grant`: Geeft automatisch specifieke features (bijv. *Action Surge* op Fighter level 2).
  - `subclass`: Vraagt om een subclass keuze op het juiste level (meestal level 3).
  - `ability-score-improvement`: Vraagt om een keuze tussen stat-verhogingen of een Feat (op levels 4, 8, 12, etc.).
- **Onze Toepassing**: Onze leveling- en character creator-wizard moet deze stappen modulair inladen op basis van de level templates van de gekozen klasse.

---

## 📜 Ruleset Data Resolution (2014 vs 2024 Boundary)
Character Creator selection steps enforce strict ruleset resolution via `getActiveRulesetContext(ruleset)`:
- **Species**: `/assets/atlas/species/json/14/` vs `/24/` (Foundation: Human, Dwarf, Elf, Halfling, Orc).
- **Classes**: `/assets/atlas/class/json/14/` vs `/24/` (Foundation: Fighter, Wizard, Cleric, Rogue).
- Resolvers return `rulesetContext` derived from loaded file location and enforce strict safety (no 2024 -> 2014 fallback when 2024 ruleset is explicitly requested).

## 🛠️ Deel 2: Diagnose van de Huidige Character Creator & Knelpunten

Op dit moment "rammelt" het proces nog aan een aantal kanten. Hier is de diagnose en de concrete oplossing:

### Knelpunt 1: Proficiency Picks staan "in de min" of kloppen niet
- **Oorzaak**: De keuzes in de `SkillsStep.tsx` of `ChoicesStep.tsx` houden geen rekening met de proficiencies die de speler al krijgt via de Species of Background templates. Hierdoor ontstaat er een negatief saldo of kan de speler dubbel kiezen.
- **Oplossing**: We introduceren een gecentraliseerde resolver die bij elke stap de reeds verkregen proficiencies bijhoudt:
  ```typescript
  const baseProficiencies = [
    ...(selectedSpecies?.proficiencies || []),
    ...(selectedBackground?.proficiencies || [])
  ];
  // Filter de beschikbare keuzes voor de Class om reeds gekozen proficiencies uit te sluiten!
  const availableClassSkills = classSkills.filter(skill => !baseProficiencies.includes(skill));
  ```

### Knelpunt 2: Lege schermen of knoppen die niks doen
- **Oorzaak**: Veel stappen (zoals `SpellsStep.tsx` voor non-spellcasters of `IdentityStep.tsx`) tonen lege pagina's of missen feedback.
- **Oplossing**:
  - **Dynamische stappen-volgorde**: Sla stappen die niet van toepassing zijn (zoals `SpellsStep` voor een Barbarian of Fighter) automatisch over!
  - **Duidelijke validatie**: Blokkeer de "Volgende" knop niet zonder uitleg, maar toon een vriendelijke, goudomrande melding (bijv. *"Kies nog 1 vaardigheid om verder te gaan"*).

### Knelpunt 3: Onduidelijkheid bij keuzes (wat doet wat?)
- **Oorzaak**: Spelers zien alleen een naam van een feature of feat, zonder te weten wat het doet.
- **Oplossing**: Integreer onze prachtige, nieuw geschreven `fetchFeatData` en `fetchFeatureData` helpers om bij elke keuze een prachtige "floating details card" of tooltip te tonen waarin de beschrijving, werking en afbeelding helder worden uitgelegd!

---

## 🎨 Deel 3: Ontwerp voor de Nieuwe Karaktercreatie-Wizard

We gaan de Character Creator ombouwen tot een meeslepende, vloeiende, 12-staps reis:

```
[ Welcome ] ➔ [ Slot Select ] ➔ [ Identity/Gender ] ➔ [ Species/Race ] ➔ [ Class ]
                                                                             │
[ Review ] 🠔 [ Equipment ] 🠔 [ Backstory ] 🠔 [ Spells ] 🠔 [ Skills/Choices ] 🠔 ┘
```

### De 12 Stappen in Detail:

1. **`WelcomeStep` (Welkom)**: Prachtige introductie met sfeervolle muziek en lore.
2. **`SlotStep` (Save Slot)**: Kiezen of overschrijven van een save-game slot.
3. **`IdentityStep` (Identiteit)**: Kiezen van naam, gender, leeftijd en uiterlijk-stijl.
4. **`SpeciesStep` (Species/Race)**: Kiezen van Species (Human, Elf, Dwarf etc.) met live preview van stats en eigenschappen.
5. **`ClassStep` (Class)**: Kiezen van startklasse met hit die weergave en start-HP.
6. **`StatsStep` (Eigenschappen)**: Verdelen van ability scores via Point Buy, Standard Array of 3D Dice Rolling!
7. **`SkillsStep` (Vaardigheden)**: Dynamisch kiezen van skill proficiencies op basis van de Class en Background, gecorrigeerd voor Species-bonussen.
8. **`ChoicesStep` (Klasse-opties)**: Kiezen van klasse-specifieke opties (zoals Fighting Styles of Ranger favored enemies).
9. **`SpellsStep` (Spreuken)**: Alleen voor spellcasters! Kiezen van cantrips en level 1 spells uit de gepoorte spell database.
10. **`BackstoryStep` (Achtergrond)**: Kiezen of schrijven van backstory, traits, idealen en bonds.
11. **`EquipmentStep` (Uitrusting)**: Kiezen van startpakket (bijv. Class Pack vs Goud rollen) en live vullen van de inventory.
12. **`ReviewStep` (Overzicht)**: Prachtige, samenvattende character sheet met een "Bake Character" knop om de save game definitief te maken met een sfeervol geluidseffect!

---

## 📈 Deel 4: Ontwerp voor het Nieuwe Leveling Systeem

Wanneer een karakter in aanmerking komt voor een level-up, triggeren we het `LevelUpOverlay.tsx` component:

1. **HP Roller**: Spelers kunnen kiezen om hun HP-toename gemiddeld te nemen of live te rollen met een prachtige 3D d8/d10/d12 dobbelsteen op het scherm!
2. **Advancement Flow**:
   - Controleert of er op het nieuwe level een **keuze** gemaakt moet worden (bijv. Subclass op level 3, Feat/ASI op level 4).
   - Indien ja: toont een prachtig keuzemenu met details over Feats (ingeladen via `fetchFeatData`) of Subclasses (`fetchSubclassData`).
   - Indien nee: toont een samenvatting van de automatisch verkregen features (ingeladen via `fetchFeatureData`).
3. **Commit**: Slaat de nieuwe stats, HP, features en spells op in de save-game en herstart de Vite ontwikkelserver/game state om de wijzigingen direct toe te passen!
