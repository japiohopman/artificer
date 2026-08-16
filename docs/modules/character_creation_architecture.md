# 🧙‍♂️ Architecture Blueprint: Character Creation & Progression (Leveling)

Dit document bevat de diepgaande analyse en het technische ontwerp voor een volledige, waterdichte en visueel adembenemende herziening van de **Character Creator** (de stappen in de karaktercreatie) en het **Leveling Systeem** (karakter-progressie).

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

## 🎨 Species Sprite-Sheet Contract

The Species Selection presentation uses a canonical single sprite-sheet asset to render top-down / full portrait visual representations of the 14 standard playable species:

- **Canonical Asset Path**: `public/assets/ui/official/races/race_sprite.webp`
- **Layout Grid**: 2 Rows × 7 Columns
- **Cell Aspect Ratio**: 3:2 Aspect Ratio per cell (e.g., 384×256 pixels in a 2688×512 sprite sheet).
- **Species Ordering**:
  - **Row 1 (0)**: 1. Dragonborn, 2. Hill Dwarf, 3. Mountain Dwarf, 4. Drow, 5. High Elf, 6. Wood Elf, 7. Forest Gnome.
  - **Row 2 (1)**: 1. Rock Gnome, 2. Half-Elf, 3. Half-Orc, 4. Lightfoot Halfling, 5. Stout Halfling, 6. Human, 7. Tiefling.
- **Chroma-Key Processing**: Built-in green-screen backgrounds are transparently keyed out at render time using `ChromaKeyImage.tsx` with dynamic crop bounds.
- **Data Mapping**: Defined centrally in `src/components/character/species/speciesSpriteMap.ts` and rendered via `SpeciesSprite.tsx`. Selection value remain strictly canonical (`speciesId`), keeping visual rendering completely decoupled from gameplay mechanics.

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
