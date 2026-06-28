import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
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

const FAERUN_IMAGE_URL = encodeURI('/assets/atlas/world/maps/Sword_Coast_Map _faerun.png');
const FAERUN_IMAGE_WIDTH = 21620;
const FAERUN_IMAGE_HEIGHT = 14461;
const FAERUN_BOUNDS: [[number, number], [number, number]] = [[0, 0], [FAERUN_IMAGE_HEIGHT, FAERUN_IMAGE_WIDTH]];

const translateCoordinates = (coords: any): [number, number] | null => {
  if (!coords) return null;

  if (Array.isArray(coords) && coords.length >= 2) {
    return [coords[0], coords[1]];
  }

  const maybeCoords = coords.coordinates || coords.coords || coords;
  if (!maybeCoords || typeof maybeCoords !== 'object') return null;

  const lat = maybeCoords.lat ?? maybeCoords.y;
  const lng = maybeCoords.lng ?? maybeCoords.x;

  if (lat != null && lng != null) {
    return [lat, lng];
  }

  return null;
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
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
  
  // Faerun Map configuration
  const mapUrl = '/assets/atlas/world/maps/Faerun_day.webp';
  // Standard bounds for the Faerun high-res map
  const bounds: L.LatLngBoundsExpression = [[0, 0], [5000, 5000]];
  
  // Default center (can be derived from partyLocation or currentSubLocation)
  const defaultCenter: [number, number] = [2500, 2500];
  const center: [number, number] = partyLocation?.coords || defaultCenter;
  const zoom = partyLocation?.zoom || 0;

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        crs={L.CRS.Simple}
        minZoom={-2}
        maxZoom={4}
        scrollWheelZoom={true}
        minZoom={-4}
        maxZoom={4}
        maxBounds={FAERUN_BOUNDS}
        className="w-full h-full grayscale-[0.5] contrast-[1.1] brightness-[0.8]"
        zoomControl={false}
      >
        <MapInvalidator />
        <ImageOverlay
          url={mapUrl}
          bounds={bounds}
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

        {savedLocations.map((loc) => {
          if (!loc.coordinates) return null;
          
          // Map coordinates correctly for CRS.Simple: [y, x]
          const position: [number, number] = [
            loc.coordinates.y ?? loc.coordinates.lat ?? 0,
            loc.coordinates.x ?? loc.coordinates.lng ?? 0
          ];

          return (
            <Marker
              key={loc.id}
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
