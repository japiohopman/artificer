# ⏳ Loading System

The **Loading System** provides a centralized, visually immersive way to handle heavy asset loads or instant time/location transitions (like "Skip Travel" or "Resting").

## 🧩 Components

### 1. `LoadingScreen.tsx`
A global overlay that covers the entire viewport. It features:
- **Fade Transitions**: Smooth fade-in and fade-out using `AnimatePresence`.
- **Rotating Game Art**: Displays organized local assets from `public/assets/images/game_art/`.
- **Status Messages**: Dynamically updated text explaining the current operation (e.g., "Traveling to Neverwinter...", "Drifting into Slumber...").
- **Visual Feedback**: A rotating decorative spinner and an aesthetic progress bar.

## 🛠️ Implementation

### State Management (`useUIStore.ts`)
The loading state is managed globally:
- `isLoading`: Boolean to toggle the visibility of the screen.
- `loadingMessage`: The text displayed to the user.
- `loadingArt`: Optional specific image to override the random selection.

### Usage
```typescript
const { setIsLoading } = useUIStore();

// Start loading
setIsLoading(true, "Preparing for battle...");

// Complete loading
setIsLoading(false);
```

## 🎨 Asset Organization
Loading art is pulled from:
- `public/assets/images/game_art/rule_book/rule_book_[1-5].webp`
- `public/assets/images/game_art/adventuring/adventuring_[1-4].webp`

These assets are curated to provide a consistent D&D aesthetic during transitions.
