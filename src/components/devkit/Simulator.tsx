import React from 'react';
import { GameIcon } from '../../game_icons';
import { useCharacterStore } from '../../store/useCharacterStore';
import { motion, AnimatePresence } from 'motion/react';
import { XP_TABLE, getXpProgress } from '../../lib/statCalculations';
import { cn } from '../../lib/utils';

export const Simulator: React.FC = () => {
  const { characters, addXp, activeCharacterId, setActiveCharacter } = useCharacterStore();
  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];

  const handleLevelUp = async () => {
    if (!activeChar) return;
    const currentTarget = XP_TABLE[activeChar.level - 1] || 0;
    const nextTarget = XP_TABLE[activeChar.level] || (currentTarget + 1000);
    const amountNeeded = nextTarget - activeChar.xp;
    await addXp(activeChar.id, amountNeeded);
  };

  const handleGrantXp = async (amount: number) => {
    if (!activeChar) return;
    await addXp(activeChar.id, amount);
  };

  if (!activeChar) return (
    <div className="flex-1 flex items-center justify-center text-white/20 uppercase font-black tracking-widest">
       Initialize active party to begin simulation
    </div>
  );

  return (
    <div className="flex-1 p-8 space-y-12">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-dragon-red/10 border-2 border-dragon-gold shadow-2xl overflow-hidden shrink-0">
               {activeChar.avatarUrl ? (
                 <img src={activeChar.avatarUrl} className="w-full h-full object-cover" alt="" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-dragon-red/20">
                    <GameIcon name="user" size={48} />
                 </div>
               )}
            </div>
            <div>
               <h2 className="text-4xl font-header font-black text-white uppercase tracking-tighter leading-none mb-2">{activeChar.name}</h2>
               <div className="flex items-center gap-4 text-[12px] font-black text-dragon-red uppercase tracking-[0.3em]">
                  <span>{activeChar.class}</span>
                  <span className="text-white/20">•</span>
                  <span>Level {activeChar.level}</span>
               </div>
            </div>
         </div>

         <div className="flex gap-3">
            {characters.map((c, i) => (
               <button 
                key={c.id}
                onClick={() => setActiveCharacter(c.id)}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center font-bold",
                  activeCharacterId === c.id ? "bg-dragon-red border-dragon-gold text-white" : "bg-black/40 border-white/10 text-white/40 hover:border-white/30"
                )}
               >
                 {i + 1}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Progression Sim */}
         <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 space-y-6">
            <div className="flex items-center gap-3">
               <GameIcon name="lightning" size={24} color="#D4AF37" />
               <h3 className="font-header text-xl text-white uppercase tracking-widest">Progression Engine</h3>
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <span>Current Experience</span>
                  <span>{activeChar.xp.toLocaleString()} XP</span>
               </div>
               <div className="h-4 bg-black/40 rounded-full border border-white/10 overflow-hidden relative shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getXpProgress(activeChar.level, activeChar.xp)}%` }}
                    className="h-full bg-gradient-to-r from-dragon-red to-dragon-gold relative"
                  >
                     <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
               <button 
                 onClick={() => handleGrantXp(100)}
                 className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all"
               >
                 Grant 100 XP
               </button>
               <button 
                 onClick={() => handleGrantXp(1000)}
                 className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all"
               >
                 Grant 1000 XP
               </button>
               <button 
                 onClick={handleLevelUp}
                 className="col-span-2 py-4 bg-dragon-red hover:bg-dragon-darkRed text-white border-2 border-dragon-gold/30 rounded-lg text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95"
               >
                 Trigger Instant Level Up
               </button>
            </div>
         </div>

         {/* System Logs (Future) */}
         <div className="bg-black/20 rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center text-white/10 space-y-4">
            <GameIcon name="gears" size={64} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Simulation Monitor</span>
         </div>
      </div>
    </div>
  );
};
