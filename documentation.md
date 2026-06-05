# Arcane Codex - Documentation

Arcane Codex is an immersive digital grimoire designed for managing characters, monsters, items, and magical spells. It serves as a comprehensive tool for tabletop RPG enthusiasts, providing a high-fidelity interface that blends classic fantasy aesthetics with modern digital functionality.

## 1. Application Philosophy & Style

### Design Language
- **Aesthetic:** High-Fantasy, "Arcane" aesthetic using a parchment-and-ink visual metaphor.
- **Color Palette:**
  - **Parchment:** A range of warm, aged paper tones (`#FDFAF3` to `#523B23`).
  - **Dragon Red:** Deep crimson accents (`#8B0000`).
  - **Dragon Gold:** Metallic gold highlights and borders (`#D4AF37`).
- **Typography:**
  - **Header:** *Cinzel* (Classic Roman-style serif).
  - **Body:** *Crimson Text* (Elegant book serif).
  - **Technical:** *JetBrains Mono* (Clean monospaced for data).
  - **Specialty:** *Quintessential*, *Playfair*, *Rajdhani*.

### Icons
The application uses a custom SVG-based icon system (`GameIcon`) with paths defined in:
- `src/assets/icons/ui.ts`
- `src/assets/icons/navigation.ts`
- `src/assets/icons/equipment.ts`
- `src/assets/icons/classes.ts`
- `src/assets/icons/logistics.ts`

## 2. Modules & Project Structure

### Source Directory (`/src`)
- **`components/`**: Reusable UI elements, character creator steps, dashboard widgets, and feature-specific views (e.g., `EquipmentDoll`, `PartyLogistics`).
- **`services/`**: Core business logic and external integrations.
  - `ai/`: Gemini API integration for generating lore, monsters, and characters.
  - `atlasService.ts`: Specialized service for the Toril Atlas, implementing a resilient multi-path fetch strategy for game rules and entities.
  - `saveService.ts`: Repository-centric persistence logic for character save manifests.
- **`store/`**: Global state management using **Zustand** (Slot-based selection).
- **`lib/`**: Utility functions, character generation pipeline, and static trait registries (`atlasTraits.ts`).
- **`assets/`**: Icon paths, textures, and static resources.

### Dependencies
- **State Management**: `zustand` (v5)
- **UI & Animation**: `react` (v19), `framer-motion` (v12), `lucide-react`, `motion` (v12)
- **AI Integration**: `@google/genai` (v1.29.0 - Gemini 1.5 Flash)
- **Backend/Persistence**: `firebase` (v12), `express` (v4)
- **Data Protocols**: `react-markdown` (v10), `rehype-raw`, `remark-gfm`
- **Drag & Drop**: `@dnd-kit/core` (v6), `@dnd-kit/sortable`
- **Build & Style**: `vite` (v6), `tailwindcss` (v4), `tsx`

## 3. Data Structure

### Global State (Zustand)
The application state is centralized in `src/store/useStore.ts`:
- **`characters`**: Active party member instances currently in the lineup.
- **`mainCharacterSlots`**: Save manifest storage for up to 3 characters.
- **`explorerTab`**: 'enemies' | 'materials' | 'equipment' | 'key' | 'books' | 'spells'.
- **`viewMode`**: 'preview' (codex mode) | 'collection' (inventory mode).

### Atlas Data Structure
The Atlas acts as the core rulebook, providing immutable data entities fetched as JSON:

#### `AtlasClass`
- `hit_die` (e.g., 8, 10, 12).
- `proficiencies`: Default class proficiencies.
- `saving_throws`: Linked attribute indices (e.g., `str`, `dex`).
- `starting_equipment`: Array of required items with slot and quantity data.
- `starting_equipment_options`: Nested choice arrays for branching loadouts.

#### `AtlasSpecies`
- `speed` (number).
- `ability_bonuses`: Mapping of attribute indices to integer bonuses.
- `languages` & `traits`: Arrays of string indices linking to other Atlas entities.

#### `AtlasBackground`
- `starting_proficiencies`: Background-specific skill and tool options.
- `suggested_characteristics`: Narrative tables for traits, ideals, bonds, and flaws.

#### `AtlasTrait` & `AtlasProficiency`
- `index`, `name`, `desc` (string array).
- `ability_score`: (Optional) specifically for attribute-linked proficiencies.

### Core Entity: Character
The digital representation of a player character:
- `identity`: name, class, species, level, xp, alignment.
- `appearance`: Computed physical descriptors (hair, body, skin, etc.).
- `stats`: Base scores (Str, Dex, Con, Int, Wis, Cha).
- `inventory`: Map of slot IDs to item objects.
- `backpack`: Array of unequipped items.
- `spells`: Collection of known/prepared spells.

### Database Schema (Firestore)
- `/users/{id}/characters`: Vault storage for character archetypes.
- `/locations`: Geographic data for mapping Toril regions.

## 4. Inner Workings

### Atlas Resiliency Strategy (`AtlasService`)
The Atlas implements a tiered fetching logic:
1.  **Local Check**: Attempts to fetch from `/assets/atlas/...` for fast response.
2.  **Mapping Fallback**: Automatically tries multiple path variants (e.g., `_` vs `-` slugs, `/classes/` vs `/class/` folders).
3.  **GitHub Proxy**: If local files are missing, it uses a server-side proxy to fetch from `japiohopman/artificer` (GitHub Raw) via `/api/raw`.
4.  **Caching**: Entities are cached locally in-memory to prevent redundant network calls during step-based character creation.

### AI Lore & Synthesis (`monsterService.ts`)
The application leverages Gemini 1.5 Flash for high-entropy content:
- **Text-to-Entity Parsing**: Converts unstructured D&D text blobs into valid `Monster` objects with typed stats.
- **Lore Synthesis**: Generates atmospheric 2-3 paragraph summaries using structured prompts and habitat contexts.
- **Wiki Scraping & Integration**: Utilizes a combination of MediaWiki API and LLM-based cleaning to ingest data from external D&D wikis into the Arcane Codex format.

### Character Pipeline
The generation process in `src/lib/characterPipeline.ts` follows a strict sequence:
1.  **Drafting**: Selection of Race/Class from Atlas.
2.  **Attribute Rolling**: Statistical validation.
3.  **Visual Manifestation**: Assignment of `AppearanceStep` variables.
4.  **Save Manifest Sync**: Writing the final JSON to the designated `mainCharacterSlots` and syncing to GitHub depository.

## 5. Style & Aesthetic

### Visual Identity
- **Primary Palette**: `dragon-red` (#8B0000), `dragon-gold` (#D4AF37), and `parchment` shades.
- **Typography**: 
  - **Headings**: Modern, bold, all-caps sans-serif (Inter/Outfit) with wide tracking for an impactful, cinematic feel.
  - **Body**: Elegant, legible serif for long-form lore and descriptions.
- **Textures**: Heavy use of "paper-texture" overlays and parchment backgrounds to simulate a physical grimoire.

### UI Components
- **Shadows**: Custom "magical" glows using the dragon-red/gold palette instead of generic blacks.
- **Borders**: Double-borders and ornamental corners consistent with fantasy cartography.
- **Motion**: Fluid transitions using `motion/react` with spring-based physics for a tactile, physical feel.

---

*Documentation maintained by AI Studio Build.*
