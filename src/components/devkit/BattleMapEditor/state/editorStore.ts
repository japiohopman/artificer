import { create } from 'zustand';
import { BattleMap, EditorTool, EditorSelection, WallSegment, MapObject, MapToken, TerrainCell, MapLabel, MapMarker } from '../types/battleMap';
import { createDefaultMap } from './editorDefaults';
import { Command } from '../commands/command';
import {
  createAddWallCommand,
  createRemoveWallCommand,
  createUpdateWallCommand,
  createPaintTerrainCommand,
  createAddObjectCommand,
  createRemoveObjectCommand,
  createUpdateObjectCommand,
  createAddTokenCommand,
  createRemoveTokenCommand,
  createUpdateTokenCommand,
  createAddRoomCommand,
  createUpdateMapDimensionsCommand,
  createAddLabelCommand,
  createRemoveLabelCommand,
  createAddMarkerCommand,
  createRemoveMarkerCommand,
  TerrainChange
} from '../commands/mapCommands';

interface ViewportState {
  zoom: number; // Scale factor, e.g. 1.0 (100%), 0.5 (50%), 2.0 (200%)
  panX: number;
  panY: number;
}

const createReplaceMapCommand = (oldMap: BattleMap, newMap: BattleMap): Command => ({
  id: `replace-map-${Date.now()}`,
  description: `Replace Map`,
  execute: () => newMap,
  undo: () => oldMap
});

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

  // Command History Stacks
  pastCommands: Command[];
  futureCommands: Command[];

  // Legacy fields for backward compatibility with disabled buttons
  history: any[];
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

  // History / Command Actions
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;

  // Semantic mutations that auto-trigger command history
  addWall: (wall: Omit<WallSegment, 'id'>, skipHistory?: boolean) => void;
  removeWall: (id: string) => void;
  updateWall: (id: string, updates: Partial<WallSegment>) => void;
  addTerrain: (cell: TerrainCell, skipHistory?: boolean) => void;
  removeTerrain: (x: number, y: number, skipHistory?: boolean) => void;
  commitPaintTerrain: (changes: TerrainChange[]) => void;
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
  addRoom: (minX: number, minY: number, maxX: number, maxY: number, terrainType: string, wallType: 'wall' | 'door' | 'secret-door' | 'none') => void;
  clearMap: () => void;
  loadMapData: (data: any) => void;
}

export const useEditorStore = create<EditorState>((set, get) => {
  const initialMap = createDefaultMap();
  
  const updateCompatibilityHistory = (past: Command[], future: Command[]) => {
    set({
      historyIndex: past.length,
      history: new Array(past.length + future.length + 1)
    });
  };

  return {
    map: initialMap,
    viewport: { zoom: 1, panX: 0, panY: 0 },
    activeTool: 'pan',
    selectedLayerId: 'walls_doors',
    selection: { ids: [], type: null },
    activeThemeId: 'dungeon',

    selectedStampIndex: null,
    selectedStampCategory: 'Props',
    selectedWallType: 'wall',
    selectedTerrainType: 'stone',

    coverAttacker: null,
    coverTarget: null,

    pastCommands: [],
    futureCommands: [],
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

      if (skipHistory) {
        set({ map: updatedMap });
      } else {
        const replaceCmd = createReplaceMapCommand(get().map, updatedMap);
        get().executeCommand(replaceCmd);
      }
    },

    updateMapDimensions: (width, height) => {
      const currentMap = get().map;
      get().executeCommand(createUpdateMapDimensionsCommand(
        currentMap.dimensions.width,
        currentMap.dimensions.height,
        width,
        height
      ));
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

    executeCommand: (command) => {
      const { map, pastCommands } = get();
      const updatedMap = command.execute(map);
      const nowStr = new Date().toISOString();
      const finalMap = {
        ...updatedMap,
        metadata: {
          ...updatedMap.metadata,
          updatedAt: nowStr
        }
      };

      const newPast = [...pastCommands, command];
      const newFuture: Command[] = [];

      set({
        map: finalMap,
        pastCommands: newPast,
        futureCommands: newFuture
      });
      updateCompatibilityHistory(newPast, newFuture);
    },

    undo: () => {
      const { map, pastCommands, futureCommands } = get();
      if (pastCommands.length === 0) return;

      const lastCommand = pastCommands[pastCommands.length - 1];
      const revertedMap = lastCommand.undo(map);

      const newPast = pastCommands.slice(0, -1);
      const newFuture = [lastCommand, ...futureCommands];

      set({
        map: revertedMap,
        pastCommands: newPast,
        futureCommands: newFuture
      });
      updateCompatibilityHistory(newPast, newFuture);
    },

    redo: () => {
      const { map, pastCommands, futureCommands } = get();
      if (futureCommands.length === 0) return;

      const nextCommand = futureCommands[0];
      const reexecutedMap = nextCommand.execute(map);

      const newPast = [...pastCommands, nextCommand];
      const newFuture = futureCommands.slice(1);

      set({
        map: reexecutedMap,
        pastCommands: newPast,
        futureCommands: newFuture
      });
      updateCompatibilityHistory(newPast, newFuture);
    },

    addWall: (wall, skipHistory = false) => {
      const currentMap = get().map;
      
      // Boundary check to ensure walls stay within the map limits
      if (wall.orientation === 'horizontal') {
        if (wall.x < 0 || wall.x >= currentMap.dimensions.width || wall.y < 0 || wall.y > currentMap.dimensions.height) {
          return;
        }
      } else {
        if (wall.x < 0 || wall.x > currentMap.dimensions.width || wall.y < 0 || wall.y >= currentMap.dimensions.height) {
          return;
        }
      }

      // Prevent duplicates in the same coordinate/orientation
      const exists = currentMap.walls.some(
        (w) => w.x === wall.x && w.y === wall.y && w.orientation === wall.orientation
      );
      if (exists) return;

      const id = `wall-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const fullWall = { ...wall, id };

      if (skipHistory) {
        set({
          map: { ...currentMap, walls: [...currentMap.walls, fullWall] }
        });
      } else {
        get().executeCommand(createAddWallCommand(fullWall));
      }
    },

    removeWall: (id) => {
      const currentMap = get().map;
      const wall = currentMap.walls.find((w) => w.id === id);
      if (!wall) return;
      get().executeCommand(createRemoveWallCommand(wall));
    },

    updateWall: (id, updates) => {
      const currentMap = get().map;
      const wall = currentMap.walls.find((w) => w.id === id);
      if (!wall) return;
      const oldUpdates: Partial<WallSegment> = {};
      Object.keys(updates).forEach((key) => {
        (oldUpdates as any)[key] = (wall as any)[key];
      });
      get().executeCommand(createUpdateWallCommand(id, oldUpdates, updates));
    },

    addTerrain: (cell, skipHistory = false) => {
      const currentMap = get().map;
      const filtered = currentMap.terrain.filter((t) => !(t.x === cell.x && t.y === cell.y));
      const updatedMap = {
        ...currentMap,
        terrain: [...filtered, cell]
      };
      if (skipHistory) {
        set({ map: updatedMap });
      } else {
        const existing = currentMap.terrain.find((t) => t.x === cell.x && t.y === cell.y);
        get().executeCommand(createPaintTerrainCommand([{
          x: cell.x,
          y: cell.y,
          oldType: existing?.type,
          newType: cell.type
        }]));
      }
    },

    removeTerrain: (x, y, skipHistory = false) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        terrain: currentMap.terrain.filter((t) => !(t.x === x && t.y === y))
      };
      if (skipHistory) {
        set({ map: updatedMap });
      } else {
        const existing = currentMap.terrain.find((t) => t.x === x && t.y === y);
        if (existing) {
          get().executeCommand(createPaintTerrainCommand([{
            x,
            y,
            oldType: existing.type,
            newType: undefined
          }]));
        }
      }
    },

    commitPaintTerrain: (changes) => {
      if (changes.length === 0) return;
      get().executeCommand(createPaintTerrainCommand(changes));
    },

    addObject: (obj) => {
      const id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const fullObj = { ...obj, id };
      get().executeCommand(createAddObjectCommand(fullObj));
    },

    updateObject: (id, updates) => {
      const currentMap = get().map;
      const obj = currentMap.objects.find((o) => o.id === id);
      if (!obj) return;
      const oldUpdates: Partial<MapObject> = {};
      Object.keys(updates).forEach((key) => {
        (oldUpdates as any)[key] = (obj as any)[key];
      });
      get().executeCommand(createUpdateObjectCommand(id, oldUpdates, updates));
    },

    removeObject: (id) => {
      const currentMap = get().map;
      const obj = currentMap.objects.find((o) => o.id === id);
      if (!obj) return;
      get().executeCommand(createRemoveObjectCommand(obj));
    },

    addToken: (token) => {
      const id = `tok-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const fullToken = { ...token, id };
      get().executeCommand(createAddTokenCommand(fullToken));
    },

    updateToken: (id, updates) => {
      const currentMap = get().map;
      const token = currentMap.tokens.find((t) => t.id === id);
      if (!token) return;
      const oldUpdates: Partial<MapToken> = {};
      Object.keys(updates).forEach((key) => {
        (oldUpdates as any)[key] = (token as any)[key];
      });
      get().executeCommand(createUpdateTokenCommand(id, oldUpdates, updates));
    },

    removeToken: (id) => {
      const currentMap = get().map;
      const token = currentMap.tokens.find((t) => t.id === id);
      if (!token) return;
      get().executeCommand(createRemoveTokenCommand(token));
    },

    addLabel: (label) => {
      const id = `lbl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const fullLabel = { ...label, id };
      get().executeCommand(createAddLabelCommand(fullLabel));
    },

    removeLabel: (id) => {
      const currentMap = get().map;
      const label = currentMap.labels.find((l) => l.id === id);
      if (!label) return;
      get().executeCommand(createRemoveLabelCommand(label));
    },

    addMarker: (marker) => {
      const id = `mrk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const fullMarker = { ...marker, id };
      get().executeCommand(createAddMarkerCommand(fullMarker));
    },

    removeMarker: (id) => {
      const currentMap = get().map;
      const marker = currentMap.markers.find((m) => m.id === id);
      if (!marker) return;
      get().executeCommand(createRemoveMarkerCommand(marker));
    },

    toggleLayerVisibility: (layerId) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        layers: currentMap.layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
      };
      get().setMap(updatedMap, true); // Visual adjustment, bypass history
    },

    toggleLayerLock: (layerId) => {
      const currentMap = get().map;
      const updatedMap = {
        ...currentMap,
        layers: currentMap.layers.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l))
      };
      get().setMap(updatedMap, true);
    },

    addRoom: (minX, minY, maxX, maxY, terrainType, wallType) => {
      const currentMap = get().map;

      // 1. Build new terrain cells
      const newTerrain = [...currentMap.terrain];
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const index = newTerrain.findIndex((t) => t.x === x && t.y === y);
          if (index !== -1) {
            newTerrain[index] = { x, y, type: terrainType };
          } else {
            newTerrain.push({ x, y, type: terrainType });
          }
        }
      }

      // 2. Build new walls around perimeter
      const newWalls = [...currentMap.walls];

      if (wallType !== 'none') {
        const addWallHelper = (x: number, y: number, orientation: 'horizontal' | 'vertical') => {
          if (orientation === 'horizontal') {
            if (x < 0 || x >= currentMap.dimensions.width || y < 0 || y > currentMap.dimensions.height) return;
          } else {
            if (x < 0 || x > currentMap.dimensions.width || y < 0 || y >= currentMap.dimensions.height) return;
          }

          const exists = newWalls.some((w) => w.x === x && w.y === y && w.orientation === orientation);
          if (exists) return;

          const id = `wall-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${Math.floor(Math.random() * 1000)}`;
          newWalls.push({
            id,
            x,
            y,
            orientation,
            type: wallType,
            doorState: wallType === 'door' || wallType === 'secret-door' ? 'closed' : undefined
          });
        };

        // Top & Bottom horizontal walls
        for (let x = minX; x <= maxX; x++) {
          addWallHelper(x, minY, 'horizontal');
          addWallHelper(x, maxY + 1, 'horizontal');
        }

        // Left & Right vertical walls
        for (let y = minY; y <= maxY; y++) {
          addWallHelper(minX, y, 'vertical');
          addWallHelper(maxX + 1, y, 'vertical');
        }
      }

      const roomCmd = createAddRoomCommand(
        minX, minY, maxX, maxY,
        terrainType, wallType,
        currentMap.terrain, currentMap.walls,
        newTerrain, newWalls
      );
      get().executeCommand(roomCmd);
    },

    clearMap: () => {
      const defaultMap = createDefaultMap();
      set({
        map: defaultMap,
        selection: { ids: [], type: null },
        coverAttacker: null,
        coverTarget: null,
        pastCommands: [],
        futureCommands: []
      });
      updateCompatibilityHistory([], []);
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

      set({
        map: parsedMap,
        pastCommands: [],
        futureCommands: []
      });
      updateCompatibilityHistory([], []);
    }
  };
});
