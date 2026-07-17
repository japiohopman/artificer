import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useWorldStore, CategoryIcons } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { DiceText } from '../dice/DiceText';
import { cn } from '../../lib/utils';
import { REGION_NAMES } from '../../data/regions';

export const NotificationWindow: React.FC = () => {
  const { logs, clearLogs, combatState, startCombat, nextTurn } = useGameStore();
  const { playSound } = useAudioStore();
  const { characters } = useCharacterStore();

  const {
    currentLocation, currentSubLocation, currentShop,
    partyLocation, currentRegion, mapZoom
  } = useWorldStore();
  
  const { playerPos, monsters, initiativeOrder, activeTurnIndex } = combatState;

  // Always show the newest log to keep the window active as requested
  const recentLogs = logs.length > 0 ? logs[0] : null;

  const categoryIcon = currentLocation ? CategoryIcons[currentLocation.category]?.icon : null;
  const categoryColor = currentLocation ? CategoryIcons[currentLocation.category]?.color : 'currentColor';

  return (
    <div className="w-full flex flex-col relative rounded-md border border-white/10 transition-all bg-stone-950/90 shadow-2xl overflow-hidden pointer-events-auto">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-dragon-red shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
      
      {/* Top Section: Location, Turn Order, and Info */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40">

        {/* Left: Location & Region */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <div className={cn(
               "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(139,0,0,0.8)]",
               currentRegion === 'water' ? "bg-blue-500" : "bg-dragon-red"
             )} />
             <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em]">
               {currentRegion === 'water' ? 'Offshore_Tracking' : 'Position_Verified'}
             </span>
             <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em]">
               • {currentRegion === 'water' ? 'Sea' : 'Land'} Region
             </span>
             <span className="text-[9px] font-black uppercase text-dragon-gold tracking-[0.3em]">
               • Zoom {mapZoom}
             </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {categoryIcon && (
              <GameIcon name={categoryIcon} size={16} color={categoryColor} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
            )}
            <span className="text-lg font-header font-black text-white uppercase tracking-[0.1em] drop-shadow-md">
              {currentLocation?.name || REGION_NAMES[currentRegion as keyof typeof REGION_NAMES] || 'Unknown Region'}
            </span>
            {currentSubLocation && (
              <span className="text-white/40 font-mono text-xs ml-2 uppercase tracking-widest border-l border-white/10 pl-2">
                {currentSubLocation.name}
              </span>
            )}
            {currentShop && (
               <span className="text-dragon-red font-bold text-xs ml-2 uppercase tracking-widest border-l border-white/10 pl-2">
                {currentShop}
              </span>
            )}
          </div>
        </div>

        {/* Center: Turn Order (Initiative Bar) */}
        <div className="flex-1 flex justify-center px-8">
           {initiativeOrder.length > 0 ? (
              <div className="flex items-center gap-3 py-1 px-4 bg-black/60 rounded-full border border-white/10 shadow-inner">
                {initiativeOrder.map((entry, idx) => {
                  const isActive = idx === activeTurnIndex;
                  const char = characters.find(c => c.id === entry.id || c.name === entry.name);
                  const avatar = char?.avatarUrl;

                  return (
                    <motion.div
                      key={entry.id}
                      animate={{
                        scale: isActive ? 1.15 : 1,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      className="relative group"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center bg-stone-900 transition-all",
                        entry.isPlayer ? "border-blue-500" : "border-dragon-red",
                        isActive ? "border-dragon-gold ring-2 ring-dragon-gold/30" : "border-white/5"
                      )}>
                        {avatar ? (
                          <img src={avatar} className="w-full h-full object-cover" alt={entry.name} />
                        ) : (
                          <GameIcon name={entry.isPlayer ? "user" : "identity"} size={16} color={entry.isPlayer ? "#3B82F6" : "#DC2626"} />
                        )}
                      </div>
                      {isActive && (
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-dragon-gold shadow-[0_0_8px_#D4AF37]" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
           ) : (
             <div className="flex items-center gap-4 text-white/10">
                <GameIcon name="dice" size={20} color="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Passive_Surveillance_Active</span>
             </div>
           )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
           {initiativeOrder.length > 0 && (
             <div className="flex items-center gap-2">
               <button
                 onClick={nextTurn}
                 className="px-3 py-1 bg-dragon-red hover:bg-dragon-darkRed text-white rounded text-[10px] font-black uppercase tracking-widest border border-dragon-gold/30 transition-all shadow-lg active:scale-95"
               >
                 Next Turn
               </button>
               <button
                 onClick={startCombat}
                 className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-dragon-gold transition-all"
                 title="Reroll Initiative"
               >
                 <GameIcon name="dice" size={16} color="currentColor" />
               </button>
             </div>
           )}
           <button
            className="text-white/10 hover:text-white/40 transition-colors p-2"
            onClick={() => clearLogs()}
            title="Clear System Logs"
          >
            <GameIcon name="x" size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Section: Message Logs */}
      <div className="h-12 px-6 flex items-center overflow-hidden bg-black/20">
         <AnimatePresence mode="wait">
            {recentLogs && (
              <motion.div
                key={recentLogs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 w-full"
              >
                <div className={cn(
                  "shrink-0 p-1.5 rounded bg-white/5",
                  recentLogs.type === 'error' ? 'text-red-400' :
                  recentLogs.type === 'success' ? 'text-emerald-400' :
                  recentLogs.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                )}>
                  {recentLogs.type === 'error' ? <GameIcon name="shield_alert" size={14} /> :
                   recentLogs.type === 'success' ? <GameIcon name="magic_effect" size={14} /> :
                   recentLogs.type === 'warning' ? <GameIcon name="bell" size={14} /> : <GameIcon name="info" size={14} />}
                </div>
                
                <div className="text-sm font-mono uppercase tracking-widest text-white/90 font-medium leading-tight pt-0.5 drop-shadow-sm">
                  <DiceText>{recentLogs.message}</DiceText>
                </div>
              </motion.div>
            )}
            {!recentLogs && (
              <div className="text-[10px] font-mono uppercase text-white/20 tracking-[0.3em]">System_Idle // No active notifications</div>
            )}
          </AnimatePresence>
      </div>

      {/* Subtle Atmospheric Scanning Line */}
      <motion.div 
        animate={{ left: ['-30%', '130%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-64 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
      />
    </div>
  );
};
