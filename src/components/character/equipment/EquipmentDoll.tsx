import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../lib/utils';
import { EquipmentSprite } from './EquipmentSprite';
import { GameIcon } from '../../../game_icons';
import { normalizeImageUrl } from '../../../services/storageService';
import { useUIStore } from '../../../store/useUIStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GenderBodySvg } from '../GenderBodySvg';
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
  gender?: 'Male' | 'Female';
  race?: string;
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

  return (
    <button
      ref={setNodeRef}
      key={slot}
      type="button"
      onClick={() => onSlotClick?.(slot)}
      onContextMenu={handleContextMenu}
      className={cn(
        "aspect-[9/16] border rounded flex flex-col items-center justify-center p-0.5 transition-all duration-300 relative overflow-hidden group w-full cursor-pointer",
        isActive || isOver
          ? "bg-dragon-red/30 border-dragon-gold shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105 z-20"
          : equippedItem
          ? "bg-black/40 border-dragon-red/50 shadow-sm opacity-100 z-10"
          : "bg-black/15 border-parchment-300/20 hover:border-dragon-gold/40 hover:bg-black/25 opacity-70"
      )}
    >
      {/* Background Image Slug */}
      <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none">
        <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      {equippedItem ? (
        <div className="absolute inset-0 flex items-center justify-center p-0.5 z-10">
          <EquipmentSprite
            itemKey={itemKey}
            alt={equippedItem.name}
            className="w-full h-full object-contain drop-shadow-sm"
            fallbackUrl={fallbackUrl}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5 z-10">
          <GameIcon name={slotDef.gameIcon} size={11} className={cn(
            "transition-colors",
            isActive || isOver ? "text-dragon-gold" : "text-parchment-400"
          )} />
          <span className={cn(
            "text-[5px] uppercase font-bold tracking-tighter text-center leading-none",
            isActive || isOver ? "text-dragon-gold" : "text-parchment-400/70"
          )}>
            {slotDef.label}
          </span>
        </div>
      )}

      {/* Hover Tooltip */}
      {equippedItem && (
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 p-0.5">
          <span className="text-[5px] text-white font-bold uppercase text-center leading-tight break-words">
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
  equipment,
  items,
  equipmentDetails,
  gender = 'Male',
  race
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
    <div className={cn("relative flex flex-col gap-3 w-full max-w-[280px] mx-auto p-2 bg-white/20 border border-dragon-gold/20 rounded-sm shadow-inner overflow-hidden", className)}>
      {/* Background Paper Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-15 mix-blend-multiply pointer-events-none" />

      {/* Central Character Body Silhouette Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none p-4 z-0">
        <GenderBodySvg
          gender={gender}
          race={race}
          selected={false}
          className="border-none bg-transparent hover:bg-transparent shadow-none p-0 scale-90 fill-black stroke-black opacity-80"
        />
      </div>

      {/* Main Overlay Doll Frame Layout */}
      <div className="relative z-10 flex gap-2 items-start justify-between">
        {/* Left Column Slots */}
        <div className="flex flex-col gap-1 w-10 shrink-0">
          {renderSlot('focus')}
          {renderSlot('main_hand')}
          {renderSlot('ring_1')}
          {renderSlot(SIDE_SLOTS[0])}
          {renderSlot(SIDE_SLOTS[1])}
        </div>

        {/* Center Slots (Head, Neck, Chest, Back) */}
        <div className="flex flex-col items-center gap-1 flex-1 px-1">
          <div className="grid grid-cols-2 gap-1 w-full max-w-[90px]">
            {renderSlot('head')}
            {renderSlot('neck')}
          </div>
          <div className="grid grid-cols-2 gap-1 w-full max-w-[90px] my-auto">
            {renderSlot('chest')}
            {renderSlot('back')}
          </div>
          <div className="w-full max-w-[45px]">
            {renderSlot('feet')}
          </div>
        </div>

        {/* Right Column Slots */}
        <div className="flex flex-col gap-1 w-10 shrink-0">
          {renderSlot('hands')}
          {renderSlot('off_hand')}
          {renderSlot('ring_2')}
          {renderSlot(SIDE_SLOTS[2])}
          {renderSlot(SIDE_SLOTS[3])}
        </div>
      </div>

      {/* Bottom Bar Slots */}
      <div className="relative z-10 grid grid-cols-5 gap-1 w-full pt-1 border-t border-dragon-gold/20">
        {BOTTOM_SLOTS.map(slot => renderSlot(slot))}
      </div>
    </div>
  );
};
