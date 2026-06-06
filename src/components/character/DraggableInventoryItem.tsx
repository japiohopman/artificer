import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { isBookLike } from '../../lib/bookUtils';
import { useStore } from '../../store/useStore';
import { normalizeImageUrl } from '../../services/storageService';
import { GameIcon } from '../../game_icons';
import { ChromaKeyImage } from '../ChromaKeyImage';

interface DraggableInventoryItemProps {
  item: any;
  index?: number | string;
  itemId?: string;
  sourceId: string;
  slot?: string;
  compact?: boolean;
  gridMode?: boolean;
  onRemove?: (index: any) => void;
  onEquip?: (item: any) => void;
  id?: string;
}

export const DraggableInventoryItem: React.FC<DraggableInventoryItemProps> = ({ 
  item, 
  index, 
  sourceId, 
  slot,
  compact = false,
  gridMode = false,
  onRemove,
  onEquip,
  id,
  itemId
}) => {
  const effectiveItemId = itemId || item.id || String(index);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: slot ? `${sourceId}-equipped-${slot}` : `${sourceId}-${effectiveItemId}`,
    data: {
      item,
      sourceId,
      itemId: effectiveItemId,
      slot
    }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const renderValue = (val: any) => {
    if (!val) return null;
    if (typeof val === 'object') return val.name || val.value || JSON.stringify(val);
    return val;
  };

  return (
    <div
      ref={setNodeRef}
      id={id}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (isBookLike(item)) {
          useStore.getState().setFocusedItem(item);
        } else {
          useStore.getState().setInspectingItem({ item, sourceId, itemId: effectiveItemId, slot });
        }
      }}
      className={cn(
        "bg-white border border-[#c5a059]/30 rounded-sm transition-colors cursor-grab active:cursor-grabbing touch-none relative",
        !gridMode && "flex items-center gap-2 p-1.5",
        gridMode && "aspect-[9/16] flex flex-col items-center justify-center p-0.5",
        "group hover:bg-white/60",
        isDragging && "opacity-50 ring-2 ring-dragon-red/40 z-50",
        compact && !gridMode && "p-1 gap-1.5"
      )}
    >
      <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
        <img src="https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1775921630292-back_item_slug.webp" alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className={cn(
        "bg-black/5 rounded-sm border border-[#c5a059]/10 flex-none relative z-10",
        gridMode ? "w-full h-full" : (compact ? "w-8 aspect-[9/16]" : "w-10 aspect-[9/16]")
      )}>
        <ChromaKeyImage 
          src={normalizeImageUrl(item.imageUrl, item._type || 'equipment', item.index || item.id)} 
          alt={String(renderValue(item.name))} 
          className="h-[90%] w-auto object-contain mx-auto"
        />
        {item.quantity > 1 && (
          <div className="absolute top-0 left-0 bg-dragon-darkRed text-white text-[6px] font-black italic px-0.5 min-w-[12px] text-center border-b border-r border-[#c5a059]/30 rounded-br-sm z-10 shadow-sm">
            {item.quantity}
          </div>
        )}
      </div>
      
      {!gridMode && (
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-bold text-dragon-red uppercase tracking-tighter truncate",
            compact ? "text-[8px]" : "text-[9px]"
          )}>
            {renderValue(item.name)}{item.quantity > 1 && <span className="ml-1 text-[#8B4513] font-black underline italic">x{item.quantity}</span>}
          </div>
          {!compact && (
            <div className="text-[7px] text-parchment-500 uppercase font-bold flex items-center gap-1.5">
              {item.weight && (
                <span className="flex items-center gap-0.5">
                  <GameIcon name="weight" size={7} color="#8B4513" /> {item.weight}
                </span>
              )}
              <span className="text-dragon-red/40">•</span>
              <span>{item._type}</span>
            </div>
          )}
        </div>
      )}

      {!gridMode && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEquip && item._type === 'equipment' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEquip(item);
              }}
              className="p-1 bg-dragon-red text-white rounded hover:bg-red-700 transition-colors shadow-sm"
            >
              <GameIcon name="chevron_right" size={10} color="#FFFFFF" />
            </button>
          )}
          {onRemove && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(effectiveItemId);
              }}
              className="p-1 px-1.5 text-parchment-400 hover:text-red-600 transition-colors"
            >
              <GameIcon name="trash" size={12} color="currentColor" />
            </button>
          )}
        </div>
      )}
      
      {gridMode && (
         <>
          <div className="absolute inset-x-0 bottom-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-center pointer-events-none z-20">
              <div className="text-[5px] text-white font-black truncate uppercase tracking-tighter">
                 {renderValue(item.name)}
              </div>
          </div>
          {item._type === 'equipment' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Find first valid slot for this item and equip
                const slot = Array.isArray(item.slot) ? item.slot[0] : item.slot;
                if (slot) {
                  useStore.getState().equipItem(item, slot);
                }
              }}
              className="absolute top-1 right-1 p-1 bg-dragon-red text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg"
              title="Equip"
            >
              <GameIcon name="chevron_right" size={8} color="#FFFFFF" />
            </button>
          )}
         </>
      )}
    </div>
  );
};
