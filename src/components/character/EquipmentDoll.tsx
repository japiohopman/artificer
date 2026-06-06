import React from 'react';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ChromaKeyImage';
import { 
  EQUIPMENT_SLOTS, 
  EquipmentSlotId, 
  DOLL_GRID, 
  SIDE_SLOTS, 
  BOTTOM_SLOTS 
} from '../../lib/equipmentConstants';

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

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

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
  const renderSlot = (slot: EquipmentSlotId) => {
    const isActive = activeSlots.includes(slot);
    const equippedItem = equippedItems[slot];
    const slotDef = EQUIPMENT_SLOTS[slot];
    const Icon = slotDef.icon;
    
    return (
      <button 
        key={slot}
        onClick={() => onSlotClick?.(slot)}
        className={cn(
          "aspect-[9/16] border rounded flex flex-col items-center justify-center p-0.5 transition-all duration-300 relative overflow-hidden group",
          isActive 
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
              src={equippedItem.imageUrl} 
              alt={equippedItem.name}
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0.5 z-10">
            <Icon size={12} className={cn(
              "transition-colors",
              isActive ? "text-dragon-red" : "text-red-600/80"
            )} />
            <span className={cn(
              "text-[5px] uppercase font-bold tracking-tighter text-center leading-none",
              isActive ? "text-dragon-red" : "text-red-600/60"
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
