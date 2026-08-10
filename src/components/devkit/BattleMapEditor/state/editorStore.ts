import { create } from 'zustand';
import { BattleMap, EditorTool, EditorSelection, WallSegment, MapObject, MapToken, TerrainCell, MapLabel, MapMarker } from '../types/battleMap';
import { createDefaultMap } from './editorDefaults';

interface ViewportState {
  zoom: number; // Scale factor, e.g. 1.0 (100%), 0.5 (50%), 2.0 (200%)
  panX: number;
  panY: number;
}

interface EditorState {
  // Core Battle Map Data
  map: BattleMap;
  
  // Viewport & Settings
  viewport: ViewportState;
  activeTool: EditorTool;
  selectedLayerId: string;
  selection: EditorSelection;
  activeThemeId: string;

  // Stamp Tool Properties
  selectedStampIndex: string | null; // e.g., 'barrel', 'table', 'torch'
  selectedStampCategory: string; // e.g. 'Props', 'Nature', etc.

  // Drawing tools configuration
  selectedWallType: 'wall' | 'door' | 'secret-door';
  selectedTerrainType: string; // e.g. 'stone', 'wood', 'water'
  
  // Automatic Cover inputs
  coverAttacker: { x: number; y: number } | null;
  coverTarget: { x: number; y: number } | null;

  // History stack for Undo / Redo
  history: BattleMap[];
  historyIndex: number;

  // Actions
  setMap: (map: BattleMap, skipHistory?: boolean) => void;
  updateMapDimensions: (width: number, height: number) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  setActiveTool: (tool: EditorTool) => void;
  setSelectedLayerId: (layerId: string) => void;
  setSelection: (selection: EditorSelection) => void;
  setActiveThemeId: (themeId: string) => void;

  setSelectedStamp: (index: string | null, category: string) => void;
  setSelectedWallType: (type: 'wall' | 'door' | 'secret-door') => void;
  setSelectedTerrainType: (type: string) => void;

  setCoverAttacker: (pos: { x: number; y: number } | null) => void;
  setCoverTarget: (pos: { x: number; y: number } | null) => void;

  // History Actions
  pushHistory: (newMap: BattleMap) => void;
  undo: () => void;
  redo: () => void;

  // Semantic mutations that auto-trigger history
  addWall: (wall: Omit<WallSegment, 'id'>) => void;
  removeWall: (id: string) => void;
  addTerrain: (cell: TerrainCell) => void;
  removeTerrain: (x: number, y: number) => void;
  addObject: (obj: Omit<MapObject, 'id'>) => void;
  updateObject: (id: string, updates: Partial<MapObject>) => void;
  removeObject: (id: string) => void;
  addToken: (token: Omit<MapToken, 'id'>) => void;
  updateToken: (id: string, updates: Partial<MapToken>) => void;
  removeToken: (id: string) => void;
  addLabel: (label: Omit<MapLabel, 'id'>) => void;
  removeLabel: (id: string) => void;
  addMarker: (marker: Omit<MapMarker, 'id'>) => void;
  removeMarker: (id: string) => void;

  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;

  // Batch actions / generators
  clearMap: () => void;
  loadMapData: (data: any) => void;
}

export const useEditorStore = create<EditorState>((set, get) => {
  const initialMap = createDefaultMap();
  
  return {
    map: initialMap,
    viewport: { zoom: 1, panX: 0, panY: 0 },
    activeTool: 'wall',
    selectedLayerId: 'walls_doors',
    selection: { ids: [], type: null },
    activeThemeId: 'dungeon',

    selectedStampIndex: null,
    selectedStampCategory: 'Props',
    selectedWallType: 'wall',
    selectedTerrainType: 'stone',

    coverAttacker: null,
    coverTarget: null,

    history: [initialMap],
    historyIndex: 0,

    setMap: (map, skipHistory = false) => {
      const nowStr = new Date().toISOString();
      const updatedMap = {
        ...map,
        metadata: {
          ...map.metadata,
          updatedAt: nowStr
        }
      };

      set({ map: updatedMap });

      if (!skipHistory) {
        get().pushHistory(updatedMap);
      }
    },

    updateMapDimensions: (width, height) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        dimensions: { width, height }
      };
      get().setMap(updatedMap);
    },

    setViewport: (viewport) => set((state) => ({ viewport: { ...state.viewport, ...viewport } })),
    setActiveTool: (activeTool) => set({ activeTool }),
    setSelectedLayerId: (selectedLayerId) => set({ selectedLayerId }),
    setSelection: (selection) => set({ selection }),
    setActiveThemeId: (activeThemeId) => set({ activeThemeId }),

    setSelectedStamp: (index, category) => set({ selectedStampIndex: index, selectedStampCategory: category }),
    setSelectedWallType: (selectedWallType) => set({ selectedWallType }),
    setSelectedTerrainType: (selectedTerrainType) => set({ selectedTerrainType }),

    setCoverAttacker: (coverAttacker) => set({ coverAttacker }),
    setCoverTarget: (coverTarget) => set({ coverTarget }),

    pushHistory: (newMap) => {
      const { history, historyIndex } = get();
      const cleanHistory = history.slice(0, historyIndex + 1);
      
      set({
        history: [...cleanHistory, newMap],
        historyIndex: cleanHistory.length
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        set({
          historyIndex: historyIndex - 1,
          map: history[historyIndex - 1]
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        set({
          historyIndex: historyIndex + 1,
          map: history[historyIndex + 1]
        });
      }
    },

    addWall: (wall) => {
      const currentMap = get().map;
      const id = `wall-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // Prevent duplicates in the same coordinate/orientation
      const exists = currentMap.walls.some(
        (w) => w.x === wall.x && w.y === wall.y && w.orientation === wall.orientation
      );
      if (exists) return;

      const updatedMap = {
        ...currentMap,
        walls: [...currentMap.walls, { ...wall, id }]
      };
      get().setMap(updatedMap);
    },

    removeWall: (id) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        walls: currentMap.walls.filter((w) => w.id !== id)
      };
      get().setMap(updatedMap);
    },

    addTerrain: (cell) => {
      const currentMap = get().map;
      const filtered = currentMap.terrain.filter((t) => !(t.x === cell.x && t.y === cell.y));
      const updatedMap = {
        ...currentMap,
        terrain: [...filtered, cell]
      };
      get().setMap(updatedMap);
    },

    removeTerrain: (x, y) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        terrain: currentMap.terrain.filter((t) => !(t.x === x && t.y === y))
      };
      get().setMap(updatedMap);
    },

    addObject: (obj) => {
      const currentMap = get().map;
      const id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const updatedMap = {
        ...currentMap,
        objects: [...currentMap.objects, { ...obj, id }]
      };
      get().setMap(updatedMap);
    },

    updateObject: (id, updates) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        objects: currentMap.objects.map((o) => (o.id === id ? { ...o, ...updates } : o))
      };
      get().setMap(updatedMap);
    },

    removeObject: (id) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        objects: currentMap.objects.filter((o) => o.id !== id)
      };
      get().setMap(updatedMap);
    },

    addToken: (token) => {
      const currentMap = get().map;
      const id = `tok-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const updatedMap = {
        ...currentMap,
        tokens: [...currentMap.tokens, { ...token, id }]
      };
      get().setMap(updatedMap);
    },

    updateToken: (id, updates) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        tokens: currentMap.tokens.map((t) => (t.id === id ? { ...t, ...updates } : t))
      };
      get().setMap(updatedMap);
    },

    removeToken: (id) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        tokens: currentMap.tokens.filter((t) => t.id !== id)
      };
      get().setMap(updatedMap);
    },

    addLabel: (label) => {
      const currentMap = get().map;
      const id = `lbl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const updatedMap = {
        ...currentMap,
        labels: [...currentMap.labels, { ...label, id }]
      };
      get().setMap(updatedMap);
    },

    removeLabel: (id) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        labels: currentMap.labels.filter((l) => l.id !== id)
      };
      get().setMap(updatedMap);
    },

    addMarker: (marker) => {
      const currentMap = get().map;
      const id = `mrk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const updatedMap = {
        ...currentMap,
        markers: [...currentMap.markers, { ...marker, id }]
      };
      get().setMap(updatedMap);
    },

    removeMarker: (id) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        markers: currentMap.markers.filter((m) => m.id !== id)
      };
      get().setMap(updatedMap);
    },

    toggleLayerVisibility: (layerId) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        layers: currentMap.layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
      };
      get().setMap(updatedMap, true); // Visual adjustment doesn't necessarily warrant full command stack history, or can skip
    },

    toggleLayerLock: (layerId) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        layers: currentMap.layers.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l))
      };
      get().setMap(updatedMap, true);
    },

    clearMap: () => {
      const defaultMap = createDefaultMap();
      get().setMap(defaultMap);
      set({ selection: { ids: [], type: null }, coverAttacker: null, coverTarget: null });
    },

    loadMapData: (data) => {
      if (!data) return;
      
      // Parse legacy map schema if detected, or bind into version 1 format
      let parsedMap: BattleMap;
      if (data.version === 1) {
        parsedMap = data;
      } else {
        const defaultMap = createDefaultMap(data.gridSize?.width || 16, data.gridSize?.height || 12);
        
        // Map legacy arrays
        const mappedWalls: WallSegment[] = (data.walls || []).map((key: string) => {
          const [xStr, yStr] = key.split(',');
          return {
            id: `wall-${Math.random().toString(36).substr(2, 5)}`,
            orientation: 'horizontal',
            x: parseInt(xStr),
            y: parseInt(yStr),
            type: 'wall'
          };
        });

        const mappedTerrain: TerrainCell[] = (data.rooms || []).map((key: string) => {
          const [xStr, yStr] = key.split(',');
          return {
            x: parseInt(xStr),
            y: parseInt(yStr),
            type: 'stone'
          };
        });

        const mappedTokens: MapToken[] = [];
        (data.enemies || []).forEach(([key, name]: [string, string]) => {
          const [xStr, yStr] = key.split(',');
          mappedTokens.push({
            id: `tok-${Math.random().toString(36).substr(2, 5)}`,
            name,
            type: 'enemy',
            x: parseInt(xStr),
            y: parseInt(yStr),
            size: 'Medium'
          });
        });

        if (data.entrance) {
          mappedTokens.push({
            id: `tok-${Math.random().toString(36).substr(2, 5)}`,
            name: 'Spawn Point',
            type: 'player',
            x: data.entrance.x,
            y: data.entrance.y,
            size: 'Medium'
          });
        }

        parsedMap = {
          ...defaultMap,
          metadata: {
            ...defaultMap.metadata,
            theme: data.theme || 'dungeon'
          },
          grid: {
            ...defaultMap.grid,
            scale: data.scale || 5
          },
          walls: mappedWalls,
          terrain: mappedTerrain,
          tokens: mappedTokens
        };
      }

      get().setMap(parsedMap);
    }
  };
});
