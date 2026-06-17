import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDAndD } from '@fortawesome/free-brands-svg-icons';
import { GameIcon } from '../../game_icons';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { cn } from '../../lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiceText } from '../dice/DiceText';
import { normalizeImageUrl } from '../../services/storageService';

import { useStore } from '../../store/useStore';

export const MonsterProfile: React.FC = () => {
  const { 
    isMonsterProfileOpen, 
    setIsMonsterProfileOpen, 
    focusedItem: monster,
    rollDice3D
  } = useStore();

  const formatName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isMonsterProfileOpen || !monster) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[5000] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-paper-texture opacity-10 mix-blend-overlay pointer-events-none" />
      
      {/* Navbar Overlay */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-8 z-10">
        <button 
          onClick={() => setIsMonsterProfileOpen(false)}
          className="flex items-center gap-3 px-4 py-2 bg-dragon-red/10 hover:bg-dragon-red text-dragon-red hover:text-white rounded border border-dragon-red/20 transition-all group"
        >
          <GameIcon name="arrow_left" size={20} color="currentColor" />
          <span className="text-xs font-black uppercase tracking-widest">Return to Bestiary</span>
        </button>

        <div className="flex items-center gap-3 px-6 py-2 bg-dragon-red text-white rounded border border-dragon-gold shadow-lg">
           <GameIcon name="monsters" size={20} color="#FFFFFF" />
           <span className="text-xs font-black uppercase tracking-widest">Entity Data Link Active</span>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-stretch max-h-[85vh]">
         {/* Left: Visual Identity */}
         <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="aspect-[3/4] bg-dragon-red/5 rounded-2xl border border-dragon-red/10 relative overflow-hidden group">
               <ChromaKeyImage 
                src={normalizeImageUrl(monster.imageUrl, 'monsters', monster.index)} 
                alt={monster.name}
                className="w-full h-full object-contain relative z-10 transition-transform duration-1000 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[1]" />
               <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold animate-pulse" />
                     <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.3em]">Verified Specimen</span>
                  </div>
                  <h1 className="text-4xl font-header font-black text-white uppercase tracking-tighter leading-none">{monster.name}</h1>
               </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 space-y-4">
               <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Challenge Rating</span>
                  <span className="text-2xl font-header font-black text-dragon-gold">{monster.challenge_rating || "???"}</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Experience Yield</span>
                  <span className="text-xl font-header font-bold text-parchment-200">{monster.xp ? monster.xp.toLocaleString() : "---"}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Creature Type</span>
                  <span className="text-sm font-bold text-parchment-300 uppercase tracking-widest">{monster.type || "Unknown"}</span>
               </div>
            </div>
         </div>

         {/* Right: Technical Readout */}
         <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dragon-red/20 flex items-center justify-center border border-dragon-red/30">
                     <GameIcon name="weapon" size={24} color="#FF4444" />
                  </div>
                  <div>
                    <h2 className="text-lg font-header font-black text-white uppercase tracking-widest">Tactical Assessment</h2>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Combat Capabilities & Traits</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                     <section className="space-y-4">
                        <h3 className="text-xs font-black text-dragon-gold uppercase tracking-[0.3em] flex items-center gap-3 pb-2 border-b border-dragon-gold/20">
                           <GameIcon name="dice" size={14} color="currentColor" /> Attributes
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                           {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
                              <div key={stat} className="bg-black/20 rounded p-3 text-center border border-white/5">
                                 <div className="text-[8px] font-black text-white/40 uppercase mb-1">{stat.slice(0,3)}</div>
                                 <div className="text-lg font-header font-black text-white">
                                    {monster[stat]}
                                    <span className="text-[10px] text-dragon-red ml-1 opacity-60">
                                       ({Math.floor((monster[stat] - 10) / 2) >= 0 ? '+' : ''}{Math.floor((monster[stat] - 10) / 2)})
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     <section className="space-y-4">
                        <h3 className="text-xs font-black text-dragon-gold uppercase tracking-[0.3em] flex items-center gap-3 pb-2 border-b border-dragon-gold/20">
                           <GameIcon name="shield" size={14} color="currentColor" /> Defenses
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-dragon-red/10 rounded-lg p-4 border border-dragon-red/20 text-center">
                              <span className="text-[10px] font-black text-white/40 uppercase mb-1 block">Armor Class</span>
                              <span className="text-3xl font-header font-black text-white">{monster.armor_class?.[0]?.value || monster.armor_class || 10}</span>
                              <span className="text-[8px] text-white/30 block mt-1 uppercase font-bold">{monster.armor_class?.[0]?.type || "Natural"}</span>
                           </div>
                           <div className="bg-dragon-red/10 rounded-lg p-4 border border-dragon-red/20 text-center">
                              <span className="text-[10px] font-black text-white/40 uppercase mb-1 block">Hit Points</span>
                              <span className="text-3xl font-header font-black text-white">{monster.hit_points}</span>
                              <span className="text-[8px] text-white/30 block mt-1 font-bold uppercase">{monster.hit_dice} Matrix</span>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-4">
                        <h3 className="text-xs font-black text-dragon-gold uppercase tracking-[0.3em] flex items-center gap-3 pb-2 border-b border-dragon-gold/20">
                           <GameIcon name="weapon" size={14} color="currentColor" /> Actions
                        </h3>
                        <div className="space-y-4">
                           {monster.actions?.map((action: any, i: number) => (
                              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors">
                                 <div className="flex justify-between items-start mb-2">
                                    <span className="font-header font-black text-parchment-100 uppercase tracking-widest">{action.name}</span>
                                    {action.attack_bonus && (
                                       <span className="text-[10px] font-black text-dragon-red uppercase">Hit: +{action.attack_bonus}</span>
                                    )}
                                 </div>
                                 <div className="text-[11px] text-white/60 leading-relaxed italic">
                                    <DiceText>{action.desc}</DiceText>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>
                  </div>

                  <div className="space-y-10">
                     <section className="space-y-4">
                        <h3 className="text-xs font-black text-dragon-gold uppercase tracking-[0.3em] flex items-center gap-3 pb-2 border-b border-dragon-gold/20">
                           <GameIcon name="scroll" size={14} color="currentColor" /> Legendary Insights
                        </h3>
                        <div className="prose prose-invert prose-xs">
                           <Markdown remarkPlugins={[remarkGfm]}>
                              {monster.desc || "_Historical record for this entity is currently incomplete._"}
                           </Markdown>
                        </div>
                     </section>

                     <section className="space-y-4">
                        <h3 className="text-xs font-black text-dragon-gold uppercase tracking-[0.3em] flex items-center gap-3 pb-2 border-b border-dragon-gold/20">
                           <GameIcon name="magic_effect" size={14} color="currentColor" /> Special Traits
                        </h3>
                        <div className="space-y-4">
                           {monster.special_abilities?.map((trait: any, i: number) => (
                              <div key={i} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                 <span className="font-bold text-dragon-gold uppercase text-[10px] tracking-widest block mb-1">{trait.name}</span>
                                 <p className="text-[11px] text-white/70 leading-relaxed italic">{trait.desc}</p>
                              </div>
                           ))}
                        </div>
                     </section>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
