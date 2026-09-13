import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { calculateDerivedStats } from '../../../lib/statCalculations';
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
  const hpVal = character.hp ?? character.maxHp;
  const hpText = hpVal ? `${hpVal}` : '—';
  const maxHpVal = character.maxHp ?? hpVal ?? 0;

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
              <span className="text-[12px] font-header font-black text-white leading-none">
                {derivedStats.attackBonus >= 0 ? `+${derivedStats.attackBonus}` : derivedStats.attackBonus}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="lightning" size={14} color="#ec597a" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">INIT</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{initiativeText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#ec597a]/15 p-2 rounded border border-[#ec597a]/30">
            <GameIcon name="heart" size={14} color="#ec597a" />
            <div className="flex flex-col">
              <span className="text-[7px] text-[#ec597a] font-black uppercase leading-none mb-0.5">HP</span>
              <span className="text-[12px] font-header font-black text-[#ec597a] leading-none">
                {hpText}/{maxHpVal || hpText}
              </span>
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
        </div>
      </div>
    );
  }

  return (
    <div className={cn("absolute right-2 top-2 z-20 flex flex-col gap-1 pointer-events-none items-end min-w-[75px]", className)}>
      {/* Prominent HP Treatment Badge */}
      <div className="bg-[#ec597a]/90 backdrop-blur-md border border-white/40 rounded px-2 py-1 shadow-md flex items-center gap-1.5 w-full justify-between text-white">
        <GameIcon name="heart" size={13} color="#FFFFFF" className="shrink-0 animate-pulse" />
        <span className="text-[10px] font-header font-black text-white">{hpText} HP</span>
      </div>

      {/* AC Badge */}
      <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-xs flex items-center gap-1 w-full justify-between">
        <GameIcon name="shield" size={11} color="#D4AF37" className="shrink-0" />
        <span className="text-[9px] font-header font-black text-dragon-darkRed">{acText} AC</span>
      </div>

      {/* Speed Badge */}
      <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-xs flex items-center gap-1 w-full justify-between">
        <GameIcon name="wind" size={11} color="#ec597a" className="shrink-0" />
        <span className="text-[9px] font-header font-black text-dragon-darkRed">{speedText}</span>
      </div>

      {/* Initiative Badge */}
      <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-xs flex items-center gap-1 w-full justify-between">
        <GameIcon name="lightning" size={11} color="#ec597a" className="shrink-0" />
        <span className="text-[9px] font-header font-black text-dragon-darkRed">{initiativeText} INIT</span>
      </div>

      {/* Proficiency Bonus Badge */}
      <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-1.5 py-0.5 shadow-xs flex items-center gap-1 w-full justify-between">
        <GameIcon name="magic_effect" size={11} color="#D4AF37" className="shrink-0" />
        <span className="text-[9px] font-header font-black text-dragon-darkRed">+{derivedStats.proficiencyBonus} PROF</span>
      </div>
    </div>
  );
};
