import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUIStore } from '../../../store/useUIStore';
import { useWorldStore, CategoryIcons } from '../../../store/useWorldStore';
import { WORLD_ATLAS_ICONS } from '../../../lib/iconRegistry.generated';
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
  const iconEntry = WORLD_ATLAS_ICONS[iconKey] || WORLD_ATLAS_ICONS.landmark;
  const iconUrl = typeof iconEntry === 'object' ? iconEntry.path : iconEntry;

  const scaleClass = isInspected ? 'scale-125' : 'group-hover:scale-110';

  return L.divIcon({
    html: `
      <div class="relative group ${isInspected ? 'z-[1000]' : ''}">
        <div class="absolute inset-0 bg-black/60 blur-lg rounded-full transform scale-50 transition-transform ${scaleClass}"></div>
        <div class="relative w-6 h-6 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${scaleClass}" style="background-color: ${config.color}; -webkit-mask: url('${iconUrl}') no-repeat center / contain; mask: url('${iconUrl}') no-repeat center / contain;"></div>
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
  const { 
    currentLocation, 
    inspectedLocation, 
    setInspectedLocation,
    subMapActiveCategories: activeCategories,
    setSubMapActiveCategories: setActiveCategories,
    subMapAllCategories: allCategories,
    setSubMapAllCategories: setAllCategories,
    subMapActiveLayer: activeLayer,
    setSubMapActiveLayer: setActiveLayer
  } = useWorldStore();
  const { setIsInsideSubMap } = useUIStore();
  const [subLocations, setSubLocations] = React.useState<any[]>([]);

  const mapRef = React.useRef<L.Map | null>(null);

  // Load Sub-locations
  React.useEffect(() => {
    if (!currentLocation?.sub_location_files) return;

    const loadSubLocations = async () => {
      try {
        const files = currentLocation.sub_location_files || [];
        const cats = files.map(f => f.split('/').pop() || '');
        setAllCategories(cats);
        // Only override active categories if they are empty
        if (activeCategories.length === 0) {
          setActiveCategories(cats);
        }

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
  }, [currentLocation, setAllCategories, setActiveCategories]);

  if (!currentLocation?.map) return null;

  const bounds: L.LatLngBoundsExpression = React.useMemo(() => {
    const rawBounds = currentLocation.bounds || [[0, 0], [1000, 1000]];
    // Handle xy order from wiki/json: [[xMin, yMin], [xMax, yMax]] -> Leaflet [[yMin, xMin], [yMax, xMax]]
    return [
      [rawBounds[0][1], rawBounds[0][0]],
      [rawBounds[1][1], rawBounds[1][0]]
    ];
  }, [currentLocation.bounds]);

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

        {useWorldStore.getState().partyLocalPos && (() => {
          const x = useWorldStore.getState().partyLocalPos!.x;
          const y = useWorldStore.getState().partyLocalPos!.y;
          const isBottomLeft = currentLocation.origin === 'bottom-left';
          const yMax = (bounds as any)[1][0];

          const latLng: L.LatLngExpression = isBottomLeft
            ? [y, x]
            : [yMax - y, x];

          return (
            <Marker
              position={latLng}
              zIndexOffset={3000}
              icon={L.divIcon({
                html: `
                  <div class="relative">
                    <div class="absolute inset-0 bg-blue-500/40 blur-md rounded-full animate-pulse scale-150"></div>
                    <div class="relative bg-blue-600 border-2 border-white w-4 h-4 rounded-full shadow-lg">
                    </div>
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 border-blue-400 text-white text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap font-bold uppercase tracking-tighter shadow-md">
                      Party
                    </div>
                  </div>
                `,
                className: 'party-marker-local',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            />
          );
        })()}

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

      {/* Local HUD Controls removed from map overlay to avoid obscuring map views */}
    </div>
  );
};
