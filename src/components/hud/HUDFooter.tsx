import React from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useUIStore } from '../../store/useUIStore';
import { calculateCharacterWeight } from '../../lib/inventoryUtils';
import { calculateDerivedStats } from '../../lib/statCalculations';
import { Weight, Coins } from 'lucide-react';
import { cn } from '../../lib/utils';

export const HUDFooter: React.FC = () => {
  const { characters, activeCharacterId } = useCharacterStore();
  const { isWorldPanelOpen, isCharacterPanelOpen } = useUIStore();

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];

  if (!activeCharacter) {
    return null;
  }

  const money = activeCharacter.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  const totalWeight = calculateCharacterWeight(activeCharacter);
  const derived = calculateDerivedStats(activeCharacter);
  const maxWeight = derived.weightCapacity || 150;

  const weightPercentage = Math.min((totalWeight / maxWeight) * 100, 100);

  // Determine dynamic bar color based on weight percentage
  let barColorClass = "bg-emerald-600";
  let textWeightClass = "text-emerald-700";
  if (weightPercentage >= 85) {
    barColorClass = "bg-rose-600 animate-pulse";
    textWeightClass = "text-rose-600 font-black";
  } else if (weightPercentage >= 50) {
    barColorClass = "bg-amber-500";
    textWeightClass = "text-amber-600 font-bold";
  }

  const coinsMeta = [
    { key: 'pp', label: 'Platinum', color: 'text-stone-500', img: '/assets/icons/currency/platinum.webp' },
    { key: 'gp', label: 'Gold', color: 'text-amber-500', img: '/assets/icons/currency/gold.webp' },
    { key: 'ep', label: 'Electrum', color: 'text-emerald-500', img: '/assets/icons/currency/electrum.webp' },
    { key: 'sp', label: 'Silver', color: 'text-stone-400', img: '/assets/icons/currency/silver.webp' },
    { key: 'cp', label: 'Copper', color: 'text-amber-800', img: '/assets/icons/currency/copper.webp' },
  ] as const;

  return (
    <div className="w-full bg-[#FAF6EE] border-t-2 border-parchment-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] h-9 flex items-center justify-between px-4 select-none z-[4500] text-xs font-sans relative">
      {/* Old Paper Texture overlay to match HUD style */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none" 
        style={{
          backgroundImage: `url('/assets/ui/old_paper.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* LEFT: Currency Display (Aligned with World Panel) */}
      <div 
        className={cn(
          "flex items-center gap-2.5 transition-all rounded px-2 py-1 relative z-10",
          isWorldPanelOpen ? "w-80" : "w-auto"
        )}
      >
        <Coins size={13} className="text-amber-600 shrink-0" />
        <div className="flex items-center gap-3">
          {coinsMeta.map(({ key, label, img }) => {
            const val = money[key] || 0;
            return (
              <div key={key} className="flex items-center gap-1.5" title={`${label}: ${val}`}>
                <img src={img} alt={label} className="w-4 h-4 object-contain shadow-sm shrink-0" />
                <span className="text-[10px] font-black tracking-tight text-stone-700">{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER: Mini Status / Active Character Name */}
      <div className="hidden md:flex items-center justify-center flex-1 text-[9px] font-black text-stone-400 uppercase tracking-widest text-center">
        <span>Active Character: {activeCharacter.name}</span>
      </div>

      {/* RIGHT: Weight Limit Bar (Aligned with Character Panel) */}
      <div 
        className={cn(
          "flex items-center gap-3 justify-end relative z-10",
          isCharacterPanelOpen ? "w-80" : "w-auto"
        )}
      >
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <Weight size={11} className="text-stone-400" />
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Load:</span>
            <span className={cn("text-[10px] font-black", textWeightClass)}>
              {totalWeight.toFixed(1)} / {maxWeight} lbs
            </span>
          </div>
          {/* Progress Bar Container */}
          <div className="w-28 h-1.5 bg-stone-200/80 rounded-full overflow-hidden border border-stone-300/40 shadow-inner">
            <div 
              className={cn("h-full rounded-full transition-all duration-300", barColorClass)}
              style={{ width: `${weightPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
