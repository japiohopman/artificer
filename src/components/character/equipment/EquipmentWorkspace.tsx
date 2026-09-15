import React, { useState, useRef } from 'react';
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useActiveCharacter, selectCharacterById } from '../../../lib/character';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { Inventory } from '../inventory/Inventory';
import { EquipmentDoll } from './EquipmentDoll';
import { InventoryDragPreview } from '../inventory/InventoryDragPreview';
import { soundService } from '../../../services/soundService';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';

interface EquipmentWorkspaceProps {
  forceCharacterId?: string;
  className?: string;
  compactMode?: boolean;
  standalone?: boolean;
}

export const EquipmentWorkspace: React.FC<EquipmentWorkspaceProps> = ({
  forceCharacterId,
  className,
  compactMode = false,
  standalone = true
}) => {
  const storeActiveChar = useActiveCharacter();
  const forcedChar = useCharacterStore(state => forceCharacterId ? selectCharacterById(state, forceCharacterId) : undefined);
  const activeChar = forcedChar || storeActiveChar;

  const { equipItem, unequipItem } = useInventoryStore();
  const [activeDragItem, setActiveDragItem] = useState<any>(null);
  const lastHoverTargetRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  if (!activeChar) {
    return <div className="p-4 text-[10px] text-parchment-400 italic">No active character loaded</div>;
  }

  const handleDragStart = (event: DragStartEvent) => {
    const item = event.active.data.current?.item;
    if (item) {
      setActiveDragItem(item);
      soundService.playEffect('ITEM_GRAB');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    if (overId && overId !== lastHoverTargetRef.current) {
      lastHoverTargetRef.current = overId;
      soundService.playEffect('UI_CLICK_LIGHT');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const item = activeDragItem;
    setActiveDragItem(null);
    lastHoverTargetRef.current = null;

    const { active, over } = event;
    if (!active || !over) {
      soundService.playEffect('UI_BACK_EXIT');
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) {
      soundService.playEffect('UI_BACK_EXIT');
      return;
    }

    const draggedItem = activeData.item || item;
    const sourceSlot = activeData.slotId;

    // 1. Dragged to an Equipment Slot
    if (overData.type === 'equip_slot' && overData.slotId) {
      const targetSlot = overData.slotId;
      if (draggedItem) {
        equipItem(draggedItem, targetSlot);
        soundService.playEffect('ITEM_EQUIP');
      }
      return;
    }

    // 2. Dragged from Equipment Slot back to Backpack or Inventory Slot
    if (overData.type === 'backpack' || overData.type === 'inventory' || overData.type === 'inventory_slot') {
      if (sourceSlot) {
        unequipItem(sourceSlot);
        soundService.playEffect('ITEM_SLOT');
      }
      return;
    }
  };

  const handleDragCancel = () => {
    setActiveDragItem(null);
    lastHoverTargetRef.current = null;
    soundService.playEffect('UI_BACK_EXIT');
  };

  const workspaceContent = (
    <div className={cn("w-full h-full flex flex-col md:flex-row gap-2 p-1.5 bg-black/20 rounded-lg border border-dragon-gold/20 relative overflow-hidden min-w-0", className)}>
      {/* LEFT: Compact Inventory Grid (Source) */}
      <div className="flex-[1.2] min-w-[240px] flex flex-col bg-white/50 rounded-md p-1.5 border border-dragon-red/15 shadow-inner overflow-hidden">
        <div className="flex items-center justify-between border-b border-dragon-red/15 pb-1 mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <GameIcon name="package" size={13} className="text-dragon-red" />
            <span className="font-header text-[10px] text-dragon-darkRed uppercase tracking-wider font-bold truncate">
              Available Gear
            </span>
          </div>
          <span className="text-[7px] font-mono font-bold text-parchment-500 uppercase shrink-0">
            Drag to Equip
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
          <Inventory
            forceCharacterId={activeChar.id}
            compactEquipped={true}
            showCategoryTabs={!compactMode}
            activeDragItem={activeDragItem}
          />
        </div>
      </div>

      {/* RIGHT: Equipment Doll (Target) */}
      <div className="flex-1 min-w-[240px] flex flex-col items-center justify-center bg-black/30 rounded-md p-1.5 border border-dragon-gold/30 shadow-inner relative overflow-hidden">
        <div className="w-full flex items-center justify-between border-b border-dragon-gold/20 pb-1 mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <GameIcon name="shield" size={13} className="text-dragon-gold" />
            <span className="font-header text-[10px] text-dragon-gold uppercase tracking-wider font-bold truncate">
              Equipment Doll
            </span>
          </div>
          <span className="text-[7px] font-mono text-dragon-gold/70 uppercase shrink-0">
            Paper Doll
          </span>
        </div>

        <div className="flex-1 w-full flex items-center justify-center p-0.5 overflow-y-auto custom-scrollbar">
          <EquipmentDoll
            activeSlots={[]}
            activeDragItem={activeDragItem}
            equippedItems={activeChar.inventory || {}}
            equipment={activeChar.equipment}
            items={activeChar.items}
            onSlotClick={(slot) => {
              if (activeChar.inventory?.[slot] || activeChar.equipment?.slots?.find((s: any) => s.id === slot)?.itemId) {
                unequipItem(slot);
                soundService.playEffect('ITEM_SLOT');
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  if (!standalone) {
    return workspaceContent;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragItem ? <InventoryDragPreview item={activeDragItem} /> : null}
      </DragOverlay>
      {workspaceContent}
    </DndContext>
  );
};
