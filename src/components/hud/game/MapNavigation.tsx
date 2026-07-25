import React from 'react';
import { useWorldStore } from '../../../store/useWorldStore';
import { useUIStore } from '../../../store/useUIStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';

interface MapNavigationProps {
  className?: string;
  onCenterParty?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  currentMiles?: number;
  zoomLevel?: number;
}

export const MapNavigation: React.FC<MapNavigationProps> = ({ 
  className, 
  onCenterParty, 
  onZoomIn, 
  onZoomOut,
  currentMiles,
  zoomLevel
}) => {
  const { mapZoom, setMapZoom, partyLocation } = useWorldStore();
  const { isMapPanEnabled, setIsMapPanEnabled } = useUIStore();

  const handleLocateParty = () => {
    if (onCenterParty) {
      onCenterParty();
      return;
    }

    const map = (window as any).leafletMap;
    if (partyLocation && map) {
      const x = partyLocation.coordinates?.x ?? partyLocation.position?.[0] ?? 0;
      const y = partyLocation.coordinates?.y ?? partyLocation.position?.[1] ?? 0;

      // Convert to high-res pixel space (matches WorldMap.tsx logic)
      const px = (x / 4763) * 21620;
      const py = (1 - (y / 3185)) * 14461;

      map.setView([py, px], map.getZoom(), { animate: true, duration: 1 });
    }
  };

  const handleZoomIn = () => {
    if (onZoomIn) {
      onZoomIn();
      return;
    }
    const map = (window as any).leafletMap;
    if (map) {
      const newZoom = Math.min(map.getZoom() + 1, 9);
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    } else {
      setMapZoom(Math.min(mapZoom + 1, 9));
    }
  };

  const handleZoomOut = () => {
    if (onZoomOut) {
      onZoomOut();
      return;
    }
    const map = (window as any).leafletMap;
    if (map) {
      const newZoom = Math.max(map.getZoom() - 1, 3);
      map.setZoom(newZoom);
      setMapZoom(newZoom);
    } else {
      setMapZoom(Math.max(mapZoom - 1, 3));
    }
  };

  return (
    <div className={cn(
      "flex flex-col gap-2 p-2 bg-parchment-100/90 border-2 border-dragon-gold shadow-xl rounded-lg pointer-events-auto seamless-hud-unit",
      className
    )}>
      {currentMiles !== undefined && (
        <div className="px-2 py-1 bg-dragon-red/5 border-b border-dragon-gold/20 mb-1">
           <span className="text-[8px] font-black text-dragon-red uppercase block text-center tracking-tighter">{Math.round(currentMiles)} Mi</span>
        </div>
      )}
      <button
        onClick={handleLocateParty}
        className="p-2 hover:bg-dragon-red/10 text-dragon-red rounded transition-colors"
        title="Locate Party"
      >
        <GameIcon name="location" fallbackName="place" size={18} />
      </button>
      
      <div className="h-px bg-dragon-gold/20 mx-1" />

      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-dragon-red/10 text-dragon-red rounded transition-colors"
        title="Zoom In"
      >
        <GameIcon name="plus" size={18} />
      </button>
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-dragon-red/10 text-dragon-red rounded transition-colors"
        title="Zoom Out"
      >
        <GameIcon name="minus" size={18} />
      </button>

      <div className="h-px bg-dragon-gold/20 mx-1" />

      <button
        onClick={() => setIsMapPanEnabled(!isMapPanEnabled)}
        className={cn(
          "p-2 rounded transition-colors",
          !isMapPanEnabled ? "bg-dragon-red text-white" : "hover:bg-dragon-red/10 text-dragon-red"
        )}
        title={isMapPanEnabled ? "Lock Pan" : "Unlock Pan"}
      >
        <GameIcon name={isMapPanEnabled ? "unlock" : "lock"} size={18} />
      </button>
    </div>
  );
};
