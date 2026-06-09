import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore, SKILL_LIST } from '../../store/useStore';
import { Inventory } from './Inventory';
import { EquipmentDoll } from './EquipmentDoll';
import { EquipmentCard } from '../atlas/EquipmentCard';
import { EQUIPMENT_SLOTS, AUX_SLOTS, EquipmentSlotId } from '../../lib/equipmentConstants';
import { GameIcon, GameIconName } from '../../game_icons';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { cn } from '../../lib/utils';
import { isBookLike } from '../../lib/bookUtils';
import { getAlignmentColor, getAlignmentBackgroundStyle } from '../../lib/colors';

import { normalizeImageUrl } from '../../services/storageService';
import { calculateDerivedStats, getXpProgress, getEffectiveStats, XP_TABLE } from '../../lib/statCalculations';
import { soundService } from '../../services/soundService';
import { atlasService } from '../../services/atlasService';
import { extractOptionsFromFeature, getChoiceLimit, getFeatureIcon, getTraitIcon, getFeatIcon , getAlignmentIcon, getBackgroundIcon, getProficiencyIcon , getMagicSchoolIcon , getLanguageIcon , getAttackIcon } from '../../lib/atlasUtils';

const SpellListRow: React.FC<{ 
  spell: any; 
  onCast: (spell: any) => void;
  isCastable: boolean;
  onInvokeRoll?: (notation: string, label: string) => void;
}> = ({ spell, onCast, isCastable, onInvokeRoll }) => {
  return (
    <div className="flex items-center gap-4 py-2 px-3 border-b border-dragon-red/5 hover:bg-dragon-red/5 group transition-colors">
       <div className="w-10 h-10 bg-dragon-red/10 rounded flex items-center justify-center shrink-0 border border-dragon-red/10 overflow-hidden">
          {spell.imageUrl ? (
            <img src={spell.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <GameIcon name="sparkles" size={16} color="#8B0000" />
          )}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
             <span className="text-[11px] font-black text-dragon-darkRed uppercase tracking-widest truncate">{spell.name}</span>
             <span className="text-[8px] font-black text-dragon-red/60 uppercase tracking-tighter">LVL {spell.level === 0 ? 'CANTRIP' : spell.level}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
             <span className="text-[8px] font-bold text-parchment-400 uppercase tracking-widest"><GameIcon name={getMagicSchoolIcon(spell.school?.index || "evocation")} size={10} color="currentColor" fallbackName="award" /> {spell.school?.name || "Ancient Arts"}</span>
             <div className="w-0.5 h-0.5 rounded-full bg-parchment-300" />
             <span className="text-[8px] font-bold text-parchment-400 uppercase tracking-widest">{spell.range}</span>
          </div>
       </div>
       <button 
         onClick={() => {
           onCast(spell);
           if (onInvokeRoll) {
             const dmg = spell.damage?.damage_at_character_level || spell.damage?.damage_at_slot_level;
             const notation = dmg ? (dmg[spell.level] || dmg[Object.keys(dmg)[0]]) : null;
             if (notation) onInvokeRoll(notation, `${spell.name} Effect`);
           }
         }}
         disabled={!isCastable}
         className={cn(
           "px-3 py-1.5 rounded-sm border text-[8px] font-black uppercase tracking-widest transition-all",
           isCastable 
             ? "bg-dragon-red/10 border-dragon-red/20 text-dragon-red hover:bg-dragon-red hover:text-white" 
             : "bg-parchment-100 border-parchment-200 text-parchment-300 cursor-not-allowed"
         )}
       >
         Invoke
       </button>
    </div>
  );
};

export const CharacterProfile: React.FC = () => {
  const { 
    isProfileMenuOpen, 
    setIsProfileMenuOpen, 
    characters, 
    activeCharacterId,
    setActiveCharacter,
    setFocusedItem,
    equipItem,
    unequipItem,
    transferItem,
    reorderCharacters,
    partyStats,
    inspectingItem,
    setInspectingItem,
    deleteCharacter
  } = useStore();

  const [activeTab, setActiveTab] = React.useState<'stats' | 'equipment' | 'bio' | 'spells'>('stats');
  const [optionDetails, setOptionDetails] = React.useState<Record<string, string>>({});

  const { setIsCharacterSpellbookOpen, castSpell, restoreSlots } = useStore();

  const character = characters.find(c => c.id === activeCharacterId) || characters[0];
  const effectiveStats = getEffectiveStats(character);

  React.useEffect(() => {
    if (character?.features) {
      character.features.forEach(feat => {
        const options = extractOptionsFromFeature(feat);
        options.forEach(opt => {
          // Initialize with provided description if available - this is often the specific one from JSON "desc"
          if (opt.desc && opt.desc.length > 0) {
            setOptionDetails(prev => ({ ...prev, [opt.index]: opt.desc! }));
          }

          // Then try to fetch a more detailed one from the library ONLY if we don't have a good one
          // or if the library provides more context.
          atlasService.loadFeature(opt.index).then(fullFeat => {
            if (fullFeat && fullFeat.desc) {
              const description = Array.isArray(fullFeat.desc) ? fullFeat.desc.join('\n') : fullFeat.desc;
              // If the original opt.desc was short, the fullFeat might be better.
              // But the user specifically said "use the one in json desc".
              setOptionDetails(prev => {
                 // Only override if we don't have one or if the new one is much longer/comprehensive
                 const current = prev[opt.index];
                 if (!current || (description.length > current.length && !current.includes(description.substring(0, 10)))) {
                    return { ...prev, [opt.index]: description };
                 }
                 return prev;
              });
            } else {
              atlasService.loadSubclass(opt.index).then(subFeat => {
                if (subFeat && subFeat.desc) {
                  const description = Array.isArray(subFeat.desc) ? subFeat.desc.join('\n') : subFeat.desc;
                  setOptionDetails(prev => {
                     if (!prev[opt.index]) return { ...prev, [opt.index]: description };
                     return prev;
                  });
                }
              });
            }
          });
        });
      });
    }
  }, [character?.id, character?.features?.length]);

  if (!isProfileMenuOpen || !character) return null;

  const xpPercentage = getXpProgress(character.level || 1, character.xp || 0);
  const alignmentColor = getAlignmentColor(character.alignment || "Neutral");
  const proficiencyBonus = Math.floor(2 + ((character.level || 1) - 1) / 4);

  const calculateWeight = () => {
    const parseWeight = (weight: any): number => {
      if (!weight) return 0;
      if (typeof weight === 'number') return weight;
      const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
      return weightMatch ? parseFloat(weightMatch[0]) : 0;
    };

    const calculateItemWeight = (item: any): number => {
      if (!item) return 0;
      return parseWeight(item.weight) * (item.quantity || 1);
    };

    const equippedWeight = Object.values(character.inventory || {}).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
    const backpackWeight = (character.backpack || []).reduce((acc: number, item: any) => acc + calculateItemWeight(item), 0);
    
    const money = character.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    const totalCoins = (money.cp || 0) + (money.sp || 0) + (money.ep || 0) + (money.gp || 0) + (money.pp || 0);
    const moneyWeight = totalCoins * (partyStats?.currencyWeightPerCoin || 0.02);

    return equippedWeight + backpackWeight + moneyWeight;
  };

  const totalCharacterWeight = calculateWeight();
  const { rollDice3D } = useStore();
  const derived = calculateDerivedStats(character);

  const getSpellSlots = (lvl: number, cls: string) => {
    // Simplified SRD mapping for level 1
    const slots: Record<string, number[]> = {
      'cleric': [2],
      'druid': [2],
      'paladin': [0], // Paladins get spells at level 2
      'ranger': [0],
      'sorcerer': [2],
      'warlock': [1], // Pact magic is different but for simplicity...
      'wizard': [2],
      'bard': [2]
    };
    return slots[cls.toLowerCase()] || [];
  };

  if (!character) return null;

  const spellSlots = getSpellSlots(character.level || 1, character.class || "");
  const cantrips = character.knownSpells?.filter(s => s.level === 0) || [];
  const leveledSpells = character.knownSpells?.filter(s => s.level > 0) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 top-16 bg-black/40 backdrop-blur-md z-[60] overflow-hidden flex flex-col items-center justify-center p-4 md:p-6"
    >
      <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
      
      {/* 1. Character Selection Tabs / Party Hub */}
      <div className="w-full max-w-[98vw] z-20 shrink-0">
        <div className={cn(
          "grid gap-0.5",
          characters.length === 1 ? "grid-cols-1" :
          characters.length === 2 ? "grid-cols-2" :
          characters.length === 3 ? "grid-cols-3" :
          "grid-cols-6"
        )}>
          {characters.length === 1 ? (
            <div className="h-16 flex items-center justify-center gap-8 relative overflow-hidden bg-white/5 border-b border-dragon-red/20 shadow-inner">
              {/* Decorative BG for single focus */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dragon-red/20 to-transparent" />
              
              <div className="w-16 h-16 shrink-0 flex items-center justify-center relative translate-y-1">
                <div className="absolute inset-0 bg-dragon-red/5 rounded-full blur-xl animate-pulse" />
                {character.avatarUrl || character.imageUrl ? (
                  <ChromaKeyImage 
                    src={normalizeImageUrl(character.avatarUrl || character.imageUrl, 'npc_character_profiles', character.id)} 
                    alt={character.name}
                    className="w-full h-full object-contain relative z-10"
                  />
                ) : (
                  <GameIcon name="avatar" size={12} color="#8B0000" className="opacity-40" />
                )}
              </div>
              <div className="flex flex-col items-start relative z-10">
                <div className="flex items-center gap-3">
                  <h1 className="font-header text-4xl font-black text-dragon-darkRed uppercase tracking-tighter leading-none">
                    {character.name || "Unknown"}
                  </h1>
                  <div className="h-6 w-px bg-dragon-red/20 mx-1" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-dragon-red/60 uppercase tracking-widest leading-none">EXP_TIER</span>
                    <span className="text-2xl font-header font-black text-dragon-red leading-none mt-1">LVL {character.level || 1}</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-dragon-red/20 to-transparent" />
            </div>
          ) : (
            <>
              {/* Fixed Slot 1 */}
              {characters[0] && (
                <CharacterTab 
                  character={characters[0]} 
                  index={0} 
                  isSelected={activeCharacterId === characters[0].id} 
                  onClick={() => setActiveCharacter(characters[0].id)}
                  isFixed
                />
              )}

              {/* Sortable Slots 2-6 */}
              <SortableContext 
                items={characters.slice(1, 6).map(c => `tab-${c.id}`)}
                strategy={horizontalListSortingStrategy}
              >
                {characters.slice(1, 6).map((c, idx) => (
                  <SortableCharacterTab 
                    key={c.id} 
                    character={c} 
                    index={idx + 1}
                    isSelected={activeCharacterId === c.id}
                    onClick={() => setActiveCharacter(c.id)}
                  />
                ))}
              </SortableContext>
            </>
          )}
        </div>
      </div>

        {/* Main Container */}
      <div 
        className="w-full max-w-5xl h-[90vh] rounded border-2 border-dragon-red/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden font-sans"
        style={{
          ...getAlignmentBackgroundStyle(character.alignment),
          backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Paper Textures matching Cards */}
        <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none z-[1]" />
        <div className="absolute inset-0 bg-parchment-100/30 pointer-events-none z-[2]" />
        
        {/* Item Action Overlay */}
        {inspectingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
             <div className="pointer-events-auto">
                <EquipmentCard 
                  equipment={inspectingItem.item} 
                  isModal={true} 
                  onClose={() => setInspectingItem(null)} 
                />
             </div>
          </div>
        )}
        
        {/* Tab Selector (Fixed at the top) */}
        <div className="shrink-0 flex items-center bg-parchment-50/40 backdrop-blur-md border-b border-dragon-red/10 px-6 z-40">
           {['stats', 'equipment', 'bio', 'spells'].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={cn(
                 "px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative",
                 activeTab === tab 
                   ? "text-dragon-red" 
                   : "text-parchment-600 hover:text-dragon-red"
               )}
             >
               {tab}
               {activeTab === tab && (
                 <motion.div 
                   layoutId="activeTabUnderline"
                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-dragon-red shadow-[0_0_10px_rgba(139,0,0,0.5)]" 
                 />
               )}
             </button>
           ))}
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 z-10 flex flex-col items-center">
           <div className="w-full relative z-10 p-8 md:p-12 lg:p-16 flex-1 flex flex-col">
                 {/* Integrated Header - Scrolls with content */}
                 <div className="mb-16 w-full max-w-6xl">
                    {/* Identity Hero Section */}
                    <div className="flex flex-col items-center mb-16 space-y-8">
                       <div className="flex flex-col items-center">
                          <div className="text-[12px] font-black text-dragon-red/40 uppercase tracking-[0.4em] mb-1 flex items-center gap-4">
                            RECORDED LEVEL
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you absolutely sure you want to delete ${character.name}? This cannot be undone.`)) {
                                    deleteCharacter(character.id);
                                  }
                                }}
                                className="opacity-40 hover:opacity-100 transition-all"
                                title="Delete Character"
                             >
                                <GameIcon name="trash" size={12} color="#8B0000" />
                             </button>
                          </div>
                          <div className="text-6xl font-header font-black text-dragon-red leading-none drop-shadow-sm">{character.level || 1}</div>
                       </div>

                       <div className="text-center space-y-4">
                          <h1 className="font-header text-[80px] md:text-[120px] lg:text-[160px] font-black text-dragon-darkRed uppercase tracking-tighter leading-none drop-shadow-[0_4px_1px_rgba(0,0,0,0.1)]">
                            {character.name || "Unknown"}
                          </h1>
                          
                          <div className="flex items-center justify-center gap-6 text-[18px] md:text-[22px] font-black text-dragon-red uppercase tracking-[0.4em] mt-2">
                             <span className="flex items-center gap-2"><GameIcon name={character.class?.toLowerCase()} size={20} color="currentColor" fallbackName="award" /> {character.class}</span>
                             {character.subclass && (
                               <>
                                 <span className="text-parchment-300">•</span>
                                 <span className="text-dragon-gold">{character.subclass}</span>
                               </>
                             )}
                             <span className="text-parchment-300">•</span>
                             <span className="flex items-center gap-2"><GameIcon name={getBackgroundIcon(character.background || "adventurer")} size={20} color="currentColor" fallbackName="award" /> {character.background || "Adventurer"}</span>
                          </div>
                       </div>

                       {/* Top Vitals Bar - Hero Position */}
                       <div className="flex items-center gap-10 bg-black/5 px-12 py-6 rounded-full border border-black/5 shadow-inner">
                          <div className="flex items-center gap-4 group">
                             <GameIcon name="heart" size={28} color="#8B0000" className="animate-pulse" />
                             <div className="flex flex-col leading-none">
                                <span className="font-header text-4xl font-black text-dragon-darkRed">{character.hp}/{character.maxHp}</span>
                                <span className="text-[10px] font-sans text-parchment-400 uppercase tracking-widest font-black uppercase">HP MATRIX</span>
                             </div>
                          </div>
                          
                          <div className="w-px h-12 bg-dragon-red/10" />
                          
                          <div className="flex items-center gap-4 group">
                             <GameIcon name="shield" size={28} color="#D4AF37" />
                             <div className="flex flex-col leading-none">
                                <span className="font-header text-4xl font-black text-dragon-darkRed">{derived.ac}</span>
                                <span className="text-[10px] font-sans text-parchment-400 uppercase tracking-widest font-black uppercase">ARMOR</span>
                             </div>
                          </div>
                          
                          <div className="w-px h-12 bg-dragon-red/10" />
                          
                          <div className="flex items-center gap-4 group">
                             <GameIcon name="lightning" size={28} color="#D4AF37" />
                             <div className="flex flex-col leading-none">
                                <span className="font-header text-4xl font-black text-dragon-darkRed">{derived.initiative >= 0 ? '+' : ''}{derived.initiative}</span>
                                <span className="text-[10px] font-sans text-parchment-400 uppercase tracking-widest font-black uppercase">INIT</span>
                             </div>
                          </div>
                          
                          <div className="w-px h-12 bg-dragon-red/10" />
                          
                          <div className="flex items-center gap-4 group">
                             <GameIcon name="wind" size={28} color="#D4AF37" />
                             <div className="flex flex-col leading-none">
                                <span className="font-header text-4xl font-black text-dragon-darkRed">{derived.speed}</span>
                                <span className="text-[10px] font-sans text-parchment-400 uppercase tracking-widest font-black uppercase">SPEED FT</span>
                             </div>
                          </div>
                          
                          <div className="w-px h-12 bg-dragon-red/10" />
                          
                          {/* Action Economy Vital */}
                          <div className="flex items-center gap-6 px-4">
                             <div className="flex flex-col items-center">
                                <div className="flex gap-1.5 mb-1.5">
                                   {Array.from({ length: character.actionEconomy?.actions.max || 1 }).map((_, i) => (
                                      <motion.div 
                                        key={i} 
                                        initial={false}
                                        animate={{ 
                                          scale: i < (character.actionEconomy?.actions.current || 0) ? 1 : 0.9,
                                          opacity: i < (character.actionEconomy?.actions.current || 0) ? 1 : 0.3
                                        }}
                                        className={cn(
                                          "w-3.5 h-3.5 rounded-sm rotate-45 border transition-all duration-300", 
                                          i < (character.actionEconomy?.actions.current || 0) 
                                            ? "bg-dragon-red border-dragon-red shadow-[0_0_12px_rgba(139,0,0,0.5)]" 
                                            : "bg-transparent border-dragon-red/40"
                                        )} 
                                      />
                                   ))}
                                </div>
                                <span className="text-[7px] font-black text-dragon-red/60 uppercase tracking-[0.2em]">Action</span>
                             </div>
                             
                             <div className="flex flex-col items-center">
                                <div className="flex gap-1.5 mb-1.5">
                                   {Array.from({ length: character.actionEconomy?.bonusActions.max || 1 }).map((_, i) => (
                                      <motion.div 
                                        key={i} 
                                        initial={false}
                                        animate={{ 
                                          scale: i < (character.actionEconomy?.bonusActions.current || 0) ? 1 : 0.9,
                                          opacity: i < (character.actionEconomy?.bonusActions.current || 0) ? 1 : 0.3
                                        }}
                                        className={cn(
                                          "w-3 h-3 rounded-full border transition-all duration-300", 
                                          i < (character.actionEconomy?.bonusActions.current || 0) 
                                            ? "bg-dragon-gold border-dragon-gold shadow-[0_0_12px_rgba(212,175,55,0.5)]" 
                                            : "bg-transparent border-dragon-gold/40"
                                        )} 
                                      />
                                   ))}
                                </div>
                                <span className="text-[7px] font-black text-dragon-gold/80 uppercase tracking-[0.2em]">Bonus</span>
                             </div>

                             <div className="flex flex-col items-center">
                                <div className="flex gap-1.5 mb-1.5">
                                   {Array.from({ length: character.actionEconomy?.reactions.max || 1 }).map((_, i) => (
                                      <motion.div 
                                        key={i} 
                                        initial={false}
                                        animate={{ 
                                          scale: i < (character.actionEconomy?.reactions.current || 0) ? 1 : 0.9,
                                          opacity: i < (character.actionEconomy?.reactions.current || 0) ? 1 : 0.3
                                        }}
                                        className={cn(
                                          "w-3 h-3 rounded-sm border transition-all duration-300", 
                                          i < (character.actionEconomy?.reactions.current || 0) 
                                            ? "bg-dragon-darkRed border-dragon-darkRed shadow-[0_0_12px_rgba(100,0,0,0.5)]" 
                                            : "bg-transparent border-dragon-darkRed/40"
                                        )} 
                                      />
                                   ))}
                                </div>
                                <span className="text-[7px] font-black text-dragon-darkRed/60 uppercase tracking-[0.2em]">Reaction</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col items-center mb-16">
                       {/* Illustration Centered Below Identity */}
                       {character.imageUrl && (
                          <div className="relative w-full max-w-[500px] aspect-[16/9] drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] mb-12 flex items-center justify-center group">
                             <ChromaKeyImage 
                                src={normalizeImageUrl(character.imageUrl, 'character', character.id)} 
                                alt={character.name} 
                                className="w-full h-full object-contain relative z-20 transition-transform duration-1000 group-hover:scale-105"
                             />
                             <div className="absolute inset-0 bg-dragon-red/5 blur-[100px] rounded-full pointer-events-none z-10" />
                          </div>
                       )}

                       {/* XP Progress Bar - Centered under Hero Illustration */}
                       <div className="w-full max-w-[500px] space-y-3 mt-4">
                          <div className="h-2 w-full bg-dragon-darkRed/10 rounded-full overflow-hidden relative shadow-inner border border-dragon-gold/10">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${xpPercentage}%` }}
                               transition={{ duration: 2, ease: "circOut" }}
                               className="h-full bg-gradient-to-r from-dragon-red to-dragon-darkRed shadow-[0_0_20px_rgba(139,0,0,0.4)] relative"
                             >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
                             </motion.div>
                          </div>
                          <div className="flex justify-between items-center px-1">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-parchment-400 tracking-[0.2em] uppercase">Experience Continuum</span>
                                <span className="text-[10px] font-black text-dragon-red tracking-widest">{character.xp.toLocaleString()} / {XP_TABLE[character.level]?.toLocaleString() || '---'} XP</span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-parchment-400 tracking-[0.2em] uppercase text-right">Synchronization</span>
                                <span className="text-[10px] font-black text-dragon-red tracking-widest">{Math.floor(xpPercentage)}%</span>
                             </div>
                          </div>
                       </div>

                       {/* Species, Size, Alignment block */}
                       <div className="mt-12 flex items-center justify-center gap-16 border-y border-dragon-red/10 py-10 w-full mb-12">
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.2em] mb-1">SPECIES</span>
                             <span className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-tight"><GameIcon name={character.race?.toLowerCase().replace(/-/g, "_")} size={20} color="currentColor" fallbackName="award" /> {character.race}</span>
                          </div>
                          <div className="w-px h-12 bg-dragon-red/10" />
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.2em] mb-1">SIZE</span>
                             <span className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Medium</span>
                          </div>
                          <div className="w-px h-12 bg-dragon-red/10" />
                          <div className="flex flex-col items-center">
                             <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.2em] mb-1">ALIGNMENT</span>
                             <span className="text-2xl font-header font-black text-dragon-red uppercase tracking-tight"><GameIcon name={getAlignmentIcon(character.alignment || "neutral")} size={20} color="currentColor" fallbackName="award" /> {character.alignment || "Neutral"}</span>
                          </div>
                       </div>
                    </div>
                 </div>
 
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                       
                       {/* Left Column: Large Character Illustration */}
                       <div className="lg:col-span-4 flex flex-col items-center lg:items-start group">
                          {character.imageUrl && (
                            <div className="relative w-full max-w-[400px] aspect-[3/4] -mt-12 lg:-ml-12 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                               <ChromaKeyImage 
                                 src={normalizeImageUrl(character.imageUrl, 'character', character.id)} 
                                 alt={character.name} 
                                 className="w-full h-full object-contain relative z-20 group-hover:scale-105 transition-transform duration-1000"
                               />
                               {/* Background Glow */}
                               <div className="absolute inset-10 bg-dragon-red/10 blur-[100px] rounded-full pointer-events-none z-10" />
                            </div>
                          )}
                          
                          {/* Core Vitals Block */}
                          <div className="mt-8 space-y-3 w-full max-w-[320px]">
                             {/* HP Quick Indicator */}
                             <div className="flex items-center gap-4 bg-black/5 px-6 py-2 rounded-full border border-black/5 hover:bg-black/10 transition-colors">
                                <GameIcon name="heart" size={16} color="#8B0000" className="animate-pulse" />
                                <span className="font-header text-2xl font-black text-dragon-darkRed">
                                  {character.hp}/{character.maxHp}
                                  <span className="text-[10px] font-sans text-parchment-400 ml-2 uppercase tracking-widest font-black">Hit Points</span>
                                </span>
                             </div>

                             {/* AC and Speed Row */}
                             <div className="flex gap-3">
                                <div className="flex-1 flex items-center gap-3 bg-black/5 px-4 py-2 rounded-full border border-black/5 hover:bg-black/10 transition-colors">
                                   <GameIcon name="shield" size={14} color="#D4AF37" />
                                   <span className="font-header text-xl font-black text-dragon-darkRed">
                                      {derived.ac}
                                      <span className="text-[9px] font-sans text-parchment-400 ml-1.5 uppercase tracking-widest font-black">AC</span>
                                   </span>
                                </div>
                                <div className="flex-1 flex items-center gap-3 bg-black/5 px-4 py-2 rounded-full border border-black/5 hover:bg-black/10 transition-colors">
                                   <GameIcon name="wind" size={14} color="#D4AF37" />
                                   <span className="font-header text-xl font-black text-dragon-darkRed">
                                      {derived.speed}
                                      <span className="text-[9px] font-sans text-parchment-400 ml-1.5 uppercase tracking-widest font-black">SPEED</span>
                                   </span>
                                </div>
                             </div>
                             
                             {/* Initiative */}
                             <div className="flex items-center gap-3 bg-black/5 px-4 py-2 rounded-full border border-black/5 hover:bg-black/10 transition-colors">
                                <GameIcon name="lightning" size={14} color="#D4AF37" />
                                <span className="font-header text-lg font-black text-dragon-darkRed">
                                   {derived.initiative >= 0 ? '+' : ''}{derived.initiative}
                                   <span className="text-[9px] font-sans text-parchment-400 ml-1.5 uppercase tracking-widest font-black">Initiative Modifier</span>
                                </span>
                             </div>
                          </div>
                        </div>
                        {/* Center Column: Big Name & Identity */}
                       <div className="lg:col-span-5 flex flex-col items-center lg:items-center justify-center space-y-6 py-12 pl-[30px] pr-0">
                          <div className="flex flex-col items-center mb-4">
                             <div className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.4em] mb-1 flex items-center gap-4">
                             RECORDED LEVEL
                             <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you absolutely sure you want to delete ${character.name}? This cannot be undone.`)) {
                                    deleteCharacter(character.id);
                                  }
                                }}
                                className="opacity-40 hover:opacity-100 transition-all font-sans"
                                title="Delete Character"
                             >
                                <GameIcon name="trash" size={10} color="#8B0000" />
                             </button>
                          </div>
                             <div className="text-6xl font-header font-black text-dragon-red leading-none drop-shadow-sm">{character.level || 1}</div>
                          </div>

                          <div className="text-center space-y-2 h-[70px]">
                             <h1 className="font-header text-[120px] md:text-[160px] font-black text-dragon-darkRed uppercase tracking-tighter leading-none -mb-4 drop-shadow-[0_4px_1px_rgba(0,0,0,0.1)]">
                                {character.name || "Unknown"}
                             </h1>
                             
                             <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-4 text-[18px] md:text-[22px] font-black text-dragon-red uppercase tracking-[0.4em] mt-2 pl-[30px] pr-0">
                                   <span className="flex items-center gap-2"><GameIcon name={character.class?.toLowerCase()} size={20} color="currentColor" fallbackName="award" /> {character.class}</span>
                                   {character.subclass && (
                                     <>
                                       <span className="text-parchment-300">•</span>
                                       <span className="text-dragon-gold">{character.subclass}</span>
                                     </>
                                   )}
                                   <span className="text-parchment-300">•</span>
                                   <span className="flex items-center gap-2"><GameIcon name={getBackgroundIcon(character.background || "adventurer")} size={20} color="currentColor" fallbackName="award" /> {character.background || "Adventurer"}</span>
                                </div>
                                
                                {/* Species, Size, Alignment block */}
                                <div className="mt-8 flex items-center justify-center gap-12 border-t border-dragon-red/10 pt-8 w-full max-w-[500px]">
                                   <div className="flex flex-col items-center">
                                      <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.2em] mb-1">SPECIES</span>
                                      <span className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-tight"><GameIcon name={character.race?.toLowerCase().replace(/-/g, "_")} size={20} color="currentColor" fallbackName="award" /> {character.race}</span>
                                   </div>
                                   <div className="w-px h-10 bg-dragon-red/10" />
                                   <div className="flex flex-col items-center">
                                      <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.2em] mb-1">SIZE</span>
                                      <span className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Medium</span>
                                   </div>
                                   <div className="w-px h-10 bg-dragon-red/10" />
                                   <div className="flex flex-col items-center">
                                      <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.2em] mb-1">ALIGNMENT</span>
                                      <span className="text-2xl font-header font-black text-dragon-red uppercase tracking-tight"><GameIcon name={getAlignmentIcon(character.alignment || "neutral")} size={20} color="currentColor" fallbackName="award" /> {character.alignment || "Neutral"}</span>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* Full-width separator */}
                          <div className="col-span-12 h-px bg-dragon-gold/30 border-b border-dragon-red/10 mt-12 mb-4" />
                        </div>

                       {/* Right Column was here, but level moved to header center */}
                       <div className="lg:col-span-3"></div>
                    </div>
                 <AnimatePresence mode="wait">
                    {activeTab === 'stats' && (
                      <motion.div
                        key="stats"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-12 pb-12"
                      >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Core Stats (Vertical List) */}
                    <div className="lg:col-span-1 space-y-4">
                       <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                          <GameIcon name="dice" size={14} color="#8B0000" />
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Ability Scores</h3>
                       </div>
                       <div className="flex flex-col gap-2">
                          <VerticalStat label="STRENGTH" value={effectiveStats.str} abbr="STR" icon="weapon" 
                            onClick={() => {
                              const mod = Math.floor((effectiveStats.str - 10) / 2);
                              rollDice3D(`1d20${mod >= 0 ? '+' : ''}${mod !== 0 ? mod : ''}`, "Strength Check");
                            }}
                          />
                          <VerticalStat label="DEXTERITY" value={effectiveStats.dex} abbr="DEX" icon="wind" 
                            onClick={() => {
                              const mod = Math.floor((effectiveStats.dex - 10) / 2);
                              rollDice3D(`1d20${mod >= 0 ? '+' : ''}${mod !== 0 ? mod : ''}`, "Dexterity Check");
                            }}
                          />
                          <VerticalStat label="CONSTITUTION" value={effectiveStats.con} abbr="CON" icon="heart" 
                            onClick={() => {
                              const mod = Math.floor((effectiveStats.con - 10) / 2);
                              rollDice3D(`1d20${mod >= 0 ? '+' : ''}${mod !== 0 ? mod : ''}`, "Constitution Check");
                            }}
                          />
                          <VerticalStat label="INTELLIGENCE" value={effectiveStats.int} abbr="INT" icon="sparkles" 
                            onClick={() => {
                              const mod = Math.floor((effectiveStats.int - 10) / 2);
                              rollDice3D(`1d20${mod >= 0 ? '+' : ''}${mod !== 0 ? mod : ''}`, "Intelligence Check");
                            }}
                          />
                          <VerticalStat label="WISDOM" value={effectiveStats.wis} abbr="WIS" icon="scroll" 
                            onClick={() => {
                              const mod = Math.floor((effectiveStats.wis - 10) / 2);
                              rollDice3D(`1d20${mod >= 0 ? '+' : ''}${mod !== 0 ? mod : ''}`, "Wisdom Check");
                            }}
                          />
                          <VerticalStat label="CHARISMA" value={effectiveStats.cha} abbr="CHA" icon="user" 
                            onClick={() => {
                              const mod = Math.floor((effectiveStats.cha - 10) / 2);
                              rollDice3D(`1d20${mod >= 0 ? '+' : ''}${mod !== 0 ? mod : ''}`, "Charisma Check");
                            }}
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-2 mt-6">
                          <MiniCombatCard label="Spell DC" value={`${derived.spellSaveDC}`} />
                          <MiniCombatCard label="Spell Atk" value={`${derived.spellAttackBonus >= 0 ? '+' : ''}${derived.spellAttackBonus}`} />
                          <MiniCombatCard label="Passive Perc" value={`${derived.passivePerception}`} />
                          <MiniCombatCard label="Prof Bonus" value={`+${derived.proficiencyBonus}`} />
                       </div>
                    </div>

                    {/* Skill and Saving Throw Registry */}
                    <div className="lg:col-span-2 space-y-8">
                       {/* Saving Throws */}
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                             <GameIcon name="shield" size={14} color="#8B0000" />
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Saving Throws</h3>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                             {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(abbr => {
                                const key = abbr.toLowerCase() as keyof typeof effectiveStats;
                                const statVal = (effectiveStats?.[key] as number) ?? 10;
                                const abilityMod = Math.floor((statVal - 10) / 2);
                                const isProficient = (character.proficiencies || []).some(p => 
                                   p.toLowerCase().includes(`saving throw: ${abbr.toLowerCase()}`) ||
                                   p.toLowerCase() === `saving throw: ${abbr.toLowerCase()}`
                                );
                                const totalMod = abilityMod + (isProficient ? derived.proficiencyBonus : 0);
                                
                                return (
                                   <button 
                                      key={abbr}
                                      onClick={() => rollDice3D(`1d20${totalMod >= 0 ? '+' : ''}${totalMod !== 0 ? totalMod : ''}`, `${abbr} Saving Throw`)}
                                      className={cn(
                                         "flex flex-col items-center justify-center p-2 rounded-sm border transition-all hover:bg-dragon-red/10 group/save active:scale-95",
                                         isProficient ? "bg-dragon-red/5 border-dragon-red/20" : "bg-white/20 border-parchment-200/40 opacity-70"
                                      )}
                                   >
                                      <div className="flex items-center gap-1.5 mb-1">
                                         <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            isProficient ? "bg-dragon-red shadow-[0_0_5px_rgba(139,0,0,0.3)]" : "bg-parchment-300"
                                         )} />
                                         <span className="text-[8px] font-black text-parchment-500">{abbr}</span>
                                      </div>
                                      <span className={cn(
                                         "text-lg font-header font-black leading-none tabular-nums",
                                         isProficient ? "text-dragon-darkRed" : "text-parchment-800"
                                      )}>
                                         {totalMod >= 0 ? `+${totalMod}` : totalMod}
                                      </span>
                                   </button>
                                );
                             })}
                          </div>
                       </div>

                       {/* Skill Registry */}
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                             <GameIcon name="pen_line" size={14} color="#8B0000" />
                             <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Skills</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                          {SKILL_LIST.map(skill => {
                            const statVal = effectiveStats?.[skill.ability as keyof typeof effectiveStats] ?? 10;
                            const abilityMod = Math.floor((statVal - 10) / 2);
                            const isProficient = (character.proficiencies || []).includes(skill.name);
                            const totalMod = abilityMod + (isProficient ? proficiencyBonus : 0);
                            
                            return (
                              <button 
                                key={skill.name}
                                onClick={() => rollDice3D(`1d20${totalMod >= 0 ? '+' : ''}${totalMod !== 0 ? totalMod : ''}`, `${skill.name} Check`)}
                                className={cn(
                                  "flex items-center justify-between py-1.5 px-2 rounded-sm transition-all group border-b border-parchment-200/50 last:border-0 hover:bg-dragon-red/10 active:scale-[0.98] w-full text-left",
                                  isProficient ? "bg-dragon-red/5" : "opacity-60"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    isProficient ? "bg-dragon-red shadow-[0_0_5px_rgba(139,0,0,0.3)]" : "bg-parchment-300"
                                  )} />
                                  <GameIcon 
                                    name={skill.name.toLowerCase().replace(/\s+/g, '_') as any} 
                                    size={16} 
                                    color={isProficient ? "#8B0000" : "#D4AF37"} 
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className={cn(
                                      "text-[9px] font-black uppercase tracking-widest leading-none",
                                      isProficient ? "text-dragon-darkRed" : "text-parchment-500"
                                    )}>
                                      {skill.name}
                                    </span>
                                    <span className="text-[7px] font-bold text-parchment-400 uppercase mt-0.5">{skill.ability}</span>
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-[11px] font-black min-w-[24px] text-right tabular-nums",
                                  isProficient ? "text-dragon-red" : "text-parchment-400"
                                )}>
                                  {totalMod >= 0 ? `+${totalMod}` : totalMod}
                                </span>
                              </button>
                            );
                          })}
                       </div>
                    </div>
                  </div>

                  </div>
               
               {/* Improvements & Modifiers Section */}
                  <div className="mt-12 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                      <GameIcon name="sparkles" size={14} color="#8B0000" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Feats & Features</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {character.features?.map((feat, i) => {
                        const options = extractOptionsFromFeature(feat);
                        const limit = getChoiceLimit(feat);
                        const selections = character.choices?.[feat.index] || [];
                        const hasChoice = options.length > 0;

                        return (
                          <div key={`feat-stat-${i}`} className="bg-white/40 p-4 rounded border border-dragon-red/5 space-y-2 relative overflow-hidden group">
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-dragon-red/10 group-hover:bg-dragon-red/30 transition-colors" />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GameIcon name={getFeatureIcon(feat.index, feat.name)} size={12} color="#8B0000" fallbackName="award" />
                                <span className="text-[11px] font-black text-dragon-darkRed uppercase tracking-widest leading-tight">{feat.name}</span>
                              </div>
                              {hasChoice && (
                                <span className={cn(
                                  "text-[8px] font-black px-1.5 py-0.5 rounded border",
                                  selections.length >= limit ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-dragon-red/5 text-dragon-red border-dragon-red/10"
                                )}>
                                  {selections.length} / {limit}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-parchment-600 leading-relaxed font-medium">
                              {feat.desc}
                            </p>

                            {hasChoice && (
                              <div className="pt-2 grid grid-cols-1 gap-1">
                                {options.map((opt) => {
                                  const isSelected = selections.includes(opt.index);
                                  return (
                                    <button 
                                      key={opt.index}
                                      onClick={() => {
                                        // Use same logic as CharacterStats
                                        const currentChoices = JSON.parse(JSON.stringify(character.choices || {}));
                                        const currentSelections = currentChoices[feat.index] || [];
                                        let newSelections;
                                        if (currentSelections.includes(opt.index)) {
                                          newSelections = currentSelections.filter((id: string) => id !== opt.index);
                                        } else {
                                          if (currentSelections.length >= limit && limit === 1) {
                                            newSelections = [opt.index];
                                          } else if (currentSelections.length >= limit) {
                                            return;
                                          } else {
                                            newSelections = [...currentSelections, opt.index];
                                          }
                                        }
                                        currentChoices[feat.index] = newSelections;
                                        
                                        // Legacy mapping
                                        if (feat.index.toLowerCase().includes('fighting_style')) {
                                          currentChoices['fighting-style'] = newSelections;
                                        }
                                        if (feat.index.toLowerCase().includes('expertise')) {
                                          currentChoices['expertise'] = [...(currentChoices['expertise'] || [])].filter(s => !currentSelections.includes(s));
                                          currentChoices['expertise'] = [...currentChoices['expertise'], ...newSelections];
                                        }
                                        if (feat.index.toLowerCase().includes('martial_archetype') || 
                                            feat.index.toLowerCase().includes('subclass') ||
                                            feat.index.toLowerCase().includes('archetype') ||
                                            feat.index.toLowerCase().includes('arcane_tradition') ||
                                            feat.index.toLowerCase().includes('druid_circle') ||
                                            feat.index.toLowerCase().includes('sacred_oath') ||
                                            feat.index.toLowerCase().includes('ranger_archetype') ||
                                            feat.index.toLowerCase().includes('monastic_tradition') ||
                                            feat.index.toLowerCase().includes('bard_college') ||
                                            feat.index.toLowerCase().includes('otherworldly_patron') ||
                                            feat.index.toLowerCase().includes('sorcerous_origin')) {
                                          currentChoices['subclass'] = newSelections[0];
                                        }

                                        const updateData: any = { choices: currentChoices };
                                        if (currentChoices['subclass']) {
                                           updateData.subclass = currentChoices['subclass'];
                                        }
                                        
                                        useStore.getState().updateCharacter(character.id, updateData);
                                        soundService.playEffect('UI_CLICK_LIGHT');
                                      }}
                                      className={cn(
                                        "flex flex-col gap-1.5 px-3 py-2.5 rounded text-[9px] font-bold uppercase transition-all text-left",
                                        isSelected 
                                          ? "bg-dragon-darkRed text-dragon-gold border border-dragon-gold/30 shadow-lg" 
                                          : "bg-black/5 text-parchment-400 border border-transparent hover:bg-black/10"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <GameIcon name={isSelected ? "check" : getFeatureIcon(opt.index, opt.name)} size={10} color={isSelected ? "#D4AF37" : "#8B0000"} fallbackName="award" />
                                        <span className="truncate">
                                          {opt.name.replace(/fighting style:\s*/i, '')
                                                   .replace(/expertise:\s*/i, '')
                                                   .replace(/martial archetype:\s*/i, '')
                                                   .replace(/archetype:\s*/i, '')
                                                   .replace(/arcane tradition:\s*/i, '')
                                                   .replace(/druid circle:\s*/i, '')
                                                   .replace(/sacred oath:\s*/i, '')
                                                   .replace(/ranger archetype:\s*/i, '')
                                                   .replace(/monastic tradition:\s*/i, '')
                                                   .replace(/bard college:\s*/i, '')
                                                   .replace(/otherworldly patron:\s*/i, '')
                                                   .replace(/sorcerous origin:\s*/i, '')
                                          }
                                        </span>
                                      </div>
                                      {(optionDetails[opt.index] || opt.desc) && (
                                        <div className={cn(
                                          "text-[8px] font-medium leading-relaxed normal-case",
                                          isSelected ? "text-dragon-gold/70" : "text-parchment-500 opacity-60"
                                        )}>
                                          {optionDetails[opt.index] || opt.desc}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {(!character.features || character.features.length === 0) && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-20">
                          <GameIcon name="sparkles" size={48} color="#8B0000" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">No Special Features Discovered</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'equipment' && (
                <motion.div
                  key="equipment"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="flex items-start gap-8">
                     {/* Left: Portrait & Doll */}
                     <div className="space-y-6 shrink-0">
                        <div className="flex items-start gap-4">
                           {/* Portrait */}
                           <div className="w-[180px] space-y-2">
                              <div className="flex items-center gap-2">
                                 <GameIcon name="fingerprint" size={12} color="#8B0000" />
                                 <span className="text-[8px] font-black text-dragon-darkRed uppercase tracking-widest">Profile_Node</span>
                              </div>
                              <div className="aspect-[9/16] bg-parchment-200 rounded-sm overflow-hidden relative shadow-inner border border-dragon-red/10">
                                 {character.imageUrl ? (
                                   <ChromaKeyImage 
                                     src={normalizeImageUrl(character.imageUrl, 'npc_character_profiles', character.id)} 
                                     alt={character.name} 
                                     className="w-full h-full object-cover"
                                   />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center bg-parchment-300/30">
                                     <GameIcon name="user" size={48} color="#8B0000" className="opacity-20" />
                                   </div>
                                 )}
                              </div>
                           </div>

                           {/* Doll */}
                           <div className="w-[180px] space-y-2">
                              <div className="flex items-center gap-2">
                                 <GameIcon name="dashboard" size={12} color="#8B0000" />
                                 <span className="text-[8px] font-black text-dragon-darkRed uppercase tracking-widest">Equipped_Matrix</span>
                              </div>
                              <div className="aspect-[9/16]">
                                 <EquipmentDoll 
                                   equippedItems={character.inventory || {}} 
                                   showSupplements={false}
                                   onSlotClick={(slot) => {
                                      const itemAtSlot = character.inventory?.[slot];
                                      if (itemAtSlot) {
                                          setInspectingItem({ item: itemAtSlot, sourceId: character.id, slot });
                                      }
                                   }} 
                                   alignment={character.alignment || "Neutral"}
                                   characterImageUrl={character.imageUrl}
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Inventory Stats */}
                        <div className="p-4 bg-white/40 rounded border border-dragon-red/5 space-y-3">
                           <div className="flex justify-between items-center px-2 py-1.5 rounded bg-dragon-red/5">
                              <span className="text-[7px] font-black uppercase text-dragon-red/60 tracking-widest">Load_Factor</span>
                              <span className="text-[10px] font-black text-dragon-darkRed leading-none">{totalCharacterWeight.toFixed(2)} / {derived.weightCapacity} lbs</span>
                           </div>
                          <div className="grid grid-cols-5 gap-1.5">
                              <CurrencyPin type="PP" value={character.money?.pp || 0} color="#38BDF8" />
                              <CurrencyPin type="GP" value={character.money?.gp || 0} color="#D97706" />
                              <CurrencyPin type="EP" value={character.money?.ep || 0} color="#D946EF" pulse />
                              <CurrencyPin type="SP" value={character.money?.sp || 0} color="#71717A" />
                              <CurrencyPin type="CP" value={character.money?.cp || 0} color="#92400E" />
                           </div>
                        </div>
                     </div>

                      {/* Right: Storage & Supplements */}
                      <div className="flex-1 flex flex-col gap-6">
                        {/* Supplements Section (Tools & Extra Slots moved out of doll) */}
                        <div className="p-0.5 border border-dragon-red/10 rounded relative overflow-hidden bg-parchment-200/20 shadow-inner">
                          <div className="absolute inset-0 bg-white/40 pointer-events-none" />
                          <div className="relative z-10 space-y-3">
                            <div className="flex items-center gap-2">
                               <GameIcon name="tools" size={14} color="#8B0000" />
                               <span className="text-[10px] font-black text-dragon-darkRed uppercase tracking-[0.2em]">Auxillary Systems</span>
                               <div className="h-px flex-1 bg-gradient-to-r from-dragon-red/20 to-transparent" />
                            </div>
                            
                            <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
                              {AUX_SLOTS.map(slot => (
                                <DroppableSlotWrapper 
                                  key={slot}
                                  slot={slot}
                                  item={character.inventory?.[slot]}
                                  onClick={() => {
                                    const itemAtSlot = character.inventory?.[slot];
                                    if (itemAtSlot) {
                                        setInspectingItem({ item: itemAtSlot, sourceId: character.id, slot });
                                    }
                                  }}
                                  alignment={character.alignment}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-[400px] bg-white/40 rounded border-2 border-dashed border-dragon-red/20 p-1">
                           <Inventory 
                             forceCharacterId={character.id} 
                             showCategoryTabs={true} 
                             compactEquipped={true} 
                             gridCols={6}
                           />
                        </div>
                      </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bio' && (
                <motion.div
                  key="bio"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-8">
                        <div>
                          <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                            <GameIcon name="sparkles" size={14} color="#8B0000" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Traits</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {character.traits?.map((trait, i) => (
                                <div key={`trait-${i}`} className="bg-white/40 p-3 rounded border border-dragon-red/5 shadow-sm italic text-[10px]">
                                  <GameIcon name={getTraitIcon(trait)} size={12} color="#8B0000" fallbackName="award" /> "{trait}"
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                            <GameIcon name="scroll" size={14} color="#8B0000" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Languages</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {character.languages?.map((lang, i) => (
                              <div key={`lang-${i}`} className="bg-dragon-red/5 px-3 py-1 rounded border border-dragon-red/10 text-[9px] font-black text-dragon-darkRed uppercase tracking-widest">
                                <GameIcon name={getLanguageIcon(lang)} size={10} color="currentColor" fallbackName="award" /> {lang}
                               </div>
                            ))}
                            {(!character.languages || character.languages.length === 0) && (
                              <span className="text-[10px] italic text-parchment-400">None recorded</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                            <GameIcon name="weapon" size={14} color="#8B0000" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Features</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">{character.proficiencies?.map((prof, i) => (
                              <div key={`prof-${i}`} className="bg-white/40 px-3 py-1 rounded border border-dragon-red/5 shadow-sm italic text-[9px] flex items-center gap-1.5">
                                <GameIcon name={getProficiencyIcon(prof)} size={10} color="#8B0000" fallbackName="award" /> {prof}
                               </div>
                            ))}</div>
                          <div className="space-y-2">
                            {character.features?.map((feat, i) => (
                              <div key={`feat-${i}`} className="bg-dragon-red/5 p-3 rounded-sm border-l-2 border-dragon-red/30">
                                <span className="text-[10px] font-black text-dragon-red uppercase block mb-1">{feat.name}</span>
                                <p className="text-[9px] text-parchment-600 leading-relaxed">{feat.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                     </div>

                     <div>
                        <div className="flex items-center gap-2 pb-1 border-b border-dragon-red/20 mb-3">
                          <GameIcon name="scroll" size={14} color="#8B0000" />
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-dragon-darkRed">Backstory</h3>
                        </div>
                        <div className="bg-white/40 p-6 rounded border border-dragon-red/5 min-h-[400px]">
                          <p className="text-[11px] leading-relaxed text-parchment-800 font-serif whitespace-pre-wrap italic">
                            {character.backstory || 'Historical record: UNAVAILABLE.'}
                          </p>
                        </div>
                     </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'spells' && (
                <motion.div
                  key="spells"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8 w-full max-w-4xl mx-auto"
                >
                   {/* Top Stats Bar */}
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white/40 p-4 rounded border border-dragon-red/10 flex flex-col items-center justify-center space-y-1">
                         <span className="text-[9px] font-black text-dragon-red/60 uppercase tracking-widest">Spell Atk</span>
                         <span className="text-3xl font-header font-black text-dragon-darkRed">{derived.spellAttackBonus >= 0 ? '+' : ''}{derived.spellAttackBonus}</span>
                      </div>
                      <div className="bg-white/40 p-4 rounded border border-dragon-red/10 flex flex-col items-center justify-center space-y-1">
                         <span className="text-[9px] font-black text-dragon-red/60 uppercase tracking-widest">Spell DC</span>
                         <span className="text-3xl font-header font-black text-dragon-darkRed">{derived.spellSaveDC}</span>
                      </div>
                      <div className="bg-white/40 p-4 rounded border border-dragon-red/10 flex flex-col items-center justify-center space-y-1">
                         <span className="text-[9px] font-black text-dragon-red/60 uppercase tracking-widest">Ability</span>
                         <span className="text-sm font-black text-dragon-darkRed uppercase tracking-widest">{character.spellcastingAbility || 'WIS'}</span>
                      </div>
                      <div className="bg-dragon-red/5 p-4 rounded border border-dragon-red/20 flex flex-col items-center justify-center space-y-2 group cursor-pointer hover:bg-dragon-red/10 transition-all shadow-sm"
                           onClick={() => setIsCharacterSpellbookOpen(true)}>
                         <GameIcon name="book" size={24} color="#8B0000" className="group-hover:scale-110 transition-transform" />
                         <span className="text-[9px] font-black text-dragon-red uppercase tracking-widest">Study Spellbook</span>
                      </div>
                   </div>

                   {/* Main Spell Grid */}
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Spell Slots & Rest */}
                      <div className="lg:col-span-4 space-y-6">
                         <div className="flex items-center justify-between border-b border-dragon-red/20 pb-2">
                            <h3 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-widest">Current_Essence</h3>
                            <button 
                              onClick={() => {
                                restoreSlots(true);
                                soundService.playEffect('UI_CLICK_LIGHT');
                              }}
                              className="text-[9px] font-black text-dragon-red hover:text-dragon-darkRed uppercase tracking-widest flex items-center gap-1.5"
                            >
                               <GameIcon name="sparkles" size={12} />
                               Long Rest
                            </button>
                         </div>

                         <div className="space-y-4">
                            {spellSlots.map((max, idx) => {
                               const level = idx + 1;
                               const current = (character.spellSlots?.[level.toString()] as any)?.current ?? max;
                               return (
                                 <div key={level} className="flex flex-col gap-2 p-3 bg-white/40 border border-dragon-red/5 rounded">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                       <span className="text-parchment-400">Level {level}</span>
                                       <span className="text-dragon-red">{current} / {max}</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                       {Array.from({ length: max }).map((_, i) => (
                                          <div 
                                            key={i} 
                                            className={cn(
                                              "w-3 h-3 rounded-full border shadow-inner transition-colors",
                                              i < (typeof current === 'number' ? current : 0)
                                                ? "bg-dragon-red border-dragon-red shadow-[0_0_8px_rgba(139,0,0,0.4)]" 
                                                : "bg-parchment-200 border-parchment-300 opacity-20"
                                            )}
                                          />
                                       ))}
                                    </div>
                                 </div>
                               );
                            })}
                         </div>
                      </div>

                      {/* Right: Active Spells List */}
                      <div className="lg:col-span-8 space-y-8">
                         {/* Prepared Spells */}
                         <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <GameIcon name="scroll" size={16} color="#8B0000" />
                               <h3 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-widest">Memorized_Lexicon</h3>
                               <div className="h-px flex-1 bg-gradient-to-r from-dragon-red/20 to-transparent" />
                               <span className="text-[9px] font-black text-parchment-400 uppercase tracking-widest">{character.preparedSpells?.length ?? 0} Active</span>
                            </div>
                            
                            <div className="bg-white/30 rounded border border-dragon-red/5 shadow-inner min-h-[100px]">
                               {(character.preparedSpells || []).length > 0 ? (
                                 character.preparedSpells.map((spellIndex, i) => {
                                   const spell = character.knownSpells?.find(s => s.index === spellIndex);
                                   if (!spell) return null;
                                   const currentSlots = (character.spellSlots?.[spell.level.toString()] as any)?.current ?? 0;
                                   return (
                                     <SpellListRow 
                                       key={i} 
                                       spell={spell} 
                                       onCast={() => castSpell(spell.index, spell.level)}
                                       isCastable={spell.level === 0 || currentSlots > 0}
                                       onInvokeRoll={rollDice3D}
                                     />
                                   );
                                 })
                               ) : (
                                  <div className="flex flex-col items-center justify-center py-12 opacity-30 space-y-3">
                                     <GameIcon name="book" size={24} />
                                     <span className="text-[10px] font-black uppercase tracking-widest">No Spells Prepared</span>
                                  </div>
                               )}
                            </div>
                         </div>

                         {/* Innate/Cantrips */}
                         <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <GameIcon name="lightning" size={16} color="#8B0000" />
                               <h3 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-widest">Innate_Cantrips</h3>
                               <div className="h-px flex-1 bg-gradient-to-r from-dragon-red/20 to-transparent" />
                            </div>
                            
                            <div className="bg-white/30 rounded border border-dragon-red/5 shadow-inner">
                               {cantrips.length > 0 ? (
                                 cantrips.map((spell, i) => (
                                   <SpellListRow 
                                     key={i} 
                                     spell={spell} 
                                     onCast={() => castSpell(spell.index, 0)}
                                     isCastable={true}
                                     onInvokeRoll={rollDice3D}
                                   />
                                 ))
                               ) : (
                                  <div className="flex items-center justify-center py-8 opacity-30">
                                     <span className="text-[9px] font-black uppercase tracking-widest">No Cantrips Mastered</span>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

                 </AnimatePresence>
              </div>
           </div>
        </div>
     </motion.div>











  );
};

const CharacterTab: React.FC<{ 
  character: any; 
  index: number; 
  isSelected: boolean; 
  onClick: () => void;
  isFixed?: boolean;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
  setNodeRef?: (node: HTMLElement | null) => void;
}> = ({ character, index, isSelected, onClick, isFixed, style, attributes, listeners, setNodeRef }) => (
  <button
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    onClick={onClick}
    className={cn(
      "h-16 transition-all flex items-center justify-center px-4 gap-3 relative overflow-hidden",
      isSelected 
        ? "bg-dragon-red/5 border-b-2 border-dragon-red z-10" 
        : "bg-white/5 border-b-2 border-transparent text-parchment-500 hover:text-dragon-red opacity-60 hover:opacity-100",
      !isFixed && "cursor-grab active:cursor-grabbing"
    )}
  >
    <div className="w-10 h-10 shrink-0 flex items-center justify-center relative translate-y-0.5">
      {character.avatarUrl || character.imageUrl ? (
        <ChromaKeyImage 
          src={normalizeImageUrl(character.avatarUrl || character.imageUrl, 'npc_character_profiles', character.id)} 
          alt={character.name}
          className="w-full h-full object-contain"
        />
      ) : (
        <GameIcon name="avatar" size={10} color="#8B0000" className="opacity-40" />
      )}
    </div>
    <div className="flex flex-col items-start min-w-0">
      <span className="truncate w-full font-header text-xs font-bold uppercase tracking-tight leading-none text-dragon-darkRed">
        {character.name.split(' ')[0]}
      </span>
      <span className="text-[7px] font-black opacity-40 leading-none mt-1 uppercase tracking-widest text-dragon-red">LEVEL {character.level}</span>
    </div>
  </button>
);

const SortableCharacterTab: React.FC<{
  character: any;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ character, index, isSelected, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: `tab-${character.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1
  };

  return (
    <CharacterTab 
      character={character}
      index={index}
      isSelected={isSelected}
      onClick={onClick}
      style={style}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
    />
  );
};

const HorizontalStat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="flex flex-col items-center px-4 py-1">
      <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest leading-none opacity-80">{label}</span>
      <span className="text-xl font-header font-black text-dragon-darkRed leading-none mt-1.5 flex items-baseline gap-1">
        {value}
        <span className="text-[10px] font-bold text-dragon-red/60 font-sans">
          {mod >= 0 ? `+${mod}` : mod}
        </span>
      </span>
    </div>
  );
};

const SquareMetric: React.FC<{ label: string; value: string; icon: string; colorClass?: string }> = ({ label, value, icon, colorClass = "text-dragon-red" }) => (
  <div className="flex flex-col items-center justify-center p-2 bg-white/50 border border-dragon-red/10 rounded aspect-square shadow-sm group hover:border-dragon-red/30 transition-all">
    <GameIcon name={icon as any} size={14} className={cn("mb-1 transition-transform group-hover:scale-110", colorClass)} />
    <span className="text-[11px] font-header font-black leading-none text-dragon-darkRed">{value}</span>
    <span className="text-[6px] font-black text-parchment-400 uppercase tracking-widest mt-1 opacity-60">{label}</span>
  </div>
);

const MiniCombatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white/60 p-2 rounded border border-dragon-red/5 flex flex-col items-center">
    <span className="text-[12px] font-header font-black text-dragon-darkRed leading-none">{value}</span>
    <span className="text-[6px] font-black text-parchment-400 uppercase tracking-tighter mt-1">{label}</span>
  </div>
);

const CompactCombatCard: React.FC<{ label: string; value: string; subValue: string; icon: string }> = ({ label, value, subValue, icon }) => (
  <div className="bg-white/60 p-3 rounded border border-dragon-red/5 flex items-center gap-3">
    <div className="w-8 h-8 rounded bg-dragon-red/5 flex items-center justify-center text-dragon-red">
      <GameIcon name={icon as any} size={16} />
    </div>
    <div className="flex flex-col">
       <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-header font-black text-dragon-darkRed leading-none">{value}</span>
          <span className="text-[7px] font-black text-parchment-400 uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-[6px] font-bold text-parchment-500 uppercase mt-0.5">{subValue}</span>
    </div>
  </div>
);

const DroppableSlotWrapper: React.FC<{ 
  slot: EquipmentSlotId; 
  item: any; 
  onClick: () => void; 
  alignment: string;
}> = ({ slot, item, onClick, alignment }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot}`,
    data: { slot }
  });

  const slotDef = EQUIPMENT_SLOTS[slot];

  return (
    <div ref={setNodeRef} className="relative">
      <div 
        onClick={onClick}
        className={cn(
          "aspect-[9/16] border rounded flex flex-col items-center justify-center transition-all bg-white relative overflow-hidden shadow-sm cursor-pointer",
          isOver ? "border-dragon-red scale-105 z-10 ring-2 ring-dragon-red/20" : "border-dragon-red/10"
        )}
      >
        <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
          <img src="https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        {item ? (
           <ChromaKeyImage src={item.imageUrl} alt={item.name} className="h-[90%] w-auto object-contain mx-auto p-0.5" />
        ) : (
           <div className="opacity-20">
             <GameIcon name={slotDef?.gameIcon || 'info'} size={12} color="#8B0000" />
           </div>
        )}
      </div>
      <div className="absolute -bottom-1 -right-1 bg-dragon-red text-[6px] text-white px-1 rounded-sm uppercase font-black tracking-tighter shadow-sm pointer-events-none">
        {slot.replace('acc_', 'A').replace('tool_', 'T').replace('ring_', 'R').toUpperCase()}
      </div>
    </div>
  );
};

const ActionRow: React.FC<{ 
  name: string; 
  type: string; 
  range: { normal: number | string; long?: number | string }; 
  hitBonus: number; 
  damage: string; 
  damageType: string;
  icon: any;
}> = ({ name, type, range, hitBonus, damage, damageType, icon }) => {
  const getDamageIcon = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("pierce")) return "piercing";
    if (t.includes("slash")) return "slashing";
    if (t.includes("bludgeon")) return "bludgeoning";
    return t.replace(/-/g, "_");
  };

  return (
    <div className="grid grid-cols-[1fr_80px_60px_80px] items-center py-2 px-1 border-b border-parchment-200/50 hover:bg-parchment-200/20 transition-colors">
      <div className="flex items-center gap-2">
        <div className="relative">
          <GameIcon name="sparkles" size={12} color="#8B0000" className="absolute -top-1.5 -left-1.5 opacity-40" />
          <GameIcon name={getAttackIcon(icon || name)} size={16} color="#4A4A4A" className="relative z-10" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-parchment-900 leading-none truncate">{name}</span>
          <span className="text-[7px] text-parchment-400 font-medium uppercase tracking-tighter">{type}</span>
        </div>
      </div>
      
      <div className="text-center">
        <span className="text-[9px] font-black text-parchment-900 leading-none">
          {range.normal}
          {range.long && <span className="text-parchment-400 ml-0.5 text-[7px]">({range.long})</span>}
          {typeof range.normal === 'number' && <span className="text-[6px] text-parchment-400 ml-0.5 uppercase">ft.</span>}
        </span>
      </div>

      <div className="flex justify-center">
        <div className="min-w-[32px] py-0.5 border border-parchment-200 rounded-sm bg-white/50 flex items-center justify-center">
          <span className="text-[11px] font-black text-parchment-800">
            {hitBonus >= 0 ? `+${hitBonus}` : hitBonus}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="min-w-[50px] py-0.5 px-1.5 border border-parchment-200 rounded-sm bg-white/50 flex items-center gap-1 justify-center">
          {(() => {
            const diceMatch = damage.match(/d(\d+)/);
            if (diceMatch) {
              const dieType = `d${diceMatch[1]}`;
              return <GameIcon name={dieType as any} size={12} color="#8B0000" className="opacity-60" />;
            }
            return <GameIcon name="dice" size={12} color="#8B0000" className="opacity-60" />;
          })()}
          <span className="text-[9px] font-black text-parchment-800 whitespace-nowrap">
            {damage}
          </span>
          <GameIcon name={getDamageIcon(damageType)} size={8} color="#8B0000" className="opacity-60" />
        </div>
      </div>
    </div>
  );
};

const StatPin: React.FC<{ label: string; value: string | number; icon: any; color?: string }> = ({ label, value, icon, color = "text-dragon-red" }) => (
  <div className="flex items-center gap-2 group p-2 rounded hover:bg-stone-100/50 transition-colors">
    <GameIcon name={icon as any} size={14} className={cn("transition-transform group-hover:scale-110", color)} />
    <div className="flex flex-col">
       <span className="text-[11px] font-header font-black leading-none text-dragon-darkRed">{value}</span>
       <span className="text-[6px] font-black text-parchment-400 uppercase tracking-widest">{label}</span>
    </div>
  </div>
);

const HeaderField: React.FC<{ label: string; value: string; icon: any }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-2 group flex-1">
    <div className="w-8 h-8 shrink-0 rounded-full bg-dragon-red/5 flex items-center justify-center border border-dragon-red/10 group-hover:border-dragon-red/30 transition-colors">
      <GameIcon name={icon as any} size={14} className="text-dragon-red/50 group-hover:text-dragon-red" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[7px] font-black text-parchment-400 uppercase tracking-[0.2em] leading-none mb-0.5">{label}</span>
      <span className="text-[10px] font-bold text-parchment-900 uppercase tracking-widest leading-none truncate">{value}</span>
    </div>
  </div>
);

const VerticalStat: React.FC<{ label: string; value: number; abbr: string; icon: string; isModified?: boolean; onClick?: () => void }> = ({ label, value, abbr, icon, isModified, onClick }) => {
  const mod = Math.floor((value - 10) / 2);
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 py-3 px-3 border border-dragon-red/5 rounded-sm group transition-all text-left w-full active:scale-[0.98]",
        isModified ? "bg-dragon-red/5 border-dragon-red/20 shadow-[0_0_15px_rgba(139,0,0,0.1)]" : "bg-white/40 hover:bg-white/60"
    )}>
       <div className={cn(
         "w-10 h-10 flex items-center justify-center transition-opacity shrink-0 rounded-full",
         isModified ? "bg-dragon-red/10 opacity-100 shadow-[0_0_8px_rgba(139,0,0,0.2)]" : "bg-dragon-red/5 opacity-60 group-hover:opacity-100"
       )}>
          <GameIcon name={icon as any} size={18} color="#8B0000" />
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-dragon-darkRed uppercase tracking-widest leading-none">{label}</span>
                <span className="text-[7px] font-bold text-parchment-400 uppercase mt-1">{abbr} MATRIX INFUSION</span>
             </div>
             <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                   <span className="text-2xl font-header font-black text-dragon-darkRed leading-none">{value}</span>
                   <span className="text-[8px] font-black text-parchment-300 uppercase">RAW</span>
                </div>
                <div className="min-w-[40px] h-10 flex items-center justify-center bg-dragon-red/10 rounded-sm border border-dragon-red/20 shadow-inner">
                   <span className={cn(
                      "text-lg font-black leading-none",
                      mod >= 0 ? "text-dragon-red" : "text-black/60"
                   )}>
                      {mod >= 0 ? `+${mod}` : mod}
                   </span>
                </div>
             </div>
          </div>
       </div>
    </button>
  );
};

const CurrencyPin: React.FC<{ type: string; value: number; color: string; pulse?: boolean }> = ({ type, value, color, pulse }) => (
  <div className="bg-white/60 px-2 py-1.5 rounded-sm border border-dragon-red/5 flex flex-col items-center">
    <div className="flex items-center gap-1">
       <GameIcon name="coins" size={8} color={color} className={cn(pulse && "animate-pulse")} />
       <span className="text-[6px] font-black text-parchment-600 uppercase">{type}</span>
    </div>
    <span className={cn("text-[9px] font-black tabular-nums transition-colors", pulse && "animate-pulse")} style={{ color }}>{value}</span>
  </div>
);

const TraitList: React.FC<{ label: string; items: any[]; icon: GameIconName; variant?: 'default' | 'warning' }> = ({ label, items, icon, variant = 'default' }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-[8px] font-black text-parchment-400 uppercase tracking-[0.2em] flex items-center gap-2">
        <GameIcon name={icon} size={12} color={variant === 'warning' ? '#D97706' : '#8B0000'} />
        {label}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t, idx) => {
          const name = typeof t === 'string' ? t : t.name;
          return (
            <span 
              key={idx}
              className={cn(
                "px-3 py-1.5 rounded text-[10px] font-bold border transition-all",
                variant === 'warning' 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-white text-parchment-600 border-parchment-200 shadow-sm"
              )}
            >
              {name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const StatLine: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-baseline gap-4 text-[11px] font-bold">
    <span className="uppercase tracking-widest text-parchment-400 font-black text-[9px]">{label}:</span>
    <span className={cn(
      "text-dragon-darkRed truncate text-right",
      highlight && "text-dragon-red font-black"
    )}>{value}</span>
  </div>
);
