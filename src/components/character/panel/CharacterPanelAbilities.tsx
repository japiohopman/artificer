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
    <div className={`w-full bg-white/70 backdrop-blur-md border border-dragon-gold/30 rounded-sm p-2 shadow-sm shrink-0 ${className || ''}`}>
      <span className="text-[8px] font-black uppercase text-dragon-red tracking-widest block text-center mb-1">
        Attribute Matrix
      </span>

      {/* 6 Horizontal Ability Score Tabs */}
      <div className="grid grid-cols-6 gap-1 w-full">
        {ABILITIES.map(({ key, label, icon }) => {
          const score = (effectiveStats as any)[key] ?? 10;
          const mod = getModifier(score);
          const modText = mod >= 0 ? `+${mod}` : `${mod}`;

          return (
            <div
              key={key}
              className="relative flex flex-col items-center justify-between p-1 rounded min-w-0 border border-dragon-gold/20 overflow-hidden text-center aspect-[4/5] bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: "url('/assets/ui/ability-score-tab-hc.svg')",
              }}
            >
              {/* Header Label */}
              <div className="relative z-10 flex items-center justify-center gap-0.5 mt-0.5">
                <GameIcon name={icon as any} size={9} color="#8B0000" className="shrink-0 opacity-80" />
                <span className="text-[8px] font-black uppercase text-parchment-700 leading-none">
                  {label}
                </span>
              </div>

              {/* Total Score Value */}
              <span className="relative z-10 text-[12px] font-header font-black text-dragon-darkRed leading-none my-0.5">
                {score}
              </span>

              {/* Modifier Value */}
              <span className="relative z-10 text-[8px] font-black text-parchment-600 leading-none mb-0.5">
                {modText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
