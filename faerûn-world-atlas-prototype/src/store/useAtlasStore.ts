import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AtlasState {
  // Navigation
  currentHierarchy: {
    region?: string;
    subRegion?: string;
    location?: string;
    locationUrl?: string;
    categoryId?: string;
    locationLayer?: string; // e.g. "surface", "sewers"
  };
  currentMapId: string;
  
  // App State
  viewMode: 'map' | 'wiki' | 'graph';
  isDevKitOpen: boolean;
  isEditMode: boolean;
  isPlacementMode: boolean;
  isPickingCoordinate: boolean;
  isRulerMode: boolean;
  measuredUnits: number | null;
  mapScales: Record<string, number>;
  time: 'day' | 'night';
  layer: 'surface' | 'underdark';
  
  // GitHub Session
  githubConfig: {
    owner: string;
    repo: string;
    branch: string;
    token: string;
    path: string;
  };

  // Staging
  stagedChanges: Record<string, {
    path: string;
    content: any;
    label: string;
    timestamp: number;
    isBinary?: boolean;
  }>;
  
  // Actions
  setHierarchy: (hierarchy: Partial<AtlasState['currentHierarchy']>) => void;
  setMapId: (id: string) => void;
  setDevKitOpen: (open: boolean) => void;
  setEditMode: (edit: boolean) => void;
  setPlacementMode: (active: boolean) => void;
  setPickingCoordinate: (picking: boolean) => void;
  setRulerMode: (ruler: boolean) => void;
  setMeasuredUnits: (units: number | null) => void;
  setScale: (mapId: string, unitsPerMile: number) => void;
  setTime: (time: 'day' | 'night') => void;
  setLayer: (layer: 'surface' | 'underdark') => void;
  setGithubConfig: (config: Partial<AtlasState['githubConfig']>) => void;
  stageChange: (id: string, data: { path: string; content: any; label: string; isBinary?: boolean }) => void;
  discardChange: (id: string) => void;
  clearStaging: () => void;
  resetHierarchy: () => void;
}

export const useAtlasStore = create<AtlasState>()(
  persist(
    (set) => ({
      currentHierarchy: {},
      currentMapId: 'world',
      viewMode: 'map',
      isDevKitOpen: false,
      isEditMode: false,
      isPlacementMode: false,
      isPickingCoordinate: false,
      isRulerMode: false,
      measuredUnits: null,
      mapScales: {
        'world': 3.17 // Faerun world map scale: ~3.17 units per mile
      },
      time: 'day',
      layer: 'surface',
      githubConfig: {
        owner: "japiohopman",
        repo: "artificer",
        branch: "main",
        token: "",
        path: "public/assets/atlas/world/toril/faerun"
      },
      stagedChanges: {},
      
      setHierarchy: (hierarchy) => set((state) => ({
        currentHierarchy: { ...state.currentHierarchy, ...hierarchy }
      })),
      
      setMapId: (id) => set({ currentMapId: id }),
      
      setDevKitOpen: (open) => set({ isDevKitOpen: open }),
      
      setEditMode: (edit) => set({ isEditMode: edit }),
      
      setPlacementMode: (active) => set({ isPlacementMode: active }),
      
      setPickingCoordinate: (picking) => set({ isPickingCoordinate: picking }),
      
      setRulerMode: (ruler) => set({ isRulerMode: ruler }),
      
      setMeasuredUnits: (units) => set({ measuredUnits: units }),
      
      setScale: (mapId, unitsPerMile) => set((state) => ({
        mapScales: { ...state.mapScales, [mapId]: unitsPerMile }
      })),
      
      setTime: (time) => set({ time }),
      
      setLayer: (layer) => set({ layer }),
      
      setGithubConfig: (config) => set((state) => ({
        githubConfig: { ...state.githubConfig, ...config }
      })),

      stageChange: (id, change) => set((state) => ({
        stagedChanges: {
          ...state.stagedChanges,
          [id]: { ...change, timestamp: Date.now() }
        }
      })),

      discardChange: (id) => set((state) => {
        const newStaged = { ...state.stagedChanges };
        delete newStaged[id];
        return { stagedChanges: newStaged };
      }),

      clearStaging: () => set({ stagedChanges: {} }),
      
      resetHierarchy: () => set({ currentHierarchy: {}, currentMapId: 'world' }),
    }),
    {
      name: 'atlas-storage',
      partialize: (state) => ({ 
        githubConfig: state.githubConfig,
        mapScales: state.mapScales
      }),
    }
  )
);
