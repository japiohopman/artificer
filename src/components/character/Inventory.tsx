import React from 'react';
import { useStore } from '../../store/useStore';
import { Package, Trash2, Weight, Shield, ArrowRight, Sparkles, Book, Key, Filter, Grab } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface InventoryProps {
  onEquipRequest?: (item: any) => void;
  forceCharacterId?: string;
  showCategoryTabs?: boolean;
  compactEquipped?: boolean;
  gridCols?: number;
}

type BackpackCategory = 'all' | 'equipment' | 'materials' | 'key' | 'books';

const InventorySlotUI: React.FC<{
  slotId: string;
  item: any | null;
  onEquipRequest?: (item: any) => void;
  onRemove: (id: string) => void;
  characterId: string;
}> = ({ slotId, item, onEquipRequest, onRemove, characterId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${slotId}`,
    data: { slotId }
  });

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `drag-${item?.id || slotId}`,
    disabled: !item,
    data: { item, slotId, sourceId: characterId }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative aspect-square rounded-lg border-2 transition-all group",
        isOver ? "bg-dragon-red/20 border-dragon-red shadow-lg scale-105 z-10" : "bg-white/40 border-parchment-300 hover:border-dragon-red/30",
        isDragging && "opacity-50"
      )}
    >
      {item ? (
        <div
          ref={setDragRef}
          style={style}
          {...listeners}
          {...attributes}
          className="w-full h-full p-1 cursor-grab active:cursor-grabbing"
        >
          <div className="w-full h-full bg-black/5 rounded border border-black/5 overflow-hidden relative">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            {item.quantity > 1 && (
              <span className="absolute bottom-0.5 right-0.5 bg-dragon-red text-white text-[7px] font-black px-1 rounded shadow-sm">
                x{item.quantity}
              </span>
            )}
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
               {onEquipRequest && (
                 <button 
                  onClick={(e) => { e.stopPropagation(); onEquipRequest(item); }}
                  className="p-1 bg-dragon-red text-white rounded hover:bg-red-700 shadow-sm"
                  title="Equip"
                 >
                   <ArrowRight size={10} />
                 </button>
               )}
               <button 
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                className="p-1 bg-parchment-500 text-white rounded hover:bg-red-600 shadow-sm"
                title="Discard"
               >
                 <Trash2 size={10} />
               </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-10">
          <Grab size={16} className="text-parchment-400" />
        </div>
      )}
      
      {/* Slot ID Hint (debug/dev) */}
      <div className="absolute top-0 left-0.5 text-[5px] font-black text-parchment-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
        {slotId.split('_').pop()}
      </div>
    </div>
  );
};

export const Inventory: React.FC<InventoryProps> = ({ onEquipRequest }) => {
  const { characters, activeCharacterId, unequipItem, removeFromBackpack } = useStore();
  const [activeCategory, setActiveCategory] = React.useState<BackpackCategory>('all');
  
  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  
  // V2 UI Logic
  const isV2 = activeCharacter.saveVersion === 2;
  const v2Items = activeCharacter.items || {};
  const v2Containers = activeCharacter.containers || {};
  const v2Equipment = activeCharacter.equipment;
  
  // Resolve Equipped Items
  const equippedItems = isV2 && v2Equipment
    ? v2Equipment.slots
        .filter(slot => slot.itemId !== null)
        .map(slot => {
          const instance = v2Items[slot.itemId!];
          // Use normalized image URL
          const imgUrl = `/assets/atlas/equipment/images/${instance.template}.webp`;
          return [slot.id, { 
            ...instance, 
            name: instance.template.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            imageUrl: imgUrl
          }];
        })
    : Object.entries(activeCharacter.inventory || {}).filter(([_, item]) => item !== null);

  // Resolve Backpack Slots for Grid
  const backpackContainer = isV2 
    ? Object.values(v2Containers).find(c => c.type === 'backpack')
    : null;

  const backpackSlots = backpackContainer?.slots || [];

  const filteredSlots = backpackSlots.filter(s => {
    if (activeCategory === 'all') return true;
    if (!s.itemId) return false; // Hide empty slots when filtering? Actually, grid looks better with empty slots.
    
    const instance = v2Items[s.itemId!];
    const k = instance.kind;
    if (activeCategory === 'equipment') return ['weapon', 'armor', 'shield', 'trinket', 'adventuring_gear', 'tool', 'focus'].includes(k || '');
    if (activeCategory === 'materials') return ['material', 'monster_part'].includes(k || '');
    if (activeCategory === 'key') return instance.template.includes('key') || instance.template.includes('relic');
    if (activeCategory === 'books') return k === 'book' || instance.template.includes('journal');
    return true;
  });

  const getSlotItem = (sId: string) => {
    const slot = backpackSlots.find(s => s.id === sId);
    if (!slot?.itemId) return null;
    const instance = v2Items[slot.itemId];
    const imgUrl = `/assets/atlas/equipment/images/${instance.template}.webp`;
    return {
      ...instance,
      name: instance.template.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      imageUrl: imgUrl,
      _type: 'equipment' // simplified for legacy check
    };
  };

  const categories: { id: BackpackCategory; icon: any; label: string }[] = [
    { id: 'all', icon: Filter, label: 'All' },
    { id: 'equipment', icon: Shield, label: 'Gear' },
    { id: 'materials', icon: Sparkles, label: 'Mats' },
    { id: 'key', icon: Key, label: 'Key' },
    { id: 'books', icon: Book, label: 'Books' }
  ];

  return (
    <div className="space-y-8">
      {/* Equipped Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-dragon-red/20 pb-2">
          <h3 className="text-xs font-bold text-dragon-red uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} /> Currently Equipped
          </h3>
          <span className="text-[10px] text-parchment-500 font-mono">{equippedItems.length} Slots</span>
        </div>

        <div className="space-y-2">
          {equippedItems.length > 0 ? (
            equippedItems.map(([slot, item]) => (
              <motion.div
                key={slot}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-dragon-red/5 border border-dragon-red/10 rounded-lg p-1.5 flex items-center gap-2 group"
              >
                <div className="w-8 aspect-[9/16] bg-black/10 rounded border border-dragon-red/5 overflow-hidden flex-none">
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
              </motion.div>
            ))
          ) : (
            <p className="text-[9px] text-parchment-400 italic text-center py-2">No items equipped</p>
          )}
        </div>
      </div>

      {/* Backpack Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-dragon-red/20 pb-1.5">
          <h3 className="text-[10px] font-bold text-dragon-red uppercase tracking-widest flex items-center gap-2">
            <Package size={12} /> Backpack
          </h3>
          <span className="text-[9px] text-parchment-500 font-mono">{backpack.length}</span>
        </div>

        {/* Backpack Categories */}
        <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                activeCategory === cat.id 
                  ? "bg-dragon-red text-white border-dragon-red shadow-sm" 
                  : "bg-white/40 text-parchment-600 border-parchment-300 hover:bg-parchment-200"
              )}
            >
              <cat.icon size={10} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-1.5">
          <div className="grid grid-cols-4 gap-2 p-1">
            {isV2 ? (
              (activeCategory === 'all' ? backpackSlots : filteredSlots).map((slot) => (
                <InventorySlotUI
                  key={slot.id}
                  slotId={slot.id}
                  item={getSlotItem(slot.id)}
                  onEquipRequest={onEquipRequest}
                  onRemove={removeFromBackpack}
                  characterId={activeCharacterId}
                />
              ))
            ) : (
              <p className="col-span-4 text-[9px] text-parchment-400 italic text-center py-4">Legacy backpack view not supported in grid</p>
            )}
          </div>

          {isV2 && (activeCategory === 'all' ? backpackSlots : filteredSlots).length === 0 && (
             <div className="py-8 text-center space-y-1.5 opacity-30 col-span-4">
                <Package size={32} className="mx-auto text-parchment-400" />
                <p className="text-[9px] font-bold uppercase tracking-widest">Empty Category</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
