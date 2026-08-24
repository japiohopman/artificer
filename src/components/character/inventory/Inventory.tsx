import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useActiveCharacter, selectCharacterById } from '../../../lib/character';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { Package, Trash2, Weight, Shield, ArrowRight, Sparkles, Book, Key, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';

interface InventoryProps {
  onEquipRequest?: (item: any) => void;
  forceCharacterId?: string;
  showCategoryTabs?: boolean;
  compactEquipped?: boolean;
  gridCols?: number;
}

type BackpackCategory =
  | 'all'
  | 'weapons'
  | 'armor'
  | 'shields'
  | 'head'
  | 'boots'
  | 'rings'
  | 'neck'
  | 'consumables'
  | 'materials'
  | 'key'
  | 'books';

export const Inventory: React.FC<InventoryProps> = ({
  onEquipRequest,
  forceCharacterId,
  showCategoryTabs = true,
  compactEquipped = false,
  gridCols = 5
}) => {
  const storeActiveChar = useActiveCharacter();
  const forcedChar = useCharacterStore(state => forceCharacterId ? selectCharacterById(state, forceCharacterId) : undefined);
  const { unequipItem, removeFromBackpack } = useInventoryStore();
  const [activeCategory, setActiveCategory] = React.useState<BackpackCategory>('all');
  
  const activeCharacter = forcedChar || storeActiveChar;
  if (!activeCharacter) {
    return <div className="text-[10px] text-parchment-400 italic">No active character</div>;
  }

  // Normalize items list for V1 and V2 characters
  const backpack = React.useMemo(() => {
    if (activeCharacter.saveVersion === 2 && activeCharacter.items && activeCharacter.containers) {
      const items = activeCharacter.items;
      const backpackContainer = Object.values(activeCharacter.containers).find(c => c.type === 'backpack');
      if (!backpackContainer) return [];

      return backpackContainer.slots
        .filter(s => s.itemId && items[s.itemId])
        .map(s => {
          const itemInstance = items[s.itemId!];
          return {
            id: itemInstance.id,
            name: itemInstance.customName || itemInstance.template,
            template: itemInstance.template,
            quantity: itemInstance.quantity || 1,
            kind: itemInstance.kind || 'adventuring_gear',
            _type: itemInstance.kind === 'weapon' || itemInstance.kind === 'armor' || itemInstance.kind === 'shield' ? 'equipment' : (itemInstance.kind || 'equipment'),
            imageUrl: `/assets/atlas/equipment/images/${itemInstance.template}.webp`,
            index: itemInstance.template
          };
        });
    }
    return activeCharacter.backpack || [];
  }, [activeCharacter]);

  const inventory = activeCharacter.inventory || {};
  const equippedItems = Object.entries(inventory).filter(([_, item]) => item !== null);

  const filteredBackpack = backpack.filter((item: any) => {
    const kind = item.kind || item._type || '';
    if (activeCategory === 'all') return true;
    if (activeCategory === 'weapons') return kind === 'weapon';
    if (activeCategory === 'armor') return kind === 'armor';
    if (activeCategory === 'shields') return kind === 'shield';
    if (activeCategory === 'head') return kind === 'head';
    if (activeCategory === 'boots') return kind === 'feet';
    if (activeCategory === 'rings') return kind === 'ring';
    if (activeCategory === 'neck') return kind === 'neck';
    if (activeCategory === 'consumables') return kind === 'consumable';
    if (activeCategory === 'materials') return kind === 'material' || kind === 'materials';
    if (activeCategory === 'key') return item.isKeyItem || kind === 'quest' || kind === 'key';
    if (activeCategory === 'books') return item.isBook || kind === 'book' || kind === 'books';
    return true;
  });

  const categories: { id: BackpackCategory; icon: any; label: string }[] = [
    { id: 'all', icon: Filter, label: 'All' },
    { id: 'weapons', icon: Shield, label: 'Weapons' },
    { id: 'armor', icon: Shield, label: 'Armor' },
    { id: 'shields', icon: Shield, label: 'Shields' },
    { id: 'head', icon: Shield, label: 'Head' },
    { id: 'boots', icon: Shield, label: 'Boots' },
    { id: 'rings', icon: Sparkles, label: 'Rings' },
    { id: 'neck', icon: Sparkles, label: 'Neck' },
    { id: 'consumables', icon: Package, label: 'Potions' },
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

        {/* 120-Slot Max 5 Column Grid Layout */}
        <div
          ref={setNodeRef}
          className={cn(
            "p-2 rounded-lg border-2 border-dragon-red/15 transition-all relative overflow-y-auto max-h-[55vh] custom-scrollbar bg-stone-950/5",
            isOver ? "bg-dragon-red/[0.04] border-dragon-red/30" : "border-dragon-red/10"
          )}
        >
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-dragon-red/20 z-10 pointer-events-none rounded m-0.5 animate-pulse" />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 relative z-20">
            {filteredBackpack.map((item, idx) => (
              <div key={item.id || `item-slot-${idx}`} className="w-full">
                <DraggableInventoryItem
                  item={item}
                  index={backpack.indexOf(item)}
                  sourceId={activeCharacter.id}
                  gridMode={true}
                />
              </div>
            ))}
            {filteredBackpack.length === 0 && (
              <div className="col-span-full py-8 text-center text-[10px] text-parchment-400 italic">
                No items matching selected category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
