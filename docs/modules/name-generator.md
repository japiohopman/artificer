# Artificer Naming Domain & Name Generator Foundation v1

## Architectural Purpose & Scope

The **Naming Domain** in Artificer is an application-wide, data-driven content generation capability located at `src/lib/naming/`.

It is **NOT** a UI component, React hook, or Character Creator-only feature. The Naming Domain serves as pure core domain infrastructure designed to be consumed across the application by:

* Character Creator (`IdentityStep`, `BackstoryStep`, quick random hero generation)
* Character Sheet / Character Profile
* NPC Generation (`src/lib/npcGeneratorUtils.ts`, DevKit tools)
* Named Enemies & Bosses
* Companions & Recruitable Characters
* World Generation, Towns & Settlement Inhabitants
* Narrative, Quest & DM/LM Systems
* Content Authoring & DevKit Tools

## Core Architecture & Principles

1. **Decoupled & Stateless**: Pure TypeScript module in `src/lib/naming/` with zero dependencies on React, UI global state, DOM, external APIs, network services, LLMs, or database persistence.
2. **Deterministic Seedability**: Guaranteed `same context + same seed = same generated result` via Mulberry32 seedable PRNG (`src/lib/naming/rng.ts`).
3. **Data-Driven Rules**: Naming profiles and rules live in code/data (`src/lib/naming/rules/namingRules.ts` & `src/lib/naming/data/sourceData.ts`), isolating species-specific mechanics from UI code.
4. **Source Data vs Project Extensions**: Official D&D source-derived name lists are kept strictly separated from project-authored extension pools (`projectExtensions` and neutral human default).
5. **Composition & Validation Pipeline**:
   `Context` → `Resolve Profile` → `Generate Candidates` → `Validate` → `Score & Diversity` → `Compose Name` → `Return Result`
6. **Explicit Context Handling**:
   - Genuinely gender-independent or unspecified gender pools are handled safely without silent defaulting to male.
   - Human culture handling explicitly distinguishes `known`, `missing`, and `unknown` culture statuses without corrupting character identity.
   - Half-Elf naming supports dual cross-cultural delegation (Elven or Human heritage) based on context.
7. **Typed Public API**: Minimal and clean public boundary exported via `src/lib/naming/index.ts`.

---

## Directory Structure

```
src/lib/naming/
├── types.ts                   # Public API interfaces, NamingContext, NamingResult & error models
├── rng.ts                     # Deterministic seedable Mulberry32 PRNG & array utilities
├── data/
│   └── sourceData.ts          # Structured source data catalog (Official D&D source + Project extensions)
├── rules/
│   └── namingRules.ts         # Profile resolution, human culture resolution & rule catalog
├── pipeline/
│   ├── generator.ts           # Candidate set generator
│   ├── composer.ts            # Component composition according to rule patterns & placeholder formatting
│   └── validatorAndScorer.ts  # Validation guards & deterministic quality/diversity scoring
└── index.ts                   # Public entrypoint exports (generateName, generateCandidates)
```

---

## Public Domain API

### `generateName(ctx: NamingContext): NamingResult`
Generates a single high-quality, deterministic name result matching the provided structured context.

### `generateCandidates(ctx: NamingContext, count?: number): NamingResult[]`
Generates multiple valid candidate names for inspection or UI choice selection tools without mutating global state.

---

## Supported Source Naming Traditions

* **Tiefling**: Infernal Male/Female lineage names, Virtue/Concept names (e.g. *Art*, *Creed*, *Sorrow*).
* **Gnome**: 3-part traditional naming comprising Personal given name, Clan name, and playful Nickname (e.g. *Boddynock 'Sparklegem' Nackle*).
* **Dragonborn**: Clan name placed first as mark of honor, followed by personal given name (e.g. *Clethtinthiallor Arjhan*) and Childhood descriptive names for young dragonborn.
* **Elf**: Child names (under 100th birthday) vs Adult given names with combined Elven family lineage names.
* **Dwarf**: Elder-granted clan names and traditional given names.
* **Halfling**: Given name and persistent family nickname/surname.
* **Half-Elf**: Delegated cross-cultural human or elven naming conventions based on upbringing/origin context.
* **Half-Orc**: Guttural Orc given names or human trade names.
* **Human Ethnicities**: Calishite, Chondathan, Damaran, Illuskan, Mulan, Rashemi, Shou (surname-first `{surname} {given}`), Tethyrian, Turami regional lineages, alongside explicit neutral handling for missing/unknown cultures.

---

## Code Example

```typescript
import { generateName, generateCandidates } from '@/lib/naming';

// 1. Deterministic generation with explicit seed
const result = generateName({
  species: 'Dragonborn',
  gender: 'male',
  seed: 'campaign_npc_42'
});

console.log(result.displayName);
// Output: "Clethtinthiallor Arjhan"

console.log(result.resolvedProfile.tradition);
// Output: "Clan First Honor"

// 2. Generating choices for UI or tool inspectors
const candidates = generateCandidates({
  species: 'Half-Elf',
  traditionStyle: 'human',
  culture: 'Illuskan',
  seed: 99
}, 3);

console.log(candidates.map(c => c.displayName));
```

---

## Limitations & Future Extensions

1. **Persistence Boundary**: The domain is strictly stateless and seedable. Persistence (saving generated names to character sheets or databases) is owned by consumer storage services (`useCharacterStore`, `storageService`).
2. **Rule Extensibility**: New species or cultural traditions can be added to `BUILTIN_NAMING_RULES` in `namingRules.ts` without modifying generator pipeline logic or public API contracts.
