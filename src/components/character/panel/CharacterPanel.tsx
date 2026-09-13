import React, { useState } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { CharacterPanelStats } from './CharacterPanelStats';
import { CharacterPanelTraits } from './CharacterPanelTraits';
import { CharacterPanelBio } from './CharacterPanelBio';
import { CharacterPanelSpells } from './CharacterPanelSpells';
import { EquipmentDoll } from '../equipment/EquipmentDoll';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { useUIStore } from '../../../store/useUIStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';

export type CharacterPanelTab = 'stats' | 'traits' | 'equipment' | 'spells' | 'bio';

export interface CharacterPanelProps {
  character: Partial<Character>;
  activeTab?: CharacterPanelTab;
  onTabChange?: (tab: CharacterPanelTab) => void;
  isEditable?: boolean;
  onUpdate?: (updates: Partial<Character>) => void;
  currentStep?: string;
  className?: string;
  hideTabs?: boolean;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({
  character,
  activeTab: propActiveTab,
  onTabChange,
  isEditable = false,
  onUpdate,
  currentStep,
  className,
  hideTabs = false
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<CharacterPanelTab>('stats');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;

  const handleTabClick = (tab: CharacterPanelTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };

  const { unequipItem, equipItem } = useInventoryStore();
  const { focusedItem } = useUIStore();

  if (!character) return null;

  const tabs: { id: CharacterPanelTab; label: string; icon: string }[] = [
    { id: 'stats', label: 'Stats', icon: 'chart' },
    { id: 'traits', label: 'Traits', icon: 'trait' },
    { id: 'equipment', label: 'Equipment', icon: 'equipment' },
    { id: 'spells', label: 'Spells', icon: 'magic_effect' },
    { id: 'bio', label: 'Bio', icon: 'pen_line' }
  ];

  return (
    <div className={cn("flex flex-col h-full w-full bg-white/40 border border-dragon-gold/30 rounded shadow-inner overflow-hidden", className)}>
      {/* Header Tabs */}
      {!hideTabs && (
        <div className="flex items-center gap-1 p-1 bg-white/70 border-b border-dragon-gold/30 shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded text-[9px] font-header font-black uppercase transition-all cursor-pointer",
                  isActive
                    ? "bg-dragon-red text-white shadow border border-dragon-gold/40"
                    : "bg-white/50 text-dragon-darkRed hover:bg-white/80 border border-dragon-gold/20"
                )}
              >
                <GameIcon name={tab.icon as any} size={11} color={isActive ? '#FFFFFF' : '#8B0000'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Tab Content Stage */}
      <div className="flex-1 p-2 overflow-y-auto custom-scrollbar relative">
        {activeTab === 'stats' && (
          <CharacterPanelStats character={character} currentStep={currentStep} />
        )}

        {activeTab === 'traits' && (
          <CharacterPanelTraits character={character} />
        )}

        {activeTab === 'equipment' && (
          <div className="h-full flex items-center justify-center p-2 bg-white/20 backdrop-blur-xs">
            <EquipmentDoll
              equippedItems={character.inventory || {}}
              equipment={character.equipment}
              items={character.items}
              onSlotClick={(slot) => {
                if (character.inventory?.[slot]) {
                  unequipItem(slot);
                } else if (focusedItem?._type === 'equipment') {
                  equipItem(focusedItem, slot);
                }
              }}
            />
          </div>
        )}

        {activeTab === 'spells' && (
          <CharacterPanelSpells character={character} isEditable={isEditable} />
        )}

        {activeTab === 'bio' && (
          <CharacterPanelBio
            character={character}
            onUpdate={onUpdate}
            isEditable={isEditable}
          />
        )}
      </div>
    </div>
  );
};
