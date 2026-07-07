import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUIStore } from '../../../store/useUIStore';
import { useWorldStore, CategoryIcons } from '../../../store/useWorldStore';
import { WORLD_ATLAS_ICONS } from '../../../assets/icons/world_atlas';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { Entrance } from './Entrance';
import { MapNavigation } from './MapNavigation';

// Helper to create custom markers (Sync with WorldMap.tsx)
const createCustomIcon = (category: string, isInspected: boolean = false) => {
  const cat = category?.toLowerCase() || '';
  let catKey = cat;

  // Refined mapping for specialized atlas icons
  if (cat.includes('shop')) catKey = 'shops';
  else if (cat.includes('tavern')) catKey = 'taverns';
  else if (cat.includes('inn')) catKey = 'inns';
  else if (cat.includes('temple') || cat.includes('shrine')) catKey = 'temples';
  else if (cat.includes('district') || cat.includes('ward')) catKey = 'districts';
  else if (cat.includes('sewer')) catKey = 'sewer_entrens';
  else if (cat.includes('estate') || cat.includes('villa')) catKey = 'estates';
  else if (cat.includes('point_of_interest') || cat.includes('poi')) catKey = 'points_of_interest';
  else if (cat.includes('landmark')) catKey = 'landmarks';
  else if (cat.includes('dock') || cat.includes('harbor')) catKey = 'docks';
  else if (cat.includes('gate')) catKey = 'gates';

  const config = CategoryIcons[catKey] ||
                 CategoryIcons[catKey.replace(/ies$/, 'y')] ||
                 CategoryIcons[catKey.replace(/s$/, '')] ||
                 CategoryIcons[catKey + 's'] ||
                 { icon: WORLD_ATLAS_ICONS[catKey as keyof typeof WORLD_ATLAS_ICONS] ? catKey : 'landmark', color: '#D4AF37' };

  const iconKey = (WORLD_ATLAS_ICONS[config.icon as keyof typeof WORLD_ATLAS_ICONS] ? config.icon : 'landmark') as keyof typeof WORLD_ATLAS_ICONS;
  const path = WORLD_ATLAS_ICONS[iconKey] || WORLD_ATLAS_ICONS.landmark;

  const scaleClass = isInspected ? 'scale-125' : 'group-hover:scale-110';

  return L.divIcon({
    html: `
      <div class="relative group ${isInspected ? 'z-[1000]' : ''}">
        <div class="absolute inset-0 bg-black/60 blur-lg rounded-full transform scale-50 transition-transform ${scaleClass}"></div>
        <svg viewBox="0 0 512 512" width="24" height="24" overflow="visible" class="relative transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${scaleClass}">
          <path d="${path}" fill="${config.color}" stroke="rgba(0,0,0,0.9)" stroke-width="12" />
          <path d="${path}" fill="${config.color}" />
        </svg>
      </div>
    `,
    className: `custom-map-marker`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const MapEvents = ({ bounds, onMapInstance }: { bounds: L.LatLngBoundsExpression, onMapInstance: (map: L.Map) => void }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
    onMapInstance(map);
  }, [map, bounds, onMapInstance]);
  return null;
};

export const LocationMap: React.FC = () => {
  const { currentLocation, inspectedLocation, setInspectedLocation } = useWorldStore();
  const { setIsInsideSubMap } = useUIStore();
  const [subLocations, setSubLocations] = React.useState<any[]>([]);
  const [activeLayer, setActiveLayer] = React.useState<string | null>(null);
  const [activeCategories, setActiveCategories] = React.useState<string[]>([]);
  const [allCategories, setAllCategories] = React.useState<string[]>([]);

  const mapRef = React.useRef<L.Map | null>(null);

  // Load Sub-locations
  React.useEffect(() => {
    if (!currentLocation?.sub_location_files) return;

    const loadSubLocations = async () => {
      try {
        const files = currentLocation.sub_location_files || [];
        const cats = files.map(f => f.split('/').pop() || '');
        setAllCategories(cats);
        setActiveCategories(cats); // Default all on

        const allData = await Promise.all(
          files.map(async (file: string) => {
            const res = await fetch(file);
            if (res.ok) {
              const data = await res.json();
              const locations = Array.isArray(data) ? data : data.locations || data.sub_locations || [];
              const catName = file.split('/').pop() || '';
              return locations.map((l: any) => ({ ...l, _categoryFile: catName }));
            }
            return [];
          })
        );
        setSubLocations(allData.flat());
      } catch (e) {
        console.error("Failed to load sub-locations", e);
      }
    };
    loadSubLocations();
  }, [currentLocation]);

  if (!currentLocation?.map) return null;

  const rawBounds = currentLocation.bounds || [[0, 0], [1000, 1000]];
  // Handle xy order from wiki/json: [[xMin, yMin], [xMax, yMax]] -> Leaflet [[yMin, xMin], [yMax, xMax]]
  const bounds: L.LatLngBoundsExpression = [
    [rawBounds[0][1], rawBounds[0][0]],
    [rawBounds[1][1], rawBounds[1][0]]
  ];

  const mapUrl = activeLayer || currentLocation.map || '';

  return (
    <div className="w-full h-full bg-[#0F1115] relative font-body overflow-hidden border-4 border-dragon-gold shadow-inner">
      <MapContainer
        key={`${currentLocation.id}-${mapUrl}`}
        center={[ (bounds as any)[1][0] / 2, (bounds as any)[1][1] / 2 ]}
        zoom={0}
        crs={L.CRS.Simple}
        className="w-full h-full bg-stone-900"
        attributionControl={false}
        zoomControl={false}
        minZoom={-5}
        maxZoom={5}
      >
        <MapEvents bounds={bounds} onMapInstance={(map) => { mapRef.current = map; }} />

        <ImageOverlay
          url={mapUrl}
          bounds={bounds}
          opacity={1}
          zIndex={1}
        />

        {subLocations.filter(loc => activeCategories.includes(loc._categoryFile)).map((loc, idx) => {
          let x = 0, y = 0;
          if (loc.position) {
            x = loc.position[0];
            y = loc.position[1];
          } else if (loc.coordinates) {
            x = loc.coordinates.lng || loc.coordinates.x || 0;
            y = loc.coordinates.lat || loc.coordinates.y || 0;
          }

          // Leaflet Simple CRS with positive bounds [[0,0], [yMax, xMax]]:
          // [0, 0] is BOTTOM-LEFT.
          // y increases UPWARDS.

          // Leaflet Simple CRS projects [lat, lng] to [y, x] where y increases UPWARDS (North).
          // Most map coordinate systems (Wiki, Graphics) use TOP-LEFT origin (y increases Downwards).

          const isBottomLeft = currentLocation.origin === 'bottom-left';
          const yMax = (bounds as any)[1][0];

          // If JSON origin is bottom-left, y already increases North, so we use it directly.
          // If JSON origin is top-left (default), we must invert Y for Leaflet: [yMax - y, x].
          const latLng: L.LatLngExpression = isBottomLeft
            ? [y, x]
            : [yMax - y, x];

          const isInspected = inspectedLocation?.id === loc.id;

          return (
            <Marker
              key={loc.id || idx}
              position={latLng}
              icon={createCustomIcon(loc.category || loc.type || 'landmark', isInspected)}
              eventHandlers={{
                click: () => setInspectedLocation(loc)
              }}
            >
              <Tooltip className="map-tooltip" direction="top" offset={[0, -10]}>
                <span className="text-[10px] font-bold uppercase tracking-widest">{loc.name}</span>
              </Tooltip>
              <Popup className="fantasy-popup">
                <div className="font-header font-bold text-dragon-red border-b border-dragon-gold/30 pb-1 mb-1">{loc.name}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">{loc.category || loc.type}</div>
                {loc.description && <div className="text-[10px] text-slate-700 leading-tight italic line-clamp-3">{loc.description}</div>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Local HUD Controls */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-6">
         <button
           onClick={() => setIsInsideSubMap(false)}
           className="px-4 py-2 bg-dragon-red text-white font-bold text-xs uppercase tracking-widest rounded border-2 border-dragon-gold/30 shadow-lg flex items-center gap-2 hover:bg-dragon-darkRed transition-all"
         >
           <GameIcon name="chevron_left" size={14} color="#FFF" />
           Exit to Atlas
         </button>

         {/* Layer Switcher if applicable */}
         {currentLocation.sub_location_files?.some((f: string) => f.includes('sewers')) && (
           <div className="flex flex-col gap-1 mt-4">
             <span className="text-[8px] font-black text-dragon-gold uppercase tracking-tighter">Map Layers</span>
             <button
               onClick={() => setActiveLayer(null)}
               className={cn(
                 "px-3 py-1.5 text-[10px] font-bold uppercase rounded border transition-all",
                 !activeLayer ? "bg-dragon-gold text-white" : "bg-white/10 text-dragon-gold border-dragon-gold/20"
               )}
             >
               Surface
             </button>
             <button
               onClick={() => {
                 // Hardcoded logic for demoing Waterdeep sewers if found
                 const sewerMap = (currentLocation?.map || '').replace('.webp', '_sewers.webp');
                 setActiveLayer(sewerMap);
               }}
               className={cn(
                 "px-3 py-1.5 text-[10px] font-bold uppercase rounded border transition-all",
                 activeLayer ? "bg-dragon-gold text-white" : "bg-white/10 text-dragon-gold border-dragon-gold/20"
               )}
             >
               Sewers
             </button>
           </div>
         )}

         <Entrance
           categories={allCategories}
           activeCategories={activeCategories}
           onToggleCategory={(cat) => {
             setActiveCategories(prev =>
               prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
             );
           }}
         />
      </div>

      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2 items-end">
        <div className="bg-parchment-100/90 border-2 border-dragon-gold/50 p-2 rounded-md shadow-lg flex flex-col items-center mb-2">
           <span className="text-[9px] font-black text-dragon-red uppercase mb-1">Local Topography</span>
           <h3 className="font-header text-xl text-dragon-darkRed uppercase">{currentLocation.name}</h3>
        </div>
        
        <MapNavigation 
          onCenterParty={() => {
            if (mapRef.current) mapRef.current.fitBounds(bounds);
          }}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          zoomLevel={mapRef.current?.getZoom()}
        />
      </div>
    </div>
  );
};
