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

  return (
    <div className="w-12 aspect-[9/16] p-0 pointer-events-none z-[10100] overflow-visible flex items-center justify-center">
      <EquipmentSprite
        itemKey={itemKey}
        alt={item.name || 'Item'}
        className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] pointer-events-none"
        fallbackUrl={fallbackUrl}
      />
    </div>
  );
};
