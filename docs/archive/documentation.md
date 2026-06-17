# Arcane Codex - Technical Documentation

Arcane Codex is a high-fidelity digital grimoire for character management, lore synthesis, and TTRPG logistics. It serves as a comprehensive tool for tabletop RPG enthusiasts, providing a high-fidelity interface that blends classic fantasy aesthetics with modern digital functionality.

## 1. Application Philosophy & Style

### Design Language
- **Aesthetic:** High-Fantasy, "Arcane" aesthetic using a parchment-and-ink visual metaphor.
- **Color Palette:**
  - **Parchment:** A range of warm, aged paper tones (`#FDFAF3` to `#523B23`).
  - **Dragon Red:** Deep crimson accents (`#8B0000`).
  - **Dragon Gold:** Metallic gold highlights and borders (`#D4AF37`).
- **Typography:**
  - **Header:** *Cinzel* (Classic Roman-style serif) for an impactful, cinematic feel.
  - **Body:** *Crimson Text* (Elegant book serif) for legibility.
  - **Technical:** *JetBrains Mono* (Clean monospaced for data).

### UI Components
- **Shadows**: Custom "magical" glows using the dragon-red/gold palette instead of generic blacks.
- **Borders**: Double-borders and ornamental corners consistent with fantasy cartography.
- **Motion**: Fluid transitions using `motion/react` with spring-based physics for a tactile, physical feel.

## 2. System Architecture

### Frontend & State
- **React 19 / Vite 6**: Modern SPA architecture.
- **Zustand 5**: Centralized state management. The store (`src/store/useStore.ts`) is the single source of truth for navigation, party state, and the active character.
- **Drag & Drop**: `@dnd-kit/core` and `@dnd-kit/sortable` power the inventory and character reordering.

### Backend & Proxy
- **Express Server (`server.ts`)**: Acts as a secure intermediary for:
  - **AI Proxy**: Routes requests to Google Gemini 1.5 Flash.
  - **GitHub Proxy**: Fetches Atlas data and commits character saves to the repository.
  - **Path/Host Allowlists**: Prevents SSRF and unauthorized file access by restricting requests to trusted domains (e.g., GitHub, Fandom) and directory prefixes (`public/assets/atlas/`, `data/character_save/`).
- **Firebase**: Used for real-time user profiles, authentication (Google Login), and character storage.

## 3. Inventory & Save System (v2)

Arcane Codex utilizes a sophisticated **Registry/Slot pattern** to manage character equipment and items, ensuring long-term save stability and data integrity.

### Core Entities
- **Item Templates**: Immutable definitions of items (e.g., `longsword`, `leather_armor`) stored in `public/assets/atlas/equipment/json/`. They define base stats, cost, weight, and visual assets.
- **Item Instances**: Specific items owned by a character, stored in the character's `items` registry.
  ```typescript
  interface ItemInstance {
    id: string;        // Unique instance UUID
    template: string;  // Reference to template index (e.g., "longsword")
    quantity: number;
    kind: string;      // weapon, armor, consumable, etc.
    isMagic?: boolean;
    attuned?: boolean;
    addedAt: number;
  }
  ```
- **Containers**: Uniform objects (backpacks, chests, pouches) consisting of a fixed number of `InventorySlots`.
  ```typescript
  interface InventoryContainer {
    id: string;
    type: 'backpack' | 'chest' | 'pouch' | 'corpse' | 'merchant';
    ownerId: string;
    slots: InventorySlot[];
  }
  ```
- **Inventory Slots**: Individual storage units within a container or equipment set.
  ```typescript
  interface InventorySlot {
    id: string;        // e.g., "bag_0", "main_hand"
    itemId: string | null; // Reference to ItemInstance.id
  }
  ```
- **Equipment Set**: A specialized container for a character's equipped items, using standardized slot IDs (e.g., `main_hand`, `off_hand`, `chest`, `head`, `feet`, `neck`, `ring_1`, `ring_2`, `tool_1-5`, `focus`, `quick_1-4`).

### Advantages
- **Save Stability**: Changes to item templates propagate to all existing saves without breaking them.
- **Data Efficiency**: Save files only store state rather than replicating the entire database.
- **Uniform Logistics**: Chests, corpses, and merchants use the same container/slot logic as the player's backpack.

## 4. The Atlas Service

The **Atlas Service** (`src/services/atlasService.ts`) is the backbone of the game's rulebook and data repository, providing a resilient multi-path fetch strategy.

### Resiliency Strategy
1. **Local Resolution**: Attempts to fetch from `/assets/atlas/...` for zero-latency.
2. **Path Normalization**: Automatically resolves naming inconsistencies (e.g., `_` vs `-`, singular vs plural folders).
3. **Remote Proxy**: Fallback to GitHub Raw via the server-side proxy for updated or missing assets.
4. **Caching**: Implements an in-memory cache to prevent redundant network overhead during session-heavy tasks like character creation.

## 5. AI Lore & Synthesis

Integrated with **Google Gemini 1.5 Flash**, the AI engine assists in:
- **Lore Extraction**: Parsing raw Wiki text or D&D source blocks into structured JSON entities (`Monster`, `Spell`, etc.).
- **Atmospheric Synthesis**: Generating 2-3 paragraph descriptions based on traits, habitat, and tactical context.
- **Monster Generation**: Converting unstructured text into valid game objects with typed stats.

## 6. Development Workflow

### Asset Management Tools
- **Validation**: `npm run validate:assets` runs schema and path integrity checks.
- **Indexing**: Scripts in `tools/` generate optimized `index.json` files for equipment, spells, and enemies to ensure fast list rendering without fetching every individual asset.
- **Normalization**: `npm run normalize:assets` ensures consistent property names and path formats across the database.

### Project Layout
- `/src/components/`: Modular UI, divided into `character`, `devkit`, `audio`, and `bookreader`.
- `/src/services/`: Core business logic (AI, Storage, Sound, Save).
- `/public/assets/atlas/`: The core immutable database (Items, Spells, Monsters, Maps, Rules).
- `/tools/`: CJS utility scripts for data integrity.

---
*Maintained by the Artificer Development Team.*
