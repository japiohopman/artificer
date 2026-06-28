/// <reference types="vite/client" />
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import FaerunMap from "./components/Map/FaerunMap";
import { REGION_METADATA } from "./data/regions";
import NodeEditor from "./components/Editor/NodeEditor";
import { FAERUN_DATA } from "./data/faerun";
import { FaerunData, MapMarker, MapData } from "./types";
import { useTravel } from "./hooks/useTravel";
import { useAtlasStore } from "./store/useAtlasStore";
import { DevKitOverlay } from "./components/devkit/DevKitOverlay";
import { LocationMapView } from "./components/Map/LocationMapView";
import { resolveMapPath, resolveDataPath, resolveGlobalDataPath, resolveSublocationPath, resolveRepoPath, toSlug, resolveRemoteAsset } from "./lib/pathUtils";
import { CityImportDialog } from "./components/Editor/CityImportDialog";
import { GameIcon, GameIconName } from "./game_icons";
import WorldExplorer from "./components/Explorer/WorldExplorer";
import { IntelPanel } from "./components/Explorer/IntelPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GithubService, GithubConfig } from "./services/githubService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Legend, { ATlAS_CATEGORIES, CITY_CATEGORIES, CITY_CATEGORIES_LIST, LegendCategory } from "./components/Map/Legend";

const WORLD_BOUNDS: [[number, number], [number, number]] = [[0, 0], [3185, 4763]];

const mapCategoryId = (id: string | number): string => {
  if (!id) return "poi";
  const strId = String(id).toLowerCase().trim();
  const mapping: Record<string, string> = {
    // Fandom IDs (Global & Athkatla specific)
    "1": "districts", 
    "2": "roads",
    "3": "landmarks",
    "4": "inns",
    "5": "shops", 
    "6": "estates", 
    "7": "points_of_interest", 
    "8": "temples_shrines",
    "9": "water", 
    "10": "estates", 
    "11": "gates",
    "12": "taverns_eateries", 
    "13": "geographical", 
    "14": "roads", 
    "15": "water", 
    "16": "docks",
    // Friendly Names (Slugified)
    "districts": "districts",
    "district": "districts",
    "temples": "temples_shrines",
    "temples_shrines": "temples_shrines",
    "landmarks": "landmarks",
    "shops": "shops",
    "inns": "inns",
    "taverns": "taverns_eateries",
    "taverns_eateries": "taverns_eateries",
    "inns_taverns": "inns",
    "estates": "estates",
    "gates": "gates",
    "roads": "roads",
    "water": "water",
    "docks": "docks",
    "poi": "points_of_interest",
    "points_of_interest": "points_of_interest",
    "sewers": "sewers",
    "dungeons": "dungeons",
    "government": "government",
    "geographical": "geographical",
  };
  return mapping[strId] || strId || "poi";
};

const transformMarker = (m: any, idx: number): MapMarker => {
  const getCoord = (obj: any, keys: string[]) => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        const val = Number(obj[key]);
        if (!isNaN(val)) return val;
      }
    }
    return NaN;
  };

  let x = getCoord(m, ['x', 'lng', 'lon']) ;
  let y = getCoord(m, ['y', 'lat']) ;

  if (isNaN(x) && Array.isArray(m.position)) {
    x = Number(m.position[0]);
    y = Number(m.position[1]);
  }
  
  const title = m.title || m.popup?.title || "Unknown Signal";
  const description = m.description || m.popup?.description || "";
  const wikiSlug = m.wikiSlug || m.popup?.link?.url?.split('/').pop();

  let lat = y;
  let lng = x;
  const b = WORLD_BOUNDS;
  const bWidth = b[1][1] - b[0][1];
  const bHeight = b[1][0] - b[0][0];

  // Detect normalized coords on world map
  if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
    lng = b[0][1] + (x / 100) * bWidth;
    lat = b[0][0] + (y / 100) * bHeight;
  }

  let locationUrl = m.locationUrl || m.location_url || m.url;
  if (!locationUrl && m.popup?.link?.url) {
    locationUrl = resolveRemoteAsset(m.popup.link.url);
  }
  
  if (locationUrl && !locationUrl.startsWith('http')) {
    // Global markers (like cities.json) don't have a specific city prefix needed
    locationUrl = resolveRemoteAsset(locationUrl);
  }
  
  if (locationUrl && !locationUrl.endsWith('.json') && !locationUrl.includes('#') && mapCategoryId(m.categoryId) === 'cities') {
    const parts = locationUrl.split('/');
    const originalName = parts[parts.length - 1];
    const slug = toSlug(originalName);
    
    if (!locationUrl.includes('/cities/')) {
       const baseUrl = locationUrl.substring(0, locationUrl.lastIndexOf('/'));
       locationUrl = `${baseUrl}/cities/${slug}/${slug}.json`;
    } else {
       locationUrl = `${locationUrl.substring(0, locationUrl.lastIndexOf('/'))}/${slug}/${slug}.json`;
    }
  }

  return {
    id: m.id ? `${m.id}_${idx}` : `${x}-${y}-${idx}`,
    categoryId: mapCategoryId(m.categoryId),
    isGlobal: true,
    position: [lat, lng],
    layer: m.layer || "surface",
    type: m.type || (m.path ? "area" : "marker"),
    path: m.path?.map((p: any) => [Number(p[0]), Number(p[1])]),
    source: m.source,
    geography: m.geography,
    history: m.history,
    wikiSlug: wikiSlug,
    submapUrl: m.submapUrl || m.submap,
    locationUrl: locationUrl,
    region: m.region ? toSlug(m.region) : undefined,
    subRegion: m.subRegion ? toSlug(m.subRegion) : undefined,
    location: m.location ? toSlug(m.location) : (mapCategoryId(m.categoryId) === 'cities' ? toSlug(title) : undefined),
    subMapId: m.subMapId ? toSlug(m.subMapId) : (mapCategoryId(m.categoryId) === 'cities' ? toSlug(title) : undefined),
    popup: {
      title,
      description
    }
  } as MapMarker;
};

const CATEGORY_FILE_MAP: Record<string, string> = {
  cities: "cities/cities.json",
  deserts_wastelands: "deserts_wastelands/deserts_wastelands.json",
  forests: "forest/forest.json",
  fortresses_keeps: "fortresses_keeps/fortresses_keeps.json",
  glaciers_tundras: "glaciers_tundras/glaciers_tundras.json",
  hills_mountains: "mountains/mountain.json",
  mountains: "mountains/mountain.json",
  islands: "islands/islands.json",
  oases: "oases/oases.json",
  peaks_cliffs: "peaks_cliffs/peaks_cliffs.json",
  plains_grasslands: "plains_grasslands/plains_grasslands.json",
  poi: "poi/poi.json",
  roads_trails: "roads_trails/roads_trails.json",
  ruins: "ruins/ruins.json",
  towns_settlements: "towns_settlements/towns_settlements.json",
  water: "water/water.json",
  wetlands: "wetlands/wetlands.json"
};

export default function App() {
  const { 
    currentHierarchy, 
    currentMapId, 
    githubConfig,
    isDevKitOpen,
    isEditMode,
    isPlacementMode,
    isPickingCoordinate,
    stagedChanges,
    setDevKitOpen,
    setEditMode,
    setPickingCoordinate,
    setMapId,
    setHierarchy,
    resetHierarchy,
    stageChange,
    time,
    layer,
    setTime,
    setLayer,
    mapScales,
    setScale
  } = useAtlasStore();

  const [data, setData] = useState<FaerunData>(() => {
    return {
      ...FAERUN_DATA,
      mapImage: resolveRemoteAsset(FAERUN_DATA.mapImage),
      markers: FAERUN_DATA.markers.map(m => ({
        ...m,
        isGlobal: true,
        position: [m.position[1], m.position[0]] as [number, number]
      }))
    };
  });
  const [activeSegmentData, setActiveSegmentData] = useState<Partial<MapMarker>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [navHistory, setNavHistory] = useState<{ id: string; hierarchy: any }[]>([]);
  
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mouseCoords, setMouseCoords] = useState<[number, number] | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isCityImporterOpen, setIsCityImporterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(["cities", "references", "towns_settlements", "poi"]);
  const [loadedCategories, setLoadedCategories] = useState<string[]>([]);
  const [dynamicMarkers, setDynamicMarkers] = useState<MapMarker[]>([]);
  const [biomeFilter, setBiomeFilter] = useState<string | null>(null);
  
  const categoriesBeingFetched = useRef<Set<string>>(new Set());

  const repairJson = (text: string) => {
    if (!text || text.trim() === "") return null;
    try {
      return JSON.parse(text);
    } catch (e: any) {
      console.warn("Attempting JSON repair...", e.message);
      let repaired = text;
      try {
        // Robust cleanup for human-edited or truncated JSON
        repaired = text
          .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1') // Remove comments
          .replace(/}\s*(\r?\n?)\s*{/g, '},$1{')             // Add missing commas between objects
          .replace(/]\s*(\r?\n?)\s*\[/g, '],$1[')             // Add missing commas between arrays
          // Aggressive trailing comma removal (including multi-line)
          .replace(/,[\s\r\n\t]*([\]}])/g, '$1')
          .replace(/,[\s\r\n\t]*([\]}])/g, '$1') 
          // Detect double commas
          .replace(/,[\s\r\n\t]*,/g, ',')
          // Fix missing commas between key-value pairs on separate lines
          .replace(/([^{[,])[\s\r\n\t]*(\r?\n)[\s\r\n\t]*"/g, '$1,$2"');
        
        // Final pass for trailing commas that might have been introduced
        repaired = repaired.replace(/,[\s\r\n\t]*([\]}])/g, '$1');

        return JSON.parse(repaired);
      } catch (e2: any) {
        console.error("JSON repair failed. Original Error:", e.message, "Repair Error:", e2.message);
        
        // Attempt to log context around the failure point
        const posMatch = e2.message.match(/at position (\d+)/);
        if (posMatch) {
          const pos = parseInt(posMatch[1]);
          const start = Math.max(0, pos - 80);
          const end = Math.min(repaired.length, pos + 80);
          console.error("Context Around Failure Position (" + pos + "):", repaired.substring(start, end));
        }
        throw e;
      }
    }
  };
  
  const navigateTo = (id: string, context: { 
    region?: string; 
    subRegion?: string; 
    location?: string; 
    locationUrl?: string;
    categoryId?: string;
    targetLayer?: "surface" | "underdark" 
  } = {}) => {
    setNavHistory(prev => [...prev, { id: currentMapId, hierarchy: currentHierarchy }]);
    
    if (id !== currentMapId) {
      setSelectedMarker(null);
      if (!context.region) {
        setSelectedRegionId(null);
      }
    }

    setMapId(id);
    
    if (context.targetLayer) {
      setLayer(context.targetLayer);
    }
    
    const targetRegionId = context.subRegion || context.region;
    if (targetRegionId && REGION_METADATA[targetRegionId]) {
      setSelectedRegionId(targetRegionId);
    }
    
    const targetMarker = data.markers.find(m => m.subMapId === id || m.id === id);
    if (targetMarker && targetMarker.subMapId !== id) {
      setSelectedMarker(targetMarker);
    }

    const { targetLayer, ...hierarchy } = context;
    if (targetMarker && !hierarchy.categoryId) {
      hierarchy.categoryId = targetMarker.categoryId;
    }
    setHierarchy(hierarchy);
  };

  const handleRegionSelect = async (regionId: string) => {
    setSelectedRegionId(regionId);
    setSelectedMarker(null);
    setHierarchy({
      region: regionId,
      subRegion: undefined,
      location: undefined,
      locationUrl: undefined
    });
  };

  const navigateBack = () => {
    if (navHistory.length === 0) {
      resetHierarchy();
      return;
    }
    const last = navHistory[navHistory.length - 1];
    setNavHistory(prev => prev.slice(0, -1));
    setMapId(last.id);
    setHierarchy(last.hierarchy);
  };

  // Load Node Data when marker is selected OR when map navigation changes
  useEffect(() => {
    const loadNodeData = async () => {
      let nodePath = "";
      
      if (selectedMarker) {
        nodePath = resolveDataPath({
          region: selectedMarker.region,
          subRegion: selectedMarker.subRegion,
          location: selectedMarker.subRegion && selectedMarker.id !== selectedMarker.subRegion ? selectedMarker.id : undefined,
          categoryId: selectedMarker.categoryId
        });
      } else if (currentMapId !== "world" || currentHierarchy.region || currentHierarchy.location) {
        nodePath = resolveDataPath({
          ...currentHierarchy,
          categoryId: currentHierarchy.categoryId || (activeFilters.includes('cities') && (currentHierarchy.location || currentHierarchy.subRegion) ? 'cities' : undefined)
        });
      } else if (currentMapId === "world") {
        nodePath = resolveDataPath({});
      }

      if (!nodePath) {
        setSelectedNodeData(null);
        return;
      }
      
      try {
        const resp = await fetch(nodePath);
        if (resp.ok) {
          const nodeText = await resp.text();
          const node = repairJson(nodeText);
          const currentCitySlug = toSlug(node.id || (selectedMarker?.categoryId === 'cities' ? selectedMarker.id : currentHierarchy.location || ""));
          
          setSelectedNodeData({
            ...node,
            title: node.title || node.name,
            description: node.description || node.wiki,
            image: resolveRemoteAsset(node.image, currentCitySlug),
            banner: resolveRemoteAsset(node.banner, currentCitySlug),
            thumbnail: resolveRemoteAsset(node.thumbnail, currentCitySlug),
            map: resolveRemoteAsset(node.map, currentCitySlug)
          });
        } else if (selectedMarker) {
          setSelectedNodeData({
            title: selectedMarker.popup.title,
            description: selectedMarker.popup.description,
            wiki: selectedMarker.history || selectedMarker.geography,
            image: selectedMarker.submapUrl || "placeholder.webp",
            metadata: {
              type: selectedMarker.categoryId,
              layer: selectedMarker.layer,
              source: selectedMarker.source
            }
          });
        } else if (currentHierarchy.region && !currentHierarchy.subRegion) {
          const regionId = currentHierarchy.region;
          const metadata = REGION_METADATA[regionId];
          const regionName = metadata?.name || regionId.replace(/_/g, ' ');
          const description = metadata?.description || `Information on ${regionName} is currently being compiled from world-records.`;
          
          setSelectedNodeData({
            id: regionId,
            title: regionName,
            name: regionName,
            type: "Continental Region",
            metadata: {
              domain: "Faerûn",
              classification: "Regional Record",
            },
            description: description,
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          });
        } else {
          setSelectedNodeData(null);
        }
      } catch (e) {
        console.warn("Failed to load detailed node data:", e);
        setSelectedNodeData(null);
      }
    };

    loadNodeData();
  }, [selectedMarker, currentHierarchy, currentMapId]);

  const { route, addToRoute, clearRoute, calculateDistance, getTravelTime } = useTravel();
  const isFetchingGlobal = useRef(false);

  // Initial Global Data Loading
  useEffect(() => {
    const fetchCategory = async (catId: string) => {
      if (loadedCategories.includes(catId) || categoriesBeingFetched.current.has(catId)) return;
      
      const fileName = CATEGORY_FILE_MAP[catId];
      if (!fileName) return;

      categoriesBeingFetched.current.add(catId);
      const url = resolveGlobalDataPath(fileName);
      
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const text = await resp.text();
          const rawMarkers = repairJson(text);
          const markers = Array.isArray(rawMarkers) ? rawMarkers : (rawMarkers.markers || []);
          const transformed = (markers as any[])
            .filter(m => m !== null && typeof m === 'object')
            .map((m, idx) => transformMarker(m, idx));
          
          setData(prev => ({
            ...prev,
            markers: [...prev.markers, ...transformed]
          }));
          setLoadedCategories(prev => [...prev, catId]);
          toast.success(`Acquired ${transformed.length} ${catId} signals.`);
        }
      } catch (e) {
        console.error(`Failed to load ${catId}:`, e);
      } finally {
        categoriesBeingFetched.current.delete(catId);
      }
    };

    // Load active filters that aren't loaded yet
    if (currentMapId === 'world') {
      activeFilters.forEach(catId => {
        if (!loadedCategories.includes(catId)) {
          fetchCategory(catId);
        }
      });
    }
  }, [activeFilters, currentMapId]);

  const toggleCategory = (catId: string) => {
    setActiveFilters(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  // Load Underdark Base Data
  useEffect(() => {
    if (layer === 'underdark' && currentMapId === 'world') {
      const loadUnderdarkBase = async () => {
        const url = "/assets/atlas/world/toril/faerun/underdark/underdark.json";
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const text = await resp.text();
            const raw = repairJson(text);
            const markers = (Array.isArray(raw) ? raw : (raw.markers || []))
              .map((m: any, idx: number) => ({
                ...transformMarker(m, idx),
                layer: 'underdark',
                isGlobal: true
              }));
            
            setData(prev => {
              const existingIds = new Set(prev.markers.map(m => m.id));
              const newOnes = markers.filter((m: any) => !existingIds.has(m.id));
              if (newOnes.length === 0) return prev;
              return { ...prev, markers: [...prev.markers, ...newOnes] };
            });
          }
        } catch (e) {
          console.error("Failed to load Underdark base layer", e);
        }
      };
      loadUnderdarkBase();
    }
  }, [layer, currentMapId]);

  // Dynamic Data Loading based on Hierarchy
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadDynamicData = async () => {
      if (currentMapId === "world") return;
      
      const categoryId = currentHierarchy.categoryId || (activeFilters.includes('cities') && (currentHierarchy.location || currentHierarchy.subRegion) ? 'cities' : undefined);
      const dataUrl = resolveDataPath({ ...currentHierarchy, categoryId }, currentHierarchy.locationUrl);
      
      try {
        const response = await fetch(dataUrl, { signal });
        if (response.ok) {
          const text = await response.text();
          const fetchedData = repairJson(text);
          if (signal.aborted) return;
          let locationMetadata: any = Array.isArray(fetchedData) ? {} : { ...fetchedData };

          // Fandom normalization logic
          const coordOrder = fetchedData.coordinateOrder || "xy";
          let finalBounds = fetchedData.bounds || fetchedData.mapBounds || [[0, 0], [1000, 1000]];
          
          // Note: Automatic swapping based on coordinateOrder has been removed
          // as it often conflicts with the actual image dimensions.
          // The LocationMapView component will reconcile these using img.naturalHeight/Width.

          locationMetadata.bounds = finalBounds;
          locationMetadata.coordinateOrder = fetchedData.coordinateOrder || "xy"; 
          locationMetadata.origin = fetchedData.origin || 'bottom-left';

          if (fetchedData.mapImage && !fetchedData.map && !fetchedData.submapUrl) {
             locationMetadata.map = fetchedData.mapImage;
          }

          // Resolve relative assets
          const currentCitySlug = toSlug(
            fetchedData.id || fetchedData.name || 
            currentHierarchy.location || currentHierarchy.subRegion || currentHierarchy.region || ""
          );

          let mainMarkers = Array.isArray(fetchedData) ? fetchedData : (fetchedData.markers || []);
          
          // ... (existing forest injection logic)
          if (!Array.isArray(fetchedData) && !fetchedData.markers && (fetchedData.polygon || fetchedData.coordinates)) {
             mainMarkers = [{
               ...fetchedData,
               id: fetchedData.id || fetchedData.name?.toLowerCase().replace(/\s+/g, '_') || currentHierarchy.location
             }];
          }

          // Resolve sub-location files (if city root)
          const citySubFiles = [
            "districts.json", "docks.json", "estates.json", "gates.json", 
            "geographical.json", "inns.json", "landmarks.json", 
            "points_of_interest.json", "roads.json", "shops.json", 
            "taverns_eateries.json", "temples_shrines.json", "water.json", 
            "sewers.json", "government.json", "dungeons.json"
          ];
          
          let subFilesToLoad = fetchedData.sub_location_files && Array.isArray(fetchedData.sub_location_files) 
            ? [...fetchedData.sub_location_files] 
            : [];
            
          if (categoryId === 'cities') {
            // Merge with predefined city files if they aren't already there
            citySubFiles.forEach(f => {
              if (!subFilesToLoad.includes(f)) subFilesToLoad.push(f);
            });
          }

          if (subFilesToLoad.length > 0) {
            const subPromises = subFilesToLoad.map(async (file: string) => {
               const fileUrl = resolveRemoteAsset(file, currentCitySlug);
               if (!fileUrl) return [];
               try {
                 const res = await fetch(fileUrl, { signal });
                 if (res.ok) {
                   const t = await res.text();
                   const d = repairJson(t);
                   const markers = Array.isArray(d) ? d : (d.markers || d.data || d.locations || d.sub_locations || []);
                   const fileCategory = d.category || file.replace('.json', '');
                   return markers.map((m: any) => ({ 
                     ...m, 
                     source: file,
                     categoryId: m.categoryId || m.type || fileCategory 
                   }));
                 }
               } catch (e) {
                 if (!(e instanceof Error && e.name === 'AbortError')) {
                   // Only log if it's not a 404 for a standard city file that might not exist for every city
                   if (!citySubFiles.includes(file)) console.error("Sublocation fetch failed:", file, e);
                 }
               }
               return [];
            });
            
            const nestedResults = await Promise.all(subPromises);
            mainMarkers = [...mainMarkers, ...nestedResults.flat().filter(m => m !== null)];

            if (fetchedData.map) {
              locationMetadata.submapUrl = resolveRemoteAsset(fetchedData.map, currentCitySlug);
            }
          }

          const resolvedMetadata = {
            ...locationMetadata,
            image: resolveRemoteAsset(locationMetadata.image, currentCitySlug),
            banner: resolveRemoteAsset(locationMetadata.banner, currentCitySlug),
            thumbnail: resolveRemoteAsset(locationMetadata.thumbnail, currentCitySlug),
            map: resolveRemoteAsset(locationMetadata.map, currentCitySlug)
          };

          const rawMappedMarkers = (mainMarkers as any[]).filter(m => m !== null && typeof m === 'object').map((m, idx) => {
            const getCoord = (obj: any, keys: string[]) => {
              for (const key of keys) {
                if (obj[key] !== undefined && obj[key] !== null) {
                  const val = parseFloat(String(obj[key]));
                  if (!isNaN(val)) return val;
                }
              }
              return NaN;
            };

            let x = getCoord(m, ['x', 'lng', 'lon', 'longitude']);
            let y = getCoord(m, ['y', 'lat', 'latitude']);

            if (isNaN(x) && Array.isArray(m.position)) {
              // If it's already yx (internal), don't swap. If it's the original xy, swap.
              if (coordOrder === "xy") {
                y = Number(m.position[1]);
                x = Number(m.position[0]);
              } else {
                y = Number(m.position[0]);
                x = Number(m.position[1]);
              }
            }

            if (isNaN(x)) x = getCoord(m.coordinates || {}, ['lng', 'lon', 'x']);
            if (isNaN(y)) y = getCoord(m.coordinates || {}, ['lat', 'y']);
            
            return { x, y, original: m, idx };
          });

          // Phase 2: Detect scale & bounds
          const b = resolvedMetadata.bounds;
          const bMinY = b[0][0];
          const bMinX = b[0][1];
          const bMaxY = b[1][0];
          const bMaxX = b[1][1];
          let bWidth = Math.abs(bMaxX - bMinX);
          let bHeight = Math.abs(bMaxY - bMinY);

          const transformedMarkers = rawMappedMarkers.map(({ x, y, original: m, idx }) => {
            const mapOrigin = resolvedMetadata.origin;
            
            let leafletLat = y;
            let leafletLng = x;

            // Normalize (0-100) handling
            const looksNormalized = x >= 0 && x <= 100 && y >= 0 && y <= 100;
            if (looksNormalized && (bWidth > 150 || bHeight > 150)) {
               leafletLng = bMinX + (x / 100) * bWidth;
               leafletLat = bMinY + (y / 100) * bHeight;
            }

            if (mapOrigin === 'top-left') {
               leafletLat = (bMinY + bHeight) - (leafletLat - bMinY);
            }

            const leafletPosition: [number, number] = [leafletLat, leafletLng];
            const title = m.title || m.popup?.title || m.name || m.label || `Node_${idx}`;
            const description = m.description || m.popup?.description || "";
            const wikiSlug = m.wikiSlug || m.popup?.link?.url?.split('/').pop();

            let locationUrl = m.locationUrl || m.location_url || m.url || m.link?.url || m.popup?.link?.url;
            if (locationUrl && !locationUrl.startsWith('http')) {
              locationUrl = resolveRemoteAsset(locationUrl, currentCitySlug);
            }

            if (locationUrl && !locationUrl.endsWith('.json') && !locationUrl.includes('#') && mapCategoryId(m.categoryId) === 'cities') {
              const parts = locationUrl.split('/');
              const slug = toSlug(parts[parts.length - 1]);
              locationUrl = `${locationUrl.substring(0, locationUrl.lastIndexOf('/'))}${locationUrl.includes('/cities/') ? '' : '/cities/'}${slug}/${slug}.json`;
            }
            
            const parentLocId = currentHierarchy.location || currentHierarchy.subRegion || currentHierarchy.region;

            return {
              id: m.id ? `${m.id}_${idx}` : `${x}-${y}-${idx}`,
              categoryId: mapCategoryId(m.categoryId),
              name: m.name || title,
              position: leafletPosition,
              layer: m.layer || "surface",
              type: m.type || (m.polygon || m.path ? "area" : "marker"),
              path: m.path?.map((p: any) => [Number(p[0]), Number(p[1])]),
              polygon: m.polygon || (m.id === fetchedData.id ? fetchedData.polygon : undefined),
              location: m.location || (mapCategoryId(m.categoryId) === 'cities' ? toSlug(title) : parentLocId),
              subMapId: m.subMapId || (mapCategoryId(m.categoryId) === 'cities' ? toSlug(title) : undefined),
              popup: { title, description, image: resolveRemoteAsset(m.image || m.popup?.image, currentCitySlug) }
            };
          }).filter(m => !isNaN(m.position[0]) && !isNaN(m.position[1])) as MapMarker[];

          const mapValue = resolvedMetadata.map;
          const dynamicImage = resolvedMetadata.submapUrl || (mapValue && !mapValue.includes('Background') && !mapValue.includes('File:') ? mapValue : undefined);
          
          if (activeFilters.length === 0 || (activeFilters.length === 1 && activeFilters[0] === 'cities')) {
            const cityCatIds = new Set<string>();
            transformedMarkers.forEach(m => cityCatIds.add(m.categoryId));
            if (cityCatIds.size > 0) setActiveFilters(Array.from(cityCatIds));
          }

          if (fetchedData.unitsPerMile) {
            setScale(currentHierarchy.location || currentMapId, fetchedData.unitsPerMile);
          }

          setActiveSegmentData({
            ...resolvedMetadata,
            markers: transformedMarkers,
            categories: fetchedData.categories,
            geography: locationMetadata.geography || locationMetadata.Geography,
            history: locationMetadata.history || locationMetadata.History,
            submapUrl: dynamicImage || resolveMapPath({ ...currentHierarchy, categoryId })
          });
          
          setDynamicMarkers(transformedMarkers);
          
          // Merge into global markers for Explorer
          setData(prev => {
            const existingIds = new Set(prev.markers.map(m => m.id));
            const newOnes = transformedMarkers.filter(m => !existingIds.has(m.id));
            if (newOnes.length > 0) {
               toast.info(`Integrated ${newOnes.length} nodes. Sample: [${newOnes[0].position[0].toFixed(1)}, ${newOnes[0].position[1].toFixed(1)}]`);
            }
            if (newOnes.length === 0) return prev;
            return { ...prev, markers: [...prev.markers, ...newOnes] };
          });
          toast.success(`Loaded dynamic intelligence for ${currentHierarchy.location || currentHierarchy.subRegion}`);
        } else {
          setDynamicMarkers([]);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        console.warn("No dynamic segment found at this path. Using local cache.");
        setDynamicMarkers([]);
      }
    };
    
    if (currentMapId === 'world') {
      setDynamicMarkers([]);
      setActiveSegmentData({});
    } else {
      loadDynamicData();
    }
    return () => controller.abort();
  }, [currentHierarchy, currentMapId]);

  const filteredMarkers = useMemo(() => {
    // Priority: dynamicMarkers if specifically at a location, otherwise global markers
    let markers: MapMarker[];
    
    const isAtLocation = !!currentHierarchy.location;
    const hasDynamicContent = dynamicMarkers.length > 0;
    
    // Determine which marker set to use as base
    if (isAtLocation || (currentMapId !== 'world' && hasDynamicContent)) {
      markers = [...dynamicMarkers];
    } else {
      markers = data.markers.filter(m => m.isGlobal);
    }
    
    // Filter by layer
    markers = markers.filter(m => {
      const markerLayer = m.layer || "surface";
      return markerLayer === layer;
    });

    // If focused on a region but still on the base continental map, filter marker visibility to that region
    if (currentHierarchy.region && !currentHierarchy.location && !hasDynamicContent) {
      markers = markers.filter(m => m.region === currentHierarchy.region);
    }

    if (activeFilters.length > 0) {
      markers = markers.filter(m => activeFilters.includes(m.categoryId));
    }
    if (biomeFilter) {
      markers = markers.filter(m => m.biome === biomeFilter);
    }
    return markers;
  }, [data.markers, dynamicMarkers, activeFilters, biomeFilter, layer, currentHierarchy.region, currentHierarchy.location, currentMapId]);

  const currentMapData = useMemo<MapData>(() => {
    // If we have a subregion or location and currentMapId is not world, check for submap
    if ((currentHierarchy.subRegion || currentHierarchy.location) && currentMapId !== "world") {
      // Find the marker that led here to check for an explicit submapUrl
      const parentMarker = data.markers.find(m => m.id === currentMapId || m.subMapId === currentMapId);
      const categoryId = currentHierarchy.categoryId || parentMarker?.categoryId || (activeFilters.includes('cities') && (currentHierarchy.location || currentHierarchy.subRegion) ? 'cities' : undefined);
      const dynamicImage = activeSegmentData.submapUrl || parentMarker?.submapUrl || resolveMapPath({ ...currentHierarchy, categoryId, layer: currentHierarchy.locationLayer });
      
      if (dynamicImage) {
        return {
          mapImage: dynamicImage,
          markers: filteredMarkers,
          bounds: activeSegmentData.bounds || [[0, 0], [1000, 1000]], 
          autoBounds: !activeSegmentData.bounds,
          categories: data.categories,
          level: currentHierarchy.location ? 'location' : 'region',
          geography: activeSegmentData.geography,
          history: activeSegmentData.history
        };
      }
    }
    
    // World/Regional Navigation: Use the base continent map
    const dayImageUrl = "https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/maps/Faerun_day.webp";
    const nightImageUrl = "https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/maps/Faerun_night.webp";
    const underdarkImageUrl = "https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/maps/Faerun_underdark.webp";
    const mapImage = layer === "underdark" ? underdarkImageUrl : (time === "day" ? dayImageUrl : nightImageUrl);

    return {
      mapImage,
      markers: filteredMarkers,
      bounds: WORLD_BOUNDS,
      categories: data.categories,
      level: currentMapId === 'world' ? 'world' : 'region'
    };
  }, [currentMapId, currentHierarchy, data.categories, filteredMarkers, dynamicMarkers, time, layer, activeSegmentData]);

  const handleWikiImport = (newMarkers: MapMarker[]) => {
    setData(prev => ({
      ...prev,
      markers: [...prev.markers, ...newMarkers]
    }));
  };

  const handleSaveNode = (marker: MapMarker) => {
    setData(prev => {
      const idx = prev.markers.findIndex(m => m.id === marker.id);
      if (idx >= 0) {
        const newMarkers = [...prev.markers];
        newMarkers[idx] = marker;
        return { ...prev, markers: newMarkers };
      } else {
        const newMarker = { ...marker, id: marker.id || Date.now().toString() };
        return { ...prev, markers: [...prev.markers, newMarker] };
      }
    });

    // Auto-stage for baking
    const leafId = marker.id || "new_node";
    const repoPath = resolveRepoPath(currentHierarchy, leafId);
    stageChange(leafId, {
      path: repoPath,
      content: marker,
      label: marker.popup.title
    });

    setSelectedMarker(null);
    toast.success("Node updated & staged for baking");
  };

  const bakeToGithub = async () => {
    if (!githubConfig.token) {
      toast.error("GitHub Token is required to bake maps.");
      setDevKitOpen(true);
      return;
    }
    const service = new GithubService(githubConfig);
    toast.loading("Baking data to repository...");
    
    // Determine the save path relative to repo root
    let exportData: any = data;
    const leafId = currentHierarchy.location || currentHierarchy.subRegion || currentHierarchy.region || "faerun";
    const savePath = resolveRepoPath(currentHierarchy, leafId);

    const activeMapId = currentHierarchy.location || currentMapId;
    
    if (currentHierarchy.region && currentMapId !== "world") {
      // Use activeSegmentData as the base to follow the city schema
      exportData = {
        "$schema": "../../../../../schemas/city.schema.json",
        ...activeSegmentData,
        id: currentHierarchy.location || currentHierarchy.subRegion || activeSegmentData.id,
        markers: dynamicMarkers, // Use only the markers for the current segment
        unitsPerMile: mapScales[activeMapId] || activeSegmentData.unitsPerMile,
        metadata: {
            ...activeSegmentData.metadata,
            level: currentMapId,
            hierarchy: currentHierarchy,
            last_updated: new Date().toISOString()
        }
      };
    } else if (currentMapId === 'world') {
      exportData = {
        ...data,
        unitsPerMile: mapScales['world']
      };
    }

    const result = await service.saveFile(
        JSON.stringify(exportData, null, 2), 
        `Bake ${currentMapId} state: ${new Date().toISOString()}`,
        savePath
    );
    
    toast.dismiss();
    if (result.success) {
      toast.success(`Data committed to: ${savePath}`);
    } else {
      toast.error("Failed to bake to GitHub. Check DevKit for errors.");
      setDevKitOpen(true);
    }
  };

  const modularBake = async () => {
    if (!githubConfig.token) {
        toast.error("GitHub Token is required.");
        return;
    }
    const service = new GithubService(githubConfig);
    toast.loading("Modular baking in progress...");

    // Group markers by category for modular storage
    const categorized: Record<string, MapMarker[]> = {
        "cities/cities": data.markers.filter(m => m.categoryId === "cities"),
        "mountains/mountain": data.markers.filter(m => m.categoryId === "hills_mountains" || m.categoryId === "mountains"),
        "poi/poi": data.markers.filter(m => m.categoryId === "poi"),
        "roads_trails/roads_trails": data.markers.filter(m => m.categoryId === "roads_trails"),
        "water/water": data.markers.filter(m => m.categoryId === "water"),
        "forest/forest": data.markers.filter(m => m.categoryId === "forests"),
        "ruins/ruins": data.markers.filter(m => m.categoryId === "ruins"),
    };

    let successCount = 0;
    for (const [key, markers] of Object.entries(categorized)) {
        if (markers.length === 0) continue;
        const path = `public/assets/atlas/world/toril/faerun/${key}.json`;
        const res = await service.saveFile(JSON.stringify(markers, null, 2), `Bake ${key} modular data`, path);
        if (res.success) successCount++;
    }

    toast.dismiss();
    toast.success(`Modular bake complete: ${successCount} segments updated.`);
  };

  const handleDeleteNode = (id: string) => {
    setData(prev => ({
      ...prev,
      markers: prev.markers.filter(m => m.id !== id)
    }));
    setSelectedMarker(null);
    toast.error("Node deleted");
  };

   const activeData = useMemo(() => {
    if (selectedMarker && selectedNodeData) {
      return { ...selectedNodeData, ...selectedMarker };
    }
    if (selectedMarker) return selectedMarker;
    if (selectedNodeData) return selectedNodeData;
    
    // Fallback to regional/city data if no specific marker is selected but we are in a submap
    if (currentMapId !== 'world' && activeSegmentData && Object.keys(activeSegmentData).length > 0) {
      return {
        ...activeSegmentData,
        title: activeSegmentData.name || activeSegmentData.title || currentHierarchy.location || currentHierarchy.subRegion,
        type: activeSegmentData.type || (currentHierarchy.categoryId === 'cities' ? 'Metropolis' : 'Regional Hub'),
        description: activeSegmentData.description || activeSegmentData.content || "Deep intelligence acquisition in progress for this coordinates set."
      };
    }
    
    return null;
  }, [selectedNodeData, selectedMarker, activeSegmentData, currentMapId, currentHierarchy]);

  const handleMouseMove = (coords: [number, number]) => {
    // coords from Leaflet are [lat, lng]
    // mouseCoords displays as [lng, lat] (x, y) for user readout
    setMouseCoords([coords[1], coords[0]]);
  };

  const handleMapClick = (coords: [number, number]) => {
    // coords from Leaflet are [lat, lng]
    // We store them as [lat, lng] to match the app state
    const position: [number, number] = coords;
    
    if (isPickingCoordinate) {
      const coordStr = `[${Math.round(position[0])}, ${Math.round(position[1])}]`;
      navigator.clipboard.writeText(coordStr);
      toast.success(`Coordinates copied to clipboard: ${coordStr}`);
      setPickingCoordinate(false);
      return;
    }

    if (isPlacementMode) {
      setSelectedMarker({
        id: "",
        categoryId: "1",
        position: position,
        type: "marker",
        popup: { title: "New Location", description: "" }
      });
      // Optionally turn off placement mode after one click, or leave it on.
      // User said "button to open", so maybe stay on until toggled off.
    } else if (isEditMode) {
      if (selectedMarker?.type === "area") {
        const newPath = [...(selectedMarker.path || []), position];
        const updatedMarker = { ...selectedMarker, path: newPath };
        setSelectedMarker(updatedMarker);
        
        // Also update in main data if it's an existing marker
        if (selectedMarker.id) {
           setData(prev => ({
             ...prev,
             markers: prev.markers.map(m => m.id === selectedMarker.id ? updatedMarker : m)
           }));
        }
        return;
      }

      setSelectedMarker({
        id: "",
        categoryId: "1",
        position: position,
        type: "marker",
        popup: { title: "New Location", description: "" }
      });
    } else {
      // Clear selected marker to show regional/continent context
      setSelectedMarker(null);
    }
  };

  const totalDistance = calculateDistance();
  const travelTimes = getTravelTime(totalDistance);

  return (
    <TooltipProvider delay={0}>
      <div className="h-screen bg-[#0F1115] text-[#E0E2E5] font-sans selection:bg-blue-600/30 overflow-hidden flex flex-col uppercase-none">
        <Toaster position="bottom-center" richColors theme="dark" />
      
      {/* Header: DevKit Style */}
      <header className="h-14 shrink-0 border-b border-[#2D3139] bg-[#16191E] flex items-center px-4 gap-6 z-[1001]">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform hover:scale-105">
            <GameIcon name="devkit" size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Artificer_Atlas</span>
            <span className="text-[9px] font-mono text-blue-400">SYSTEM_OVERRIDE_ENABLED</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center gap-4">
          <div className="flex items-center space-x-4 bg-[#0F1115]/50 border border-[#2D3139] px-4 py-1 rounded-full backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigateTo('world')}
                className="text-[10px] font-bold uppercase tracking-tight text-slate-400 hover:text-white transition-colors"
              >
                FAERUN
              </button>
              {currentHierarchy.region && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-200">{currentHierarchy.region.replace(/_/g, ' ')}</span>
                </>
              )}
              {currentHierarchy.location && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="text-[10px] font-black uppercase tracking-tight text-blue-400">{currentHierarchy.location.replace(/_/g, ' ')}</span>
                </>
              )}
              <div className="w-[1px] h-3 bg-[#2D3139] mx-2" />
              <GameIcon name={time === 'day' ? 'sun' : 'moon'} size={12} className={time === 'day' ? 'text-amber-400' : 'text-blue-400'} />
              <span className="text-[10px] font-mono text-slate-200">{time.toUpperCase()}</span>
            </div>
            <div className="w-[1px] h-3 bg-[#2D3139]" />
            <div className="flex items-center space-x-2 text-blue-400">
               <span className="text-[9px] font-mono uppercase tracking-widest">
                 {currentHierarchy.location ? (currentHierarchy.locationLayer || "SURFACE") : layer}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setDevKitOpen(!isDevKitOpen)} 
            className={`h-8 w-8 text-slate-400 hover:text-white transition-all ${isDevKitOpen ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500' : ''}`}
          >
            <GameIcon name="devkit" size={16} />
          </Button>

          <Button 
            size="icon" 
            onClick={() => setLayer(layer === 'surface' ? 'underdark' : 'surface')}
            className={`h-8 w-8 transition-all ${layer === 'underdark' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            <GameIcon name={layer === 'surface' ? 'layers' : 'underdark'} size={16} />
          </Button>

          <Button 
            size="icon" 
            onClick={() => setTime(time === 'day' ? 'night' : 'day')}
            className={`h-8 w-8 transition-all ${time === 'night' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            {time === 'day' ? <GameIcon name="sun" size={16} /> : <GameIcon name="moon" size={16} />}
          </Button>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-row overflow-hidden">
        {/* Sidebar Controls: World Explorer Style */}
        <aside className="w-80 border-r border-[#2D3139] bg-[#16191E] flex flex-col h-full overflow-hidden min-h-0 relative shadow-2xl z-[1002]">
          {!currentHierarchy.location && (
            <div className="p-2 border-b border-[#2D3139] bg-[#0F1115] flex items-center justify-between gap-1 shrink-0">
               <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setNavHistory([]);
                  setMapId("world");
                  setHierarchy({});
                  setSelectedMarker(null);
                }}
                className={`flex-1 h-8 text-[10px] uppercase font-black tracking-widest border-[#2D3139] rounded transition-all active:scale-95 ${currentMapId === 'world' ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-[#16191E] text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/50'}`}
              >
                <GameIcon name="globe" size={12} className="mr-2" />
                WORLD_ROOT
              </Button>
              
              {navHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateBack}
                  className="h-8 w-8 bg-[#16191E] border-[#2D3139] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all rounded"
                >
                  <GameIcon name="chevron_left" size={14} />
                </Button>
              )}
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {currentHierarchy.location ? (
              <IntelPanel 
                key="intel-panel"
                data={activeData} 
                onMarkerSelect={(m) => {
                  setSelectedMarker(m);
                  setSelectedNodeData({
                    ...m,
                    id: m.id,
                    title: m.popup?.title || m.name,
                    description: m.popup?.description || m.description,
                    type: m.type || "Local Interest",
                    image: m.popup?.image || m.image || "/placeholder.webp",
                    metadata: {
                       ...m.metadata,
                       category: m.categoryId
                    }
                  });
                }}
                onBack={() => {
                  setSelectedMarker(null);
                  navigateBack();
                }} 
              />
            ) : (
              <WorldExplorer 
                key="world-explorer"
                markers={data.markers}
                hoveredId={hoveredRegion || hoveredMarker?.id}
                selectedId={activeData?.id}
              />
            )}
          </AnimatePresence>
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative bg-[#0F1115] overflow-hidden flex flex-col">
          <div className="flex-1 relative bg-[#0F1115]">            {/* Breadcrumb / Map Selector */}
            <div className="absolute top-6 left-6 z-[1000] flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-[#16191E]/80 backdrop-blur-md border border-[#2D3139] rounded shadow-2xl">
                 <button 
                  onClick={() => {
                    setNavHistory([]);
                    setMapId("world");
                    setHierarchy({});
                    setSelectedMarker(null);
                  }}
                  className={`h-7 px-3 flex items-center text-[10px] uppercase font-black tracking-widest transition-all rounded ${currentMapId === 'world' && !currentHierarchy.region ? 'text-amber-500' : 'text-slate-400 hover:text-white'}`}
                >
                  <GameIcon name="globe" size={12} className="mr-2" />
                  FAERUN
                </button>
                
                {currentHierarchy.region && (
                  <>
                    <div className="text-slate-700 font-mono text-[10px] opacity-30">/</div>
                    <button 
                      onClick={() => navigateTo('world', { region: currentHierarchy.region })}
                      className={`h-7 px-3 flex items-center text-[10px] uppercase font-black tracking-widest transition-all rounded ${!currentHierarchy.subRegion && !currentHierarchy.location ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {currentHierarchy.region.replace(/_/g, ' ')}
                    </button>
                  </>
                )}
                {currentHierarchy.subRegion && (
                  <>
                    <div className="text-slate-700 font-mono text-[10px] opacity-30">/</div>
                    <button 
                      onClick={() => navigateTo('world', { region: currentHierarchy.region, subRegion: currentHierarchy.subRegion })}
                      className={`h-7 px-3 flex items-center text-[10px] uppercase font-black tracking-widest transition-all rounded ${!currentHierarchy.location ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {currentHierarchy.subRegion.replace(/_/g, ' ')}
                    </button>
                  </>
                )}

                {currentHierarchy.location && (
                  <>
                    <div className="text-slate-700 font-mono text-[10px] opacity-30">/</div>
                    <div className="h-7 px-3 flex items-center text-[10px] uppercase font-black tracking-widest text-amber-500">
                      {currentHierarchy.location.replace(/_/g, ' ')}
                    </div>
                  </>
                )}
              </div>

              {navHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateBack}
                  className="h-9 bg-[#16191E]/80 backdrop-blur-md border-[#2D3139] text-slate-400 hover:text-white transition-all rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest px-4 shadow-xl"
                >
                  <GameIcon name="arrow-left" size={14} />
                  Exit View
                </Button>
              )}
            </div>

            {/* Status Window / Hover Intel Notification */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-4 pointer-events-none">
              <motion.div 
                initial={false}
                animate={{ 
                  opacity: (hoveredMarker || hoveredRegion) ? 1 : 0,
                  borderColor: (hoveredMarker || hoveredRegion) ? '#3b82f6' : '#2D3139', 
                  backgroundColor: (hoveredMarker || hoveredRegion) ? 'rgba(22, 25, 30, 0.95)' : 'rgba(22, 25, 30, 0.8)',
                  y: (hoveredMarker || hoveredRegion) ? 0 : -10,
                }}
                className="h-12 border-2 rounded-lg backdrop-blur-md flex items-center px-4 gap-4 overflow-hidden relative pointer-events-auto group mt-2"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-1.5 rounded transition-all duration-300 ${(hoveredMarker || hoveredRegion) ? 'bg-blue-500/20 text-blue-400 scale-105' : 'bg-slate-800 text-slate-500'}`}>
                    <GameIcon name={(hoveredMarker || hoveredRegion) ? 'location' : 'globe'} size={14} />
                  </div>
                  
                  <div className="flex flex-col flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={hoveredMarker ? hoveredMarker.categoryId : (hoveredRegion ? 'region' : 'default-cat')}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none truncate mb-0.5"
                      >
                        {hoveredMarker ? (hoveredMarker.categoryId.replace(/_/g, ' ')) : (hoveredRegion ? 'Continental Region' : 'SYSTEM_READY')}
                      </motion.span>
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={hoveredMarker ? hoveredMarker.id : (hoveredRegion || 'root-text')}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xs font-bold uppercase tracking-widest truncate font-serif transition-colors ${(hoveredMarker || hoveredRegion) ? 'text-white' : 'text-slate-500'}`}
                      >
                        {hoveredMarker ? hoveredMarker.popup.title : (hoveredRegion ? (REGION_METADATA[hoveredRegion]?.name || hoveredRegion.replace(/_/g, ' ')) : 'THE WORLD OF FAERUN')}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Legend / Filter Overlay */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[2000] max-w-[95%] w-fit pointer-events-none">
              <div className="bg-[#12141a]/95 border border-white/10 p-1.5 rounded-xl backdrop-blur-md shadow-2xl overflow-hidden pointer-events-auto">
                <Legend 
                  activeCategories={activeFilters}
                  onToggleCategory={toggleCategory}
                  loadedCategories={loadedCategories}
                  customCategories={currentHierarchy.location ? (
                    activeSegmentData.categories ? activeSegmentData.categories.map((c: any) => ({
                      id: mapCategoryId(c.id),
                      label: c.name,
                      icon: (c.icon?.includes('City') ? 'cities' : 
                             c.icon?.includes('Tower') ? 'shield' : 
                             c.icon?.includes('temple') ? 'ruins' : 
                             c.icon?.includes('Tankard') ? 'towns' : 
                             'poi') as any,
                      color: c.color || '#3b82f6'
                    })) : CITY_CATEGORIES_LIST
                  ) : undefined}
                />
              </div>
            </div>

            {currentHierarchy.location ? (
              <LocationMapView 
                cityData={currentMapData}
                markers={filteredMarkers}
                time={time}
                layer={layer}
                activeCategories={activeFilters}
                onToggleCategory={toggleCategory}
                currentMapId={currentHierarchy.location || currentHierarchy.subRegion || currentHierarchy.region || currentMapId}
                onMarkerSelect={(m) => {
                  setSelectedMarker(m);
                  setSelectedNodeData({
                    ...m,
                    id: m.id,
                    title: m.popup.title,
                    description: m.popup.description,
                    type: m.type || "Local Interest",
                    image: m.popup.image || m.image || "/placeholder.webp",
                    metadata: {
                       ...m.metadata,
                       category: m.categoryId
                    }
                  });
                }}
                onMarkerHover={setHoveredMarker}
                onMapClick={handleMapClick}
                onMouseMove={handleMouseMove}
                pickingMode={isPickingCoordinate}
              />
            ) : (
              <FaerunMap 
                  data={currentMapData}
                  time={time}
                  layer={layer}
                  selectedMarker={selectedMarker}
                  highlightedRegion={selectedRegionId || currentHierarchy.region}
                  route={route}
                  currentMapId={currentHierarchy.location || currentHierarchy.subRegion || currentHierarchy.region || currentMapId}
                  onMarkerHover={setHoveredMarker}
                  onRegionHover={setHoveredRegion}
                  onRegionSelect={handleRegionSelect}
                  onMarkerSelect={(m) => {
                    setSelectedMarker(m);
                    setSelectedRegionId(null);
                    
                    setSelectedNodeData({
                      id: m.id,
                      title: m.popup.title,
                      description: m.popup.description,
                      type: m.subMapId ? "Major Location" : "Point of Interest",
                      image: m.popup.image || "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=800&q=80",
                      subMapId: m.subMapId,
                      region: m.region,
                      subRegion: m.subRegion,
                      location: m.location,
                      locationUrl: m.locationUrl,
                      metadata: {
                        classification: "Active Data Buffer",
                        status: "Live Stream"
                      }
                    });
                  }}
                  onMapClick={handleMapClick}
                  onMouseMove={handleMouseMove}
                  pickingMode={isPickingCoordinate}
              />
            )}

            {/* Picking Indicator Overlay */}
            <AnimatePresence>
              {isPickingCoordinate && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
                >
                  <div className="bg-amber-500/90 backdrop-blur-md border border-amber-400 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <GameIcon name="location" size={20} className="text-white animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest leading-none">Picking_Coordinate</span>
                        <span className="text-amber-100 text-[9px] uppercase font-medium leading-none mt-1">Click_Anywhere_on_Map_to_Copy</span>
                      </div>
                    </div>

                    {mouseCoords && (
                      <div className="border-l border-amber-400/50 pl-4 flex flex-col items-end">
                        <span className="text-white font-mono text-[11px] font-bold">
                          [{Math.round(mouseCoords[0])}, {Math.round(mouseCoords[1])}]
                        </span>
                        <span className="text-amber-100 text-[8px] uppercase tracking-tighter">Current_Position</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
                {isEditMode && selectedMarker && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="z-[1002]"
                >
                    <NodeEditor 
                    marker={selectedMarker} 
                    categories={data.categories}
                    onSave={handleSaveNode}
                    onDelete={handleDeleteNode}
    onLoadSubMap={(id) => {
      // Find the marker that triggered this to get hierarchy data
      const sourceMarker = data.markers.find(m => m.subMapId === id) || selectedMarker;
      if (sourceMarker) {
        navigateTo(id, {
          region: sourceMarker.region,
          subRegion: sourceMarker.subRegion,
          location: sourceMarker.location || sourceMarker.subMapId,
          locationUrl: sourceMarker.locationUrl,
          categoryId: sourceMarker.categoryId
        });
      } else {
        navigateTo(id, {});
      }
      setSelectedMarker(null);
    }}
                    onClose={() => setSelectedMarker(null)}
                    />
                </motion.div>
                )}
            </AnimatePresence>

            {/* Map Overlay HUD: DevKit Style */}
            <div className="absolute left-4 bottom-4 z-[1000] flex flex-col gap-2 pointer-events-none">
            </div>
          </div>
        </div>

        {/* Right Panel: Global Context Style */}
        <aside className="w-[420px] border-l border-[#2D3139] bg-[#16191E] flex flex-col h-full overflow-hidden min-h-0">
            {/* Panel Header */}
            <div className="p-4 border-b border-[#2D3139] bg-[#0F1115] text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-between shrink-0 font-mono">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  ATLAS_CONTEXT
                </span>
                {activeData && (
                  <div className="px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-[8px] text-blue-400 font-mono">
                    {activeData.type?.toUpperCase() || 'NODE'}
                  </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <AnimatePresence mode="wait">
                  {activeData ? (
                    <motion.div 
                      key={activeData.id || activeData.title || 'node'}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full overflow-hidden"
                    >
                        {/* Node Image: 16:9 View Area */}
                        <div className="w-full relative overflow-hidden bg-slate-900 aspect-[32/9] flex-shrink-0 border-b border-[#2D3139]">
                          <img 
                            src={activeData.banner || activeData.image || "/placeholder.webp"} 
                            alt={activeData.title || activeData.name}
                            className={`w-full h-[200%] object-cover opacity-80 duration-500 transition-all ${
                              time === 'day' ? 'object-top' : 'object-bottom'
                            }`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1519074063261-bb82f7c2401c?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#16191E] via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-serif font-bold text-[#FDFAF3] tracking-wide leading-tight drop-shadow-md">
                              {activeData.title || activeData.name}
                            </h3>
                            <div className="text-[9px] text-blue-400 font-mono mt-1 uppercase tracking-widest">
                              {activeData.type || 'Regional Record'} &rsaquo; {activeData.metadata?.status || 'Active'}
                            </div>
                          </div>
                        </div>

                      {/* Scrollable Content */}
                      <ScrollArea className="flex-1 min-h-0">
                        <div className="p-5 space-y-6">
                          {/* Summary Section */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                 <GameIcon name="info" size={10} className="text-blue-500" />
                                 Overview
                               </div>
                               <p className="text-[12px] text-slate-300 leading-relaxed font-sans">
                                 {typeof (activeData.description || activeData.content) === 'object' 
                                   ? JSON.stringify(activeData.description || activeData.content) 
                                   : (activeData.description || activeData.content)}
                               </p>
                            </div>

                            {/* Wiki / Lore */}
                            {(activeData.wiki || activeData.history) && (
                              <div className="space-y-2 pt-2">
                                 <div className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest flex items-center gap-2">
                                   <GameIcon name="scroll" size={10} />
                                   Lore & Intelligence
                                 </div>
                                 <div className="rounded bg-[#0F1115]/80 border border-[#2D3139] p-4 text-[11px] text-slate-400 leading-relaxed italic whitespace-pre-wrap font-serif">
                                    {typeof (activeData.wiki || activeData.history) === 'object'
                                      ? JSON.stringify(activeData.wiki || activeData.history)
                                      : (activeData.wiki || activeData.history)}
                                 </div>
                              </div>
                            )}

                            {/* Metadata / Tags */}
                            {activeData.metadata && Object.keys(activeData.metadata).length > 0 && (
                              <div className="grid grid-cols-1 gap-2 pt-2">
                                {Object.entries(activeData.metadata).map(([key, val]) => (
                                  <div key={key} className="flex items-center justify-between p-2 bg-[#0F1115]/40 border border-[#2D3139]/50 rounded-sm">
                                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-[11px] text-blue-400 font-mono">
                                      {typeof val === 'object' 
                                        ? (Array.isArray(val) ? val.join(', ') : JSON.stringify(val)) 
                                        : String(val)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {activeData.tags && activeData.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {activeData.tags.map((tag: string) => (
                                  <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[8px] text-slate-400 font-mono uppercase">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="pt-6 pb-8 border-t border-[#2D3139] flex flex-col gap-3">
                            {(activeData?.categoryId === 'cities' || activeData?.subMapId) && (currentMapId !== activeData?.id && currentMapId !== activeData?.subMapId) && (
                              <Button 
                                variant="default" 
                                className={`w-full text-xs h-10 ${activeData?.categoryId === 'cities' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-none uppercase font-bold tracking-widest transition-all duration-300 shadow-lg`}
                                onClick={() => {
                                  const targetId = toSlug(activeData?.subMapId || (activeData?.categoryId === 'cities' ? (activeData.id || activeData.name || "") : ""));
                                  if (targetId) {
                                    navigateTo(targetId, {
                                      region: activeData.region,
                                      subRegion: activeData.subRegion,
                                      location: activeData.location || activeData.name || activeData.title || targetId,
                                      locationUrl: activeData.locationUrl,
                                      categoryId: activeData.categoryId
                                    });
                                  }
                                }}
                              >
                                 <GameIcon name="layers" size={14} className="mr-2" />
                                 {activeData?.categoryId === 'cities' ? 'Enter City Atlas' : 'Enter Region'}
                              </Button>
                            )}
                            
                            {activeData?.map && (
                              <Button
                                variant="outline"
                                className="w-full text-[10px] h-8 border-[#2D3139] text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-none uppercase font-bold"
                                onClick={() => {
                                  const mapUrl = activeData.map.startsWith('http') ? activeData.map : `https://raw.githubusercontent.com/japiohopman/artificer/main/${activeData.map}`;
                                  window.open(mapUrl, '_blank');
                                }}
                              >
                                <GameIcon name="map" size={12} className="mr-2" />
                                View Cartographic Scan
                              </Button>
                            )}
                            
                            {activeData.wikiSlug && (
                              <Button
                                variant="outline"
                                className="w-full text-[10px] h-8 border-amber-500/30 text-amber-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-none uppercase font-bold"
                                onClick={() => {
                                  window.open(`https://forgottenrealms.fandom.com/wiki/${activeData.wikiSlug}`, '_blank');
                                }}
                              >
                                <GameIcon name="book" size={12} className="mr-2" />
                                Review Chronological Records
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              className="w-full text-[10px] h-8 border-[#2D3139] text-slate-500 hover:text-slate-300 rounded-none uppercase font-bold"
                              onClick={() => {
                                setSelectedMarker(null);
                                setSelectedNodeData(null);
                              }}
                            >
                              Dismiss Context
                            </Button>
                          </div>
                        </div>
                      </ScrollArea>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center p-10 text-center"
                    >
                      <div className="w-20 h-20 bg-[#1C2026] rounded-full flex items-center justify-center mb-6 border border-[#2D3139]">
                        <GameIcon name="globe" size={32} className="text-slate-700 animate-pulse" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Atlas Navigational Interface</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        Select a regional or local node within the world atlas to initialize intelligence decryption.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            {/* Status Footer Mini */}
            <div className="p-3 bg-[#0F1115] border-t border-[#2D3139] flex justify-between items-center px-4 shrink-0">
               <div className="flex items-center gap-1.5">
                  <div className={`w-1 h-1 rounded-full ${selectedNodeData ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter font-bold">
                    {selectedNodeData ? 'LIVE_DATALINK' : 'LINK_IDLE'}
                  </span>
               </div>
            </div>
          </aside>
      </main>

      {/* Footer Console: DevKit Style */}
      <footer className="h-8 bg-[#0F1115] border-t border-[#2D3139] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                [{new Date().toLocaleTimeString([], { hour12: false })}] ATLAS_SYNC_OK
            </span>
            <span>|</span>
            <span className="text-blue-500">COORD_MAPPING: ENABLED</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
            Ln 124, Col 32 // UTF-8 // WORLD_JSON
        </div>
      </footer>
      
      <CityImportDialog 
        open={isCityImporterOpen} 
        onOpenChange={setIsCityImporterOpen} 
        hierarchy={currentHierarchy.location ? currentHierarchy : {
          region: selectedMarker?.region,
          subRegion: selectedMarker?.subRegion,
          location: selectedMarker?.location
        }}
        onImportComplete={(newData) => {
            setActiveSegmentData(newData);
        }}
      />
      <DevKitOverlay 
        data={data} 
        activeSegmentData={activeSegmentData}
        onBakeCurrent={bakeToGithub}
        onModularBake={modularBake}
      />
    </div>
    </TooltipProvider>
  );
}
