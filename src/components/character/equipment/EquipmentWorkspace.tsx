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
import { useUIStore } from '../../../store/useUIStore';
import { Inventory } from '../inventory/Inventory';
import { EquipmentDoll } from './EquipmentDoll';
import { InventoryDragPreview } from '../inventory/InventoryDragPreview';
import { CharacterSelectorBar } from '../inventory/CharacterSelectorBar';
import { ItemActionCard } from '../ItemActionCard';
import { EquipmentCard } from '../../atlas/EquipmentCard';
import { soundService } from '../../../services/soundService';
import { evaluateSlotCompatibility } from '../../../lib/equipmentCompatibility';
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

  const { moveItem, unequipItem } = useInventoryStore();
  const { inspectingItem, setInspectingItem } = useUIStore();
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
    const sourceIndex = activeData.index;
    const sourceContainerId = activeData.containerId;

    let sourceLocation: any;
    if (activeData.type === 'container_slot' && sourceContainerId && typeof sourceIndex === 'number') {
      sourceLocation = { type: 'container_slot' as const, containerId: sourceContainerId, slotIndex: sourceIndex };
    } else if (sourceSlot) {
      sourceLocation = { type: 'equip_slot' as const, slotId: sourceSlot };
    } else {
      sourceLocation = { type: 'inventory_slot' as const, slotIndex: typeof sourceIndex === 'number' ? sourceIndex : undefined };
    }

    // 1. Dragged to a Container Slot
    if (overData.type === 'container_slot' && overData.containerId && overData.slotIndex !== undefined) {
      moveItem({
        source: sourceLocation,
        target: { type: 'container_slot', containerId: overData.containerId, slotIndex: overData.slotIndex },
        item: draggedItem,
        characterId: activeChar.id
      });
      soundService.playEffect('ITEM_SLOT');
      return;
    }

    // 2. Dragged to an Equipment Slot
    if (overData.type === 'equip_slot' && overData.slotId) {
      const targetSlot = overData.slotId;
      const compResult = evaluateSlotCompatibility(draggedItem, targetSlot, activeChar.inventory || {}, activeChar.ruleset);

      if (compResult === 'INVALID') {
        soundService.playEffect('UI_BACK_EXIT');
        return;
      }

      moveItem({
        source: sourceLocation,
        target: { type: 'equip_slot', slotId: targetSlot },
        item: draggedItem,
        characterId: activeChar.id
      });
      soundService.playEffect('ITEM_EQUIP');
      return;
    }

    // 2. Dragged to Specific Inventory Slot
    if (overData.type === 'inventory_slot' && overData.slotIndex !== undefined) {
      moveItem({
        source: sourceLocation,
        target: { type: 'inventory_slot', slotIndex: overData.slotIndex },
        item: draggedItem,
        characterId: activeChar.id
      });
      soundService.playEffect('ITEM_SLOT');
      return;
    }

    // 3. Fallback unequip to Backpack
    if (overData.type === 'backpack' || overData.type === 'inventory') {
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
    <div className={cn("w-full h-full flex flex-col bg-stone-900/40 relative overflow-hidden min-w-0 font-body", className)}>
      {/* Top 6-Position Avatar-First Character Selector Bar */}
      <CharacterSelectorBar />

      {/* Main Fullscreen Workspace Surface */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-hidden relative z-0 min-h-0">
        {/* LEFT ANCHOR: Fixed 320px (`w-80 shrink-0`) Inventory Grid Surface */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col bg-stone-950/80 rounded-xl p-2.5 border border-dragon-gold/40 shadow-2xl overflow-hidden backdrop-blur-md relative z-10">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
            <Inventory
              forceCharacterId={activeChar.id}
              compactEquipped={true}
              showCategoryTabs={!compactMode}
              activeDragItem={activeDragItem}
            />
          </div>
        </div>

        {/* MIDDLE SURFACE: Flexible (`flex-1`) Item Inspection Surface */}
        <div className="flex-1 min-w-[300px] bg-stone-950/70 rounded-xl p-3 border border-dragon-gold/40 shadow-2xl flex flex-col overflow-y-auto custom-scrollbar backdrop-blur-sm relative z-0">
          <div className="flex items-center justify-between border-b border-dragon-gold/20 pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <GameIcon name="info" size={14} color="#D4AF37" />
              <span className="font-header text-xs text-dragon-gold uppercase tracking-wider font-bold">
                Item Inspection & Details
              </span>
            </div>
            {inspectingItem && (
              <button
                onClick={() => setInspectingItem(null)}
                className="text-parchment-400 hover:text-white transition-colors cursor-pointer"
                title="Close Inspection"
              >
                <GameIcon name="close" size={14} color="currentColor" />
              </button>
            )}
          </div>

          {inspectingItem && inspectingItem.item ? (
            <div className="flex-1 flex flex-col items-center justify-start gap-3 animate-fade-in w-full max-w-2xl mx-auto">
              <EquipmentCard equipment={inspectingItem.item} variant="inspector" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2 opacity-50 select-none">
              <div className="w-14 h-14 rounded-full border border-dragon-gold/30 flex items-center justify-center bg-black/40">
                <GameIcon name="search" size={24} color="#D4AF37" />
              </div>
              <p className="text-xs font-header font-bold text-dragon-gold uppercase tracking-wider">
                No Item Selected
              </p>
              <p className="text-[9px] font-mono text-parchment-400 max-w-[240px]">
                Click or right-click any item in your inventory or paper doll to inspect its full stats, mechanics, and nested container contents.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT ANCHOR: Fixed 320px (`w-80 shrink-0`) Equipment Doll Surface */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col bg-stone-950/80 rounded-xl p-2.5 border border-dragon-gold/40 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="w-full flex items-center justify-between border-b border-dragon-gold/20 pb-1.5 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <GameIcon name="shield" size={15} className="text-dragon-gold" />
              <span className="font-header text-xs text-dragon-gold uppercase tracking-wider font-bold truncate">
                Equipment Doll
              </span>
            </div>
            <span className="text-[9px] font-mono text-parchment-400 uppercase tracking-widest shrink-0">
              320px Anchor Surface
            </span>
          </div>

          <div className="flex-1 w-full flex items-center justify-center p-1 overflow-y-auto custom-scrollbar relative">
            <EquipmentDoll
              activeSlots={[]}
              activeDragItem={activeDragItem}
              equippedItems={activeChar.inventory || {}}
              equipment={activeChar.equipment}
              items={activeChar.items}
              gender={activeChar.gender}
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
