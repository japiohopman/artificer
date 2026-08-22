import React from 'react';
import { Shield, Sword, Zap, Heart, Footprints, Sparkles } from 'lucide-react';
import { Character } from '../../store/useCharacterStore';
import { useActiveCharacter, calculateDerivedStats } from '../../lib/character';
import { cn } from '../../lib/utils';

export interface CharacterStatsProps {
  character?: Character;
  variant?: 'compact' | 'full';
  className?: string;
}

export const CharacterStats: React.FC<CharacterStatsProps> = ({
  character: propCharacter,
  variant = 'full',
  className
}) => {
  const activeCharacter = useActiveCharacter();
  const character = propCharacter || activeCharacter;

  if (!character) return null;

  const derived = calculateDerivedStats(character);
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
              <span className="text-[10px] font-cinzel text-white leading-none">
                {derived.attackBonus >= 0 ? `+${derived.attackBonus}` : derived.attackBonus}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Zap size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">INIT</span>
              <span className="text-[10px] font-cinzel text-white leading-none">
                {derived.initiative >= 0 ? `+${derived.initiative}` : derived.initiative}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Heart size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">HP</span>
              <span className="text-[10px] font-cinzel text-white leading-none">
                {character.hp}/{character.maxHp}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Footprints size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">SPD</span>
              <span className="text-[10px] font-cinzel text-white leading-none">{derived.speed}ft</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900/40 p-1.5 rounded border border-white/5">
            <Sparkles size={12} className="text-dragon-red/60" />
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase font-bold leading-none mb-0.5">PROF</span>
              <span className="text-[10px] font-cinzel text-white leading-none">+{derived.proficiencyBonus}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-dragon-red uppercase tracking-widest border-b border-dragon-red/20 pb-1 flex items-center gap-2">
          <Zap size={14} /> Combat Readiness
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-white/30 p-2.5 rounded border border-dragon-red/5 shadow-sm">
            <Shield size={18} className="text-dragon-red/60 shrink-0" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Armor Class</div>
              <div className="text-sm font-cinzel text-parchment-900 font-bold">{derived.ac}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/30 p-2.5 rounded border border-dragon-red/5 shadow-sm">
            <Sword size={18} className="text-dragon-red/60 shrink-0" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Attack Bonus</div>
              <div className="text-sm font-cinzel text-parchment-900 font-bold">
                {derived.attackBonus >= 0 ? `+${derived.attackBonus}` : derived.attackBonus}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/30 p-2.5 rounded border border-dragon-red/5 shadow-sm">
            <Zap size={18} className="text-dragon-red/60 shrink-0" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Initiative</div>
              <div className="text-sm font-cinzel text-parchment-900 font-bold">
                {derived.initiative >= 0 ? `+${derived.initiative}` : derived.initiative}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/30 p-2.5 rounded border border-dragon-red/5 shadow-sm">
            <Footprints size={18} className="text-dragon-red/60 shrink-0" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Speed</div>
              <div className="text-sm font-cinzel text-parchment-900 font-bold">{derived.speed} ft</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/30 p-2.5 rounded border border-dragon-red/5 shadow-sm">
            <Heart size={18} className="text-dragon-red/60 shrink-0" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Hit Points</div>
              <div className="text-sm font-cinzel text-parchment-900 font-bold">
                {character.hp}/{character.maxHp}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/30 p-2.5 rounded border border-dragon-red/5 shadow-sm">
            <Sparkles size={18} className="text-dragon-red/60 shrink-0" />
            <div>
              <div className="text-[8px] text-parchment-500 uppercase font-bold">Proficiency</div>
              <div className="text-sm font-cinzel text-parchment-900 font-bold">+{derived.proficiencyBonus}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
