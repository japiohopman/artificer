import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../../store/useGameStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';

export const CombatGrid: React.FC = () => {
  const { activeCards } = useGameStore();
  const { characters, activeCharacterId } = useCharacterStore();
  
  const activeChar = characters.find(c => c.id === activeCharacterId);

  const monsters = activeCards.filter(c => c.challenge_rating !== undefined || c.type);

  return (
    <div className="w-full h-full relative bg-stone-900 overflow-hidden flex items-center justify-center">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />
      
      {/* Placeholder content for the tactical overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center border-4 border-dragon-gold/20 m-4 rounded-3xl">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="w-12 h-1 bg-dragon-red" />
            <h2 className="font-header text-3xl text-white uppercase tracking-[0.4em]">Tactical Overlay</h2>
            <div className="w-12 h-1 bg-dragon-red" />
          </div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Combat Matrix Initialized - Waiting for Turn Sequence</p>
        </div>

        {/* Initiative Tracker Mockup */}
        <div className="absolute top-24 right-8 flex flex-col gap-3">
           <div className="text-[9px] font-black text-dragon-gold uppercase tracking-widest text-right mb-1">Initiative Order</div>
           {[1, 2, 3].map(i => (
             <div key={i} className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded border border-white/10 group hover:border-dragon-gold/50 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-stone-800 border-2 border-white/20 overflow-hidden flex items-center justify-center">
                   <GameIcon name="user" size={14} color="#666" />
                </div>
                <div className="w-6 h-6 rounded bg-dragon-red/20 flex items-center justify-center text-[10px] font-black text-dragon-red border border-dragon-red/30">
                  {24 - (i * 4)}
                </div>
             </div>
           ))}
        </div>

        <div className="flex flex-col items-center gap-6 opacity-40">
          <GameIcon name="dice" size={128} color="#D4AF37" className="animate-pulse" />
          <div className="max-w-md text-center">
             <p className="font-header text-xl text-parchment-200 uppercase tracking-widest mb-4">Grid-Based Movement & Collision Pending</p>
             <p className="text-[11px] text-parchment-400 italic leading-relaxed">
               The tactical engine is synchronizing with character positions. Token movement, targeting, and environmental highlights will be rendered within this coordinate space.
             </p>
          </div>
        </div>

        {/* Placeholder for Character/Enemy Tokens */}
        <div className="absolute inset-0 flex items-center justify-center gap-12">
           {/* Player Token */}
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="relative"
           >
              <div className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] bg-blue-900/50 flex items-center justify-center overflow-hidden">
                {activeChar?.avatarUrl ? (
                  <img src={activeChar.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <GameIcon name="user" size={48} color="#FFF" />
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full border-2 border-white uppercase whitespace-nowrap">
                {activeChar?.name || 'Player'}
              </div>
           </motion.div>

           {/* Monster Tokens */}
           <AnimatePresence>
             {monsters.map((monster, idx) => (
               <motion.div 
                key={`${monster.index}-${idx}`}
                initial={{ scale: 0, x: 50, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
               >
                  <div className="w-24 h-24 rounded-full border-4 border-dragon-red shadow-[0_0_30px_rgba(220,38,38,0.5)] bg-red-900/50 flex items-center justify-center overflow-hidden">
                    {monster.imageUrl ? (
                      <img src={monster.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <GameIcon name="identity" size={48} color="#FFF" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-dragon-red text-white text-[10px] font-black px-3 py-0.5 rounded-full border-2 border-white uppercase whitespace-nowrap">
                    {monster.name}
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>
      
      {/* HUD Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
