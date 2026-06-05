
/**
 * ITEM INSTANCE MODEL (v2)
 * Based on RAPPORT_SAVE_SLOTS.md
 */

export type ItemKind = 
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'head'
  | 'hands'
  | 'feet'
  | 'back'
  | 'neck'
  | 'belt'
  | 'ring'
  | 'adventuring_gear'
  | 'equipment_pack'
  | 'tool'
  | 'focus'
  | 'vehicle'
  | 'mount'
  | 'container'
  | 'consumable'
  | 'trinket'
  | 'currency'
  | 'book'
  | 'trash'
  | 'material'
  | 'monster_part'
  | 'bundled_material'
  | 'quest';

export interface ItemInstance {
  id: string;         // Unique instance ID
  template: string;   // Reference to the template index
  quantity: number;
  durability?: number;
  charges?: number;
  isAttuned?: boolean;
  isIdentified?: boolean;
  customName?: string;
  notes?: string;
  containerId?: string;
  addedAt?: number;
  isMagic?: boolean;
  kind?: ItemKind;    // Cached discriminator from template
}

export interface InventorySlot {
  id: string;         // Slot identifier (e.g., "main_hand", "bag_0")
  itemId: string | null;
}

export interface InventoryContainer {
  id: string;         // Unique container ID
  name?: string;
  type: 'backpack' | 'pouch' | 'chest' | 'bank' | 'corpse' | 'merchant' | 'equipment';
  ownerId?: string;    // Character ID or Entity ID
  slots: InventorySlot[];
}

/**
 * STANDARD EQUIPMENT SLOTS
 * The "Equipable" catalog for characters
 */
export const EQUIPMENT_SLOT_CATALOG = [
  { id: 'main_hand', label: 'Main Hand' },
  { id: 'off_hand', label: 'Off Hand' },
  { id: 'ranged', label: 'Ranged' },
  { id: 'ammo', label: 'Ammo' },
  { id: 'chest', label: 'Body' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'head', label: 'Head' },
  { id: 'hands', label: 'Hands' },
  { id: 'feet', label: 'Feet' },
  { id: 'back', label: 'Back' },
  { id: 'neck', label: 'Neck' },
  { id: 'belt', label: 'Belt' },
  { id: 'ring_1', label: 'Ring 1' },
  { id: 'ring_2', label: 'Ring 2' },
  { id: 'tool_1', label: 'Tool 1' },
  { id: 'tool_2', label: 'Tool 2' },
  { id: 'tool_3', label: 'Tool 3' },
  { id: 'tool_4', label: 'Tool 4' },
  { id: 'tool_5', label: 'Tool 5' },
  { id: 'focus', label: 'Focus' },
  { id: 'pouch', label: 'Pouch' },
  { id: 'acc_1', label: 'Accessory 1' },
  { id: 'acc_2', label: 'Accessory 2' },
  { id: 'acc_3', label: 'Accessory 3' },
  { id: 'acc_4', label: 'Accessory 4' },
  { id: 'quick_1', label: 'Quick 1' },
  { id: 'quick_2', label: 'Quick 2' },
  { id: 'quick_3', label: 'Quick 3' },
  { id: 'quick_4', label: 'Quick 4' },
] as const;

export type EquipmentSlotId = (typeof EQUIPMENT_SLOT_CATALOG)[number]['id'];
