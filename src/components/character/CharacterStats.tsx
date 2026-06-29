import React from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { Shield, Sword, Zap, Heart, Footprints } from 'lucide-react';
import { calculateDerivedStats } from '../../lib/statCalculations';
import { cn } from '../../lib/utils';

interface CharacterStatsProps {
  compact?: boolean;
}

export const CharacterStats: React.FC<CharacterStatsProps> = ({ compact }) => {
  const { characters, activeCharacterId } = useCharacterStore();

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  if (!activeCharacter) return null;

  const derived = calculateDerivedStats(activeCharacter);

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Shield size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">AC</span>
              <span className="text-[10px] font-cinzel text-white leading-none">{derived.ac}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Sword size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">ATK</span>
              <span className="text-[10px] font-cinzel text-white leading-none">{derived.attackBonus >= 0 ? `+${derived.attackBonus}` : derived.attackBonus}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Heart size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">HP</span>
              <span className="text-[10px] font-cinzel text-white leading-none">{activeCharacter.hp}/{activeCharacter.maxHp}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Footprints size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">SPD</span>
              <span className="text-[10px] font-cinzel text-white leading-none">{derived.speed}ft</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2">
          <Zap size={14} /> Combat Readiness
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-white/30 p-2 rounded border border-dragon-red/5 shadow-sm">
            <Shield size={16} className="text-dragon-red/60" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Armor Class</div>
              <div className="text-sm font-cinzel text-parchment-900">{derived.ac}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/30 p-2 rounded border border-dragon-red/5 shadow-sm">
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
