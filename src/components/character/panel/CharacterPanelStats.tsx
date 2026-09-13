import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { calculateDerivedStats, getEffectiveStats } from '../../../lib/statCalculations';
import { CharacterPanelBody } from './CharacterPanelBody';
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
  currentStep,
  className,
  variant = 'full'
}) => {
  if (!character) return null;

  const derivedStats = calculateDerivedStats(character as Character);
  const effectiveStats = getEffectiveStats(character as Character);

  const speedText = character.race ? `${derivedStats.speed} FT` : '—';
  const initiativeText = derivedStats.initiative >= 0 ? `+${derivedStats.initiative}` : `${derivedStats.initiative}`;
  const acText = `${derivedStats.ac}`;
  const hpVal = character.hp ?? character.maxHp;
  const hpText = hpVal ? `${hpVal}` : '—';
  const maxHpVal = character.maxHp ?? hpVal ?? 0;
  const hpPercent = maxHpVal > 0 && hpVal ? Math.min(100, Math.max(0, (hpVal / maxHpVal) * 100)) : 100;

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="shield" size={14} color="#8B0000" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">AC</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{derivedStats.ac}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="weapon" size={14} color="#8B0000" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">ATK</span>
              <span className="text-[12px] font-header font-black text-white leading-none">
                {derivedStats.attackBonus >= 0 ? `+${derivedStats.attackBonus}` : derivedStats.attackBonus}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="lightning" size={14} color="#8B0000" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">INIT</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{initiativeText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="heart" size={14} color="#8B0000" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">HP</span>
              <span className="text-[12px] font-header font-black text-white leading-none">
                {hpText}/{maxHpVal || hpText}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="wind" size={14} color="#8B0000" />
            <div className="flex flex-col">
              <span className="text-[7px] text-stone-400 font-black uppercase leading-none mb-0.5">SPD</span>
              <span className="text-[12px] font-header font-black text-white leading-none">{speedText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-2 rounded border border-white/5">
            <GameIcon name="magic_effect" size={14} color="#8B0000" />
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
    <div className={cn("flex flex-col gap-3 w-full h-full", className)}>
      {/* Primary Character Stage (Body Silhouette + Overlays) */}
      <div className="relative flex-1 min-h-[240px] flex items-center justify-center overflow-hidden rounded-sm bg-white/20 border border-dragon-gold/20 p-1">
        <CharacterPanelBody character={character} currentStep={currentStep} />

        {/* Left Identity Context Badges */}
        <div className="absolute left-2 top-3 z-20 flex flex-col gap-1.5 max-w-[130px] pointer-events-none">
          {character.race && (
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
              <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Species</span>
              <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                {character.race.replace(/-/g, ' ')}
              </span>
            </div>
          )}
          {character.class && (
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
              <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Class</span>
              <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                {character.class}{character.subclass ? ` (${character.subclass})` : ''}
              </span>
            </div>
          )}
          {character.background && (
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
              <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Background</span>
              <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                {character.background.replace(/-/g, ' ')}
              </span>
            </div>
          )}
          {character.alignment && (
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
              <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Alignment</span>
              <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                {character.alignment.replace(/-/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Right Combat Metrics Column */}
        <div className="absolute right-2 top-3 z-20 flex flex-col gap-1.5 pointer-events-none items-end min-w-[75px]">
          {/* HP Metric */}
          <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 w-full justify-between">
            <GameIcon name="heart" size={13} color="#8B0000" className="shrink-0" />
            <span className="text-[10px] font-header font-black text-dragon-darkRed">{hpText}</span>
          </div>

          {/* Speed Metric */}
          <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 w-full justify-between">
            <GameIcon name="wind" size={13} color="#8B0000" className="shrink-0" />
            <span className="text-[10px] font-header font-black text-dragon-darkRed">{speedText}</span>
          </div>

          {/* AC Metric */}
          <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 w-full justify-between">
            <GameIcon name="shield" size={13} color="#D4AF37" className="shrink-0" />
            <span className="text-[10px] font-header font-black text-dragon-darkRed">{acText}</span>
          </div>

          {/* Initiative Metric */}
          <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 w-full justify-between">
            <GameIcon name="lightning" size={13} color="#8B0000" className="shrink-0" />
            <span className="text-[10px] font-header font-black text-dragon-darkRed">{initiativeText}</span>
          </div>

          {/* Proficiency Bonus Metric */}
          <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 w-full justify-between">
            <GameIcon name="magic_effect" size={13} color="#D4AF37" className="shrink-0" />
            <span className="text-[10px] font-header font-black text-dragon-darkRed">+{derivedStats.proficiencyBonus}</span>
          </div>
        </div>
      </div>

      {/* Ability Score Strip */}
      <CharacterPanelAbilities character={character} />
    </div>
  );
};
