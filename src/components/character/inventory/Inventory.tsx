import React from 'react';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useActiveCharacter, selectCharacterById } from '../../../lib/character';
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

  // Map canonical backpack slots strictly preserve slot index `idx` -> canonical item mapping
  const canonicalSlots = React.useMemo(() => {
    const slotsCount = Math.max(totalCapacity, 24);
    const result: (any | null)[] = Array.from({ length: slotsCount }).map(() => null);

    if (activeCharacter.saveVersion === 2 && activeCharacter.items && backpackContainer) {
      const items = activeCharacter.items;
      backpackContainer.slots.forEach((s, idx) => {
        if (s.itemId && items[s.itemId]) {
          const itemInstance = items[s.itemId];
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
          else if ((kind as string) === 'ammunition') defaultSlot = 'ammo';

          result[idx] = {
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
        }
      });
    } else if (activeCharacter.backpack) {
      activeCharacter.backpack.forEach((item: any, idx: number) => {
        if (idx < slotsCount) {
          result[idx] = item;
        }
      });
    }

    return result;
  }, [activeCharacter, backpackContainer]);

  const subcategories = rootCategory === 'EQUIPMENT' ? EQUIPMENT_SUBCATEGORIES : MATERIALS_SUBCATEGORIES;

  const occupiedCount = canonicalSlots.filter(Boolean).length;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute column count dynamically based strictly on container width
  const dynamicCols = React.useMemo(() => {
    if (containerWidth <= 0) return 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8';
    if (containerWidth >= 520) return 'grid-cols-8';
    if (containerWidth >= 440) return 'grid-cols-7';
    if (containerWidth >= 360) return 'grid-cols-6';
    if (containerWidth >= 260) return 'grid-cols-5';
    return 'grid-cols-4';
  }, [containerWidth]);

  return (
    <div className="space-y-2 select-none font-body h-full flex flex-col min-h-0">
      {/* Backpack Header & Dynamic Capacity Bar */}
      <div className="flex items-center justify-between border-b border-dragon-gold/20 pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <GameIcon name="package" size={14} color="#D4AF37" />
          <h3 className="text-[10px] font-header font-bold text-dragon-gold uppercase tracking-wider">
            Available Gear
          </h3>
        </div>
        <span className="text-[8px] text-parchment-400 font-mono font-bold">
          {occupiedCount} / {totalCapacity} Slots
        </span>
      </div>

      {/* Root Category and Subcategory Tabs */}
      {showCategoryTabs && (
        <div className="flex flex-col gap-1.5 bg-black/40 p-1.5 rounded-lg border border-dragon-gold/30 shrink-0">
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

      {/* Dense 9:16 Slot Grid Surface preserving canonical slot identity `slotIdx` */}
      <div ref={containerRef} className="flex-1 p-2 rounded-lg border border-dragon-gold/20 relative overflow-y-auto custom-scrollbar bg-stone-950/40 shadow-inner min-h-0">
        <div className={cn("grid gap-1.5 relative z-10", dynamicCols)}>
          {canonicalSlots.map((rawItem, slotIdx) => {
            // Apply filtering visually while keeping slotIdx strictly tied to canonical slot index
            let itemToShow = rawItem;
            if (rawItem) {
              const taxonomy = resolveItemTaxonomy(rawItem);
              if (taxonomy.rootCategory !== rootCategory) {
                itemToShow = null;
              } else if (activeSubcategory !== 'ALL' && taxonomy.subcategory !== activeSubcategory) {
                itemToShow = null;
              }
            }

            return (
              <InventorySlot
                key={`inv-slot-${slotIdx}`}
                slotIndex={slotIdx}
                item={itemToShow}
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
