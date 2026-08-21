import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useActiveCharacter, selectCharacterById } from '../../lib/character';
import { useInventoryStore } from '../../store/useInventoryStore';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { Package, Trash2, Weight, Shield, ArrowRight, Sparkles, Book, Key, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface InventoryProps {
  onEquipRequest?: (item: any) => void;
  forceCharacterId?: string;
  showCategoryTabs?: boolean;
  compactEquipped?: boolean;
  gridCols?: number;
}

type BackpackCategory = 'all' | 'equipment' | 'materials' | 'key' | 'books';

export const Inventory: React.FC<InventoryProps> = ({
  onEquipRequest,
  forceCharacterId,
  showCategoryTabs = true,
  compactEquipped = false,
  gridCols = 10
}) => {
  const storeActiveChar = useActiveCharacter();
  const forcedChar = useCharacterStore(state => forceCharacterId ? selectCharacterById(state, forceCharacterId) : undefined);
  const { unequipItem, removeFromBackpack } = useInventoryStore();
  const [activeCategory, setActiveCategory] = React.useState<BackpackCategory>('all');
  
  const activeCharacter = forcedChar || storeActiveChar;
  if (!activeCharacter) {
    return <div className="text-[10px] text-parchment-400 italic">No active character</div>;
  }

  const inventory = activeCharacter.inventory || {};
  const backpack = activeCharacter.backpack || [];
  const equippedItems = Object.entries(inventory).filter(([_, item]) => item !== null);

  const filteredBackpack = backpack.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'equipment') return item._type === 'equipment';
    if (activeCategory === 'materials') return item._type === 'materials' || item._type === 'material';
    if (activeCategory === 'key') return item.isKeyItem || item.category?.index === 'key-items' || item._type === 'key';
    if (activeCategory === 'books') return item.isBook || item.category?.index === 'books' || item._type === 'books';
    return true;
  });

  const categories: { id: BackpackCategory; icon: any; label: string }[] = [
    { id: 'all', icon: Filter, label: 'All' },
    { id: 'equipment', icon: Shield, label: 'Gear' },
    { id: 'materials', icon: Sparkles, label: 'Mats' },
    { id: 'key', icon: Key, label: 'Key' },
    { id: 'books', icon: Book, label: 'Books' }
  ];

  // Set up dnd-kit droppable context for the entire backpack grid
  const { setNodeRef, isOver } = useDroppable({
    id: `backpack-${activeCharacter.id}`,
    data: { characterId: activeCharacter.id, type: 'backpack' }
  });

  const totalSlots = 120;
  const gridSlots = Array.from({ length: totalSlots });

  return (
    <div className="space-y-6">
      {/* Equipped Section (Conditional Compact / Simple representation) */}
      {!compactEquipped && equippedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-dragon-red/10 pb-1.5">
            <h3 className="text-[10px] font-bold text-dragon-red uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> Currently Equipped
            </h3>
            <span className="text-[8px] text-parchment-500 font-mono">{equippedItems.length} Slots</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {equippedItems.map(([slot, item]) => (
              <div
                key={slot}
                className="animate-in fade-in slide-in-from-left-4 duration-300 bg-dragon-red/5 border border-dragon-red/10 rounded p-1.5 flex items-center gap-2 group"
              >
                <div className="w-6 aspect-[9/16] bg-black/10 rounded border border-dragon-red/5 overflow-hidden flex-none">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-bold text-dragon-red uppercase tracking-tighter truncate">{item.name}</div>
                  <div className="text-[6px] text-parchment-500 uppercase font-bold">{slot.replace('-', ' ')}</div>
                </div>
                <button 
                  onClick={() => unequipItem(slot)}
                  className="p-1.5 text-parchment-400 hover:text-dragon-red transition-colors"
                  title="Unequip to Backpack"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backpack Section with Categories and Fixed 120-Slot Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-dragon-red/10 pb-1.5">
          <h3 className="text-[10px] font-bold text-dragon-red uppercase tracking-widest flex items-center gap-2">
            <Package size={12} /> Vault Backpack
          </h3>
          <span className="text-[8px] text-parchment-500 font-mono font-bold">{backpack.length} / {totalSlots}</span>
        </div>

        {/* Backpack Categories */}
        {showCategoryTabs && (
          <div className="flex gap-1 overflow-x-auto pb-1.5 custom-scrollbar no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                  activeCategory === cat.id
                    ? "bg-dragon-red text-white border-dragon-red shadow-sm"
                    : "bg-white/40 text-parchment-600 border-parchment-300 hover:bg-parchment-200"
                )}
              >
                <cat.icon size={8} />
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* 120-Slot Fixed Grid Layout */}
        <div
          ref={setNodeRef}
          className={cn(
            "p-1.5 rounded-lg border-2 border-dragon-red/15 transition-all relative overflow-hidden bg-stone-950/5",
            isOver ? "bg-dragon-red/[0.04] border-dragon-red/30" : "border-dragon-red/10"
          )}
        >
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-dragon-red/20 z-10 pointer-events-none rounded m-0.5 animate-pulse" />
          )}

          <div
            className="grid gap-1 relative z-20"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {gridSlots.map((_, idx) => {
              const item = filteredBackpack[idx];
              if (item) {
                return (
                  <div key={item.id || `slot-${idx}`} className="w-full aspect-square">
                    <DraggableInventoryItem
                      item={item}
                      index={backpack.indexOf(item)} // use original backpack index for state updates
                      sourceId={activeCharacter.id}
                      gridMode={true}
                    />
                  </div>
                );
              }
              return (
                <div
                  key={`empty-slot-${idx}`}
                  className="aspect-square w-full h-full bg-[#1e1a15]/5 border border-dragon-red/10 rounded-sm relative flex items-center justify-center p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] hover:bg-dragon-red/5 transition-colors"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
