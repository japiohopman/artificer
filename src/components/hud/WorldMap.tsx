import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';

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

L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export const WorldMap: React.FC = () => {
  const { currentLocation, partyLocation } = useStore();
  
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        
        {partyLocation && (
          <Marker position={center}>
            <Popup>
              <div className="p-2 font-header text-dragon-red">
                <p className="font-bold">Party Position</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-parchment-500">Active Campaign</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-[400]" />
    </div>
  );
};
