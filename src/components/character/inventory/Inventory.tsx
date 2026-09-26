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
  rootCategory?: RootTaxonomy;
  onRootCategoryChange?: (root: RootTaxonomy) => void;
  activeSubcategory?: ItemSubcategory | 'ALL';
  onSubcategoryChange?: (sub: ItemSubcategory | 'ALL') => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  forceCharacterId,
  showCategoryTabs = true,
  activeDragItem,
  rootCategory: controlledRoot,
  onRootCategoryChange,
  activeSubcategory: controlledSub,
  onSubcategoryChange
}) => {
  const storeActiveChar = useActiveCharacter();
  const forcedChar = useCharacterStore(state => forceCharacterId ? selectCharacterById(state, forceCharacterId) : undefined);
  const activeCharacter = forcedChar || storeActiveChar;

  const [internalRootCategory, setInternalRootCategory] = React.useState<RootTaxonomy>('EQUIPMENT');
  const [internalSubcategory, setInternalSubcategory] = React.useState<ItemSubcategory | 'ALL'>('ALL');

  const rootCategory = controlledRoot ?? internalRootCategory;
  const activeSubcategory = controlledSub ?? internalSubcategory;

  // Reset selected subcategory to 'ALL' whenever rootCategory transitions
  React.useEffect(() => {
    setInternalSubcategory('ALL');
    if (onSubcategoryChange) {
      onSubcategoryChange('ALL');
    }
  }, [rootCategory]);

  const handleRootChange = (root: RootTaxonomy) => {
    if (onRootCategoryChange) {
      onRootCategoryChange(root);
    } else {
      setInternalRootCategory(root);
    }
    if (onSubcategoryChange) {
      onSubcategoryChange('ALL');
    } else {
      setInternalSubcategory('ALL');
    }
  };

  const handleSubChange = (sub: ItemSubcategory | 'ALL') => {
    if (onSubcategoryChange) {
      onSubcategoryChange(sub);
    } else {
      setInternalSubcategory(sub);
    }
  };

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

  // Compute column count dynamically based strictly on container width, capped at max 5 columns
  const dynamicCols = React.useMemo(() => {
    if (containerWidth <= 0) return 'grid-cols-4 sm:grid-cols-5';
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
            Backpack Storage
          </h3>
        </div>
        <span className="text-[8px] text-parchment-400 font-mono font-bold">
          {occupiedCount} / {totalCapacity} Slots
        </span>
      </div>

      {/* Subcategory Filter Tabs */}
      {showCategoryTabs && (
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar bg-black/40 p-1.5 rounded-lg border border-dragon-gold/30 shrink-0">
          <button
            type="button"
            onClick={() => {
              handleSubChange('ALL');
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
                handleSubChange(sub.id);
                soundService.playEffect('UI_CLICK_LIGHT');
              }}
              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all whitespace-nowrap border cursor-pointer flex items-center gap-1 ${
                activeSubcategory === sub.id
                  ? 'bg-dragon-gold text-stone-950 border-white shadow-xs font-black'
                  : 'bg-black/30 text-parchment-300 border-white/10 hover:border-dragon-gold/40 hover:text-white'
              }`}
            >
              {sub.svgIcon && (
                <img src={sub.svgIcon} alt="" className="w-2.5 h-2.5 object-contain invert opacity-70" />
              )}
              {sub.label}
            </button>
          ))}
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
