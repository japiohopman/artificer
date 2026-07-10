import React from 'react';
import { motion } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { getEnemyArtworkUrl } from '../../services/storageService';

export const EnemyStats: React.FC = () => {
  const { focusedItem: enemy } = useUIStore();

  if (!enemy || enemy._type !== 'enemies') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-parchment-400 p-8 text-center opacity-40">
        <GameIcon name="shield_alert" size={48} className="mb-4" />
        <p className="font-header text-lg uppercase tracking-widest leading-none mb-2">No Target Selected</p>
        <p className="text-[9px] font-bold uppercase tracking-tighter italic">Select an entity on the grid to reveal tactical data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Enemy Identity */}
      <div className="bg-stone-900/40 rounded-xl border border-white/5 overflow-hidden">
         <div className="h-48 relative overflow-hidden group">
            <img 
              src={getEnemyArtworkUrl(enemy) || 'https://picsum.photos/seed/enemy/400/600'}
              className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" 
              alt={enemy.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-dragon-red animate-pulse" />
                  <span className="text-[9px] font-black text-dragon-red uppercase tracking-[0.2em]">Hostile Detected</span>
               </div>
               <h3 className="font-header text-2xl text-white uppercase tracking-tighter leading-none mb-1">{enemy.name}</h3>
               <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{enemy.type} | CR {enemy.challenge_rating || '???'}</p>
            </div>
         </div>

         {/* Vitality Bar */}
         <div className="p-4 bg-stone-950/60 border-t border-white/5">
            <div className="flex justify-between items-end mb-2">
               <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Vitality Matrix</span>
               <span className="font-header text-xl text-white tracking-widest leading-none">{enemy.hit_points || '---'} / {enemy.hit_points || '---'} HP</span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden border border-white/10">
               <div className="h-full bg-gradient-to-r from-dragon-darkRed to-dragon-red shadow-[0_0_10px_rgba(139,0,0,0.5)] w-full" />
            </div>
         </div>
      </div>

      {/* Resistances & Weaknesses */}
      <div className="space-y-4">
         <h4 className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.3em] border-b border-dragon-gold/20 pb-2 flex items-center gap-2">
            <GameIcon name="shield" size={14} color="currentColor" /> Combat Affinities
         </h4>
         
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded p-3 border border-white/5">
               <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  Resistances
               </div>
               <div className="flex flex-wrap gap-1">
                  {(enemy.damage_resistances || ['None']).map((r: string) => (
                    <span key={r} className="text-[9px] font-bold text-white/60 uppercase bg-stone-900 px-1.5 py-0.5 rounded border border-white/5">{r}</span>
                  ))}
               </div>
            </div>
            <div className="bg-white/5 rounded p-3 border border-white/5">
               <div className="text-[8px] font-black text-dragon-red uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-dragon-red rounded-full" />
                  Weaknesses
               </div>
               <div className="flex flex-wrap gap-1">
                  {(enemy.damage_vulnerabilities || ['None']).map((v: string) => (
                    <span key={v} className="text-[9px] font-bold text-white/60 uppercase bg-stone-900 px-1.5 py-0.5 rounded border border-white/5">{v}</span>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Status Effects */}
      <div className="space-y-4">
         <h4 className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.3em] border-b border-dragon-gold/20 pb-2 flex items-center gap-2">
            <GameIcon name="magic_effect" size={14} color="currentColor" /> Status Matrix
         </h4>
         <div className="flex flex-wrap gap-2">
            <div className="p-2 bg-stone-900/60 rounded border border-white/10 flex items-center gap-3 group hover:border-dragon-red/50 transition-colors">
               <div className="w-8 h-8 rounded bg-dragon-red/10 flex items-center justify-center">
                  <GameIcon name="burning" size={18} color="#FF4444" />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase leading-none">Burning</span>
                  <span className="text-[8px] font-bold text-white/40 uppercase mt-1">2 Turns Remaining</span>
               </div>
            </div>
         </div>
      </div>

      {/* Tactical Note */}
      <div className="mt-auto pt-6 border-t border-white/5">
         <div className="p-3 bg-dragon-red/5 rounded border border-dragon-red/10">
            <p className="text-[9px] text-white/40 leading-relaxed italic">
               Sensor analysis suggests high-output physical capabilities. Maintain defensive distance and utilize elemental vulnerabilities.
            </p>
         </div>
      </div>
    </div>
  );
};
