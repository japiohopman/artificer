/**
 * Path Utilities for Hierarchical Map Resolution
 * Strategy: toril/faerun/[region]/[subregion]/[location]/...
 */

export const toSlug = (str: string): string => {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/'/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '');
};

const BASE_GITHUB_RAW = "https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/world/toril/faerun";
const BASE_UNDERDARK = "https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/world/toril/faerun/underdark";
const BASE_REPO_ROOT = "https://raw.githubusercontent.com/japiohopman/artificer/main";

export const resolveRemoteAsset = (path: string, citySlug?: string): string => {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  
  // Clean "File:" and leading slash
  let p = path;
  if (p.startsWith('File:')) p = p.substring(5);
  if (p.startsWith('/')) p = p.substring(1);
  
  // Final result
  let result = "";
  if (p.startsWith('public/') || p.startsWith('assets/')) {
    const final = p.startsWith('public/') ? p : `public/${p}`;
    result = `${BASE_REPO_ROOT}/${final}`;
  } else if (citySlug) {
    result = `${BASE_GITHUB_RAW}/cities/${citySlug}/${p}`;
  } else {
    result = `${BASE_GITHUB_RAW}/${p}`;
  }

  // Handle encoding spaces and special chars (but not protocol/slashes)
  const parts = result.split('/');
  return parts.map((part, i) => i < 3 ? part : encodeURIComponent(part)).join('/');
};

interface PathContext {
  region?: string;
  subRegion?: string;
  location?: string;
  categoryId?: string;
  layer?: string; // For things like "sewers"
}

/**
 * Resolves a full remote path for a map image based on the hierarchy.
 */
export const resolveMapPath = (context: PathContext): string => {
  const { region, subRegion, location, categoryId, layer } = context;
  
  if (categoryId === 'cities' && (location || subRegion || region)) {
    const cityName = toSlug(location || subRegion || region || "");
    const suffix = layer && layer !== 'surface' ? `_${layer}` : '';
    return `${BASE_GITHUB_RAW}/cities/${cityName}/${cityName}_map${suffix}.webp`;
  }

  if ((categoryId === 'mountains' || categoryId === 'hills_mountains') && (location || subRegion || region)) {
    const mountainName = toSlug(location || subRegion || region || "");
    return `${BASE_GITHUB_RAW}/mountains/${mountainName}/${mountainName}_map.webp`;
  }

  if (categoryId === 'forest' && (location || subRegion || region)) {
    const forestName = toSlug(location || subRegion || region || "");
    return `${BASE_GITHUB_RAW}/forest/${forestName}/${forestName}_map.webp`;
  }
  
  let path = BASE_GITHUB_RAW;
  if (subRegion) return `${path}/sub_regions/${toSlug(subRegion)}/${toSlug(subRegion)}_map.webp`;
  if (region) return `${path}/regions/${toSlug(region)}/${toSlug(region)}_map.webp`;
  
  return `${path}/faerun.webp`;
};

/**
 * Resolves the path to the main JSON intelligence data for a map level.
 */
export const resolveDataPath = (context: PathContext, overrideUrl?: string): string => {
  if (overrideUrl) return overrideUrl;
  
  const { region, subRegion, location, categoryId, layer } = context;
  const path = layer === 'underdark' ? BASE_UNDERDARK : BASE_GITHUB_RAW; 
  
  // Special case for cities
  if (categoryId === 'cities' && (location || subRegion || region)) {
    const cityName = toSlug(location || subRegion || region || "");
    return `${path}/cities/${cityName}/${cityName}.json`;
  }

  // Special case for mountains
  if ((categoryId === 'mountains' || categoryId === 'hills_mountains') && (location || subRegion || region)) {
    const mountainName = toSlug(location || subRegion || region || "");
    return `${path}/mountains/${mountainName}/${mountainName}.json`;
  }

  // Special case for forests
  if (categoryId === 'forest' && (location || subRegion || region)) {
    const forestName = toSlug(location || subRegion || region || "");
    return `${path}/forest/${forestName}/${forestName}.json`;
  }
  
  const r = region ? toSlug(region) : "";
  const s = subRegion ? toSlug(subRegion) : "";

  if (s) return `${path}/sub_regions/${s}/${s}.json`;
  if (r) return `${path}/regions/${r}/${r}.json`;
  
  if (layer === 'underdark' && !region && !subRegion) {
    return `${BASE_UNDERDARK}/underdark.json`;
  }
  
  if (!region && !subRegion && (layer === 'surface' || !layer)) {
    return `https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/world/toril/toril.json`;
  }
  
  return layer === 'underdark' ? `${BASE_UNDERDARK}/underdark.json` : `${BASE_GITHUB_RAW}/faerun.json`;
};

/**
 * Resolves a path relative to the REPOSITORY ROOT (for writing/baking).
 */
export const resolveRepoPath = (context: PathContext, id: string): string => {
  const { region, subRegion, location, categoryId } = context;
  const parts = ["public", "assets", "atlas", "world", "toril", "faerun"];

  if (categoryId === 'cities') {
    return `${parts.join("/")}/cities/${id}/${id}.json`;
  }

  if (categoryId === 'mountains' || categoryId === 'hills_mountains') {
    return `${parts.join("/")}/mountains/${id}/${id}.json`;
  }

  if (location) {
     // If it's a specific location but we don't have categoryId (rare), 
     // we might need more logic or just default.
  }

  if (subRegion) return `${parts.join("/")}/sub_regions/${subRegion}/${subRegion}.json`;
  if (region) return `${parts.join("/")}/regions/${region}/${region}.json`;

  return `${parts.join("/")}/faerun.json`;
};

/**
 * Resolves the path to a global category data file (e.g. cities.json)
 */
export const resolveGlobalDataPath = (fileName: string): string => {
  const cleanPath = fileName.startsWith('/') ? fileName.substring(1) : fileName;
  return `${BASE_GITHUB_RAW}/${cleanPath}?v=${new Date().getTime()}`;
};

/**
 * Resolves a context node path for a given hierarchy level.
 */
export const resolveNodePath = (type: string, id: string, parentPath?: string, categoryId?: string): string => {
  if (type === 'world') return `https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/world/toril/toril.json`;
  if (id === 'faerun' || type === 'continent') return `${BASE_GITHUB_RAW}/faerun.json`;
  
  if (categoryId === 'cities') {
    return `${BASE_GITHUB_RAW}/cities/${id}/${id}.json`;
  }

  if (categoryId === 'mountains' || categoryId === 'hills_mountains') {
    return `${BASE_GITHUB_RAW}/mountains/${id}/${id}.json`;
  }

  if (id.includes('faerun')) {
      // Logic for regions/subregions if type tells us
      if (type === 'region') return `${BASE_GITHUB_RAW}/regions/${id}/${id}.json`;
      if (type === 'subregion') return `${BASE_GITHUB_RAW}/sub_regions/${id}/${id}.json`;
  }
  
  return `${BASE_GITHUB_RAW}/${id}/${id}.json`;
};

/**
 * Resolves a path for sublocation data (e.g. inns.json)
 */
export const resolveSublocationPath = (context: PathContext, dataName: string): string => {
  const { region, subRegion, location, categoryId } = context;
  const cityName = toSlug(location || subRegion || region || "");
  
  if (categoryId === 'cities') {
    return `${BASE_GITHUB_RAW}/cities/${cityName}/${dataName}.json`;
  }
  
  if (categoryId === 'mountains' || categoryId === 'hills_mountains') {
    return `${BASE_GITHUB_RAW}/mountains/${cityName}/${dataName}.json`;
  }

  return `${BASE_GITHUB_RAW}/${dataName}.json`;
};

