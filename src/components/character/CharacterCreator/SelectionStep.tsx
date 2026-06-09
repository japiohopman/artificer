import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { 
  fetchSpeciesWikiData, fetchSpeciesData,
  fetchClassWikiData, fetchClassData,
  fetchBackgroundData, fetchAlignmentData,
  fetchSubraceData, fetchTraitData, fetchWikiAsset
} from '../../../services/storageService';
import { getTraitIcon, getProficiencyIcon } from '../../../lib/atlasUtils';

const CATEGORY_ICONS: Record<string, any> = {
    // Classes
    'barbarian': 'barbarian',
    'bard': 'bard',
    'cleric': 'cleric',
    'druid': 'druid',
    'fighter': 'fighter',
    'monk': 'monk',
    'paladin': 'paladin',
    'ranger': 'ranger',
    'rogue': 'rogue',
    'sorcerer': 'sorcerer',
    'warlock': 'warlock',
    'wizard': 'wizard',
    'artificer': 'artificer',
    // Races
    'dragonborn': 'dragonborn',
    'dwarf': 'dwarf',
    'elf': 'elf',
    'gnome': 'gnome',
    'halfling': 'halfling',
    'human': 'human',
    'tiefling': 'thiefling',
    'half-elf': 'half_elf',
    'half-orc': 'half_orc',
    'drow': 'elf',
    'high-elf': 'elf',
    'wood-elf': 'elf',
    'hill-dwarf': 'dwarf',
    'mountain-dwarf': 'dwarf',
    'lightfoot-halfling': 'halfling',
    'stout-halfling': 'halfling',
    'rock-gnome': 'gnome',
    'forest-gnome': 'gnome'
};

const STAT_ICONS: Record<string, any> = {
    str: 'str',
    dex: 'dex',
    con: 'con',
    int: 'int',
    wis: 'wis',
    cha: 'cha'
};

export const SelectionStep: React.FC<{
    title: string;
    desc: string;
    items: {name: string, index: string}[];
    selected?: string;
    onSelect: (val: string) => void;
    category: string;
}> = ({ title, desc, items, selected, onSelect, category }) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hydratedTraits, setHydratedTraits] = useState<Record<string, any>>({});
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
        fetchDetail(selected);
    }
  }, [selected]);

  const fetchDetail = async (index: string) => {
    setLoadingDetail(true);
    let data = null;
    let statsData = null;
    try {
        if (category === 'species') {
            data = await fetchSpeciesWikiData(index);
            statsData = await fetchSpeciesData(index);
        }
        else if (category === 'subrace') {
            data = await fetchSubraceData(index);
            statsData = data;
        }
        else if (category === 'class') {
            data = await fetchClassWikiData(index);
            statsData = await fetchClassData(index);
        }
        else if (category === 'backgrounds') data = await fetchBackgroundData(index);
        else if (category === 'alignments') data = await fetchAlignmentData(index);
        
        setDetailData({ ...data, stats: statsData });

        // Hydrate traits/proficiencies for tooltips
        const traits = (data?.traits || statsData?.proficiencies || data?.proficiencies || []).slice(0, 20);
        const traitPromises = traits.map(async (t: any) => {
            const tIndex = t.index || (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '_') : '');
            const tUrl = t.url;
            
            let tData = null;
            if (tUrl && !tUrl.includes('/json/')) {
                if (tUrl.includes('/traits/')) {
                    tData = await fetchTraitData(tIndex);
                } else {
                    tData = await fetchWikiAsset(tUrl);
                }
            } else if (tIndex) {
                tData = await fetchTraitData(tIndex);
            }
            
            if (tData) return { id: tIndex || (t.name || t), data: tData };
            return null;
        });

        const results = await Promise.all(traitPromises);
        const traitsMap: Record<string, any> = {};
        results.forEach(r => {
            if (r) traitsMap[r.id] = r.data;
        });
        setHydratedTraits(traitsMap);

    } catch (e) {
        console.error(e);
    } finally {
        setLoadingDetail(false);
    }
  };

  const artUrl = detailData?.imageUrl;

   return (
    <div className="h-full flex flex-col overflow-hidden">
       <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0 p-1">
          {/* List - Grid for all, or sidebar for specific */}
          <div className={cn(
              "overflow-y-auto custom-scrollbar content-start py-2",
              category === 'backgrounds' ? "w-full md:w-80 grid grid-cols-2 gap-2 pr-2" : "w-14 grid grid-cols-1 gap-1 pr-1 border-r border-dragon-gold/10"
          )}>
              {items.map(item => {
                const normalizedKey = item.index.toLowerCase().replace(/_/g, '-');
                const iconName = CATEGORY_ICONS[normalizedKey] || 'info';
                const isSelected = selected === item.index;
                
                return (
                    <button
                        key={item.index}
                        onClick={() => onSelect(item.index)}
                        title={item.name}
                        className={cn(
                            "flex items-center justify-center rounded-sm border transition-all relative shrink-0 overflow-hidden",
                            category === 'backgrounds' ? "w-full h-12 px-3 justify-start bg-white/40" : "w-10 h-10",
                            isSelected 
                                ? "bg-dragon-red text-white border-dragon-red shadow-lg scale-105 z-10" 
                                : "bg-white/10 border-dragon-red/5 hover:border-dragon-red/20 text-parchment-950 hover:bg-white/40"
                        )}
                    >
                         {/* Selection Highlight */}
                         {isSelected && (
                            <motion.div 
                                layoutId="selection-highlight"
                                className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" 
                            />
                        )}

                        {category === 'backgrounds' ? (
                            <div className="flex flex-col items-start overflow-hidden w-full">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest truncate w-full",
                                    isSelected ? "text-white" : "text-dragon-darkRed"
                                )}>
                                    {item.name}
                                </span>
                                {isSelected && <span className="text-[7px] text-white/60 font-medium uppercase tracking-tighter">Selected Path</span>}
                            </div>
                        ) : (
                             <div className="w-6 h-6 flex items-center justify-center">
                                <GameIcon name={iconName as any} color="currentColor" />
                             </div>
                        )}
                        {isSelected && category !== 'backgrounds' && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full translate-x-1/3 -translate-y-1/3 shadow-sm border border-dragon-red" />
                        )}
                    </button>
                );
              })}
          </div>
 
          {/* Details Panel */}
          <div className="flex-1 bg-white/40 border border-dragon-gold/20 rounded-sm p-3 relative overflow-hidden flex flex-col">
             {loadingDetail ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <GameIcon name="refresh" color="#B8860B" size={20} className="animate-spin" />
                 </div>
             ) : detailData ? (
                 <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                    <div className="space-y-4">
                        <div className="flex gap-8 items-start border-b border-dragon-gold/10 pb-6 relative group/header">
                            {artUrl && (
                                <div className="w-48 h-48 lg:w-56 lg:h-56 bg-dragon-red/5 border-2 border-dragon-gold/20 shadow-[0_0_40px_rgba(153,27,27,0.15)] overflow-hidden p-2 shrink-0 rounded-sm group relative">
                                    <div className="absolute inset-0 bg-paper-texture opacity-30 mix-blend-multiply" />
                                    <img 
                                        src={artUrl} 
                                        alt={detailData.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                                    />
                                    <div className="absolute inset-0 border-2 border-dragon-gold/10 m-1 pointer-events-none" />
                                </div>
                            )}

                             <div className="flex-1 space-y-6 pt-24">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-4 justify-center lg:justify-start relative group/header">
                                        {selected && CATEGORY_ICONS[selected.toLowerCase().replace(/_/g, '-')] && (
                                            <div className="absolute -left-12 lg:-left-16 top-1/2 -translate-y-[60%] text-dragon-red/5 pointer-events-none group-hover/header:text-dragon-red/10 transition-all duration-700 -z-10 group-hover/header:scale-110">
                                                <GameIcon name={CATEGORY_ICONS[selected.toLowerCase().replace(/_/g, '-')] as any} size={280} />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-6 relative z-10 transition-transform group-hover/header:translate-x-2">
                                            <h3 className="text-7xl font-header font-black text-dragon-darkRed uppercase tracking-[0.05em] drop-shadow-md select-none leading-none">{detailData.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-dragon-gold/30" />
                                        <GameIcon name="award" size={14} color="#B8860B" className="animate-pulse" />
                                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-dragon-gold/30" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                                    {category === 'species' ? (
                                        <>
                                            <div className="flex flex-col border-b border-dragon-gold/20 pb-2 bg-gradient-to-t from-dragon-gold/5 to-transparent px-3 rounded-t-sm">
                                                <span className="text-[10px] font-black uppercase text-parchment-400 tracking-[0.2em]">Velocity</span>
                                                <span className="text-2xl font-header font-black text-dragon-red uppercase tracking-tight">{detailData.stats?.speed || '30'} ft.</span>
                                            </div>
                                            <div className="flex flex-col border-b border-dragon-gold/20 pb-2 bg-gradient-to-t from-dragon-gold/5 to-transparent px-3 rounded-t-sm">
                                                <span className="text-[10px] font-black uppercase text-parchment-400 tracking-[0.2em]">Magnitude</span>
                                                <span className="text-2xl font-header font-black text-dragon-red uppercase tracking-tight">{detailData.stats?.size || 'Medium'}</span>
                                            </div>
                                            <div className="col-span-2 space-y-2 p-3 bg-white/40 border border-dragon-gold/10 rounded-sm shadow-inner group/span">
                                                <span className="text-[10px] font-black uppercase text-parchment-400 block tracking-[0.3em]">Mortal Span</span>
                                                <p className="text-[11px] font-bold text-parchment-700 leading-relaxed italic group-hover/span:text-dragon-red transition-colors">
                                                    "{detailData.stats?.age || 'Historical records regarding their natural expiry are scattered across the Atlas.'}"
                                                </p>
                                            </div>
                                            <div className="col-span-2 mt-4 p-5 bg-dragon-gold/5 border border-dragon-gold/20 rounded-sm relative overflow-hidden group/counsel">
                                                <div className="absolute top-0 right-0 p-1 opacity-10 group-hover/counsel:opacity-20 transition-opacity">
                                                    <GameIcon name="dna" size={40} color="currentColor" />
                                                </div>
                                                <h5 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                                                    <GameIcon name="info" size={14} color="#B8860B" className="animate-pulse" />
                                                    Genesis_Counsel
                                                </h5>
                                                <p className="text-[10px] text-parchment-700 font-bold leading-relaxed italic relative z-10">
                                                    "Your ancestry is the bedrock of your legend. It grants you innate resistances, specialized environmental awareness, and biological advantages that will define your tactical approach."
                                                </p>
                                            </div>
                                        </>
                                    ) : category === 'class' ? (
                                        <>
                                            <div className="flex flex-col border-b border-dragon-gold/20 pb-2 bg-gradient-to-t from-dragon-gold/5 to-transparent px-3 rounded-t-sm relative overflow-hidden group/hitdie">
                                                <span className="text-[10px] font-black uppercase text-parchment-400 tracking-[0.2em]">Resilience</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-dragon-red opacity-40 group-hover/hitdie:opacity-80 transition-opacity">
                                                        <GameIcon name={`d${detailData.stats?.hit_die || '8'}` as any} size={28} />
                                                    </div>
                                                    <span className="text-2xl font-header font-black text-dragon-red uppercase tracking-tight">D{detailData.stats?.hit_die || '8'} Die</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col border-b border-dragon-gold/20 pb-2 bg-gradient-to-t from-dragon-gold/5 to-transparent px-3 rounded-t-sm overflow-hidden group/saves">
                                                <span className="text-[10px] font-black uppercase text-parchment-400 tracking-[0.2em]">Saving Throws</span>
                                                <div className="flex gap-2 items-center">
                                                    {detailData.stats?.saving_throws?.map((s: any, idx: number) => {
                                                        const sName = (s.name || s).toLowerCase();
                                                        let sIcon = null;
                                                        if (sName.includes('str')) sIcon = 'str';
                                                        else if (sName.includes('dex')) sIcon = 'dex';
                                                        else if (sName.includes('con')) sIcon = 'con';
                                                        else if (sName.includes('int')) sIcon = 'int';
                                                        else if (sName.includes('wis')) sIcon = 'wis';
                                                        else if (sName.includes('cha')) sIcon = 'cha';
                                                        
                                                        return (
                                                            <div key={idx} className="flex items-center gap-1 text-dragon-red">
                                                                {sIcon && STAT_ICONS[sIcon] && (
                                                                    <div className="opacity-60 group-hover/saves:opacity-100 transition-opacity">
                                                                        <GameIcon name={STAT_ICONS[sIcon] as any} size={12} />
                                                                    </div>
                                                                )}
                                                                <span className="text-[11px] font-black uppercase tracking-tighter truncate">{s.name || s}</span>
                                                            </div>
                                                        );
                                                    }) || <span className="text-[11px] font-black text-dragon-red/40 uppercase tracking-tighter">Martial Focus</span>}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="col-span-2 flex flex-col border-b border-dragon-gold/20 pb-2 bg-gradient-to-t from-dragon-gold/5 to-transparent px-3 rounded-t-sm">
                                            <span className="text-[10px] font-black uppercase text-parchment-400 tracking-[0.2em]">Manifestation Detail</span>
                                            <span className="text-2xl font-header font-black text-dragon-red uppercase tracking-tight">{detailData.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="markdown-body prose prose-slate prose-sm max-w-none text-[12px] font-medium text-parchment-700 leading-relaxed border-l-2 border-dragon-gold/20 pl-4">
                            <Markdown children={(() => {
                                const desc = detailData.desc || detailData.lore || detailData.description;
                                if (Array.isArray(desc)) return desc.join('\n\n');
                                return typeof desc === 'string' ? desc : "Historical records for this specific lineage are presently undergoing restoration.";
                            })() || ""} />
                        </div>
    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                           {category === 'backgrounds' && detailData.feature && (
                              <div className="space-y-2 col-span-2">
                                 <h4 className="text-[9px] font-black text-dragon-red uppercase tracking-[0.3em] flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-dragon-red" />
                                     Background Privilege: {detailData.feature.name}
                                 </h4>
                                 <div className="p-3 bg-dragon-gold/5 border border-dragon-gold/10 rounded-sm">
                                    <p className="text-[10px] font-bold text-parchment-700 leading-relaxed italic">
                                        {Array.isArray(detailData.feature.desc) ? detailData.feature.desc.join(' ') : detailData.feature.desc}
                                    </p>
                                 </div>
                              </div>
                           )}

                           {category === 'backgrounds' && (detailData.starting_equipment || detailData.starting_equipment_options) && (
                              <div className="space-y-2">
                                 <h4 className="text-[9px] font-black text-dragon-red uppercase tracking-[0.3em] flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-dragon-red" />
                                     Manifested Gear
                                 </h4>
                                 <div className="flex flex-wrap gap-1.5">
                                    {(detailData.starting_equipment || []).map((eq: any, i: number) => (
                                       <div key={i} className="px-2 py-1 bg-parchment-100 border border-dragon-gold/20 rounded-sm text-[9px] font-black text-dragon-darkRed uppercase tracking-tighter">
                                          {eq.equipment?.name || eq.name} {eq.quantity > 1 ? `x${eq.quantity}` : ''}
                                       </div>
                                    ))}
                                    {(detailData.starting_equipment_options || []).map((opt: any, i: number) => (
                                       <div key={`opt-${i}`} className="px-2 py-1 bg-white border border-dragon-gold/10 rounded-sm text-[9px] font-black text-parchment-400 uppercase tracking-tighter italic">
                                          + Choice of {opt.desc || 'Equipment'}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {(detailData.traits || detailData.stats?.proficiencies || detailData.proficiencies || (category === 'backgrounds' && detailData.starting_proficiencies)) && (
                              <div className="space-y-2">
                                 <h4 className="text-[9px] font-black text-dragon-red uppercase tracking-[0.3em] flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-dragon-red" />
                                     {category === 'species' ? 'Ancestral Traits' : category === 'class' ? 'Core Proficiencies' : category === 'backgrounds' ? 'Learned Proficiencies' : 'Innate Traits'}
                                 </h4>
                                 <div className="flex flex-wrap gap-1.5">
                                    {(detailData.traits || detailData.stats?.proficiencies || detailData.proficiencies || detailData.starting_proficiencies || []).slice(0, 20).map((t: any, i: number) => {
                                        const pName = (t.name || t).toLowerCase();
                                        const pIndex = (t.index || "").toLowerCase();
                                        
                                         return (
                                            <div 
                                                key={i} 
                                                onMouseEnter={() => setHoveredTrait(pIndex || pName)}
                                                onMouseLeave={() => setHoveredTrait(null)}
                                                className="px-2 py-1 bg-dragon-red/5 border border-dragon-red/10 rounded-sm text-[9px] font-black text-dragon-red uppercase tracking-tighter flex items-center gap-1.5 hover:bg-dragon-red/10 transition-colors shadow-sm relative group/trait"
                                            >
                                                <GameIcon name={t.index ? getTraitIcon(t.index) : getProficiencyIcon(t)} size={10} color="currentColor" fallbackName="award" /> {t.name || t}

                                                <AnimatePresence>
                                                    {hoveredTrait === (pIndex || pName) && hydratedTraits[pIndex || pName] && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute bottom-full left-0 mb-2 w-64 bg-dragon-darkRed text-white p-3 rounded-sm shadow-2xl border border-dragon-gold/20 z-[100] pointer-events-none"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between items-center border-b border-dragon-gold/20 pb-1 mb-1">
                                                                    <span className="text-[10px] font-black tracking-widest text-dragon-gold">{t.name || t}</span>
                                                                    <span className="text-[8px] opacity-40 uppercase">Trait Info</span>
                                                                </div>
                                                                <p className="text-[10px] font-bold leading-relaxed text-parchment-100 italic normal-case tracking-normal">
                                                                    {(() => {
                                                                        const d = hydratedTraits[pIndex || pName].desc;
                                                                        if (Array.isArray(d)) return d[0];
                                                                        if (typeof d === 'string') return d;
                                                                        return "Archives are silent on this particular essence.";
                                                                    })()}
                                                                </p>
                                                            </div>
                                                            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-dragon-darkRed border-b border-r border-dragon-gold/20 rotate-45" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                 </div>
                              </div>
                           )}
                        </div>
                    </div>
                 </div>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-20">
                    <GameIcon name="info" size={32} color="currentColor" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">Examine Records</p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};
