# ⚡ Artificer Performance Optimization Blueprint

This document serves as a comprehensive technical audit and optimization blueprint for the Artificer application. Although the application is still lightweight in terms of raw functionality, certain architecture-level patterns have introduced noticeable performance bottlenecks, sluggishness, and rendering overhead.

Use this blueprint and its empty checkboxes (`[ ]`) to guide the CLI-agent or yourself through a systematic, step-by-step optimization process.

---

## 🔍 Core Performance Bottlenecks

We have identified four primary categories responsible for the sluggishness of the application:
1. **Unoptimized State Subscriptions & God-Store Re-renders** (Zustand slice updates).
2. **Excessive & Uncached Animation Overhead** (Framer Motion / Motion React wrappers).
3. **Illogical Waterfall Asset Loading** (Sequential REST fetches and un-cached local resources).
4. **3D Physics & Heavy Asset Initialization** (WASM Dice Box, audio engines, and large SVGs).

---

## 1. ⚛️ State Subscription & Render Optimization (Zustand)

Currently, components often import Zustand stores globally without targeting specific state slices. This results in the entire component tree re-rendering whenever *any* unrelated property in that store changes (e.g., a timer incrementing, a map coordinates change, or chat log update).

### 🚨 The Problem:
```tsx
// BAD: Subscribing to the entire store triggers re-renders on EVERY state change
const store = useCharacterStore();
```

### 💡 The Solution:
```tsx
// GOOD: Component ONLY re-renders when the specific slice/property changes
const characters = useCharacterStore(state => state.characters);
const updateCharacter = useCharacterStore(state => state.updateCharacter);
```

### 🛠️ Tasks & Checklists:
- [ ] **Audit Zustand Store Subscriptions**
  - [ ] Convert all instances of global store imports (e.g., `const store = useGameStore()`, `const characterStore = useCharacterStore()`) to strict selector-based imports.
  - [ ] Audit `App.tsx` and ensure it doesn't trigger global renders.
  - [ ] Implement Zustand's `shallow` equality check helper for slice arrays or objects to prevent unnecessary render ticks.
- [ ] **Isolate High-Frequency State Updates**
  - [ ] **Temporal Engine Tick:** Ensure the temporal clock interval (seconds/minutes ticking) in `TemporalWidget.tsx` is strictly isolated so that it does *not* cause re-renders of larger panels like `WorldPanel.tsx`.
  - [ ] **Chat Input & Feed:** Isolate chat state feeds so characters moving or rolling dice does not cause complete chat panel reflows.

---

## 2. 🎬 Animation & Motion Overhead (Motion/React)

Animations are meant to add flavor, but excessive nesting of `motion` tags, particularly within grid loops, causes major CPU and layout reflow lags.

### 🚨 The Problem:
- Rendering loops (like inventory slot grids, enemy manifests, or asset explorers) wrapping *every single item* in an `<AnimatePresence>` or `<motion.div>` with heavy spring-physics parameters.
- Animating non-GPU accelerated CSS properties (like `width`, `height`, `margin`, `padding`) which triggers expensive CPU-bound layout reflows instead of utilizing fast composite-only properties (like `transform` (scale, translate) and `opacity`).

### 💡 The Solution:
- Restrict loops to simple, flat CSS transitions (`transition-all duration-200`) where possible.
- Use `motion` components *only* for primary entry modals, transitions between tabs, or major state changes.
- Ensure all animations use composite properties:
  - Use `transform: scale() / translate()` instead of animating `width/height`.
  - Use `opacity` for fades.

### 🛠️ Tasks & Checklists:
- [ ] **Audit Framer Motion / Motion/React wrappers**
  - [ ] Clean up redundant `<motion.div>` wrappers in repetitive grid components:
    - [ ] `CombatGrid.tsx` (Grid movement animation, cell highlights).
    - [ ] `AssetExplorer.tsx` / `MonsterCard.tsx` / `EquipmentCard.tsx` (Card transitions).
    - [ ] `AudioLaboratory.tsx` (Sub-tab animation panels).
  - [ ] Convert static grids and slots (such as inventory containers and spell selection screens) from Framer Motion animations to lightweight Tailwind CSS utility animations (e.g., `transition-all ease-out duration-150`).
- [ ] **Optimize Animation Parameters**
  - [ ] Replace high-stress spring physics (`type: "spring"`) on small UI micro-interactions with simple, predictable linear/ease curves (`ease: "easeOut", duration: 0.2`).
  - [ ] Add `will-change-transform` or `will-change-opacity` CSS hints to heavy animated containers to force GPU layering.

---

## 3. 🌐 Illogical Waterfall Loading & Asset I/O

The app frequently queries assets (such as character features, equipment items, or spell schemas) sequentially, creating blocking "fetch waterfalls."

### 🚨 The Problem:
- A user triggers an action (e.g., Leveling up a character) which loops through multiple IDs, executing `await fetch(...)` sequentially. Verifying and loading 10 assets sequentially takes `10 × network_latency`, creating massive lag.
- Frequent re-fetching of local static asset schemas (items, spells, monster profiles) from files or endpoints because they are not cached.

### 💡 The Solution:
- Use `Promise.all` to query multiple independent endpoints in parallel.
- Pre-fetch asset indexes (equipment indexes, spell indexes) once when the application boots and cache them in local browser storage (`IndexedDB` or `localStorage`).

### 🛠️ Tasks & Checklists:
- [ ] **Eliminate Fetch Waterfalls**
  - [ ] Refactor character-level up utilities (`characterUtils.ts` and character pipeline loops) to use `Promise.all()` to resolve independent file calls simultaneously.
  - [ ] Pre-resolve asset lists in `useAtlasStore` when entering the Dev Kit, instead of executing fresh fetches for every single button-click or preview card mount.
- [ ] **Implement Local Cache & Offline-First Strategy**
  - [ ] Implement a lightweight local memory-cache or `localStorage` helper in `storageService.ts` for loaded Atlas JSON payloads.
  - [ ] Ensure that once an equipment or spell JSON asset is fetched, future mounts of that card read directly from the in-memory cache.
- [ ] **Lazy-Load Complex Components**
  - [ ] Utilize React's `React.lazy()` and `<Suspense>` to lazy-load massive sub-sections of the Dev Kit. The primary app bundle should not include components like the `CombatTester` or `AudioLaboratory` until the user actually toggles them open.

---

## 4. 🎲 WASM & Audio Engine Lifecycle Optimization

Heavy libraries like the 3D Dice Box (using Ammo.js WebAssembly compiled physics) and `wavesurfer.js` (used in audio editing modules) run heavy tick loops that hog main thread performance even when they are hidden from the user's view.

### 🚨 The Problem:
- The 3D Dice Canvas or WASM runtime is kept active in the background, consuming CPU ticks and GPU memory while hidden.
- Audio players or soundscape layers are dynamically allocated on every playback trigger without pooling, resulting in Garbage Collection (GC) pauses.

### 💡 The Solution:
- Destroy or suspend WASM/WebGL canvas contexts completely when the overlay/modal is inactive.
- Implement an audio asset instance pool (pre-cached Howler instances) for common sound effects, rather than allocating fresh instances on demand.

### 🛠️ Tasks & Checklists:
- [ ] **Deactivate WebGL Canvas Ticks**
  - [ ] Ensure that the 3D Dice Box canvas elements and update loop are completely unmounted and garbage collected when the Dice box is not rolling.
- [ ] **Optimize Audio Instances Pool**
  - [ ] Audit `audioEngine.ts` to ensure triggerable short SFX are recycled rather than spawning infinite brand-new Howler handles.
- [ ] **Pre-Compress High-Resolution Assets**
  - [ ] Verify that terrain backgrounds in `public/assets/atlas/combat/combat_map_terrain/` and enemy tokens are optimized `.webp` formats under 500KB.
  - [ ] Compress large wav/mp3 audio files to optimized formats (e.g. 96kbps-128kbps variable bit-rate MP3 or OGG) to improve stream buffering.

---

## 🚀 Optimization Roadmap Checklist for CLI-Agent

This roadmap is prioritized from the highest impact (e.g., immediate, dramatic performance gains) to micro-optimizations.

### Phase 1: Zustand Store Slicing & Selector Slices (High Priority)
- [ ] **[Task 1.1]** Isolate global store selections in `App.tsx` and `WorldPanel.tsx`.
- [ ] **[Task 1.2]** Move from full-store selections (`const store = useStore()`) to targeted state-slices.
- [ ] **[Task 1.3]** Add Zustand `shallow` equality hooks to prevent unnecessary re-renders of arrays/objects.

### Phase 2: Animation Stripping & Layout Consolidation (High Priority)
- [ ] **[Task 2.1]** Remove spring-physics `<motion.div>` tags from list-render loops (e.g. inventory cells, explorer list entries).
- [ ] **[Task 2.2]** Audit `will-change` hardware acceleration tags on map-rendering contexts.
- [ ] **[Task 2.3]** Ensure all active animations target strictly GPU composite properties (`opacity`, `transform`) instead of layout properties (`width`, `height`).

### Phase 3: Parallel Asset Delivery & Pre-Fetching (Medium Priority)
- [ ] **[Task 3.1]** Refactor sequential asset loops to parallel `Promise.all()` triggers.
- [ ] **[Task 3.2]** Add simple in-memory schema caches in `storageService.ts` to block duplicate local REST network requests.
- [ ] **[Task 3.3]** Implement lazy-loading via `React.lazy` on heavy administrative components (Jane, CombatTester, AudioLaboratory).

### Phase 4: Heavy Subsystems Lifecycle Controls (Low Priority)
- [ ] **[Task 4.1]** Suspend or completely unmount WebGL Canvas/Dice physics when active rolls terminate.
- [ ] **[Task 4.2]** Validate that all static images and ambient background loops are optimized compression sizes.
