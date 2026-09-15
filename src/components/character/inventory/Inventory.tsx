import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useActiveCharacter, selectCharacterById } from '../../../lib/character';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { InventorySlot } from './InventorySlot';
import { Package, Shield, Sparkles, Book, Key, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface InventoryProps {
  onEquipRequest?: (item: any) => void;
  forceCharacterId?: string;
  showCategoryTabs?: boolean;
  compactEquipped?: boolean;
  gridCols?: number;
  activeDragItem?: any;
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
  forceCharacterId,
  showCategoryTabs = true,
  activeDragItem
}) => {
  const storeActiveChar = useActiveCharacter();
  const forcedChar = useCharacterStore(state => forceCharacterId ? selectCharacterById(state, forceCharacterId) : undefined);
  const [activeCategory, setActiveCategory] = React.useState<BackpackCategory>('all');
  
  const activeCharacter = forcedChar || storeActiveChar;
  if (!activeCharacter) {
    return <div className="text-[10px] text-parchment-400 italic">No active character loaded</div>;
  }

  // Derive capacity dynamically from V2 container state or default to 24
  const backpackContainer = activeCharacter.saveVersion === 2 && activeCharacter.containers
    ? Object.values(activeCharacter.containers).find(c => c.type === 'backpack')
    : null;

  const totalCapacity = backpackContainer?.slots?.length || 24;

  // Normalize items list for V1 and V2 characters
  const backpack = React.useMemo(() => {
    if (activeCharacter.saveVersion === 2 && activeCharacter.items && backpackContainer) {
      const items = activeCharacter.items;
      return backpackContainer.slots
        .filter(s => s.itemId && items[s.itemId])
        .map(s => {
          const itemInstance = items[s.itemId!];
          const kind = itemInstance.kind || 'adventuring_gear';
          let defaultSlot = undefined;
          if (kind === 'weapon') defaultSlot = 'main_hand';
          else if (kind === 'shield') defaultSlot = 'off_hand';
          else if (kind === 'armor') defaultSlot = 'chest';
          else if (kind === 'head') defaultSlot = 'head';
          else if (kind === 'feet') defaultSlot = 'feet';
          else if (kind === 'ring') defaultSlot = 'ring_1';
          else if (kind === 'neck') defaultSlot = 'neck';
          else if (kind === 'back') defaultSlot = 'back';

          return {
            id: itemInstance.id,
            name: itemInstance.customName || itemInstance.template,
            template: itemInstance.template,
            quantity: itemInstance.quantity || 1,
            kind,
            slot: defaultSlot,
            _type: kind === 'weapon' || kind === 'armor' || kind === 'shield' || kind === 'head' || kind === 'feet' || kind === 'ring' || kind === 'neck' ? 'equipment' : kind,
            imageUrl: `/assets/atlas/equipment/images/${itemInstance.template}.webp`,
            index: itemInstance.template
          };
        });
    }
    return activeCharacter.backpack || [];
  }, [activeCharacter, backpackContainer]);

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

  // Set up dnd-kit droppable context for the entire backpack area fallback
  const { setNodeRef, isOver } = useDroppable({
    id: `backpack-${activeCharacter.id}`,
    data: { characterId: activeCharacter.id, type: 'backpack' }
  });

  // Render a dense grid of capacity slots
  const gridSlots = Array.from({ length: Math.max(totalCapacity, filteredBackpack.length) });

  return (
    <div className="space-y-2">
      {/* Backpack Header & Dynamic Capacity Bar */}
      <div className="flex items-center justify-between border-b border-dragon-red/15 pb-1">
        <h3 className="text-[10px] font-bold text-dragon-red uppercase tracking-widest flex items-center gap-1.5">
          <Package size={12} /> Backpack Grid
        </h3>
        <span className="text-[8px] text-parchment-600 font-mono font-bold">
          {backpack.length} / {totalCapacity} Slots
        </span>
      </div>

      {/* Category Tabs */}
      {showCategoryTabs && (
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer",
                activeCategory === cat.id
                  ? "bg-dragon-red text-white border-dragon-red shadow-xs"
                  : "bg-white/50 text-parchment-700 border-parchment-300 hover:bg-parchment-200"
              )}
            >
              <cat.icon size={8} />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Dense Slot Grid Surface */}
      <div
        ref={setNodeRef}
        className={cn(
          "p-1.5 rounded-lg border border-dragon-red/15 transition-all relative overflow-y-auto max-h-[50vh] custom-scrollbar bg-stone-950/5",
          isOver && "border-dragon-red/40 bg-dragon-red/[0.03]"
        )}
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 relative z-10">
          {gridSlots.map((_, idx) => {
            const item = filteredBackpack[idx];
            return (
              <InventorySlot
                key={`inv-slot-${idx}`}
                slotIndex={idx}
                item={item}
                characterId={activeCharacter.id}
                activeDragItem={activeDragItem}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
