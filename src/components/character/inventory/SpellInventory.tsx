import React, { useState } from 'react';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useActiveCharacter } from '../../../lib/character';
import { useUIStore } from '../../../store/useUIStore';
import { SpellCard } from '../../atlas/SpellCard';
import { SpellSprite } from '../../atlas/SpellSprite';
import { getModifier } from '../../../lib/npcGeneratorUtils';
import { getOrdinal, renderNameValue } from '../../../lib/dataUtils';
import { cn } from '../../../lib/utils';
import { Sparkles, Eye, CheckCircle2, Circle } from 'lucide-react';

export const SpellInventory: React.FC = () => {
  const { setFocusedItem } = useUIStore();
  const { castSpell, restoreSlots, prepareSpell, unprepareSpell } = useCharacterStore();
  const character = useActiveCharacter();

  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [inspectedSpell, setInspectedSpell] = useState<any | null>(null);

  if (!character) return null;

  const knownSpells = (character.knownSpells as any[]) || [];
  const preparedIndices = character.preparedSpells || [];

  // Calculate spellcasting metrics
  const spellAbility = character.spellcastingAbility || 'wis';
  const abilityMod = getModifier(character.stats[spellAbility as keyof typeof character.stats] || 10);
  const profBonus = Math.floor(2 + ((character.level || 1) - 1) / 4);
  const spellDC = 8 + abilityMod + profBonus;
  const attackBonus = abilityMod + profBonus;

  // Max prepared spells
  const maxPrepared = (character.level || 1) + abilityMod;

  // Group spells by level
  const spellsByLevel: Record<number, any[]> = {};
  knownSpells.forEach(spell => {
    const lvl = spell.level || 0;
    if (!spellsByLevel[lvl]) spellsByLevel[lvl] = [];
    spellsByLevel[lvl].push(spell);
  });

  const availableLevels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const displayedSpells = selectedLevelFilter === 'all'
    ? knownSpells
    : knownSpells.filter(s => (s.level || 0) === selectedLevelFilter);

  return (
    <div className="space-y-5">
      {/* Matrix Header & Quick Rest */}
      <div className="bg-stone-900/80 border border-dragon-gold/30 rounded-lg p-3 text-parchment-100 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-dragon-gold animate-pulse" />
            <h3 className="text-sm font-header font-black uppercase tracking-wider text-dragon-gold">
              Spellcasting Matrix
            </h3>
          </div>
          <button
            onClick={() => restoreSlots(true)}
            className="text-[9px] font-bold text-dragon-gold uppercase border border-dragon-gold/40 px-2.5 py-1 rounded bg-dragon-gold/10 hover:bg-dragon-gold/20 transition-all active:scale-95"
          >
            Long Rest (Restore)
          </button>
        </div>

        {/* Caster Stats Bar */}
        <div className="grid grid-cols-3 gap-2 bg-stone-950/60 p-2 rounded border border-parchment-500/10 text-center">
          <div>
            <span className="text-[7px] font-black uppercase text-parchment-400 block tracking-widest">Save DC</span>
            <span className="text-base font-header font-black text-dragon-gold">{spellDC}</span>
          </div>
          <div>
            <span className="text-[7px] font-black uppercase text-parchment-400 block tracking-widest">Attack Mod</span>
            <span className="text-base font-header font-black text-dragon-gold">+{attackBonus}</span>
          </div>
          <div>
            <span className="text-[7px] font-black uppercase text-parchment-400 block tracking-widest">Prepared</span>
            <span className={cn(
              "text-base font-header font-black",
              preparedIndices.length > maxPrepared ? "text-red-400" : "text-emerald-400"
            )}>
              {preparedIndices.length}/{maxPrepared}
            </span>
          </div>
        </div>

        {/* Spell Slots Display */}
        {character.spellSlots && Object.keys(character.spellSlots).length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-dragon-gold/20">
            <span className="text-[8px] font-bold uppercase tracking-widest text-parchment-400 block">Spell Slots</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(character.spellSlots).map(([lvl, slot]: [string, any]) => (
                <div key={lvl} className="flex items-center gap-1.5 bg-stone-950/80 px-2 py-1 rounded border border-dragon-gold/20">
                  <span className="text-[9px] font-black text-dragon-gold">L{lvl}:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: slot.max }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full border border-dragon-gold/40 transition-all",
                          i < slot.current ? "bg-dragon-gold shadow-[0_0_6px_rgba(212,175,55,0.8)]" : "bg-transparent"
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Level Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-parchment-300 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setSelectedLevelFilter('all')}
          className={cn(
            "px-2.5 py-1 text-[9px] font-bold uppercase rounded transition-all shrink-0",
            selectedLevelFilter === 'all'
              ? "bg-dragon-darkRed text-white shadow-sm"
              : "bg-parchment-200 text-parchment-700 hover:bg-parchment-300"
          )}
        >
          All ({knownSpells.length})
        </button>
        {availableLevels.map(lvl => (
          <button
            key={lvl}
            onClick={() => setSelectedLevelFilter(lvl)}
            className={cn(
              "px-2.5 py-1 text-[9px] font-bold uppercase rounded transition-all shrink-0",
              selectedLevelFilter === lvl
                ? "bg-dragon-darkRed text-white shadow-sm"
                : "bg-parchment-200 text-parchment-700 hover:bg-parchment-300"
            )}
          >
            {lvl === 0 ? 'Cantrips' : `Lvl ${lvl}`} ({spellsByLevel[lvl].length})
          </button>
        ))}
      </div>

      {/* Structured Spell Level Groups */}
      <div className="space-y-4">
        {displayedSpells.length === 0 ? (
          <div className="p-6 text-center text-parchment-500 italic text-xs bg-parchment-100/50 rounded border border-dashed border-parchment-300">
            No spells recorded in this level category.
          </div>
        ) : (
          availableLevels
            .filter(lvl => selectedLevelFilter === 'all' || selectedLevelFilter === lvl)
            .map(lvl => {
              const levelSpells = spellsByLevel[lvl] || [];
              if (levelSpells.length === 0) return null;

              return (
                <div key={lvl} className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-dragon-gold/30 pb-1">
                    <span className="text-xs font-header font-black text-dragon-darkRed uppercase tracking-wider">
                      {lvl === 0 ? 'Cantrips (0-Level)' : `${lvl}${getOrdinal(lvl)}-Level Spells`}
                    </span>
                    <span className="text-[9px] font-bold text-parchment-500">
                      ({levelSpells.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {levelSpells.map(spell => {
                      const isPrepared = preparedIndices.includes(spell.index);
                      const isCantrip = (spell.level || 0) === 0;

                      return (
                        <div
                          key={spell.index}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg border transition-all bg-white/60 hover:bg-white shadow-sm group",
                            isPrepared ? "border-emerald-600/50 bg-emerald-50/30" : "border-parchment-300"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Canonical Spell Sprite */}
                            <SpellSprite
                              spell={spell}
                              size={36}
                              alt={renderNameValue(spell.name)}
                              className="rounded border border-dragon-gold/30 shadow-sm shrink-0"
                            />

                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-dragon-darkRed truncate group-hover:text-dragon-red transition-colors">
                                {renderNameValue(spell.name)}
                              </span>
                              <span className="text-[9px] font-medium text-parchment-600 italic">
                                {renderNameValue(spell.school)} • {spell.casting_time || '1 Action'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Inspect Detail Button */}
                            <button
                              onClick={() => setInspectedSpell(spell)}
                              className="p-1.5 text-parchment-600 hover:text-dragon-darkRed hover:bg-parchment-200 rounded transition-colors"
                              title="Inspect Spell"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Memorize / Prepare Toggle for non-cantrips */}
                            {!isCantrip && (
                              <button
                                onClick={() => {
                                  if (isPrepared) unprepareSpell(spell.index);
                                  else prepareSpell(spell.index);
                                }}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase transition-all",
                                  isPrepared
                                    ? "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
                                    : "bg-parchment-200 text-parchment-700 hover:bg-parchment-300"
                                )}
                              >
                                {isPrepared ? (
                                  <>
                                    <CheckCircle2 size={10} />
                                    <span>Prepared</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle size={10} />
                                    <span>Prepare</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Modal / Inspection Card Overlay */}
      {inspectedSpell && (
        <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectedSpell(null)}
              className="absolute top-2 right-2 z-50 bg-stone-900 text-dragon-gold border border-dragon-gold/40 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black shadow-lg hover:scale-110 transition-transform"
            >
              ✕
            </button>
            <SpellCard spell={inspectedSpell} />
          </div>
        </div>
      )}
    </div>
  );
};
