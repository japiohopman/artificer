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
    }, 4000);
    return () => clearTimeout(timer);
  }, [roll.id, removeRoll]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="bg-parchment-50 border border-dragon-red/30 p-2 rounded shadow-lg relative overflow-hidden flex items-center gap-3 min-w-[140px] pointer-events-auto"
    >
      <div className={cn(
        "w-8 h-8 rounded flex items-center justify-center shrink-0 border border-dragon-red/10",
        roll.result === roll.dieType ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : 
        roll.result === 1 ? "bg-black" : "bg-dragon-red/5"
      )}>
        <span className={cn("text-xs font-black", roll.result === 1 || roll.result === roll.dieType ? "text-white" : "text-dragon-red")}>
          {roll.total}
        </span>
      </div>

      <div className="flex flex-col min-w-0 pr-4">
        <span className="text-[7px] font-black uppercase text-dragon-red tracking-widest opacity-60 leading-none truncate">
          {roll.label}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] font-bold text-dragon-darkRed">{roll.result}</span>
          <span className="text-[7px] text-parchment-400 font-black">+ {roll.modifier} mod</span>
        </div>
      </div>
      
      {/* Crit Mark */}
      {roll.result === roll.dieType && (
        <div className="absolute top-0 right-0 p-0.5 bg-amber-500 rounded-bl text-white">
          <GameIcon name="sparkles" size={6} color="currentColor" />
        </div>
      )}

      {/* Expiry Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: "linear" }}
        className="absolute bottom-0 left-0 h-0.5 bg-dragon-red/20"
      />
    </motion.div>
  );
};
