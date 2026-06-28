import { MapMarker, MapData } from "../types";

interface FandomCategory {
  id: string;
  name: string;
  color: string;
}

interface FandomMarker {
  id: string;
  categoryId: string;
  position: [number, number];
  popup: {
    title: string;
    description?: string;
    link?: { url: string; label: string };
    image?: string;
  };
}

interface FandomMapData {
  mapImage: string;
  mapBounds: [[number, number], [number, number]];
  categories: FandomCategory[];
  markers: FandomMarker[];
}

/**
 * Transforms a Fandom Wiki Map Export (JSON) into our Atlas format.
 */
export function transformWikiJson(
  jsonData: any, 
  context: { region?: string; subRegion?: string; location?: string }
): MapMarker[] {
  const data = jsonData as FandomMapData;
  
  if (!data.markers) return [];

  return data.markers.map(m => {
    // Fandom uses [x, y], we use [lat, lng] which is [y, x]
    // Also, we might need to normalize based on bounds if they differ significantly
    const position: [number, number] = [m.position[0], m.position[1]];

    return {
      id: `wiki-${m.id}-${Date.now()}`,
      categoryId: WIKI_CATEGORY_MAP[m.categoryId] || m.categoryId, 
      position: position,
      popup: {
        title: m.popup.title,
        description: m.popup.description || ""
      },
      type: 'marker',
      region: context.region,
      subRegion: context.subRegion,
      location: context.location,
      source: 'wiki_import'
    };
  });
}

/**
 * Maps Fandom category IDs to our internal categories
 * Note: This can be expanded as we find more wiki maps
 */
export const WIKI_CATEGORY_MAP: Record<string, string> = {
  "1": "1", // Districts -> Cities/Towns
  "5": "5", // Temples -> Peaks/Hills (Needs proper mapping)
  "6": "4", // Landmarks -> POIs
  "7": "4", // Shops -> POIs
  "8": "4", // POIs -> POIs
  "9": "2", // Taverns -> POIs
  "12": "2", // Inns -> POIs
  "11": "4", // Gates -> POIs
  "14": "17", // Streets -> Roads
  "16": "9",  // Docks -> Water
};
