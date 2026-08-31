import React, { useState, useEffect } from 'react';
import { Character } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { calculateDerivedStats } from '../../lib/statCalculations';
import { CharacterPanelBody } from './panel/CharacterPanelBody';
import { CharacterPanelAbilities } from './panel/CharacterPanelAbilities';
import { CharacterPanelTraits } from './panel/CharacterPanelTraits';
import { CharacterPanelBio } from './panel/CharacterPanelBio';
import { EquipmentDoll } from './equipment/EquipmentDoll';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useUIStore } from '../../store/useUIStore';

interface CreatorRightPanelProps {
  newChar: Partial<Character>;
  currentStep: string;
}

export type CharacterPanelTab = 'stats' | 'traits' | 'bio' | 'equipment';

export function getDefaultCharacterPanelTab(step: string): CharacterPanelTab {
  switch (step) {
    case 'class':
      return 'traits';
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

  const { unequipItem, equipItem } = useInventoryStore();
  const { focusedItem } = useUIStore();

  // Tabs availability
  const hasClassSelected = !!newChar.class;
  const isEquipmentStep = currentStep === 'equipment';

  // Automatically adjust default active tab when step changes if player hasn't locked tab
  useEffect(() => {
    setActiveTab(getDefaultCharacterPanelTab(currentStep));
  }, [currentStep]);

  // Calculate canonical derived stats (AC, Speed, HP, Initiative)
  const derivedStats = calculateDerivedStats(newChar as Character);

  const speedText = newChar.race ? `${derivedStats.speed} FT` : '—';
  const initiativeText = derivedStats.initiative >= 0 ? `+${derivedStats.initiative}` : `${derivedStats.initiative}`;
  const acText = `${derivedStats.ac}`;
  const hpVal = newChar.hp ?? newChar.maxHp;
  const hpText = hpVal ? `${hpVal}` : '—';

  return (
    <div className="w-80 lg:w-96 border-l border-dragon-gold/20 bg-white/30 flex flex-col relative overflow-hidden shrink-0 shadow-inner h-full">
      {/* Background Paper Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 flex-1 p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar h-full gap-2">
        {/* Top Header Card */}
        <div className="space-y-2 border-b border-dragon-gold/30 pb-2.5 bg-white/60 backdrop-blur-sm p-3 rounded-sm shadow-sm shrink-0">
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

          {/* Panel Navigation Tabs */}
          {(hasClassSelected || isEquipmentStep || currentStep === 'backstory') && (
            <div className="flex items-center gap-1 pt-1 border-t border-dragon-gold/20">
              <TabButton
                label="Stats"
                icon="chart"
                isActive={activeTab === 'stats'}
                onClick={() => setActiveTab('stats')}
              />
              <TabButton
                label="Traits"
                icon="trait"
                isActive={activeTab === 'traits'}
                onClick={() => setActiveTab('traits')}
              />
              <TabButton
                label="Bio"
                icon="pen_line"
                isActive={activeTab === 'bio'}
                onClick={() => setActiveTab('bio')}
              />
              {isEquipmentStep && (
                <TabButton
                  label="Equipment"
                  icon="equipment"
                  isActive={activeTab === 'equipment'}
                  onClick={() => setActiveTab('equipment')}
                />
              )}
            </div>
          )}
        </div>

        {/* Central Stage (Background + Body + Overlays persistent across ALL tabs) */}
        <div className="relative flex-1 my-1 min-h-[260px] flex items-center justify-center overflow-hidden rounded-sm bg-white/20 border border-dragon-gold/20">
          {/* Permanent Shared Character Surface (Environment Background + SVG Body Silhouette) */}
          <CharacterPanelBody character={newChar} currentStep={currentStep} />

          {/* Dynamic Selections Overlay (Species, Class, Background, Alignment) */}
          {activeTab === 'stats' && (
            <div className="absolute left-2 top-3 z-20 flex flex-col gap-1.5 max-w-[120px] pointer-events-none">
              {newChar.race && (
                <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                  <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Species</span>
                  <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                    {newChar.race.replace(/-/g, ' ')}
                  </span>
                </div>
              )}
              {newChar.class && (
                <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                  <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Class</span>
                  <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                    {newChar.class}
                  </span>
                </div>
              )}
              {newChar.background && (
                <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                  <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Background</span>
                  <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                    {newChar.background.replace(/-/g, ' ')}
                  </span>
                </div>
              )}
              {newChar.alignment && (
                <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                  <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Alignment</span>
                  <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                    {newChar.alignment.replace(/-/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Right Overlay: Vertical Metrics Column (HP, Speed, AC, Initiative) on Stats Tab */}
          {activeTab === 'stats' && (
            <div className="absolute right-2 top-3 z-20 flex flex-col gap-2 pointer-events-none items-end">
              {/* HP Metric */}
              <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
                <GameIcon name="hit-points" size={14} className="text-dragon-red shrink-0" />
                <span className="text-[11px] font-header font-black text-dragon-darkRed">{hpText}</span>
              </div>

              {/* Speed Metric */}
              <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
                <GameIcon name="speedfoot" size={14} className="text-dragon-red shrink-0" />
                <span className="text-[10px] font-header font-black text-dragon-darkRed">{speedText}</span>
              </div>

              {/* AC Metric */}
              <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
                <img src="/assets/ui/ac-badge.webp" alt="AC" className="w-3.5 h-3.5 object-contain shrink-0" />
                <span className="text-[11px] font-header font-black text-dragon-darkRed">{acText}</span>
              </div>

              {/* Initiative Metric */}
              <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
                <GameIcon name="initiative" size={14} className="text-dragon-red shrink-0" />
                <span className="text-[11px] font-header font-black text-dragon-darkRed">{initiativeText}</span>
              </div>
            </div>
          )}

          {/* Translucent Tab Overlays over the persistent Character Surface */}
          {activeTab === 'traits' && (
            <div className="absolute inset-0 z-30 p-2 overflow-y-auto custom-scrollbar bg-white/60 backdrop-blur-xs">
              <CharacterPanelTraits character={newChar} />
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="absolute inset-0 z-30 p-2 overflow-y-auto custom-scrollbar bg-white/60 backdrop-blur-xs">
              <CharacterPanelBio character={newChar} />
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-2 bg-white/20 backdrop-blur-xs">
              <EquipmentDoll
                equippedItems={newChar.inventory || {}}
                equipment={newChar.equipment}
                items={newChar.items}
                onSlotClick={(slot) => {
                  if (newChar.inventory?.[slot]) {
                    unequipItem(slot);
                  } else if (focusedItem?._type === 'equipment') {
                    equipItem(focusedItem, slot);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Ability Score Strip - ONLY on Stats tab */}
        {activeTab === 'stats' && <CharacterPanelAbilities character={newChar} />}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded text-[9px] font-header font-black uppercase transition-all cursor-pointer ${
      isActive
        ? 'bg-dragon-red text-white shadow border border-dragon-gold/40'
        : 'bg-white/50 text-dragon-darkRed hover:bg-white/80 border border-dragon-gold/20'
    }`}
  >
    <GameIcon name={icon as any} size={11} color={isActive ? '#FFFFFF' : '#8B0000'} />
    {label}
  </button>
);
