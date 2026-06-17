import React from 'react';
import { useStore } from '../../store/useStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { SpellCard } from '../atlas/SpellCard';
import { calculateMaxSpellSlots } from '../../lib/statCalculations';

export const SpellInventory: React.FC = () => {
  const { setFocusedItem, isCharacterSpellbookOpen, setIsCharacterSpellbookOpen } = useStore();
  const { characters, activeCharacterId, castSpell, restoreSlots } = useCharacterStore();

  const character = characters.find(c => c.id === activeCharacterId) || characters[0];
  if (!character) return null;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h3 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-widest">Active Arcana</h3>
          <button onClick={() => restoreSlots(true)} className="text-[10px] font-black text-dragon-red uppercase border border-dragon-red/20 px-3 py-1 rounded hover:bg-dragon-red/5">Long Rest</button>
       </div>
       <div className="grid grid-cols-1 gap-4">
          {character.knownSpells?.map(spell => (
             <SpellCard key={spell.index} spell={spell} />
          ))}
       </div>
    </div>
  );
};
