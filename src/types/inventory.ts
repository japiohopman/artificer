
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
export interface SlotAcceptanceRules {
  kinds?: ItemKind[];
  weaponCategory?: string;
  armorCategory?: string;
  toolType?: string;
  focusType?: string;
}

export const EQUIPMENT_SLOT_CATALOG = [
  { id: 'main_hand', label: 'Main Hand', accepts: { kinds: ['weapon', 'tool', 'focus'] } as SlotAcceptanceRules },
  { id: 'off_hand', label: 'Off Hand', accepts: { kinds: ['shield', 'weapon', 'tool', 'focus'] } as SlotAcceptanceRules },
  { id: 'ranged', label: 'Ranged', accepts: { kinds: ['weapon'] } as SlotAcceptanceRules },
  { id: 'ammo', label: 'Ammo', accepts: { kinds: ['consumable'] } as SlotAcceptanceRules }, // Ammunition is often categorized as consumable or adventuring_gear
  { id: 'chest', label: 'Body', accepts: { kinds: ['armor'] } as SlotAcceptanceRules },
  { id: 'clothes', label: 'Clothes', accepts: { kinds: ['adventuring_gear', 'trinket'] } as SlotAcceptanceRules },
  { id: 'head', label: 'Head', accepts: { kinds: ['head', 'trinket', 'armor'] } as SlotAcceptanceRules },
  { id: 'hands', label: 'Hands', accepts: { kinds: ['hands', 'trinket', 'armor'] } as SlotAcceptanceRules },
  { id: 'feet', label: 'Feet', accepts: { kinds: ['feet', 'trinket', 'armor'] } as SlotAcceptanceRules },
  { id: 'back', label: 'Back', accepts: { kinds: ['back', 'container'] } as SlotAcceptanceRules },
  { id: 'neck', label: 'Neck', accepts: { kinds: ['neck', 'trinket'] } as SlotAcceptanceRules },
  { id: 'belt', label: 'Belt', accepts: { kinds: ['belt', 'container'] } as SlotAcceptanceRules },
  { id: 'ring_1', label: 'Ring 1', accepts: { kinds: ['ring', 'trinket'] } as SlotAcceptanceRules },
  { id: 'ring_2', label: 'Ring 2', accepts: { kinds: ['ring', 'trinket'] } as SlotAcceptanceRules },
  { id: 'tool_1', label: 'Tool 1', accepts: { kinds: ['tool'] } as SlotAcceptanceRules },
  { id: 'tool_2', label: 'Tool 2', accepts: { kinds: ['tool'] } as SlotAcceptanceRules },
  { id: 'tool_3', label: 'Tool 3', accepts: { kinds: ['tool'] } as SlotAcceptanceRules },
  { id: 'tool_4', label: 'Tool 4', accepts: { kinds: ['tool'] } as SlotAcceptanceRules },
  { id: 'tool_5', label: 'Tool 5', accepts: { kinds: ['tool'] } as SlotAcceptanceRules },
  { id: 'focus', label: 'Focus', accepts: { kinds: ['focus'] } as SlotAcceptanceRules },
  { id: 'pouch', label: 'Pouch', accepts: { kinds: ['container'] } as SlotAcceptanceRules },
  { id: 'acc_1', label: 'Accessory 1', accepts: { kinds: ['trinket', 'adventuring_gear'] } as SlotAcceptanceRules },
  { id: 'acc_2', label: 'Accessory 2', accepts: { kinds: ['trinket', 'adventuring_gear'] } as SlotAcceptanceRules },
  { id: 'acc_3', label: 'Accessory 3', accepts: { kinds: ['trinket', 'adventuring_gear'] } as SlotAcceptanceRules },
  { id: 'acc_4', label: 'Accessory 4', accepts: { kinds: ['trinket', 'adventuring_gear'] } as SlotAcceptanceRules },
  { id: 'quick_1', label: 'Quick 1', accepts: { kinds: ['consumable', 'weapon', 'tool'] } as SlotAcceptanceRules },
  { id: 'quick_2', label: 'Quick 2', accepts: { kinds: ['consumable', 'weapon', 'tool'] } as SlotAcceptanceRules },
  { id: 'quick_3', label: 'Quick 3', accepts: { kinds: ['consumable', 'weapon', 'tool'] } as SlotAcceptanceRules },
  { id: 'quick_4', label: 'Quick 4', accepts: { kinds: ['consumable', 'weapon', 'tool'] } as SlotAcceptanceRules },
] as const;

export type EquipmentSlotId = (typeof EQUIPMENT_SLOT_CATALOG)[number]['id'];
