import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useWorldStore } from '../../store/useWorldStore';

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
  
  // Default center (can be derived from partyLocation or currentSubLocation)
  const defaultCenter: [number, number] = [51.505, -0.09];
  const center: [number, number] = partyLocation?.coords || defaultCenter;
  const zoom = partyLocation?.zoom || 13;

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        className="w-full h-full grayscale-[0.5] contrast-[1.1] brightness-[0.8]"
        zoomControl={false}
      >
        <MapInvalidator />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler />
        
        {partyLocation && (
          <Marker 
            position={center}
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

        {savedLocations.map((loc) => (
          loc.coordinates && (
            <Marker 
              key={loc.id}
              position={[
                loc.coordinates.lat ?? loc.coordinates.x ?? 0, 
                loc.coordinates.lng ?? loc.coordinates.y ?? 0
              ]}
              eventHandlers={{
                click: () => {
                  setInspectedLocation(loc);
                  setIsWorldPanelOpen(true);
                }
              }}
            />
          )
        ))}
      </MapContainer>
      
      {/* Map Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-[400]" />
    </div>
  );
};
