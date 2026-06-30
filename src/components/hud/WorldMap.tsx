import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { useWorldStore, CategoryIcons, SavedLocation } from '../../store/useWorldStore';
import { WORLD_ATLAS_ICONS } from '../../assets/icons/world_atlas';
import { GameIcon } from '../../game_icons';

// Define visibility tiers for categories
const CATEGORY_TIERS = [
  { 
    threshold: 0, 
    files: ['cities/cities.json'], 
    categories: ['cities', 'metropolis', 'city'] 
  },
  { 
    threshold: 2, 
    files: ['towns_settlements/towns_settlements.json'], 
    categories: ['settlement', 'town', 'village'] 
  },
  { 
    threshold: 4, 
    files: [
      'fortresses_keeps/fortresses_keeps.json',
      'mountains/mountain.json'
    ], 
    categories: ['castle', 'fortress', 'keep', 'tower', 'mountain', 'peaks'] 
  },
  { 
    threshold: 5.5, 
    files: [
      'poi/poi.json',
      'ruins/ruins.json',
      'forest/forest.json',
      'wetlands/wetlands.json',
      'waters/waters.json',
      'islands/islands.json',
      'temples_shrines/temples_shrines.json'
    ], 
    categories: ['poi', 'ruin', 'dungeon', 'cave', 'temple', 'shrine', 'forest', 'lake', 'island', 'water'] 
  },
  { 
    threshold: 6.5, 
    files: [
      'roads_trails/roads_trails.json',
      'plains_grasslands/plains_grasslands.json',
      'deserts_wastelands/deserts_wastelands.json',
      'glaciers_tundras/glaciers_tundras.json',
      'oases/oases.json',
      'underdark/underdark.json'
    ], 
    categories: ['road', 'trail', 'grassland', 'plain', 'desert', 'glacier', 'tundra', 'oasis', 'underdark'] 
  }
];

// Helper to create custom markers using World Atlas Icons
const createCustomIcon = (category: string, isInspected: boolean = false) => {
  let catKey = category?.toLowerCase() || '';
  
  // Advanced normalization for diverse atlas data
  if (catKey.includes('city') || catKey.includes('metropolis')) catKey = 'city';
  else if (catKey.includes('town') || catKey.includes('settlement') || catKey.includes('village')) catKey = 'village';
  else if (catKey.includes('ruin')) catKey = 'ruins';
  else if (catKey.includes('dungeon') || catKey.includes('cave')) catKey = 'dungeon';
  else if (catKey.includes('fortress') || catKey.includes('castle') || catKey.includes('keep')) catKey = 'castle';
  else if (catKey.includes('forest') || catKey.includes('wood')) catKey = 'forest';
  else if (catKey.includes('mountain') || catKey.includes('peak') || catKey.includes('hill')) catKey = 'mountains';
  else if (catKey.includes('lake') || catKey.includes('water') || catKey.includes('sea') || catKey.includes('wetland') || catKey.includes('river')) catKey = 'waters';
  else if (catKey.includes('island')) catKey = 'islands';
  else if (catKey.includes('temple') || catKey.includes('shrine')) catKey = 'temples';
  else if (catKey.includes('poi')) catKey = 'poi';
  
  const config = CategoryIcons[catKey] || CategoryIcons[catKey.replace(/s$/, '')] || { icon: 'landmark', color: '#D4AF37' };
  
  let iconKey = config.icon as keyof typeof WORLD_ATLAS_ICONS;
  
  if (catKey === 'village') iconKey = 'village';
  else if (catKey === 'ruins') iconKey = 'ruins';
  else if (catKey === 'mountains') iconKey = 'mountains';
  else if (catKey === 'waters') iconKey = 'waters';
  else if (catKey === 'temples') iconKey = 'temples';
  else if (catKey === 'castle') iconKey = 'castle';
  else if (catKey === 'forest') iconKey = 'forest';
  else if (catKey === 'dungeon') iconKey = 'dungeon';

  const path = WORLD_ATLAS_ICONS[iconKey] || WORLD_ATLAS_ICONS.city;
  const scaleClass = isInspected ? 'scale-125' : 'group-hover:scale-110';
  const color = isInspected ? '#FFD700' : config.color;

  return L.divIcon({
    html: `
      <div class="relative group ${isInspected ? 'z-[1000]' : ''}">
        <div class="absolute inset-0 bg-black/60 blur-lg rounded-full transform scale-50 transition-transform ${scaleClass}"></div>
        ${isInspected ? `
          <div class="absolute inset-[-12px] border-2 border-dragon-gold/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div class="absolute inset-[-6px] border border-dragon-gold/60 rounded-full"></div>
        ` : ''}
        <svg viewBox="0 0 512 512" width="32" height="32" class="relative transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${scaleClass} ${isInspected ? '-translate-y-1' : ''}">
          <path d="${path}" fill="${color}" stroke="rgba(0,0,0,0.9)" stroke-width="12" />
          <path d="${path}" fill="${color}" />
          ${isInspected ? `
            <circle cx="256" cy="256" r="280" fill="none" stroke="#FFD700" stroke-width="15" stroke-dasharray="80 40" class="animate-[spin_12s_linear_infinite]" />
          ` : ''}
        </svg>
      </div>
    `,
    className: 'custom-map-marker',
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

const MapEvents = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
  const { setInspectedLocation } = useWorldStore();
  useMapEvents({
    click: () => {
      setInspectedLocation(null);
    },
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    }
  });
  return null;
};

const MapInvalidator = () => {
  const map = useMap();
  const { isWorldPanelOpen, isCharacterPanelOpen } = useStore();

  React.useEffect(() => {
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
  const { 
    partyLocation, 
    savedLocations, 
    inspectedLocation,
    setInspectedLocation,
    addSavedLocations,
    addLoadedCategory,
    isCategoryLoaded
  } = useWorldStore();
  const { setIsWorldPanelOpen } = useStore();
  
  const mapWidth = 21620;
  const mapHeight = 14461;
  const maxZoom = 7;
  // Leaflet TileLayer {z}/{x}/{y} expects y axis to be inverted if using standard CMS,
  // but with CRS.Simple and L.Transformation(1/scale, 0, 1/scale, 0), 
  // it maps (0,0) to top-left and (height, width) to bottom-right in pixel space.
  const scaleFactor = Math.pow(2, maxZoom); // 128

  const bounds: L.LatLngBoundsExpression = [[0, 0], [mapHeight, mapWidth]];
  
  const faerunCRS = React.useMemo(() => L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1 / scaleFactor, 0, 1 / scaleFactor, 0),
  }), [scaleFactor]);

  const getPosition = React.useCallback((loc: any): [number, number] | null => {
    if (!loc) return null;
    let x, y;
    
    if (loc.position && Array.isArray(loc.position)) {
      // Data follows [y, x] where y is North-South (pixel space)
      y = loc.position[0];
      x = loc.position[1];
    } else if (loc.coordinates) {
       x = loc.coordinates.x ?? loc.coordinates.lng;
       y = loc.coordinates.y ?? loc.coordinates.lat;
    }

    if (x === undefined || y === undefined) return null;
    // Leaflet LatLng in CRS.Simple: [y, x]
    return [y, x];
  }, []);

  const center = React.useMemo((): [number, number] => {
    const pos = getPosition(partyLocation);
    return pos || [mapHeight/2, mapWidth/2];
  }, [partyLocation, getPosition, mapHeight, mapWidth]);
  
  const initialZoom = partyLocation?.zoom || 1;
  const [currentZoom, setCurrentZoom] = React.useState(initialZoom);

  // Progressive Loading Logic
  React.useEffect(() => {
    const basePath = '/assets/atlas/world/toril/faerun/';
    
    const loadTier = async (tierFiles: string[]) => {
      const results = await Promise.all(
        tierFiles.map(async (file) => {
          if (isCategoryLoaded(file)) return [];
          try {
            const res = await fetch(`${basePath}${file}`);
            if (!res.ok) return [];
            const data = await res.json();
            addLoadedCategory(file);
            return data;
          } catch (e) {
            return [];
          }
        })
      );

      const flat = results.flat();
      const mapped: SavedLocation[] = flat.map((item: any) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        name: item.popup?.title || item.name,
        category: item.categoryId || item.type,
        coordinates: item.position ? { lat: item.position[0], lng: item.position[1] } : (item.coordinates ? { lat: item.coordinates.lat, lng: item.coordinates.lng } : undefined),
        description: item.popup?.description || item.description,
        image: item.popup?.image || item.image
      })).filter(l => l.name && l.coordinates);

      addSavedLocations(mapped);
    };

    CATEGORY_TIERS.forEach(tier => {
      if (currentZoom >= tier.threshold) {
        loadTier(tier.files);
      }
    });
  }, [currentZoom, addSavedLocations, addLoadedCategory, isCategoryLoaded]);

  // Filtering logic for zoom levels
  const visibleLocations = React.useMemo(() => savedLocations.filter(loc => {
    const cat = loc.category?.toLowerCase() || '';
    const tier = CATEGORY_TIERS.find(t => t.categories.some(c => cat.includes(c)));
    return tier ? currentZoom >= tier.threshold : currentZoom >= 6.5;
  }), [savedLocations, currentZoom]);

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
      >
        <MapInvalidator />
        <TileLayer
          url="/tiles/faerun/{z}/{x}/{y}.png"
          minZoom={0}
          maxZoom={maxZoom}
          noWrap={true}
          bounds={bounds}
        />
        <ChangeView center={center} zoom={initialZoom} />
        <MapEvents onZoomChange={setCurrentZoom} />
        
        {partyLocation && (
          <Marker 
            position={getPosition(partyLocation) || center as L.LatLngExpression}
            icon={L.divIcon({
              html: `
                <div class="relative">
                  <div class="absolute inset-0 bg-blue-500/40 blur-md rounded-full animate-pulse scale-150"></div>
                  <div class="relative bg-blue-600 border-2 border-white w-4 h-4 rounded-full shadow-lg"></div>
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[9px] px-1.5 py-0.5 rounded border border-blue-400 whitespace-nowrap font-bold uppercase tracking-tighter">Party</div>
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

          return (
            <Marker 
              key={loc.id}
              position={position}
              icon={createCustomIcon(loc.category, isInspected)}
              eventHandlers={{
                click: () => {
                  setInspectedLocation(loc);
                  setIsWorldPanelOpen(true);
                }
              }}
            >
               <Tooltip 
                 direction="top" 
                 offset={[0, -15]} 
                 opacity={1} 
                 className="map-tooltip"
               >
                 <span className="font-header font-bold text-[10px] uppercase tracking-tight">{loc.name}</span>
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
      
      {/* Map Legend */}
      <div className="absolute top-20 left-6 z-[1000] pointer-events-none">
         <div className="bg-parchment-100/90 border-2 border-dragon-gold/50 p-3 rounded-md shadow-2xl flex flex-col gap-2 pointer-events-auto backdrop-blur-sm min-w-[140px]">
            <div className="text-[10px] font-bold text-dragon-red border-b border-dragon-gold/20 pb-1 mb-1 uppercase tracking-widest flex items-center gap-2">
               <GameIcon name="city" size={12} />
               <span>Atlas Legend</span>
            </div>
            {CATEGORY_TIERS.map((tier, idx) => (
               <div key={idx} className={cn(
                 "flex items-center gap-2 transition-opacity",
                 currentZoom < tier.threshold ? "opacity-30" : "opacity-100"
               )}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CategoryIcons[tier.categories[0]]?.color || '#D4AF37' }} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-700">
                    {tier.categories[0]}
                  </span>
                  {currentZoom < tier.threshold && (
                    <div className="ml-auto text-[8px] text-slate-400 font-serif italic">Z{tier.threshold}</div>
                  )}
               </div>
            ))}
         </div>
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] z-[400]" />
      
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
        <div className="bg-parchment-100/90 border-2 border-dragon-gold/50 p-1 rounded-md shadow-lg flex flex-col">
          <div className="text-[9px] text-center font-bold text-dragon-red border-b border-dragon-gold/20 mb-1 pb-1 uppercase">Zoom</div>
          <div className="text-center font-header font-bold text-lg text-dragon-red">{Math.round(currentZoom * 10) / 10}</div>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
