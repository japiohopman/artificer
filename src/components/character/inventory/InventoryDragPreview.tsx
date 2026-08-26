import React from 'react';
import { EquipmentSprite } from '../equipment/EquipmentSprite';
import { normalizeImageUrl } from '../../../services/storageService';
import { cn } from '../../../lib/utils';

interface InventoryDragPreviewProps {
  item: any;
}

export const InventoryDragPreview: React.FC<InventoryDragPreviewProps> = ({ item }) => {
  if (!item) return null;

  const itemKey = item.template || item.index || item.id || item.name;
  const fallbackUrl = normalizeImageUrl(item.imageUrl || item.image, item._type || 'equipment', item.index || item.id, item.name);
  const isMagic = item.rarity && item.rarity !== 'Common';

  return (
    <div
      className={cn(
        "w-20 aspect-[9/16] bg-parchment-100 border-2 border-dragon-gold shadow-2xl rounded-lg flex flex-col items-center justify-between p-1.5 pointer-events-none scale-105 rotate-1 opacity-95 z-[9999]",
        isMagic && "ring-2 ring-dragon-gold bg-dragon-gold/10"
      )}
    >
      <div className="w-full h-2/3 flex items-center justify-center relative overflow-hidden rounded">
        <EquipmentSprite
          itemKey={itemKey}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-md"
          fallbackUrl={fallbackUrl}
        />
      </div>

      <div className="w-full text-center">
        <p className="text-[7px] font-black text-dragon-darkRed uppercase tracking-tight truncate leading-tight w-full px-0.5">
          {item.name}
        </p>
        {item.quantity > 1 && (
          <span className="bg-dragon-red text-white px-1 rounded-sm font-mono font-bold text-[6px]">
            x{item.quantity}
          </span>
        )}
      </div>
    </div>
  );
};
