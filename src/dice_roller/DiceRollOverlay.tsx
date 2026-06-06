import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { GameIcon } from '../game_icons';
import { cn } from '../lib/utils';

export const DiceRollOverlay: React.FC = () => {
  const { recentRolls } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {recentRolls.map((roll) => (
          <RollNotification key={roll.id} roll={roll} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const RollNotification: React.FC<{ roll: any }> = ({ roll }) => {
  const { removeRoll } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeRoll(roll.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [roll.id, removeRoll]);

  const isCrit = roll.rolls?.some((r: any) => r.die === 20 && r.result === 20);
  const isFail = roll.rolls?.some((r: any) => r.die === 20 && r.result === 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="bg-parchment-50 border border-dragon-red/30 p-3 rounded-lg shadow-xl relative overflow-hidden flex items-center gap-4 min-w-[180px] pointer-events-auto backdrop-blur-sm"
    >
      <div className={cn(
        "w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 border-2 transition-all",
        isCrit ? "bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse" : 
        isFail ? "bg-black border-red-900 shadow-[0_0_15px_rgba(0,0,0,0.6)]" : 
        "bg-dragon-red/10 border-dragon-red/20"
      )}>
        <span className={cn("text-lg font-black leading-none", (isFail || isCrit) ? "text-white" : "text-dragon-red")}>
          {roll.total}
        </span>
        <span className={cn("text-[6px] font-black uppercase tracking-tighter mt-0.5", (isFail || isCrit) ? "text-white/60" : "text-dragon-red/40")}>
          Total
        </span>
      </div>

      <div className="flex flex-col min-w-0 pr-4">
        <span className="text-[8px] font-black uppercase text-dragon-red tracking-[0.2em] opacity-60 leading-none truncate mb-1">
          {roll.label}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {roll.rolls && roll.rolls.length > 0 ? (
            roll.rolls.map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-1 bg-white/40 px-1.5 py-0.5 rounded border border-parchment-300">
                 <span className="text-[10px] font-bold text-dragon-darkRed">{r.result}</span>
                 <span className="text-[7px] text-parchment-400 font-black">d{r.die}</span>
              </div>
            ))
          ) : (
             <span className="text-[10px] font-bold text-dragon-darkRed">{roll.notation}</span>
          )}
          {roll.modifier !== 0 && (
            <span className="text-[8px] text-parchment-500 font-black">{roll.modifier > 0 ? '+' : ''}{roll.modifier} mod</span>
          )}
        </div>
      </div>
      
      {/* Crit Mark */}
      {isCrit && (
        <div className="absolute top-0 right-0 p-1 bg-amber-500 rounded-bl-lg text-white">
          <GameIcon name="sparkles" size={10} color="currentColor" />
        </div>
      )}

      {/* Expiry Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 6, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-dragon-red/20"
      />
    </motion.div>
  );
};
