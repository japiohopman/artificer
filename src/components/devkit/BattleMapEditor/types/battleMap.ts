export type WallSegmentType = 'wall' | 'door' | 'secret-door';
export type DoorState = 'open' | 'closed' | 'locked';

export type EdgeOrientation = 'horizontal' | 'vertical';
export type EdgeType = 'wall' | 'low-wall' | 'door' | 'secret-door';

export interface MapEdge {
  id: string; // Deterministic ID: "h:x,y" or "v:x,y"
  orientation: EdgeOrientation;
  x: number;
  y: number;
  type: EdgeType;
  doorState?: DoorState;
}

export interface WallSegment {
  id: string;
  orientation: 'horizontal' | 'vertical';
  x: number;
  y: number;
  type: WallSegmentType;
  doorState?: DoorState;
}

export type HazardCategory = 'surface' | 'cloud' | 'pit' | 'trap';

export interface CellHazard {
  id: string;
  category: HazardCategory;
  type: string; // e.g., 'fire', 'grease', 'acid', 'poison', 'ice', 'web', 'pit', 'spike'
  damageType?: string; // Canonical damage type: 'fire', 'acid', 'poison', 'piercing', 'cold'
  trigger?: 'on-enter' | 'on-turn-start' | 'on-turn-end';
}

export interface TerrainCell {
  x: number;
  y: number;
  type: string; // e.g., 'stone', 'wood', 'water', 'grass', 'sand', 'lava', 'ice', 'mud'
  elevation?: number; // Visual / spatial floor elevation (0 = base floor, -1 = pit, +1 = platform)
  movementCost?: number; // Optional explicit traversal cost multiplier (1 = normal; difficult terrain resolved by ruleset)
  hazards?: CellHazard[]; // Structured environmental hazard descriptors
}

export interface MapPortal {
  id: string;
  type: 'entrance' | 'exit';
  name: string;
  x: number;
  y: number;
  facing?: 'north' | 'east' | 'south' | 'west';
  description?: string;
}

export interface MapObject {
  id: string;
  name: string;
  index: string; // SKU or asset identifier
  assetUrl?: string;
  x: number; // grid or precise canvas coordinates
  y: number;
  rotation: number; // in degrees
  scale: number;
  layerId: string;
  isLocked: boolean;
  hasShadow: boolean;
}

export interface MapToken {
  id: string;
  name: string;
  index?: string; // Links to Atlas monster/NPC data
  type: 'player' | 'npc' | 'enemy' | 'neutral' | 'marker';
  x: number;
  y: number;
  size: 'Medium' | 'Large';
  imageUrl?: string;
}

export interface MapLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
  alignment: 'left' | 'center' | 'right';
  hasShadow?: boolean;
}

export interface MapMarker {
  id: string;
  type: 'entrance' | 'exit' | 'encounter' | 'trap' | 'clue';
  x: number;
  y: number;
  name: string;
  description?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
}

export interface FogDefinition {
  // Store coordinate keys of hidden/revealed/explored cells
  hidden: string[];   // "x,y"
  revealed: string[]; // "x,y"
  explored: string[]; // "x,y"
}

export interface BattleMap {
  version: 1 | 2;
  id: string;
  name: string;
  metadata: {
    description?: string;
    author?: string;
    createdAt: string;
    updatedAt: string;
    theme?: string;
    recommendedLevel?: string;
    environment?: string;
  };
  dimensions: {
    width: number;
    height: number;
  };
  grid: {
    type: 'square' | 'hex' | 'none';
    cellSize: number; // visual pixels per cell in defaults, usually 40 or 42
    unit: 'ft' | 'm';
    scale: number; // e.g. 5, 10, 15 ft per cell
    visible: boolean;
    snap: boolean;
    lineWidth?: number;
    color?: string;
    opacity?: number;
  };
  background: {
    type: 'color' | 'texture' | 'image';
    value: string; // color code, texture name or image URL
    opacity: number;
  };
  terrain: TerrainCell[];
  edges?: MapEdge[]; // Canonical v2 directional boundary spines
  walls: WallSegment[]; // Legacy v1 boundary segments for backward compatibility
  portals?: MapPortal[]; // Canonical v2 entrance and exit portals
  objects: MapObject[];
  tokens: MapToken[];
  labels: MapLabel[];
  markers: MapMarker[];
  fogOfWar?: FogDefinition;
  layers: MapLayer[];
}

export interface BattleMapV2 extends BattleMap {
  version: 2;
  edges: MapEdge[];
  portals: MapPortal[];
}

export type EditorTool =
  | 'select'
  | 'pan'
  | 'wall'
  | 'door'
  | 'room'
  | 'terrain'
  | 'object'
  | 'token'
  | 'measure'
  | 'text'
  | 'eraser';

export interface EditorSelection {
  ids: string[];
  type: 'cell' | 'wall' | 'door' | 'object' | 'token' | 'room' | 'label' | 'marker' | null;
}
