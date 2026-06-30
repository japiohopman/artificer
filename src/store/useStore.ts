import { create } from 'zustand';

// Re-export types from specialized stores for backward compatibility during transition
export type { ExplorerTab } from './useUIStore';

/**
 * @deprecated useStore is being dismantled into specialized slices.
 * Please use:
 * - useUIStore for UI/Navigation state
 * - useAtlasStore for Atlas/Game data
 * - useCharacterStore for Character state
 * - useInventoryStore for Party/Character inventory
 * - useWorldStore for World/Temporal state
 * - useAuthStore for User/Auth state
 * - useAudioStore for Audio/Hue state
 * - useGameStore for Logs/Dice/Minigames
 */

interface LegacyStore {
  // Add anything that really can't be moved yet, or keep empty if all moved
}

export const useStore = create<LegacyStore>(() => ({
  // Transitioning to specialized stores
}));
