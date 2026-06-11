import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, CategoryIcons, SavedLocation } from '../../store/useStore';
import { GameIcon } from '../../game_icons';

export const NotificationWindow: React.FC = () => {
  const { 
    logs, currentLocation, currentSubLocation, currentShop, clearLogs,
    partyLocation, savedLocations, setIsInsideSubMap, setPartySubLocation,
    playSound, addLog
  } = useStore();
  
  // Check if we are currently AT a location with a submap
  const locationWithSubMap = savedLocations.find(l => 
    l.coordinates && 
    partyLocation &&
    Math.abs(l.coordinates.x - partyLocation.x) < 15 && 
    Math.abs(l.coordinates.y - partyLocation.y) < 15 &&
    (l.overlayMapUrl || (l as any).subMapImage)
  );

  const handleEnterLocation = () => {
    if (!locationWithSubMap) return;
    playSound('UI_CLICK');
    addLog(`Entering ${locationWithSubMap.name}...`, 'success');
    setIsInsideSubMap(true);
    // Find entrance/exit or center
    const entrance = locationWithSubMap.subLocations?.find(sl => sl.category === 'entrance_exit');
    setPartySubLocation(entrance ? { x: entrance.x, y: entrance.y } : { x: 50, y: 50 });
  };
  
  // Always show the last log to keep the window active as requested
  const recentLogs = logs.length > 0 ? logs[logs.length - 1] : null;

  const categoryIcon = currentLocation ? CategoryIcons[currentLocation.category]?.icon : null;
  const categoryColor = currentLocation ? CategoryIcons[currentLocation.category]?.color : 'currentColor';

  const locationDisplay = (
    <div className="flex items-center gap-4 text-[14px] font-mono tracking-[0.25em] font-black h-5">
      <div className="flex items-center gap-2 pt-0.5">
        {categoryIcon && (
          <GameIcon name={categoryIcon} size={18} color={categoryColor} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        )}
        <span className="text-white drop-shadow-md">{currentLocation?.name?.toUpperCase() || 'UNKNOWN'}</span>
      </div>
      
      {currentSubLocation && (
        <>
          <div className="w-1 h-1 rounded-full bg-red-600/40" />
          <div className="flex items-center gap-1.5 pt-0.5">
             <span className="text-white/50">{currentSubLocation.name.toUpperCase()}</span>
          </div>
        </>
      )}

      {currentShop && (
        <>
          <div className="w-1 h-1 rounded-full bg-red-600/40" />
          <div className="flex items-center gap-1.5 pt-0.5 text-red-600">
            <span className="font-bold tracking-[0.3em]">{currentShop.toUpperCase()}</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="w-full h-10 flex items-center justify-between px-4 overflow-hidden relative rounded-md border border-white/10 transition-all bg-stone-950/80 backdrop-blur-xl shadow-lg pointer-events-none">
      <div className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
      
      <div className="relative z-10 flex items-center gap-4 w-full pointer-events-none">
        {/* Primary Location Navigation Info */}
        <div className="shrink-0 flex items-center pointer-events-auto">
          {locationDisplay}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-3 bg-white/5" />

        {/* System Message Stream */}
        <div className="flex-1 flex items-center overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            {recentLogs && (
              <motion.div
                key={recentLogs.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 w-full pointer-events-auto"
              >
                <div className={`shrink-0 ${
                  recentLogs.type === 'error' ? 'text-red-400' :
                  recentLogs.type === 'success' ? 'text-emerald-400' :
                  recentLogs.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {recentLogs.type === 'error' ? <GameIcon name="shield_alert" size={12} /> :
                   recentLogs.type === 'success' ? <GameIcon name="magic_effect" size={12} /> :
                   recentLogs.type === 'warning' ? <GameIcon name="bell" size={12} /> : <GameIcon name="info" size={12} />}
                </div>
                
                <p className="text-[11px] font-mono uppercase tracking-[0.05em] text-white/90 font-medium leading-tight pt-0.5 drop-shadow-sm">
                  {recentLogs.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {recentLogs && (
          <button 
            className="text-white/5 hover:text-white/40 transition-colors p-1 shrink-0 pointer-events-auto"
            onClick={() => clearLogs()}
          >
            <GameIcon name="x" size={10} />
          </button>
        )}
      </div>

      {/* Subtle Atmospheric Scanning Line */}
      <motion.div 
        animate={{ left: ['-30%', '130%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-white-[0.02] to-transparent pointer-events-none"
      />
    </div>
  );
};
