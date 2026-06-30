import { create } from 'zustand';

/**
 * @deprecated useStore is being sliced into specialized stores.
 * Please use useUIStore, useAtlasStore, useGameStore, useAuthStore, useAudioStore, or useWorldStore instead.
 *
 * This store is kept temporarily for backward compatibility but is empty.
 */
interface LegacyAppState {}

export const useStore = create<LegacyAppState>(() => ({}));
