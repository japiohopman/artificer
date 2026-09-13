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
import { calculateDerivedStats, getXpProgress, XP_TABLE } from '../../lib/statCalculations';
import { normalizeImageUrl } from '../../services/storageService';
import { CharacterPanel as CanonicalCharacterPanel, CharacterPanelTab } from '../character/panel/CharacterPanel';

type HUDTab = 'party' | 'equipment' | 'inventory' | 'stats' | 'spells' | 'logistics';

export const CharacterPanel: React.FC = () => {
  const {
    characters,
    activeCharacterId,
    setActiveCharacter,
    xpGain
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

  const derived = calculateDerivedStats(activeCharacter);
  const xpPercent = getXpProgress(activeCharacter.level || 1, activeCharacter.xp || 0);
  const nextLevelXp = XP_TABLE[activeCharacter.level] || ((XP_TABLE[activeCharacter.level - 1] || 0) + 50000);
  const hpPercent = (activeCharacter.hp / activeCharacter.maxHp) * 100;
  const hpBarColor = hpPercent < 30 ? "bg-red-600" : "bg-green-600 animate-pulse";

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
          {/* Tabs Header */}
          <div className="flex border-b border-parchment-300 bg-parchment-100/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCharacterTab(tab.id as any)}
                title={tab.label}
                aria-label={tab.label}
                className={cn(
                  "flex-1 flex flex-col items-center py-2.5 px-1 transition-all relative border-r border-parchment-300 last:border-r-0",
                  activeTab === tab.id ? "bg-dragon-red text-white" : "text-parchment-600 hover:bg-parchment-200"
                )}
              >
                <GameIcon name={tab.iconName} className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Character Switcher Bar */}
          <div className="bg-white/40 border-b border-parchment-300 py-2 px-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevCharacter}
              title="Previous Character"
              aria-label="Previous Character"
              className="p-1 hover:bg-parchment-200 rounded-full text-dragon-red transition-colors flex items-center justify-center"
            >
              <GameIcon name="chevron_left" className="w-4 h-4 text-dragon-red" />
            </button>

            <div className="text-center flex-1">
              <p className="text-[8px] font-bold text-parchment-400 uppercase tracking-widest mb-0.5">
                {activeTabLabel}
              </p>
              <h2 className="text-[11px] font-bold text-dragon-red uppercase tracking-wider font-header truncate px-2">
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

          {/* Active Character Vital Header */}
          <div className="bg-parchment-100/70 border-b border-parchment-300 p-3 flex flex-col gap-2.5 shrink-0">
            <div className="flex gap-3">
              {/* Profile Portrait */}
              <div className="w-16 h-20 bg-stone-900/10 rounded-lg border-2 border-dragon-gold overflow-hidden shrink-0 shadow-md relative group">
                {activeCharacter.imageUrl || activeCharacter.avatarUrl ? (
                  <img
                    src={normalizeImageUrl(activeCharacter.imageUrl || activeCharacter.avatarUrl, 'character', activeCharacter.id)}
                    alt={activeCharacter.name}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `/assets/atlas/characters/portraits/slot${characters.indexOf(activeCharacter) + 1}_portrait.webp`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dragon-red/30">
                    <GameIcon name="users" className="w-6 h-6 text-dragon-red/30" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-dragon-gold text-dragon-darkRed text-[8px] font-black px-1.5 py-0.5 rounded border border-dragon-darkRed/20 shadow-sm z-20">
                  Lvl {activeCharacter.level || 1}
                </div>

                <AnimatePresence>
                  {xpGain && xpGain.characterId === activeCharacter.id && (
                    <motion.div
                      key={`xp-active-${xpGain.key}`}
                      initial={{ opacity: 0, y: 15, scale: 0.8 }}
                      animate={{ opacity: 1, y: -15, scale: 1.1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.9 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                    >
                      <span className="bg-purple-900/90 text-dragon-gold text-[10px] font-black px-2 py-0.5 rounded-full border border-dragon-gold/30 shadow-[0_0_12px_rgba(147,51,234,0.7)] uppercase tracking-tighter">
                        +{xpGain.amount} XP
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Identity & Vitals */}
              <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                <div>
                  <h3 className="text-xs font-black text-dragon-darkRed uppercase tracking-tight truncate">
                    {activeCharacter.class || "Adventurer"}
                  </h3>
                  <p className="text-[8px] font-bold text-parchment-500 uppercase tracking-widest mt-0.5">
                    {activeCharacter.race || "Species"} • {activeCharacter.alignment || "Neutral"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/60 px-2 py-0.5 rounded border border-parchment-300 shadow-sm" title="Armor Class">
                    <GameIcon name="shield" className="w-2.5 h-2.5 text-dragon-red" />
                    <span className="text-[10px] font-bold text-parchment-800">{derived.ac}</span>
                  </div>

                  <span className="text-[9px] font-black text-dragon-red/80 uppercase">
                    HP {activeCharacter.hp}/{activeCharacter.maxHp}
                  </span>
                </div>

                <div className="h-1.5 w-full bg-stone-950/15 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${hpPercent}%` }}
                    className={cn("h-full transition-all rounded-full", hpBarColor)}
                  />
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-stone-950/15 rounded-full overflow-hidden relative shadow-inner">
                <motion.div
                  initial={false}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)] rounded-full"
                />
              </div>
              <div className="flex justify-between items-center text-[7px] font-black text-parchment-400 uppercase tracking-widest px-0.5">
                <span>XP: {activeCharacter.xp.toLocaleString()} / {nextLevelXp.toLocaleString()}</span>
                <span className="text-purple-600">{Math.floor(xpPercent)}%</span>
              </div>
            </div>
          </div>

          {/* Main Stage: Canonical Character Panel or Special HUD Views */}
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
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
                  <div className="space-y-3">
                    {characters.map(char => {
                      const cHpPercent = (char.hp / char.maxHp) * 100;
                      const cBarColor = cHpPercent < 30 ? "bg-red-600" : "bg-green-600 animate-pulse";
                      const charIndex = characters.indexOf(char);
                      const slotPortrait = `/assets/atlas/characters/portraits/slot${charIndex + 1}_portrait.webp`;

                      return (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => setActiveCharacter(char.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left relative overflow-hidden",
                            activeCharacterId === char.id
                              ? "bg-dragon-red/10 border-dragon-red shadow-sm"
                              : "bg-white/40 border-parchment-300 hover:border-dragon-red/30"
                          )}
                        >
                          <div className="w-10 h-14 rounded border border-dragon-gold overflow-hidden bg-dragon-darkRed/10 shrink-0 relative shadow-sm">
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
                              <p className="text-[11px] font-black text-dragon-darkRed uppercase truncate">{char.name}</p>
                              <span className="text-[8px] font-bold text-parchment-500 uppercase shrink-0">
                                Lvl {char.level || 1} {char.class}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1 items-center">
                              <span className="text-[8px] font-black text-dragon-red/80 uppercase">HP: {char.hp}/{char.maxHp}</span>
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
