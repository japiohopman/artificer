import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../store/useStore';
import { useWorldStore } from '../../store/useWorldStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

export const WorldPanel: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    setIsWorldPanelOpen,
  } = useStore();

  const {
    currentLocation,
    savedLocations,
    gameTime,
    gameDay
  } = useWorldStore();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isWorldPanelOpen ? 320 : 0 }}
      className="h-full bg-parchment-50 border-r-2 border-dragon-red overflow-hidden relative flex flex-col z-[1000] shadow-2xl bg-paper-texture"
    >
      <div className="w-80 h-full flex flex-col shrink-0">
        <div className="p-6 border-b-2 border-dragon-red bg-parchment-100/80 backdrop-blur-sm flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-dragon-red/60 uppercase tracking-[0.3em] leading-none mb-1">Cartographic</span>
            <h2 className="text-2xl font-header text-dragon-red uppercase tracking-widest leading-none">World Atlas</h2>
          </div>
          <button 
            onClick={() => setIsWorldPanelOpen(false)}
            className="p-2 hover:bg-dragon-red/10 rounded-full transition-all active:scale-95 group"
          >
            <GameIcon name="chevron_left" size={24} color="#8B0000" className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Time & Date */}
          <div className="bg-white/40 border border-dragon-gold/20 rounded shadow-inner p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
               <GameIcon name="compass" size={64} color="#8B0000" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-dragon-red/5 flex items-center justify-center border border-dragon-red/10">
                  <GameIcon name="compass" size={16} color="#8B0000" />
                </div>
                <span className="text-[10px] font-black uppercase text-dragon-red/60 tracking-[0.2em]">Temporal Node</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                   <span className="text-4xl font-header font-black text-dragon-darkRed leading-none tabular-nums">{formatTime(gameTime)}</span>
                   <span className="text-[8px] font-black text-parchment-400 uppercase tracking-widest mt-1">Solar Cycle Progression</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xl font-header font-bold text-dragon-red leading-none">Day {gameDay}</span>
                   <span className="text-[8px] font-black text-parchment-300 uppercase tracking-tighter">Era_Chronicle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-red/20 to-dragon-red/20" />
              <div className="flex items-center gap-2">
                <GameIcon name="map" size={14} color="#8B0000" />
                <h3 className="text-[10px] font-black uppercase text-dragon-red tracking-[0.3em]">Active_Domain</h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-dragon-red/20 to-dragon-red/20" />
            </div>

            <div className="bg-white/30 border border-dragon-red/10 rounded overflow-hidden shadow-md hover:shadow-xl transition-all duration-500">
               <div className="h-40 bg-parchment-300 relative group">
                  {currentLocation?.image ? (
                    <img src={currentLocation.image} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[2000ms]" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-parchment-200 to-parchment-400">
                      <GameIcon name="city" size={64} className="opacity-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-white font-header text-xl font-black leading-tight uppercase tracking-wide drop-shadow-lg">{currentLocation?.name || 'The Wilds'}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold animate-pulse" />
                       <p className="text-dragon-gold text-[9px] uppercase font-black tracking-widest">{currentLocation?.category || 'Uncharted Territory'}</p>
                    </div>
                  </div>
               </div>
               <div className="p-4 bg-white/40 backdrop-blur-sm border-t border-dragon-red/5">
                 <p className="text-xs text-parchment-800 italic leading-relaxed font-serif">
                   {currentLocation?.description || 'The horizon stretches infinitely, a canvas of primal forces awaiting the touch of a pathfinder.'}
                 </p>
                 
                 {currentLocation?.region && (
                   <div className="mt-4 pt-4 border-t border-dragon-red/5 flex items-center justify-between">
                      <span className="text-[8px] font-black text-parchment-400 uppercase tracking-widest">Regional Cluster</span>
                      <span className="text-[10px] font-bold text-dragon-red uppercase">{currentLocation.region}</span>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Points of Interest / Sublocations */}
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
              {savedLocations.length > 0 ? savedLocations.map(loc => (
                <button 
                  key={loc.id}
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

          {/* Regional Resources / Lore Hooks (Placeholder for future data) */}
          <div className="pt-4 border-t-2 border-dragon-red/5">
             <div className="p-4 bg-dragon-gold/5 rounded border border-dragon-gold/20">
                <span className="text-[8px] font-black text-dragon-gold/60 uppercase tracking-widest block mb-2">Cartographer's Note</span>
                <p className="text-[10px] text-parchment-600 leading-relaxed italic">
                  The Atlas synchronizes with identified landmarks. Move into range of settlements or ruins to expand the manifest.
                </p>
             </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
