import { 
  Circle, Gem, Shirt, Ghost, Sword, Shield, Hand, 
  Footprints, Zap, Wrench, Package, Disc
} from 'lucide-react';
import { GameIconName } from '../game_icons';

export type EquipmentSlotId = 
  | 'head' | 'neck' | 'chest' | 'back' 
  | 'main_hand' | 'off_hand' | 'hands' | 'feet' 
  | 'ring_1' | 'ring_2' | 'focus'
  | 'clothes' | 'acc_1' | 'acc_2' | 'acc_3' | 'acc_4'
  | 'tool_1' | 'tool_2' | 'tool_3' | 'tool_4' | 'tool_5'
  | 'extra' | 'ammo';

export interface SlotDefinition {
  id: EquipmentSlotId;
  label: string;
  icon: any; // Lucide icon component
  gameIcon: GameIconName;
}

export const EQUIPMENT_SLOTS: Record<EquipmentSlotId, SlotDefinition> = {
  'head': { id: 'head', label: 'Head', icon: Circle, gameIcon: 'head' },
  'neck': { id: 'neck', label: 'Neck', icon: Gem, gameIcon: 'neckles' },
  'chest': { id: 'chest', label: 'Chest', icon: Shirt, gameIcon: 'chest' },
  'back': { id: 'back', label: 'Back', icon: Ghost, gameIcon: 'cloak' },
  'main_hand': { id: 'main_hand', label: 'Main', icon: Sword, gameIcon: 'weapon' },
  'off_hand': { id: 'off_hand', label: 'Off', icon: Shield, gameIcon: 'shield' },
  'hands': { id: 'hands', label: 'Hands', icon: Hand, gameIcon: 'hand' },
  'feet': { id: 'feet', label: 'Feet', icon: Footprints, gameIcon: 'boots' },
  'ring_1': { id: 'ring_1', label: 'R1', icon: Gem, gameIcon: 'ring' },
  'ring_2': { id: 'ring_2', label: 'R2', icon: Gem, gameIcon: 'ring' },
  'focus': { id: 'focus', label: 'Focus', icon: Zap, gameIcon: 'focus' },
  'clothes': { id: 'clothes', label: 'Cloth', icon: Shirt, gameIcon: 'shirt' },
  'acc_1': { id: 'acc_1', label: 'Acc 1', icon: Gem, gameIcon: 'gem' },
  'acc_2': { id: 'acc_2', label: 'Acc 2', icon: Gem, gameIcon: 'gem' },
  'acc_3': { id: 'acc_3', label: 'Acc 3', icon: Gem, gameIcon: 'gem' },
  'acc_4': { id: 'acc_4', label: 'Acc 4', icon: Gem, gameIcon: 'gem' },
  'tool_1': { id: 'tool_1', label: 'T1', icon: Wrench, gameIcon: 'tools' },
  'tool_2': { id: 'tool_2', label: 'T2', icon: Wrench, gameIcon: 'tools' },
  'tool_3': { id: 'tool_3', label: 'T3', icon: Wrench, gameIcon: 'tools' },
  'tool_4': { id: 'tool_4', label: 'T4', icon: Wrench, gameIcon: 'tools' },
  'tool_5': { id: 'tool_5', label: 'T5', icon: Wrench, gameIcon: 'tools' },
  'extra': { id: 'extra', label: 'Extra', icon: Package, gameIcon: 'pouch' },
  'ammo': { id: 'ammo', label: 'Ammo', icon: Disc, gameIcon: 'ammunition' },
};

export const DOLL_GRID: (EquipmentSlotId | null)[][] = [
  [null, 'head', null],
  ['focus', 'neck', 'hands'],
  ['main_hand', 'chest', 'off_hand'],
  ['ring_1', 'back', 'ring_2'],
  [null, 'feet', null]
];

export const SIDE_SLOTS: EquipmentSlotId[] = ['clothes', 'acc_1', 'acc_2', 'acc_3', 'acc_4'];
export const BOTTOM_SLOTS: EquipmentSlotId[] = ['tool_1', 'tool_2', 'tool_3', 'tool_4', 'tool_5'];
export const AUX_SLOTS: EquipmentSlotId[] = [...SIDE_SLOTS, 'extra', 'ammo', ...BOTTOM_SLOTS];
