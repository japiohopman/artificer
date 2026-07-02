import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, SVGOverlay, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../store/useUIStore';
import { useWorldStore, CategoryIcons, SavedLocation } from '../../store/useWorldStore';
import { WORLD_ATLAS_ICONS } from '../../assets/icons/world_atlas';
import { MapLegend } from './game/MapLegend';
import { FogOfWar } from './game/FogOfWar';
import { REGION_METADATA, REGION_PATH_REGISTRY } from '../../data/regions';

const CATEGORY_TIERS = [
  { zoom: 0, categories: ['seas_oceans', 'regions', 'cities', 'mountains', 'forest', 'islands', 'deserts_wastelands', 'glaciers_tundras', 'oases', 'plains_grasslands', 'wetlands'] },
  { zoom: 2, categories: ['rivers', 'lakes', 'bays', 'coasts', 'sub_regions'] },
  { zoom: 3, categories: ['fortresses_keeps', 'towns_settlements', 'underdark'] },
  { zoom: 4, categories: ['ruins', 'poi', 'landmarks', 'temples', 'shrines'] },
  { zoom: 5, categories: ['roads_trails', 'graveyards', 'dungeons', 'caves'] }
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
  else if (cat.includes('swamp') || cat.includes('marsh') || cat.includes('wetland')) catKey = 'wetlands';
  else if (cat.includes('grassland') || cat.includes('plains') || cat.includes('field') || cat.includes('grass')) catKey = 'grassland';
  else if (cat.includes('desert') || cat.includes('oasis') || cat.includes('waste')) catKey = 'desert';
  else if (cat.includes('arctic') || cat.includes('glacier') || cat.includes('tundra')) catKey = 'arctic';
  else if (cat.includes('coast') || cat.includes('beach') || cat.includes('bay') || cat.includes('port')) catKey = 'waters';
  
  const config = CategoryIcons[catKey] || 
                 CategoryIcons[catKey.replace(/ies$/, 'y')] || 
                 CategoryIcons[catKey.replace(/s$/, '')] || 
                 CategoryIcons[catKey + 's'] ||
                 { icon: 'landmark', color: '#D4AF37' };
  
  // Use mapping to WORLD_ATLAS_ICONS
  const iconKey = config.icon as keyof typeof WORLD_ATLAS_ICONS;
  const path = WORLD_ATLAS_ICONS[iconKey] || WORLD_ATLAS_ICONS.landmark || WORLD_ATLAS_ICONS.city;
  
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

        <!-- Icon SVG -->
        <svg viewBox="0 0 512 512" width="32" height="32" overflow="visible" class="relative transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${scaleClass} ${isInspected ? '-translate-y-1' : ''}">
          <path d="${path}" fill="${config.color}" stroke="rgba(0,0,0,0.9)" stroke-width="12" />
          <path d="${path}" fill="${config.color}" />
          ${isInspected ? `
            <circle cx="256" cy="256" r="280" fill="none" stroke="#FFD700" stroke-width="15" stroke-dasharray="80 40" class="animate-[spin_12s_linear_infinite]" />
          ` : ''}
        </svg>
      </div>
    `,
    className: `custom-map-marker atlas-marker-${catKey}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  const lastTarget = React.useRef<string>("");

  React.useEffect(() => {
    if (!center) return;
    const targetKey = `${center[0].toFixed(4)},${center[1].toFixed(4)},${zoom}`;
    if (lastTarget.current !== targetKey) {
      map.setView(center, zoom, { animate: true, duration: 1.5 });
      lastTarget.current = targetKey;
    }
  }, [center, zoom, map]);
  return null;
};

const MapEvents = ({
  onZoomChange,
  onBoundsChange,
  onMapInstance
}: {
  onZoomChange: (zoom: number) => void;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onMapInstance: (map: L.Map) => void;
}) => {
  const { setInspectedLocation } = useWorldStore();
  const map = useMap();

  React.useEffect(() => {
    onMapInstance(map);
    if (map) {
      onBoundsChange(map.getBounds());
    }
  }, [map, onMapInstance, onBoundsChange]);

  useMapEvents({
    click: () => {
      setInspectedLocation(null);
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

const PartyMarker = ({ 
  getPosition, 
  center 
}: { 
  getPosition: (loc: any) => [number, number] | null,
  center: [number, number]
}) => {
  const map = useMap();
  const partyLocation = useWorldStore(state => state.partyLocation);
  const isTraveling = useWorldStore(state => state.isTraveling);
  const setInspectedLocation = useWorldStore(state => state.setInspectedLocation);
  const setIsWorldPanelOpen = useUIStore(state => state.setIsWorldPanelOpen);

  const pos = React.useMemo(() => getPosition(partyLocation) || center, [partyLocation, getPosition, center]);
  
  // We use a standard Marker but we'll add a CSS transition to its icon container
  // via a global style or by targeting the specific class.
  // However, for TRULY smooth movement that survives Leaflet's zoom/pan, 
  // we can use a custom Leaflet component or just a really good transition.

  return (
    <Marker 
      position={pos as L.LatLngExpression}
      zIndexOffset={2000}
      icon={L.divIcon({
        html: `
          <div class="relative party-token-container">
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
        className: 'party-marker-smooth',
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
  );
};

const MapInvalidator = () => {
  const map = useMap();
  const { isWorldPanelOpen, isCharacterPanelOpen } = useUIStore();

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
  const partyLocation = useWorldStore(state => state.partyLocation);
  const savedLocations = useWorldStore(state => state.savedLocations);
  const inspectedLocation = useWorldStore(state => state.inspectedLocation);
  const setInspectedLocation = useWorldStore(state => state.setInspectedLocation);
  const addSavedLocations = useWorldStore(state => state.addSavedLocations);
  const isCategoryLoaded = useWorldStore(state => state.isCategoryLoaded);
  const addLoadedCategory = useWorldStore(state => state.addLoadedCategory);
  const isTraveling = useWorldStore(state => state.isTraveling);
  const destination = useWorldStore(state => state.destination);
  const setMapZoom = useWorldStore(state => state.setMapZoom);
  
  const setIsWorldPanelOpen = useUIStore(state => state.setIsWorldPanelOpen);
  const [hoveredRegion, setHoveredRegion] = React.useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = React.useState<L.LatLngBounds | null>(null);
  
  // Faerun Tile configuration (from metadata.json)
  const mapWidth = 21620;
  const mapHeight = 14461;
  const maxZoom = 7;

  // Prototype coordinate system was approx 4763 x 3185
  const protoWidth = 4763;
  const protoHeight = 3185;
  
  // Define full bounds in pixel space
  const bounds: L.LatLngBoundsExpression = [[0, 0], [mapHeight, mapWidth]];
  
  // Scale factor 16 means zoom 0 will be 21620 / 16 = 1351px wide
  const scaleFactorValue = 16;

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
  }, [rescaleX, rescaleY]);

  const center = React.useMemo((): [number, number] => 
    partyLocation ? getPosition(partyLocation) || [mapHeight/2, mapWidth/2] : [mapHeight/2, mapWidth/2]
  , [partyLocation, getPosition, mapHeight, mapWidth]);
  
  const initialZoom = partyLocation?.zoom ?? 0;
  const [currentZoom, setCurrentZoom] = React.useState(initialZoom);

  // Sync global zoom
  React.useEffect(() => {
    setMapZoom(currentZoom);
  }, [currentZoom, setMapZoom]);

  // Progressive Data Loading
  React.useEffect(() => {
    let isMounted = true;
    const loadTiers = async () => {
      for (const tier of CATEGORY_TIERS) {
        if (currentZoom >= tier.zoom) {
          for (const category of tier.categories) {
            if (!isCategoryLoaded(category)) {
              // Mark as loaded immediately to prevent parallel duplicate loads
              addLoadedCategory(category);
              try {
                const response = await fetch(`/assets/atlas/world/toril/faerun/${category}/${category}.json`);
                if (response.ok && isMounted) {
                  const data = await response.json();
                  const rawLocations = data.locations || data || [];
                  if (Array.isArray(rawLocations)) {
                    const normalized = rawLocations.map((l: any) => ({
                      ...l,
                      name: l.name || l.popup?.title || l.id?.replace(/_/g, ' '),
                      category: l.category || l.categoryId || category,
                      id: l.id || (l.name || l.popup?.title)?.toLowerCase().replace(/\s+/g, '_')
                    }));
                    addSavedLocations(normalized as SavedLocation[]);
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
  }, [currentZoom]); // Removed function deps to prevent excessive re-runs

  // Filtering logic for zoom levels to reduce clutter and optimize performance
  const visibleLocations = React.useMemo(() => {
    const majorCities = ["baldur's gate", 'waterdeep', 'neverwinter', 'luskan', 'athkatla', 'calimport', 'suzail', 'zhentil keep'];
    
    return savedLocations.filter(loc => {
      const position = getPosition(loc);
      if (!position) return false;
      
      // Viewport filtering
      if (currentBounds && !currentBounds.contains(L.latLng(position[0], position[1]))) {
        return false;
      }

      const cat = loc.category?.toLowerCase() || '';
      const name = (loc.name || loc.popup?.title || '').toLowerCase();

      const isMajorCity = majorCities.includes(name);

      // Level 0: Regions (Handled by SVGOverlay)
      
      // Level 0: Global Features, Seas, Regions, Major Cities, Major Terrain
      if (currentZoom >= 0) {
        if (cat.includes('seas_oceans') || cat.includes('sea') || cat.includes('ocean') || cat.includes('region') || cat.includes('continent')) return true;
        if (isMajorCity) return true;
        if (cat.includes('city') || cat.includes('cities') || cat.includes('metropolis')) return true;
        if (cat.includes('mountain') || cat.includes('peak') || cat.includes('hill') || 
            cat.includes('forest') || cat.includes('wood') ||
            cat.includes('island') || cat.includes('desert') || cat.includes('wasteland') ||
            cat.includes('glacier') || cat.includes('tundra') || cat.includes('oasis') ||
            cat.includes('plains') || cat.includes('grassland') || cat.includes('wetland') || cat.includes('swamp')) {
          return true;
        }
      }

      // Level 2: Water Features & Sub-regions
      if (currentZoom >= 2) {
        if (cat.includes('river') || cat.includes('lake') || cat.includes('bay') || cat.includes('coast') || cat.includes('sub_region')) {
          return true;
        }
      }

      // Level 3: Towns & Settlements & Underdark
      if (currentZoom >= 3) {
        if (cat.includes('town') || cat.includes('settlement') || cat.includes('village') ||
            cat.includes('fortress') || cat.includes('keep') || cat.includes('castle') || cat.includes('tower') ||
            cat.includes('underdark')) {
          return true;
        }
      }

      // Level 5: POIs, Ruins, Dungeons
      if (currentZoom >= 5) {
        if (cat.includes('ruin') || cat.includes('poi') || cat.includes('landmark') || 
            cat.includes('temple') || cat.includes('shrine') || cat.includes('dungeon') || cat.includes('cave')) {
          return true;
        }
      }

      // Level 6: Roads, Trails, Everything else
      if (currentZoom >= 6) {
        return true;
      }

      return false;
    })
    .sort((a, b) => {
      const aName = (a.name || a.popup?.title || '').toLowerCase();
      const bName = (b.name || b.popup?.title || '').toLowerCase();
      const aIsMajor = majorCities.includes(aName) ? 1 : 0;
      const bIsMajor = majorCities.includes(bName) ? 1 : 0;
      if (aIsMajor !== bIsMajor) return bIsMajor - aIsMajor;

      const aIsCity = (a.category || '').toLowerCase().includes('city') ? 1 : 0;
      const bIsCity = (b.category || '').toLowerCase().includes('city') ? 1 : 0;
      if (aIsCity !== bIsCity) return bIsCity - aIsCity;

      return 0;
    })
    .slice(0, 2000);
  }, [savedLocations, currentZoom, currentBounds, getPosition]);

  // Debug count
  React.useEffect(() => {
    if (savedLocations.length > 0) {
      const pos = getPosition(savedLocations[0]);
      console.log(`Z: ${currentZoom}, Total: ${savedLocations.length}, Visible: ${visibleLocations.length}, Bounds: ${currentBounds?.toBBoxString()}, SamplePos: ${pos}`);
    }
  }, [visibleLocations.length, currentZoom, savedLocations, currentBounds, getPosition]);

  return (
    <div className="w-full h-full bg-[#0F1115] overflow-hidden relative font-body">
      <MapContainer 
        center={center as L.LatLngExpression} 
        zoom={initialZoom} 
        crs={faerunCRS}
        minZoom={0}
        maxZoom={maxZoom}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        className="w-full h-full grayscale-[0.1] contrast-[1.05] brightness-[0.95]"
        zoomControl={false}
        attributionControl={false}
      >
        <MapInvalidator />
        <TileLayer
          url="/tiles/faerun/{z}/{x}/{y}.png"
          minZoom={0}
          maxZoom={maxZoom}
          noWrap={true}
          tileSize={256}
        />

        <FogOfWar 
          mapHeight={mapHeight} 
          mapWidth={mapWidth} 
          protoHeight={protoHeight} 
          protoWidth={protoWidth} 
        />

        {/* Regional SVG Overlay - Only visible at high level overview */}
        {currentZoom < 3 && (
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

        <ChangeView center={center} zoom={initialZoom} />
        <MapEvents
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
        
        {partyLocation && (
          <Marker 
            position={getPosition(partyLocation) || center as L.LatLngExpression}
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

        {visibleLocations.map((loc) => {
          const position = getPosition(loc);
          if (!position) return null;
          const isInspected = inspectedLocation?.id === loc.id;
          const cat = loc.category?.toLowerCase() || '';
          const name = (loc.name || loc.popup?.title || '').toLowerCase();
          
          const isOcean = cat.includes('seas_oceans') || cat.includes('sea') || cat.includes('ocean');
          const isCity = cat.includes('city') || cat.includes('cities');
          const majorCities = ["baldur's gate", 'waterdeep', 'neverwinter', 'luskan', 'athkatla', 'calimport', 'suzail', 'zhentil keep'];
          const isMajorCity = majorCities.includes(name);

          // Labels are permanent for Oceans (Zoom 1+) and Cities (Zoom 3+)
          const isPermanent = (isOcean && currentZoom >= 1) || isMajorCity || (isCity && currentZoom >= 3);

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
              icon={isOcean ? L.divIcon({ className: 'bg-transparent border-none', html: '' }) : createCustomIcon(loc.category || loc.categoryId, isInspected)}
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
      
      {/* Map Legend - Removed from here, moved to ChatPanel */}
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2 items-end">
        <div className="flex flex-col gap-1 mb-2">
           <button 
             onClick={() => mapRef.current?.zoomIn()}
             className="w-10 h-10 bg-parchment-100 border-2 border-dragon-gold text-dragon-red font-black text-xl flex items-center justify-center rounded shadow-lg hover:bg-parchment-200 active:scale-95 pointer-events-auto"
             title="Zoom In"
           >
             +
           </button>
           <button 
             onClick={() => mapRef.current?.zoomOut()}
             className="w-10 h-10 bg-parchment-100 border-2 border-dragon-gold text-dragon-red font-black text-xl flex items-center justify-center rounded shadow-lg hover:bg-parchment-200 active:scale-95 pointer-events-auto"
             title="Zoom Out"
           >
             −
           </button>
        </div>
        <div className="bg-parchment-100/90 border-2 border-dragon-gold/50 p-2 rounded-md shadow-lg flex flex-col min-w-[100px] pointer-events-auto">
          <div className="text-[9px] text-center font-black text-dragon-red border-b border-dragon-gold/20 mb-1 pb-1 uppercase tracking-widest">Map Scale</div>
          <div className="text-center font-header font-black text-xl text-dragon-red">
            {Math.round(4000 / Math.pow(2, currentZoom))} <span className="text-xs">Miles</span>
          </div>
          <div className="text-[7px] text-center font-bold text-dragon-red/40 uppercase mt-1">Level {Math.round(currentZoom)}</div>
        </div>
      </div>
    </div>
  );
};
