import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { cn } from '../../../lib/utils';

interface InventorySlotProps {
  slotIndex: number;
  item?: any;
  characterId: string;
  activeDragItem?: any;
  onClick?: () => void;
}

export const InventorySlot: React.FC<InventorySlotProps> = ({
  slotIndex,
  item,
  characterId,
  activeDragItem,
  onClick
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `inventory-slot-${slotIndex}`,
    data: { type: 'inventory_slot', slotIndex, characterId }
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "aspect-square w-full rounded-lg border flex flex-col items-center justify-center relative transition-all duration-150 select-none overflow-hidden",
        item
          ? "bg-parchment-200/60 border-dragon-gold/40 shadow-xs hover:border-dragon-gold hover:bg-parchment-200/90"
          : "bg-black/10 border-dashed border-parchment-300/30 hover:border-dragon-gold/30 hover:bg-black/15",
        isOver && "border-dragon-gold bg-dragon-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.5)] scale-105 z-10",
        activeDragItem && !item && !isOver && "border-dragon-gold/30 bg-dragon-gold/5"
      )}
    >
      {item ? (
        <DraggableInventoryItem
          item={item}
          index={slotIndex}
          sourceId={characterId}
          gridMode={true}
        />
      ) : (
        <span className="text-[7px] font-mono font-bold text-parchment-400/40 pointer-events-none select-none">
          {slotIndex + 1}
        </span>
      )}
    </div>
  );
};
