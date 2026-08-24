import React from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon, GameIconName } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { normalizeImageUrl } from '../../../services/storageService';
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
  item, index, sourceId, slot, compact = false, gridMode = false, onRemove, onEquip, id
}) => {
  const { setInspectingItem } = useUIStore();
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
    e.preventDefault();
    e.stopPropagation();
    setInspectingItem({
      item, sourceId, index: typeof index === 'number' ? index : undefined, itemId: item.id, slot
    });
  };

  const isMagic = item.rarity && item.rarity !== 'Common';

  if (gridMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onPointerDown={(e) => {
          // Trigger inspection on click / tap pointer down to bypass drag listener capture
          setInspectingItem({
            item, sourceId, index: typeof index === 'number' ? index : undefined, itemId: item.id, slot
          });
        }}
        onClick={handleInspect}
        title={`${item.name} (${item._type || 'Item'})${item.quantity > 1 ? ` x${item.quantity}` : ''}`}
        className={cn(
          "aspect-[9/16] w-full bg-parchment-200/50 hover:bg-dragon-red/15 border-2 border-dragon-red/15 hover:border-dragon-red/40 rounded-lg relative flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all select-none shadow-sm group overflow-hidden text-left pointer-events-auto",
          isMagic && "ring-1 ring-dragon-gold/50 border-dragon-gold/60 bg-dragon-gold/[0.05]",
          isDragging && "opacity-0 z-50 scale-105"
        )}
      >
        <div className="w-full h-2/3 flex items-center justify-center relative overflow-hidden rounded pointer-events-none">
          <img
            src={normalizeImageUrl(item.imageUrl || item.image, item._type || 'equipment', item.index || item.id, item.name)}
            alt={item.name}
            className="w-full h-full object-contain pointer-events-none drop-shadow-sm group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="w-full text-center pointer-events-none">
          <p className="text-[7px] font-black text-dragon-darkRed uppercase tracking-tight truncate leading-tight w-full px-0.5">
            {item.name}
          </p>
          <div className="flex items-center justify-between w-full mt-0.5 text-[6px] font-bold text-parchment-500 uppercase px-0.5">
            <span className="truncate">{item.kind || item._type || 'item'}</span>
            {item.quantity > 1 && (
              <span className="bg-dragon-red/90 text-white px-1 rounded-sm font-mono font-bold">
                x{item.quantity}
              </span>
            )}
          </div>
        </div>
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
      className={cn(
        "group relative flex items-center gap-3 p-3 bg-white/40 hover:bg-white/60 border border-dragon-red/10 hover:border-dragon-red/30 rounded-xl transition-all cursor-grab active:cursor-grabbing shadow-sm",
        isMagic && "ring-1 ring-dragon-gold/30 border-dragon-gold/40 bg-dragon-gold/[0.03]",
        isDragging && "opacity-0"
      )}
    >
      <div className="w-12 aspect-[9/16] bg-black/5 rounded-lg overflow-hidden shrink-0 border border-dragon-red/5">
        <img 
          src={normalizeImageUrl(item.imageUrl, item._type || 'equipment', item.index || item.id)} 
          alt={item.name}
          className="w-full h-full object-contain p-1"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-tight truncate leading-none mb-1">{item.name}</h4>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-bold text-parchment-500 uppercase tracking-tighter">{item._type || 'item'}</span>
           {item.quantity > 1 && <span className="text-[9px] font-black text-dragon-red">x{item.quantity}</span>}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
         <GameIcon name="grab" size={14} color="#8B0000" />
      </div>
    </div>
  );
};
