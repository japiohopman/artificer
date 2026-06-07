<div align="center">
<img width="1200" height="475" alt="Arcane Codex Banner" src="[https://ai.google.dev/static/site-assets/images/share-ais-513315318.png](https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fgen.krea.ai%2Fimages%2F6b7a7ea2-3bbc-4526-918c-c92a8969c8c9.png)" />
</div>

# 📜 Arcane Codex

**Arcane Codex** is an immersive digital grimoire and character management suite designed for tabletop RPG enthusiasts. It blends a rich high-fantasy aesthetic with modern digital functionality, providing a tactile, "parchment-and-ink" experience for managing heroes, monsters, spells, and equipment.

---

## ✨ Key Features

- **🛡️ Character Creator & Vault**: A guided pipeline for forging legendary heroes, complete with attribute rolling, visual manifestation, and secure storage via Firebase.
- **🐉 Dynamic Bestiary & Atlas**: A comprehensive repository of monsters, materials, and locations, powered by a resilient "Atlas Service" that ensures data availability across local and remote sources.
- **🎒 Inventory v2 (Registry-Based)**: A sophisticated inventory system utilizing a Registry/Slot pattern. It supports complex equipment rules, containers (backpacks, chests), and drag-and-drop logistics via `dnd-kit`.
- **🔮 AI Lore Synthesis**: Integrated with **Google Gemini 1.5 Flash** to generate atmospheric lore, parse unstructured monster data into typed entities, and assist in creative world-building.
- **🎲 Digital Dice & Mechanics**: Real-time dice rolling with modifiers, action economy tracking, and automated level-up rewards.
- **🎵 Atmospheric Soundscape**: A multi-layered audio mixer that reacts to game events and environment changes.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/)
- **Styling & Motion**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion 12](https://www.framer.com/motion/)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Backend & Auth**: [Firebase 12](https://firebase.google.com/), [Express 4](https://expressjs.com/)
- **AI**: [Google Gemini API](https://ai.google.dev/gemini-api)
- **Data**: [React Markdown](https://github.com/remarkjs/react-markdown), [rehype-raw](https://github.com/rehypejs/rehype-raw)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- A Google Gemini API Key

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

3. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *Required keys: `GEMINI_API_KEY`, `GITHUB_TOKEN` (for Atlas proxy), and Firebase configuration.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 📂 Repository Structure

- `src/`: Core React application logic.
  - `components/`: Modular UI elements and feature views.
  - `services/`: Integrations for AI, Atlas data, and persistence.
  - `store/`: Zustand state slices.
- `public/assets/atlas/`: The immutable core database of game rules, items, and entities.
- `tools/`: Utility scripts for asset normalization, validation, and index generation.
- `server.ts`: Express-based development server and secure proxy for AI/GitHub requests.

---

## 🛡️ Security & Integrity

Arcane Codex implements strict validation schemas for all game assets and character saves.
- **Asset Validation**: Use `npm run validate:assets` to ensure JSON integrity and path consistency.
- **Path Guarding**: The server implements allowlists for all file operations and external proxies to ensure environment security.

---

*Forged by the Lorekeepers of Artificer.*
