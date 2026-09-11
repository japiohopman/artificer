import { Character } from '../store/useCharacterStore';
import { GameIconName } from '../game_icons';

export interface ActionHudAction {
  id: string;
  name: string;
  icon: GameIconName;
  color: string;
  description: string;
  range?: number;
  targetType?: 'single' | 'sphere';
  radius?: number;
  category: string;
  actionType?: 'actions' | 'bonusActions' | 'reactions' | 'movement' | 'objectInteractions';
  data?: any;
}

/**
 * Dynamically generates a list of actions available to a character
 * based on their class, spells, and equipment.
 */
export const getCharacterActions = (character: Character | null): ActionHudAction[] => {
  if (!character) return [];
  
  const actions: ActionHudAction[] = [];

  // 1. Standard Actions (Always available)
  actions.push({
    id: 'attack',
    name: 'Attack',
    icon: 'melee',
    color: 'bg-dragon-red',
    description: 'Strike with your equipped weapon.',
    range: 1,
    category: 'Standard',
    actionType: 'actions'
  });

  actions.push({
    id: 'move',
    name: 'Move',
    icon: 'footsteps',
    color: 'bg-blue-600',
    description: 'Change position on the grid.',
    range: 6,
    category: 'Standard',
    actionType: 'movement'
  });

  // 2. Class-Specific Skills / Features
  if (character.features) {
    character.features.forEach(feature => {
      // Add all features as skill actions for now
      actions.push({
        id: `feature-${feature.index}`,
        name: feature.name,
        icon: 'skill',
        color: 'bg-emerald-600',
        description: feature.desc || 'Special ability.',
        category: 'Skills',
        actionType: 'actions' // Default to action for now
      });
    });
  }

  // 3. Spells
  if (character.knownSpells) {
    character.knownSpells.forEach(spell => {
      const isAoe = spell.area_of_effect !== undefined;
      const isBonus = spell.casting_time?.toLowerCase().includes('bonus action');
      const isReaction = spell.casting_time?.toLowerCase().includes('reaction');
      
      actions.push({
        id: `spell-${spell.index}`,
        name: spell.name,
        icon: 'magic_effect',
        color: 'bg-purple-600',
        description: Array.isArray(spell.desc) ? spell.desc[0] : (spell.desc || 'Cast a spell.'),
        range: spell.range === 'Self' ? 0 : 12,
        targetType: isAoe ? 'sphere' : 'single',
        radius: isAoe ? 2 : undefined,
        category: 'Spells',
        actionType: isReaction ? 'reactions' : (isBonus ? 'bonusActions' : 'actions'),
        data: spell
      });
    });
  }

  // 4. Items (Inventory v2)
  if (character.items && character.equipment) {
    const equippedIds = new Set(character.equipment.slots.map(s => s.itemId).filter(Boolean));
    
    Object.values(character.items).forEach(item => {
      if (equippedIds.has(item.id)) {
        actions.push({
          id: `item-${item.id}`,
          name: item.customName || item.template,
          icon: 'package',
          color: 'bg-amber-600',
          description: `Use ${item.customName || item.template}`,
          range: 4,
          category: 'Items',
          data: item
        });
      }
    });
  }

  // 5. Utility
  actions.push({
    id: 'defend',
    name: 'Defend',
    icon: 'shield',
    color: 'bg-slate-600',
    description: 'Adopt a defensive stance (+2 AC).',
    category: 'Utility',
    actionType: 'actions'
  });

  return actions;
};
