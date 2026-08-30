import React from 'react';
import { Character } from '../../../../store/useCharacterStore';
import { GameIcon } from '../../../../game_icons';

interface CharacterMirrorAbilitiesProps {
  newChar: Partial<Character>;
}

const SPECIES_BONUSES_MAP: Record<string, Record<string, number>> = {
  'human': { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
  'elf': { dex: 2 },
  'high-elf': { dex: 2, int: 1 },
  'wood-elf': { dex: 2, wis: 1 },
  'drow': { dex: 2, cha: 1 },
  'dwarf': { con: 2 },
  'hill-dwarf': { con: 2, wis: 1 },
  'mountain-dwarf': { str: 2, con: 2 },
  'halfling': { dex: 2 },
  'lightfoot-halfling': { dex: 2, cha: 1 },
  'stout-halfling': { dex: 2, con: 1 },
  'dragonborn': { str: 2, cha: 1 },
  'gnome': { int: 2 },
  'forest-gnome': { int: 2, dex: 1 },
  'rock-gnome': { int: 2, con: 1 },
  'half-elf': { cha: 2 },
  'half-orc': { str: 2, con: 1 },
  'tiefling': { int: 1, cha: 2 }
};

const ABILITIES = [
  { key: 'str', label: 'STR', icon: 'strength' },
  { key: 'dex', label: 'DEX', icon: 'dexterity' },
  { key: 'con', label: 'CON', icon: 'constitution' },
  { key: 'int', label: 'INT', icon: 'intelligence' },
  { key: 'wis', label: 'WIS', icon: 'wisdom' },
  { key: 'cha', label: 'CHA', icon: 'charisma' }
] as const;

export const CharacterMirrorAbilities: React.FC<CharacterMirrorAbilitiesProps> = ({ newChar }) => {
  const baseStats = newChar.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  // Calculate species ability bonuses
  const speciesKey = newChar.subrace?.toLowerCase() || newChar.race?.toLowerCase() || '';
  const bonuses = SPECIES_BONUSES_MAP[speciesKey] || (newChar.race ? SPECIES_BONUSES_MAP[newChar.race.toLowerCase()] : {}) || {};

  return (
    <div className="w-full bg-white/70 backdrop-blur-md border border-dragon-gold/30 rounded-sm p-2 shadow-sm">
      <span className="text-[8px] font-black uppercase text-dragon-red tracking-widest block text-center mb-1.5">
        Attribute Matrix
      </span>

      {/* 6 Horizontal Ability Score Tabs */}
      <div className="grid grid-cols-6 gap-1 w-full">
        {ABILITIES.map(({ key, label, icon }) => {
          const baseVal = (baseStats as any)[key] ?? 10;
          const bonusVal = bonuses[key] || 0;
          const totalVal = baseVal + bonusVal;

          return (
            <div
              key={key}
              className="relative flex flex-col items-center justify-between p-1 rounded min-w-0 border border-dragon-gold/20 overflow-hidden text-center group"
              style={{
                backgroundImage: "url('/assets/ui/ability-score-tab-hc.svg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="relative z-10 flex items-center justify-center gap-0.5 mt-0.5">
                <GameIcon name={icon as any} size={10} color="#8B0000" className="shrink-0 opacity-80" />
                <span className="text-[8px] font-black uppercase text-parchment-700 leading-none">
                  {label}
                </span>
              </div>

              <span className="relative z-10 text-[12px] font-header font-black text-dragon-darkRed leading-tight my-0.5">
                {totalVal}
              </span>

              {bonusVal > 0 && (
                <span className="relative z-10 text-[7px] font-black text-dragon-red leading-none mb-0.5">
                  +{bonusVal}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
