import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { getEffectiveStats } from '../../../lib/statCalculations';
import { getModifier } from '../../../lib/npcGeneratorUtils';

interface CharacterPanelAbilitiesProps {
  character: Partial<Character>;
  className?: string;
}

const ABILITIES = [
  { key: 'str', label: 'STR', icon: 'strength' },
  { key: 'dex', label: 'DEX', icon: 'dexterity' },
  { key: 'con', label: 'CON', icon: 'constitution' },
  { key: 'int', label: 'INT', icon: 'intelligence' },
  { key: 'wis', label: 'WIS', icon: 'wisdom' },
  { key: 'cha', label: 'CHA', icon: 'charisma' }
] as const;

export const CharacterPanelAbilities: React.FC<CharacterPanelAbilitiesProps> = ({ character, className }) => {
  const effectiveStats = getEffectiveStats(character as Character);

  return (
    <div className={`w-full bg-white/60 backdrop-blur-md border border-dragon-gold/25 rounded-sm p-1 shadow-xs shrink-0 ${className || ''}`}>
      {/* 6 Compact Ability Score Cards */}
      <div className="grid grid-cols-6 gap-0.5 sm:gap-1 w-full">
        {ABILITIES.map(({ key, label, icon }) => {
          const score = (effectiveStats as any)[key] ?? 10;
          const mod = getModifier(score);
          const modText = mod >= 0 ? `+${mod}` : `${mod}`;

          return (
            <div
              key={key}
              className="relative flex flex-col items-center justify-between p-0.5 rounded min-w-0 border border-dragon-gold/30 overflow-hidden text-center aspect-[4/5] bg-contain bg-no-repeat bg-center bg-white/40 shadow-2xs"
              style={{
                backgroundImage: "url('/assets/ui/ability-score-tab-hc.svg')",
              }}
            >
              {/* Header Label */}
              <div className="relative z-10 flex items-center justify-center gap-0.5 mt-0.5">
                <GameIcon name={icon as any} size={8} color="#8B0000" className="shrink-0 opacity-80" />
                <span className="text-[7.5px] font-black uppercase text-parchment-800 leading-none">
                  {label}
                </span>
              </div>

              {/* Total Score Value */}
              <span className="relative z-10 text-[11px] font-header font-black text-dragon-darkRed leading-none my-0.5">
                {score}
              </span>

              {/* Modifier Value */}
              <span className="relative z-10 text-[7.5px] font-black text-parchment-700 leading-none mb-0.5">
                {modText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
