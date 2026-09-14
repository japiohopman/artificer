import React, { useState } from 'react';
import { Character, useCharacterStore } from '../../../store/useCharacterStore';
import { calculateMaxSpellSlots, calculateDerivedStats } from '../../../lib/character';
import { GameIcon } from '../../../game_icons';
import { SpellSheet } from '../../atlas/SpellSheet';
import { soundService } from '../../../services/soundService';
import { cn } from '../../../lib/utils';

export interface CharacterPanelSpellsProps {
  character: Partial<Character>;
  isEditable?: boolean;
}

export const CharacterPanelSpells: React.FC<CharacterPanelSpellsProps> = ({ character, isEditable }) => {
  const [inspectedSpell, setInspectedSpell] = useState<any | null>(null);

  const { castSpell, restoreSlots } = useCharacterStore();

  const derived = calculateDerivedStats(character as Character);
  const maxSpellSlots = calculateMaxSpellSlots(character as Character);
  const spellSlotEntries = Object.entries(maxSpellSlots).sort(([a], [b]) => Number(a) - Number(b));

  const knownSpells = character.knownSpells || [];
  const cantrips = knownSpells.filter(s => Number(s.level || 0) === 0);
  const leveledSpells = knownSpells.filter(s => Number(s.level || 0) > 0);

  const preparedSpellIndices = character.preparedSpells || [];

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar p-2 bg-white/40 backdrop-blur-sm rounded border border-dragon-gold/20">
      {/* Header / Spellcasting Vitals */}
      <div className="flex items-center justify-between border-b border-dragon-gold/30 pb-2">
        <div className="flex items-center gap-2">
          <GameIcon name="magic_effect" size={16} color="#8B0000" />
          <h3 className="text-xs font-header font-black text-dragon-darkRed uppercase tracking-wider">
            Arcane Matrix & Spell Slots
          </h3>
        </div>

        {character.id && (
          <button
            type="button"
            onClick={() => {
              restoreSlots(true);
              soundService.playEffect('UI_CLICK_LIGHT');
            }}
            className="text-[9px] font-black text-dragon-red hover:text-dragon-darkRed uppercase tracking-widest flex items-center gap-1 bg-dragon-red/10 px-2 py-0.5 rounded border border-dragon-red/20 transition-all"
            title="Restore all spell slots"
          >
            <GameIcon name="magic_effect" size={10} />
            Long Rest
          </button>
        )}
      </div>

      {/* Spellcasting DC & Attack Bonus */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 text-center">
          <span className="text-[7px] font-black text-parchment-500 uppercase tracking-widest block">Spell Save DC</span>
          <span className="text-sm font-header font-black text-dragon-darkRed">{derived.spellSaveDC}</span>
        </div>
        <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 text-center">
          <span className="text-[7px] font-black text-parchment-500 uppercase tracking-widest block">Spell Atk Bonus</span>
          <span className="text-sm font-header font-black text-dragon-darkRed">{derived.spellAttackBonus >= 0 ? '+' : ''}{derived.spellAttackBonus}</span>
        </div>
        <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 text-center">
          <span className="text-[7px] font-black text-parchment-500 uppercase tracking-widest block">Ability</span>
          <span className="text-xs font-header font-black text-dragon-darkRed uppercase">{character.spellcastingAbility || 'WIS'}</span>
        </div>
      </div>

      {/* SPELL SLOTS RESOURCE UI */}
      {spellSlotEntries.length > 0 ? (
        <div className="bg-white/60 p-2.5 rounded border border-dragon-gold/20 space-y-2">
          <span className="text-[8px] font-black uppercase text-dragon-red tracking-widest block">
            Spell Slot Availability
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {spellSlotEntries.map(([levelStr, max]) => {
              const level = Number(levelStr);
              const currentSlot = (character.spellSlots?.[levelStr] as any)?.current ?? max;

              return (
                <div key={levelStr} className="flex items-center justify-between p-1.5 rounded bg-parchment-50 border border-dragon-gold/30">
                  <span className="text-[9px] font-black uppercase text-dragon-darkRed">
                    Level {level}
                  </span>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: max }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full border transition-colors shadow-xs",
                          i < (typeof currentSlot === 'number' ? currentSlot : 0)
                            ? "bg-dragon-red border-dragon-darkRed shadow-[0_0_6px_rgba(139,0,0,0.5)]"
                            : "bg-parchment-200 border-parchment-400 opacity-30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-[10px] italic text-parchment-500 text-center py-2 bg-white/40 rounded border border-dragon-gold/10">
          Non-spellcaster or no spell slots at current level.
        </div>
      )}

      {/* Cantrips Section */}
      <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase text-dragon-darkRed tracking-widest">
            Cantrips Known ({cantrips.length})
          </span>
        </div>

        {cantrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-1">
            {cantrips.map((s, i) => (
              <SpellRow
                key={s.index || s.name || i}
                spell={s}
                ruleset={character.ruleset}
                onInspect={() => setInspectedSpell(s)}
              />
            ))}
          </div>
        ) : (
          <p className="text-[10px] italic text-parchment-500">No cantrips recorded.</p>
        )}
      </div>

      {/* Leveled Spells Section */}
      <div className="bg-white/60 p-2 rounded border border-dragon-gold/20 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase text-dragon-darkRed tracking-widest">
            Spells Known / Prepared ({leveledSpells.length})
          </span>
        </div>

        {leveledSpells.length > 0 ? (
          <div className="grid grid-cols-1 gap-1">
            {leveledSpells.map((s, i) => {
              const isPrepared = preparedSpellIndices.includes(s.index);
              return (
                <SpellRow
                  key={s.index || s.name || i}
                  spell={s}
                  ruleset={character.ruleset}
                  isPrepared={isPrepared}
                  onInspect={() => setInspectedSpell(s)}
                  onCast={character.id ? () => castSpell(s.index, Number(s.level || 1)) : undefined}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] italic text-parchment-500">No leveled spells recorded.</p>
        )}
      </div>

      {/* INSPECTION MODAL */}
      {inspectedSpell && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setInspectedSpell(null)}
        >
          <div
            className="relative flex flex-col items-center max-w-full max-h-full overflow-y-auto custom-scrollbar p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectedSpell(null)}
              className="self-end mb-2 px-3 py-1 bg-stone-900/90 text-dragon-gold hover:text-white border border-dragon-gold/40 rounded text-xs font-black uppercase tracking-wider shadow"
            >
              Close Sheet
            </button>

            <SpellSheet
              spell={inspectedSpell}
              ruleset={character.ruleset}
              hideLearnButton={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const SpellRow: React.FC<{
  spell: any;
  ruleset?: '2014' | '2024';
  isPrepared?: boolean;
  onInspect: () => void;
  onCast?: () => void;
}> = ({ spell, ruleset, isPrepared, onInspect, onCast }) => (
  <div className="flex items-center justify-between p-1.5 rounded bg-parchment-50 border border-dragon-gold/20 hover:border-dragon-red/30 transition-all">
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] font-black uppercase text-dragon-darkRed truncate">
        {spell.name}
      </span>
      {isPrepared && (
        <span className="text-[7px] font-black uppercase bg-dragon-gold/20 text-dragon-darkRed px-1 rounded border border-dragon-gold/30">
          Prep
        </span>
      )}
      <span className="text-[8px] font-bold text-parchment-500 uppercase">
        {Number(spell.level || 0) === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
      </span>
    </div>

    <div className="flex items-center gap-1.5">
      {onCast && (
        <button
          type="button"
          onClick={onCast}
          className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-dragon-red text-white hover:bg-dragon-darkRed rounded transition-colors"
        >
          Cast
        </button>
      )}
      <button
        type="button"
        onClick={onInspect}
        className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-dragon-gold/20 text-dragon-darkRed hover:bg-dragon-gold/40 rounded border border-dragon-gold/30 transition-colors"
      >
        Sheet
      </button>
    </div>
  </div>
);
