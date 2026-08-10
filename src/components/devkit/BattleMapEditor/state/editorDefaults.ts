import { BattleMap, MapLayer } from '../types/battleMap';

export const DEFAULT_LAYERS: MapLayer[] = [
  { id: 'background', name: 'Background', visible: true, locked: false, opacity: 1, zIndex: 0 },
  { id: 'terrain', name: 'Terrain', visible: true, locked: false, opacity: 1, zIndex: 1 },
  { id: 'walls_doors', name: 'Walls & Doors', visible: true, locked: false, opacity: 1, zIndex: 2 },
  { id: 'objects', name: 'Objects', visible: true, locked: false, opacity: 1, zIndex: 3 },
  { id: 'tokens', name: 'Tokens', visible: true, locked: false, opacity: 1, zIndex: 4 },
  { id: 'labels_markers', name: 'Labels & Markers', visible: true, locked: false, opacity: 1, zIndex: 5 },
  { id: 'fog', name: 'Fog of War', visible: true, locked: false, opacity: 0.6, zIndex: 6 }
];

export const createDefaultMap = (width = 16, height = 12): BattleMap => {
  const id = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    version: 1,
    id,
    name: 'Untitled Battle Map',
    metadata: {
      description: 'A custom tactical arena crafted in Artificer DevKit.',
      author: 'Dungeon Master',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: 'dungeon'
    },
    dimensions: {
      width,
      height
    },
    grid: {
      type: 'square',
      cellSize: 40,
      unit: 'ft',
      scale: 5,
      visible: true,
      snap: true,
      lineWidth: 1,
      color: '#ffffff',
      opacity: 0.15
    },
    background: {
      type: 'color',
      value: '#151515',
      opacity: 1
    },
    terrain: [],
    walls: [],
    objects: [],
    tokens: [],
    labels: [],
    markers: [],
    fogOfWar: {
      hidden: [],
      revealed: [],
      explored: []
    },
    layers: DEFAULT_LAYERS
  };
};

export const ENVIRONMENT_THEMES = [
  { id: 'dungeon', name: 'Dungeon Crypt', bgColor: '#151515', gridColor: '#ffffff', gridOpacity: 0.15 },
  { id: 'forest', name: 'Fey Forest', bgColor: '#0f1c13', gridColor: '#a1e3a1', gridOpacity: 0.15 },
  { id: 'tundra', name: 'Frozen Tundra', bgColor: '#1a2436', gridColor: '#80b3ff', gridOpacity: 0.15 },
  { id: 'ruins', name: 'Temple Ruins', bgColor: '#2c251e', gridColor: '#e0cda9', gridOpacity: 0.15 }
];
