import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableInventoryItem } from './DraggableInventoryItem';
import { cn } from '../../../lib/utils';
import { useUIStore } from '../../../store/useUIStore';

interface InventorySlotProps {
  slotIndex: number;
  item?: any;
  characterId: string;
  containerId?: string;
  activeDragItem?: any;
  onClick?: () => void;
}

export const InventorySlot: React.FC<InventorySlotProps> = ({
  slotIndex,
  item,
  characterId,
  containerId,
  activeDragItem,
  onClick
}) => {
  const isNestedContainer = Boolean(containerId);

  const { setNodeRef, isOver } = useDroppable({
    id: isNestedContainer ? `container-slot-${containerId}-${slotIndex}` : `inventory-slot-${slotIndex}`,
    data: isNestedContainer
      ? { type: 'container_slot', containerId, slotIndex, characterId }
      : { type: 'inventory_slot', slotIndex, characterId }
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item) return;

    useUIStore.getState().setItemActionMenu({
      item,
      sourceId: characterId,
      index: slotIndex,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "aspect-[9/16] w-full rounded-[3px] border p-0 flex items-center justify-center relative transition-all duration-150 select-none overflow-hidden cursor-pointer",
        item
          ? "border-dragon-gold/40 bg-stone-900/90 shadow-xs"
          : "bg-black/20 border-dashed border-parchment-300/30 hover:border-dragon-gold/30 hover:bg-black/25",
        isOver && "border-dragon-gold bg-dragon-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.5)] z-10",
        activeDragItem && !item && !isOver && "border-dragon-gold/30 bg-dragon-gold/5"
      )}
    >
      {/* Background Image Slug */}
      <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none">
        <img src="/assets/ui/back_item_slug.webp" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      {item ? (
        <DraggableInventoryItem
          item={item}
          index={slotIndex}
          sourceId={characterId}
          gridMode={true}
          containerId={containerId}
        />
      ) : (
        <span className="text-[7px] font-mono font-bold text-parchment-400/40 pointer-events-none select-none z-10">
          {slotIndex + 1}
        </span>
      )}
    </div>
  );
};
