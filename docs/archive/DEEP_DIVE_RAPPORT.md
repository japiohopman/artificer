# 🛡️ Artificer Deep Dive Rapport: Klassen, Leveling & Character Creation

Hallo Japie! Ik heb een diepe duik genomen in de code van de Artificer app om precies te ontleden hoe de fundamentele systemen werken. Hier is een overzicht van de mechanische logica achter de schermen.

---

## 1. 🏛️ Het Klassen Systeem (The Atlas Class Engine)

Het hart van de personage-eigenschappen zit in de `Atlas`. Elke klasse (zoals Wizard, Fighter, of Rogue) heeft zijn eigen blauwdruk in de vorm van een JSON-bestand.

### Hoe het werkt:
- **Data Locatie**: Alle klasse-informatie staat in `public/assets/atlas/class/json/`.
- **Inhoud**: Elk bestand definieert de "harde" regels voor die klasse:
    - **Hit Die**: Bepaalt de levenspunten (HP). Bijv. een d10 voor Fighters, d6 voor Wizards.
    - **Proficiencies**: Waar is je personage goed in? (Wapens, harnassen, gereedschap).
    - **Saving Throws**: Welke attributen gebruik je om gevaar te ontwijken (bijv. Dexterity voor Rogues).
- **Slimme Ophalers**: De `atlasService` is verantwoordelijk voor het ophalen van deze data. Het heeft een "resilient" (veerkrachtig) systeem: het probeert eerst de data lokaal te vinden en valt terug op een online reserve (GitHub proxy) als dat nodig is. Zo blijft de app altijd werken, zelfs als een lokaal bestand ontbreekt.

---

## 2. 🧬 Character Creation (De Manifestatie Flow)

Het aanmaken van een karakter is geen simpel formulier, maar een gecoördineerde "manifestatie" in `CharacterCreator.tsx`.

### Het Proces:
1. **Ancestry & Background**: Je kiest je soort (Race) en achtergrond.
2. **Metadata Synchronisatie**: Dit is de "magic" achter de schermen. Terwijl je kiest, draait er een proces (`useEffect`) dat constant de `Atlas` bevraagt. Als je 'Elf' kiest, worden je traits (zoals Darkvision) en talen automatisch klaargezet.
3. **Attributen (Stats)**: Je wijst je punten toe (Standard Array of Rollen). De app berekent direct je modifiers (bijv. 16 Strength = +3 modifier).
4. **Finalisatie**: Pas bij de allerlaatste stap ("Manifest") worden alle losse keuzes samengevoegd tot één compleet karakter-object. Hier worden ook je begin-HP en je Spell Slots berekent op basis van je klasse en level.

---

## 3. 📈 Het Leveling Systeem (Progressie Logica)

Het leveling systeem is ontworpen om groei automatisch en consistent te maken, gebaseerd op de 5.5e D&D regels.

### Mechanica:
- **De XP Tabel**: In `statCalculations.ts` staat de `XP_TABLE`. Dit is de meetlat. Zodra je XP een drempelwaarde overschrijdt (bijv. 300 XP voor Level 2), markeert het systeem je karakter voor een "Level Up".
- **ProcessLevelUp**: Deze functie in `characterUtils.ts` doet het zware werk:
    1. **Data Ophalen**: Het haalt de specifieke JSON op voor het nieuwe level (`public/assets/atlas/class/levels/`).
    2. **HP Verhoging**: Het berekent je nieuwe maximale HP. Voor level 1 krijg je het maximale van je Hit Die + je Constitution modifier. Voor elk level daarna krijg je een gemiddelde rol + modifier.
    3. **Features & Proficiencies**: Het voegt automatisch nieuwe krachten toe die bij dat level horen.
    4. **ASI (Ability Score Improvement)**: Het systeem detecteert automatisch of je op een level bent gekomen waar je je basis-attributen mag verhogen.

---

## 4. 🧠 Samenvatting voor de Orchestrator

Het systeem is uiterst modulair. Door de scheiding tussen de **Data** (de JSON-bestanden in de Atlas) en de **Logica** (de Services en Utils), kunnen we makkelijk nieuwe klassen of regels toevoegen zonder de hele app te herschrijven.

**De kernvisie**: De app gedraagt zich als een levende encyclopedie (de Codex) die precies weet wat een karakter op welk moment nodig heeft, gebaseerd op de keuzes die de speler maakt.

Succes met het verder bouwen aan dit prachtige project! 🚀
