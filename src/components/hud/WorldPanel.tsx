import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

export const WorldPanel: React.FC = () => {
  const { 
    isWorldPanelOpen, 
    setIsWorldPanelOpen,
    currentLocation,
    savedLocations,
    gameTime,
    gameDay
  } = useStore();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isWorldPanelOpen ? 320 : 0 }}
      className="h-full bg-parchment-50 border-r-2 border-dragon-red overflow-hidden relative flex flex-col z-[1000]"
    >
      <div className="w-80 h-full flex flex-col shrink-0">
        <div className="p-4 border-b-2 border-dragon-red bg-parchment-100 flex items-center justify-between">
          <h2 className="text-xl font-header text-dragon-red uppercase tracking-widest">World Atlas</h2>
          <button 
            onClick={() => setIsWorldPanelOpen(false)}
            className="p-1 hover:bg-parchment-200 rounded transition-colors"
          >
            <GameIcon name="chevron_left" size={24} color="#8B0000" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Time & Date */}
          <div className="bg-white/50 border border-dragon-gold/30 rounded-lg p-4 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <GameIcon name="compass" size={20} color="#8B0000" />
              <span className="text-xs font-black uppercase text-dragon-red/60 tracking-widest">Chronometry</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-header text-dragon-red">{formatTime(gameTime)}</span>
              <span className="text-sm font-bold text-parchment-600">Day {gameDay}</span>
            </div>
          </div>

          {/* Current Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GameIcon name="map" size={18} color="#8B0000" />
              <h3 className="text-xs font-black uppercase text-dragon-red tracking-[0.2em]">Current Domain</h3>
            </div>
            <div className="bg-parchment-100 border-2 border-dragon-red/10 rounded overflow-hidden">
               <div className="h-32 bg-parchment-300 relative">
                  {currentLocation?.image ? (
                    <img src={currentLocation.image} className="w-full h-full object-cover opacity-80" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <GameIcon name="city" size={64} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-lg leading-tight">{currentLocation?.name || 'Wilderness'}</p>
                    <p className="text-dragon-gold text-[10px] uppercase font-black">{currentLocation?.category || 'Uncharted Territory'}</p>
                  </div>
               </div>
               <div className="p-3">
                 <p className="text-xs text-parchment-700 italic leading-relaxed">
                   {currentLocation?.description || 'The surrounding lands are vast and filled with mysteries yet to be uncovered.'}
                 </p>
               </div>
            </div>
          </div>

          {/* Points of Interest / Sublocations */}
          <div className="space-y-3">
             <div className="flex items-center gap-2">
              <GameIcon name="compass" size={18} color="#8B0000" />
              <h3 className="text-xs font-black uppercase text-dragon-red tracking-[0.2em]">Points of Interest</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {savedLocations.length > 0 ? savedLocations.map(loc => (
                <button 
                  key={loc.id}
                  className="flex items-center gap-3 p-2 bg-white/40 hover:bg-white border boundary-parchment-300 rounded transition-all text-left"
                >
                  <div className="w-8 h-8 rounded bg-parchment-100 flex items-center justify-center border border-dragon-red/10">
                    <GameIcon name="city" size={16} color="#8B0000" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-parchment-900">{loc.name}</p>
                    <p className="text-[9px] text-dragon-red/60 uppercase font-black">{loc.category}</p>
                  </div>
                </button>
              )) : (
                <div className="p-4 border-2 border-dashed border-parchment-300 rounded text-center opacity-40">
                  <p className="text-[10px] uppercase font-black tracking-widest text-parchment-500">No sites identified</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
