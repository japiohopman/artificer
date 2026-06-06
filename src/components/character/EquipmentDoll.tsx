import React from 'react';
import { cn } from '../../lib/utils';
import { 
  User, Shield, Sword, Footprints, Hand, 
  Gem, Zap, Wrench, Circle, Layers, 
  Shirt, Ghost, Disc
} from 'lucide-react';
import { ChromaKeyImage } from '../ChromaKeyImage';

export type ItemSlot = 
  | 'head' | 'neck' | 'chest' | 'back' 
  | 'main-hand' | 'off-hand' | 'hands' | 'feet' 
  | 'ring-1' | 'ring-2' | 'focus'
  | 'clothes' | 'acc-1' | 'acc-2' | 'acc-3' | 'acc-4'
  | 'tool-1' | 'tool-2' | 'tool-3' | 'tool-4' | 'tool-5';

interface ItemDollProps {
  activeSlots: ItemSlot[];
  equippedItems?: Record<string, any | null>;
  onSlotClick?: (slot: ItemSlot) => void;
  className?: string;
}

const ITEM_BACKGROUND = "https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp";

// Custom Plus icon since Lucide Plus is imported as Plus elsewhere
const PlusIcon = () => <div className="w-3 h-3 border-2 border-current rounded-sm relative"><div className="absolute inset-0 flex items-center justify-center">+</div></div>;

const SLOT_ICONS: Record<ItemSlot, React.ElementType> = {
  'head': Circle,
  'neck': Gem,
  'chest': Shirt,
  'back': Ghost,
  'main-hand': Sword,
  'off-hand': Shield,
  'hands': Hand,
  'feet': Footprints,
  'ring-1': Gem,
  'ring-2': Gem,
  'focus': Zap,
  'clothes': Shirt,
  'acc-1': Gem,
  'acc-2': Gem,
  'acc-3': Gem,
  'acc-4': Gem,
  'tool-1': Wrench,
  'tool-2': Wrench,
  'tool-3': Wrench,
  'tool-4': Wrench,
  'tool-5': Wrench,
};

const SLOT_LABELS: Record<ItemSlot, string> = {
  'head': 'Head',
  'neck': 'Neck',
  'chest': 'Chest',
  'back': 'Back',
  'main-hand': 'Main',
  'off-hand': 'Off',
  'hands': 'Hands',
  'feet': 'Feet',
  'ring-1': 'R1',
  'ring-2': 'R2',
  'focus': 'Focus',
  'clothes': 'Cloth',
  'acc-1': 'Acc 1',
  'acc-2': 'Acc 2',
  'acc-3': 'Acc 3',
  'acc-4': 'Acc 4',
  'tool-1': 'T1',
  'tool-2': 'T2',
  'tool-3': 'T3',
  'tool-4': 'T4',
  'tool-5': 'T5',
};

const DOLL_GRID: (ItemSlot | null)[][] = [
  [null, 'head', null],
  ['focus', 'neck', 'hands'],
  ['main-hand', 'chest', 'off-hand'],
  ['ring-1', 'back', 'ring-2'],
  [null, 'feet', null]
];

const SIDE_SLOTS: ItemSlot[] = ['clothes', 'acc-1', 'acc-2', 'acc-3', 'acc-4'];
const BOTTOM_SLOTS: ItemSlot[] = ['tool-1', 'tool-2', 'tool-3', 'tool-4', 'tool-5'];

export const EquipmentDoll: React.FC<ItemDollProps> = ({ activeSlots, equippedItems = {}, onSlotClick, className }) => {
  const renderSlot = (slot: ItemSlot) => {
    const isActive = activeSlots.includes(slot);
    const equippedItem = equippedItems[slot];
    const Icon = SLOT_ICONS[slot];
    
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
              {SLOT_LABELS[slot]}
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
