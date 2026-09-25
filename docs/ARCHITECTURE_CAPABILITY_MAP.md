# Artificer Architecture & Capability Map

> **Version:** 1.0.0
> **Status:** Authoritative Architectural & Domain Map
> **Owner:** Architecture Specialist
> **Related Issues:** #313 (Capability Map), #306 (Specialist Agents), #298 (Ruleset 2024 Audit), #285 (Inventory V2)

---

## 1. Purpose & Core Architectural Principles

### Purpose
Artificer's codebase has reached a scale where feature addition and maintenance require an authoritative map of canonical domain owners, derived-state boundaries, gameplay gaps, and specialist agent responsibilities. This capability map serves as the single reference for answering:
- *Where does this behavior belong?*
- *What already exists and where is its source of truth?*
- *What is canonical vs derived vs presentation?*
- *What gameplay systems are incomplete or missing?*
- *Which specialist agent owns each domain?*
- *Which GitHub issue should implement a given capability?*

### Core Principles
1. **Identify Existing Owners First:** Before creating a new store, service, resolver, or component, trace the existing data flow and identify the canonical owner. Do not create parallel global stores or duplicated domain models.
2. **Canonical State Ownership:**
   - `useCharacterStore` — Canonical character state (party, main slots, HP, stats, spells, features, inventory v2 slot registrations).
   - `useInventoryStore` — Domain command & controller layer operating directly against canonical character state (`useCharacterStore`); NOT a second character store.
   - `useWorldStore` — Canonical world, location, calendar time, weather, and region state.
   - `useGameStore` — Canonical runtime game/combat state, dice history, and global active ruleset context (`2014` | `2024`).
   - `useAtlasStore` / Atlas loaders (`storageService.ts`, `atlasService.ts`) — Canonical static definitions and content registries (`public/assets/atlas/`).
   - `useChatStore` — Conversation history and active UI choices for the AI Narrator.
   - `useAudioStore` / `soundService.ts` — Runtime audio layer states, volumes, and sound triggers.
3. **Derived Values in Pure Calculators:** Character derived statistics (AC, initiative, passive perception, attack bonuses, save DCs, spell slot maximums) belong in pure calculation modules (`src/lib/statCalculations.ts`, `src/lib/characterUtils.ts`, `src/lib/progressionUtils.ts`), never duplicated across UI components or copied into local state.
4. **Pure Rule Resolvers:** Game mechanics (spell action resolution, equipment compatibility, background bonuses, name generation, pure grid geometry) belong in pure services/resolvers (`src/domain/spells/spellResolver.ts`, `src/lib/equipmentCompatibility.ts`, `src/lib/backgroundUtils.ts`, `src/lib/naming/`), decoupled from React components and global UI stores.
5. **God-Module Guard:**
   - Large or multi-responsibility modules (e.g., `src/store/useInventoryStore.ts`, `src/store/useCharacterStore.ts`, `src/store/useGameStore.ts`) must be protected against appending unrelated responsibilities.
   - New work must route domain state to its existing canonical store, derived values to pure selectors, rule evaluations to pure resolvers, and presentation to UI components.
   - When a module mixes multiple domains (e.g., `useGameStore` holding combat AI, minigames, logs, and 3D dice), document the split opportunity as a follow-up issue rather than performing an opportunistic rewrite during feature work.

---

## 2. Domain Capability Records

---

### A. Character Domain

#### A1. Canonical Character State
- **Current Canonical Module:** `src/store/useCharacterStore.ts`
- **Primary Functions / Hooks / Selectors:** `useCharacterStore()`, `useActiveCharacter()`, `setActiveCharacter()`, `addXp()`, `modifyHp()`, `updateCharacterStats()`, `learnSpell()`, `prepareSpell()`, `castSpell()`, `restoreSlots()`, `consumeAction()`, `restoreActionEconomy()`, `modifyMoney()`.
- **Source-of-Truth Data:** `Character` interface array (`characters[]`), `mainCharacterSlots[3]`, `activeCharacterId`, `levelUpQueue`.
- **Derived / Presentation Consumers:** `CharacterProfile.tsx`, `CreatorRightPanel.tsx`, `CharacterPanel.tsx`, `ActionPanel.tsx`, `EquipmentWorkspace.tsx`, `LevelUpOverlay.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** `Character` interface contains legacy V1 fields (`inventory`, `backpack`) alongside V2 fields (`items`, `containers`, `equipment`). `useCharacterStore` contains minor non-character state (`emotion`, `testAnimalInteraction`).
- **Related GitHub Issues:** #285, #306
- **Intended Specialist Agent:** Architecture Specialist (boundaries) / Gameplay Specialist (state mutations)
- **Dependencies:** `useWorldStore` (location discovery sync), `useGameStore` (ruleset sync)

#### A2. Derived Stats & Calculations
- **Current Canonical Module:** `src/lib/statCalculations.ts`
- **Primary Functions / Hooks / Selectors:** `calculateDerivedStats()`, `getEffectiveStats()`, `calculateWeaponAttackBonus()`, `evaluateUnarmoredACFeature()`, `calculateMaxSpellSlots()`, `getXpProgress()`.
- **Source-of-Truth Data:** Pure functions consuming `Character` state, equipped item definitions, traits, and features.
- **Derived / Presentation Consumers:** `CharacterPanelStats.tsx`, `CharacterPanelAbilities.tsx`, `ActionPanel.tsx`, `EquipmentCard.tsx`, `CharacterProfile.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Legacy unarmored AC evaluation contains hardcoded fallback checks for Barbarian/Monk alongside data-driven `passive_modifiers.ac_set` parsing.
- **Related GitHub Issues:** #298, #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `getModifier()` from `src/lib/npcGeneratorUtils.ts`

#### A3. Equipment Domain
- **Current Canonical Module:** `src/components/character/equipment/` (`EquipmentDoll.tsx`, `EquipmentWorkspace.tsx`, `EquipmentCard.tsx`), `src/lib/equipmentCompatibility.ts`
- **Primary Functions / Hooks / Selectors:** `evaluateSlotCompatibility()`, `isItemCompatibleWithSlot()`, `EQUIPMENT_SLOT_CATALOG`.
- **Source-of-Truth Data:** `Character.equipment` and `Character.items` in V2 state (`useCharacterStore.ts`).
- **Derived / Presentation Consumers:** `EquipmentWorkspace.tsx`, `EquipmentDoll.tsx`, `InventoryItemActionMenu.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Paper doll rendering contains visual SVG silhouette anchoring and slot drop targets that require synchronization when new equipment categories (e.g. ammunition) are added.
- **Related GitHub Issues:** #285
- **Intended Specialist Agent:** Gameplay Specialist (rules) / UI Specialist (presentation)
- **Dependencies:** `useCharacterStore`, `useInventoryStore`

#### A4. Inventory Domain
- **Current Canonical Module:** `src/store/useInventoryStore.ts`, `src/components/character/inventory/` (`Inventory.tsx`, `InventorySlot.tsx`, `FullInventoryMenu.tsx`, `PartyInventory.tsx`, `DraggableInventoryItem.tsx`)
- **Primary Functions / Hooks / Selectors:** `useInventoryStore()`, `equipItem()`, `unequipItem()`, `moveItem()`, `transferItem()`, `addToBackpack()`, `resolveItemTaxonomy()`, `deriveItemKind()`.
- **Source-of-Truth Data:** Transaction boundary operating on `useCharacterStore` (`char.items`, `char.containers`, `char.equipment`) and `useInventoryStore.partyInventory`.
- **Derived / Presentation Consumers:** `EquipmentWorkspace.tsx`, `FullInventoryMenu.tsx`, `PartyInventory.tsx`, `InventoryItemActionMenu.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** `useInventoryStore.ts` handles both individual character item transactions and shared party inventory / party vehicles. Identified as a key "God-module" to protect against further expansion.
- **Related GitHub Issues:** #285, #313
- **Intended Specialist Agent:** Architecture Specialist (boundary enforcement) / Gameplay Specialist (transactions)
- **Dependencies:** `useCharacterStore`, `src/lib/equipmentCompatibility.ts`, `src/services/storageService.ts`

#### A5. Spells & Spellbook
- **Current Canonical Module:** `src/domain/spells/spellResolver.ts`, `src/domain/spells/geometry.ts`, `src/components/atlas/SpellSheet.tsx`, `src/store/useCharacterStore.ts`
- **Primary Functions / Hooks / Selectors:** `createSpellCombatAction()`, `resolveSpellAction()`, `getActorSpellcastingStats()`, `learnSpell()`, `prepareSpell()`, `castSpell()`, `restoreSlots()`.
- **Source-of-Truth Data:** `Character.knownSpells`, `Character.preparedSpells`, `Character.spellSlots`, static spell records in `/public/assets/atlas/spell/json/14/` and `/24/`.
- **Derived / Presentation Consumers:** `SpellsStep.tsx`, `CharacterPanelSpells.tsx`, `ActionPanel.tsx`, `tokenActionHud.ts`, `CombatTester.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Spell preparation limits (e.g. max prepared spells formula per class/level) are enforced in UI step components (`SpellsStep.tsx`) rather than a centralized pure validation helper.
- **Related GitHub Issues:** #298
- **Intended Specialist Agent:** Gameplay Specialist (rules/resolution) / Ruleset & Data Specialist (catalogs)
- **Dependencies:** `useCharacterStore`, `useGameStore`, `storageService.ts`

#### A6. Actions & Weapon Attacks
- **Current Canonical Module:** `src/components/combat/ActionPanel.tsx`, `src/lib/tokenActionHud.ts`, `src/lib/statCalculations.ts`, `src/store/useGameStore.ts`
- **Primary Functions / Hooks / Selectors:** `calculateWeaponAttackBonus()`, `resolveCombatAction()`, `createSpellCombatAction()`, `consumeAction()`.
- **Source-of-Truth Data:** Equipped weapons in `Character.equipment`, active spell choices, and monster `actions[]`.
- **Derived / Presentation Consumers:** `ActionPanel.tsx`, `CombatGrid.tsx`, `CombatTester.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Dynamic weapon attack action generation is split between `ActionPanel.tsx` (for player HUD) and `tokenActionHud.ts` (for canvas HUD).
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `useGameStore`, `statCalculations.ts`

#### A7. Proficiencies & Skills
- **Current Canonical Module:** `src/store/useCharacterStore.ts` (`ProficiencyRef[]`), `src/lib/statCalculations.ts`, `src/components/character/panel/CharacterPanelSkills.tsx`
- **Primary Functions / Hooks / Selectors:** `SKILL_LIST`, `calculateDerivedStats()` (passive perception, perception proficiency/expertise evaluation).
- **Source-of-Truth Data:** `Character.proficiencies`, `Character.skills`, `Character.choices['skills']`, `Character.choices['expertise']`.
- **Derived / Presentation Consumers:** `CharacterPanelSkills.tsx`, `ChoicesStep.tsx`, `CharacterProfile.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Non-perception skill checks (e.g. Athletics, Stealth, Arcana rolls) do not currently have a centralized d20 roll resolver that automatically adds ability modifier + proficiency bonus + expertise bonus.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `statCalculations.ts`

#### A8. Progression & Level-Up
- **Current Canonical Module:** `src/lib/progressionUtils.ts`, `src/lib/characterUtils.ts`, `src/store/useCharacterStore.ts`, `src/components/character/LevelUpOverlay.tsx`
- **Primary Functions / Hooks / Selectors:** `addXp()`, `addPartyXp()`, `processLevelUp()`, `loadLeveledData()`, `XP_TABLE`, `getLevelFromXP()`, `getXpProgress()`.
- **Source-of-Truth Data:** `Character.xp`, `Character.level`, class progression JSON files in `/public/assets/atlas/class/levels/14/` and `/24/`.
- **Derived / Presentation Consumers:** `LevelUpOverlay.tsx`, `CharacterPanelStats.tsx`, `HUD`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** HP increase on level-up currently uses fixed/average HP gain from queue rather than offering player choice between rolling hit dice or taking average.
- **Related GitHub Issues:** #298
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `atlasService.ts`

#### A9. Character Presentation
- **Current Canonical Module:** `src/components/character/panel/` (`CharacterPanelBody.tsx`, `CharacterPanelAbilities.tsx`, `CharacterPanelSkills.tsx`, `CharacterPanelTraits.tsx`), `src/components/character/GenderBodySvg.tsx`
- **Primary Functions / Hooks / Selectors:** `GenderBodySvg`, `CharacterPanelBody`, responsive 320px (`w-80 sm:w-96`) viewport contract.
- **Source-of-Truth Data:** `Character.appearance`, `Character.gender`, `Character.race`, `Character.stats`.
- **Derived / Presentation Consumers:** `CreatorRightPanel.tsx`, `CharacterPanel.tsx` (HUD), `CharacterProfile.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** None. The presentation architecture was clean-factored into shared primitives under `src/components/character/panel/`.
- **Related GitHub Issues:** #306
- **Intended Specialist Agent:** UI Specialist
- **Dependencies:** `useCharacterStore`, SVG body paths (`docs/modules/svgBodys.md`)

---

### B. World Domain

#### B1. Location & Region State
- **Current Canonical Module:** `src/store/useWorldStore.ts`
- **Primary Functions / Hooks / Selectors:** `setCurrentLocation()`, `setPartyLocation()`, `setInspectedLocation()`, `loadAllCitiesRegistry()`, `loadDiscoveredLocations()`.
- **Source-of-Truth Data:** `useWorldStore.partyLocation`, `currentLocation`, `savedLocations[]`, `allCitiesRegistry[]`.
- **Derived / Presentation Consumers:** `WorldExplorer.tsx`, `OverlandMap.tsx`, `SubMap.tsx`, HUD Location Header, Narrator Service.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Location JSON structures have slight schema variations across categories (`cities`, `poi`, `ruins`, `fortresses_keeps`).
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Ruleset & Data Specialist (data) / Gameplay Specialist (world mechanics)
- **Dependencies:** `/public/assets/atlas/world/` static files

#### B2. Calendar & Time Progression
- **Current Canonical Module:** `src/store/useWorldStore.ts`
- **Primary Functions / Hooks / Selectors:** `advanceTime()`, `getCalendarDate()`, `isNight()`, `gameYear`, `gameMonth`, `gameDay`, `gameTime`.
- **Source-of-Truth Data:** Forgotten Realms calendar numbers in `useWorldStore` state (Year 1492 DR baseline, 30 days/month, 12 months/year, 1440 mins/day).
- **Derived / Presentation Consumers:** HUD Time & Weather widget, Campfire Rest, Narrator arrival prompt, lighting filters.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Harptos calendar festival days (Midwinter, Greengrass, Midsummer, Highharvestide, The Feast of the Moon) are simplified as standard days 1–30.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useWorldStore`

#### B3. Environment & Weather
- **Current Canonical Module:** `src/store/useWorldStore.ts`
- **Primary Functions / Hooks / Selectors:** `updateEnvironment()`, `setWeather()`, `setTemperature()`, `weather`, `temperature`.
- **Source-of-Truth Data:** Dynamic environmental state in `useWorldStore` updated via time progression and stochastic terrain/season calculations.
- **Derived / Presentation Consumers:** Overland map environmental overlays, Narrator context, HUD weather bar, Hue ambient lighting.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Weather effects are currently visual/narrative; they do not yet modify combat movement speeds or ranged weapon attack rolls.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useWorldStore`

#### B4. Overland Travel & Movement
- **Current Canonical Module:** `src/store/useWorldStore.ts`, `src/lib/mapUtils.ts`
- **Primary Functions / Hooks / Selectors:** `startTravel()`, `stopTravel()`, `skipTravel()`, `getPartySpeedMph()`, `updateEnvironment()`.
- **Source-of-Truth Data:** `isTraveling`, `travelProgress`, `travelOrigin`, `destination`, vehicle capacity/mounts from `useInventoryStore`.
- **Derived / Presentation Consumers:** `TravelOverlay.tsx`, Overland map party token position, Narrator arrival handler.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Water travel checking uses hardcoded keyword matching on vehicle names (`boat`, `ship`, `raft`, etc.) rather than an explicit `vehicle_type` category attribute.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useWorldStore`, `useInventoryStore`, `useCharacterStore`

#### B5. Map Exploration & Fog-of-War
- **Current Canonical Module:** `src/store/useWorldStore.ts`, `src/store/useCharacterStore.ts`
- **Primary Functions / Hooks / Selectors:** `exploreArea()`, `discoverLocation()`, `setDiscoveredLocationIds()`, `setExploredAreas()`.
- **Source-of-Truth Data:** `exploredAreas[{x, y, radius}]` and `discoveredLocationIds[]` stored in `useWorldStore` and persisted per character.
- **Derived / Presentation Consumers:** `OverlandMap.tsx` Fog-of-War canvas layer, discovery notifications.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Proximity discovery check during travel scans `allCitiesRegistry` synchronously every environment tick.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** UI Specialist (canvas rendering) / Gameplay Specialist (logic)
- **Dependencies:** `useWorldStore`, `useCharacterStore`

#### B6. Quests & Discovery
- **Current Canonical Module:** `src/store/useJournalStore.ts`, `src/store/useWorldStore.ts`
- **Primary Functions / Hooks / Selectors:** `useJournalStore()`, `addQuest()`, `updateQuestStage()`, `completeQuest()`.
- **Source-of-Truth Data:** `JournalState.quests[]` (`id`, `title`, `description`, `status`, `stages[]`).
- **Derived / Presentation Consumers:** Quest Journal Overlay, Narrator context assembly (`narratorService.ts`).
- **Current Status:** `Partial`
- **Known Architectural Debt:** Quests are manually created/updated via journal store actions; world location triggers do not automatically advance quest stages yet.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useJournalStore`, `useWorldStore`

#### B7. World-State Context for Narration
- **Current Canonical Module:** `src/services/narratorService.ts`, `src/store/useWorldStore.ts`
- **Primary Functions / Hooks / Selectors:** `handleArrival()`, `generateResponse()`, Reality Snapshot assembly.
- **Source-of-Truth Data:** Real-time aggregation of `useWorldStore`, `useCharacterStore`, `useGameStore`, and `useJournalStore`.
- **Derived / Presentation Consumers:** AI Chat window, Narrator choices.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Reality Snapshot is assembled on demand as an inline JSON prompt string.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Architecture Specialist (context integration) / Gameplay Specialist
- **Dependencies:** All core domain stores (`World`, `Character`, `Game`, `Journal`)

---

### C. Narrative / AI Domain

#### C1. Chat & Narrator
- **Current Canonical Module:** `src/store/useChatStore.ts`, `src/services/narratorService.ts`
- **Primary Functions / Hooks / Selectors:** `addMessage()`, `getHistoryForAI()`, `setChoices()`, `generateResponse()`.
- **Source-of-Truth Data:** `ChatMessage[]` history array, active `ChatChoice[]` array.
- **Derived / Presentation Consumers:** `ChatWindow.tsx`, HUD Chat toggle.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** `getHistoryForAI()` filters system messages and maps roles to Gemini text parts, but truncates history to a fixed 20-message limit without summarization.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist / UI Specialist
- **Dependencies:** `useChatStore`, `@google/genai` (via `src/services/ai/config.ts`)

#### C2. LLM Context Assembly
- **Current Canonical Module:** `src/services/narratorService.ts`
- **Primary Functions / Hooks / Selectors:** Reality Snapshot builder inside `generateResponse()`.
- **Source-of-Truth Data:** System prompt template injecting active party statistics, combat state, location, time, weather, and active turn.
- **Derived / Presentation Consumers:** Gemini AI model payload.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Snapshot context does not currently include character inventory items, prepared spell lists, or recent journal entry logs.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist / Ruleset & Data Specialist
- **Dependencies:** `useCharacterStore`, `useGameStore`, `useWorldStore`

#### C3. Tool Calls
- **Current Canonical Module:** `src/services/narratorService.ts`, `src/services/ai/config.ts`
- **Primary Functions / Hooks / Selectors:** Gemini function declarations (`setGameMode`, `rollDice3D`, `toggleDoor`, `spawnMonster`).
- **Source-of-Truth Data:** Structured function declaration schema passed to `ai.models.generateContent()`.
- **Derived / Presentation Consumers:** `useUIStore.setGameMode()`, `useGameStore.rollDice3D()`, `useGameStore.toggleDoor()`, `useGameStore.spawnMonster()`.
- **Current Status:** `Partial`
- **Known Architectural Debt:** Tool calls are declared and handled for 4 combat/exploration functions, but full two-way tool call execution loops (returning tool execution result back to LLM for final response text) are simplified.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist / Architecture Specialist
- **Dependencies:** `useUIStore`, `useGameStore`

#### C4. NPC Memory
- **Current Canonical Module:** `src/store/useCharacterStore.ts` (`currentNPC`, `emotion`), `src/store/useWorldStore.ts` (`worldFlags`)
- **Primary Functions / Hooks / Selectors:** `setCurrentNPC()`, `setEmotion()`, `setWorldFlag()`.
- **Source-of-Truth Data:** Active NPC reference in character store, key-value `worldFlags` object in world store.
- **Derived / Presentation Consumers:** `DialogueOverlay.tsx`, `Jane.tsx` (DevKit world builder).
- **Current Status:** `Placeholder` / `Partial`
- **Known Architectural Debt:** Persistent NPC conversation memory logs, impression scores, and long-term dialogue history across multiple game sessions are not modeled.
- **Related GitHub Issues:** #313, Future Modules
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `useWorldStore`

#### C5. Relationship History
- **Current Canonical Module:** `src/store/useCharacterStore.ts` (`alliesAndOrganizations`), `src/store/useWorldStore.ts` (`worldFlags`)
- **Primary Functions / Hooks / Selectors:** `updateAlliesAndOrganizations()`, `setWorldFlag()`.
- **Source-of-Truth Data:** Free-text string `alliesAndOrganizations` on character records, world flags.
- **Derived / Presentation Consumers:** `CharacterPanelBio.tsx`, `CharacterProfile.tsx`.
- **Current Status:** `Placeholder`
- **Known Architectural Debt:** Faction standing numbers, reputation tiers, and structured NPC disposition tracking are represented only as free-text narrative notes or manual world flags.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `useWorldStore`

---

### D. Gameplay Domain

#### D1. Combat Engine & Turn Management
- **Current Canonical Module:** `src/store/useGameStore.ts`, `src/components/combat/CombatGrid.tsx`, `src/components/combat/combatUtils.ts`
- **Primary Functions / Hooks / Selectors:** `startCombat()`, `nextTurn()`, `executeMonsterTurn()`, `resolveCombatAction()`, `completeCombat()`, `setPlayerPos()`, `toggleDoor()`.
- **Source-of-Truth Data:** `CombatState` (`playerPos`, `pcPositions`, `monsters[]`, `initiativeOrder[]`, `activeTurnIndex`, `grid[][]`, `walls[]`).
- **Derived / Presentation Consumers:** `CombatGrid.tsx`, `ActionPanel.tsx`, `tokenActionHud.ts`, `CombatTester.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** `useGameStore.ts` hosts tactical combat state alongside 3D dice rolling, minigames (RPS, Coin Flip), logs, and simulator cards.
- **Related GitHub Issues:** #306, #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `combatUtils.ts`, `soundService.ts`

#### D2. Equipment Rules & Compatibility
- **Current Canonical Module:** `src/lib/equipmentCompatibility.ts`
- **Primary Functions / Hooks / Selectors:** `evaluateSlotCompatibility()`, `isItemCompatibleWithSlot()`.
- **Source-of-Truth Data:** Item `equipment_category` / `weapon_category` / `armor_category` metadata evaluated against slot constraints.
- **Derived / Presentation Consumers:** `useInventoryStore.equipItem()`, `moveItem()`, `EquipmentDoll.tsx`, `InventorySlot.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** None. Pure function implementation decoupled from UI.
- **Related GitHub Issues:** #285
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** Static equipment definitions

#### D3. Damage & Attacks Resolution
- **Current Canonical Module:** `src/store/useGameStore.ts` (`resolveCombatAction()`), `src/domain/spells/spellResolver.ts` (`resolveSpellAction()`), `src/dice_roller/diceService.ts`
- **Primary Functions / Hooks / Selectors:** `resolveCombatAction()`, `resolveSpellAction()`, `calculateWeaponAttackBonus()`, `rollDice3D()`, `rollBackground()`.
- **Source-of-Truth Data:** Weapon and spell damage formulas (`1d6+2`, `2d8`, etc.), attacker stats, target AC/saving throw modifiers.
- **Derived / Presentation Consumers:** `ActionPanel.tsx`, `CombatGrid.tsx` attack animations, Game Logs.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Non-spell combat actions (melee/ranged attacks) perform damage dice rolling directly inside `resolveCombatAction()` in `useGameStore`, whereas spell actions route cleanly through `src/domain/spells/spellResolver.ts`.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `useGameStore`, `diceService.ts`, `soundService.ts`

#### D4. Conditions & Status Effects
- **Current Canonical Module:** `src/store/useGameStore.ts` (`combatState.activeConditions`), `src/store/useCharacterStore.ts` (`conditions`, `isUnconscious`, `isStable`, `isDead`, `deathSaves`)
- **Primary Functions / Hooks / Selectors:** `modifyHp()`, `rollDeathSave()`, `updateDeathSaves()`, `toggleInspiration()`.
- **Source-of-Truth Data:** `activeConditions` map (`id -> string[]`), character vitality flags (`isUnconscious`, `isDead`, `deathSaves`).
- **Derived / Presentation Consumers:** `CombatGrid.tsx` token condition badges, `ActionPanel.tsx`, GameOver overlay.
- **Current Status:** `Partial`
- **Known Architectural Debt:** Only basic conditions (`defending` +2 AC, `unconscious`, `dead`) have active mechanic modifiers wired into attack resolution. Standard D&D 5e conditions (Poisoned, Paralyzed, Blinded, Stunned, Charmed, Frightened, Grappled, Restrained, Prone) exist as string flags without automatic mechanical rule enforcement during movement and rolls.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `useGameStore`

#### D5. Rest & Energy
- **Current Canonical Module:** `src/store/useCharacterStore.ts`, `src/components/world/CampfireRest.tsx`
- **Primary Functions / Hooks / Selectors:** `restoreSlots(isLongRest)`, `restoreActionEconomy(characterId, isLongRest)`.
- **Source-of-Truth Data:** Character spell slots, action economy structures, and HP.
- **Derived / Presentation Consumers:** `CampfireRest.tsx`, Character Panel.
- **Current Status:** `Partial`
- **Known Architectural Debt:** Long Rest restores 100% HP and spell slots, but does not currently consume or spend Hit Dice (Short Rest Hit Dice recovery mechanic is incomplete).
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`, `useWorldStore`

#### D6. XP & Leveling Mechanics
- **Current Canonical Module:** `src/lib/statCalculations.ts`, `src/lib/progressionUtils.ts`, `src/store/useCharacterStore.ts`
- **Primary Functions / Hooks / Selectors:** `addXp()`, `addPartyXp()`, `XP_TABLE`, `getLevelFromXP()`, `getXpProgress()`.
- **Source-of-Truth Data:** `Character.xp`, `Character.level`.
- **Derived / Presentation Consumers:** `LevelUpOverlay.tsx`, HUD XP bar.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** None. XP thresholds match standard D&D 5e progression table (0 to 355,000 XP).
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`

#### D7. Economy & Pricing
- **Current Canonical Module:** `src/lib/currencyUtils.ts`, `src/store/useCharacterStore.ts`
- **Primary Functions / Hooks / Selectors:** `modifyMoney()`, `consolidateMoney()`, `toTotalCopper()`, `fromCopper()`, `formatMoney()`.
- **Source-of-Truth Data:** `Character.money` (`cp`, `sp`, `ep`, `gp`, `pp`).
- **Derived / Presentation Consumers:** `ShopOverlay.tsx`, `FullInventoryMenu.tsx`, Inventory weight calculation (`0.02 lbs/coin`).
- **Current Status:** `Partial`
- **Known Architectural Debt:** Money modification functions correctly convert and consolidate copper/silver/gold, but dynamic shop pricing (buy/sell price multipliers based on charisma or merchant disposition) is unmodeled.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useCharacterStore`

#### D8. Faction & Reputation
- **Current Canonical Module:** `src/store/useWorldStore.ts` (`worldFlags`)
- **Primary Functions / Hooks / Selectors:** `setWorldFlag()`.
- **Source-of-Truth Data:** Key-value state in `worldFlags`.
- **Derived / Presentation Consumers:** Dialogue conditions, narrative prompts.
- **Current Status:** `Placeholder`
- **Known Architectural Debt:** No structured faction standings data schema exists.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useWorldStore`

#### D9. Crafting
- **Current Canonical Module:** `docs/systems/CRAFTING_SYSTEM.md`, `src/lib/itemPacks.ts`
- **Primary Functions / Hooks / Selectors:** Blueprint specification in `CRAFTING_SYSTEM.md`.
- **Source-of-Truth Data:** Materials catalog (`/public/assets/atlas/materials/`).
- **Derived / Presentation Consumers:** DevKit material generator (`material-image_generator.tsx`).
- **Current Status:** `Missing` / `Specification Only`
- **Known Architectural Debt:** Crafting recipe execution, tool proficiency checks, and ingredient consumption UI are completely unbuilt.
- **Related GitHub Issues:** #313, Crafting Milestone
- **Intended Specialist Agent:** Gameplay Specialist (mechanics) / UI Specialist (interface)
- **Dependencies:** `useInventoryStore`, `/assets/atlas/materials/`

#### D10. Consumables & Utility Items
- **Current Canonical Module:** `src/store/useInventoryStore.ts`, `src/store/useWorldStore.ts`
- **Primary Functions / Hooks / Selectors:** Rations consumption during `skipTravel()`, pack item unpacking via `getPackContents()`.
- **Source-of-Truth Data:** Item templates and inventory instances.
- **Derived / Presentation Consumers:** `TravelOverlay.tsx`, `FullInventoryMenu.tsx`.
- **Current Status:** `Partial`
- **Known Architectural Debt:** Rations are consumed automatically during travel, but consumable potion usage (e.g. clicking a Healing Potion in inventory to restore HP outside combat) is not wired to a direct consumable handler action.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Gameplay Specialist
- **Dependencies:** `useInventoryStore`, `useCharacterStore`

---

### E. Atlas / Data Domain

#### E1. Static Ruleset Data & Resolution Boundary
- **Current Canonical Module:** `src/services/storageService.ts`, `src/services/atlasService.ts`, `src/store/useAtlasStore.ts`, `src/store/useGameStore.ts`
- **Primary Functions / Hooks / Selectors:** `getActiveRulesetContext()`, `getRulesetVersionFolder()`, `fetchSpeciesData()`, `fetchClassData()`, `fetchSubclassData()`, `fetchBackgroundData()`, `fetchEquipmentData()`, `fetchFeatData()`, `fetchSpellData()`, `fetchMonsterData()`.
- **Source-of-Truth Data:** Canonical static JSON catalogs in `/public/assets/atlas/` versioned under `/14/` and `/24/` subdirectories.
- **Derived / Presentation Consumers:** Character Creator, LevelUpOverlay, SpellsStep, ActionPanel, devkit inspectors.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** None. Strict ruleset boundary enforced with ruleset-prefixed cache keys and zero silent cross-ruleset fallback.
- **Related GitHub Issues:** #298, #306
- **Intended Specialist Agent:** Ruleset & Data Specialist
- **Dependencies:** `useGameStore`

#### E2. Equipment Catalog
- **Current Canonical Module:** `/public/assets/atlas/equipment/`, `/public/assets/atlas/equipment_categories/`, `src/services/storageService.ts`
- **Primary Functions / Hooks / Selectors:** `fetchEquipmentData()`, `normalizeImageUrl()`, `generateEquipmentIndex.cjs`.
- **Source-of-Truth Data:** Versioned equipment JSON files under `/14/` and `/24/`.
- **Derived / Presentation Consumers:** `EquipmentWorkspace.tsx`, `ShopOverlay.tsx`, `FullInventoryMenu.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Automatic image URL normalization converts hyphenated filenames to underscores to resolve active WebP image references on disk.
- **Related GitHub Issues:** #285, #298
- **Intended Specialist Agent:** Ruleset & Data Specialist / Assets Specialist
- **Dependencies:** `/public/assets/atlas/equipment/`

#### E3. Spells Catalog
- **Current Canonical Module:** `/public/assets/atlas/spell/json/14/`, `/24/`, `index_14.json`, `index_24.json`, `tools/generateSpellIndex.cjs`
- **Primary Functions / Hooks / Selectors:** `fetchSpellData()`, `fetchSpellList()`, `loadSpell()`.
- **Source-of-Truth Data:** 323 canonical SRD spell JSON files per ruleset in `/14/` and `/24/`.
- **Derived / Presentation Consumers:** `SpellsStep.tsx`, `SpellSheet.tsx`, `spellResolver.ts`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** None. 100% complete and synchronized index catalogs for both 2014 and 2024 rulesets.
- **Related GitHub Issues:** #298
- **Intended Specialist Agent:** Ruleset & Data Specialist
- **Dependencies:** `storageService.ts`

#### E4. Monsters Catalog
- **Current Canonical Module:** `/public/assets/atlas/rules/24/json/monsters/monsters.json` (and ruleset-scoped paths under `/public/assets/atlas/rules/` and `/public/assets/atlas/enemies/`), `src/services/storageService.ts`
- **Primary Functions / Hooks / Selectors:** `fetchMonsterData()`, `loadEnemy()`.
- **Source-of-Truth Data:** Ruleset-scoped monster catalog JSON files (`public/assets/atlas/rules/24/json/monsters/monsters.json`, `public/assets/atlas/enemies/index.json`).
- **Derived / Presentation Consumers:** `useGameStore.spawnMonster()`, `CombatTester.tsx`, `enemy-image_generator.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Monster JSON records are loaded via `fetchMonsterData()` using index lookup (`/assets/atlas/enemies/index.json`) and ruleset resolution.
- **Related GitHub Issues:** #298, #313
- **Intended Specialist Agent:** Ruleset & Data Specialist
- **Dependencies:** `storageService.ts`, `atlasService.ts`

#### E5. Gods & Lore Catalog
- **Current Canonical Module:** `/public/assets/atlas/gods/all_gods.json`, `/public/assets/ui/official/`
- **Primary Functions / Hooks / Selectors:** `fetchAlignmentsList()`, `fetchBackgroundData()`, `DnDMarkdown.tsx`.
- **Source-of-Truth Data:** `all_gods.json` and official markdown lore guides (`backgrounds/*.md`, `races/*.md`, `classes/*.md`).
- **Derived / Presentation Consumers:** `AlignmentStep.tsx`, `BackgroundStep.tsx`, `SelectionStep.tsx`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** None. Data-driven deity presentation in alignment step resolves example gods without forcing deity choices.
- **Related GitHub Issues:** #298
- **Intended Specialist Agent:** Ruleset & Data Specialist
- **Dependencies:** `/public/assets/atlas/gods/`

#### E6. Materials Catalog
- **Current Canonical Module:** `/public/assets/atlas/materials/`
- **Primary Functions / Hooks / Selectors:** Material JSON definitions (`iron_ore.json`, `mithral_ingot.json`, etc.).
- **Source-of-Truth Data:** Static material item templates.
- **Derived / Presentation Consumers:** `material-image_generator.tsx`, Inventory taxonomy (`MATERIALS` root category).
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Material definitions exist in Atlas, but recipe links mapping materials to craftable equipment are unbuilt.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Ruleset & Data Specialist
- **Dependencies:** `storageService.ts`

#### E7. Visual & Sprite Systems
- **Current Canonical Module:** `public/assets/icons/svg/`, `src/lib/iconRegistry.generated.ts`, `src/game_icons.tsx`, `src/components/character/ClassSprite.tsx`, `src/components/character/equipment/EquipmentSprite.tsx`, `src/components/atlas/SpellSprite.tsx`, `src/lib/spellVisuals/spriteManifest.ts`
- **Primary Functions / Hooks / Selectors:** `<GameIcon />`, `<ClassSprite />`, `<EquipmentSprite />`, `<SpellSprite />`, `npm run generate:icon-registry`.
- **Source-of-Truth Data:** Public SVG files, master sprite sheet WebP assets (`classSprite.webp`, spell sheets `cantrips_sheet_01`, equipment sheets in `/assets/atlas/equipment/sprites/`).
- **Derived / Presentation Consumers:** All UI components across Character Creator, HUD, Inventory, Equipment Doll, Spells, and Battle Map Editor.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Icon registry must be re-generated via `npm run generate:icon-registry` whenever new physical SVG files are added to `public/assets/icons/svg/`.
- **Related GitHub Issues:** #306
- **Intended Specialist Agent:** Assets Specialist
- **Dependencies:** `tools/generateIconRegistry.cjs`

---

### F. Audio Domain

#### F1. Audio Engine
- **Current Canonical Module:** `src/services/soundService.ts`
- **Primary Functions / Hooks / Selectors:** `soundService.playEffect()`, `playMusic()`, `stopAll()`, `updateLayerVolume()`, `updateLayerMute()`.
- **Source-of-Truth Data:** Howler.js audio instances and audio file paths in `/public/assets/sounds/`.
- **Derived / Presentation Consumers:** `ChoiceCard.tsx` (UI SFX), `resolveCombatAction()` (`COMBAT_SLASH`, `COMBAT_HIT`), `useAudioStore.ts`.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** `soundService.ts` uses Howler.js cleanly, but environmental sound trigger regions are not yet connected to overland map movement coordinates.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Assets Specialist (sound assets) / Gameplay Specialist
- **Dependencies:** Howler.js, `/public/assets/sounds/`

#### F2. Runtime Sound Layers
- **Current Canonical Module:** `src/store/useAudioStore.ts`, `src/types/audio.ts`
- **Primary Functions / Hooks / Selectors:** `useAudioStore()`, `updateLayerVolume()`, `toggleLayerMute()`, `toggleLayerSolo()`.
- **Source-of-Truth Data:** 11 dedicated audio channel layer states (`layerStates[1..11]`).
- **Derived / Presentation Consumers:** Audio Mixer HUD, DevKit Audio Laboratory.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Hue lighting synchronization (`hueState`) is currently co-located inside `useAudioStore.ts`.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Architecture Specialist (store split) / Assets Specialist
- **Dependencies:** `soundService.ts`

#### F3. DevKit Authoring
- **Current Canonical Module:** `src/components/devkit/audio/`, `src/components/devkit/AudioLaboratory.tsx`
- **Primary Functions / Hooks / Selectors:** Audio Laboratory UI for testing 11-channel stem mixing, spatial sound testing, and Hue light sync.
- **Source-of-Truth Data:** Local component state and `useAudioStore`.
- **Derived / Presentation Consumers:** DevKit workspace.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Authoring tool for creating new sound environment profiles is functional but decoupled from map regions.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Assets Specialist / UI Specialist
- **Dependencies:** `useAudioStore`, `soundService.ts`

#### F4. Environmental Sound Profiles
- **Current Canonical Module:** `src/services/soundService.ts`, `docs/systems/AUDIO_REGISTRY.md`
- **Primary Functions / Hooks / Selectors:** `soundService.playAmbience()`.
- **Source-of-Truth Data:** Environmental sound loops (`forest_day.mp3`, `dungeon_ambience.mp3`, `tavern_hubbub.mp3`, `rain_heavy.mp3`).
- **Derived / Presentation Consumers:** `useWorldStore` weather and location transitions.
- **Current Status:** `Partial`
- **Known Architectural Debt:** Ambiences can be triggered manually or via DevKit, but changing locations in `useWorldStore` does not yet trigger automatic background ambience cross-fading.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** Assets Specialist / Gameplay Specialist
- **Dependencies:** `soundService.ts`, `useWorldStore`

---

### G. DevKit / Tooling Domain

#### G1. Generators
- **Current Canonical Module:** `src/components/devkit/npc_generator.tsx`, `enemy-image_generator.tsx`, `equipment-image_generator.tsx`, `material-image_generator.tsx`, `src/lib/naming/`
- **Primary Functions / Hooks / Selectors:** Artificer Naming Domain (`generateArtificerName()`), generator components.
- **Source-of-Truth Data:** Seedable PRNG (`rng.ts`), structured source pools (`sourceData.ts`), AI prompt templates for image generation.
- **Derived / Presentation Consumers:** DevKit tool suite, Character Creator backstory/name generator (`BackstoryStep.tsx`).
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Image generators interact directly with Gemini image API endpoints requiring developer API key configuration.
- **Related GitHub Issues:** #306, #313
- **Intended Specialist Agent:** UI Specialist / Ruleset & Data Specialist
- **Dependencies:** `src/lib/naming/`, `@google/genai`

#### G2. Editors & Map Authoring
- **Current Canonical Module:** `src/components/devkit/BattleMapEditor/` (`BattleMapEditor.tsx`, `renderMap.ts`, `editorStore.ts`, `battleMapStorage.ts`, `battleMapToCombatGrid.ts`)
- **Primary Functions / Hooks / Selectors:** HTML Canvas rendering pipeline, coordinate snapping, command history stack (Undo/Redo), server storage adapter.
- **Source-of-Truth Data:** `BattleMap` JSON authoring files in `public/assets/atlas/combat/combat_maps/`.
- **Derived / Presentation Consumers:** DevKit Map Editor workspace, runtime combat adapter (`battleMapToCombatGrid.ts` -> `CombatGrid.tsx`).
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Scaffolding tool placeholders exist for advanced layer inspectors that require full feature completion.
- **Related GitHub Issues:** #313
- **Intended Specialist Agent:** UI Specialist (Canvas rendering) / Architecture Specialist (data pipeline)
- **Dependencies:** Canvas API, `battleMapStorage.ts`

#### G3. Verification Tools & Test Harnesses
- **Current Canonical Module:** `src/components/devkit/CombatTester.tsx`, `npc_tester.tsx`, `Simulator.tsx`, `FlagManager.tsx`, `tests/*.test.ts`, `scripts/jules-orchestrator-preflight.mjs`
- **Primary Functions / Hooks / Selectors:** `npm test` (lint + check:assets + playwright), `npx vitest run tests/`, `npm run test:workflow`.
- **Source-of-Truth Data:** Test suites in `tests/`, workflow tests in Node test runner format (`node --test`).
- **Derived / Presentation Consumers:** CI workflows (`.github/workflows/ci.yml`, `phase-safety-gate.yml`), preflight orchestrator.
- **Current Status:** `Implemented`
- **Known Architectural Debt:** Playwright integration tests require Vite dev server running on port 3000 and local Chromium installation.
- **Related GitHub Issues:** #306, #313
- **Intended Specialist Agent:** Verification Specialist
- **Dependencies:** Vitest, Playwright, Node native test runner

---

## 3. Missing Gameplay Inventory Audit & Data-Flow Traces

The following 14 gameplay systems have been audited to trace existing data flows, establish what is canonical vs partial, and prevent hidden or opportunistic rewrites:

### 1. Equipment -> Attacks Synchronization
- **Trace & Data Flow:** Main-hand and off-hand equipped items in `Character.equipment` are inspected by `calculateWeaponAttackBonus()` in `src/lib/statCalculations.ts`. `ActionPanel.tsx` and `tokenActionHud.ts` generate attack actions using this bonus. During combat, `resolveCombatAction()` reads damage dice formulas from weapon metadata.
- **Current Status:** `Implemented`
- **Gaps / Architectural Debt:** Off-hand two-weapon fighting attack bonus penalty (losing ability modifier bonus on damage without Two-Weapon Fighting style) is not automatically enforced during off-hand attack action creation.

### 2. Equipment -> AC Synchronization
- **Trace & Data Flow:** `calculateDerivedStats()` reads the equipped armor in the `chest` slot and shield in the `off_hand` slot via `getEquippedItem()`. Base AC, Dex bonus caps, shield AC (+2), magic item AC bonuses (`ac_bonus`), and Draconic/Unarmored feature overrides are evaluated atomically.
- **Current Status:** `Implemented`
- **Gaps / Architectural Debt:** Armor proficiency enforcement (wearing armor without proficiency imposing disadvantage on physical rolls/stealth and blocking spellcasting) is not enforced.

### 3. Proficiency and Non-Proficiency Penalties
- **Trace & Data Flow:** Character level derives proficiency bonus (+2 to +6) in `calculateDerivedStats()`. Weapon attacks add proficiency bonus assuming proficiency. Passive perception adds proficiency/expertise bonuses based on `Character.proficiencies` and `Character.skills`.
- **Current Status:** `Partial`
- **Gaps / Architectural Debt:** Non-proficient weapon attack attempts do not deduct the proficiency bonus. Armor non-proficiency penalties (disadvantage on Dex/Str rolls and inability to cast spells) are absent.

### 4. Conditions / Status Effects
- **Trace & Data Flow:** `combatState.activeConditions` maps entity ID to string arrays (`['defending']`). `resolveCombatAction()` checks for `defending` (+2 AC). `Character.isUnconscious`, `isDead`, and `deathSaves` are mutated by `modifyHp()` and `rollDeathSave()`.
- **Current Status:** `Partial`
- **Gaps / Architectural Debt:** Standard 5e status conditions (`Poisoned`, `Paralyzed`, `Blinded`, `Stunned`, `Charmed`, `Frightened`, `Grappled`, `Restrained`, `Prone`) are not wired into roll advantage/disadvantage or movement speed restrictions.

### 5. Character Sheet Derived State
- **Trace & Data Flow:** Centralized in `src/lib/statCalculations.ts` (`calculateDerivedStats()`, `getEffectiveStats()`). Recalculates AC, initiative, speed, proficiency bonus, weapon attack bonus, spell save DC, spell attack bonus, passive perception, weight capacity, and max spell slots.
- **Current Status:** `Implemented`
- **Gaps / Architectural Debt:** None. Shared across Character Creator, Character Panel, Equipment Workspace, and Action Panel.

### 6. Spellcasting Actions and Spell Slots
- **Trace & Data Flow:** `spellResolver.ts` (`resolveSpellAction()`) executes a validation-first, commit-last transaction: checking known/prepared spells, action economy, and spell slots before executing mechanics and deducting resources.
- **Current Status:** `Implemented`
- **Gaps / Architectural Debt:** Ritual spellcasting (casting a ritual spell without consuming a spell slot outside combat) is not implemented in the spell resolution pipeline.

### 7. Travel / Environment Integration
- **Trace & Data Flow:** `useWorldStore.ts` drives overland travel (`updateEnvironment()`), consuming time, calculating party speed (mph) adjusted for encumbrance and vehicles, consuming rations per day passed during `skipTravel()`, and updating weather/temperature.
- **Current Status:** `Implemented`
- **Gaps / Architectural Debt:** Extreme environmental hazards (e.g. extreme cold requiring Constitution saving throws to avoid exhaustion) are not simulated mechanically.

### 8. Chat / Narrator Context
- **Trace & Data Flow:** `narratorService.ts` builds a "Reality Snapshot" JSON object containing location, time, weather, active character HP/level, game mode, and combat monster positions, which is injected into Gemini AI prompts.
- **Current Status:** `Implemented`
- **Gaps / Architectural Debt:** Narrative memory context does not automatically include recent party inventory changes or active quest objectives beyond quest titles.

### 9. NPC Memory
- **Trace & Data Flow:** Active NPC data is held in `useCharacterStore.currentNPC` and `emotion`. World narrative flags are held in `useWorldStore.worldFlags`.
- **Current Status:** `Placeholder`
- **Gaps / Architectural Debt:** Structured dialogue memory graphs and persistent NPC attitude tracking across multiple encounters are unbuilt.

### 10. Quests
- **Trace & Data Flow:** `useJournalStore.ts` tracks active/completed quests and quest stages. Active quest titles are fed into arrival narrative prompts.
- **Current Status:** `Partial`
- **Gaps / Architectural Debt:** Quests are updated manually by the player or DevKit; automatic quest stage progression triggered by reaching world coordinates or defeating key monsters is missing.

### 11. Economy
- **Trace & Data Flow:** Currency conversions (CP, SP, EP, GP, PP) and weight calculations (0.02 lbs per coin) are handled in `src/lib/currencyUtils.ts` and `useCharacterStore.ts`.
- **Current Status:** `Partial`
- **Gaps / Architectural Debt:** Merchant shop inventories exist, but dynamic prices (charisma discounts, haggle mechanics, regional trade supply/demand) are not implemented.

### 12. Crafting
- **Trace & Data Flow:** Master specification documented in `docs/systems/CRAFTING_SYSTEM.md`. Raw materials are defined in `/public/assets/atlas/materials/` and categorized under `MATERIALS` in inventory taxonomy.
- **Current Status:** `Missing` / `Specification Only`
- **Gaps / Architectural Debt:** Crafting workbench UI, recipe definitions, tool checks, and material combination execution loops are completely unbuilt.

### 13. Rest / Energy
- **Trace & Data Flow:** `CampfireRest.tsx` calls `restoreSlots(true)` and `restoreActionEconomy(id, true)` on `useCharacterStore`, resetting spell slots and action economy for long rests.
- **Current Status:** `Partial`
- **Gaps / Architectural Debt:** Short rest mechanics (spending Hit Dice to heal partial HP) are not built. Warlock short-rest slot recovery is implemented.

### 14. Tavern / Minigame Integration (including Three Dragon Ante)
- **Trace & Data Flow:** `useGameStore.ts` contains Rock-Paper-Scissors (`rpsState`) and Coin Flip (`coinFlipState`) minigames. Three Dragon Ante specialist contract pattern (`gameplay-specialist.agent.md`) is established in `.github/agents/`.
- **Current Status:** `Partial`
- **Gaps / Architectural Debt:** Tavern minigames (RPS, Coin Flip) exist in `useGameStore`, but the full Three Dragon Ante card module integration remains an open milestone.

---

## 4. Specialist Agent Relationship & Workflows

Cross-referencing `.github/agents/` and Issue #306, the following 6 specialist agent contracts govern execution discipline in Artificer:

```text
                               ┌───────────────────────────────────┐
                               │     Architecture Specialist       │
                               │  (Boundaries, Stores, Contracts)  │
                               └─────────────────┬─────────────────┘
                                                 │
      ┌──────────────────────────────┬───────────┴───────────┬──────────────────────────────┐
      ▼                              ▼                       ▼                              ▼
┌───────────┐                  ┌───────────┐           ┌───────────┐                  ┌───────────┐
│ Ruleset & │                  │    UI     │           │  Assets   │                  │ Gameplay  │
│   Data    │                  │Specialist │           │Specialist │                  │Specialist │
│Specialist │                  └─────┬─────┘           └─────┬─────┘                  └─────┬─────┘
└─────┬─────┘                        │                       │                              │
      │                              │                       │                              │
      └──────────────────────────────┴───────────┬───────────┴──────────────────────────────┘
                                                 ▼
                                   ┌───────────────────────────┐
                                   │  Verification Specialist  │
                                   │  (Tests, Gates, Evidence) │
                                   └───────────────────────────┘
```

### 1. Architecture Specialist
- **Agent Contract File:** `.github/agents/architecture-specialist.agent.md`
- **Explicit Scope:** State ownership, domain boundaries, store separation, persistence contracts, and orchestration boundaries.
- **Read-First Files:** Assigned Issue, `AGENT.MD`, `AGENT_RULES.md`, `docs/ARCHITECTURE_STATUS.md`, `docs/PROJECT_HUB.md`.
- **Canonical Responsibilities:** Protect store boundaries (`useCharacterStore`, `useGameStore`, `useWorldStore`, `useAtlasStore`, `useInventoryStore`); prevent parallel state models; enforce God-module protection guidelines.
- **Deterministic Rule Handling:** Enforces that rules belong in pure resolvers (`spellResolver.ts`, `equipmentCompatibility.ts`, `statCalculations.ts`), not inside store definitions or UI event handlers.
- **Forbidden Shortcuts:** Creating duplicate global stores; adding unrelated domains to large controller stores; performing opportunistic refactors outside Issue scope.
- **Verification Expectations:** Traces state mutation paths from source of truth through derivation to presentation; verifies persistence backwards compatibility.
- **Handoff Boundaries:** Data/rules semantics -> Ruleset & Data; Presentation -> UI; Assets -> Assets; Runtime mechanics -> Gameplay; Test gates -> Verification.

### 2. Ruleset & Data Specialist
- **Agent Contract File:** `.github/agents/ruleset-data-specialist.agent.md`
- **Explicit Scope:** Canonical ruleset data, Atlas contracts (`/public/assets/atlas/`), versioned 2014 vs 2024 datasets, entity identifiers, and static content resolution.
- **Read-First Files:** Assigned Issue, `AGENT.MD`, `AGENT_RULES.md`, `docs/ARCHITECTURE_STATUS.md`, `docs/ASSET_REGISTRY.md`, `src/services/storageService.ts`.
- **Canonical Responsibilities:** Maintain strict 2014 vs 2024 version isolation; prevent silent cross-ruleset fallback; ensure Atlas definitions are canonical static definitions referenced by runtime objects.
- **Deterministic Rule Handling:** Ensures versioned folder resolution (`/14/` vs `/24/`) returns exact deterministic records without arbitrary default fallbacks.
- **Forbidden Shortcuts:** Silent fallback between rulesets; generic placeholder mechanics in static JSON; duplicate registries for existing Atlas data.
- **Verification Expectations:** Validates dataset schema integrity, identifier consistency, and versioned folder resolution for both 2014 and 2024 paths.
- **Handoff Boundaries:** Domain architecture -> Architecture; Presentation -> UI; Sprite pipeline -> Assets; Runtime execution -> Gameplay; Test coverage -> Verification.

### 3. UI Specialist
- **Agent Contract File:** `.github/agents/ui-specialist.agent.md`
- **Explicit Scope:** Visual presentation, user interaction, layout, accessibility, responsive design, and UI component integration.
- **Read-First Files:** Assigned Issue, `AGENT.MD`, `AGENT_RULES.md`, `docs/ARCHITECTURE_STATUS.md`, `docs/PROJECT_HUB.md`, `docs/STYLE_GUIDE.md`.
- **Canonical Responsibilities:** Implement presentation and interaction using shared primitives (`src/components/character/panel/`, `GenderBodySvg.tsx`, `GameIcon.tsx`); ensure responsive contract (320px baseline).
- **Deterministic Rule Handling:** Routes interactive actions strictly through existing canonical store/service commands without duplicating domain logic in JSX handlers.
- **Forbidden Shortcuts:** Storing authoritative domain state in UI local state; copying domain arrays locally to mutate them; creating duplicate icon libraries.
- **Verification Expectations:** Runs targeted UI component tests; verifies visual layout and interaction boundaries on affected screens.
- **Handoff Boundaries:** State boundary -> Architecture; Rules/data semantics -> Ruleset & Data; Sprite registration -> Assets; Gameplay correctness -> Gameplay; Gate failures -> Verification.

### 4. Assets Specialist
- **Agent Contract File:** `.github/agents/assets-specialist.agent.md`
- **Explicit Scope:** Canonical asset registry, Atlas paths, sprite mappings, icon registries, audio files, and deterministic asset loading.
- **Read-First Files:** Assigned Issue, `AGENT.MD`, `AGENT_RULES.md`, `docs/ASSET_REGISTRY.md`, `docs/ARCHITECTURE_STATUS.md`.
- **Canonical Responsibilities:** Maintain `/public/assets/atlas` and `/public/assets/icons/svg/`; manage generated icon registries (`npm run generate:icon-registry`); map sprite coordinates (`spriteManifest.ts`, `classSpriteMap.ts`).
- **Deterministic Rule Handling:** Ensures local, canonical, portable asset paths that fail predictably rather than displaying broken links or fake placeholders.
- **Forbidden Shortcuts:** Duplicate sprite sheets; hardcoded component sprite offsets; remote asset URLs; committing unverified binary bloat (>1MB).
- **Verification Expectations:** Runs `npm run check:assets` and verifies asset resolution and build compatibility.
- **Handoff Boundaries:** Domain state -> Architecture; Ruleset contract -> Ruleset & Data; UI integration -> UI; Asset-driven mechanics -> Gameplay; Regression verification -> Verification.

### 5. Gameplay Specialist
- **Agent Contract File:** `.github/agents/gameplay-specialist.agent.md`
- **Explicit Scope:** Deterministic gameplay rules, state transitions, combat action resolution, derived stats calculations, and runtime mechanics.
- **Read-First Files:** Assigned Issue, `AGENT.MD`, `AGENT_RULES.md`, `docs/ARCHITECTURE_STATUS.md`, `docs/PROJECT_HUB.md`, relevant stores, pure calculation modules, and tests.
- **Canonical Responsibilities:** Implement rules-correct mechanics in pure resolvers (`spellResolver.ts`, `statCalculations.ts`, `equipmentCompatibility.ts`); manage combat turn execution and AI.
- **Deterministic Rule Handling:** Enforces exact D&D 5e / PHB 2024 rule calculations without inventing arbitrary modifiers or random shortcuts.
- **Forbidden Shortcuts:** Randomized logic where deterministic rules apply; duplicated rule logic in JSX; inventing unapproved homebrew mechanics.
- **Verification Expectations:** Adds focused Vitest unit tests (`tests/*.test.ts`) for non-trivial rule changes; verifies resulting state transitions.
- **Handoff Boundaries:** State ownership -> Architecture; Data contracts -> Ruleset & Data; Presentation -> UI; Assets/sprites -> Assets; Gate verification -> Verification.

### 6. Verification Specialist
- **Agent Contract File:** `.github/agents/verification-specialist.agent.md`
- **Explicit Scope:** Automated test execution, CI safety gates (`.github/workflows/`), Phase Safety Gate compliance (`docs/PHASE_SAFETY_GATE.md`), and review evidence gathering.
- **Read-First Files:** Assigned Issue, `AGENT.MD`, `AGENT_RULES.md`, `docs/PHASE_SAFETY_GATE.md`, `.github/workflows/ci.yml`, `.github/workflows/phase-safety-gate.yml`.
- **Canonical Responsibilities:** Execute deterministic verification suites (`npm test`, `npx vitest run tests/`, `npm run test:workflow`); verify Issue metadata and PR evidence contracts.
- **Deterministic Rule Handling:** Ensures safety gates fail closed and never trust PR origin as a bypass condition; verifies dry-run scripts without live API invocation.
- **Forbidden Shortcuts:** Disabling gates to force CI green; accepting file presence as proof of behavior; creating test-only alternate state sources.
- **Verification Expectations:** Gathers complete test logs, command outputs, and evidence required by Phase Safety Gate criteria.
- **Handoff Boundaries:** Architecture boundary failure -> Architecture; Data failure -> Ruleset & Data; UI failure -> UI; Asset failure -> Assets; Mechanics failure -> Gameplay.

---

## 5. Maintenance & Revision Protocol

This architecture map is a living contract and must be updated whenever:
1. A new domain store, service, or pure resolver is introduced.
2. A partial or missing gameplay system from Section 3 is implemented.
3. An architectural split (e.g., refactoring `useInventoryStore` or `useGameStore`) is executed under a dedicated GitHub issue.
4. Specialist agent contracts in `.github/agents/` are updated.

*Updates must be made accurately to reflect actual codebase state rather than aspirational design.*
