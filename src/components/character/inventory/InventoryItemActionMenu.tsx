import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import { GameIcon, GameIconName } from '../../../game_icons';
import { soundService } from '../../../services/soundService';
import { cn } from '../../../lib/utils';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: GameIconName;
  destructive?: boolean;
  hasSubmenu?: boolean;
  submenuItems?: { id: string; label: string; icon?: GameIconName }[];
  handler: (targetId?: string) => void;
}

export function validateItemStillExists(
  item: any,
  sourceId: string,
  slot?: string,
  characters: any[] = [],
  partyInventory: any[] = []
): boolean {
  if (!item || !item.id) return false;

  if (sourceId === 'party') {
    return partyInventory.some(i => i && i.id === item.id);
  }

  const char = characters.find(c => c.id === sourceId);
  if (!char) return false;

  if (char.saveVersion === 2) {
    if (slot && char.equipment?.slots) {
      const equipSlot = char.equipment.slots.find((s: any) => s.id === slot);
      return equipSlot?.itemId === item.id;
    }
    return Boolean(char.items && char.items[item.id]);
  }

  if (slot && char.inventory) {
    return char.inventory[slot]?.id === item.id;
  }

  return Array.isArray(char.backpack) && char.backpack.some((i: any) => i && i.id === item.id);
}

export function getAvailableItemActions(
  item: any,
  sourceId: string,
  slot: string | undefined,
  characters: any[],
  partyInventory: any[],
  callbacks: {
    onEquip: () => void;
    onUnequip: () => void;
    onInspect: () => void;
    onDrop: () => void;
    onSendTo: (targetId: string) => void;
  }
): ActionMenuItem[] {
  if (!item) return [];

  const actions: ActionMenuItem[] = [];
  const isEquipped = Boolean(slot);

  const kind = item.kind || item._type || '';
  const isEquippable = item._type === 'equipment' || [
    'weapon', 'armor', 'shield', 'head', 'feet', 'ring', 'neck', 'back', 'chest'
  ].includes(kind) || Boolean(item.slot);

  // 1. Equip / Unequip
  if (isEquipped) {
    actions.push({
      id: 'unequip',
      label: 'Unequip',
      icon: 'shield',
      handler: callbacks.onUnequip
    });
  } else if (isEquippable) {
    actions.push({
      id: 'equip',
      label: 'Equip',
      icon: 'shield',
      handler: callbacks.onEquip
    });
  }

  // 2. Inspect
  actions.push({
    id: 'inspect',
    label: 'Inspect',
    icon: 'search',
    handler: callbacks.onInspect
  });

  // 3. Send To (Destinations chooser)
  const destinations: { id: string; label: string; icon?: GameIconName }[] = [];

  if (sourceId === 'party') {
    characters.forEach(char => {
      destinations.push({
        id: char.id,
        label: char.name,
        icon: 'user'
      });
    });
  } else {
    // Source is a character
    destinations.push({
      id: 'party',
      label: 'Shared Armory',
      icon: 'package'
    });
    characters.forEach(char => {
      if (char.id !== sourceId) {
        destinations.push({
          id: char.id,
          label: char.name,
          icon: 'user'
        });
      }
    });
  }

  if (destinations.length > 0) {
    actions.push({
      id: 'send_to',
      label: 'Send To',
      icon: 'panel',
      hasSubmenu: true,
      submenuItems: destinations,
      handler: (targetId) => {
        if (targetId) callbacks.onSendTo(targetId);
      }
    });
  }

  // 4. Drop
  actions.push({
    id: 'drop',
    label: 'Drop',
    icon: 'delete',
    destructive: true,
    handler: callbacks.onDrop
  });

  return actions;
}

export const InventoryItemActionMenu: React.FC = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { itemActionMenu, setItemActionMenu, setInspectingItem } = useUIStore();
  const { characters } = useCharacterStore();
  const { partyInventory, equipItem, unequipItem, removeFromBackpack, removeFromPartyInventory, transferItem } = useInventoryStore();

  const [activeSubmenu, setActiveSubmenu] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeMenu = itemActionMenu;

  useLayoutEffect(() => {
    if (!activeMenu) return;

    let x = activeMenu.position.x;
    let y = activeMenu.position.y;

    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const menuWidth = rect.width || 180;
      const menuHeight = rect.height || 160;

      if (x + menuWidth > window.innerWidth - 8) {
        x = window.innerWidth - menuWidth - 8;
      }
      if (y + menuHeight > window.innerHeight - 8) {
        y = window.innerHeight - menuHeight - 8;
      }
      if (x < 8) x = 8;
      if (y < 8) y = 8;
    }

    setMenuPos({ x, y });
  }, [activeMenu]);

  useEffect(() => {
    if (!activeMenu) return;
    setFocusedIndex(0);
    setActiveSubmenu(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setItemActionMenu(null);
      }
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setItemActionMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDownOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [activeMenu, setItemActionMenu]);

  if (!activeMenu) return null;

  const { item, sourceId, index, slot } = activeMenu;

  // Stale check
  const isStillValid = validateItemStillExists(item, sourceId, slot, characters, partyInventory);

  const handleClose = () => {
    setItemActionMenu(null);
  };

  const handleExecute = (action: ActionMenuItem, targetId?: string) => {
    // Re-validate right before execution
    if (!validateItemStillExists(item, sourceId, slot, characters, partyInventory)) {
      handleClose();
      return;
    }

    action.handler(targetId);
    soundService.playEffect('UI_CLICK_LIGHT');
    handleClose();
  };

  const actions = getAvailableItemActions(item, sourceId, slot, characters, partyInventory, {
    onEquip: () => {
      const targetSlot = slot || item.slot || (item.kind === 'shield' ? 'off_hand' : 'main_hand');
      equipItem(item.id || item, targetSlot);
    },
    onUnequip: () => {
      if (slot) unequipItem(slot);
    },
    onInspect: () => {
      setInspectingItem({
        item,
        sourceId,
        index: typeof index === 'number' ? index : undefined,
        itemId: item.id,
        slot
      });
    },
    onDrop: () => {
      if (sourceId === 'party') {
        removeFromPartyInventory(item.id);
      } else {
        removeFromBackpack(typeof index === 'number' ? index : item.id);
      }
    },
    onSendTo: (targetId) => {
      transferItem({
        sourceId,
        targetId,
        itemId: item.id
      });
    }
  });

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${menuPos.x}px`,
        top: `${menuPos.y}px`,
        zIndex: 9999
      }}
      role="menu"
      aria-label="Item Context Menu"
      className="w-48 bg-stone-900/95 border-2 border-dragon-gold/60 rounded-xl shadow-2xl backdrop-blur-md p-1.5 text-parchment-100 animate-in fade-in zoom-in-95 duration-100 select-none font-sans"
    >
      {/* Header Item Name */}
      <div className="px-2.5 py-1.5 border-b border-dragon-gold/20 mb-1 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-dragon-gold truncate block max-w-[130px]">
          {item.name || item.template || 'Item'}
        </span>
        {item.quantity > 1 && (
          <span className="text-[9px] font-mono font-bold text-parchment-400 bg-black/40 px-1 rounded">
            x{item.quantity}
          </span>
        )}
      </div>

      {!isStillValid ? (
        <div className="px-2.5 py-2 text-[10px] text-red-400 italic text-center">
          Item no longer available
        </div>
      ) : (
        <div className="space-y-0.5">
          {actions.map((action, i) => (
            <div key={action.id} className="relative group">
              <button
                role="menuitem"
                onClick={() => {
                  if (action.hasSubmenu) {
                    setActiveSubmenu(!activeSubmenu);
                  } else {
                    handleExecute(action);
                  }
                }}
                onMouseEnter={() => {
                  setFocusedIndex(i);
                  if (action.hasSubmenu) setActiveSubmenu(true);
                  else setActiveSubmenu(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all text-left cursor-pointer",
                  action.destructive
                    ? "text-red-400 hover:bg-dragon-red/30 hover:text-red-200"
                    : "text-parchment-200 hover:bg-dragon-gold/20 hover:text-white",
                  focusedIndex === i && (action.destructive ? "bg-dragon-red/30 text-red-200" : "bg-dragon-gold/20 text-white")
                )}
              >
                <div className="flex items-center gap-2">
                  <GameIcon name={action.icon} size={14} className={action.destructive ? "text-red-400" : "text-dragon-gold"} />
                  <span>{action.label}</span>
                </div>
                {action.hasSubmenu && (
                  <span className="text-[10px] text-parchment-400">▶</span>
                )}
              </button>

              {/* Submenu Chooser for Send To */}
              {action.hasSubmenu && activeSubmenu && action.submenuItems && (
                <div
                  className="absolute left-full top-0 ml-1 w-44 bg-stone-900/95 border-2 border-dragon-gold/60 rounded-xl shadow-2xl backdrop-blur-md p-1.5 space-y-0.5 z-[10000]"
                  role="menu"
                >
                  <div className="px-2 py-1 text-[8px] font-black uppercase text-dragon-gold/80 border-b border-dragon-gold/20 mb-1">
                    Select Destination
                  </div>
                  {action.submenuItems.map(dest => (
                    <button
                      key={dest.id}
                      role="menuitem"
                      onClick={() => handleExecute(action, dest.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide text-parchment-200 hover:bg-dragon-gold/20 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <GameIcon name={dest.icon || 'user'} size={12} className="text-dragon-gold" />
                      <span className="truncate">{dest.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
