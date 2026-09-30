import React from 'react';
import { GameIcon } from '../../game_icons';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useActiveCharacter } from '../../lib/character';
import { getLevelFromXP } from '../../lib/characterUtils';
import { motion, AnimatePresence } from 'motion/react';
import { XP_TABLE, getXpProgress } from '../../lib/statCalculations';
import { cn } from '../../lib/utils';

export const Simulator: React.FC = () => {
  const {
    characters,
    addXp,
    activeCharacterId,
    setActiveCharacter,
    activeLevelUpSession,
    startLevelUpSession,
    cancelLevelUpSession,
    commitLevelUpSession
  } = useCharacterStore();

  const activeChar = useActiveCharacter();
  const isEligible = activeChar ? getLevelFromXP(activeChar.xp) > activeChar.level : false;

  const handleGrantToThreshold = async () => {
    if (!activeChar) return;
    const currentTarget = XP_TABLE[activeChar.level - 1] || 0;
    const nextTarget = XP_TABLE[activeChar.level] || (currentTarget + 1000);
    const amountNeeded = Math.max(0, nextTarget - activeChar.xp);
    await addXp(activeChar.id, amountNeeded);
  };

  const handleGrantXp = async (amount: number) => {
    if (!activeChar) return;
    await addXp(activeChar.id, amount);
  };

  const handleCommitValid = async () => {
    if (!activeLevelUpSession || !activeChar) return;
    await commitLevelUpSession({
      characterId: activeLevelUpSession.characterId,
      targetLevel: activeLevelUpSession.targetLevel,
      finalHpGain: activeLevelUpSession.hpIncrease
    });
  };

  const handleCommitInvalid = async () => {
    if (!activeLevelUpSession || !activeChar) return;
    // Test invalid target level commit
    await commitLevelUpSession({
      characterId: activeLevelUpSession.characterId,
      targetLevel: 99,
      finalHpGain: activeLevelUpSession.hpIncrease
    });
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
         <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6">
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
                 className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all cursor-pointer"
               >
                 Grant 100 XP
               </button>
               <button 
                 onClick={() => handleGrantXp(1000)}
                 className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all cursor-pointer"
               >
                 Grant 1000 XP
               </button>
               <button 
                 onClick={handleGrantToThreshold}
                 className="col-span-2 py-3 bg-dragon-gold/20 hover:bg-dragon-gold/30 text-dragon-gold border border-dragon-gold/40 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer"
               >
                 Grant XP To Next Level Threshold
               </button>

               {/* Explicit Start Level Up Session when eligible */}
               {isEligible && (
                 <button
                   onClick={() => startLevelUpSession(activeChar.id)}
                   className="col-span-2 py-4 bg-dragon-red hover:bg-dragon-darkRed text-white border-2 border-dragon-gold rounded-lg text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95 cursor-pointer animate-pulse"
                 >
                   Start Level Up Session (Level {activeChar.level + 1})
                 </button>
               )}
            </div>
         </div>

         {/* Active Progression Session Tester */}
         <div className="bg-black/40 rounded-2xl p-8 border border-dragon-gold/20 flex flex-col space-y-6">
            <div className="flex items-center gap-3">
               <GameIcon name="gears" size={24} color="#D4AF37" />
               <h3 className="font-header text-xl text-dragon-gold uppercase tracking-widest">Session Inspector</h3>
            </div>

            {activeLevelUpSession ? (
               <div className="space-y-4 text-[11px] text-parchment-200">
                  <div className="bg-white/5 p-4 rounded border border-white/10 space-y-1 font-mono">
                     <div><strong>Character:</strong> {activeLevelUpSession.characterId}</div>
                     <div><strong>Target Level:</strong> {activeLevelUpSession.targetLevel}</div>
                     <div><strong>Class Hit Die:</strong> 1d{activeLevelUpSession.classHitDie}</div>
                     <div><strong>Has ASI:</strong> {activeLevelUpSession.hasASI ? 'Yes' : 'No'}</div>
                     <div><strong>Features:</strong> {activeLevelUpSession.features?.length || 0}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                     <button
                       onClick={() => cancelLevelUpSession()}
                       className="py-2.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-stone-600"
                     >
                        Cancel Session
                     </button>
                     <button
                       onClick={handleCommitValid}
                       className="py-2.5 px-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-emerald-500"
                     >
                        Commit Valid
                     </button>
                     <button
                       onClick={handleCommitInvalid}
                       className="py-2.5 px-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-600"
                       title="Tests store-boundary rejection for mismatched targetLevel"
                     >
                        Commit Invalid (99)
                     </button>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-white/30 space-y-2 py-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Session</span>
                  <span className="text-[9px] text-white/20">
                     {isEligible ? 'Character is eligible. Click "Start Level Up Session" to create session.' : 'Grant XP to reach next level eligibility.'}
                  </span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
