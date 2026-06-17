import React from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { BookReader } from '../bookreader/BookReader';
import { GameIcon } from '../../game_icons';
import { calculateMaxSpellSlots, getEffectiveStats } from '../../lib/statCalculations';
import { getModifier } from '../../lib/npcGeneratorUtils';
import { getOrdinal } from '../../lib/dataUtils';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface SpellbookReaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpellbookReader: React.FC<SpellbookReaderProps> = ({ isOpen, onClose }) => {
  const {
    prepareSpell,
    unprepareSpell,
    characters,
    activeCharacterId
  } = useCharacterStore();
  
  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  if (!activeCharacter) return null;

  const knownSpells = (activeCharacter.knownSpells as any[]) || (activeCharacter as any).spells || [];
  const preparedIndices = activeCharacter.preparedSpells || [];
  
  const stats = getEffectiveStats(activeCharacter);
  const spellAbility = activeCharacter.spellcastingAbility || 'wis';
  const abilityMod = getModifier(stats[spellAbility as keyof typeof stats] || 10);
  const profBonus = Math.floor(2 + ((activeCharacter.level || 1) - 1) / 4);
  const spellDC = 8 + abilityMod + profBonus;
  const attackBonus = abilityMod + profBonus;

  const maxPrepared = (activeCharacter.level || 1) + abilityMod;

  const spellbookData = {
    id: 'spellbook-' + activeCharacter.id,
    title: `${activeCharacter.name}'s Spellbook`,
    author: activeCharacter.name,
    type: 'spellbook' as const,
    coverIndex: 4,
    spineIndex: 2,
    pages: knownSpells
      .sort((a, b) => (a.level || 0) - (b.level || 0))
      .map((spell) => {
        const isPrepared = preparedIndices.includes(spell.index);
        
        return {
          id: spell.index,
          title: spell.name,
          headerContent: (
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-black/5 flex items-center justify-center">
                  <GameIcon name="magic_effect" size={20} color="#000" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 leading-none">Arcane Codex Manifest</span>
                  <span className="text-xl font-header font-black text-black leading-none mt-1 uppercase tracking-widest">{spell.name}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[14px] font-header font-black text-black leading-none uppercase">{spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</span>
                <span className="text-[8px] font-bold text-black/40 uppercase tracking-widest mt-1">{spell.school?.name || 'Evocation'}</span>
              </div>
            </div>
          ),
          content: (
            <div className="space-y-6 font-serif text-[11px] leading-relaxed text-black/80 italic">
               <div className="grid grid-cols-2 gap-4 py-3 border-y border-black/5 bg-black/[0.02] px-4 -mx-4">
                  <div className="space-y-1">
                     <p><span className="font-bold uppercase text-[9px] tracking-widest opacity-40 block">Casting Time:</span> {spell.casting_time}</p>
                     <p><span className="font-bold uppercase text-[9px] tracking-widest opacity-40 block">Range:</span> {spell.range}</p>
                  </div>
                  <div className="space-y-1">
                     <p><span className="font-bold uppercase text-[9px] tracking-widest opacity-40 block">Components:</span> {spell.components?.join(', ')}</p>
                     <p><span className="font-bold uppercase text-[9px] tracking-widest opacity-40 block">Duration:</span> {spell.duration}</p>
                  </div>
               </div>

               <div className="space-y-4 pr-4">
                  {Array.isArray(spell.desc) ? spell.desc.map((d: string, i: number) => (
                    <p key={i}>{d}</p>
                  )) : <p>{spell.desc}</p>}
               </div>

               <div className="flex justify-center pt-8">
                  {spell.level > 0 && (
                    <button
                      onClick={() => {
                        if (isPrepared) unprepareSpell(spell.index);
                        else prepareSpell(spell.index);
                      }}
                      className={cn(
                        "px-8 py-3 rounded-sm border-2 transition-all font-header text-xs uppercase tracking-[0.2em] font-black",
                        isPrepared 
                          ? "bg-black text-white border-black shadow-lg" 
                          : "bg-transparent border-black/20 text-black hover:border-black hover:bg-black/5"
                      )}
                    >
                      {isPrepared ? 'Remove from Mind' : 'Memorize Inscription'}
                    </button>
                  )}
               </div>
            </div>
          )
        };
      })
  };

  return (
    <div className="fixed inset-0 z-[5000]">
      <BookReader 
        isOpen={isOpen}
        onClose={onClose}
        book={spellbookData as any}
      />
      
      <div className="absolute bottom-12 right-12 flex flex-col items-end gap-2 pointer-events-none opacity-40 z-[6000]">
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Caster Matrix</span>
         <div className="flex gap-4">
            <div className="text-right">
               <span className="block text-[8px] font-bold uppercase tracking-widest leading-none text-white">Save DC</span>
               <span className="text-2xl font-header font-black text-white">{spellDC}</span>
            </div>
            <div className="text-right">
               <span className="block text-[8px] font-bold uppercase tracking-widest leading-none text-white">Attack</span>
               <span className="text-2xl font-header font-black text-white">+{attackBonus}</span>
            </div>
            <div className="text-right">
               <span className="block text-[8px] font-bold uppercase tracking-widest leading-none text-white">Memory</span>
               <span className={cn("text-2xl font-header font-black text-white", preparedIndices.length > maxPrepared ? "text-red-500" : "")}>
                 {preparedIndices.length}/{maxPrepared}
               </span>
            </div>
         </div>
      </div>
    </div>
  );
};
