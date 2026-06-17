import { create } from 'zustand';
import { AudioLayer, LayerState } from '../types/audio';

interface AudioState {
  layerStates: Record<AudioLayer, LayerState>;
  isMusicPlaying: boolean;
  
  // Hue Lighting (Arcane Ambiance)
  hueState: {
    enabled: boolean;
    connected: boolean;
    brightness: number;
    color: string;
    scene: string;
    isSyncing: boolean;
  };

  // Audio Actions
  updateLayerVolume: (layerId: AudioLayer, volume: number) => void;
  toggleLayerMute: (layerId: AudioLayer) => void;
  toggleLayerSolo: (layerId: AudioLayer) => void;
  stopAllAudio: () => void;
  setMusicPlaying: (isPlaying: boolean) => void;
  playSound: (soundId: string) => void;

  // Hue Actions
  setHueState: (updates: Partial<AudioState['hueState']>) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isMusicPlaying: false,
  layerStates: {
    1: { volume: 0.8, isMuted: false, isSolo: false, isPlaying: false },
    2: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    3: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    4: { volume: 0.7, isMuted: false, isSolo: false, isPlaying: false },
    5: { volume: 1.0, isMuted: false, isSolo: false, isPlaying: false },
    6: { volume: 0.6, isMuted: false, isSolo: false, isPlaying: false },
    7: { volume: 0.6, isMuted: false, isSolo: false, isPlaying: false },
    8: { volume: 1.0, isMuted: false, isSolo: false, isPlaying: false },
    9: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    10: { volume: 0.5, isMuted: false, isSolo: false, isPlaying: false },
    11: { volume: 0.4, isMuted: false, isSolo: false, isPlaying: false },
  },

  hueState: {
    enabled: false,
    connected: false,
    brightness: 100,
    color: '#ffffff',
    scene: 'default',
    isSyncing: false
  },

  playSound: (soundId) => {
    console.log(`[useAudioStore] Playing sound: ${soundId}`);
  },

  updateLayerVolume: (layerId, volume) => set((state) => {
    const newState = {
      layerStates: {
        ...state.layerStates,
        [layerId]: { ...state.layerStates[layerId], volume }
      }
    };
    import('../services/soundService').then(({ soundService }) => {
      soundService.updateLayerVolume(layerId, volume);
    });
    return newState;
  }),

  toggleLayerMute: (layerId) => set((state) => {
    const isMuted = !state.layerStates[layerId].isMuted;
    const newState = {
      layerStates: {
        ...state.layerStates,
        [layerId]: { ...state.layerStates[layerId], isMuted }
      }
    };
    import('../services/soundService').then(({ soundService }) => {
      soundService.updateLayerMute(layerId, isMuted);
    });
    return newState;
  }),

  toggleLayerSolo: (layerId) => set((state) => {
    const isSolo = !state.layerStates[layerId].isSolo;
    const newLayerStates = { ...state.layerStates };
    newLayerStates[layerId] = { ...newLayerStates[layerId], isSolo };
    
    import('../services/soundService').then(({ soundService }) => {
      soundService.updateLayerSolo(layerId, isSolo);
    });
    
    return { layerStates: newLayerStates };
  }),

  stopAllAudio: () => {
    set({ isMusicPlaying: false });
    import('../services/soundService').then(({ soundService }) => {
      soundService.stopAll();
    });
  },

  setMusicPlaying: (isMusicPlaying) => set({ isMusicPlaying }),

  setHueState: (updates) => set((state) => ({
    hueState: { ...state.hueState, ...updates }
  })),
}));
