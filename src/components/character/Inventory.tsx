import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GameIcon, GameIconName } from '../../game_icons';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { normalizeImageUrl } from '../../services/storageService';

interface InventoryProps {
  onEquipRequest?: (item: any) => void;
  forceCharacterId?: string;
  showCategoryTabs?: boolean;
  compactEquipped?: boolean;
  gridCols?: number;
}

type BackpackCategory = 'all' | 'gear' | 'materials' | 'magic' | 'quest' | 'books' | 'trash';
type SubCategory = 'all' | 'weapon' | 'armor' | 'shield' | 'head' | 'hands' | 'feet' | 'back' | 'neck' | 'belt' | 'ring' | 'tool' | 'focus' | 'monster_part' | 'bundled_material' | 'consumable';

export const Inventory: React.FC<InventoryProps> = ({ 
  onEquipRequest, 
  forceCharacterId,
  showCategoryTabs = false,
  compactEquipped = false,
  gridCols
}) => {
  const { 
    characters, 
    activeCharacterId, 
    unequipItem, 
    removeFromBackpack, 
    setIsInventoryMenuOpen,
    setFocusedItem
  } = useStore();
  const [activeCategory, setActiveCategory] = React.useState<BackpackCategory>('all');
  const [activeSubCategory, setActiveSubCategory] = React.useState<SubCategory>('all');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [hydratedDetails, setHydratedDetails] = React.useState<Record<string, any>>({});
  
  const targetId = forceCharacterId || activeCharacterId;
  const activeCharacter = characters.find(c => c.id === targetId) || characters[0];
  
  React.useEffect(() => {
    if (!activeCharacter || activeCharacter.saveVersion !== 2) return;
    
    const hydrate = async () => {
      const templates = new Set<string>();
      Object.values(activeCharacter.items || {}).forEach(inst => templates.add(inst.template));
      
      const missing = Array.from(templates).filter(t => !hydratedDetails[t]);
      if (missing.length > 0) {
        const { fetchEquipmentData } = await import('../../services/storageService');
        const details = { ...hydratedDetails };
        await Promise.all(missing.map(async t => {
          const d = await fetchEquipmentData(t);
          if (d) details[t] = d;
        }));
        setHydratedDetails(details);
      }
    };
    hydrate();
  }, [activeCharacter?.items]);

  if (!activeCharacter) return null;

  const isV2 = activeCharacter.saveVersion === 2;
  const items = activeCharacter.items || {};

  const backpackSlots = isV2 
    ? Object.values(activeCharacter.containers || {}).find(c => c.type === 'backpack')?.slots || []
    : activeCharacter.backpack.map((item, i) => ({ id: `bag_${i}`, itemId: item.id })) || [];

  const equippedItems = isV2
    ? activeCharacter.equipment?.slots
        .filter(s => s.itemId)
        .map(s => {
          const instance = items[s.itemId!];
          if (!instance) return null;
          const template = hydratedDetails[instance.template];
          return [s.id, { ...template, ...instance, _type: template?._type || 'equipment' }];
        })
        .filter(Boolean) as [string, any][]
    : Object.entries(activeCharacter.inventory || {}).filter(([_, item]) => item !== null);

  const { setNodeRef, isOver } = useDroppable({
    id: targetId,
    data: { characterId: targetId }
  });

  const categories: { id: BackpackCategory; icon: GameIconName; label: string }[] = [
    { id: 'all', icon: 'filter', label: 'All' },
    { id: 'gear', icon: 'shield', label: 'Gear' },
    { id: 'materials', icon: 'sparkles', label: 'Materials' },
    { id: 'magic', icon: 'sparkles', label: 'Magic' },
    { id: 'quest', icon: 'key', label: 'Quest' },
    { id: 'books', icon: 'book', label: 'Books' },
    { id: 'trash', icon: 'trash', label: 'Misc' }
  ];

  const activeCategoryLabel = categories.find(c => c.id === activeCategory)?.label || 'All';

  // For filtered view, we might still want to shift items if not ALL is selected, 
  // or we just highlight them. Let's stick to shifting for categorization, 
  // but stable slots for "ALL" view? 
  // Professional inventories usually have one "Main" view with slots and "Category" views that are filtered.
  
  const filteredItems = backpackSlots
    .map(slot => {
        const itemId = slot.itemId;
        if (!itemId) return null;
        const instance = items[itemId];
        if (!instance) return null;
        const template = hydratedDetails[instance.template];
        return { ...template, ...instance, slotId: slot.id };
    })
    .filter(Boolean)
    .filter((item: any) => {
        if (activeCategory === 'all') return true;
        
        const kind = item.kind;
        const isMagic = item.isMagic || (item.rarity && item.rarity !== 'Common');
        
        if (activeCategory === 'magic') return isMagic;
        
        if (activeCategory === 'gear') {
            const isGear = ['weapon', 'armor', 'shield', 'head', 'hands', 'feet', 'back', 'neck', 'belt', 'ring', 'tool', 'focus', 'equipment_pack', 'adventuring_gear', 'consumable'].includes(kind || '') || item._type === 'equipment';
            if (!isGear) return false;
            if (activeSubCategory === 'all') return true;
            return kind === activeSubCategory;
        }
        
        if (activeCategory === 'materials') {
            const isMaterial = kind === 'material' || kind === 'monster_part' || kind === 'bundled_material' || item._type === 'materials' || item._type === 'material' || item.index?.includes('shard') || item.index?.includes('remnant');
            if (!isMaterial) return false;
            if (activeSubCategory === 'all') return true;
            return kind === activeSubCategory;
        }
        
        if (activeCategory === 'quest') return kind === 'quest' || item.isKeyItem || item.category?.index === 'key-items';
        if (activeCategory === 'books') return kind === 'book' || item.isBook || item.category?.index === 'books';
        if (activeCategory === 'trash') return kind === 'trash' || item.kind === 'trash';
        return true;
    });

  const subCategories: Record<BackpackCategory, { id: SubCategory; label: string }[]> = {
    all: [],
    gear: [
        { id: 'all', label: 'All Gear' },
        { id: 'weapon', label: 'Weapons' },
        { id: 'armor', label: 'Armor' },
        { id: 'head', label: 'Head' },
        { id: 'hands', label: 'Hands' },
        { id: 'feet', label: 'Feet' },
        { id: 'ring', label: 'Rings' },
        { id: 'consumable', label: 'Usables' },
        { id: 'tool', label: 'Tools' },
    ],
    materials: [
        { id: 'all', label: 'All Mats' },
        { id: 'monster_part', label: 'Monster Parts' },
        { id: 'bundled_material', label: 'Bundled' },
    ],
    magic: [],
    quest: [],
    books: [],
    trash: []
  };

  const renderValue = (val: any) => {
    if (!val) return null;
    if (typeof val === 'object') return val.name || val.value || JSON.stringify(val);
    return val;
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full transition-colors relative",
        isOver && "bg-dragon-red/5"
      )}
    >
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-dragon-red/20 z-10 pointer-events-none" />
      )}

      {/* Backpack Header */}
      <div className="shrink-0 mb-1">
        <div className="flex items-center gap-1 mb-1">
           <GameIcon name="package" size={14} color="#8B0000" />
           <h3 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-[0.2em]">
              {activeCharacter.name.split(' ')[0]}'s Inventory
           </h3>
        </div>

        {/* Tab-like Category Selector */}
        <div className="flex items-end gap-1 border-b border-dragon-red/10 px-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCategory(cat.id);
                setActiveSubCategory('all');
              }}
              className={cn(
                "px-4 py-1.5 rounded-t-md text-[8px] font-black uppercase tracking-widest transition-all relative border-x border-t",
                activeCategory === cat.id 
                  ? "bg-dragon-red text-white border-dragon-red translate-y-[1px] z-10 shadow-[-2px_-2px_5px_rgba(0,0,0,0.1)]" 
                  : "bg-parchment-200/40 text-parchment-500 border-dragon-red/5 hover:bg-parchment-200 hover:text-parchment-700"
              )}
            >
              <div className="flex items-center gap-2">
                 <GameIcon name={cat.icon} size={10} color={activeCategory === cat.id ? "#FFFFFF" : "#8B4513"} />
                 <span className="hidden md:inline">{cat.label}</span>
              </div>
            </button>
          ))}
        </div>
        {/* Sub-Category Chips */}
        <AnimatePresence>
          {subCategories[activeCategory].length > 0 && (
            <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               className="flex gap-1 overflow-x-auto custom-scrollbar no-scrollbar py-1 px-1 mb-1 border-b border-dragon-red/5"
            >
              {subCategories[activeCategory].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubCategory(sub.id)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all",
                    activeSubCategory === sub.id
                      ? "bg-dragon-darkRed text-white border-dragon-darkRed"
                      : "bg-white/40 text-dragon-darkRed/60 border-dragon-red/10 hover:border-dragon-red/30"
                  )}
                >
                  {sub.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backpack Grid Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 min-h-0 bg-white/20 rounded-b p-1 border border-[#c5a059]/10">
        <div 
          className={cn(
            "grid gap-0.5",
            gridCols === 6 ? "grid-cols-6" : 
            !gridCols ? "grid-cols-10 md:grid-cols-12 lg:grid-cols-16" : 
            "" 
          )}
          style={gridCols && gridCols !== 6 ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : undefined}
        >
          <AnimatePresence mode="popLayout">
            {activeCategory === 'all' ? (
                // Stable Slots View
                backpackSlots.map((slot, index) => {
                    const itemId = slot.itemId;
                    const instance = itemId ? items[itemId] : null;
                    const item = instance ? { ...hydratedDetails[instance.template], ...instance } : null;

                    return (
                        <div 
                            key={slot.id} 
                            id={`inventory-slot-${slot.id}`}
                            className="aspect-[9/16] bg-white rounded-sm border border-[#c5a059]/10 flex items-center justify-center relative"
                        >
                             <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
                                <img src="https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             </div>
                             {item ? (
                                <DraggableInventoryItem 
                                    id={`inventory-item-${item.id}-${index}`}
                                    item={item}
                                    index={index}
                                    sourceId={targetId}
                                    gridMode={true}
                                    onRemove={() => removeFromBackpack(item.id)}
                                />
                             ) : (
                                <div className="w-1 h-1 rounded-full bg-dragon-red/5 relative z-10" />
                             )}
                        </div>
                    );
                })
            ) : (
                // Filtered Shifting View using flattened array for AnimatePresence
                [
                    ...filteredItems.map((item: any, index: number) => (
                        <DraggableInventoryItem 
                            key={item.id}
                            id={`inventory-item-filtered-${item.id}-${index}`}
                            item={item}
                            index={index}
                            sourceId={targetId}
                            gridMode={true}
                            onRemove={() => removeFromBackpack(item.id)}
                        />
                    )),
                    // Pad with empty visual slots
                    ...Array.from({ length: Math.max(0, 24 - filteredItems.length) }).map((_, i) => (
                        <div 
                            key={`empty-fill-${i}`} 
                            className="aspect-[9/16] bg-white rounded-sm border border-[#c5a059]/10 flex items-center justify-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
                                <img src="https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="w-1 h-1 rounded-full bg-dragon-red/5 relative z-10" />
                        </div>
                    ))
                ]
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Equipped Section */}
      <div className={cn("shrink-0", compactEquipped ? "pt-4 mt-4 border-t border-dragon-red/10" : "pt-6")}>
        <div className="flex items-center justify-between border-b border-dragon-red/20 pb-1.5 mb-3">
          <h3 className="text-[9px] font-black text-dragon-red uppercase tracking-widest flex items-center gap-2">
            <GameIcon name="shield" size={10} color="#8B0000" /> Currently Equipped
          </h3>
          <span className="text-[8px] text-parchment-500 font-mono font-bold tracking-tighter">{equippedItems.length} ACTIVE_SLOTS</span>
        </div>

        <div className={cn("grid gap-1", compactEquipped ? "grid-cols-2" : "grid-cols-1")}>
          {equippedItems.length > 0 ? (
            equippedItems.map(([slot, item]: any) => (
              <DraggableInventoryItem
                key={slot}
                id={`equipped-item-${slot}`}
                item={item}
                index={0}
                sourceId={targetId}
                slot={slot}
                compact={true}
                onRemove={() => unequipItem(slot)}
              />
            ))
          ) : (
            <div className="col-span-2 py-4 border border-dashed border-dragon-red/10 rounded-lg flex items-center justify-center opacity-40">
               <p className="text-[8px] text-parchment-400 italic uppercase font-black tracking-widest">No gear equipped</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
