# 📖 Research Blueprint: Combat & Character Progression (Level-Up)

Dit document bevat een diepgaande analyse van de Foundry VTT `module/` broncode (versie 6.0.x) voor **Combat** en **Advancement (Level-Up)**, en vertaalt deze naar concrete aanbevelingen en een roadmap voor ons eigen Artificer-systeem.

---

## 🛡️ Deel 1: Combat & Action Economy Analyse (`combat.mjs` & `combatant.mjs`)

Uit onze analyse van de modulecode blijkt dat Foundry combat beheert als een state machine gekoppeld aan tokens, combatants en active effects.

### Belangrijke Mechanismen in Foundry:
1. **Initiative Grouping & Rolling (`Combat5e.rollInitiative`)**:
   - Ondersteunt groepsrollen voor vijanden van hetzelfde type (`initiativeGroupRoll`). Dit is heel handig voor onze tactical grids om monsters van hetzelfde type tegelijkertijd te laten bewegen/handelen (NPC turn-runner clustering).
2. **Resource Recovery (`Combat5e._recoverUses`)**:
   - VTT triggert herstel van acties, bonusacties, reacties en item-uses op vaste momenten:
     - `encounter: true` (bij de start van combat)
     - `turnStart: true` (wanneer een turn start)
     - `turnEnd: true` (wanneer een turn eindigt)
     - `initiative: true` (zodra initiative is gerold)
3. **Turn Progression & Sorting (`Combat5e._sortCombatants`)**:
   - Sorteert combatants op basis van hun initiative-score. Bij gelijke initiative wordt gesorteerd op basis van actor-naam of ID, of of het een PC of NPC is.

### Aanbeveling voor ons Tactisch Combat Systeem:
We hebben al een werkend tactisch combat grid (`CombatGrid.tsx` en `useGameStore.ts`). De volgende uitbreidingen zijn het slimst om te bouwen op basis van de modulecode:
- **Status Effect & Action Economy Tick**: Integreer een start/end turn trigger in de store die automatisch:
  - Reacties en Bonusacties ververst.
  - Active effects (zoals Poison, Paralysis) decrement of een saving throw triggert aan het begin/einde van een turn.
- **NPC Initiative Clustering**: Group NPC's van hetzelfde type onder één turn-score om combat soepeler en vlotter te laten verlopen in de interface.

---

## 📈 Deel 2: Character Advancement & Level-Up Analyse (`advancement/`)

In Foundry is **Advancement** de generieke engine die ervoor zorgt dat characters automatisch en data-driven kunnen levelen op basis van de templates in Classes en Subclasses.

### Belangrijke Mechanismen in Foundry:
1. **`base-advancement.mjs` & `advancement-manager.mjs`**:
   - Leveling is opgebouwd uit losse "Advancement Steps" (Flows). Elke klasse heeft een set van deze steps per level:
     - **Scale Value**: Schalen van class variables (bijv. Rogue's Sneak Attack schade die van `1d6` naar `2d6` gaat).
     - **Item Grant**: Automatisch toekennen van features (bijv. *Action Surge* op level 2).
     - **Ability Score Improvement (ASI)**: Keuzemenu voor stat-verhogingen of feats.
     - **Hit Points**: Berekenen van HP-toename (gemiddelde of hit die roll + CON modifier).
2. **Advancement Flow**:
   - Wanneer een speler levels omhoog gaat, opent de `AdvancementManager` een stappenplan (wizard) waarin de speler keuzes maakt (zoals subclass kiezen of feats selecteren). Pas na bevestiging worden de wijzigingen definitief weggeschreven naar de character save.

### Aanbeveling voor ons Progression & Level-Up Systeem:
We moeten voorkomen dat level-up logica hardcoded in onze React componenten zit. In plaats daarvan bouwen we een data-driven progression wizard:
- **Stap 1: Data Porting**:
  - We moeten de `races`, `classes` en `classfeatures` volledig poorten naar onze JSON structuren (dit ligt al klaar in de pipeline blueprint).
- **Stap 2: Progression Store**:
  - Bouw een lichtgewicht wizard in ons `LevelUpOverlay.tsx` component die de `class_levels` JSON inlaadt van de actieve class en speler per stap door de keuzes leidt (HP rollen -> Features bekijken -> Subclass kiezen indien level 3 -> Stats/Feat kiezen op level 4).

---

## 🗺️ Roadmap & Conclusie: Wat eerst te doen?

Het is **het allerslimst** om eerst een stevig fundament te leggen door de data te poorten en te documenteren, voordat we ingewikkelde interface-logica gaan bouwen.

### Aanbevolen Fasen:

### 📋 Fase 1: Data Integratie & Documentatie (Nu Afronden)
- [x] Porten van Roll Tables (14 & 24) en Feats (24). *(GEDAAN!)*
- [x] Opschonen van oude flat equipment files. *(GEDAAN!)*
- [ ] Analyseren en documenteren van de Class progression & Combat data modellen in detail (dit bestand).

### 📖 Fase 2: Class & Species Data Porting (Eerstvolgende Taak)
- [ ] Bouwen van `tools/portClasses.cjs` en `tools/portSpecies.cjs`.
- [ ] Exporteren van Classes, Subclasses, Class Features, Races en Backgrounds naar `/assets/atlas/`.
- [ ] Genereren van een centrale progression index voor classes en class features.

### 📈 Fase 3: Dynamic Level-Up Screen & HP Roller
- [ ] Uitbreiden van `LevelUpOverlay.tsx` om templates in te laden via ons nieuwe `storageService.ts` en `atlasService.ts`.
- [ ] Integreren van de WebGL 3D dice roller voor het rollen van de klasse hit die op het level-up scherm.
- [ ] Dynamisch injecteren van gekozen subclasses en features in de save game.

### ⚔️ Fase 4: Tactische Combat Verfijning (Action Economy)
- [ ] Toevoegen van turn start/end triggers in `useGameStore.ts` voor effect ticks.
- [ ] NPC turn clustering en AI basic combat logic.

we hebben een balk nodig om aan te tonen hoeveel ft movement de character nog over heeft. ook als de character de pc niet de enemies natuurlijk. hier is hoe het werkt. 1. Je komt op 0 HP

Wanneer je character naar 0 HP gaat en niet direct doodgaat door bijvoorbeeld massive damage:

Je valt Unconscious.
Je kunt normaal gesproken niet meer bewegen of acties uitvoeren.
Aan het begin van elke beurt doe je een Death Saving Throw.
Je hebt maximaal 3 failures en 3 successes.

Bijvoorbeeld:

Ava Loobi
HP: 0 / 24
Status: Unconscious

Death Saves:
✓ Successes: 1/3
✗ Failures: 0/3
🎲 2. Je rolt een d20

Een Death Save is geen ability check en ook geen saving throw gekoppeld aan STR/DEX/etc.

Je rolt simpelweg:

d20

De uitkomst:

Roll	Resultaat
10–20	1 Success
2–9	1 Failure
1	2 Failures
20	Je krijgt 1 HP en wordt wakker

Dus:

d20 = 14 → ✓ Success
d20 = 7  → ✗ Failure
d20 = 1  → ✗✗ 2 Failures
d20 = 20 → HP = 1, wakker
❤️ 3. Drie successes

Bij:

✓ ✓ ✓

is je character Stable.

Je character blijft op 0 HP, maar hoeft geen Death Saves meer te rollen.

Bijvoorbeeld:

HP: 0 / 24
Condition: Unconscious
Stable: true
Death Saves:
✓ ✓ ✓

Je wordt dus niet automatisch wakker.

Je kunt later door healing weer HP krijgen.

💀 4. Drie failures

Bij:

✗ ✗ ✗

gaat je character dood.

HP: 0 / 24
Condition: Dead
⚔️ 5. Damage terwijl je op 0 HP ligt

Dit is belangrijk als je het voor jouw character sheet/game implementeert.

Wanneer een unconscious character damage krijgt:

Normale damage:

+1 Death Save failure

Critical hit:

+2 Death Save failures

En als de damage afkomstig is van een melee attack binnen 5 feet, is er nog een speciale regel:

Als die attack een critical hit is, is dat 2 failures.

Daarnaast bestaat instant death door massive damage: als één instance of damage je van 0 HP naar een negatieve hoeveelheid brengt die minstens gelijk is aan je maximum HP, sterf je direct.

🩹 6. Healing

Zodra iemand op 0 HP ligt en healing krijgt:

HP: 0
    ↓
Healing +8
    ↓
HP: 8

Dan zijn de Death Saves niet meer relevant.

Je character wordt weer actief afhankelijk van de betreffende healing/condition-regels.

Voor jouw character sheet

Als je dit in je D&D-game wilt bouwen, zou ik Death Saves los van HP opslaan.

Bijvoorbeeld:

interface DeathSaves {
  successes: number; // 0-3
  failures: number;  // 0-3
}

interface Character {
  hp: number;
  maxHp: number;
  deathSaves: DeathSaves;
  isUnconscious: boolean;
  isStable: boolean;
  isDead: boolean;
}

En de kernlogica:

if HP <= 0
    ↓
Unconscious
    ↓
Death Save
    ↓
d20
 ┌───────────────┐
 │ 1             │ → +2 failures
 │ 2–9           │ → +1 failure
 │ 10–19         │ → +1 success
 │ 20            │ → HP = 1
 └───────────────┘
    ↓
3 failures? → DEAD
3 successes? → STABLE

Belangrijk voor jouw combat-systeem: Death Saves resetten wanneer je weer 1 HP of meer krijgt. Je zou dus niet moeten behandelen als een permanente character-stat zoals STR, DEX of XP. Ze horen bij de huidige downed state van het character. 
