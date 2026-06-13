import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { EquipmentDoll } from './EquipmentDoll';
import { Inventory } from './Inventory';
import { CharacterStats } from './CharacterStats';
import { X, Shield, Package, BarChart3, Info, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { EquipmentSlotId } from '../../lib/equipmentConstants';
import { cn } from '../../lib/utils';

type CharacterTab = 'equipment' | 'inventory' | 'stats' | 'vehicle';

export const CharacterPanel: React.FC = () => {
  const { 
    focusedItem,
    setFocusedItem
  } = useCharacterStore();

  const {
    characters,
    activeCharacterId,
    setActiveCharacter
  } = useCharacterStore();

  const {
    isInventoryOpen,
    setIsInventoryOpen,
    equipItem,
    unequipItem
  } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<CharacterTab>('equipment');

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
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
    { id: 'equipment', icon: Shield, label: 'Equipment' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'vehicle', icon: Truck, label: 'Vehicle' }
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
              {activeTab === 'stats' && <CharacterStats />}
              {activeTab === 'vehicle' && (
                <div className="h-full flex flex-col items-center justify-center text-parchment-400 gap-4 opacity-50">
                  <Truck size={48} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Vehicle Systems Offline</p>
                </div>
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
