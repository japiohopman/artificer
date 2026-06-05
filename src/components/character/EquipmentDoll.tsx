import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ChromaKeyImage';
import { getAlignmentColor, getAlignmentBackgroundStyle, getAlignmentPortraitStyle } from '../../lib/colors';

import { GameIcon, GAME_ICONS, GameIconName } from '../../game_icons';

import { ItemInstance, InventorySlot } from '../../types/inventory';

export type ItemSlot = 
  | 'head' | 'neck' | 'chest' | 'back' 
  | 'main_hand' | 'off_hand' | 'hands' | 'feet' 
  | 'ring_1' | 'ring_2' | 'focus' | 'belt'
  | 'clothes' | 'acc_1' | 'acc_2' | 'acc_3' | 'acc_4'
  | 'tool_1' | 'tool_2' | 'tool_3' | 'tool_4' | 'tool_5'
  | 'extra' | 'ammo' | 'pouch' | 'ranged'
  | 'quick_1' | 'quick_2' | 'quick_3' | 'quick_4';

interface ItemDollProps {
  activeSlots?: ItemSlot[];
  equippedItems?: Record<string, any | null>; // Legacy
  equipment?: { containerId: string; slots: InventorySlot[] }; // v2
  items?: Record<string, ItemInstance>; // v2
  equipmentDetails?: Record<string, any>; // For template display
  onSlotClick?: (slot: ItemSlot) => void;
  className?: string;
  showSupplements?: boolean;
  maxWidth?: string;
  alignment: string;
  characterImageUrl?: string;
}

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

// Custom Plus icon since Lucide Plus is imported as Plus elsewhere
const PlusIcon = () => <div className="w-3 h-3 border-2 border-current rounded-sm relative"><div className="absolute inset-0 flex items-center justify-center">+</div></div>;

const REVERSE_SLOT_MAP: Record<string, ItemSlot> = {
  // Map legacy hyphenated IDs to new snake_case if they come in from legacy code
  'main-hand': 'main_hand',
  'off-hand': 'off_hand',
  'ring-1': 'ring_1',
  'ring-2': 'ring_2',
};

const SLOT_MAP: Partial<Record<ItemSlot, string>> = {
  // Identity map for mostly everything now that we aligned
};

const SLOT_ICONS: Partial<Record<ItemSlot, GameIconName>> = {
  'head': 'head', 
  'neck': 'neckles',
  'chest': 'chest',
  'back': 'cloak',
  'main_hand': 'weapon',
  'off_hand': 'shield',
  'hands': 'hand',
  'feet': 'boots',
  'ring_1': 'ring',
  'ring_2': 'ring',
  'focus': 'focus',
  'clothes': 'shirt',
  'belt': 'belt',
  'acc_1': 'gem',
  'acc_2': 'gem',
  'acc_3': 'gem',
  'acc_4': 'gem',
  'tool_1': 'tools',
  'tool_2': 'tools',
  'tool_3': 'tools',
  'tool_4': 'tools',
  'tool_5': 'tools',
  'pouch': 'pouch',
  'ammo': 'ammunition',
};

const SLOT_LABELS: Partial<Record<ItemSlot, string>> = {
  'head': 'Head',
  'neck': 'Neck',
  'chest': 'Chest',
  'back': 'Back',
  'main_hand': 'Main',
  'off_hand': 'Off',
  'hands': 'Hands',
  'feet': 'Feet',
  'ring_1': 'R1',
  'ring_2': 'R2',
  'focus': 'Focus',
  'clothes': 'Cloth',
  'belt': 'Belt',
  'tool_1': 'T1',
  'tool_2': 'T2',
  'tool_3': 'T3',
  'pouch': 'Pouch',
  'ammo': 'Ammo',
};

const DOLL_GRID: (ItemSlot | null)[][] = [
  ['back', 'head', 'focus'],
  ['clothes', 'neck', 'hands'],
  ['main_hand', 'chest', 'off_hand'],
  ['ring_1', 'belt', 'ring_2'],
  [null, 'feet', null]
];

const SIDE_SLOTS: ItemSlot[] = ['acc_1', 'acc_2', 'acc_3', 'acc_4'];
const BOTTOM_SLOTS: ItemSlot[] = ['tool_1', 'tool_2', 'tool_3', 'tool_4', 'tool_5'];

import { normalizeImageUrl } from '../../services/storageService';

const DroppableSlot: React.FC<{
  slot: ItemSlot;
  isActive: boolean;
  item: any;
  onClick: () => void;
  alignment: string;
}> = ({ slot, isActive, item, onClick, alignment }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot}`,
    data: { slot }
  });

  const IconOrName = (SLOT_ICONS[slot] || 'package') as GameIconName;
  const alignmentColor = getAlignmentColor(alignment);

  return (
    <button 
      ref={setNodeRef}
      id={`equipment-slot-${slot}`}
      onClick={onClick}
      className={cn(
        "aspect-[9/16] border rounded flex flex-col items-center justify-center p-0 transition-all duration-300 relative overflow-hidden group",
        isActive 
          ? "border-dragon-red ring-2 ring-white/50 scale-105 z-10" 
          : "border-dragon-red/10",
        isOver && "border-dragon-red scale-105 z-20 ring-2 ring-dragon-red/40",
      )}
      style={getAlignmentBackgroundStyle(alignment)}
    >
      {/* Texture Background Overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none">
        <img src={ITEM_BACKGROUND} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      {item ? (
        <div className="absolute inset-0 flex items-center justify-center p-0.5 z-10">
          <ChromaKeyImage 
            src={normalizeImageUrl(item.imageUrl, item._type || 'equipment', item.index || item.id)} 
            alt={item.name}
            className="h-[90%] w-auto object-contain mx-auto drop-shadow-sm"
          />
          {item.quantity > 1 && (
            <div className="absolute top-0 right-0 bg-dragon-darkRed text-white text-[5px] font-black italic px-0.5 min-w-[10px] text-center border-b border-l border-[#c5a059]/30 rounded-bl-sm z-30 shadow-sm pointer-events-none">
              {item.quantity}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center z-10 relative">
          <div className="absolute inset-0 scale-[1.8] opacity-10 blur-[1px] pointer-events-none flex items-center justify-center">
             <GameIcon name="dice" size={24} color={alignmentColor} />
          </div>
          <div className="w-6 h-6 rounded-full border border-current opacity-10 absolute flex items-center justify-center" style={{ color: alignmentColor }} />
          <GameIcon name={IconOrName} size={14} className="transition-colors group-hover:scale-110 duration-500" color={alignmentColor} />
        </div>
      )}
      
      {/* Hover Tooltip */}
      {item && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <span className="text-[5px] text-white font-bold uppercase text-center px-1 leading-tight text-wrap">
            {item.name}
          </span>
        </div>
      )}
    </button>
  );
};

export const EquipmentDoll: React.FC<ItemDollProps> = ({ 
  activeSlots = [], 
  equippedItems = {}, 
  equipment,
  items,
  equipmentDetails = {},
  onSlotClick, 
  className,
  showSupplements = true,
  maxWidth = "220px",
  alignment,
  characterImageUrl
}) => {
  const getItemForSlot = (slot: ItemSlot) => {
    // Check v1
    if (equippedItems[slot]) return equippedItems[slot];
    
    // Check v2
    if (equipment && items) {
      const v2SlotId = SLOT_MAP[slot] || slot;
      const v2Slot = equipment.slots.find(s => s.id === v2SlotId);
      if (v2Slot?.itemId) {
        const instance = items[v2Slot.itemId];
        if (instance) {
          // Merge template data if available
          const template = equipmentDetails[instance.template];
          return { ...template, ...instance };
        }
      }
    }
    return null;
  };

  const renderSlot = (slot: ItemSlot) => {
    return <DroppableSlot 
      key={slot}
      slot={slot}
      isActive={activeSlots.includes(slot)}
      item={getItemForSlot(slot)}
      onClick={() => onSlotClick?.(slot)}
      alignment={alignment}
    />;
  };

  return (
    <div className={cn("flex flex-col h-full mx-auto gap-0.5", className)} style={{ maxWidth: `calc(${maxWidth} + 48px)` }}>
      {/* Main Doll Section */}
      <div 
        className="flex-1 p-4 border border-dragon-red/10 rounded-t overflow-hidden relative shadow-inner group/doll flex items-center justify-center min-h-[320px]"
        style={getAlignmentPortraitStyle(alignment)}
      >
        {/* Character Backdrop Image */}
        {characterImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover/doll:opacity-30 transition-opacity">
            <ChromaKeyImage 
              src={characterImageUrl} 
              alt=""
              className="w-full h-full object-contain scale-110"
            />
          </div>
        )}

        {/* Main Doll Grid */}
        <div className="grid grid-cols-3 gap-1 relative z-10 mx-auto" style={{ height: '90%' }}>
          {DOLL_GRID.flat().map((slot, i) => (
            slot ? renderSlot(slot) : <div key={`empty-${i}`} className="aspect-[9/16]" />
          ))}
        </div>
      </div>

      {/* Supplements Section (Tools & Extra Slots Grouped) */}
      {showSupplements && (
        <div 
          className="p-2 pt-1 border border-dragon-red/10 border-t-0 rounded-b relative overflow-hidden bg-parchment-50/50"
          style={getAlignmentBackgroundStyle(alignment)}
        >
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-white/40 pointer-events-none" />
          
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2">
               <span className="text-[6px] font-black text-amber-600/80 uppercase tracking-[0.2em]">Auxillary Systems</span>
               <div className="h-px flex-1 bg-gradient-to-r from-amber-600/20 to-transparent" />
            </div>
            
            {/* Grid for all 10 supplements slots (5 side + 5 bottom) */}
            <div className="grid grid-cols-6 gap-1">
              {[...SIDE_SLOTS, ...BOTTOM_SLOTS, 'pouch', 'ammo'].map(slot => renderSlot(slot as ItemSlot))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
