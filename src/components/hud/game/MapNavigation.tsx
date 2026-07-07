import React from 'react';
import { useWorldStore } from '../../../store/useWorldStore';
import { useUIStore } from '../../../store/useUIStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';

export const MapNavigation: React.FC = () => {
  const { mapZoom, setMapZoom } = useWorldStore();
  const { isMapPanEnabled, setIsMapPanEnabled } = useUIStore();

  const handleLocateParty = () => {
    // This is handled by WorldMap.tsx watching for a specific state if needed, 
    // or we can just reset zoom for now as a 'locate'
    setMapZoom(3);
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-parchment-100/90 border-2 border-dragon-gold shadow-xl rounded-lg pointer-events-auto seamless-hud-unit">
      <button
        onClick={handleLocateParty}
        className="p-2 hover:bg-dragon-red/10 text-dragon-red rounded transition-colors"
        title="Locate Party"
      >
        <GameIcon name="location" size={18} />
      </button>
      
      <div className="h-px bg-dragon-gold/20 mx-1" />

      <button
        onClick={() => setMapZoom(Math.min(mapZoom + 1, 5))}
        className="p-2 hover:bg-dragon-red/10 text-dragon-red rounded transition-colors"
        title="Zoom In"
      >
        <GameIcon name="plus" size={18} />
      </button>
      <button
        onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
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
