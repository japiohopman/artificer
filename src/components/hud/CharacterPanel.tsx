import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useActiveCharacter } from '../../lib/character';
import { useUIStore } from '../../store/useUIStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { Inventory } from '../character/inventory/Inventory';
import { LogisticsManifest } from '../ui/PartyLogistics';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { normalizeImageUrl } from '../../services/storageService';
import { CharacterPanel as CanonicalCharacterPanel, CharacterPanelTab } from '../character/panel/CharacterPanel';

type HUDTab = 'party' | 'equipment' | 'inventory' | 'stats' | 'spells' | 'logistics';

export const CharacterPanel: React.FC = () => {
  const {
    characters,
    activeCharacterId,
    setActiveCharacter
  } = useCharacterStore();

  const {
    isInventoryOpen,
    setIsInventoryMenuOpen
  } = useInventoryStore();

  const {
    activeCharacterTab,
    setActiveCharacterTab,
    setIsTransportProfileOpen
  } = useUIStore();

  const activeCharacter = useActiveCharacter();

  if (!activeCharacter) {
    return (
      <div className="flex-1 flex items-center justify-center text-parchment-500/50 italic">
        Select or create a character to view details.
      </div>
    );
  }

  const nextCharacter = () => {
    const currentIndex = characters.findIndex(c => c.id === activeCharacterId);
    const nextIndex = (currentIndex + 1) % characters.length;
    setActiveCharacter(characters[nextIndex].id);
  };

  const prevCharacter = () => {
    const currentIndex = characters.findIndex(c => c.id === activeCharacterId);
    const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
    setActiveCharacter(characters[prevIndex].id);
  };

  const tabs: { id: HUDTab; iconName: string; label: string }[] = [
    { id: 'party', iconName: 'users', label: 'Party' },
    { id: 'stats', iconName: 'chart', label: 'Stats' },
    { id: 'equipment', iconName: 'equipment', label: 'Equipment' },
    { id: 'spells', iconName: 'magic_effect', label: 'Spells' },
    { id: 'inventory', iconName: 'package', label: 'Inventory' },
    { id: 'logistics', iconName: 'archive', label: 'Logistics' }
  ];

  const activeTab = (activeCharacterTab as HUDTab) || 'stats';
  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

  return (
    <AnimatePresence>
      {isInventoryOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-80 sm:w-96 bg-parchment-50/50 border-l border-parchment-300 flex flex-col z-10 h-full"
        >
          {/* HUD Drawer Navigation Header */}
          <div className="flex border-b border-parchment-300 bg-parchment-100/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCharacterTab(tab.id as any)}
                title={tab.label}
                aria-label={tab.label}
                className={cn(
                  "flex-1 flex flex-col items-center py-2 px-1 transition-all relative border-r border-parchment-300 last:border-r-0",
                  activeTab === tab.id ? "bg-dragon-red text-white" : "text-parchment-600 hover:bg-parchment-200"
                )}
              >
                <GameIcon name={tab.iconName} className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Party Character Switcher Bar */}
          <div className="bg-white/40 border-b border-parchment-300 py-1.5 px-2 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={prevCharacter}
              title="Previous Character"
              aria-label="Previous Character"
              className="p-1 hover:bg-parchment-200 rounded-full text-dragon-red transition-colors flex items-center justify-center"
            >
              <GameIcon name="chevron_left" className="w-4 h-4 text-dragon-red" />
            </button>

            <div className="text-center flex-1 min-w-0">
              <p className="text-[7px] font-bold text-parchment-400 uppercase tracking-widest leading-none mb-0.5">
                {activeTabLabel}
              </p>
              <h2 className="text-[10px] font-bold text-dragon-red uppercase tracking-wider font-header truncate px-2 leading-tight">
                {activeCharacter.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={nextCharacter}
              title="Next Character"
              aria-label="Next Character"
              className="p-1 hover:bg-parchment-200 rounded-full text-dragon-red transition-colors flex items-center justify-center"
            >
              <GameIcon name="chevron_right" className="w-4 h-4 text-dragon-red" />
            </button>
          </div>

          {/* Main Stage: Canonical Character Panel or HUD Shell Views */}
          <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {['stats', 'traits', 'equipment', 'spells', 'bio'].includes(activeTab) && (
                  <CanonicalCharacterPanel
                    character={activeCharacter}
                    activeTab={activeTab as CharacterPanelTab}
                    onTabChange={(tab: CharacterPanelTab) => setActiveCharacterTab(tab as any)}
                    hideTabs={true}
                  />
                )}

                {activeTab === 'inventory' && (
                  <Inventory />
                )}

                {activeTab === 'party' && (
                  <div className="space-y-2">
                    {characters.map(char => {
                      const cHpPercent = (char.hp / char.maxHp) * 100;
                      const charIndex = characters.indexOf(char);
                      const slotPortrait = `/assets/atlas/characters/portraits/slot${charIndex + 1}_portrait.webp`;

                      return (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => setActiveCharacter(char.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2 rounded border transition-all text-left relative overflow-hidden",
                            activeCharacterId === char.id
                              ? "bg-dragon-red/10 border-dragon-red shadow-xs"
                              : "bg-white/40 border-parchment-300 hover:border-dragon-red/30"
                          )}
                        >
                          <div className="w-9 h-12 rounded border border-dragon-gold overflow-hidden bg-dragon-darkRed/10 shrink-0 relative shadow-xs">
                            <img
                              src={normalizeImageUrl(char.imageUrl || char.avatarUrl, 'character', char.id)}
                              alt={char.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = slotPortrait;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className="text-[10px] font-black text-dragon-darkRed uppercase truncate">{char.name}</p>
                              <span className="text-[8px] font-bold text-parchment-500 uppercase shrink-0">
                                Lvl {char.level || 1} {char.class}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1 items-center">
                              <span className="text-[8px] font-black text-[#ec597a] uppercase">HP: {char.hp}/{char.maxHp}</span>
                              {activeCharacterId === char.id && (
                                <span className="text-[7px] font-black text-dragon-gold uppercase animate-pulse">Active</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'logistics' && (
                  <LogisticsManifest
                    onTransportRequest={() => {
                      setIsTransportProfileOpen(true);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer & Full Inventory Entry Point */}
          <div className="bg-parchment-200 p-2 border-t border-parchment-300 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setIsInventoryMenuOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-dragon-red text-white hover:bg-dragon-darkRed rounded text-[9px] font-bold uppercase tracking-wider transition-colors shadow-sm"
              title="Open Grand Party Manifest / Full Inventory Workspace"
            >
              <GameIcon name="package" className="w-3 h-3 text-white" />
              <span>Full Inventory</span>
            </button>
            <span className="flex items-center gap-1 text-[8px] text-parchment-500 font-mono">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              SYNC
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
