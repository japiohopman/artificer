export interface MapMarker {
  id: string;
  categoryId: string;
  position: [number, number]; // [x, y]
  popup: {
    title: string;
    description: string;
    link?: {
      url: string;
      label: string;
    };
    image?: string;
  };
  config?: {
    hiddenCategories?: string[];
  };
  biome?: 'arctic' | 'coast' | 'desert' | 'forest' | 'grassland' | 'mountain' | 'swamp';
  layer?: string;
  type?: 'marker' | 'path' | 'area';
  path?: [number, number][]; // For roads or regions
  polygon?: { x: number; y: number }[]; // For specialized area shapes (like forests)
  source?: string; // e.g. cities.json, forest.json
  subMapId?: string; // Reference to a city map ID
  
  // Hierarchical Pathing
  region?: string;    // e.g. west_faerun_sword_coast
  subRegion?: string; // e.g. sword_coast
  location?: string;  // e.g. baldurs_gate
  mapLevel?: 'world' | 'region' | 'subregion' | 'location';
  // Intelligence Fields
  geography?: string;
  history?: string;
  government?: string;
  organizations?: string;
  wikiSlug?: string;
  wiki?: string; // Long form lore content
  submapUrl?: string; // Explicit submap image link
  locationUrl?: string; // Explicit link to location.json data
  
  // City/Location specific fields
  banner?: string;
  thumbnail?: string;
  image?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  sub_location_files?: string[];
  map?: string; // Inner submap image path
  unitsPerMile?: number;
  isGlobal?: boolean;
}

export interface MapData {
  id?: string;
  mapImage: string;
  markers: MapMarker[];
  bounds: [[number, number], [number, number]];
  categories: MapCategory[];
  
  // Contextual metadata
  level?: 'world' | 'region' | 'subregion' | 'location';
  parentMapId?: string;
  // Detail fields
  geography?: string;
  history?: string;
  government?: string;
  organizations?: string;
  unitsPerMile?: number;
}

export interface MapCategory {
  id: string;
  listId: number;
  name: string;
  color: string;
  symbol: string;
  symbolColor: string;
  icon?: string;
}

export interface FaerunData {
  mapImage: string;
  coordinateOrder: "xy" | "yx";
  mapBounds: [[number, number], [number, number]];
  origin: "bottom-left" | "top-left";
  unitsPerMile?: number;
  categories: MapCategory[];
  markers: MapMarker[];
}
