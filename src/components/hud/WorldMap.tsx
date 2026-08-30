import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, SVGOverlay, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../store/useUIStore';
import { useWorldStore, CategoryIcons, SavedLocation } from '../../store/useWorldStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { getRegionAt } from '../../lib/mapUtils';
import { WORLD_ATLAS_ICONS } from '../../lib/iconRegistry.generated';
import { MapLegend } from './game/MapLegend';
import { FogOfWar } from './game/FogOfWar';
import { MapNavigation } from './game/MapNavigation';
import { REGION_METADATA, REGION_PATH_REGISTRY } from '../../data/regions';
import { GameIcon } from '../../game_icons';

/**
 * MAP ZOOM SYSTEM SPECIFICATION (0-6)
 * Level 0 (Leaflet 3): World Overview. 4000 Miles. Regions only.
 * Level 1 (Leaflet 4): Major Oceans and Seas.
 * Level 2 (Leaflet 5): Major Terrain (Forests, Plains, Mountains, Wetlands, Deserts, Islands, Oases).
 * Level 3 (Leaflet 6): Major Cities.
 * Level 4 (Leaflet 7): Towns, Villages, Settlements, Keeps, Fortresses.
 * Level 5 (Leaflet 8): Smaller locations.
 * Level 6 (Leaflet 9): Ruins, POIs, Hidden landmarks.
 */
const CATEGORY_TIERS = [
  { zoom: 3, miles: 4001, categories: ['regions'] },
  { zoom: 4, miles: 2001, categories: ['seas_oceans'] }, // Removed 'cities' from global category load to optimize performance
  { zoom: 5, miles: 1001, categories: ['mountains', 'forest', 'deserts_wastelands', 'glaciers_tundras', 'oases', 'plains_grasslands', 'wetlands', 'rivers', 'lakes', 'bays', 'coasts', 'sub_regions'] }, // Removed 'islands' as they are now dynamically discoverable
  { zoom: 6, miles: 501, categories: [] },
  { zoom: 7, miles: 251, categories: ['underdark'] }, // Removed 'fortresses_keeps' and 'towns_settlements' as they are discoverable
  { zoom: 8, miles: 130, categories: ['temples', 'shrines'] }, // Removed 'landmarks' as they are discoverable
  { zoom: 9, miles: 70, categories: ['graveyards', 'dungeons', 'caves', 'roads_trails'] } // Removed 'ruins' and 'poi' as they are discoverable
];

// Helper to create custom markers using World Atlas Icons
const createCustomIcon = (category: string, isInspected: boolean = false) => {
  const cat = category?.toLowerCase() || '';
  let catKey = cat;
  
  // Advanced normalization for diverse atlas data
  if (cat.includes('city') || cat.includes('metropolis') || cat === 'cities') catKey = 'city';
  else if (cat.includes('town') || cat.includes('settlement') || cat.includes('village')) catKey = 'village';
  else if (cat.includes('ruin')) catKey = 'ruins';
  else if (cat.includes('graveyard') || cat.includes('cemetery')) catKey = 'graveyard';
  else if (cat.includes('dungeon') || cat.includes('cave')) catKey = 'dungeon';
  else if (cat.includes('fortress') || cat.includes('castle') || cat.includes('keep')) catKey = 'castle';
  else if (cat.includes('forest') || cat.includes('wood')) catKey = 'forest';
  else if (cat.includes('mountain') || cat.includes('peak') || cat.includes('hill')) catKey = 'mountains';
  else if (cat.includes('river')) catKey = 'rivers';
  else if (cat.includes('lake')) catKey = 'lakes';
  else if (cat.includes('sea') || cat.includes('ocean') || cat.includes('deep')) catKey = 'seas_oceans';
  else if (cat.includes('bay') || cat.includes('inlet') || cat.includes('firth')) catKey = 'bays';
  else if (cat.includes('coast') || cat.includes('shore') || cat.includes('beach') || cat.includes('reef')) catKey = 'coasts';
  else if (cat.includes('water') || cat.includes('wetland')) catKey = 'waters';
  else if (cat.includes('island')) catKey = 'islands';
  else if (cat.includes('temple') || cat.includes('shrine')) catKey = 'temples';
  else if (cat.includes('road') || cat.includes('trail')) catKey = 'roads';
  else if (cat.includes('poi') || cat.includes('point_of_interest')) catKey = 'poi';
  else if (cat.includes('swamp') || cat.includes('marsh') || cat.includes('wetland')) catKey = 'swamp';
  else if (cat.includes('grassland') || cat.includes('plains') || cat.includes('field') || cat.includes('grass')) catKey = 'grassland';
  else if (cat.includes('oasis')) catKey = 'waters';
  else if (cat.includes('desert') || cat.includes('waste')) catKey = 'desert';
  else if (cat.includes('arctic') || cat.includes('glacier') || cat.includes('tundra')) catKey = 'arctic';
  else if (cat.includes('coast') || cat.includes('beach') || cat.includes('bay') || cat.includes('port')) catKey = 'waters';
  
  const config = CategoryIcons[catKey] || 
                 CategoryIcons[catKey.replace(/ies$/, 'y')] || 
                 CategoryIcons[catKey.replace(/s$/, '')] || 
                 CategoryIcons[catKey + 's'] ||
                 { icon: 'landmark', color: '#D4AF37' };
  
  // Use mapping to WORLD_ATLAS_ICONS
  const iconKey = config.icon as keyof typeof WORLD_ATLAS_ICONS;
  const iconEntry = WORLD_ATLAS_ICONS[iconKey] || WORLD_ATLAS_ICONS.landmark || WORLD_ATLAS_ICONS.city;
  const iconUrl = typeof iconEntry === 'object' ? iconEntry.path : iconEntry;
  
  const scaleClass = isInspected ? 'scale-125' : 'group-hover:scale-110';

  return L.divIcon({
    html: `
      <div class="relative group ${isInspected ? 'z-[1000]' : ''}">
        <!-- Glow Effect -->
        <div class="absolute inset-0 bg-black/60 blur-lg rounded-full transform scale-50 transition-transform ${scaleClass}"></div>

        <!-- Selection Ring -->
        ${isInspected ? `
          <div class="absolute inset-[-12px] border-2 border-dragon-gold/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div class="absolute inset-[-6px] border border-dragon-gold/60 rounded-full"></div>
        ` : ''}

        <!-- Icon Mask -->
        <div class="relative w-8 h-8 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${scaleClass} ${isInspected ? '-translate-y-1' : ''}" style="background-color: ${config.color}; -webkit-mask: url('${iconUrl}') no-repeat center / contain; mask: url('${iconUrl}') no-repeat center / contain;"></div>
      </div>
    `,
    className: `custom-map-marker atlas-marker-${catKey}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const MapEvents = ({
  mapMode,
  onZoomChange,
  onBoundsChange,
  onMapInstance
}: {
  mapMode: 'pan' | 'travel';
  onZoomChange: (zoom: number) => void;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onMapInstance: (map: L.Map) => void;
}) => {
  const { setInspectedLocation, partyLocation, getPartySpeedMph, isTraveling } = useWorldStore();
  const { setIsWorldPanelOpen } = useUIStore();
  const map = useMap();

  const mapWidth = 21620;
  const mapHeight = 14461;
  const protoWidth = 4763;
  const protoHeight = 3185;

  React.useEffect(() => {
    onMapInstance(map);
    if (map) {
      onBoundsChange(map.getBounds());
      onZoomChange(map.getZoom());
    }
  }, [map, onMapInstance, onBoundsChange, onZoomChange]);

  const isWaterVehicleOwned = (): boolean => {
    try {
      const invState = useInventoryStore.getState();
      const waterKeywords = ['boat', 'ship', 'rowboat', 'galleon', 'caravel', 'vessel', 'keelboat', 'raft', 'schooner', 'yacht', 'vloot', 'schip', 'boot'];
      
      // Check party vehicles
      const hasWaterVehicle = (invState.partyVehicles || []).some(v => 
        v.name && waterKeywords.some(kw => v.name.toLowerCase().includes(kw))
      );
      if (hasWaterVehicle) return true;

      // Check party inventory
      const hasWaterInvItem = (invState.partyInventory || []).some(item => 
        item.name && waterKeywords.some(kw => item.name.toLowerCase().includes(kw))
      );
      if (hasWaterInvItem) return true;
    } catch (e) {
      console.warn("Failed to check water vehicles", e);
    }
    return false;
  };

  useMapEvents({
    click: (e) => {
      setInspectedLocation(null);

      if (isTraveling || mapMode !== 'travel') return;

      const latlng = e.latlng;
      const clickedLat = latlng.lat;
      const clickedLng = latlng.lng;

      // Convert clicked Leaflet pixel coordinates back to proto coordinates
      const protoX = (clickedLng / mapWidth) * protoWidth;
      const protoY = (1 - (clickedLat / mapHeight)) * protoHeight;

      // Ensure clicked point is within map bounds
      if (protoX < 0 || protoX > protoWidth || protoY < 0 || protoY > protoHeight) {
        return;
      }

      // Check distance from party's current location
      if (!partyLocation) return;

      const px1 = (partyLocation.coordinates?.x ?? partyLocation.position?.[0] ?? 0);
      const py1 = (partyLocation.coordinates?.y ?? partyLocation.position?.[1] ?? 0);

      const dx = protoX - px1;
      const dy = protoY - py1;
      const distProto = Math.sqrt(dx * dx + dy * dy);
      const distMiles = distProto / (4763 / 4000);

      // Determine 1-day travel limit (16 hours)
      const speedMph = getPartySpeedMph();
      const maxMiles = speedMph * 16;

      if (distMiles > maxMiles) {
        alert(`Target locatie is te ver weg voor één dag reizen! Maximale afstand: ${maxMiles.toFixed(1)} mijl. Gekozen: ${distMiles.toFixed(1)} mijl.`);
        return;
      }

      // Handle Terrain-Based Navigation Checks (Water vs. Land)
      const regionId = getRegionAt(protoX, protoY);
      const isWater = regionId === 'water';

      if (isWater) {
        const hasBoat = isWaterVehicleOwned();
        if (!hasBoat) {
          alert("Je kunt niet over water reizen zonder boot!");
          return;
        }
      }

      // Create a custom Wilderness Path destination
      setInspectedLocation({
        id: `wilderness-${Math.round(protoX)}-${Math.round(protoY)}`,
        name: `Wilderness Path (${regionId === 'water' ? 'Water' : 'Land'})`,
        category: regionId === 'water' ? "seas_oceans" : "Wilderness",
        description: `An uncharted stretch of Faerûn's untamed landscapes in ${regionId.replace(/_/g, ' ')}. Click Embark to set off towards these coordinates.`,
        coordinates: { x: protoX, y: protoY },
        image: regionId === 'water' ? "/assets/atlas/world/toril/faerun/seas_oceans/images/trackless_sea.webp" : null
      });
      setIsWorldPanelOpen(true);
    },
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
      onBoundsChange(e.target.getBounds());
    },
    moveend: (e) => {
      onBoundsChange(e.target.getBounds());
    }
  });
  return null;
};

const MapInvalidator = () => {
  const map = useMap();
  const { isWorldPanelOpen, isCharacterPanelOpen } = useUIStore();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).leafletMap = map;
    }
  }, [map]);

  React.useEffect(() => {
    // During sidebar animation (approx 350-500ms), invalidate multiple times for smoothness
    const interval = setInterval(() => {
      map.invalidateSize({ animate: false });
    }, 50);

    const timer = setTimeout(() => {
      clearInterval(interval);
      map.invalidateSize({ animate: true });
    }, 600);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [map, isWorldPanelOpen, isCharacterPanelOpen]);

  return null;
};

export const WorldMap: React.FC = () => {
  const { isMapPanEnabled, setIsMapPanEnabled, setIsWorldPanelOpen, searchQuery } = useUIStore();
  const resetAtlas = useWorldStore(state => state.resetAtlas);
  const partyLocation = useWorldStore(state => state.partyLocation);
  const savedLocations = useWorldStore(state => state.savedLocations);
  const inspectedLocation = useWorldStore(state => state.inspectedLocation);
  const setInspectedLocation = useWorldStore(state => state.setInspectedLocation);
  const addSavedLocations = useWorldStore(state => state.addSavedLocations);
  const isCategoryLoaded = useWorldStore(state => state.isCategoryLoaded);
  const addLoadedCategory = useWorldStore(state => state.addLoadedCategory);
  const discoveredLocationIds = useWorldStore(state => state.discoveredLocationIds);
  const loadDiscoveredLocations = useWorldStore(state => state.loadDiscoveredLocations);

  const isTraveling = useWorldStore(state => state.isTraveling);
  const destination = useWorldStore(state => state.destination);
  const getPartySpeedMph = useWorldStore(state => state.getPartySpeedMph);
  const setMapZoom = useWorldStore(state => state.setMapZoom);
  const mapMode = useWorldStore(state => state.mapMode);
  
  const [hoveredRegion, setHoveredRegion] = React.useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = React.useState<L.LatLngBounds | null>(null);
  const [renderedCount, setRenderedCount] = React.useState(0);
  
  // Faerun Tile configuration (from metadata.json)
  const mapWidth = 21620;
  const mapHeight = 14461;
  const maxZoom = 9;

  // Prototype coordinate system was approx 4763 x 3185
  const protoWidth = 4763;
  const protoHeight = 3185;
  
  // Define full bounds in pixel space
  const bounds: L.LatLngBoundsExpression = [[0, 0], [mapHeight, mapWidth]];
  
  // Scale factor 128 ensures correct tile coordinate mapping for a 32768x32768 projection
  const scaleFactorValue = 128;

  // Custom CRS for Faerun to handle tile coordinate system correctly
  const faerunCRS = React.useMemo(() => L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1 / scaleFactorValue, 0, 1 / scaleFactorValue, 0),
  }), [scaleFactorValue]);

  // Legacy coordinate mapping:
  // Prototype X range [0, 4763] -> High-res X range [0, 21620]
  // Prototype Y range [0, 3185] -> High-res Y range [0, 14461]
  const rescaleX = React.useCallback((x: number) => (x / protoWidth) * mapWidth, [mapWidth, protoWidth]);
  const rescaleY = React.useCallback((y: number) => (y / protoHeight) * mapHeight, [mapHeight, protoHeight]);

  const mapRef = React.useRef<L.Map | null>(null);

  const getPosition = React.useCallback((loc: any): [number, number] | null => {
    if (!loc) return null;
    let x = loc.coordinates?.x ?? loc.coordinates?.lng;
    let y = loc.coordinates?.y ?? loc.coordinates?.lat;

    // If loc.position exists (direct from cities.json), it is [x, y]
    if (loc.position && Array.isArray(loc.position)) {
      x = loc.position[0];
      y = loc.position[1];
    }

    if (x === undefined || y === undefined) return null;

    // Convert to high-res pixel space
    // px is distance from West (Left)
    // py is distance from North (Top)
    const px = rescaleX(x);
    const py = (1 - (y / protoHeight)) * mapHeight;

    return [py, px];
  }, [rescaleX, rescaleY, mapHeight, protoHeight]);

  const initialZoom = 4;
  const [currentZoom, setCurrentZoom] = React.useState(initialZoom);
  const currentMiles = React.useMemo(() => 4000 / Math.pow(2, currentZoom - 3), [currentZoom]);

  // Sync global zoom
  React.useEffect(() => {
    setMapZoom(currentZoom);
  }, [currentZoom, setMapZoom]);

  // Dynamically fetch and cache individual discovered locations
  React.useEffect(() => {
    loadDiscoveredLocations();
  }, [discoveredLocationIds, loadDiscoveredLocations]);

  const exploreArea = useWorldStore(state => state.exploreArea);

  // Automatically explore the area around the party's current location to clear Fog of War
  React.useEffect(() => {
    if (partyLocation) {
      const x = partyLocation.coordinates?.x ?? partyLocation.position?.[0];
      const y = partyLocation.coordinates?.y ?? partyLocation.position?.[1];
      if (x !== undefined && y !== undefined) {
        exploreArea(x, y, 200);
      }
    }
  }, [partyLocation, exploreArea]);

  // Automatically pan map camera to follow party when traveling
  React.useEffect(() => {
    if (isTraveling && partyLocation && mapRef.current) {
      const pos = getPosition(partyLocation);
      if (pos) {
        mapRef.current.panTo(pos, { animate: true, duration: 0.5 });
      }
    }
  }, [isTraveling, partyLocation, getPosition]);

  // Progressive Data Loading
  React.useEffect(() => {
    let isMounted = true;
    const loadTiers = async () => {
      for (const tier of CATEGORY_TIERS) {
        if (currentZoom >= tier.zoom) {
          for (const category of tier.categories) {
            if (!isCategoryLoaded(category)) {
              try {
                const response = await fetch(`/assets/atlas/world/toril/faerun/${category}/${category}.json`);
                if (response.ok && isMounted) {
                  const contentType = response.headers.get('content-type');
                  if (!contentType || !contentType.includes('application/json')) {
                    throw new Error(`Expected JSON but got ${contentType}`);
                  }
                  const data = await response.json();
                  const rawLocations = data.locations || data || [];
                  if (Array.isArray(rawLocations)) {
                    const normalized = rawLocations.map((l: any) => ({
                      ...l,
                      name: l.name || l.popup?.title || l.id?.replace(/_/g, ' '),
                      category: l.category || l.categoryId || l.type || category,
                      id: l.id || (l.name || l.popup?.title)?.toLowerCase().replace(/\s+/g, '_'),
                      image: l.image || l.popup?.image || null,
                      banner: l.banner || l.popup?.banner || null
                    }));
                    addSavedLocations(normalized as SavedLocation[]);
                    addLoadedCategory(category);
                  }
                }
              } catch (e) {
                console.warn(`Failed to load category: ${category}`, e);
              }
            }
          }
        }
      }
    };
    loadTiers();
    return () => { isMounted = false; };
  }, [currentZoom, addLoadedCategory, addSavedLocations, isCategoryLoaded]);

  // Filtering logic for zoom levels to reduce clutter and optimize performance
  const visibleLocations = React.useMemo(() => {
    // We pad the bounds slightly so markers don't pop-in visibly at the exact edge
    const paddedBounds = currentBounds ? currentBounds.pad(0.5) : null;

    return savedLocations.filter(loc => {
      const position = getPosition(loc);
      if (!position) return false;

      const name = (loc.name || loc.popup?.title || '').toLowerCase();
      const cat = (loc.category || loc.categoryId || (loc as any).type || '').toLowerCase();

      // SEARCH OVERRIDE: Show matches regardless of zoom or bounds (for navigation)
      const isSearchMatch = searchQuery && searchQuery.length > 2 && (
        name.includes(searchQuery.toLowerCase()) ||
        cat.includes(searchQuery.toLowerCase())
      );

      // CULLING: Only render markers that are currently visible within the padded viewport
      if (!isSearchMatch && paddedBounds && !paddedBounds.contains(L.latLng(position[0], position[1]))) {
        return false;
      }

      if (isSearchMatch) return true;

      // 1. Category-based exclusion for world map (items that should ONLY be on submaps)
      const cityOnlyCategories = [
        'shop', 'tavern', 'inn', 'house', 'building', 'sewer', 'library', 'guild',
        'blacksmith', 'market', 'district', 'ward'
      ];
      if (cityOnlyCategories.includes(cat)) return false;

      // 2. Tier-based visibility (referencing CATEGORY_TIERS)
      const isDiscoverable = 
         cat.includes('city') || 
         cat.includes('metropolis') || 
         cat.includes('settlement') || 
         cat.includes('fortresses_keeps') || 
         cat.includes('castle') || 
         cat.includes('fortress') || 
         cat.includes('keep') || 
         cat.includes('poi') || 
         cat.includes('points_of_interest') || 
         cat.includes('ruins') || 
         cat.includes('towns_settlements') || 
         cat.includes('village') || 
         cat.includes('landmark') || 
         cat.includes('landmarks');

      const majorCities = ["baldur's gate", 'waterdeep', 'neverwinter', 'luskan', 'athkatla', 'calimport', 'suzail', 'zhentil keep'];
      const isAlwaysVisibleMajorCity = (cat.includes('city') || cat.includes('metropolis')) && majorCities.includes(name);

      if (isDiscoverable && !isAlwaysVisibleMajorCity) {
         if (!discoveredLocationIds.includes(loc.id)) {
            return false;
         }
      }

      if (cat.includes('city') || cat.includes('metropolis')) {
         if (majorCities.includes(name)) return true; // Major cities always visible once loaded
         return currentMiles <= 2000; // Minor cities visible at 2000 miles (Zoom Level 4)
      }

      // We find the tier where this category first appears
      const tier = CATEGORY_TIERS.find(t =>
        t.categories.some(c => cat.includes(c) || c.includes(cat))
      );

      if (tier) {
        return currentMiles <= tier.miles;
      }

      // Default fallback for small zoom
      return currentMiles <= 50;
    })
    .sort((a, b) => {
      const catA = (a.category || a.categoryId || (a as any).type || '').toLowerCase();
      const catB = (b.category || b.categoryId || (b as any).type || '').toLowerCase();
      
      const getPriority = (c: string) => {
        if (['poi', 'ruin', 'dungeon', 'cave', 'graveyard', 'landmark', 'temple', 'shrine'].some(k => c.includes(k))) return 1;
        if (['keep', 'fortress', 'castle', 'tower', 'town', 'settlement', 'village'].some(k => c.includes(k))) return 2;
        if (['city', 'metropolis'].some(k => c.includes(k))) return 3;
        return 4;
      };

      return getPriority(catA) - getPriority(catB);
    })
    .slice(0, 2000);
  }, [savedLocations, currentMiles, currentBounds, getPosition]);

  // Progressive rendering to prevent browser lockup
  React.useEffect(() => {
    setRenderedCount(25); // Initial chunk
    const interval = setInterval(() => {
      setRenderedCount(prev => {
        if (prev >= visibleLocations.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 25; // Render markers in small batches per frame
      });
    }, 16);
    return () => clearInterval(interval);
  }, [visibleLocations]);

  return (
    <div className={cn(
      "w-full h-full bg-[#0F1115] relative font-body fantasy-atlas-frame overflow-hidden",
      isMapPanEnabled ? "cursor-grab active:cursor-grabbing" : "cursor-default"
    )}>
      <div className="absolute inset-0 z-[500] pointer-events-none fantasy-atlas-glow rounded-xl" />

      <MapContainer 
        center={[mapHeight/2, mapWidth/2]} 
        zoom={initialZoom}
        crs={faerunCRS}
        minZoom={3}
        maxZoom={maxZoom}
        scrollWheelZoom={true}
        dragging={isMapPanEnabled && mapMode === 'pan'}
        doubleClickZoom={isMapPanEnabled && mapMode === 'pan'}
        className="w-full h-full grayscale-[0.1] contrast-[1.05] brightness-[0.95]"
        zoomControl={false}
        attributionControl={false}
      >
        <MapInvalidator />
        <TileLayer
          url="/tiles/faerun/{z}/{x}/{y}.png"
          minZoom={3}
          maxZoom={maxZoom}
          maxNativeZoom={7}
          noWrap={true}
          tileSize={256}
        />

        <FogOfWar 
          mapHeight={mapHeight} 
          mapWidth={mapWidth} 
          protoHeight={protoHeight} 
          protoWidth={protoWidth} 
        />

        {/* Regional SVG Overlay - Only visible at high level overview (Level 0) */}
        {currentZoom === 3 && (
          <SVGOverlay bounds={bounds} attributes={{ viewBox: "0 0 1600 1070" }}>
            {Object.entries(REGION_PATH_REGISTRY).map(([id, path]) => (
              <path
                key={id}
                d={path}
                onMouseEnter={() => setHoveredRegion(id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  const meta = REGION_METADATA[id];
                  if (meta && meta.focalPoint && mapRef.current) {
                    // Focal points are [y, x] in high-res pixels, where Y increases North.
                    // Our CRS is Top-Left [0,0], so we must invert Y: (mapHeight - y)
                    mapRef.current.setView(
                      [mapHeight - meta.focalPoint[0], meta.focalPoint[1]],
                      meta.zoom || 4,
                      { animate: true, duration: 1.5 }
                    );
                  }
                }}
                className={`transition-all duration-500 cursor-pointer pointer-events-auto ${
                  hoveredRegion === id ? 'fill-dragon-red/30 stroke-dragon-red/60 stroke-[2px]' : 'fill-transparent stroke-dragon-gold/20 stroke-[1px]'
                }`}
              />
            ))}
          </SVGOverlay>
        )}


        <MapEvents
          mapMode={mapMode}
          onZoomChange={React.useCallback((z: number) => setCurrentZoom(z), [])}
          onBoundsChange={React.useCallback((b: L.LatLngBounds) => setCurrentBounds(b), [])}
          onMapInstance={React.useCallback((map: L.Map) => { mapRef.current = map; }, [])}
        />

        {/* Travel Path */}
        {isTraveling && destination && partyLocation && (
          <Polyline
            positions={[
              getPosition(partyLocation)!,
              getPosition(destination)!
            ]}
            color="#FFD700"
            weight={2}
            dashArray="10, 10"
            opacity={0.6}
          />
        )}

        {/* 1-Day Travel Radius Circle Overlay (16 hours) */}
        {partyLocation && !isTraveling && (
          <Circle
            center={getPosition(partyLocation) || [mapHeight/2, mapWidth/2] as L.LatLngExpression}
            radius={(getPartySpeedMph() * 16) * 5.405} // radius in high-res Leaflet CRS pixels (approx 5.405 pixels per mile)
            color="#D4AF37"
            dashArray="8, 8"
            weight={2}
            fillColor="#D4AF37"
            fillOpacity={0.06}
          />
        )}
        
        {partyLocation && (
          <Marker 
            position={getPosition(partyLocation) || [mapHeight/2, mapWidth/2] as L.LatLngExpression}
            zIndexOffset={2000}
            icon={L.divIcon({
              html: `
                <div class="relative">
                  <div class="absolute inset-0 ${isTraveling ? 'bg-dragon-gold/40' : 'bg-blue-500/40'} blur-md rounded-full animate-pulse scale-150"></div>
                  <div class="relative ${isTraveling ? 'bg-dragon-gold' : 'bg-blue-600'} border-2 border-white w-4 h-4 rounded-full shadow-lg transition-colors duration-1000">
                    ${isTraveling ? `
                      <div class="absolute inset-0 animate-ping bg-dragon-gold rounded-full opacity-75"></div>
                    ` : ''}
                  </div>
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 ${isTraveling ? 'bg-dragon-darkRed border-dragon-gold' : 'bg-blue-900 border-blue-400'} text-white text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap font-bold uppercase tracking-tighter shadow-md">
                    ${isTraveling ? 'Traveling...' : 'Party'}
                  </div>
                </div>
              `,
              className: 'party-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
            eventHandlers={{
              click: () => {
                setInspectedLocation({
                  id: 'party-pos',
                  name: "Party Position",
                  category: "Active Campaign",
                  description: "Your group is currently located here, navigating the vast reaches of the Sword Coast.",
                  image: null
                });
                setIsWorldPanelOpen(true);
              }
            }}
          />
        )}

        {visibleLocations.slice(0, renderedCount).map((loc) => {
          const position = getPosition(loc);
          if (!position) return null;
          const isInspected = inspectedLocation?.id === loc.id;
          const cat = loc.category?.toLowerCase() || '';
          const name = (loc.name || loc.popup?.title || '').toLowerCase();
          
          const isOcean = cat.includes('seas_oceans') || cat.includes('sea') || cat.includes('ocean');
          const isCity = cat.includes('city') || cat.includes('cities');
          const majorCities = ["baldur's gate", 'waterdeep', 'neverwinter', 'luskan', 'athkatla', 'calimport', 'suzail', 'zhentil keep'];
          const isMajorCity = majorCities.includes(name);

          // Labels are permanent for Oceans (2000 miles or less) and Cities (500 miles or less)
          const isPermanent = (isOcean && currentMiles <= 2000) || isMajorCity || (isCity && currentMiles <= 500);

          let zIndex = 100;
          if (isMajorCity) zIndex = 5000;
          else if (isCity) zIndex = 4000;
          else if (cat.includes('town') || cat.includes('settlement')) zIndex = 3000;
          else if (cat.includes('mountain')) zIndex = 500;
          else if (cat.includes('forest')) zIndex = 400;

          return (
            <Marker 
              key={loc.id}
              position={position}
              zIndexOffset={zIndex}
              icon={isOcean ? L.divIcon({ className: 'bg-transparent border-none', html: '' }) : createCustomIcon(loc.category || loc.categoryId || (loc as any).type || 'landmark', isInspected)}
              eventHandlers={{
                click: () => {
                  setInspectedLocation(loc);
                  setIsWorldPanelOpen(true);
                }
              }}
            >
               <Tooltip 
                 direction="center" 
                 offset={[0, 0]} 
                 opacity={1} 
                 permanent={isPermanent}
                 className={isOcean ? "bg-transparent border-none shadow-none !bg-none" : "map-tooltip"}
               >
                 <span className={cn(
                   "font-header font-bold uppercase tracking-[0.2em]",
                   isOcean ? 'text-blue-900/60 text-lg italic mix-blend-multiply pointer-events-none' : 'text-[10px] tracking-tight'
                 )}>
                   {loc.name}
                 </span>
               </Tooltip>
               <Popup className="fantasy-popup">
                  <div className="font-header font-bold text-dragon-red border-b border-dragon-gold/30 pb-1 mb-1">{loc.name}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                    {loc.category?.replace(/_/g, ' ')}
                  </div>
                  {loc.description && (
                    <div className="text-[10px] text-slate-700 leading-tight line-clamp-4 italic">
                      {loc.description.replace(/\[\[|\]\]/g, '')}
                    </div>
                  )}
               </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] z-[400]" />
    </div>
  );
};
