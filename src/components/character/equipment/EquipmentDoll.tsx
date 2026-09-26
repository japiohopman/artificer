import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../lib/utils';
import { EquipmentSprite } from './EquipmentSprite';
import { GameIcon } from '../../../game_icons';
import { normalizeImageUrl } from '../../../services/storageService';
import { useUIStore } from '../../../store/useUIStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { isItemCompatibleWithSlot, resolveItemMetadata, isProficientWithEquipment, doesWeaponRequireAmmo } from '../../../lib/equipmentCompatibility';
import { GenderBodySvg } from '../GenderBodySvg';
import {
  EQUIPMENT_SLOTS,
  EquipmentSlotId
} from '../../../lib/equipmentConstants';

interface ItemDollProps {
  activeSlots?: EquipmentSlotId[];
  equippedItems?: Record<string, any | null>;
  onSlotClick?: (slot: EquipmentSlotId) => void;
  className?: string;
  alignment?: string;
  equipment?: any;
  items?: any;
  equipmentDetails?: any;
  showSupplements?: boolean;
  maxWidth?: string;
  characterImageUrl?: string;
  gender?: 'Male' | 'Female' | string;
  race?: string;
  activeDragItem?: any;
}

const ITEM_BACKGROUND = "/assets/ui/back_item_slug.webp";

const SLOT_SVG_MAP: Record<string, string> = {
  head: '/assets/icons/svg/equipment_doll/head.svg',
  neck: '/assets/icons/svg/equipment_doll/necklace.svg',
  chest: '/assets/icons/svg/equipment_doll/chest.svg',
  back: '/assets/icons/svg/equipment_doll/back.svg',
  main_hand: '/assets/icons/svg/equipment_doll/weapon.svg',
  off_hand: '/assets/icons/svg/equipment_doll/shield.svg',
  hands: '/assets/icons/svg/equipment_doll/hand.svg',
  feet: '/assets/icons/svg/equipment_doll/boots.svg',
  ring_1: '/assets/icons/svg/equipment_doll/ring.svg',
  ring_2: '/assets/icons/svg/equipment_doll/ring.svg',
  focus: '/assets/icons/svg/equipment_doll/focus.svg',
  belt: '/assets/icons/svg/equipment_doll/belt.svg',
  cloak: '/assets/icons/svg/equipment_doll/cloak.svg',
  trinket: '/assets/icons/svg/equipment_doll/gem.svg',
};

interface EquipmentDollSlotProps {
  slot: EquipmentSlotId;
  activeSlots: EquipmentSlotId[];
  equippedItem: any;
  activeDragItem?: any;
  equippedItems?: Record<string, any>;
  onSlotClick?: (slot: EquipmentSlotId) => void;
}

const EquipmentDollSlot: React.FC<EquipmentDollSlotProps> = ({
  slot,
  activeSlots,
  equippedItem,
  activeDragItem,
  equippedItems = {},
  onSlotClick
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `equip-slot-${slot}`,
    data: { type: 'equip_slot', slotId: slot }
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!equippedItem) return;

    const charId = useCharacterStore.getState().activeCharacterId;
    useUIStore.getState().setItemActionMenu({
      item: equippedItem,
      sourceId: charId,
      slot,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const isActive = activeSlots.includes(slot);
  const slotDef = EQUIPMENT_SLOTS[slot];
  const itemKey = equippedItem ? (equippedItem.template || equippedItem.index || equippedItem.id || equippedItem.name) : undefined;
  const fallbackUrl = equippedItem ? normalizeImageUrl(equippedItem.imageUrl || equippedItem.image, equippedItem._type || 'equipment', equippedItem.index || equippedItem.id, equippedItem.name) : undefined;

  const activeChar = useCharacterStore((state) => state.characters.find(c => c.id === state.activeCharacterId) || state.characters[0]);
  const isProficient = equippedItem ? isProficientWithEquipment(activeChar, equippedItem) : true;
  const isCompatible = activeDragItem ? isItemCompatibleWithSlot(activeDragItem, slot, equippedItems) : false;

  let highlightStyle = "bg-stone-900/80 border-dragon-gold/30 hover:border-dragon-gold/70 hover:bg-stone-900/95 shadow-xs backdrop-blur-xs";

  if (equippedItem) {
    highlightStyle = "bg-parchment-200/95 border-dragon-gold shadow-xs opacity-100 z-10";
  }

  if (activeDragItem && isCompatible && !isOver) {
    highlightStyle = "bg-dragon-gold/15 border-dragon-gold/70 shadow-[0_0_8px_rgba(212,175,55,0.4)] animate-pulse z-15";
  }

  if (isActive || isOver) {
    if (activeDragItem && !isCompatible) {
      highlightStyle = "bg-red-950/80 border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.7)] z-20";
    } else {
      highlightStyle = "bg-emerald-950/80 border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)] z-20";
    }
  }

  return (
    <button
      ref={setNodeRef}
      key={slot}
      type="button"
      onClick={() => onSlotClick?.(slot)}
      onContextMenu={handleContextMenu}
      className={cn(
        "aspect-[9/16] border rounded flex flex-col items-center justify-center p-0 transition-all duration-150 relative overflow-hidden group w-full cursor-pointer pointer-events-auto",
        highlightStyle
      )}
    >
      {/* Background Image Slug */}
      <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none">
        <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      {equippedItem ? (
        <div className="absolute inset-0 flex items-center justify-center p-0 z-10">
          <EquipmentSprite
            itemKey={itemKey}
            alt={equippedItem.name}
            className="w-full h-full object-contain drop-shadow-xs"
            fallbackUrl={fallbackUrl}
          />
          {equippedItem.quantity > 1 && (
            <span className="absolute bottom-0 right-0 bg-dragon-darkRed text-white text-[6px] font-mono font-bold px-1 rounded-tl shadow-xs">
              x{equippedItem.quantity}
            </span>
          )}
          {!isProficient && (
            <span className="absolute top-0 left-0 bg-red-700 text-white text-[6px] font-black px-1 rounded-br shadow-xs z-20" title="Not Proficient">
              !
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5 z-10">
          <img
            src={SLOT_SVG_MAP[slot] || '/assets/icons/svg/equipment_doll/hand.svg'}
            alt=""
            className={cn(
              "w-4 h-4 object-contain transition-opacity",
              isOver ? (isCompatible ? "opacity-100 invert" : "opacity-80 sepia hue-rotate-320") : isActive ? "opacity-100" : "opacity-50 hover:opacity-80"
            )}
          />
          <span className={cn(
            "text-[5px] uppercase font-bold tracking-tighter text-center leading-none",
            isOver ? (isCompatible ? "text-emerald-300" : "text-red-300") : isActive ? "text-dragon-gold" : "text-parchment-300/80"
          )}>
            {slotDef?.label || slot}
          </span>
        </div>
      )}
    </button>
  );
};

export const EquipmentDoll: React.FC<ItemDollProps> = ({
  activeSlots = [],
  equippedItems = {},
  onSlotClick,
  className,
  equipment,
  items,
  equipmentDetails,
  gender = 'male',
  race,
  activeDragItem
}) => {
  // Resolve item for slot from equippedItems object or V2 equipment/items dictionaries
  const getSlotItem = (slot: EquipmentSlotId) => {
    if (equippedItems[slot]) return equippedItems[slot];
    if (equipment?.slots && items) {
      const slotRecord = equipment.slots.find((s: any) => s.id === slot);
      if (slotRecord?.itemId && items[slotRecord.itemId]) {
        const itemInstance = items[slotRecord.itemId];
        const details = equipmentDetails?.[itemInstance.template] || {};
        return {
          id: itemInstance.id,
          name: itemInstance.customName || details.name || itemInstance.template,
          quantity: itemInstance.quantity || 1,
          imageUrl: details.imageUrl || `/assets/atlas/equipment/images/${itemInstance.template}.webp`,
          _type: itemInstance.kind || details._type || 'equipment',
          index: itemInstance.template
        };
      }
    }
    return null;
  };

  const allEquipped = {
    head: getSlotItem('head'),
    neck: getSlotItem('neck'),
    chest: getSlotItem('chest'),
    back: getSlotItem('back'),
    main_hand: getSlotItem('main_hand'),
    off_hand: getSlotItem('off_hand'),
    hands: getSlotItem('hands'),
    feet: getSlotItem('feet'),
    ring_1: getSlotItem('ring_1'),
    ring_2: getSlotItem('ring_2'),
    focus: getSlotItem('focus'),
    ammo: getSlotItem('ammo')
  };

  const activeChar = useCharacterStore((state) => state.characters.find(c => c.id === state.activeCharacterId) || state.characters[0]);
  const mainHandItem = allEquipped.main_hand;
  const requiresAmmo = doesWeaponRequireAmmo(mainHandItem, activeChar?.ruleset);

  const renderSlot = (slot: EquipmentSlotId) => (
    <EquipmentDollSlot
      key={slot}
      slot={slot}
      activeSlots={activeSlots}
      equippedItem={getSlotItem(slot)}
      activeDragItem={activeDragItem}
      equippedItems={allEquipped}
      onSlotClick={onSlotClick}
    />
  );

  return (
    <div className={cn("relative flex flex-col gap-2 w-full max-w-[280px] mx-auto p-1 select-none overflow-hidden", className)}>
      {/* Central SVG Character Silhouette Body Anchor */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 transition-opacity z-0">
        <GenderBodySvg gender={gender as any} race={race} className="h-full max-h-[340px] w-auto drop-shadow-md" />
      </div>

      {/* Overlay Frame Layout over Character Body Surface */}
      <div className="relative z-10 flex gap-2 items-center justify-between my-auto py-2">
        {/* Left Column Slots */}
        <div className="flex flex-col gap-1.5 w-10 shrink-0">
          {renderSlot('focus')}
          {renderSlot('main_hand')}
          {requiresAmmo && renderSlot('ammo')}
          {renderSlot('ring_1')}
        </div>

        {/* Center Top / Chest Slots */}
        <div className="flex flex-col items-center gap-2 flex-1 px-1">
          <div className="grid grid-cols-2 gap-1.5 w-full max-w-[90px]">
            {renderSlot('head')}
            {renderSlot('neck')}
          </div>
          <div className="grid grid-cols-2 gap-1.5 w-full max-w-[90px]">
            {renderSlot('chest')}
            {renderSlot('back')}
          </div>
          <div className="w-full max-w-[44px]">
            {renderSlot('feet')}
          </div>
        </div>

        {/* Right Column Slots */}
        <div className="flex flex-col gap-1.5 w-10 shrink-0">
          {renderSlot('hands')}
          {renderSlot('off_hand')}
          {renderSlot('ring_2')}
        </div>
      </div>
    </div>
  );
};
