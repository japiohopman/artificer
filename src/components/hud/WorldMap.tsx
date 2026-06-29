import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useWorldStore, CategoryIcons } from '../../store/useWorldStore';
import { WORLD_ATLAS_ICONS } from '../../assets/icons/world_atlas';

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
  else if (catKey.includes('underdark')) catKey = 'underdark';

  const config = CategoryIcons[catKey] || CategoryIcons[catKey.replace(/s$/, '')] || { icon: 'landmark', color: '#D4AF37' };
  const iconName = config.icon as keyof typeof WORLD_ATLAS_ICONS;
  const path = WORLD_ATLAS_ICONS[iconName] || WORLD_ATLAS_ICONS.landmark;

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
    setInspectedLocation 
  } = useWorldStore();
  const { setIsWorldPanelOpen } = useStore();
  
  const initialZoom = partyLocation?.zoom || 0;
  const [currentZoom, setCurrentZoom] = React.useState(initialZoom);

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

  // Filtering logic for zoom levels
  const visibleLocations = savedLocations.filter(loc => {
    const cat = loc.category?.toLowerCase() || '';

    // Always show cities
    if (cat.includes('city') || cat.includes('cities')) return true;

    // Zoom-based visibility
    if (currentZoom >= 6) return true;
    if (currentZoom >= 5) return true; // Most things visible at high zoom
    if (currentZoom >= 4) {
        return cat.includes('town') || cat.includes('settlement') || cat.includes('fortress') || cat.includes('castle');
    }
    if (currentZoom >= 2) {
        return cat.includes('town');
    }

    return false;
  });

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
        <MapEvents onZoomChange={setCurrentZoom} />
        
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
      
      {/* Map Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-[400]" />
    </div>
  );
};
