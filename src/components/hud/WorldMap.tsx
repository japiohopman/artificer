import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useWorldStore, CategoryIcons } from '../../store/useWorldStore';
import { WORLD_ATLAS_ICONS } from '../../assets/icons/world_atlas';
import { cn } from '../../lib/utils';

const CATEGORY_TIERS = [
  { minZoom: 0, categories: ['waters/waters.json', 'glaciers_tundras/glaciers_tundras.json', 'wetlands/wetlands.json'] },
  { minZoom: 1, categories: ['deserts_wastelands/deserts_wastelands.json', 'plains_grasslands/plains_grasslands.json', 'islands/islands.json'] },
  { minZoom: 2, categories: ['forest/forest.json', 'mountains/mountain.json', 'oases/oases.json'] },
  { minZoom: 3, categories: ['cities/cities.json', 'fortresses_keeps/fortresses_keeps.json', 'towns_settlements/towns_settlements.json'] },
  { minZoom: 4, categories: ['poi/poi.json', 'ruins/ruins.json', 'underdark/underdark.json', 'roads_trails/roads_trails.json'] }
];

// Helper to create custom markers using GameIcons
const createCustomIcon = (category: string) => {
  let catKey = category?.toLowerCase() || '';

  // Advanced normalization for diverse atlas data
  if (catKey.includes('city')) catKey = 'city';
  else if (catKey.includes('town') || catKey.includes('settlement')) catKey = 'village';
  else if (catKey.includes('ruin') || catKey.includes('dungeon')) catKey = 'dungeon';
  else if (catKey.includes('fortress') || catKey.includes('castle') || catKey.includes('keep')) catKey = 'castle';
  else if (catKey.includes('forest') || catKey.includes('wood')) catKey = 'forest';
  else if (catKey.includes('mountain') || catKey.includes('peak')) catKey = 'mountain';
  else if (catKey.includes('lake') || catKey.includes('water') || catKey.includes('sea')) catKey = 'wetlands';
  else if (catKey.includes('glacier') || catKey.includes('tundra')) catKey = 'glacier';
  else if (catKey.includes('desert') || catKey.includes('wasteland')) catKey = 'desert';
  else if (catKey.includes('island')) catKey = 'island';
  else if (catKey.includes('plain') || catKey.includes('grassland')) catKey = 'plains';
  else if (catKey.includes('underdark')) catKey = 'underdark';

  const config = CategoryIcons[catKey] || CategoryIcons[catKey.replace(/s$/, '')] || { icon: 'landmark', color: '#D4AF37' };
  const iconName = config.icon as keyof typeof WORLD_ATLAS_ICONS;
  let path = WORLD_ATLAS_ICONS[iconName];
  
  // Fallback for empty icon paths in the library
  if (!path || path === "") {
    path = WORLD_ATLAS_ICONS.landmark;
  }

  return L.divIcon({
    html: `
      <div class="relative group">
        <div class="absolute inset-0 bg-black/40 blur-md rounded-full transform scale-75 group-hover:scale-90 transition-transform"></div>
        <svg viewBox="0 0 512 512" width="32" height="32" class="relative drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] transition-all group-hover:scale-110 group-hover:-translate-y-1">
          <path d="${path}" fill="${config.color}" stroke="rgba(0,0,0,0.8)" stroke-width="12" />
          <path d="${path}" fill="${config.color}" />
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
    const targetKey = `${center[0]},${center[1]},${zoom}`;
    if (lastTarget.current !== targetKey) {
      map.setView(center, zoom);
      lastTarget.current = targetKey;
    }
  }, [center, zoom, map]);
  return null;
};

const MapEvents = ({ onZoomChange, onBoundsChange }: { onZoomChange: (zoom: number) => void, onBoundsChange: (bounds: L.LatLngBounds) => void }) => {
  const { setInspectedLocation } = useWorldStore();
  const map = useMap();

  React.useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

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

const MapLegend: React.FC<{ currentZoom: number }> = ({ currentZoom }) => {
  const legendItems = [
    { label: 'Natural Features', minZoom: 0, icons: ['wetlands', 'glacier'] },
    { label: 'Regions', minZoom: 1, icons: ['desert', 'plains', 'island'] },
    { label: 'Landmarks', minZoom: 2, icons: ['forest', 'mountain'] },
    { label: 'Settlements', minZoom: 3, icons: ['city', 'village', 'castle'] },
    { label: 'Discovery', minZoom: 4, icons: ['dungeon', 'poi', 'landmark'] },
  ];

  return (
    <div className="absolute bottom-8 right-8 z-[500] bg-parchment-100/90 backdrop-blur-md border-2 border-dragon-red/30 p-4 rounded-lg shadow-2xl w-48 font-body">
      <div className="flex items-center gap-2 mb-3 border-b border-dragon-red/20 pb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-dragon-red animate-pulse" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-dragon-red">Map Legend</h4>
      </div>
      <div className="space-y-4">
        {legendItems.map((item, idx) => (
          <div key={idx} className={cn(
            "flex flex-col gap-1.5 transition-all duration-500",
            currentZoom < item.minZoom ? "opacity-20 grayscale scale-95 origin-right" : "opacity-100"
          )}>
            <div className="flex items-center justify-between">
               <span className="text-[8px] font-black uppercase tracking-tighter text-parchment-600">{item.label}</span>
               <div className="flex items-center gap-1">
                 <span className="text-[7px] font-black text-dragon-red/40">LVL</span>
                 <span className="text-[9px] font-black text-dragon-red">{item.minZoom}</span>
               </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.icons.map(icon => {
                const config = CategoryIcons[icon] || { color: '#D4AF37' };
                const path = WORLD_ATLAS_ICONS[icon as keyof typeof WORLD_ATLAS_ICONS] || WORLD_ATLAS_ICONS.landmark;
                return (
                  <div key={icon} title={icon} className="w-7 h-7 flex items-center justify-center bg-black/10 rounded-sm border border-dragon-gold/10 shadow-inner group hover:border-dragon-gold/40 transition-colors">
                    <svg viewBox="0 0 512 512" width="18" height="18" className="drop-shadow-sm group-hover:scale-110 transition-transform">
                       <path d={path} fill={config.color} />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-dragon-red/10 flex items-center justify-between">
         <span className="text-[7px] font-black text-parchment-400 uppercase tracking-widest">Zoom Level</span>
         <span className="text-xs font-header font-black text-dragon-red leading-none">{currentZoom} / 7</span>
      </div>
    </div>
  );
};

const MapInvalidator = () => {
  const map = useMap();
  const { isWorldPanelOpen, isCharacterPanelOpen } = useStore();
  const { isInventoryOpen } = useInventoryStore();

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
  }, [map, isWorldPanelOpen, isCharacterPanelOpen, isInventoryOpen]);

  return null;
};

export const WorldMap: React.FC = () => {
  const { 
    partyLocation, 
    savedLocations, 
    setInspectedLocation,
    addSavedLocations,
    addLoadedCategory,
    isCategoryLoaded
  } = useWorldStore();
  const { setIsWorldPanelOpen } = useStore();
  
  const initialZoom = partyLocation?.zoom || 0;
  const [currentZoom, setCurrentZoom] = React.useState(initialZoom);
  const [mapBounds, setMapBounds] = React.useState<L.LatLngBounds | null>(null);

  // Progressive Loading Effect
  React.useEffect(() => {
    const basePath = '/assets/atlas/world/toril/faerun/';
    
    // Find all tiers that should be loaded for the current zoom
    const tiersToLoad = CATEGORY_TIERS.filter(tier => currentZoom >= tier.minZoom);
    
    tiersToLoad.forEach(tier => {
      tier.categories.forEach(cat => {
        if (!isCategoryLoaded(cat)) {
          fetch(`${basePath}${cat}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
              const mapped = data.map((item: any) => ({
                id: item.id,
                name: item.popup?.title || item.name,
                category: item.categoryId || item.type,
                coordinates: item.position ? { x: item.position[0], y: item.position[1] } : (item.coordinates ? { x: item.coordinates.lng, y: item.coordinates.lat } : undefined),
                description: item.popup?.description || item.description,
                image: item.popup?.image || item.image
              })).filter((item: any) => item.coordinates);

              addSavedLocations(mapped);
              addLoadedCategory(cat);
            })
            .catch(err => console.error(`Failed to load category ${cat}:`, err));
        }
      });
    });
  }, [currentZoom, isCategoryLoaded, addSavedLocations, addLoadedCategory]);

  // Faerun Tile configuration (from metadata.json)
  const mapWidth = 21620;
  const mapHeight = 14461;
  const maxZoom = 7;

  // Custom CRS for Faerun to handle tile coordinate system correctly
  // y increases downwards in tiles, so we use Transformation(1, 0, 1, 0)
  const faerunCRS = React.useMemo(() => L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1, 0, 1, 0)
  }), []);

  // Rescale factors from prototype 5000-unit grid to actual pixels at max zoom
  const scaleX = mapWidth / 5000;
  const scaleY = mapHeight / 5000;

  // We'll use logical units such that 1 unit = 1 pixel at zoom 0.
  // The full image at zoom 0 is mapWidth/128 x mapHeight/128 pixels.
  const bounds: L.LatLngBoundsExpression = [[0, 0], [mapHeight / 128, mapWidth / 128]];

  const rescaleX = (x: number) => (x * scaleX) / 128;
  // In our custom CRS, lat=0 is Top, so we invert Y to keep North at top
  const rescaleY = (y: number) => ((5000 - y) * scaleY) / 128;

  const getPosition = React.useCallback((loc: any): [number, number] | null => {
    if (!loc) return null;
    const x = loc.coordinates?.x ?? loc.coordinates?.lng;
    const y = loc.coordinates?.y ?? loc.coordinates?.lat;
    if (x === undefined || y === undefined) return null;
    return [rescaleY(y), rescaleX(x)];
  }, [rescaleX, rescaleY]);

  const center = React.useMemo((): [number, number] =>
    partyLocation ? getPosition(partyLocation) || [rescaleY(2500), rescaleX(2500)] : [rescaleY(2500), rescaleX(2500)]
  , [partyLocation, getPosition, rescaleY, rescaleX]);
  
  const zoom = partyLocation?.zoom || 0;

  // Progressive visibility based on tiers and viewport culling
  const visibleLocations = React.useMemo(() => {
    return savedLocations.filter(loc => {
      const cat = loc.category?.toLowerCase() || '';
      
      // 1. Tier-based filtering
      let locTier = 4; // Default to last tier
      if (cat.includes('water') || cat.includes('sea') || cat.includes('glacier')) locTier = 0;
      else if (cat.includes('desert') || cat.includes('plain') || cat.includes('island')) locTier = 1;
      else if (cat.includes('forest') || cat.includes('mountain') || cat.includes('oases')) locTier = 2;
      else if (cat.includes('city') || cat.includes('town') || cat.includes('settlement') || cat.includes('fortress') || cat.includes('keep')) locTier = 3;

      if (currentZoom < locTier) return false;

      // 2. Viewport culling
      if (!mapBounds) return true;
      const pos = getPosition(loc);
      if (!pos) return false;
      
      // Leaflet LatLngBounds.contains expects [lat, lng]
      return mapBounds.contains(pos as L.LatLngExpression);
    });
  }, [savedLocations, currentZoom, mapBounds, getPosition]);

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      <MapContainer 
        center={center as L.LatLngExpression}
        zoom={zoom} 
        crs={faerunCRS}
        minZoom={0}
        maxZoom={maxZoom}
        scrollWheelZoom={true}
        className="w-full h-full grayscale-[0.2] contrast-[1.1] brightness-[0.9]"
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
        <ChangeView center={center} zoom={zoom} />
        <MapEvents onZoomChange={setCurrentZoom} onBoundsChange={setMapBounds} />
        
        {partyLocation && (
          <Marker 
            position={getPosition(partyLocation) || center as L.LatLngExpression}
            icon={L.icon({
               iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
               iconSize: [25, 41],
               iconAnchor: [12, 41]
            })}
            eventHandlers={{
              click: () => {
                setInspectedLocation({
                  id: 'party-pos',
                  name: "Party Position",
                  category: "Active Campaign",
                  description: "Your group is currently located here, navigating the vast reaches of the world.",
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

          return (
            <Marker 
              key={loc.id}
              position={position}
              icon={createCustomIcon(loc.category)}
              eventHandlers={{
                click: () => {
                  setInspectedLocation(loc);
                  setIsWorldPanelOpen(true);
                }
              }}
            >
               <Popup className="fantasy-popup">
                  <div className="font-header font-bold text-dragon-red border-b border-dragon-gold/30 pb-1 mb-1">{loc.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    {loc.category?.replace(/_/g, ' ')}
                  </div>
               </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <MapLegend currentZoom={currentZoom} />

      {/* Map Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-[400]" />
    </div>
  );
};
