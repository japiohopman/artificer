# 🛠️ DM Kit (Dev Kit) Operational Guide & Maintenance Board

This document provides a comprehensive technical overview and checklist for all components within the **DM Kit (Dev Kit)** system. The DM Kit acts as the primary administrative panel for Dungeon Masters and developers, allowing them to inspect, generate, manifest, and test reality and assets across the entire Artificer application.

- **Main Entry Point:** `src/components/devkit/DevKit.tsx`
- **Activation Shortcut:** `Shift + D` (defined in `App.tsx`, active once the game has been started/HUD is loaded)

Use the empty checkboxes (`[ ]`) below as a direct maintenance and verification checklist to audit each tab's functionality.

---

## 📂 Primary Navigation & Global Layout

The global shell provides window management, navigation tab triggers, sub-routing, real-time environment metrics, and access to the overlay mixing deck.

- [ ] **Arcane OS Window Header**
  - [ ] `adjust` Button: Toggles the overlay floating **Audio Mixer** (`Mixer.tsx`) in the bottom-right.
  - [ ] `LIVE_SESSION_ACTIVE` Indicator: Visual green pulse denoting active connection state.
  - [ ] `close` Button: Gracefully closes the Dev Kit overlay modal and plays the closing sound effects.
- [ ] **Primary Tab Bar Triggers**
  - [ ] `CODEX` Tab: Switches active workspace to Codex Registry Explorer.
  - [ ] `WORLD` Tab: Switches active workspace to World Hierarchy Explorer.
  - [ ] `FLAGS` Tab: Switches active workspace to World Flags Manager.
  - [ ] `AUDIO LAB` Tab: Switches active workspace to Audio Laboratory.
  - [ ] `GENERATORS` Tab: Activates Generator Sub-Navigation Bar.
  - [ ] `TESTERS` Tab: Activates Tester Sub-Navigation Bar.
- [ ] **System Footer Bar**
  - [ ] `SYSTEM_V1.4.2_READY` Status: Real-time heartbeat indicator of the engine.
  - [ ] `ENVIRONMENT_STABLE` Flag: Connection integrity readout.
  - [ ] `LOC` Readout: Displays hosting client's hostname (e.g. `localhost`).
  - [ ] Copyright and Subroutines label metadata.

---

## 1. 📖 Codex Explorer (`AssetExplorer.tsx`)

A dedicated read-only inspector allowing users to preview fully rendered cards for items, spells, and monsters registered in the game's Atlas database.

### Left Sidebar Navigation
- [ ] **Domain Selection Row**
  - [ ] `bestiary` Button: Filter by registered Enemy database (`enemies`).
  - [ ] `materials` Button: Filter by registered Crafting and Resource materials.
  - [ ] `spells` Button: Filter by registered Magic Spells list.
  - [ ] `package` Button: Filter by registered Adventuring Equipment.
- [ ] **Filter Input**
  - [ ] Text Input: Live filter items in the sidebar list by matching string criteria.
- [ ] **Registry Category List**
  - [ ] Categorized directory tree of database contents (Clicking a category opens its nested list of items).
- [ ] **Back to Categories Navigation**
  - [ ] `[BACK_TO_CATEGORIES]` Button: Clears subcategory view and returns to the root category directory.

### Central Preview Area
- [ ] **Asset Preview Panel**
  - [ ] Renders the high-fidelity component card according to the selected type:
    - [ ] `<MonsterCard />`
    - [ ] `<MaterialCard />`
    - [ ] `<EquipmentCard />`
    - [ ] `<SpellCard />`
  - [ ] Metadata Footer: Renders the asset's database SKU `Index` and its `Last_Sync` datetime stamps.

---

## 2. 🌍 World Explorer (`WorldExplorer.tsx`)

The spatial map inspector, permitting administrative tracking of region coordinates, saved locations, and Leaflet map synchronization focal points.

### Left Hierarchy Sidebar
- [ ] **World Hierarchy Directory**
  - [ ] Collapsible headers for Faerûn geographic regions (e.g., Sword Coast, Silver Marches, West Faerûn).
  - [ ] Collapsing/expanding Chevron toggles.
  - [ ] **Saved Location Nodes**: Lists registered custom locations per region (clicking a location selects it as active).

### Central Region Map Overlay
- [ ] **Vector Region Overlay**
  - [ ] Interactive high-resolution responsive SVG Map of Faerûn regions.
  - [ ] SVG Path Hover effect: Paths light up on hover and select regions on click.
- [ ] **Region Detail Overlay Panel** (Visible when a region is selected)
  - [ ] Displays the formal region name and historical overview summary.
  - [ ] Focal Point Coordinate Readout: Displays latitude and longitude focal anchors.
  - [ ] Target Zoom Factor Indicator.
- [ ] **Diagnostic Overlay Metrics**
  - [ ] `MAP_SYNC_ACTIVE` green indicator signal.
  - [ ] `COORD_SYS` status label (e.g., `HIGH_RES_PX`).

---

## 3. 🚩 World Flags Manager (`FlagManager.tsx`)

Direct reactive state debugger interface to view, override, and initialize boolean, numeric, or string world variables and faction standings.

- [ ] **New Flag Initializer Form**
  - [ ] `Flag Key` Input Field: Alphanumeric identifier string for state registration (e.g. `dragon_slain`).
  - [ ] `Initial Value` Input Field: Supports initial boolean, numeric, or string variable types.
  - [ ] `Initialize Flag` Trigger Button: Registers and commits the new flag to store variables.
- [ ] **Active Flags Directory**
  - [ ] Key label display per registered flag.
  - [ ] Live editable Input field: Allows instant override of active flags in the character/world store.
  - [ ] `trash` Delete Button: Erases the flag entirely from active world store records.

---

## 4. 🎛️ Audio Laboratory (`AudioLaboratory.tsx`)

The centralized management deck for custom voice acting, ambient soundtracks, soundscape layering, and artificial intelligence sound effect synthesis.

### Tab 4.1: Explorer Sub-Tab
- [ ] **Scanning Subroutines**
  - [ ] `refresh` Scan Trigger: Queries the `/api/audio/list` endpoint to index actual audio files inside `public/assets/sounds/`.
- [ ] **Direct Asset Bridge Grid**
  - [ ] Audio Category Tag: Identifies sounds as Ambient, SFX, music, or layer assets.
  - [ ] Asset Filename label: Displays clean, non-slugified sound identifiers.
  - [ ] `play` Sound Trigger: Invokes instant playback of the asset via the Sound mixing layer.
- [ ] **Audio Diagnostics Grid**
  - [ ] `Howler_Ready` Status Indicator: Verifies that the Howler.js runtime context is operational.
  - [ ] `Hue_Bridge` Status Indicator: Verifies Hue connection for environmental light state pairing.
  - [ ] `Live_Repository_Size` Indicator: Readout of total identified sound files.

### Tab 4.2: SFX Forge Sub-Tab (ElevenLabs Integration)
- [ ] **Asset Parameters Configuration**
  - [ ] `Asset_Identifier` Text Input: Filename mapping for repository baking (e.g., `arcane_fire_impact`).
- [ ] **Synthesis Prompter Panel**
  - [ ] Prompt Text Area: Input description of the target sound.
  - [ ] `AI_Optimize` Button: Forwards description to the `/api/ai/optimize-sound-prompt` optimizer to enhance prompter results.
- [ ] **Ignite Forge Action Toggles**
  - [ ] `Ignite Forge` Trigger: Sends parameters to `/api/audio/generate-sfx` for ElevenLabs generation.
  - [ ] `Preview Echo` Trigger (Visible after generation): Plays the captured audio blob buffer.
- [ ] **Deployment Panel** (Visible after generation)
  - [ ] Capture Status: Verifies valid binary buffer capture.
  - [ ] `Deploy to Repo` Trigger: Encodes blob buffer as Base64 and commits it directly to `public/assets/sounds/sfx/` over the `/api/commit` proxy.
- [ ] **Forge Context Side Deck**
  - [ ] `Duration` Slider: Controls sound duration (1s to 22s bounds).
  - [ ] `Seamless Loop` Toggle: Optimizes generator parameters for repeatable background tracks.
  - [ ] `ElevenLabs_Account` Switcher buttons: Rotates through account indices `ACC 1`, `ACC 2`, `ACC 3` to spread credits and bypass limits.

### Tab 4.3: Requester Sub-Tab
- [ ] **Asset Queue Form**
  - [ ] `Asset_Identifier` Input: Alphanumeric target filename.
  - [ ] `Context_And_Texture` Input Text Area: Describe technical expectations and mixing parameters.
  - [ ] `Priority_Level` Switcher: Low, Medium, and High task queuing priorities.
  - [ ] `Queue Request` Button: Encodes form and records request (plays success cue sound on compile).

---

## 5. 🛠️ Entity Generators

Procedural development systems grouped under the `GENERATORS` navigation tab.

### Tab 5.1: NPC Generator (`npc_generator.tsx`)
A full-stack wizard integrating procedural generation rules, character sheet models, and digital art synthesis engines.

- [ ] **Sidebar Entity Repository**
  - [ ] `New_Entity` Clean Wizard button: Resets the state buffer to generate a brand new NPC.
  - [ ] Saved character roster: Select any registered character save to edit or delete from the file-system.
- [ ] **Wizard Control Toolbar**
  - [ ] `Quick_Random` Button: Procedurally resolves core statistics and rules using local randomization utilities.
  - [ ] `Full_AI_Gen` Button: Invokes AI models (`npcService.ts`) to weave deep backstories and mechanical sheets.
  - [ ] `GEN_NPC_ASSETS` Button: Synthesizes high-fidelity vertical portraits, square avatars, and 3x3 emotional pose matrices.
  - [ ] `COMMIT_NPC_TO_REPO` Button: Persists character schemas into standard Artificer save structures, registers relative file URLs, and commits files over the proxy API.
- [ ] **Bio-Identity Inputs**
  - [ ] Name Field, Gender Switch, Class Selection, Race Selection, Background Selection, Alignment Selection.
  - [ ] Die Roll buttons per identity field: Performs randomized selection pool queries.
- [ ] **Appearance Matrix Inputs**
  - [ ] `Build_Profile` Text Inputs: Height, Weight, and general body build parameters.
  - [ ] `Eyes` and `Hair` Dropdown Selectors.
  - [ ] Hexadecimal Color Palette: Selects and previews skin tone color tags.
  - [ ] `Voice` Text Input: Maps voice profile identifiers.
- [ ] **Character Parameter Controls**
  - [ ] Experience points (XP) / Level inputs: Modifying Level recalculates Level-up requirements; modifying XP updates the level tier.
  - [ ] Ability Scores Grid: Editable score boxes (STR, DEX, CON, INT, WIS, CHA) with automatic modifier updates.
  - [ ] Vitals Dashboard: HP/Max HP, Armor Class, Initiative, and Speed.
- [ ] **Background Characteristic Selectors**
  - [ ] Interactive slots to query, generate, and view Traits, Ideals, Bonds, and Flaws.
- [ ] **Equipment Slot doll & Inventory Manager**
  - [ ] Interactive Equipment Doll: Displays equipped weapon, armor, and shield locations (click to unequip).
  - [ ] `Auto_Resolve` Equipment Tool: Resolves and equips class starting gear instantly.
  - [ ] `Apply_Gear` Button: Standardizes and compiles options into the inventory model.
  - [ ] Search Library Input: Queries registered weapons, armor, packs, and tools.
  - [ ] Storage Matrix grid: Shows items inside the backpack container.

### Tab 5.2: Enemy Manifestation (`DevKit.tsx` & `enemy-image_generator.tsx`)
Converts raw monster stat blocks and wiki text into structured database records.

- [ ] **Reconstruction Ripper**
  - [ ] Text Area Input: Paste raw monster statistics (e.g., copied directly from 5e.tools or manual text files).
  - [ ] `MANIFEST ESSENCE` Button: Leverages natural language processors to parse input text into structured JSON attributes.
- [ ] **Wiki Scraper Link**
  - [ ] Wiki URL Input: Auto-detects Forgotten Realms Fandom wiki resources based on active entity name.
  - [ ] `SCRAPE_LORE` Button: Crawls and matches sections, injecting lore details directly into the manifest.
- [ ] **Chronicle Binder**
  - [ ] `EDITOR` Tab: Custom narrative text area and editable custom record dividers.
  - [ ] `WIKI_RAW` Tab: Live JSON schema editor of lore records.
- [ ] **Mechanical Essence Dashboard**
  - [ ] Values Inputs: AC, Armor Desc, HP, HP Dice, CR, Initiative, Senses, Languages, Habitat, Treasure.
  - [ ] Attributes Grid: STR, DEX, CON, INT, WIS, CHA scores and modifier preview.
  - [ ] Size & Type dropdown filters, and alignment descriptors.
- [ ] **Action Block Editors**
  - [ ] Traits, Actions, Bonus Actions, Reactions, and Legendary Actions nested inputs.
- [ ] **Harvest Nodes & Loot Resources**
  - [ ] Harvest Node: Material category item drops, item SKU inputs, and count.
  - [ ] Loot Resources: Currency quantity roll dice (e.g., `1d10 gp`) and equipment index.
- [ ] **Metadata Options**
  - [ ] Rarity select, target sub-category, experience value, and habitat map pairing.
- [ ] **Synthesis Visualizer Engine**
  - [ ] Prompt Shell: Formula prompt showing description strings.
  - [ ] `Recalculate` Trigger: Refreshes prompt generation.
  - [ ] `<EnemyImageGenerator />` Portal: Generates high-resolution transparent tokens and framed artwork on specific terrain.

### Tab 5.3: Material Manifestation (`DevKit.tsx` & `material-image_generator.tsx`)
Manifests custom crafting nodes, rare metals, magical components, and monster drop-tables.

- [ ] Core Parameters: Asset SKU index, Name, Material Category dropdown, Rarity tiers, Cost string, Habitat backdrop mapping.
- [ ] Weight input in LBS, and long description editor.
- [ ] `<MaterialImageGenerator />` Panel: AI-powered item icon visual generator.

### Tab 5.4: Equipment Manifestation (`DevKit.tsx` & `equipment-image_generator.tsx`)
Enforces strict mechanical structures, weapon damage types, defensive classes, and inventory socket structures.

- [ ] Core Parameters: SKU, Name, Rarity, Cost, Backdrops, Weight, Item Category.
- [ ] Socket Slots Selector Grid: Configure valid slots (e.g. `head`, `chest`, `main-hand`, `off-hand`, `ring`, `ammo`). Toggles 1-Handed/2-Handed options.
- [ ] Description editor.
- [ ] `<EquipmentImageGenerator />` Panel: AI-powered item sprite and card illustrator.

### Tab 5.5: Jane (World Builder) (`Jane.tsx`)
Manages regional hierarchies, geographical nodes, settlements, and points of interest.

- [ ] Left Sidebar: Recent Bakes directory history list.
- [ ] Cartographer Sub-Tabs: `editor`, `preview`, `json` active workspaces.
- [ ] Core Parameters: Location ID Slug (generates auto-hyphenated indexes), Name, Type Category dropdown (settlement, forest, mountain, POI, shop, water).
- [ ] Coordinate Anchors: Latitude and Longitude input coordinates.
- [ ] Atmospheric Description text area, and Historical Lore markdown box.
- [ ] Dynamic Metadata Sub-Editor: Add, edit, and delete custom keys (e.g., government, factions, economy) on the fly.
- [ ] Regional categorization: region, continent, world fields.

### Tab 5.6: Habitat Generator (`DevKit.tsx`)
Standardizes global environmental backdrops for combat encounters, narrative panels, and map rendering.

- [ ] Region drop-down index: Select target environment (Forest, Desert, Snowy, Dungeon, Ruins).
- [ ] Variation index buttons: Rotates standard backdrop orientations (Main, variation 1, variation 2, Wide, Macro).
- [ ] Entropy Instructions: Add description of weather conditions or environmental hazards.
- [ ] Action Triggers:
  - [ ] `EXECUTE_GENERATE`: Invokes background synthesizer model.
  - [ ] `COMMIT_TO_DATABASE`: Commits the output image into the webp resource repository.

---

## 6. 🧪 Validation Testers

Dynamic combat and systems testers grouped under the `TESTERS` navigation tab.

### Tab 6.1: NPC Slot Tester (`npc_tester.tsx`)
Ensures active party slots (1-6) correctly bind state updates, swap items, and trigger character saves.

- [ ] Active Party Dashboard:
  - [ ] Slot 1 (LEAD) Lock: Protected slot representing the active player's primary character sheet.
  - [ ] Slots 2-6: Interactive swappable party nodes.
  - [ ] Clear Slot action: Drops the chosen slot back to empty placeholder.
- [ ] Action Toolbar:
  - [ ] `Purge NPC Cache` Trigger: Reverts Slots 2-6 to default state.
  - [ ] `Refresh` Trigger: Reloads database saves.
- [ ] NPC Template Database:
  - [ ] Search input matching name or index tags.
  - [ ] Slot quick-assign grids (`S2`, `S3`, `S4`, `S5`, `S6`): Instantly hot-swaps target template into corresponding party slot.

### Tab 6.2: Tactical Combat Tester (`CombatTester.tsx`)
Validates combat grids, initiative orders, collision bounds, and NPC actions.

- [ ] Action Control Deck:
  - [ ] `Exploration`/`Combat` Mode Toggles: Standardizes game state bounds.
  - [ ] `Terrain` Dropdown Selector: Selects current tactical map grid background (e.g. Dungeon, Oasis, Fey Forest).
  - [ ] `Full Party Restore` Trigger: Full HP, Spell slot, and Action recovery for all party members.
  - [ ] `Launch Tactical Combat` Trigger: Opens active combat maps and closes the Dev Kit panel.
- [ ] Active Combatants Sidebar:
  - [ ] `Clear Board` Trigger: Instantly flushes board combatants.
  - [ ] Party Nodes tracker: Live visual check of health percentages.
  - [ ] Enemy Manifestations Roster: Active tokens currently mapped to coordinates. Includes target deletion triggers per token.
- [ ] Monster Registry summoner:
  - [ ] Live search box for registered monsters.
  - [ ] Direct quick-summon card list: Single click immediately inserts a new token of that monster category onto the active grid coordinate map.

### Tab 6.3: Simulator (`Simulator.tsx`)
Validates progression rules, XP multipliers, leveling parameters, and active character store transitions.

- [ ] Progression Header Panel:
  - [ ] Active Hero identity card: Displays avatar, name, class, and level.
  - [ ] Character Switcher slots: Instantly rotates active character focus.
- [ ] Progression Engine:
  - [ ] Experience progress bar: Live percentage progression display.
  - [ ] `Grant 100 XP` Trigger: Adds 100 experience points.
  - [ ] `Grant 1000 XP` Trigger: Adds 1000 experience points.
  - [ ] `Trigger Instant Level Up` Trigger: Grants the exact amount of experience required to step into the next character level tier.

---

## 7. 📝 User-Defined Future & Missing Features

This section is reserved for custom maintenance items, specific checklist tasks, or missing components defined by the user.

- [ ] *Double-click on this document to add your own custom checkpoints here.*
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
