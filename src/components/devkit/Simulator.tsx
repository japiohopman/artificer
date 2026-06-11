import React from 'react';
import { GameIcon } from '../../game_icons';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { XP_TABLE, getXpProgress } from '../../lib/statCalculations';
import { cn } from '../../lib/utils';

export const Simulator: React.FC = () => {
  const { characters, addXp, activeCharacterId, setActiveCharacter } = useStore();
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
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#161616] font-mono">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Progression Simulator</h2>
            <p className="text-sm text-white/30 tracking-widest uppercase">Direct Node Override // Leveling Engine</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end max-w-[50%]">
            {characters.map((c, i) => (
              <button 
                key={c.id} 
                onClick={() => setActiveCharacter(c.id)}
                title={c.name}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all relative overflow-hidden shrink-0",
                  activeCharacterId === c.id ? "border-dragon-red z-20 scale-110 shadow-[0_0_15px_rgba(139,0,0,0.4)]" : "border-white/10 hover:border-white/30 z-10 opacity-60"
                )}
              >
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <GameIcon name="user" size={14} color="white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Character Card & XP Bar */}
        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <GameIcon name="award" size={160} />
           </div>

           <div className="relative z-10 flex flex-col md:flex-row gap-8">
              <div className="w-32 h-32 rounded-xl border border-white/10 bg-black/40 p-2 shrink-0">
                  <div className="w-full h-full rounded-lg overflow-hidden relative">
                    {activeChar.imageUrl ? (
                      <img src={activeChar.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <GameIcon name="users" size={48} />
                      </div>
                    )}
                  </div>
              </div>

              <div className="flex-1 space-y-6">
                 <div>
                    <div className="flex items-baseline gap-4 mb-1">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight">{activeChar.name}</h3>
                      <span className="text-dragon-red font-black text-sm uppercase">Level {activeChar.level} {activeChar.class}</span>
                    </div>
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">{activeChar.race} // {activeChar.alignment}</p>
                 </div>

                 {/* XP Bar */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Synaptic_Progress</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-dragon-red">{activeChar.xp.toLocaleString()}</span>
                          <span className="text-[10px] font-black text-white/20 uppercase">/ {(XP_TABLE[activeChar.level] || 0).toLocaleString()} XP</span>
                       </div>
                    </div>
                    <div className="h-4 bg-black/40 rounded-full border border-white/5 p-1 relative overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${getXpProgress(activeChar.level, activeChar.xp)}%` }}
                          className="h-full bg-gradient-to-r from-dragon-red to-red-600 rounded-full shadow-[0_0_15px_rgba(139,0,0,0.3)]"
                       />
                       {/* Level Thresh Markers */}
                       <div className="absolute inset-0 flex justify-evenly pointer-events-none">
                          {[25, 50, 75].map(p => <div key={p} className="w-px h-full bg-white/5" />)}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* XP Injectors */}
           <div className="space-y-4" style={{ marginTop: '100px', width: '4000px' }}>
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">XP_Injection_Modules</h4>
              <div className="grid grid-cols-2 gap-3" style={{ padding: '5px 0', height: '74.778px' }}>
                 {[100, 500, 1000, 5000].map(amt => (
                   <button 
                    key={amt}
                    onClick={() => handleGrantXp(amt)}
                    className="py-4 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-white hover:bg-dragon-red/20 hover:border-dragon-red/40 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                    style={{ height: '22px', width: '400px' }}
                   >
                     <GameIcon name="magic_effect" size={14} className="text-dragon-red" />
                     <span style={{ fontSize: '10px', lineHeight: '15px', fontFamily: 'monospace' }}>+{amt} XP</span>
                   </button>
                 ))}
              </div>
              <button 
                onClick={handleLevelUp}
                className="w-full py-6 bg-dragon-red/10 border-2 border-dragon-red/30 rounded-2xl text-sm font-black text-dragon-red hover:bg-dragon-red hover:text-white transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-4 relative group"
              >
                <div className="absolute inset-0 bg-dragon-red/20 animate-pulse group-hover:hidden" />
                <GameIcon name="award" size={20} />
                Trigger Instant Level Up
              </button>
           </div>

           {/* Feature Log */}
           <div className="bg-black/30 rounded-2xl border border-white/5 p-6 space-y-4 flex flex-col h-[400px]">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Recently_Virtualized_Features</h4>
                <div className="px-2 py-0.5 bg-dragon-red/10 rounded border border-dragon-red/20 text-[9px] font-bold text-dragon-red uppercase">
                   {activeChar.features.length} ACTIVE
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 {activeChar.features.slice().reverse().map((feat, i) => (
                   <div 
                    key={`${feat.index}-${i}`}
                    className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex gap-3 group hover:bg-white/[0.05] transition-all"
                   >
                      <div className="w-8 h-8 rounded border border-white/10 bg-black/40 flex items-center justify-center shrink-0">
                         <GameIcon name="award" size={14} className="text-dragon-red group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                         <div className="text-[11px] font-black text-white uppercase tracking-tight">{feat.name}</div>
                         <div className="text-[9px] text-white/40 uppercase font-bold mb-1">Source: {feat.source}</div>
                         <p className="text-[10px] text-white/30 leading-relaxed italic line-clamp-2">{feat.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
