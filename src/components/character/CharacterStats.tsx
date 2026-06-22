import React from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { Shield, Sword, Zap } from 'lucide-react';
import { calculateDerivedStats } from '../../lib/statCalculations';

export const CharacterStats: React.FC = () => {
  const { characters, activeCharacterId } = useCharacterStore();

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  if (!activeCharacter) return null;

  const derived = calculateDerivedStats(activeCharacter);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2">
          <Zap size={14} /> Combat Readiness
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-white/30 p-2 rounded border border-dragon-red/5">
            <Shield size={16} className="text-dragon-red/60" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Armor Class</div>
              <div className="text-sm font-cinzel text-parchment-900">{derived.ac}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/30 p-2 rounded border border-dragon-red/5">
            <Sword size={16} className="text-dragon-red/60" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Attack Bonus</div>
              <div className="text-sm font-cinzel text-parchment-900">{derived.attackBonus >= 0 ? `+${derived.attackBonus}` : derived.attackBonus}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
