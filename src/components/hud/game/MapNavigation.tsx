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
  const { mapZoom, setMapZoom } = useWorldStore();
  const { isMapPanEnabled, setIsMapPanEnabled } = useUIStore();

  const handleLocateParty = () => {
    if (onCenterParty) {
      onCenterParty();
    } else {
      setMapZoom(3);
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
        <GameIcon name="location" size={18} />
      </button>
      
      <div className="h-px bg-dragon-gold/20 mx-1" />

      <button
        onClick={() => onZoomIn ? onZoomIn() : setMapZoom(Math.min(mapZoom + 1, 9))}
        className="p-2 hover:bg-dragon-red/10 text-dragon-red rounded transition-colors"
        title="Zoom In"
      >
        <GameIcon name="plus" size={18} />
      </button>
      <button
        onClick={() => onZoomOut ? onZoomOut() : setMapZoom(Math.max(mapZoom - 1, 3))}
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
