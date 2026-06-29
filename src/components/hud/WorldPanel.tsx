import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

export const WorldPanel: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    setIsWorldPanelOpen,
    gameMode
  } = useStore();

  const currentLocation = useWorldStore(state => state.currentLocation);
  const inspectedLocation = useWorldStore(state => state.inspectedLocation);
  const savedLocations = useWorldStore(state => state.savedLocations);
  const gameTime = useWorldStore(state => state.gameTime);
  const gameDay = useWorldStore(state => state.gameDay);
  const weather = useWorldStore(state => state.weather);
  const getCalendarDate = useWorldStore(state => state.getCalendarDate);

  const { characters } = useCharacterStore();

  const displayLocation = inspectedLocation || currentLocation;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getWeatherIcon = (w: string) => {
    switch (w) {
      case 'Sunny': return 'eye';
      case 'Rainy': return 'waters';
      case 'Stormy': return 'death';
      case 'Cloudy': return 'landmark';
      default: return 'eye';
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isWorldPanelOpen ? 320 : 0 }}
      className="h-full bg-parchment-50 border-r-2 border-dragon-red overflow-hidden relative flex flex-col z-[1000] shadow-2xl bg-paper-texture"
    >
      <div className="w-80 h-full flex flex-col shrink-0">
        {/* Universal Banner Hub */}
        <div className="relative h-48 shrink-0 overflow-hidden border-b-2 border-dragon-red">
           {displayLocation?.image ? (
             <img src={displayLocation.image} className="w-full h-full object-cover" alt="" />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-parchment-300 to-parchment-500 flex items-center justify-center">
                <GameIcon name="city" size={64} className="opacity-10" />
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
           
           {/* Close Button */}
           <button 
             onClick={() => setIsWorldPanelOpen(false)}
             title="Close Panel"
             aria-label="Close World Panel"
             className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-dragon-red text-white rounded-full backdrop-blur-md border border-white/20 transition-all z-20"
           >
             <GameIcon name="chevron_left" size={16} color="currentColor" />
           </button>

           {/* Location Info Overlay */}
           <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold animate-pulse shadow-[0_0_8px_#D4AF37]" />
                 <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.2em]">{displayLocation?.category || 'Uncharted Territory'}</span>
              </div>
              <h2 className="text-2xl font-header text-white uppercase tracking-widest leading-none drop-shadow-lg">{displayLocation?.name || 'The Wilds'}</h2>
              
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
                 <div className="flex items-center gap-1.5">
                    <GameIcon name="eye" size={10} color="#D4AF37" />
                    <span className="text-[10px] font-mono text-white/80 font-black">{formatTime(gameTime)}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <GameIcon name={getWeatherIcon(weather) as any} size={10} color="#D4AF37" />
                    <span className="text-[10px] font-black uppercase text-white/80 tracking-tighter">{weather}</span>
                 </div>
                 <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Day {gameDay}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Hub Switcher */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {gameMode === 'exploration' ? (
              <motion.div 
                key="exploration"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-8"
              >
                {/* Calendar Banner */}
                <div className="bg-dragon-red/5 border border-dragon-red/10 rounded-lg p-4 flex flex-col items-center text-center shadow-inner">
                   <span className="text-[8px] font-black text-dragon-red/60 uppercase tracking-[0.3em] mb-1">Chronicle Registry</span>
                   <span className="text-sm font-header font-black text-dragon-darkRed uppercase tracking-widest">
                     {typeof getCalendarDate === 'function' ? getCalendarDate() : 'Loading Date...'}
                   </span>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-red/20 to-dragon-red/20" />
                    <div className="flex items-center gap-2">
                       <GameIcon name={inspectedLocation ? "search" : "map"} size={14} color="#8B0000" />
                       <h3 className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">
                         {inspectedLocation ? 'Inspecting_Landmark' : 'Active_Domain'}
                       </h3>
                       {inspectedLocation && (
                         <button 
                           onClick={() => useWorldStore.getState().setInspectedLocation(null)}
                           className="ml-2 text-[8px] bg-dragon-red/10 hover:bg-dragon-red/20 text-dragon-red px-2 py-0.5 rounded-full transition-colors font-black uppercase tracking-tighter"
                         >
                           Clear
                         </button>
                       )}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dragon-red/20 to-dragon-red/20" />
                  </div>
                  <div className="bg-white/40 p-4 rounded border border-dragon-red/5 shadow-sm">
                    <p className="text-xs text-parchment-800 italic leading-relaxed font-serif">
                      {displayLocation?.description || 'The horizon stretches infinitely, a canvas of primal forces awaiting the touch of a pathfinder.'}
                    </p>
                  </div>
                </div>

                {/* Points of Interest */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-red/20 to-dragon-red/20" />
                    <div className="flex items-center gap-2">
                      <GameIcon name="compass" size={14} color="#8B0000" />
                      <h3 className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">Sites_of_Interest</h3>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dragon-red/20 to-dragon-red/20" />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {savedLocations.length > 0 ? savedLocations.map((loc, index) => (
                      <button 
                        key={`${loc.id}-${index}`}
                        onClick={() => useWorldStore.getState().setInspectedLocation(loc)}
                        className="group flex items-center gap-4 p-3 bg-white/20 hover:bg-dragon-red/5 border border-dragon-red/5 hover:border-dragon-red/20 rounded transition-all text-left shadow-sm hover:shadow-md active:scale-[0.98]"
                      >
                        <div className="w-10 h-10 rounded bg-parchment-100 flex items-center justify-center border border-dragon-red/10 group-hover:bg-dragon-red group-hover:border-dragon-gold transition-all duration-300 shadow-inner">
                          <GameIcon name={loc.category?.toLowerCase() || "city"} size={20} color="currentColor" className="text-dragon-red group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-parchment-900 uppercase tracking-tight truncate group-hover:text-dragon-darkRed transition-colors">{loc.name}</p>
                          <p className="text-[8px] text-dragon-red/40 group-hover:text-dragon-red/60 uppercase font-black tracking-widest mt-0.5">{loc.category || 'Location'}</p>
                        </div>
                        <GameIcon name="chevron_right" size={12} color="#8B0000" className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    )) : (
                      <div className="p-8 border-2 border-dashed border-dragon-red/10 rounded-lg text-center bg-black/5">
                        <div className="w-12 h-12 rounded-full bg-parchment-200 flex items-center justify-center mx-auto mb-3 opacity-20">
                          <GameIcon name="map" size={24} color="#8B0000" />
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-parchment-400">No mapped anomalies</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="combat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-8"
              >
                <div className="flex flex-col items-center mb-4">
                  <span className="text-[10px] font-black text-dragon-red uppercase tracking-[0.3em] mb-2">Campaign Unit</span>
                  <h3 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-widest">Party_Manifest</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {characters.map((char) => (
                    <div key={char.id} className="bg-white/40 border border-dragon-red/10 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-lg border-2 border-dragon-gold overflow-hidden bg-stone-100 shadow-inner">
                        <img src={char.avatarUrl || 'https://picsum.photos/seed/char/100/100'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-black uppercase text-dragon-darkRed truncate">{char.name}</span>
                            <span className="text-[8px] font-black text-dragon-red/60 uppercase">Lvl {char.level} {char.class}</span>
                         </div>
                         <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden border border-black/5">
                            <div 
                              className="h-full bg-gradient-to-r from-dragon-darkRed to-dragon-red shadow-[0_0_8px_rgba(139,0,0,0.5)]" 
                              style={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                            />
                         </div>
                         <div className="flex justify-between mt-1">
                            <span className="text-[7px] font-black text-dragon-red uppercase">HP: {char.hp}/{char.maxHp}</span>
                            <span className="text-[7px] font-black text-dragon-gold uppercase">AP: {char.actionEconomy?.actions.current || 0}/{char.actionEconomy?.actions.max || 0}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-dragon-gold/10 border border-dragon-gold/20 rounded-lg p-4 mt-8">
                   <h4 className="text-[10px] font-black text-dragon-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                     <GameIcon name="magic_effect" size={14} color="currentColor" /> Tactics Protocol
                   </h4>
                   <p className="text-[10px] text-parchment-600 leading-relaxed italic">
                     Units are synchronized for tactical engagement. Action points replenish at the start of each combatant's turn.
                   </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};
