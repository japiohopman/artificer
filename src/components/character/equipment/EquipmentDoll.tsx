import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../lib/utils';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { GameIcon } from '../../../game_icons';
import { normalizeImageUrl } from '../../../services/storageService';
import {
  EQUIPMENT_SLOTS,
  EquipmentSlotId,
  DOLL_GRID,
  SIDE_SLOTS,
  BOTTOM_SLOTS
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
}

const ITEM_BACKGROUND = "/assets/ui/back_item_slug.webp";

interface EquipmentDollSlotProps {
  slot: EquipmentSlotId;
  activeSlots: EquipmentSlotId[];
  equippedItem: any;
  onSlotClick?: (slot: EquipmentSlotId) => void;
}

const EquipmentDollSlot: React.FC<EquipmentDollSlotProps> = ({
  slot,
  activeSlots,
  equippedItem,
  onSlotClick
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `equip-slot-${slot}`,
    data: { type: 'equip_slot', slotId: slot }
  });

  const isActive = activeSlots.includes(slot);
  const slotDef = EQUIPMENT_SLOTS[slot];

  return (
    <button
      ref={setNodeRef}
      key={slot}
      onClick={() => onSlotClick?.(slot)}
      className={cn(
        "aspect-[9/16] border rounded flex flex-col items-center justify-center p-0.5 transition-all duration-300 relative overflow-hidden group",
        isActive || isOver
          ? "bg-dragon-red/30 border-dragon-red shadow-[0_0_10px_rgba(139,0,0,0.3)] scale-105 z-10"
          : "bg-black/10 border-parchment-300/30",
        equippedItem && "opacity-100 border-dragon-red/40"
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
        <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      {equippedItem ? (
        <div className="absolute inset-0 flex items-center justify-center p-0.5 z-10">
          <ChromaKeyImage
            src={normalizeImageUrl(equippedItem.imageUrl, equippedItem._type || 'equipment', equippedItem.index)}
            alt={equippedItem.name}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5 z-10">
          <GameIcon name={slotDef.gameIcon} size={12} className={cn(
            "transition-colors",
            isActive || isOver ? "text-dragon-red" : "text-red-600/80"
          )} />
          <span className={cn(
            "text-[5px] uppercase font-bold tracking-tighter text-center leading-none",
            isActive || isOver ? "text-dragon-red" : "text-red-600/60"
          )}>
            {slotDef.label}
          </span>
        </div>
      )}

      {/* Hover Tooltip */}
      {equippedItem && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <span className="text-[5px] text-white font-bold uppercase text-center px-1 leading-tight">
            {equippedItem.name}
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
  alignment,
  equipment,
  items,
  equipmentDetails,
  showSupplements,
  maxWidth,
  characterImageUrl
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
          imageUrl: details.imageUrl || `/assets/atlas/equipment/images/${itemInstance.template}.webp`,
          _type: itemInstance.kind || details._type || 'equipment',
          index: itemInstance.template
        };
      }
    }
    return null;
  };

  const renderSlot = (slot: EquipmentSlotId) => (
    <EquipmentDollSlot
      key={slot}
      slot={slot}
      activeSlots={activeSlots}
      equippedItem={getSlotItem(slot)}
      onSlotClick={onSlotClick}
    />
  );

  return (
    <div className={cn("flex flex-col gap-4 w-full max-w-[280px] mx-auto", className)}>
      <div className="flex gap-4 items-start">
        {/* Main Doll Grid */}
        <div className="grid grid-cols-3 gap-1 flex-1">
          {DOLL_GRID.flat().map((slot, i) => (
            slot ? renderSlot(slot) : <div key={`empty-${i}`} className="aspect-[9/16]" />
          ))}
        </div>

        {/* Side Bar */}
        <div className="flex flex-col gap-1 w-12">
          {SIDE_SLOTS.map(slot => renderSlot(slot))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="grid grid-cols-5 gap-1 w-full">
        {BOTTOM_SLOTS.map(slot => renderSlot(slot))}
      </div>
    </div>
  );
};
