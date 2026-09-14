import React, { useState, useEffect } from 'react';
import { Character } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { CharacterPanel, CharacterPanelTab } from './panel/CharacterPanel';

interface CreatorRightPanelProps {
  newChar: Partial<Character>;
  currentStep: string;
}

export function getDefaultCharacterPanelTab(step: string): CharacterPanelTab {
  switch (step) {
    case 'class':
      return 'traits';
    case 'spells':
      return 'spells';
    case 'equipment':
      return 'equipment';
    case 'backstory':
      return 'bio';
    case 'species':
    default:
      return 'stats';
  }
}

export const CreatorRightPanel: React.FC<CreatorRightPanelProps> = ({ newChar, currentStep }) => {
  const [activeTab, setActiveTab] = useState<CharacterPanelTab>(() => getDefaultCharacterPanelTab(currentStep));

  // Automatically adjust active tab when creation step changes
  useEffect(() => {
    setActiveTab(getDefaultCharacterPanelTab(currentStep));
  }, [currentStep]);

  return (
    <div className="w-80 sm:w-96 border-l border-dragon-gold/20 bg-white/30 flex flex-col relative overflow-hidden shrink-0 shadow-inner h-full">
      {/* Background Paper Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 flex-1 p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar h-full gap-2">
        {/* Top Header Card */}
        <div className="space-y-1.5 border-b border-dragon-gold/30 pb-2 bg-white/60 backdrop-blur-sm p-3 rounded-sm shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-dragon-red tracking-[0.3em] block">
              Manifest Frame
            </span>
            <span className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest block">
              {newChar.ruleset === '2024' ? 'D&D 5.5e (2024)' : 'D&D 5e (2014)'}
            </span>
          </div>

          <h2 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-tight flex items-center gap-2 truncate">
            <GameIcon name="identity" size={18} color="#991B1B" />
            {newChar.name && newChar.name.trim() ? newChar.name : 'Unmanifested Hero'}
          </h2>
        </div>

        {/* Central Stage: Canonical Character Panel */}
        <div className="flex-1 my-1 min-h-[300px]">
          <CharacterPanel
            character={newChar}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
};
