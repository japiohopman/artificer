import React from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { normalizeImageUrl } from '../../../services/storageService';
import { EquipmentSprite } from '../equipment/EquipmentSprite';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableInventoryItemProps {
  item: any;
  index: any;
  sourceId: string;
  slot?: string;
  compact?: boolean;
  gridMode?: boolean;
  onRemove?: (index: any) => void;
  onEquip?: (item: any) => void;
  id?: string;
}

export const DraggableInventoryItem: React.FC<DraggableInventoryItemProps> = ({ 
  item, index, sourceId, slot, gridMode = false, id
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: id || `item-${item.id || index}-${sourceId}`,
    data: { item, index, sourceId, slotId: slot }
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    useUIStore.getState().setInspectingItem({
      item, sourceId, index: typeof index === 'number' ? index : undefined, itemId: item.id, slot
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useUIStore.getState().setItemActionMenu({
      item,
      sourceId,
      index: typeof index === 'number' ? index : undefined,
      slot,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const isMagic = item.rarity && item.rarity !== 'Common';
  const itemKey = item.template || item.index || item.id || item.name;
  const fallbackUrl = normalizeImageUrl(item.imageUrl || item.image, item._type || 'equipment', item.index || item.id, item.name);

  if (gridMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleInspect}
        onContextMenu={handleContextMenu}
        title={`${item.name} (${item.kind || item._type || 'Item'})${item.quantity > 1 ? ` x${item.quantity}` : ''}`}
        className={cn(
          "aspect-[9/16] w-full bg-parchment-200/80 hover:bg-parchment-200 border-2 border-dragon-gold/30 hover:border-dragon-gold rounded-lg relative flex items-center justify-center p-0 cursor-grab active:cursor-grabbing select-none shadow-xs overflow-hidden pointer-events-auto",
          isMagic && "ring-1 ring-dragon-gold/60 border-dragon-gold bg-dragon-gold/[0.08]",
          isDragging && "opacity-40 border-dashed border-dragon-gold/50 shadow-inner"
        )}
      >
        {/* Direct Artwork Frame: Fills 100% of the 9:16 Slot without inner padding */}
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden pointer-events-none p-0">
          <EquipmentSprite
            itemKey={item}
            alt={item.name}
            className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
            fallbackUrl={fallbackUrl}
          />
        </div>

        {/* Overlay Quantity Badge */}
        {item.quantity > 1 && (
          <span className="absolute bottom-0.5 right-0.5 bg-dragon-darkRed/95 text-white px-1 py-0.2 rounded text-[7px] font-mono font-bold shadow-xs pointer-events-none z-10">
            x{item.quantity}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleInspect}
      onContextMenu={handleContextMenu}
      className={cn(
        "group relative flex items-center gap-2.5 p-2 bg-white/40 hover:bg-white/60 border border-dragon-red/10 hover:border-dragon-red/30 rounded-lg cursor-grab active:cursor-grabbing shadow-xs",
        isMagic && "ring-1 ring-dragon-gold/30 border-dragon-gold/40 bg-dragon-gold/[0.03]",
        isDragging && "opacity-40 border-dashed border-dragon-red/50"
      )}
    >
      <div className="w-10 aspect-[9/16] bg-black/5 rounded overflow-hidden shrink-0 border border-dragon-red/5 flex items-center justify-center p-0">
        <EquipmentSprite 
          itemKey={itemKey}
          alt={item.name}
          className="w-full h-full object-contain p-0"
          fallbackUrl={fallbackUrl}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-tight truncate leading-none mb-0.5">{item.name}</h4>
        <div className="flex items-center gap-1.5">
           <span className="text-[7px] font-bold text-parchment-500 uppercase tracking-tighter">{item._type || 'item'}</span>
           {item.quantity > 1 && <span className="text-[8px] font-black text-dragon-red">x{item.quantity}</span>}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100">
         <GameIcon name="grab" size={12} color="#8B0000" />
      </div>
    </div>
  );
};
