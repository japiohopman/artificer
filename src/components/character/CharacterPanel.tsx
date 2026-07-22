import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useUIStore } from '../../store/useUIStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { EquipmentDoll } from './EquipmentDoll';
import { Inventory } from './Inventory';
import { CharacterStats } from './CharacterStats';
import { LogisticsManifest } from '../ui/PartyLogistics';
import { X, Shield, Package, BarChart3, Info, Truck, ChevronLeft, ChevronRight, Archive, Users } from 'lucide-react';
import { EquipmentSlotId } from '../../lib/equipmentConstants';
import { cn } from '../../lib/utils';

type CharacterTab = 'equipment' | 'inventory' | 'stats' | 'logistics' | 'party';

export const CharacterPanel: React.FC = () => {
  const { 
    focusedItem,
    setFocusedItem
  } = useUIStore();

  const {
    characters,
    activeCharacterId,
    setActiveCharacter
  } = useCharacterStore();

  const {
    isInventoryOpen,
    setIsInventoryOpen,
    equipItem,
    unequipItem,
    addVehicle
  } = useInventoryStore();

  const {
    activeCharacterTab,
    setActiveCharacterTab,
    setIsTransportProfileOpen
  } = useUIStore();

  // Use the store's tab as the source of truth
  const activeTab = activeCharacterTab;
  const setActiveTab = setActiveCharacterTab;

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  
  if (!activeCharacter) {
    return (
      <div className="flex-1 flex items-center justify-center text-parchment-500/50 italic">
        Select or create a character to view details.
      </div>
    );
  }

  const inventory = activeCharacter.inventory;

  const handleEquip = (slot: EquipmentSlotId) => {
    if (focusedItem?._type === 'equipment') {
      const allowedSlots = Array.isArray(focusedItem.slot) ? focusedItem.slot : [focusedItem.slot];
      if (allowedSlots.includes(slot)) {
        equipItem(focusedItem, slot);
      }
    }
  };

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

  const tabs = [
    { id: 'party', icon: Users, label: 'Party' },
    { id: 'equipment', icon: Shield, label: 'Equipment' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'logistics', icon: Archive, label: 'Logistics' }
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

  return (
    <AnimatePresence>
      {isInventoryOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-80 bg-parchment-50/50 border-l border-parchment-300 flex flex-col z-10"
        >
          {/* Tabs */}
          <div className="flex border-b border-parchment-300 bg-parchment-100/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CharacterTab)}
                title={tab.label}
                aria-label={tab.label}
                className={cn(
                  "flex-1 flex flex-col items-center py-3 px-1 transition-all relative border-r border-parchment-300 last:border-r-0",
                  activeTab === tab.id ? "bg-dragon-red text-white" : "text-parchment-600 hover:bg-parchment-200"
                )}
              >
                <tab.icon size={18} />
              </button>
            ))}
          </div>

          {/* Common Name Box with Character Switcher */}
          <div className="bg-white/40 border-b border-parchment-300 py-2 px-2 flex items-center justify-between">
            <button 
              onClick={prevCharacter}
              title="Previous Character"
              aria-label="Previous Character"
              className="p-1 hover:bg-parchment-200 rounded-full text-dragon-red transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="text-center flex-1">
              <p className="text-[8px] font-bold text-parchment-400 uppercase tracking-widest mb-0.5">
                {activeTabLabel}
              </p>
              <h2 className="text-[10px] font-bold text-dragon-red uppercase tracking-wider font-header truncate px-2">
                {activeCharacter.name}
              </h2>
            </div>

            <button 
              onClick={nextCharacter}
              title="Next Character"
              aria-label="Next Character"
              className="p-1 hover:bg-parchment-200 rounded-full text-dragon-red transition-colors"
            >
              <ChevronRight size={16} />
            </button>
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
                      equippedItems={inventory}
                      onSlotClick={(slot) => {
                        if (inventory[slot]) {
                          unequipItem(slot);
                        } else {
                          handleEquip(slot);
                        }
                      }}
                      activeSlots={
                        focusedItem?._type === 'equipment' 
                          ? (Array.isArray(focusedItem.slot) ? focusedItem.slot : (focusedItem.slot ? [focusedItem.slot as EquipmentSlotId] : []))
                          : []
                      }
                    />
                  </div>
                  
                  <div className="bg-dragon-red/5 p-3 rounded-lg border border-dragon-red/10 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-dragon-red">
                      <Info size={12} />
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
                  onEquipRequest={(item) => {
                    const slots = Array.isArray(item.slot) ? item.slot : (item.slot ? [item.slot as EquipmentSlotId] : []);
                    // Find first empty slot among allowed slots, or default to first
                    const targetSlot = slots.find((s: any) => !inventory[s]) || slots[0];
                    
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
              {activeTab === 'stats' && <CharacterStats />}
              {activeTab === 'party' && (
                <div className="space-y-4">
                  {characters.map(char => {
                    const hpPercent = (char.hp / char.maxHp) * 100;
                    // Green, turning red when under 30%
                    const barColor = hpPercent < 30 ? "bg-red-600" : "bg-green-600 animate-pulse";

                    return (
                      <button
                        key={char.id}
                        onClick={() => setActiveCharacter(char.id)}
                        className={cn(
                          "w-full flex flex-col gap-3 p-3 rounded-lg border transition-all text-left relative pl-5",
                          activeCharacterId === char.id
                            ? "bg-dragon-red/10 border-dragon-red shadow-sm"
                            : "bg-white/40 border-parchment-300 hover:border-dragon-red/30"
                        )}
                      >
                        {/* Vertical HP Bar on the left */}
                        <div className="absolute left-1.5 top-3 bottom-3 w-1.5 bg-stone-950/20 rounded-full overflow-hidden flex flex-col justify-end">
                          <div
                            className={cn("w-full transition-all duration-500 rounded-full", barColor)}
                            style={{ height: `${hpPercent}%` }}
                          />
                        </div>

                        {/* Avatar and Basic Header */}
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-lg border border-dragon-gold overflow-hidden bg-dragon-darkRed/10 shrink-0">
                            {char.avatarUrl ? (
                              <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-dragon-red/40">
                                <Users size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className="text-[11px] font-black text-dragon-darkRed uppercase truncate">{char.name}</p>
                              <span className="text-[8px] font-bold text-parchment-500 uppercase shrink-0">
                                Lvl {char.level || 1} {char.class}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1 items-center">
                              <span className="text-[7px] font-black text-dragon-red/60 uppercase">HP: {char.hp}/{char.maxHp}</span>
                              {activeCharacterId === char.id && (
                                <span className="text-[7px] font-black text-dragon-gold uppercase animate-pulse">Active</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Economy Grid */}
                        {char.actionEconomy && (
                          <div className="w-full bg-stone-950/5 rounded border border-parchment-300/40 p-2 grid grid-cols-4 gap-1 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[6px] font-black text-stone-500 uppercase">Action</span>
                              <span className={cn(
                                "text-[9px] font-bold mt-0.5",
                                char.actionEconomy.actions.current > 0 ? "text-green-600" : "text-red-500"
                              )}>
                                {char.actionEconomy.actions.current}/{char.actionEconomy.actions.max}
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[6px] font-black text-stone-500 uppercase">Bonus</span>
                              <span className={cn(
                                "text-[9px] font-bold mt-0.5",
                                char.actionEconomy.bonusActions.current > 0 ? "text-blue-600" : "text-red-500"
                              )}>
                                {char.actionEconomy.bonusActions.current}/{char.actionEconomy.bonusActions.max}
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[6px] font-black text-stone-500 uppercase">Reaction</span>
                              <span className={cn(
                                "text-[9px] font-bold mt-0.5",
                                char.actionEconomy.reactions.current > 0 ? "text-purple-600" : "text-red-500"
                              )}>
                                {char.actionEconomy.reactions.current}/{char.actionEconomy.reactions.max}
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[6px] font-black text-stone-500 uppercase">Speed</span>
                              <span className={cn(
                                "text-[9px] font-bold mt-0.5",
                                char.actionEconomy.movement.current > 0 ? "text-teal-600" : "text-red-500"
                              )}>
                                {char.actionEconomy.movement.current} ft
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Cantrips & Spell Slots */}
                        <div className="w-full flex flex-col gap-1 border-t border-parchment-200/50 pt-1.5">
                          <div className="flex justify-between items-center text-[7px] font-black text-parchment-400 uppercase tracking-widest">
                            <span>Magic Matrix</span>
                            <span>Cantrips: {char.knownSpells?.filter(s => s.level === 0).length || 0}</span>
                          </div>

                          {char.spellSlots && Object.keys(char.spellSlots).length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(char.spellSlots).map(([lvl, slot]: [string, any]) => (
                                <div key={lvl} className="flex items-center gap-1 bg-parchment-200/50 rounded px-1.5 py-0.5 border border-parchment-300/30">
                                  <span className="text-[8px] font-black text-purple-700">L{lvl}:</span>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: slot.max }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full border border-purple-500/20",
                                          i < slot.current ? "bg-purple-600 shadow-[0_0_4px_rgba(147,51,234,0.5)]" : "bg-transparent"
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[7px] text-parchment-500 italic mt-0.5">No Spell Slots (Non-Spellcaster)</span>
                          )}
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

          {/* Footer */}
          <div className="bg-parchment-200 p-2 text-[8px] text-parchment-500 font-mono flex justify-between border-t border-parchment-300">
            <span>CHAR_SYS_v2.1</span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              SYNC
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
