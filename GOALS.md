# Artificer: Project Goals & Architecture Blueprint

## 1. Project Vision
Artificer is evolving from an immersive digital grimoire into a **complete AI-powered Dungeons & Dragons simulation platform**. The goal is to provide a seamless, high-fidelity experience where an LLM-driven Dungeon Master orchestrates complex game systems, maintains a persistent world state, and narrates adventures with perfect mechanical consistency.

## 2. Core Design Principles
*   **Immersive Skeuomorphism**: Maintain the "feel" of a physical artifact (books, cards, dice) while leveraging digital power.
*   **Schema-Driven Reality**: Every entity (NPC, Item, Spell, Map) is governed by strict JSON schemas. The AI interprets these schemas rather than hallucinating stats.
*   **AI Orchestration**: The AI DM is a narrator and coordinator. It uses tools to modify the game state, which then reflects in the UI.
*   **Data Integrity**: Use validation scripts and schemas to ensure the "Atlas" remains the single source of truth for all game rules.

## 3. Architectural Goals
*   **Service-Oriented Core**: Decouple UI from game logic. Services (AI, Atlas, Storage) should handle the "heavy lifting."
*   **Reactive State Management**: Expand the Zustand store to handle complex campaign states, including temporal progression and faction standings.
*   **Proxy-Based Persistence**: Continue using the server-side proxy to bridge the frontend with GitHub (for data) and AI models, ensuring security and CORS compliance.

## 4. AI Dungeon Master Requirements
The AI DM must operate with full contextual awareness of:
*   **Party Metadata**: Composition, stats, inventory, and health.
*   **Narrative State**: Quest progress, campaign history, and session summaries.
*   **World State**: Current location, NPC relationships, and faction standings.
*   **Environmental Context**: Time of day, weather, and tactical conditions.

## 5. Campaign Management Requirements
*   **Autonomous Generation**: Tool-driven generation of adventures, story arcs, and dungeons.
*   **Persistent Journaling**: Automatic generation of player journals after every session/in-game day.
*   **Dynamic Lore**: Lore that evolves based on player actions (e.g., a city's description changes if it is besieged).

## 6. Character Management Requirements
*   **Full Lifecycle Support**: From procedural generation (Character Creator) to level-up progression (LevelUpOverlay).
*   **Inventory V2 Unification**: Transition all characters to the registry/slot-based inventory system to support complex tactical interactions (equipping, weight, containers).
*   **Condition Tracking**: Mechanical implementation of D&D 5.5e conditions and their effects on stats.

## 7. World Simulation Requirements
*   **Time Progression**: A system-clock that tracks days, months, and eras, affecting NPC behavior and world events.
*   **Faction & Reputation**: Numeric and qualitative tracking of how the world perceives the party.
*   **Economic Simulation**: Regional pricing for equipment and materials based on local supply and events.

## 8. Combat System Requirements
Transition from "Card Simulator" to a **Tactical Battle Interface**:
*   **Grid-Based Movement**: Top-down maps with token management and collision.
*   **Automation**: AI-assisted turn management, initiative tracking, and NPC combat logic.
*   **Spatial Analysis**: Line-of-sight calculations and AOE targeting (cones, spheres, lines).

## 9. Dice System Requirements
*   **Advanced Parser**: Handle complex roll strings (e.g., `2d6 + 4 [fire] + 1d4 [poison]`).
*   **Visual Fidelity**: 3D dice animation support integrated with the current overlay.
*   **Roll Validation**: Ensure rolls are tied to specific character actions or skill checks for auditability.

## 10. Asset Generation Requirements
*   **Consistent Aesthetics**: Use curated prompts (like those in `npcService.ts`) to ensure generated images for NPCs, items, and monsters maintain a "Baldur's Gate 3" style.
*   **Chroma-Key Standards**: Maintain strict green-screen rules for character portraits to allow UI flexibility.

## 11. Data Architecture Guidelines
*   **Standardized Paths**: Always use `public/assets/atlas/[category]/json/` for data and `public/assets/atlas/[category]/images/` for assets.
*   **Typo Maintenance**: For Faerûn-specific data, respect the required intentional typos (`totil`, `fearun`, `swort_coast_south`) to maintain compatibility with legacy systems.
*   **Schema First**: No asset should be added without passing its respective JSON schema validation.

## 12. Tooling Architecture
The AI DM should access "Tools" via the API to:
*   `generateAsset(type, context)`
*   `updateCampaignState(key, value)`
*   `resolveCombatAction(actorId, actionId, targetId)`
*   `updateJournal(entry)`

## 13. Persistence & Memory Systems
*   **GitHub as Database**: Continue using GitHub for long-term storage of atlas data and character saves.
*   **Session Memory**: Implement a short-term vector-based or context-window memory for the LLM to recall recent dialogue and immediate surroundings.

## 14. UI/UX Goals
*   **Zero-UI Immersion**: Move toward a HUD-less experience during narration, where info is gleaned from the skeuomorphic elements (e.g., checking a physical-looking map).
*   **Contextual UI**: Menus and overlays (like `FocusView`) should only appear when relevant to the current interaction.

## 15. Future Roadmap
1.  **Phase 1: Inventory Unification**: Complete the migration to Inventory V2.
2.  **Phase 2: Tactical Foundations**: Implement basic grid movement and initiative.
3.  **Phase 3: AI DM Integration**: Connect the LLM to the system's tool-calls.
4.  **Phase 4: World Simulation**: Roll out the temporal and faction systems.

## 16. Technical Debt & Refactoring Recommendations
*   **Inventory Cleanup**: Remove all "v1" logic from `useStore.ts` and `ArcaneCodex.tsx`.
*   **Profile Consolidation**: Create a unified `EntityProfile` component that handles Monsters, NPCs, and Transports through a shared interface.
*   **Service Hardening**: Improve error handling in `storageService.ts` for GitHub API rate limits.

## 17. Missing Systems Analysis (this is in progress)
*   **Map System**: Currently missing a way to link locations in the Atlas to interactive battle maps.
*   **Soundscape Engine**: `soundService.ts` is robust but needs better integration with AI narration (e.g., AI requesting background music shifts).

## 18. Success Criteria
*   The AI DM can run a 30-minute session without human mechanical intervention.
*   A new character can be created, leveled to 20, and equipped without schema violations.
*   The system can automatically generate a "Post-Session Summary" that accurately reflects all game state changes.
