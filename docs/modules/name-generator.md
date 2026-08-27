# Naming Domain & Name Generator Foundation v1

## Architectural Purpose & Scope

The **Naming Domain** in Artificer is an application-wide, data-driven content generation capability located at `src/lib/naming/`.

It is **NOT** a UI component or a Character Creator-only feature. The Naming Domain serves as pure core infrastructure designed to be consumed by:

* Character Creator (`IdentityStep`, quick character generation)
* Character Sheet / Character Profile
* NPC Generation (`src/lib/npcGeneratorUtils.ts`, `DevKit`)
* Named Enemies & Bosses
* Companions & Recruitable Characters
* World Generation & Settlement Inhabitants
* Narrative & Quest Systems
* Content Authoring Tools

## Core Architecture & Principles

1. **Decoupled & Stateless**: Pure TypeScript module in `src/lib/naming/` with zero dependencies on React, UI global state, DOM, external APIs, or network services.
2. **Deterministic Seedability**: Guaranteed `same context + same seed = same generated result` via Mulberry32 PRNG (`src/lib/naming/rng.ts`).
3. **Data-Driven Rules**: Naming profiles and rules live in code/data (`src/lib/naming/rules/namingRules.ts` & `src/lib/naming/data/sourceData.ts`), isolating species-specific mechanics from UI code.
4. **Composition & Validation Pipeline**:
   `Context` → `Resolve Profile` → `Generate Candidates` → `Validate` → `Score & Diversity` → `Compose Name` → `Return Result`
5. **Typed Public API**: Minimal and clean public boundary exported via `src/lib/naming/index.ts`.

---

## Directory Structure

```
src/lib/naming/
├── types.ts                   # Public API interfaces, context, candidate & error types
├── rng.ts                     # Deterministic seedable Mulberry32 PRNG & array utilities
├── data/
│   └── sourceData.ts          # Structured canonical naming pools from source material
├── rules/
│   └── namingRules.ts         # Profile resolution, context match scoring & rule catalog
├── pipeline/
│   ├── generator.ts           # Candidate set generator
│   ├── composer.ts            # Component composition according to rule patterns
│   └── validatorAndScorer.ts  # Validation guards & quality scoring algorithms
└── index.ts                   # Public entrypoint exports (generateName, generateCandidates)
```

---

## Supported Source Naming Traditions

* **Tiefling**: Infernal Male/Female lineage names, Virtue/Concept names (e.g. *Art*, *Creed*, *Sorrow*).
* **Gnome**: 3-part traditional naming comprising Personal given name, Clan name, and playful Nickname (e.g. *Boddynock 'Sparklegem' Nackle*).
* **Dragonborn**: Clan name placed first as mark of honor, followed by personal given name (e.g. *Clethtinthiallor Arjhan*) and Childhood descriptive names for young dragonborn.
* **Elf**: Child names (under 100th birthday) vs Adult given names with combined Elven family lineage names.
* **Dwarf**: Elder-granted clan names and traditional given names.
* **Halfling**: Given name and persistent family nickname/surname.
* **Half-Elf**: Delegated cross-cultural human or elven naming conventions.
* **Half-Orc**: Guttural Orc given names or human trade names.
* **Human Ethnicities**: Calishite, Chondathan, Damaran, Illuskan, Mulan, Rashemi, Shou, Tethyrian, Turami regional lineages.

---

## Code Example

```typescript
import { generateName } from '@/lib/naming';

// Deterministic generation
const result = generateName({
  species: 'Dragonborn',
  gender: 'male',
  seed: 'campaign_npc_42'
});

console.log(result.displayName);
// Output: "Clethtinthiallor Arjhan"

console.log(result.resolvedProfile.tradition);
// Output: "Clan First Honor"
```

---

## Source Material Reference

The raw source text below serves as the source of truth for the canonical naming data pools embedded in `src/lib/naming/data/sourceData.ts`.

```
TIEFLING
Male Infernal Names: Akmenos, Amnon, Barakas, Damakos, Ekemon, Iados, Kairon, Leucis, Melech, Mordai, Morthos, Pelaios, Skamos, Therai
Female Infernal Names: Akta, Anakis, Bryseis, Criella, Damaia, Ea, Kallista, Lerissa, Makaria, Nemeia, Orianna, Phelaia, Rieta
Virtue Names: Art, Carrion, Chant, Creed, Despair, Excellence, Fear, Glory, Hope, Ideal, Music, Nowhere, Open, Poetry, Quest, Random, Reverence, Sorrow, Temerity, Torment, Weary

HALF-ORC
Male Orc Names: Dench, Feng, Gell, Henk, Holg, Imsh, Keth, Krusk, Mhurren, Ront, Shump, Thokk
Female Orc Names: Baggi, Emen, Engong, Kansif, Myev, Neega, Ovak, Ownka, Shautha, Sulha, Vola, Volen, Yevelda

GNOME
Male Names: Alston, Alvyn, Boddynock, Brocc, Burgell, Dimble, Eldon, Erky, Fonkin, Frug, Gerbo, Gimble, Glim, Jebeddo, Kellen, Namfoodle, Orryn, Roondar, Seebo, Sindri, Warryn, Wrenn, Zook
Female Names: Bimpnollin, Breena, Caramip, Carlin, Donella, Duvamil, Ella, Ellyjobell, Ellywick, Lilli, Loopmottin, Lorilla, Mardnab, Nissa, Nyx, Oda, Orla, Roywyn, Shamil, Tana, Waywocket, Zanna
Clan Names: Beren, Daergel, Folkor, Garrick, Nackle, Murnig, Ningel, Raulnor, Scheppen, Timbers, Turen
Nicknames: Aleslosh, Ashhearth, Badger, Cloak, Doublelock, Filchbatter, Fnipper, Ku, Nim, Oneshoe, Pock, Sparklegem, Stumbleduck

DRAGONBORN
Male Names: Arjhan, Balasar, Bharash, Donaar, Ghesh, Heskan, Kriv, Medrash, Mehen, Nadarr, Pandjed, Patrin, Rhogar, Shamash, Shedinn, Tarhun, Torinn
Female Names: Akra, Biri, Daar, Farideh, Harann, Havilar, Jheri, Kava, Korinn, Mishann, Nala, Perra, Raiann, Sora, Surina, Thava, Uadjit
Childhood Names: Climber, Earbender, Leaper, Pious, Shieldbiter, Zealous
Clan Names: Clethtinthiallor, Daardendrian, Delmirev, Drachedandion, Fenkenkabradon, Kepeshkmolik, Kerrhylon, Kimbatuul, Linxakasendalor, Myastan, Nemmonis, Norixius, Ophinshtalajiir, Prexijandilin, Shestendeliath, Turnuroth, Verthisathurgiesh, Yarjerit

DWARF
Male Names: Adrik, Alberich, Baern, Barendd, Brottor, Bruenor, Dain, Darrak, Delg, Eberk, Einkil, Fargrim, Flint, Gardain, Harbek, Kildrak, Morgran, Orsik, Oskar, Rangrim, Rurik, Taklinn, Thoradin, Thorin, Tordek, Traubon, Travok, Ulfgar, Veit, Vondal
Female Names: Amber, Artin, Audhild, Bardryn, Dagnal, Diesa, Eldeth, Falkrunn, Finellen, Gunnloda, Gurdis, Helja, Hlin, Kathra, Kristryd, Ilde, Liftrasa, Mardred, Riswynn, Sanni, Torbera, Torgga, Vistra
Clan Names: Balderk, Battlehammer, Brawnanvil, Dankil, Fireforge, Frostbeard, Gorunn, Holderhek, Ironfist, Loderr, Lutgehr, Rumnaheim, Strakeln, Torunn, Ungart
```
