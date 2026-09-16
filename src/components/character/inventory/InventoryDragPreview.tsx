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
        "w-16 aspect-[9/16] bg-parchment-100/95 border-2 border-dragon-gold shadow-2xl rounded-lg flex items-center justify-center p-0 pointer-events-none opacity-95 z-[9999] overflow-hidden",
        isMagic && "ring-2 ring-dragon-gold bg-dragon-gold/10"
      )}
    >
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden p-0">
        <EquipmentSprite
          itemKey={itemKey}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-md"
          fallbackUrl={fallbackUrl}
        />
      </div>

      {item.quantity > 1 && (
        <span className="absolute bottom-1 right-1 bg-dragon-darkRed text-white px-1 py-0.2 rounded font-mono font-bold text-[6px]">
          x{item.quantity}
        </span>
      )}
    </div>
  );
};
