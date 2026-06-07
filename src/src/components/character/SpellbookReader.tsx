import React from 'react';
import { useStore } from '../../store/useStore';
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
    characters, 
    activeCharacterId, 
    prepareSpell, 
    unprepareSpell 
  } = useStore();
  
  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  if (!activeCharacter) return null;

  // Migration: use 'knownSpells' primary, but fallback to 'spells' if it exists (for older characters)
  const knownSpells = (activeCharacter.knownSpells as any[]) || (activeCharacter as any).spells || [];
  const preparedIndices = activeCharacter.preparedSpells || [];

  // Calculate max prepared spells
  // Wizard rule: Level + INT modifier
  const effectiveStats = getEffectiveStats(activeCharacter);
  const abilityMod = getModifier(effectiveStats?.[activeCharacter.spellcastingAbility as any] ?? 10);
  const maxPrepared = (activeCharacter.level || 1) + abilityMod;
  const currentPreparedCount = preparedIndices.length;

  const handleTogglePrepare = (spellIndex: string) => {
    if (preparedIndices.includes(spellIndex)) {
      unprepareSpell(spellIndex);
    } else {
      if (currentPreparedCount >= maxPrepared) {
        // We could show a toast or just handle it gracefully
        return;
      }
      prepareSpell(spellIndex);
    }
  };

  const spellbookData = {
    id: `spellbook-${activeCharacter.id}`,
    title: `${activeCharacter.name}'s Spellbook`,
    author: activeCharacter.name,
    type: 'spellbook' as const,
    coverIndex: 0,
    spineIndex: 0,
    pages: [
      // Index 0: Inside Front Cover (Blank)
      {
        id: 'spellbook-inside-front',
        title: '',
        content: <div className="w-full h-full bg-stone-100/10" />
      },
      // Index 1: Intro Page (Right side of first spread)
      {
        id: 'spellbook-intro',
        title: 'Arcane Foundations',
        content: (
          <div className="flex flex-col h-full px-8 pt-10 relative">
            <div className="border-b-2 border-dragon-darkRed/20 pb-4 mb-8">
               <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-[0.2em] mb-1 opacity-60">Volume {activeCharacter.level}</h3>
               <h2 className="font-header text-4xl font-black text-dragon-darkRed uppercase tracking-tight">The Weave of Memory</h2>
               <p className="font-playfair text-lg italic text-stone-500">Guidelines for the Manifestation of Will</p>
            </div>

            <div className="space-y-8 font-playfair text-[17px] leading-relaxed text-stone-800">
               <section>
                  <h3 className="text-[11px] font-black text-dragon-red uppercase tracking-[0.2em] mb-3">Precept I: Mental Imprinting</h3>
                  <p>
                    A caster's mind is a finite vessel. To cast a spell, you must first imprint its complex geometry upon your consciousness—a process known as <strong>Memorization</strong>.
                  </p>
               </section>

               <section>
                  <h3 className="text-[11px] font-black text-dragon-red uppercase tracking-[0.2em] mb-3">Precept II: Capacity</h3>
                  <div className="p-5 bg-stone-100/50 border border-dragon-gold/20 rounded-sm italic">
                    <p className="mb-4">
                      The number of spells you can hold in active memory is determined by your hard-won experience and your natural affinity for the arcane.
                    </p>
                    <div className="flex flex-col gap-2 not-italic">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-stone-500">Character Level</span>
                          <span className="font-bold text-dragon-red">{activeCharacter.level}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm border-t border-stone-200 pt-2">
                          <span className="text-stone-500 uppercase text-[10px] font-black tracking-widest">{activeCharacter.spellcastingAbility} Modifier</span>
                          <span className="font-bold text-dragon-red">{abilityMod >= 0 ? `+${abilityMod}` : abilityMod}</span>
                       </div>
                       <div className="flex justify-between items-center text-lg font-header font-black border-t-2 border-dragon-gold/30 mt-1 pt-2">
                          <span className="text-dragon-darkRed uppercase tracking-widest">Total Limit</span>
                          <span className="text-dragon-red">{maxPrepared}</span>
                       </div>
                    </div>
                  </div>
               </section>

               <section>
                  <h3 className="text-[11px] font-black text-dragon-red uppercase tracking-[0.2em] mb-3">Precept III: Method</h3>
                  <p>
                    To prepare a spell for the day, navigate through your recorded spreads and click the <strong>Memorize</strong> sigil. 
                    <span className="block mt-2 opacity-60">Cantrips represent basic manipulations requiring no mental imprinting; they are always passive.</span>
                  </p>
               </section>
            </div>

            <div className="mt-auto pt-4 border-t border-dragon-gold/10 flex justify-end items-center gap-2 opacity-30">
               <GameIcon name="pen_line" size={12} />
               <span className="text-[8px] font-black uppercase italic tracking-widest">Verified by {activeCharacter.name}</span>
            </div>
          </div>
        )
      },
      // Spells or Empty Notice
      ...(knownSpells.length > 0 ? knownSpells.map((spell) => {
      const isPrepared = preparedIndices.includes(spell.index);
      const isCantrip = spell.level === 0;

      return {
        id: spell.index,
        title: spell.name,
        header: (
          <div className="flex items-center justify-between px-1 gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest">{activeCharacter.name}'s Spellbook</span>
                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">Spread {knownSpells.indexOf(spell) + 1}</span>
             </div>
             <div className="flex items-center gap-2 bg-stone-100/50 px-3 py-1 rounded-full border border-stone-200/50">
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest leading-none">Memorized</span>
                   <span className="text-[9px] font-bold text-stone-700 uppercase tracking-tighter">{currentPreparedCount} / {maxPrepared}</span>
                </div>
                <div className="w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden border border-stone-300/30">
                   <div 
                      className="h-full bg-dragon-red transition-all duration-500" 
                      style={{ width: `${Math.min(100, (currentPreparedCount / maxPrepared) * 100)}%` }} 
                   />
                </div>
             </div>
          </div>
        ),
        content: (
          <div className="flex flex-col h-full px-5 pt-3 relative">
            {/* Header: Name and Level - Tighter */}
            <div className="flex justify-between items-start mb-1.5 border-b-2 border-dragon-darkRed/15 pb-1.5">
               <div>
                  <h2 className="font-header text-3xl font-black text-dragon-darkRed uppercase tracking-tight leading-none">
                    {spell.name}
                  </h2>
                  <p className="font-playfair text-sm italic text-stone-500 mt-0.5">
                    {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} {spell.school?.name}
                  </p>
               </div>
               
               {/* Preparation Mechanism - Scaled down */}
               <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleTogglePrepare(spell.index)}
                    className={cn(
                      "group relative flex flex-col items-center gap-0.5 transition-all active:scale-95",
                      isCantrip && "opacity-15 cursor-not-allowed"
                    )}
                    disabled={isCantrip}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-sm",
                      isPrepared 
                        ? "bg-dragon-red border-dragon-red text-white" 
                        : "bg-white/40 border-stone-200 text-stone-300 hover:text-dragon-red/40"
                    )}>
                       <GameIcon name={isPrepared ? "check" : "sparkles"} size={20} color="currentColor" />
                    </div>
                    <span className={cn(
                      "text-[7px] font-black uppercase tracking-widest",
                      isPrepared ? "text-dragon-red" : "text-stone-400"
                    )}>
                      {isPrepared ? 'Memorized' : isCantrip ? 'Passive' : 'Memorize'}
                    </span>
                  </button>
               </div>
            </div>

            {/* Quick Stats Grid - Very Compact */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3 pt-0.5">
               <div className="flex items-baseline gap-1.5">
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Cast:</span>
                  <span className="text-[11px] font-bold text-stone-700">{spell.casting_time}</span>
               </div>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Focus:</span>
                  <span className="text-[11px] font-bold text-stone-700">{spell.duration}</span>
               </div>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Range:</span>
                  <span className="text-[11px] font-bold text-stone-700">{spell.range}</span>
               </div>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Nodes:</span>
                  <span className="text-[11px] font-bold text-stone-700 truncate">{spell.components?.join(', ')}</span>
               </div>
            </div>

            {/* Illustration Area - More integrated with the corner */}
            <div className="relative mb-4 flex-1 overflow-hidden flex flex-col">
               <div className="absolute top-0 right-[-10px] w-28 h-28 opacity-30 mix-blend-multiply pointer-events-none z-10">
                  {spell.imageUrl && (
                    <img src={spell.imageUrl} alt="" className="w-full h-full object-contain brightness-90 grayscale-[0.2]" />
                  )}
               </div>
               
               {/* Description - Snugger line height, more text space */}
               <div className="font-playfair text-[15px] leading-snug text-stone-800 text-justify relative z-10 custom-scrollbar-minimal pr-1 overflow-y-auto">
                  <div className="first-letter:text-4xl first-letter:font-header first-letter:mr-2 first-letter:float-left first-letter:text-dragon-darkRed first-letter:leading-[0.8]">
                    {Array.isArray(spell.desc) ? spell.desc.map((p: string, i: number) => (
                      <p key={i} className={cn(i === 0 ? "mb-3" : "mb-3 indent-3")}>{p}</p>
                    )) : spell.desc}
                  </div>
                  
                  {spell.material && (
                    <div className="my-3 p-2 bg-dragon-gold/5 border-l-2 border-dragon-gold/20 italic text-[11px] text-stone-500 leading-tight">
                      Requires: {spell.material}
                    </div>
                  )}

                  {spell.higher_level && (
                    <div className="mt-4 pt-3 border-t border-stone-200/40">
                       <h4 className="text-[8px] font-black text-dragon-red uppercase tracking-widest mb-1 opacity-50">Flow Amplification</h4>
                       <div className="text-[13px] italic text-stone-600 leading-snug">
                          {Array.isArray(spell.higher_level) ? spell.higher_level.join(' ') : spell.higher_level}
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Footer Signature - Minimized */}
            <div className="mt-auto pt-2 border-t border-dragon-gold/10 flex justify-between items-center opacity-30">
               <div className="flex gap-2">
                  {spell.classes?.map((c: any, i: number) => (
                    <span key={i} className="text-[7px] font-bold uppercase tracking-widest">{typeof c === 'string' ? c : c.name}</span>
                  ))}
               </div>
               <span className="text-[7px] font-black uppercase italic tracking-widest">Lvl {spell.level} Incantation</span>
            </div>
          </div>
        )
      };
    }) : [
      {
        id: 'empty-notice',
        title: 'An Empty Volume',
        content: (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
             <div className="w-32 h-32 bg-dragon-gold/10 rounded-full flex items-center justify-center mb-8 border border-dragon-gold/20">
                <GameIcon name="sparkles" size={64} color="#D4AF37" className="opacity-40" />
             </div>
             <h2 className="font-header text-3xl text-dragon-darkRed uppercase mb-4">The Book is Silent</h2>
             <p className="font-playfair text-xl text-stone-600 leading-relaxed italic mb-8">
                Your spellbook currently contains no recorded incantations. To weave the arcane, you must first study.
              </p>
             <div className="bg-stone-100 rounded-lg p-6 border border-stone-200 w-full text-left">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">How to Learn Spells:</h4>
                <ul className="space-y-3">
                   <li className="flex gap-3 text-sm text-stone-700">
                      <div className="w-5 h-5 bg-dragon-gold text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                      <span>Visit the <strong>Collection</strong> using the top navigation bar.</span>
                   </li>
                   <li className="flex gap-3 text-sm text-stone-700">
                      <div className="w-5 h-5 bg-dragon-gold text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                      <span>Filter by <strong>Spells</strong> to find available magic.</span>
                   </li>
                   <li className="flex gap-3 text-sm text-stone-700">
                      <div className="w-5 h-5 bg-dragon-gold text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                      <span>Open a spell card and click <strong>Learn Spell</strong> to transcribe it.</span>
                   </li>
                </ul>
             </div>
          </div>
        )
      }
    ]),
    // Padding page if odd
    ...((1 + 1 + (knownSpells.length > 0 ? knownSpells.length : 1)) % 2 !== 0 ? [
      {
        id: 'spellbook-padding-end',
        title: '',
        content: <div className="w-full h-full bg-stone-100/5 opacity-30" />
      }
    ] : [])
    ]
  };

  return (
    <BookReader 
      book={spellbookData}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};
