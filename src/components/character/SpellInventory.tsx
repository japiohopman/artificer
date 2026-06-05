import React from 'react';
import { useStore } from '../../store/useStore';
import { SpellCard } from '../SpellCard';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { renderNameValue } from '../../lib/dataUtils';
import { GameIcon } from '../../game_icons';
import { calculateMaxSpellSlots } from '../../lib/statCalculations';
import { SpellbookReader } from './SpellbookReader';

export const SpellInventory: React.FC = () => {
  const { 
    characters, 
    activeCharacterId, 
    setFocusedItem, 
    castSpell, 
    restoreSlots,
    isCharacterSpellbookOpen,
    setIsCharacterSpellbookOpen
  } = useStore();
  
  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  const [selectedSpell, setSelectedSpell] = React.useState<any | null>(null);
  const [levelFilter, setLevelFilter] = React.useState<number | null>(null);

  if (!activeCharacter) return null;

  // The right panel ONLY shows prepared spells
  const preparedIndices = activeCharacter.preparedSpells || [];
  const knownSpells = activeCharacter.knownSpells || [];
  const preparedSpells = knownSpells.filter(s => preparedIndices.includes(s.index));
  
  const spellSlots = activeCharacter.spellSlots || {};
  const maxSlots = calculateMaxSpellSlots(activeCharacter);

  const filteredSpells = levelFilter === null 
    ? preparedSpells 
    : preparedSpells.filter((s: any) => Number(s.level) === levelFilter);

  const handleCast = (spell: any) => {
    const success = castSpell(spell.index, spell.level);
    if (success) {
      // Show some feedback or sound
      setSelectedSpell(null);
    } else if (spell.level > 0) {
      alert("Insufficient spell slots!");
    }
  };

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Spellbook Access Header */}
      <div className="relative group cursor-pointer" onClick={() => setIsCharacterSpellbookOpen(!isCharacterSpellbookOpen)}>
        <div className={cn(
            "h-20 w-full rounded-lg overflow-hidden border-2 mb-2 relative transition-all duration-500",
            isCharacterSpellbookOpen ? "border-dragon-red shadow-[0_0_20px_rgba(139,0,0,0.3)]" : "border-dragon-gold shadow-lg"
        )}>
          <img 
            src="https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/atlas/backgrounds/images/cosmic_ritual.webp" 
            alt="Arcane Banner"
            className={cn(
                "w-full h-full object-cover transition-transform duration-700",
                isCharacterSpellbookOpen ? "scale-125 saturate-150" : "group-hover:scale-110"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 px-3">
             <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-anton text-dragon-gold tracking-widest uppercase">
                        {isCharacterSpellbookOpen ? 'Close Spellbook' : 'Open Spellbook'}
                    </p>
                    <p className="text-[8px] font-header text-parchment-300 uppercase tracking-wider">Manage Known Spells</p>
                </div>
                <div className={cn(
                    "p-1.5 rounded-full border backdrop-blur-sm transition-colors",
                    isCharacterSpellbookOpen ? "bg-dragon-red/40 border-dragon-red" : "bg-dragon-gold/20 border-dragon-gold/30"
                )}>
                    <GameIcon name="book" size={16} color={isCharacterSpellbookOpen ? "#FFFFFF" : "#D4AF37"} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Spell Slots Display */}
      <div className="bg-white/20 backdrop-blur-sm border border-parchment-300 rounded-lg p-3 mb-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[9px] font-black text-dragon-darkRed uppercase tracking-widest">Spell Slots</h4>
          <button 
            onClick={() => restoreSlots(true)}
            className="text-[8px] font-bold text-dragon-red hover:underline uppercase tracking-tighter"
          >
            Long Rest
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(maxSlots).map(([lvl, max]) => {
            const current = spellSlots[lvl]?.current ?? max;
            return (
              <div key={lvl} className="flex flex-col items-center gap-1">
                <span className="text-[7px] font-bold text-parchment-500">L{lvl}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: max }).map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full border",
                        i < current 
                          ? "bg-dragon-red border-dragon-red shadow-[0_0_5px_rgba(139,0,0,0.4)]" 
                          : "bg-transparent border-parchment-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Filter Tabs */}
      <div className="flex gap-0.5 overflow-x-auto custom-scrollbar pb-1 mb-2">
        {['All', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((lvl) => {
          const isActive = lvl === 'All' ? levelFilter === null : levelFilter === Number(lvl);
          return (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl === 'All' ? null : Number(lvl))}
              className={cn(
                "min-w-[28px] h-7 flex items-center justify-center rounded text-[10px] font-anton transition-all border shrink-0",
                isActive 
                  ? "bg-dragon-red border-dragon-red text-white shadow-md scale-105 z-10" 
                  : "bg-parchment-100 border-parchment-300 text-parchment-600 hover:border-dragon-red/30"
              )}
            >
              {lvl === '0' ? 'C' : lvl}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <GameIcon name="sparkles" size={14} color="#8B0000" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-dragon-darkRed">
          {levelFilter === null ? 'Prepared Spells' : `Level ${levelFilter === 0 ? 'Cantrips' : levelFilter}`}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {filteredSpells.length === 0 ? (
          <div className="py-8 text-center text-parchment-400 italic text-[10px]">
            {preparedSpells.length === 0 ? "No spells prepared for today." : "No spells of this level prepared."}
          </div>
        ) : (
          filteredSpells.map((spell, idx) => (
            <button
              key={`${spell.index}-${idx}`}
              onClick={() => setSelectedSpell(spell)}
              className={cn(
                "flex flex-col p-3 rounded-lg border text-left transition-all group relative overflow-hidden",
                selectedSpell?.index === spell.index
                  ? "bg-dragon-darkRed/10 border-dragon-red shadow-inner"
                  : "bg-white/40 border-parchment-300 hover:border-dragon-red/30 hover:bg-white/60"
              )}
            >
              <div className="flex justify-between items-start mb-1 relative z-10">
                <span className="text-[11px] font-bold text-dragon-darkRed uppercase truncate pr-2">
                  {spell.name}
                </span>
                <span className="text-[9px] font-anton text-dragon-red shrink-0 px-1.5 py-0.5 bg-dragon-red/5 rounded border border-dragon-red/10">
                  Lvl {spell.level}
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-60 relative z-10">
                <span className="text-[8px] font-bold text-parchment-500 uppercase italic">
                  {renderNameValue(spell.school)}
                </span>
                {spell.concentration && (
                    <span className="text-[7px] bg-blue-100 text-blue-700 px-1 rounded font-black uppercase tracking-tighter">C</span>
                )}
              </div>
              
              {activeCharacter.concentrationSpellId === spell.index && (
                <div className="absolute top-0 right-10 bottom-0 flex items-center justify-center opacity-20 pointer-events-none">
                    <GameIcon name="sparkles" size={24} color="#8B0000" className="animate-pulse" />
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Quick View Overlay (With Cast Button) */}
      <AnimatePresence>
        {selectedSpell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedSpell(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative flex flex-col items-center gap-6"
            >
              <SpellCard spell={selectedSpell} />
              
              <div className="flex gap-4">
                  <button 
                    onClick={() => handleCast(selectedSpell)}
                    className="px-8 py-3 bg-dragon-red text-white rounded-lg font-black uppercase tracking-[0.2em] shadow-xl hover:bg-dragon-darkRed transition-all active:scale-95 border-2 border-white/20"
                  >
                    Cast Spell
                  </button>
                  <button 
                    onClick={() => setSelectedSpell(null)}
                    className="px-8 py-3 bg-white/10 text-white rounded-lg font-black uppercase tracking-[0.2em] shadow-xl hover:bg-white/20 transition-all active:scale-95 border-2 border-white/20 backdrop-blur-md"
                  >
                    Close
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
