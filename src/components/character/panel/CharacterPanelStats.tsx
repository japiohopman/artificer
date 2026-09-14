import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { calculateDerivedStats } from '../../../lib/statCalculations';
import { CharacterPanelAbilities } from './CharacterPanelAbilities';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';

export interface CharacterPanelStatsProps {
  character: Partial<Character>;
  currentStep?: string;
  className?: string;
  variant?: 'full' | 'compact';
}

export const CharacterPanelStats: React.FC<CharacterPanelStatsProps> = ({
  character,
  className,
  variant = 'full'
}) => {
  if (!character) return null;

  const derivedStats = calculateDerivedStats(character as Character);

  const speedText = character.race ? `${derivedStats.speed} FT` : '—';
  const initiativeText = derivedStats.initiative >= 0 ? `+${derivedStats.initiative}` : `${derivedStats.initiative}`;
  const acText = `${derivedStats.ac}`;
  const attackBonusText = derivedStats.attackBonus >= 0 ? `+${derivedStats.attackBonus}` : `${derivedStats.attackBonus}`;
  const spellAtkText = derivedStats.spellAttackBonus >= 0 ? `+${derivedStats.spellAttackBonus}` : `${derivedStats.spellAttackBonus}`;

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="shield" size={14} color="#D4AF37" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">AC</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{derivedStats.ac}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="weapon" size={14} color="#ec597a" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">ATK</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{attackBonusText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="lightning" size={14} color="#ec597a" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">INIT</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{initiativeText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="wind" size={14} color="#ec597a" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">SPD</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{speedText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="magic_effect" size={14} color="#D4AF37" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">PROF</span>
              <span className="text-[12px] font-header font-black text-white leading-none">+{derivedStats.proficiencyBonus}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="eye" size={14} color="#D4AF37" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">PERC</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{derivedStats.passivePerception}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 z-20 flex flex-col justify-between p-1.5 pointer-events-none", className)}>
      {/* Right Column: Floating Combat Readiness Metrics Overlay */}
      <div className="flex justify-end w-full">
        <div className="flex flex-col gap-1 pointer-events-auto items-end min-w-[80px] sm:min-w-[90px] bg-white/70 backdrop-blur-xs p-1 rounded border border-dragon-gold/25 shadow-xs">
          {/* Armor Class */}
          <div className="bg-white/90 border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-2xs flex items-center gap-1 w-full justify-between">
            <GameIcon name="shield" size={10} color="#D4AF37" className="shrink-0" />
            <span className="text-[8.5px] font-header font-black text-dragon-darkRed leading-none">{acText} AC</span>
          </div>

          {/* Speed */}
          <div className="bg-white/90 border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-2xs flex items-center gap-1 w-full justify-between">
            <GameIcon name="wind" size={10} color="#ec597a" className="shrink-0" />
            <span className="text-[8.5px] font-header font-black text-dragon-darkRed leading-none">{speedText}</span>
          </div>

          {/* Initiative */}
          <div className="bg-white/90 border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-2xs flex items-center gap-1 w-full justify-between">
            <GameIcon name="lightning" size={10} color="#ec597a" className="shrink-0" />
            <span className="text-[8.5px] font-header font-black text-dragon-darkRed leading-none">{initiativeText} INIT</span>
          </div>

          {/* Proficiency Bonus */}
          <div className="bg-white/90 border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-2xs flex items-center gap-1 w-full justify-between">
            <GameIcon name="magic_effect" size={10} color="#D4AF37" className="shrink-0" />
            <span className="text-[8.5px] font-header font-black text-dragon-darkRed leading-none">+{derivedStats.proficiencyBonus} PROF</span>
          </div>

          {/* Attack Bonus */}
          <div className="bg-white/90 border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-2xs flex items-center gap-1 w-full justify-between">
            <GameIcon name="weapon" size={10} color="#ec597a" className="shrink-0" />
            <span className="text-[8.5px] font-header font-black text-dragon-darkRed leading-none">{attackBonusText} ATK</span>
          </div>

          {/* Passive Perception */}
          <div className="bg-white/90 border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-2xs flex items-center gap-1 w-full justify-between">
            <GameIcon name="eye" size={10} color="#D4AF37" className="shrink-0" />
            <span className="text-[8.5px] font-header font-black text-dragon-darkRed leading-none">{derivedStats.passivePerception} PERC</span>
          </div>

          {/* Spellcasting DC / Atk if spellcaster */}
          {derivedStats.spellSaveDC > 8 && (
            <div className="bg-white/90 border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-2xs flex items-center gap-1 w-full justify-between">
              <GameIcon name="magic_effect" size={10} color="#8B0000" className="shrink-0" />
              <span className="text-[8.5px] font-header font-black text-dragon-darkRed leading-none">DC {derivedStats.spellSaveDC} ({spellAtkText})</span>
            </div>
          )}
        </div>
      </div>

      {/* Ability Scores Strip anchored at bottom of mirror stage */}
      <div className="pointer-events-auto shrink-0 w-full mt-auto">
        <CharacterPanelAbilities character={character} />
      </div>
    </div>
  );
};
