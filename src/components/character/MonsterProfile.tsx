import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDAndD } from '@fortawesome/free-brands-svg-icons';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';
import { ChromaKeyImage } from '../ChromaKeyImage';
import { cn } from '../../lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiceText } from '../DiceText';
import { normalizeImageUrl } from '../../services/storageService';

export const MonsterProfile: React.FC = () => {
  const { 
    isMonsterProfileOpen, 
    setIsMonsterProfileOpen, 
    focusedItem: monster 
  } = useStore();

  const formatName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isMonsterProfileOpen || !monster) return null;

  const getBackgroundUrl = (type?: string) => {
    const repo = "japiohopman/artificer";
    const branch = "main";
    const finalType = type || 'land_forest';
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/images/enemy_backgrounds/${finalType}.webp`;
    return `/api/raw?url=${encodeURIComponent(rawUrl)}`;
  };

  const statBox = (label: string, value: number) => {
    const mod = Math.floor((value - 10) / 2);
    return (
      <div className="flex flex-col items-center px-4 py-2 bg-black/5 rounded border border-black/5">
        <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest leading-none opacity-80">{label}</span>
        <span className="text-2xl font-header font-black text-dragon-darkRed leading-none mt-1.5 flex items-baseline gap-1">
          {value}
          <span className="text-[10px] font-bold text-dragon-red/60 font-sans">
            {mod >= 0 ? `+${mod}` : mod}
          </span>
        </span>
      </div>
    );
  };

  const formatComplexity = (val: any): string => {
    if (!val) return "None";
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') {
      return Object.entries(val)
        .map(([k, v]) => {
          const displayKey = k.replace(/_/g, ' ');
          if (typeof v === 'boolean') return v ? displayKey : '';
          return `${displayKey} ${v}`;
        })
        .filter(Boolean)
        .join(', ');
    }
    return String(val);
  };

  const StatSection = ({ label, value }: { label: string, value: string }) => (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-[#8B0000] font-black uppercase text-[12px]">{label}</span>
      <span className="text-sm text-parchment-900">{value}</span>
    </div>
  );

  const getImageUrl = () => {
    if (!monster) return '';
    return normalizeImageUrl(monster.imageUrl || monster.image, 'enemies', monster.index || monster.id || "");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 top-16 bg-black/60 backdrop-blur-md z-[100] overflow-hidden flex flex-col items-center justify-center p-4 md:p-6"
      >
        <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
        
        {/* Main Sheet Container */}
        <div 
          className="w-full max-w-7xl h-[90vh] rounded-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden font-sans border-t-8 border-dragon-darkRed/20"
          style={{
            backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
            <div className="p-8 md:p-16 lg:p-20 flex-1">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                
                {/* Left Area: Lore & Illustration */}
                <div className="lg:col-span-5 flex flex-col space-y-12">
                   <div className="space-y-4">
                      <div className="flex flex-col items-center lg:items-start">
                        <h1 className="font-bodoni text-[50px] lg:text-[70px] font-black text-dragon-darkRed tracking-tighter leading-none mb-6 drop-shadow-sm text-center lg:text-left">
                          {formatName(monster.name)}
                        </h1>

                        {/* Giant Illustration - Chroma Keyed and 3:2 aspect ratio */}
                        <div className="relative group w-full mb-8 flex items-center justify-center">
                           <div className="relative w-full aspect-[3/2] drop-shadow-[0_45px_100px_rgba(0,0,0,0.4)]">
                              <ChromaKeyImage 
                                src={getImageUrl()}
                                alt={monster.name} 
                                className="w-full h-full object-contain relative z-20 group-hover:scale-105 transition-transform duration-1000"
                              />
                              {/* Background Glow */}
                              <div className="absolute inset-0 bg-dragon-red/10 blur-[100px] rounded-full pointer-events-none z-10" />
                           </div>
                        </div>
                      </div>

                      <div className="prose prose-sm prose-slate max-w-none text-parchment-900 font-stix italic text-xl leading-relaxed opacity-95 border-t-4 border-[#D4AF37] pt-6 mt-4 [&_p]:border-t [&_p]:border-[#D4AF37]/30 [&_p]:pt-4 [&_p]:mt-4 first:[&_p]:border-t-0 first:[&_p]:pt-0 first:[&_p]:mt-0">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {monster.lore || "Fragments of truth concerning this entity have been lost to time."}
                        </Markdown>
                      </div>

                      {/* Structured Wiki Data Sections */}
                      {monster.wikiData && Object.keys(monster.wikiData).length > 0 && (
                        <div className="mt-12 space-y-8 border-t border-[#D4AF37]/30 pt-8">
                          {Object.entries(monster.wikiData).map(([title, content]: [string, any]) => {
                            const skipKeys = [
                              'mainLore', 'lore', 'name', 'index', 'size', 'type', 'subtype', 
                              'alignment', 'armor_class', 'hit_points', 'hit_dice', 'speed', 
                              'stats', 'rarity', 'card_color', 'background_type', 'challenge_rating', 
                              'item_drops', 'actions', 'special_abilities', 'legendary_actions', 
                              'reactions', 'senses', 'languages', 'xp', 'imageUrl', 'wikiData', 'wiki_data', 'sections'
                            ];
                            
                            if (skipKeys.some(k => k.toLowerCase() === title.toLowerCase())) return null;
                            
                            const displayContent = typeof content === 'string' ? content : JSON.stringify(content);
                            if (displayContent.length < 10) return null;

                            return (
                              <div key={title} className="space-y-3">
                                <h3 className="font-bodoni-sc text-2xl font-bold text-dragon-red uppercase tracking-widest border-b border-dragon-red/10 pb-1">
                                  {title.replace(/_/g, ' ')}
                                </h3>
                                <div className="text-parchment-800 font-serif text-lg leading-relaxed antialiased">
                                  <Markdown>{displayContent}</Markdown>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                   </div>
                </div>

                {/* Right Area: The classic D&D Stat Block */}
                <div className="lg:col-span-7">
                  <div className="bg-[#fdf1dc] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.2)] relative border-y-[4px] border-[#D4AF37] max-w-[600px] mx-auto lg:ml-auto lg:mr-0 group">
                     {/* Inner content with red rules */}
                     <div className="space-y-4 flex flex-col">
                        <header className="space-y-1">
                           <h2 className="font-bodoni text-5xl font-black text-[#8B0000] tracking-tight">{formatName(monster.name)}</h2>
                           <p className="italic text-lg text-parchment-800 font-serif border-b-2 border-[#8B0000] pb-2 mb-4">
                             {monster.size} {monster.type}, {monster.alignment}
                           </p>
                        </header>

                        <section className="space-y-1 font-bold text-[#8B0000] border-b-2 border-[#8B0000] pb-4">
                           <div className="flex items-baseline gap-2">
                              <span className="text-sm font-black uppercase tracking-widest text-[#8B0000]">Armor Class</span>
                              <span className="text-lg">{monster.armor_class} {monster.armor_desc ? `(${monster.armor_desc})` : ''}</span>
                           </div>
                           <div className="flex items-baseline gap-2">
                              <span className="text-sm font-black uppercase tracking-widest text-[#8B0000]">Hit Points</span>
                              <span className="text-lg">{monster.hit_points} {monster.hit_dice ? `(${monster.hit_dice})` : ''}</span>
                           </div>
                           <div className="flex items-baseline gap-2">
                              <span className="text-sm font-black uppercase tracking-widest text-[#8B0000]">Speed</span>
                              <span className="text-lg">{formatComplexity(monster.speed)}</span>
                           </div>
                           {monster.initiative !== undefined && (
                             <div className="flex items-baseline gap-2">
                               <span className="text-sm font-black uppercase tracking-widest text-[#8B0000]">Initiative</span>
                               <span className="text-lg">+{monster.initiative} ({10 + monster.initiative})</span>
                             </div>
                           )}
                        </section>

                        {/* Ability Scores Table */}
                        <div className="grid grid-cols-6 gap-2 text-center border-b-2 border-[#8B0000] py-4">
                           {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((stat) => {
                             const val = monster.stats?.[stat.toLowerCase() as keyof typeof monster.stats] || 10;
                             const mod = Math.floor((val - 10) / 2);
                             return (
                               <div key={stat} className="flex flex-col">
                                  <span className="text-[12px] font-black uppercase text-[#8B0000]">{stat}</span>
                                  <span className="text-[16px] text-[#8B0000]">{val} ({mod >= 0 ? `+${mod}` : mod})</span>
                               </div>
                             );
                           })}
                        </div>

                        {/* Senses, Languages, CR */}
                        <section className="space-y-1 text-sm border-b-2 border-[#8B0000] py-4">
                           {monster.skills && <StatSection label="Skills" value={monster.skills} />}
                           <StatSection label="Senses" value={formatComplexity(monster.senses)} />
                           {monster.languages && <StatSection label="Languages" value={formatComplexity(monster.languages)} />}
                           {monster.habitat && <StatSection label="Habitat" value={monster.habitat} />}
                           {monster.treasure && <StatSection label="Treasure" value={monster.treasure} />}
                           <StatSection label="Challenge" value={`${monster.challenge_rating} (${monster.xp?.toLocaleString() || 0} XP)`} />
                        </section>

                        {/* Special Abilities */}
                        <div className="space-y-4 py-4">
                           {monster.special_abilities?.map((sa: any, i: number) => (
                             <div key={i} className="text-[15px] text-parchment-900 leading-snug">
                                <span className="font-bold italic mr-1">{sa.name}.</span>
                                <DiceText>{sa.desc}</DiceText>
                             </div>
                           ))}
                        </div>

                        {/* Actions */}
                        {monster.actions?.length > 0 && (
                          <div className="space-y-4 pt-4">
                             <h3 className="text-2xl font-header font-black text-[#8B0000] border-b border-[#8B0000] mb-4">Actions</h3>
                             {monster.actions?.map((a: any, i: number) => (
                               <div key={i} className="text-[15px] text-parchment-900 leading-snug">
                                  <span className="font-bold italic mr-1">{a.name}.</span>
                                  <DiceText>{a.desc}</DiceText>
                               </div>
                             ))}
                          </div>
                        )}
                        
                        {/* Bonus Actions if any */}
                        {monster.bonus_actions?.length > 0 && (
                          <div className="space-y-4 pt-6">
                             <h3 className="text-2xl font-header font-black text-[#8B0000] border-b border-[#8B0000] mb-4">Bonus Actions</h3>
                             {monster.bonus_actions?.map((ba: any, i: number) => (
                               <div key={i} className="text-[15px] text-parchment-900 leading-snug">
                                  <span className="font-bold italic mr-1">{ba.name}.</span>
                                  <DiceText>{ba.desc}</DiceText>
                               </div>
                             ))}
                          </div>
                        )}

                        {/* Reactions if any */}
                        {monster.reactions?.length > 0 && (
                          <div className="space-y-4 pt-6">
                             <h3 className="text-2xl font-header font-black text-[#8B0000] border-b border-[#8B0000] mb-4">Reactions</h3>
                             {monster.reactions?.map((r: any, i: number) => (
                               <div key={i} className="text-[15px] text-parchment-900 leading-snug">
                                  <span className="font-bold italic mr-1">{r.name}.</span>
                                  <DiceText>{r.desc}</DiceText>
                               </div>
                             ))}
                          </div>
                        )}

                        {/* Legendary Actions if any */}
                        {monster.legendary_actions?.length > 0 && (
                          <div className="space-y-4 pt-6">
                             <h3 className="text-2xl font-header font-black text-[#8B0000] border-b border-[#8B0000] mb-4">Legendary Actions</h3>
                             {monster.legendary_actions?.map((la: any, i: number) => (
                               <div key={i} className="text-[15px] text-parchment-900 leading-snug">
                                  <span className="font-bold italic mr-1">{la.name}.</span>
                                  <DiceText>{la.desc}</DiceText>
                               </div>
                             ))}
                          </div>
                        )}

                        {/* Decorative Footer at the bottom of the sheet */}
                        <div className="pt-8 mt-12 border-t border-[#8B0000]/20 flex flex-col items-center justify-center opacity-60">
                           <FontAwesomeIcon icon={faDAndD} className="text-5xl text-[#8B0000]" />
                           <span className="text-[10px] font-black uppercase tracking-[0.6em] mt-3 text-[#8B0000]">Supreme Collector Series</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Decorative Footer below block removed */}
                </div>

              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const VitalBox = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
  <div className="bg-white/30 p-4 border border-dragon-red/5 rounded-sm flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-dragon-red/5 flex items-center justify-center text-dragon-red">
      <GameIcon name={icon as any} size={16} />
    </div>
    <div className="flex flex-col">
      <span className="text-[8px] font-black opacity-40 uppercase tracking-widest leading-none mb-1">{label}</span>
      <span className="text-[13px] font-black text-dragon-darkRed leading-tight uppercase font-header">{value}</span>
    </div>
  </div>
);

const DefensePill = ({ label, values, color }: { label: string, values: string[], color: 'red' | 'gold' | 'slate' | 'purple' }) => {
  const colors = {
    red: "text-red-700 bg-red-50/50 border-red-100",
    gold: "text-dragon-gold bg-dragon-gold/5 border-dragon-gold/20",
    slate: "text-slate-600 bg-slate-50/50 border-slate-100",
    purple: "text-purple-700 bg-purple-50/50 border-purple-100"
  };
  
  return (
    <div className={cn("px-4 py-3 border rounded-sm flex flex-col gap-1", colors[color])}>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">{label}</span>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span key={i} className="text-xs font-bold uppercase">
            {typeof v === 'string' ? v : (v as any)?.name || JSON.stringify(v)}
          </span>
        ))}
      </div>
    </div>
  );
};
