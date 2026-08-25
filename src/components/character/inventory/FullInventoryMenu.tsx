import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useUIStore } from '../../../store/useUIStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Inventory } from './Inventory';
import { PartyInventory } from './PartyInventory';
import { EquipmentDoll } from '../equipment/EquipmentDoll';
import { cn } from '../../../lib/utils';
import { GameIcon, GameIconName } from '../../../game_icons';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { resolveItemTemplateWeight } from '../../../lib/inventoryUtils';
import { normalizeImageUrl } from '../../../services/storageService';
import { StarterWeaponSprite } from '../equipment/StarterWeaponSprite';
import { getStarterWeaponSpriteCoord } from '../equipment/starterWeaponSpriteMap';

export const FullInventoryMenu: React.FC = () => {
  const {
    isInventoryMenuOpen,
    setIsInventoryMenuOpen,
    equipItem,
    transferItem
  } = useInventoryStore();

  const {
    characters,
    activeCharacterId,
    setActiveCharacter
  } = useCharacterStore();

  const {
    inspectingItem,
    setInspectingItem
  } = useUIStore();

  const activeChar = characters.find(c => c.id === activeCharacterId);
  const selectedItem = inspectingItem?.item;
  const itemWeight = selectedItem ? resolveItemTemplateWeight(selectedItem.template || selectedItem.index || selectedItem, activeChar?.ruleset) : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  if (!isInventoryMenuOpen) return null;

  const leftChars = characters.slice(0, 3);
  const rightChars = characters.slice(3, 6);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const sourceId = activeData.sourceId;
    const targetId = overData.characterId || overData.type;
    const itemId = activeData.item?.id;

    if (overData.type === 'equip_slot' && overData.slotId && activeData.item) {
      equipItem(activeData.item, overData.slotId);
      return;
    }

    if (sourceId && targetId && itemId) {
      transferItem({
        sourceId,
        targetId: targetId === 'backpack' ? overData.characterId : targetId,
        itemId
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full h-full max-w-7xl max-h-[92vh] bg-parchment-100 rounded-2xl border-2 border-dragon-gold shadow-2xl overflow-hidden flex flex-col relative z-[210]"
      >
      {/* Texture Overlays */}
      <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="shrink-0 bg-dragon-darkRed h-16 border-b-4 border-dragon-gold flex items-center justify-between px-8 relative z-10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center border border-white/20">
             <GameIcon name="package" size={32} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="font-header text-2xl text-white uppercase tracking-[0.2em] leading-none">Grand Party Manifest</h1>
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mt-1.5 flex items-center gap-2">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              Unified Inventory Management System v2.0
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInventoryMenuOpen(false)}
          className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-dragon-red hover:rotate-90 transition-all flex items-center justify-center border border-white/20 group"
          title="Close Inventory Menu"
          aria-label="Close Inventory Menu"
        >
          <GameIcon name="close" size={24} color="currentColor" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex relative z-0">
        {/* Left Column: Chars 1-3 */}
        <div className="w-1/4 h-full border-r border-dragon-red/10 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-black/5">
           <SectionLabel label="Primary Cohort" />
           {leftChars.map(char => (
             <CharacterInventoryCard
               key={char.id}
               character={char}
               isActive={activeCharacterId === char.id}
               onClick={() => setActiveCharacter(char.id)}
             />
           ))}
        </div>

        {/* Center Column: Focused Character & Shared Storage */}
        <div className="flex-1 h-full flex flex-col p-6 gap-6 bg-parchment-50/50 relative overflow-hidden">
           {/* Visual Flourish */}
           <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
              <GameIcon name="chest" size={200} color="#8B0000" />
           </div>

           <div className="flex-1 flex gap-6 min-h-0">
              {/* Focused Character Detail */}
              <div className="flex-[1.5] flex flex-col bg-white/40 rounded-2xl border-2 border-dragon-red/20 shadow-2xl overflow-hidden group">
                 <div className="bg-dragon-red p-4 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                       <GameIcon name="shield" size={18} color="#FFFFFF" />
                       <span className="font-header uppercase tracking-widest">{characters.find(c => c.id === activeCharacterId)?.name || 'Select Member'}'s Gear</span>
                    </div>
                    <div className="text-[10px] font-mono opacity-50 uppercase">Character_Focus_Active</div>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    <div className="flex justify-center bg-parchment-100/50 p-4 rounded-xl border border-dragon-red/10 shadow-inner">
                      <EquipmentDoll
                        equipment={activeChar?.equipment}
                        items={activeChar?.items}
                        equippedItems={activeChar?.inventory}
                        onSlotClick={(slot) => {
                          if (activeChar?.inventory?.[slot]) {
                            useInventoryStore.getState().unequipItem(slot);
                          }
                        }}
                      />
                    </div>
                    <Inventory />
                 </div>
              </div>

              {/* Shared Party Storage & Inspection Panel */}
              <div className="flex-1 flex flex-col min-w-[320px] gap-4">
                 {/* Item Inspection Panel */}
                 <AnimatePresence mode="wait">
                   {selectedItem ? (
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="bg-white/60 rounded-2xl border-2 border-dragon-gold/40 p-4 shadow-xl flex flex-col gap-3 shrink-0"
                     >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black text-dragon-gold uppercase tracking-widest block">Inspecting Item</span>
                            <h3 className="font-header text-sm text-dragon-darkRed uppercase">{selectedItem.name}</h3>
                          </div>
                          <button
                            onClick={() => setInspectingItem(null)}
                            className="p-1 text-parchment-400 hover:text-dragon-red transition-colors"
                          >
                            <GameIcon name="close" size={14} />
                          </button>
                        </div>

                        <div className="flex gap-3 items-center bg-parchment-100/50 p-2 rounded-lg border border-parchment-300/40">
                          <div className="w-12 h-12 rounded bg-black/10 overflow-hidden flex items-center justify-center shrink-0 border border-dragon-red/20">
                            {getStarterWeaponSpriteCoord(selectedItem.template || selectedItem.index || selectedItem.name) ? (
                              <StarterWeaponSprite
                                weaponKey={selectedItem.template || selectedItem.index || selectedItem.name}
                                alt={selectedItem.name}
                                className="w-full h-full object-contain"
                                fallbackUrl={normalizeImageUrl(selectedItem.imageUrl || selectedItem.image, selectedItem._type || 'equipment', selectedItem.index || selectedItem.id, selectedItem.name)}
                              />
                            ) : (
                              <ChromaKeyImage
                                src={normalizeImageUrl(selectedItem.imageUrl || selectedItem.image, selectedItem._type || 'equipment', selectedItem.index || selectedItem.id, selectedItem.name)}
                                alt={selectedItem.name}
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                          <div className="flex-1 text-[9px] space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-parchment-500 font-bold uppercase">Type:</span>
                              <span className="font-mono text-dragon-red font-bold uppercase">{selectedItem.kind || selectedItem._type || 'item'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-parchment-500 font-bold uppercase">Quantity:</span>
                              <span className="font-mono text-parchment-800 font-bold">x{selectedItem.quantity || 1}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-parchment-500 font-bold uppercase">Weight:</span>
                              <span className="font-mono text-parchment-800 font-bold">{itemWeight} lbs</span>
                            </div>
                          </div>
                        </div>

                        {(selectedItem._type === 'equipment' || selectedItem.kind === 'weapon' || selectedItem.kind === 'armor' || selectedItem.kind === 'shield') && (
                          <button
                            onClick={() => {
                              const targetSlot = selectedItem.slot || (selectedItem.kind === 'shield' ? 'off_hand' : 'main_hand');
                              equipItem(selectedItem.id || selectedItem, targetSlot);
                              setInspectingItem(null);
                            }}
                            className="w-full py-1.5 bg-dragon-red text-white hover:bg-dragon-darkRed rounded text-[9px] font-bold uppercase tracking-wider transition-colors shadow"
                          >
                            Equip Item
                          </button>
                        )}
                     </motion.div>
                   ) : (
                     <div className="bg-white/20 rounded-2xl border border-dashed border-dragon-red/20 p-4 text-center text-[9px] text-parchment-400 italic">
                       Click an item to inspect details and options.
                     </div>
                   )}
                 </AnimatePresence>

                 <div className="flex-1 min-h-0">
                    <PartyInventory />
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Chars 4-6 */}
        <div className="w-1/4 h-full border-l border-dragon-red/10 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-black/5">
           <SectionLabel label="Reserve Contingent" />
           {rightChars.map(char => (
             <CharacterInventoryCard
               key={char.id}
               character={char}
               isActive={activeCharacterId === char.id}
               onClick={() => setActiveCharacter(char.id)}
             />
           ))}
           {rightChars.length === 0 && (
             <div className="h-32 border-2 border-dashed border-dragon-red/5 rounded-xl flex flex-col items-center justify-center opacity-20">
                <GameIcon name="users" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">No Reserves Detected</span>
             </div>
           )}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="h-10 bg-parchment-200 border-t border-parchment-300 px-8 flex items-center justify-between text-[10px] font-mono text-parchment-400">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /> LINK_STABLE</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> SYNCING_MANIFEST...</span>
         </div>
         <div className="flex items-center gap-4">
            <span className="uppercase font-bold">Encrypted Archive Access</span>
            <span className="px-2 py-0.5 bg-black/5 rounded">NODE:INV-ALPHA-01</span>
         </div>
      </div>
      </motion.div>
    </div>
    </DndContext>
  );
};

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 px-2">
    <span className="text-[10px] font-black text-dragon-red uppercase tracking-[0.3em] whitespace-nowrap">{label}</span>
    <div className="h-px w-full bg-dragon-red/10" />
  </div>
);

const CharacterInventoryCard: React.FC<{ character: any, isActive: boolean, onClick: () => void }> = ({ character, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-4 group relative overflow-hidden",
      isActive
        ? "bg-dragon-red border-dragon-gold shadow-xl -translate-y-1"
        : "bg-white/40 border-dragon-red/10 hover:bg-white/60 hover:border-dragon-red/30 shadow-md"
    )}
  >
     <div className={cn(
       "w-12 h-12 rounded-lg border-2 overflow-hidden bg-parchment-200 shrink-0 shadow-inner",
       isActive ? "border-dragon-gold" : "border-dragon-red/20 group-hover:border-dragon-red/40"
     )}>
        {character.avatarUrl ? (
          <img src={character.avatarUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dragon-red/20">
            <GameIcon name="user" size={24} />
          </div>
        )}
     </div>
     <div className="flex-1 min-w-0">
        <p className={cn(
          "font-header text-sm uppercase tracking-wider leading-none mb-1 truncate",
          isActive ? "text-white" : "text-dragon-darkRed"
        )}>{character.name}</p>
        <div className="flex items-center gap-2">
           <span className={cn("text-[9px] font-bold uppercase", isActive ? "text-white/60" : "text-parchment-500")}>
             Lvl {character.level} {character.class}
           </span>
        </div>
     </div>
     {isActive && (
       <div className="absolute top-0 right-0 p-2">
          <GameIcon name="check" size={14} color="#D4AF37" />
       </div>
     )}
  </button>
);
