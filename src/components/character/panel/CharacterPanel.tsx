import React, { useState } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { calculateDerivedStats } from '../../../lib/statCalculations';
import { CharacterPanelBody } from './CharacterPanelBody';
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

  const derived = calculateDerivedStats(character as Character);
  const hpVal = character.hp ?? character.maxHp;
  const maxHpVal = character.maxHp ?? hpVal ?? 0;
  const hpPercent = maxHpVal > 0 && hpVal ? Math.min(100, Math.max(0, (hpVal / maxHpVal) * 100)) : 100;

  const tabs: { id: CharacterPanelTab; label: string; icon: string }[] = [
    { id: 'stats', label: 'Stats', icon: 'chart' },
    { id: 'traits', label: 'Traits', icon: 'trait' },
    { id: 'equipment', label: 'Equipment', icon: 'equipment' },
    { id: 'spells', label: 'Spells', icon: 'magic_effect' },
    { id: 'bio', label: 'Bio', icon: 'pen_line' }
  ];

  return (
    <div className={cn("flex flex-col h-full w-full bg-white/40 border border-dragon-gold/30 rounded shadow-inner overflow-hidden", className)}>
      {/* Consolidated Identity & Vitals Header */}
      <div className="p-2 sm:p-2.5 bg-white/70 backdrop-blur-sm border-b border-dragon-gold/30 shrink-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-header font-black text-dragon-darkRed uppercase tracking-tight truncate leading-tight">
              {character.name && character.name.trim() ? character.name : 'Unmanifested Hero'}
            </h2>
            <p className="text-[8px] sm:text-[9px] font-bold text-parchment-600 uppercase tracking-widest truncate">
              {character.class || 'Adventurer'}{character.subclass ? ` (${character.subclass})` : ''} {character.race ? `• ${character.race.replace(/-/g, ' ')}` : ''} • Lvl {character.level || 1}
            </p>
          </div>

          {/* Prominent Health Treatment (#ec597a accent) */}
          <div className="flex items-center gap-2 bg-[#ec597a]/10 border border-[#ec597a]/30 px-2.5 py-1 rounded shadow-xs shrink-0">
            <GameIcon name="heart" size={16} color="#ec597a" className="shrink-0 animate-pulse" />
            <div className="flex flex-col items-end leading-none">
              <span className="text-[11px] font-header font-black text-[#ec597a]">
                {hpVal ?? '—'} / {maxHpVal || '—'}
              </span>
              <span className="text-[6px] font-black uppercase text-parchment-500 tracking-wider mt-0.5">
                Hit Points
              </span>
            </div>
          </div>
        </div>

        {/* Compact HP Progress Bar */}
        <div className="h-1 w-full bg-stone-900/10 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-[#ec597a] transition-all duration-500 rounded-full"
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Tab Navigation */}
        {!hideTabs && (
          <div className="flex items-center gap-1 pt-1 border-t border-dragon-gold/20">
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
      </div>

      {/* PERSISTENT CHARACTER MIRROR STAGE */}
      <div className="relative flex-1 w-full min-h-[260px] overflow-hidden">
        {/* Persistent Mirror Body Silhouette & Background Environment (Z-0) */}
        <CharacterPanelBody character={character} currentStep={currentStep} />

        {/* STATS TAB OVERLAY (Z-20) */}
        {activeTab === 'stats' && (
          <CharacterPanelStats character={character} currentStep={currentStep} />
        )}

        {/* TRAITS TAB OVERLAY (Z-30) */}
        {activeTab === 'traits' && (
          <div className="absolute inset-x-1 top-1 bottom-1 z-30 p-1 overflow-y-auto custom-scrollbar bg-white/85 backdrop-blur-xs rounded border border-dragon-gold/30">
            <CharacterPanelTraits character={character} />
          </div>
        )}

        {/* EQUIPMENT TAB OVERLAY (Z-30) */}
        {activeTab === 'equipment' && (
          <div className="absolute inset-x-1 top-1 bottom-1 z-30 flex items-center justify-center p-1 bg-white/60 backdrop-blur-xs rounded border border-dragon-gold/30">
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

        {/* SPELLS TAB OVERLAY (Z-30) */}
        {activeTab === 'spells' && (
          <div className="absolute inset-x-1 top-1 bottom-1 z-30 p-1 overflow-y-auto custom-scrollbar bg-white/85 backdrop-blur-xs rounded border border-dragon-gold/30">
            <CharacterPanelSpells character={character} isEditable={isEditable} />
          </div>
        )}

        {/* BIO TAB OVERLAY (Z-30) */}
        {activeTab === 'bio' && (
          <div className="absolute inset-x-1 top-1 bottom-1 z-30 p-1 overflow-y-auto custom-scrollbar bg-white/85 backdrop-blur-xs rounded border border-dragon-gold/30">
            <CharacterPanelBio
              character={character}
              onUpdate={onUpdate}
              isEditable={isEditable}
            />
          </div>
        )}
      </div>
    </div>
  );
};
