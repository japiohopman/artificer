import React from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useWorldStore, SavedLocation } from '../../store/useWorldStore';

// Use CDN links for Leaflet markers to avoid Vite asset resolution issues
const markerIcon = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
const markerIconRetina = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
const markerShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FAERUN_TILE_URL = '/tiles/faerun/{z}/{x}/{y}.png';
const FAERUN_IMAGE_WIDTH = 21620;
const FAERUN_IMAGE_HEIGHT = 14461;
const FAERUN_BOUNDS: [[number, number], [number, number]] = [[0, 0], [FAERUN_IMAGE_HEIGHT, FAERUN_IMAGE_WIDTH]];
const FAERUN_CENTER: [number, number] = [FAERUN_IMAGE_HEIGHT / 2, FAERUN_IMAGE_WIDTH / 2];
const FAERUN_MIN_ZOOM = 0;
const FAERUN_MAX_ZOOM = 7;

const translateCoordinates = (coords: any): [number, number] | null => {
  if (!coords) return null;

  if (Array.isArray(coords) && coords.length >= 2) {
    // Faerûn JSON coordinates are typically [x, y]; Leaflet expects [lat, lng] => [y, x].
    return [coords[1], coords[0]];
  }

  const maybeCoords = coords.coordinates || coords.coords || coords;
  if (!maybeCoords || typeof maybeCoords !== 'object') return null;

  const hasLatLng = maybeCoords.lat != null || maybeCoords.lng != null;
  const hasXY = maybeCoords.x != null || maybeCoords.y != null;

  if (hasLatLng) {
    return [maybeCoords.lat ?? maybeCoords.y, maybeCoords.lng ?? maybeCoords.x];
  }

  if (hasXY) {
    return [maybeCoords.y, maybeCoords.x];
  }

  return null;
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!center || center.some((value) => Number.isNaN(value))) return;
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
};

const MapClickHandler = () => {
  const { setInspectedLocation } = useWorldStore();
  useMapEvents({
    click: () => {
      setInspectedLocation(null);
    },
  });
  return null;
};

const MapInvalidator = () => {
  const map = useMap();
  const { isWorldPanelOpen, isCharacterPanelOpen } = useStore();
  const { isInventoryOpen } = useInventoryStore();

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
  }, [map, isWorldPanelOpen, isCharacterPanelOpen, isInventoryOpen]);

  return null;
};

const getLocationPosition = (loc: SavedLocation): [number, number] | null => {
  return translateCoordinates(loc.coordinates);
};

export const WorldMap: React.FC = () => {
  const {
    partyLocation,
    savedLocations,
    setInspectedLocation
  } = useWorldStore();
  const { setIsWorldPanelOpen } = useStore();
  
  const bounds = FAERUN_BOUNDS;
  const defaultCenter: [number, number] = FAERUN_CENTER;
  const partyCoords = translateCoordinates(partyLocation?.coords ?? partyLocation?.coordinates ?? partyLocation);
  const center: [number, number] = partyCoords || defaultCenter;
  const zoom = partyLocation?.zoom ?? FAERUN_MIN_ZOOM;

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      <MapContainer 
        center={center}
        zoom={zoom}
        crs={L.CRS.Simple}
        bounds={bounds}
        scrollWheelZoom={true}
        minZoom={FAERUN_MIN_ZOOM}
        maxZoom={FAERUN_MAX_ZOOM}
        maxBounds={bounds}
        className="w-full h-full grayscale-[0.5] contrast-[1.1] brightness-[0.8]"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapInvalidator />
        <TileLayer
          url={FAERUN_TILE_URL}
          tileSize={256}
          maxNativeZoom={FAERUN_MAX_ZOOM}
          minNativeZoom={FAERUN_MIN_ZOOM}
          tms={true}
          noWrap={true}
          attribution=""
        />
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler />

        {partyCoords && (
          <Marker
            position={partyCoords}
            eventHandlers={{
              click: () => {
                setInspectedLocation({
                  id: 'party-pos',
                  name: 'Party Position',
                  category: 'Active Campaign',
                  description: 'Your group is currently located here, navigating the vast reaches of the world.',
                  image: null
                });
                setIsWorldPanelOpen(true);
              }
            }}
          />
        )}

        {savedLocations.map((loc, index) => {
          const position = getLocationPosition(loc);
          if (!position) return null;

          return (
            <Marker
              key={`${loc.id}-${index}`}
              position={position}
              eventHandlers={{
                click: () => {
                  setInspectedLocation(loc);
                  setIsWorldPanelOpen(true);
                }
              }}
            />
          );
        })}
      </MapContainer>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-[400]" />
    </div>
  );
};
