import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useActiveCharacter, selectCharacterById } from '../../../lib/character';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { InventorySlot } from './InventorySlot';
import { GameIcon } from '../../../game_icons';
import { soundService } from '../../../services/soundService';
import {
  resolveItemTaxonomy,
  EQUIPMENT_SUBCATEGORIES,
  MATERIALS_SUBCATEGORIES,
  RootTaxonomy,
  ItemSubcategory
} from '../../../lib/inventoryTaxonomy';
import { cn } from '../../../lib/utils';

interface InventoryProps {
  onEquipRequest?: (item: any) => void;
  forceCharacterId?: string;
  showCategoryTabs?: boolean;
  compactEquipped?: boolean;
  gridCols?: number;
  activeDragItem?: any;
}

export const Inventory: React.FC<InventoryProps> = ({
  forceCharacterId,
  showCategoryTabs = true,
  activeDragItem
}) => {
  const storeActiveChar = useActiveCharacter();
  const forcedChar = useCharacterStore(state => forceCharacterId ? selectCharacterById(state, forceCharacterId) : undefined);
  const activeCharacter = forcedChar || storeActiveChar;

  const [rootCategory, setRootCategory] = React.useState<RootTaxonomy>('EQUIPMENT');
  const [activeSubcategory, setActiveSubcategory] = React.useState<ItemSubcategory | 'ALL'>('ALL');

  if (!activeCharacter) {
    return <div className="text-[10px] text-parchment-400 italic p-2">No active character loaded</div>;
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
        .filter(s => s.itemId && items[s.itemId!])
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
          else if (kind === 'ammunition') defaultSlot = 'ammo';

          return {
            id: itemInstance.id,
            name: itemInstance.customName || itemInstance.template,
            template: itemInstance.template,
            quantity: itemInstance.quantity || 1,
            kind,
            slot: defaultSlot,
            _type: kind,
            imageUrl: `/assets/atlas/equipment/images/${itemInstance.template}.webp`,
            index: itemInstance.template
          };
        });
    }
    return activeCharacter.backpack || [];
  }, [activeCharacter, backpackContainer]);

  // Filter items using canonical resolveItemTaxonomy
  const filteredBackpack = backpack.filter((item: any) => {
    if (!item) return false;
    const taxonomy = resolveItemTaxonomy(item);

    if (taxonomy.rootCategory !== rootCategory) {
      return false;
    }

    if (activeSubcategory !== 'ALL' && taxonomy.subcategory !== activeSubcategory) {
      return false;
    }

    return true;
  });

  const subcategories = rootCategory === 'EQUIPMENT' ? EQUIPMENT_SUBCATEGORIES : MATERIALS_SUBCATEGORIES;

  // Set up dnd-kit droppable context for the entire backpack area fallback
  const { setNodeRef, isOver } = useDroppable({
    id: `backpack-${activeCharacter.id}`,
    data: { characterId: activeCharacter.id, type: 'backpack' }
  });

  // Render a dense grid of capacity slots
  const gridSlots = Array.from({ length: Math.max(totalCapacity, filteredBackpack.length) });

  return (
    <div className="space-y-2 select-none font-body">
      {/* Backpack Header & Dynamic Capacity Bar */}
      <div className="flex items-center justify-between border-b border-dragon-gold/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <GameIcon name="package" size={14} color="#D4AF37" />
          <h3 className="text-[10px] font-header font-bold text-dragon-gold uppercase tracking-wider">
            Available Gear
          </h3>
        </div>
        <span className="text-[8px] text-parchment-400 font-mono font-bold">
          {backpack.length} / {totalCapacity} Slots
        </span>
      </div>

      {/* Root Category and Subcategory Tabs */}
      {showCategoryTabs && (
        <div className="flex flex-col gap-1.5 bg-black/40 p-1.5 rounded-lg border border-dragon-gold/30">
          {/* Top Row: Root Category Switcher */}
          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-dragon-gold/30 shrink-0">
            <button
              type="button"
              onClick={() => {
                setRootCategory('EQUIPMENT');
                setActiveSubcategory('ALL');
                soundService.playEffect('UI_CLICK_LIGHT');
              }}
              className={`flex-1 py-1 px-2 rounded text-[8px] font-bold uppercase tracking-wider transition-all border ${
                rootCategory === 'EQUIPMENT'
                  ? 'bg-dragon-darkRed text-white border-dragon-gold shadow-xs font-black'
                  : 'text-parchment-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              Equipment
            </button>
            <button
              type="button"
              onClick={() => {
                setRootCategory('MATERIALS');
                setActiveSubcategory('ALL');
                soundService.playEffect('UI_CLICK_LIGHT');
              }}
              className={`flex-1 py-1 px-2 rounded text-[8px] font-bold uppercase tracking-wider transition-all border ${
                rootCategory === 'MATERIALS'
                  ? 'bg-dragon-gold text-stone-950 border-white shadow-xs font-black'
                  : 'text-parchment-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              Materials
            </button>
          </div>

          {/* Bottom Row: Subcategory Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveSubcategory('ALL');
                soundService.playEffect('UI_CLICK_LIGHT');
              }}
              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all whitespace-nowrap border cursor-pointer ${
                activeSubcategory === 'ALL'
                  ? 'bg-dragon-gold text-stone-950 border-white shadow-xs font-black'
                  : 'bg-black/30 text-parchment-300 border-white/10 hover:border-dragon-gold/40 hover:text-white'
              }`}
            >
              All {rootCategory === 'EQUIPMENT' ? 'Gear' : 'Materials'}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setActiveSubcategory(sub.id);
                  soundService.playEffect('UI_CLICK_LIGHT');
                }}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all whitespace-nowrap border cursor-pointer ${
                  activeSubcategory === sub.id
                    ? 'bg-dragon-gold text-stone-950 border-white shadow-xs font-black'
                    : 'bg-black/30 text-parchment-300 border-white/10 hover:border-dragon-gold/40 hover:text-white'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dense Slot Grid Surface */}
      <div
        ref={setNodeRef}
        className={cn(
          "p-2 rounded-lg border border-dragon-gold/20 transition-all relative overflow-y-auto max-h-[52vh] custom-scrollbar bg-stone-950/40 shadow-inner",
          isOver && "border-dragon-gold/50 bg-dragon-gold/[0.05]"
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
