import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useWorldStore, CategoryIcons } from '../../store/useWorldStore';
import { WORLD_ATLAS_ICONS } from '../../assets/icons/world_atlas';

// Helper to create custom markers using World Atlas Icons
const createCustomIcon = (category: string, isInspected: boolean = false) => {
  let catKey = category?.toLowerCase() || '';

  // Advanced normalization for diverse atlas data
  if (catKey.includes('city')) catKey = 'city';
  else if (catKey.includes('town') || catKey.includes('settlement') || catKey.includes('village')) catKey = 'village';
  else if (catKey.includes('ruin')) catKey = 'ruins';
  else if (catKey.includes('dungeon') || catKey.includes('cave')) catKey = 'dungeon';
  else if (catKey.includes('fortress') || catKey.includes('castle') || catKey.includes('keep')) catKey = 'castle';
  else if (catKey.includes('forest') || catKey.includes('wood')) catKey = 'forest';
  else if (catKey.includes('mountain') || catKey.includes('peak')) catKey = 'mountains';
  else if (catKey.includes('lake') || catKey.includes('water') || catKey.includes('sea') || catKey.includes('wetland')) catKey = 'waters';
  else if (catKey.includes('island')) catKey = 'islands';
  else if (catKey.includes('temple') || catKey.includes('shrine')) catKey = 'temples';

  const config = CategoryIcons[catKey] || CategoryIcons[catKey.replace(/s$/, '')] || { icon: 'landmark', color: '#D4AF37' };

  // Use mapping to WORLD_ATLAS_ICONS
  let iconKey = config.icon as keyof typeof WORLD_ATLAS_ICONS;
  if (catKey === 'village') iconKey = 'village';
  if (catKey === 'ruins') iconKey = 'ruins';
  if (catKey === 'mountains') iconKey = 'mountains';
  if (catKey === 'waters') iconKey = 'waters';
  if (catKey === 'temples') iconKey = 'temples';
  if (catKey === 'castle') iconKey = 'castle';
  if (catKey === 'forest') iconKey = 'forest';

  const path = WORLD_ATLAS_ICONS[iconKey] || WORLD_ATLAS_ICONS.landmark || WORLD_ATLAS_ICONS.city;

  const scale = isInspected ? 'scale-125' : 'group-hover:scale-110';

  return L.divIcon({
    html: `
      <div class="relative group ${isInspected ? 'z-[1000]' : ''}">
        <div class="absolute inset-0 bg-black/60 blur-lg rounded-full transform scale-50 transition-transform ${scale}"></div>
        <svg viewBox="0 0 512 512" width="28" height="28" class="relative transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${scale} ${isInspected ? '-translate-y-1' : ''}">
          <path d="${path}" fill="${config.color}" stroke="rgba(0,0,0,0.9)" stroke-width="16" />
          <path d="${path}" fill="${config.color}" />
          ${isInspected ? `<circle cx="256" cy="256" r="280" fill="none" stroke="#D4AF37" stroke-width="20" stroke-dasharray="80 40" class="animate-[spin_8s_linear_infinite]" />` : ''}
        </svg>
      </div>
    `,
    className: 'custom-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
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
    inspectedLocation,
    setInspectedLocation 
  } = useWorldStore();
  const { setIsWorldPanelOpen } = useStore();
  
  // Faerun Tile configuration (from metadata.json)
  const mapWidth = 21620;
  const mapHeight = 14461;
  const maxZoom = 7;

  // Prototype coordinate system was approx 4763 x 3185
  const protoWidth = 4763;
  const protoHeight = 3185;

  // At zoom 0, the map is contained in a 256x256 space in Leaflet L.CRS.Simple.
  const width0 = mapWidth / Math.pow(2, maxZoom);   // 168.90625
  const height0 = mapHeight / Math.pow(2, maxZoom); // 112.9765625

  const bounds: L.LatLngBoundsExpression = [[0, 0], [height0, width0]];

  // Custom CRS for Faerun to handle tile coordinate system correctly
  const faerunCRS = React.useMemo(() => L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(1, 0, 1, 0)
  }), []);

  const rescaleX = React.useCallback((x: number) => (x / protoWidth) * width0, [width0, protoWidth]);
  const rescaleY = React.useCallback((y: number) => (1 - (y / protoHeight)) * height0, [height0, protoHeight]);

  const getPosition = React.useCallback((loc: any): [number, number] | null => {
    if (!loc) return null;
    const x = loc.coordinates?.x ?? loc.coordinates?.lng;
    const y = loc.coordinates?.y ?? loc.coordinates?.lat;
    if (x === undefined || y === undefined) return null;
    return [rescaleY(y), rescaleX(x)];
  }, [rescaleX, rescaleY]);

  const center = React.useMemo((): [number, number] => 
    partyLocation ? getPosition(partyLocation) || [height0/2, width0/2] : [height0/2, width0/2]
  , [partyLocation, getPosition, height0, width0]);

  const initialZoom = partyLocation?.zoom || 1;
  const [currentZoom, setCurrentZoom] = React.useState(initialZoom);

  // Filtering logic for zoom levels
  const visibleLocations = React.useMemo(() => savedLocations.filter(loc => {
    const cat = loc.category?.toLowerCase() || '';

    // Always show major cities
    if (cat.includes('city') || cat.includes('cities')) return true;

    // Zoom 2+: Show towns and large settlements
    if (currentZoom >= 2) {
      if (cat.includes('town') || cat.includes('settlement') || cat.includes('village')) return true;
    }

    // Zoom 4+: Show fortresses, keeps, and prominent landmarks
    if (currentZoom >= 4) {
      if (cat.includes('fortress') || cat.includes('keep') || cat.includes('castle') || cat.includes('tower')) return true;
    }

    // Zoom 5+: Show points of interest, ruins, and geographic features
    if (currentZoom >= 5) {
      if (cat.includes('poi') || cat.includes('ruin') || cat.includes('dungeon') || cat.includes('cave') || cat.includes('temple')) return true;
      if (cat.includes('mountain') || cat.includes('forest') || cat.includes('lake') || cat.includes('island')) return true;
    }

    // Zoom 6+: Show everything else
    if (currentZoom >= 6) return true;

    return false;
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
      
      {/* Map Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] z-[400]" />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
        <div className="bg-parchment-100/90 border-2 border-dragon-gold/50 p-1 rounded-md shadow-lg flex flex-col">
          <div className="text-[9px] text-center font-bold text-dragon-red border-b border-dragon-gold/20 mb-1 pb-1 uppercase">Zoom</div>
          <div className="text-center font-header font-bold text-lg text-dragon-red">{Math.round(currentZoom)}</div>
        </div>
      </div>
    </div>
  );
};
