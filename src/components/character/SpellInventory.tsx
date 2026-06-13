import React from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { SpellCard } from '../atlas/SpellCard';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { renderNameValue } from '../../lib/dataUtils';
import { GameIcon } from '../../game_icons';
import { calculateMaxSpellSlots } from '../../lib/statCalculations';
import { SpellbookReader } from './SpellbookReader';

export const SpellInventory: React.FC = () => {
  const { 
    setFocusedItem, 
    isCharacterSpellbookOpen,
    setIsCharacterSpellbookOpen
  } = useCharacterStore();

  const {
    characters, 
    activeCharacterId,
    castSpell,
    restoreSlots
  } = useCharacterStore();
  
  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  const [selectedSpell, setSelectedSpell] = React.useState<any | null>(null);
  const [levelFilter, setLevelFilter] = React.useState<number | null>(null);

  if (!activeCharacter) return null;

  const maxSlots = calculateMaxSpellSlots(activeCharacter);
  const knownSpells = (activeCharacter.knownSpells as any[]) || [];
  const preparedIndices = activeCharacter.preparedSpells || [];
  const preparedSpells = knownSpells.filter(s => preparedIndices.includes(s.index));

  return (
    <div className="flex flex-col h-full bg-parchment-50/80 backdrop-blur-md rounded-xl border border-dragon-red/20 shadow-2xl overflow-hidden relative group">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-dragon-red/5 blur-[80px] rounded-full group-hover:bg-dragon-red/10 transition-colors duration-1000" />

      {/* Magic Header */}
      <div className="shrink-0 bg-dragon-darkRed p-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <GameIcon name="magic_effect" size={80} color="#FFFFFF" />
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <GameIcon name="book" size={24} color="#FFFFFF" />
             </div>
             <div>
               <h2 className="font-header text-lg uppercase tracking-widest leading-none">Arcane Lexicon</h2>
               <p className="text-[10px] text-white/60 uppercase font-bold tracking-tighter mt-1">Memorized Manifestations</p>
             </div>
          </div>
          <button 
            onClick={() => setIsCharacterSpellbookOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-all group/btn"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Study book</span>
            <GameIcon name="plus" size={12} className="group-hover/btn:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      {/* Spell Level Selection */}
      <div className="shrink-0 flex border-b border-dragon-red/10 bg-parchment-100/50 p-1 gap-1 overflow-x-auto no-scrollbar">
         {[null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
           <button
             key={lvl === null ? 'all' : lvl}
             onClick={() => setLevelFilter(lvl)}
             className={cn(
               "flex-1 min-w-[32px] py-1.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all",
               levelFilter === lvl 
                 ? "bg-dragon-red text-white shadow-md shadow-dragon-red/20" 
                 : "text-parchment-400 hover:bg-parchment-200 hover:text-dragon-darkRed"
             )}
           >
             {lvl === null ? 'All' : lvl === 0 ? 'C' : lvl}
           </button>
         ))}
      </div>

      {/* Spell Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10">
         <div className="grid grid-cols-1 gap-2">
            {preparedSpells
              .filter(s => levelFilter === null || s.level === levelFilter)
              .map((spell) => (
                <motion.button
                  key={spell.index}
                  layout
                  onClick={() => setSelectedSpell(spell)}
                  className="group/spell flex items-center gap-3 p-3 bg-white/40 hover:bg-white/60 border border-dragon-red/5 hover:border-dragon-red/20 rounded-lg transition-all text-left shadow-sm active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded bg-parchment-100 flex items-center justify-center border border-dragon-red/10 group-hover/spell:bg-dragon-red group-hover/spell:border-dragon-gold transition-all duration-300">
                     <GameIcon name="wand" size={20} className="text-dragon-red group-hover/spell:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[11px] font-black text-parchment-900 uppercase tracking-tight truncate group-hover/spell:text-dragon-darkRed transition-colors">{spell.name}</span>
                        <span className="text-[8px] font-black text-dragon-red/40 uppercase tracking-widest">{spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-parchment-400 uppercase tracking-widest">Time: {spell.casting_time}</span>
                        <div className="w-0.5 h-0.5 rounded-full bg-parchment-300" />
                        <span className="text-[8px] font-bold text-parchment-400 uppercase tracking-widest">Rng: {spell.range}</span>
                     </div>
                  </div>
                </motion.button>
              ))}
            
            {preparedSpells.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center opacity-30 select-none">
                 <GameIcon name="book" size={48} className="mb-4" color="#8B4513" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Lexicon Depleted</p>
                 <p className="text-[8px] mt-1 italic">Prepare spells from your spellbook</p>
              </div>
            )}
         </div>
      </div>

      {/* Spell Modal / Detail View Overlay */}
      <AnimatePresence>
        {selectedSpell && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpell(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10 max-h-full"
            >
               <SpellCard spell={selectedSpell} onClose={() => setSelectedSpell(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
