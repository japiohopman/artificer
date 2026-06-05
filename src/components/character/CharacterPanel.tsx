import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { EquipmentDoll } from './EquipmentDoll';
import { Inventory } from './Inventory';
import { SpellInventory } from './SpellInventory';
import { CharacterStats } from './CharacterStats';
import { CombatActions } from './CombatActions';
import { ItemActionCard } from './ItemActionCard';
import { ItemSlot } from './EquipmentDoll';
import { cn } from '../../lib/utils';
import { GameIcon } from '../../game_icons';
import { getAlignmentColor, getAlignmentBackgroundStyle } from '../../lib/colors';
import { normalizeImageUrl } from '../../services/storageService';
import { soundService } from '../../services/soundService';
import { ChromaKeyImage } from '../ChromaKeyImage';
import { getXpProgress } from '../../lib/statCalculations';

type CharacterTab = 'equipment' | 'inventory' | 'spells' | 'stats' | 'combat';

export const CharacterPanel: React.FC = () => {
  const { 
    isInventoryOpen, 
    setIsInventoryOpen, 
    setIsInventoryMenuOpen,
    setIsProfileMenuOpen,
    characters,
    activeCharacterId,
    setActiveCharacter,
    equipItem,
    unequipItem,
    focusedItem,
    setFocusedItem,
    setInspectingItem
  } = useStore();

  const [activeTab, setActiveTab] = useState<CharacterTab>('stats');

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  const isV2 = activeCharacter?.saveVersion === 2;

  const [hydratedDetails, setHydratedDetails] = useState<Record<string, any>>({});
  
  React.useEffect(() => {
    if (!activeCharacter || !isV2) return;
    const hydrate = async () => {
      const templates = new Set<string>();
      Object.values(activeCharacter.items || {}).forEach(inst => templates.add(inst.template));
      const missing = Array.from(templates).filter(t => !hydratedDetails[t]);
      if (missing.length > 0) {
        const { fetchEquipmentData } = await import('../../services/storageService');
        const details = { ...hydratedDetails };
        for (const t of missing) {
          const d = await fetchEquipmentData(t);
          if (d) details[t] = d;
        }
        setHydratedDetails(details);
      }
    };
    hydrate();
  }, [activeCharacterId, activeCharacter?.items]);

  const handleEquip = (slot: ItemSlot) => {
    if (activeCharacter && focusedItem?._type === 'equipment') {
      const allowedSlots = Array.isArray(focusedItem.slot) ? focusedItem.slot : [focusedItem.slot];
      // Convert hyphenated slots in template to snake_case if needed
      const normalizedAllowed = allowedSlots.map(s => s === 'main-hand' ? 'main_hand' : s === 'off-hand' ? 'off_hand' : s);
      if (normalizedAllowed.includes(slot)) {
        equipItem(focusedItem, slot);
      }
    }
  };

  const nextCharacter = () => {
    if (characters.length === 0) return;
    const currentIndex = characters.findIndex(c => c.id === activeCharacterId);
    const nextIndex = (currentIndex + 1) % characters.length;
    setActiveCharacter(characters[nextIndex].id);
  };

  const prevCharacter = () => {
    if (characters.length === 0) return;
    const currentIndex = characters.findIndex(c => c.id === activeCharacterId);
    const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
    setActiveCharacter(characters[prevIndex].id);
  };

  const tabs: { id: CharacterTab; icon: any; label: string }[] = [
    { id: 'stats', icon: 'alignment', label: 'Stats' },
    { id: 'combat', icon: 'sword', label: 'Combat' },
    { id: 'equipment', icon: 'dnd_class', label: 'Equipment' },
    { id: 'inventory', icon: 'package', label: 'Inventory' },
    { id: 'spells', icon: 'spells', label: 'Spells' }
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

  return (
    <AnimatePresence>
      {isInventoryOpen && activeCharacter && (() => {
        const inventory = activeCharacter.inventory || {};
        return (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-l border-white/5 flex flex-col z-10 relative overflow-hidden font-sans"
            style={{
              ...getAlignmentBackgroundStyle(activeCharacter.alignment),
              backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Texture Overlay matching Cards */}
            <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none z-[1]" />
            
            {/* Overlay for readability - subtle */}
            <div className="absolute inset-0 bg-parchment-100/20 pointer-events-none z-[2]" />
            
            <div className="flex flex-col h-full relative z-10">
              {/* Item Action Overlay */}
              <ItemActionCard />

          {/* Character Header Switcher (Top) */}
          <div className="bg-parchment-100/80 border-b border-parchment-300 p-1 flex items-center gap-0">
            <div className="flex items-center gap-0 relative group/switcher shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  prevCharacter();
                  soundService.playEffect('UI_CLICK_LIGHT');
                }}
                className="p-2 hover:bg-parchment-200 rounded text-dragon-red transition-all active:scale-90 z-20 flex items-center justify-center"
                title="Previous Character"
              >
                <GameIcon name="chevron_left" size={18} color="currentColor" />
              </button>

              <div 
                className="relative w-16 h-16 flex items-center justify-center cursor-pointer group shrink-0 z-10 mt-[-25px]"
                onClick={() => {
                  if (activeTab === 'inventory') {
                    setIsInventoryMenuOpen(true);
                  } else {
                    setIsProfileMenuOpen(true);
                  }
                  soundService.playEffect('UI_CLICK_LIGHT');
                }}
              >
                {activeCharacter.avatarUrl ? (
                  <ChromaKeyImage 
                    src={normalizeImageUrl(activeCharacter.avatarUrl, 'npc_character_profiles', activeCharacterId)} 
                    className="w-full h-full object-contain relative z-10 drop-shadow-xl scale-125" 
                    alt={activeCharacter.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-parchment-300">
                    <GameIcon name={activeCharacter.class?.toLowerCase() as any || "shield"} size={32} color="currentColor" />
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  nextCharacter();
                  soundService.playEffect('UI_CLICK_LIGHT');
                }}
                className="p-2 hover:bg-parchment-200 rounded text-dragon-red transition-all active:scale-90 z-20 flex items-center justify-center"
                title="Next Character"
              >
                <GameIcon name="chevron_right" size={18} color="currentColor" />
              </button>
            </div>

            <div 
              className="flex-1 cursor-pointer group pl-2 pr-4 flex flex-col justify-center h-16 border-l border-parchment-300/30"
              onClick={() => {
                if (activeTab === 'inventory') {
                  setIsInventoryMenuOpen(true);
                } else {
                  setIsProfileMenuOpen(true);
                }
                soundService.playEffect('UI_CLICK_LIGHT');
              }}
              title={activeTab === 'inventory' ? "Open Party Armory" : "Open Character Profile"}
            >
              <p className="text-[11px] font-header font-black text-dragon-darkRed uppercase tracking-widest leading-tight group-hover:text-dragon-red transition-colors line-clamp-2">
                {activeCharacter.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[8px] font-bold text-parchment-500 uppercase tracking-[0.15em] opacity-70">
                  {activeCharacter.class} • {activeCharacter.race}
                </p>
                <span className="text-[9px] font-black text-dragon-red whitespace-nowrap bg-dragon-red/5 px-2 py-0.5 rounded border border-dragon-red/10">
                  LVL {activeCharacter.level}
                </span>
              </div>
              
              {/* XP Bar implementation */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden border border-black/5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getXpProgress(activeCharacter.level || 1, activeCharacter.xp || 0)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-dragon-red shadow-[0_0_8px_rgba(139,0,0,0.3)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-parchment-300 bg-parchment-100/50">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 py-3 px-1 transition-all relative border-r border-parchment-300 last:border-r-0 overflow-hidden flex flex-col items-center justify-center",
                    isActive ? "bg-white/80 shadow-inner" : "text-parchment-600 hover:bg-parchment-200"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    isActive ? "text-dragon-red" : "text-parchment-400"
                  )}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-dragon-red" 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Indicator */}
          <div className="bg-white/40 border-b border-parchment-300 py-1.5 px-4 text-center">
            <p className="text-[8px] font-bold text-dragon-red uppercase tracking-[0.3em]">
              {activeTab === 'stats' ? 'Character Stats Profile' : `${activeTabLabel} Interface`}
            </p>
          </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'equipment' && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <EquipmentDoll 
                      equippedItems={!isV2 ? activeCharacter.inventory : undefined}
                      equipment={isV2 ? activeCharacter.equipment : undefined}
                      items={isV2 ? activeCharacter.items : undefined}
                      equipmentDetails={hydratedDetails}
                      characterImageUrl={activeCharacter.imageUrl ? normalizeImageUrl(activeCharacter.imageUrl, 'npc_character_profiles', activeCharacterId) : undefined}
                      onSlotClick={(slot) => {
                        let itemAtSlot = null;
                        if (isV2) {
                            const itemId = activeCharacter.equipment?.slots.find(s => s.id === slot)?.itemId;
                            if (itemId) {
                                const instance = activeCharacter.items?.[itemId];
                                if (instance) itemAtSlot = { ...hydratedDetails[instance.template], ...instance };
                            }
                        } else {
                            itemAtSlot = activeCharacter.inventory?.[slot];
                        }

                        if (itemAtSlot) {
                          setInspectingItem({ 
                            item: itemAtSlot, 
                            sourceId: activeCharacterId, 
                            slot 
                          });
                        } else {
                          handleEquip(slot);
                        }
                      }}
                      alignment={activeCharacter.alignment}
                      activeSlots={
                        focusedItem?._type === 'equipment' 
                          ? (Array.isArray(focusedItem.slot) ? focusedItem.slot : (focusedItem.slot ? [focusedItem.slot as ItemSlot] : []))
                              .map(s => s === 'main-hand' ? 'main_hand' : s === 'off-hand' ? 'off_hand' : s) as ItemSlot[]
                          : []
                      }
                    />
                  </div>
                  
                  <div className="bg-dragon-red/5 p-3 rounded-lg border border-dragon-red/10 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-dragon-red">
                      <GameIcon name="info" size={12} />
                      <p className="text-[9px] font-bold uppercase tracking-wider">
                        {focusedItem?._type === 'equipment' 
                          ? `Equip ${focusedItem.name}`
                          : 'Select equipment to manage'}
                      </p>
                    </div>
                    <p className="text-[8px] text-parchment-500 italic leading-relaxed">
                      Click an active slot on the doll to equip the focused item.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <Inventory 
                  gridCols={6}
                  onEquipRequest={(item) => {
                    const slots = Array.isArray(item.slot) ? item.slot : (item.slot ? [item.slot as ItemSlot] : []);
                    // Find first empty slot among allowed slots, or default to first
                    const targetSlot = slots.find(s => !inventory[s]) || slots[0];
                    
                    if (targetSlot) {
                      equipItem(item, targetSlot);
                      setFocusedItem(item);
                      setActiveTab('equipment');
                    } else if (item.slot) {
                      // If it's a single slot item but not in an array
                      equipItem(item, item.slot);
                      setFocusedItem(item);
                      setActiveTab('equipment');
                    }
                  }} 
                />
              )}
              {activeTab === 'spells' && <SpellInventory />}
              {activeTab === 'stats' && <CharacterStats />}
              {activeTab === 'combat' && <CombatActions />}
            </motion.div>
          </AnimatePresence>
        </div>

          {/* Footer with Loadout Bar */}
          <div className="bg-parchment-200 border-t border-parchment-300 relative group/footer">
            {/* Loadout ProgressBar */}
            <div className="h-1 bg-black/5 w-full relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((() => {
                  const parseWeight = (weight: any): number => {
                    if (!weight) return 0;
                    if (typeof weight === 'number') return weight;
                    const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
                    return weightMatch ? parseFloat(weightMatch[0]) : 0;
                  };

                  let total = 0;
                  if (activeCharacter.saveVersion === 2) {
                      Object.values(activeCharacter.items || {}).forEach(inst => {
                          const weight = hydratedDetails[inst.template]?.weight;
                          total += parseWeight(weight) * (inst.quantity || 1);
                      });
                  } else {
                      const inventory = activeCharacter.inventory || {};
                      const equippedWeight = Object.values(inventory).reduce((acc: number, item: any) => acc + (parseWeight(item.weight) * (item.quantity || 1)), 0);
                      const backpackWeight = (activeCharacter.backpack || []).reduce((acc: number, item: any) => acc + (parseWeight(item.weight) * (item.quantity || 1)), 0);
                      total = equippedWeight + backpackWeight;
                  }

                  const money = activeCharacter.money || { cp: 0, sp: 0, gp: 10, pp: 0 };
                  const totalCoins = (money.cp || 0) + (money.sp || 0) + (money.gp || 0) + (money.pp || 0);
                  const moneyWeight = totalCoins * 0.02;
                  
                  total += moneyWeight;
                  const capacity = (activeCharacter.stats?.str || 10) * 15;
                  return (total / capacity) * 100;
                })()), 100)}%` }}
                className={cn(
                  "h-full transition-all duration-500 shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                  (() => {
                    const capacity = (activeCharacter.stats?.str || 10) * 15;
                    const parseWeight = (weight: any): number => {
                      if (!weight) return 0;
                      if (typeof weight === 'number') return weight;
                      const weightMatch = String(weight).match(/(\d+(\.\d+)?)/);
                      return weightMatch ? parseFloat(weightMatch[0]) : 0;
                    };
                    
                    let total = 0;
                    if (activeCharacter.saveVersion === 2) {
                        Object.values(activeCharacter.items || {}).forEach(inst => {
                            const weight = hydratedDetails[inst.template]?.weight;
                            total += parseWeight(weight) * (inst.quantity || 1);
                        });
                    } else {
                        const inventory = activeCharacter.inventory || {};
                        const equippedWeight = Object.values(inventory).reduce((acc: number, item: any) => acc + (parseWeight(item.weight) * (item.quantity || 1)), 0);
                        const backpackWeight = (activeCharacter.backpack || []).reduce((acc: number, item: any) => acc + (parseWeight(item.weight) * (item.quantity || 1)), 0);
                        total = equippedWeight + backpackWeight;
                    }

                    const money = activeCharacter.money || { cp: 0, sp: 0, gp: 10, pp: 0 };
                    const totalCoins = (money.cp || 0) + (money.sp || 0) + (money.gp || 0) + (money.pp || 0);
                    const moneyWeight = totalCoins * 0.02;
                    total += moneyWeight;
                    return total > capacity ? "bg-red-500" : "bg-dragon-gold";
                  })()
                )}
              />
            </div>
            
            <div className="p-2 text-[8px] text-parchment-500 font-mono flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <GameIcon name="weight" size={10} color="#8B0000" />
                <span className="font-bold opacity-60">LOADOUT_ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-40">CHAR_SYS_v2.1</span>
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  SYNC
                </span>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      ); })()}
    </AnimatePresence>
  );
};
