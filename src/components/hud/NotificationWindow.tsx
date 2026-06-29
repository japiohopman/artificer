import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { useAudioStore } from '../../store/useAudioStore.ts';
import { useWorldStore, CategoryIcons, SavedLocation } from '../../store/useWorldStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

export const NotificationWindow: React.FC = () => {
  const { 
    logs, clearLogs, setIsInsideSubMap,
    addLog, gameMode
  } = useStore();
  const { playSound } = useAudioStore();

  const {
    currentLocation, currentSubLocation, currentShop,
    partyLocation, savedLocations, setPartySubLocation
  } = useWorldStore();
  
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
    <div className={cn(
      "w-full flex flex-col overflow-hidden relative rounded-xl border border-white/10 transition-all bg-stone-950/80 backdrop-blur-xl shadow-2xl pointer-events-none",
      gameMode === 'combat' ? "h-24" : "h-12"
    )}>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
      
      {/* Header Row: Location & Status */}
      <div className="flex-1 flex items-center justify-between px-6 border-b border-white/5">
        <div className="relative z-10 flex items-center gap-6 w-full pointer-events-none">
          {/* Primary Location Navigation Info */}
          <div className="shrink-0 flex items-center pointer-events-auto">
            {locationDisplay}
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-4 bg-white/10" />

          {/* System Message Stream */}
          <div className="flex-1 flex items-center overflow-hidden pointer-events-none">
            <AnimatePresence mode="wait">
              {recentLogs && (
                <motion.div
                  key={recentLogs.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 w-full pointer-events-auto"
                >
                  <div className={`shrink-0 p-1 rounded bg-white/5 ${
                    recentLogs.type === 'error' ? 'text-red-400 border border-red-400/20' :
                    recentLogs.type === 'success' ? 'text-emerald-400 border border-emerald-400/20' :
                    recentLogs.type === 'warning' ? 'text-amber-400 border border-amber-400/20' : 'text-cyan-400 border border-cyan-400/20'
                  }`}>
                    {recentLogs.type === 'error' ? <GameIcon name="shield_alert" size={14} /> :
                     recentLogs.type === 'success' ? <GameIcon name="magic_effect" size={14} /> :
                     recentLogs.type === 'warning' ? <GameIcon name="bell" size={14} /> : <GameIcon name="info" size={14} />}
                  </div>
                  
                  <div className="flex flex-col">
                    <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-white font-black leading-tight drop-shadow-sm">
                      {recentLogs.message}
                    </p>
                    <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">System Protocol Active</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-4">
            {recentLogs && (
              <button 
                className="text-white/10 hover:text-white/60 transition-colors p-2 shrink-0 pointer-events-auto hover:bg-white/5 rounded-full"
                onClick={() => clearLogs()}
              >
                <GameIcon name="close" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Combat/Detailed Row (Visible only in larger mode) */}
      <AnimatePresence>
        {gameMode === 'combat' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-2 bg-black/40 flex items-center justify-between pointer-events-none"
          >
             <div className="flex items-center gap-8">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-dragon-gold uppercase tracking-[0.2em] mb-0.5">Tactical Log</span>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                      <span className="text-[9px] font-bold text-white/60 uppercase">No immediate threats identified</span>
                   </div>
                </div>
                
                <div className="w-px h-6 bg-white/5" />
                
                <div className="flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Quest Update</span>
                      <span className="text-[9px] font-bold text-white/80 uppercase truncate max-w-[200px]">The Whispering Shadows (Active)</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Discovery</span>
                      <span className="text-[9px] font-bold text-dragon-gold uppercase">Ancient Relic Found</span>
                   </div>
                </div>
             </div>

             <div className="flex gap-2">
                <div className="px-3 py-1 rounded bg-dragon-red/10 border border-dragon-red/20">
                   <span className="text-[8px] font-black text-dragon-red uppercase tracking-widest">Combat Phase: 01</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Atmospheric Scanning Line */}
      <motion.div 
        animate={{ left: ['-30%', '130%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-64 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
      />
    </div>
  );
};
