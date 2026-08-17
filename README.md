<div align="center">
  <img width="1200" alt="Arcane Codex Banner" src="public/assets/ui/arcane_codex_banner.png" />

  # 📜 Arcane Codex
  **A Modern Digital Grimoire & Tabletop RPG Simulation Suite**

  [![Promo Website](https://img.shields.io/badge/Promo_Site-Arcane_Codex-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)](https://japiohopman.github.io/artificer_site_promo/)
  [![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](./LICENSE)
</div>

---

## 🌟 Overview

**Arcane Codex** (also known as *Artificer*) is a high-fantasy tabletop RPG platform designed for D&D 5.5e mechanics. It pairs a tactile, parchment-and-ink aesthetic with modern web technologies to deliver an interactive world map, character management vault, inventory logistics engine, 3D dice rolling, and atmospheric sensory controls.

Explore the world, track your campaign, manage hero progression, and immerse yourself in an AI-assisted narrative environment where game state and rules mechanics remain strictly authoritative.

🔗 **Explore the official promo site:** [Arcane Codex Showcase & Overview](https://japiohopman.github.io/artificer_site_promo/)

---

## ✨ Key Features

### 🗺️ Interactive World Atlas
- **Leaflet-Powered Spatial Exploration**: Multi-tier map navigation spanning regional overviews down to localized points of interest.
- **Click-to-Inspect Inspection Engine**: Select regions, cities, taverns, and landmarks to reveal detailed lore, NPCs, and site metadata.
- **Hierarchical Maps & Fog-of-War**: Map scaling designed to transition seamlessly between global geography and tactical sub-maps.

### 🛡️ D&D 5.5e Character Forge & Progression
- **Guided Character Creation**: Step-by-step hero creation supporting races, heritages, class features, skill proficiencies, and spells.
- **Dynamic Progression Engine**: Automatic computation of level-based feature unlocks, hit points, spell slots, and passive modifier calculations.
- **Character Vault**: Cloud and local character save management with rich vitals, stat displays, and equipment integration.

### 🎒 Inventory V2 Logistics
- **Registry & Slot Architecture**: Drag-and-drop inventory logistics using `@dnd-kit`.
- **Container Systems**: Support for nested equipment storage (backpacks, pouches, chests) with auto-calculated weight and capacity limits.
- **Stat Integration**: Automatic application of equipment AC bonuses, passive attribute modifiers, and speed changes.

### ⚔️ Tactical Grid & Combat Overlay
- **Combat Map Grid**: Tactical overlay supporting positioning, initiative order tracking, and movement grids.
- **Action Economy Panel**: Interface for tracking actions, bonus actions, reactions, and combat logging.

### 🎲 WebGL 3D Dice Engine
- **Physics-Based Rolling**: Integrated 3D dice physics powered by `@3d-dice/dice-box`.
- **Modifiers & Parsing**: Complex formula parsing (e.g. `2d20kh1 + 5`) with instant mechanical updates and audio feedback.
- **Customization**: Selectable dice materials, themes, and color schemes.

### 🎵 Atmospheric Audio & Lighting Engine
- **Multi-Track Audio Mixer**: Layered environmental soundscapes, ambient music, and tactical sound effects powered by `Howler.js`.
- **Philips Hue Lighting Sync**: Ambient lighting integration synchronizing physical room lighting with in-game weather, planar states, and combat moods.

### 🔮 AI Narrative Orchestration
- **Google Gemini 1.5 Integration**: AI-driven narrative assistant capable of describing scenes, generating NPC dialogue, and parsing monster stats.
- **Deterministic Game State**: Architectural separation ensuring AI narration never overwrites or bypasses core rulebook mechanics.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 6, TypeScript |
| **UI & Styling** | Tailwind CSS 4, Framer Motion 12, Lucide Icons, FontAwesome |
| **State Management** | Zustand 5 (Sliced store architecture) |
| **Maps & Spatial** | Leaflet, React-Leaflet |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` |
| **3D & Audio** | `@3d-dice/dice-box`, Howler.js, WaveSurfer.js |
| **Backend & Proxy** | Node.js, Express 4, TypeScript (`tsx`) |
| **Database & Auth** | Firebase 12 (Authentication, Firestore, Storage) |
| **AI Integration** | `@google/generative-ai` (Gemini 1.5 Flash) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (LTS recommended)
- **npm**: v9.0.0 or higher
- **Google Gemini API Key** (Optional, required for AI narration)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/japiohopman/artificer.git
   cd artificer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file to create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys in `.env`:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key
   GITHUB_TOKEN=your_github_token
   # Firebase Config (Optional for online persistence)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 📜 Development Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express proxy server and Vite dev server |
| `npm run build` | Compiles frontend assets for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checker (`tsc --noEmit`) |
| `npm run validate:assets` | Validates JSON atlas data against schema definitions |
| `npm run check:assets` | Normalizes asset paths and validates all atlas files |
| `npm run test` | Runs type checks, asset validation, and Playwright end-to-end tests |

---

## 📁 Repository Architecture

```text
artificer/
├── public/
│   └── assets/
│       ├── atlas/         # Core D&D 5.5e database (monsters, items, spells, maps)
│       ├── audio/         # Soundscapes, ambiances, and sound effects
│       └── ui/            # Banners, icons, and UI visual assets
├── src/
│   ├── components/        # UI components (HUD, Character Creator, World Map, Journal)
│   ├── lib/               # Utility functions, stat calculators, and rules logic
│   ├── services/          # AI Service, Dice Service, Atlas Fetcher, Audio Engine
│   ├── store/             # Sliced Zustand stores (World, Character, Inventory, Audio, Auth)
│   └── types/             # TypeScript definitions and data interfaces
├── tools/                 # Node.js scripts for asset indexing and validation
├── docs/                  # System documentation and architectural decisions
└── server.ts              # Express server and AI proxy API
```

---

## 🔗 Resources & Links

- 🌐 **Promo Website**: [https://japiohopman.github.io/artificer_site_promo/](https://japiohopman.github.io/artificer_site_promo/)
- 📖 **System Documentation**: Explore detailed architecture guides in [`/docs`](./docs/).

---

*Arcane Codex — Built for adventurers, powered by code.*
