import React from 'react';
import { Character } from '../../../../store/useCharacterStore';
import { GameIcon } from '../../../../game_icons';
import { CharacterMirrorBody } from './CharacterMirrorBody';
import { CharacterMirrorMetrics } from './CharacterMirrorMetrics';
import { CharacterMirrorAbilities } from './CharacterMirrorAbilities';

interface CharacterMirrorProps {
  newChar: Partial<Character>;
  currentStep: string;
}

export const CharacterMirror: React.FC<CharacterMirrorProps> = ({ newChar, currentStep }) => {
  return (
    <div className="w-80 lg:w-96 border-l border-dragon-gold/20 bg-white/30 flex flex-col relative overflow-hidden shrink-0 shadow-inner h-full">
      {/* Background Paper Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 flex-1 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
        {/* Header Title Block */}
        <div className="space-y-1 border-b border-dragon-gold/30 pb-2.5 bg-white/60 backdrop-blur-sm p-3 rounded-sm shadow-sm shrink-0">
          <span className="text-[9px] font-black uppercase text-dragon-red tracking-[0.3em] block">
            Manifest Frame
          </span>
          <h2 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-tight flex items-center gap-2 truncate">
            <GameIcon name="identity" size={18} color="#991B1B" />
            {newChar.name && newChar.name.trim() ? newChar.name : 'Unmanifested Hero'}
          </h2>
          <span className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest block">
            Ruleset: {newChar.ruleset === '2024' ? 'D&D 5.5e (2024)' : 'D&D 5e (2014)'}
          </span>
        </div>

        {/* Central Visual Body & Background Area */}
        <div className="my-2 flex-1 relative min-h-[220px] flex flex-col justify-center">
          <CharacterMirrorBody newChar={newChar} currentStep={currentStep} />
        </div>

        {/* Metric Strip (HP, AC, Speed, Initiative) */}
        <CharacterMirrorMetrics newChar={newChar} />

        {/* Bottom Ability Score Strip (STR, DEX, CON, INT, WIS, CHA) */}
        <CharacterMirrorAbilities newChar={newChar} />
      </div>
    </div>
  );
};
