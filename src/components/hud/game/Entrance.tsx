import React from 'react';
import { useWorldStore } from '../../../store/useWorldStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';

interface EntranceProps {
  categories: string[];
  activeCategories: string[];
  onToggleCategory: (category: string) => void;
}

export const Entrance: React.FC<EntranceProps> = ({ categories, activeCategories, onToggleCategory }) => {
  const { currentLocation } = useWorldStore();

  if (!currentLocation) return null;

  return (
    <div className="bg-parchment-100/95 border-2 border-dragon-gold/50 rounded-lg shadow-2xl p-4 w-64 pointer-events-auto">
      <div className="flex items-center gap-2 border-b border-dragon-gold/20 pb-2 mb-3">
        <GameIcon name="city" size={16} color="#8B0000" />
        <h3 className="font-header text-sm text-dragon-darkRed uppercase tracking-widest">
          {currentLocation.name} Legend
        </h3>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {categories.map((cat) => {
          const isActive = activeCategories.includes(cat);
          const label = cat.replace(/_/g, ' ').replace('.json', '');

          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-sm text-[10px] font-black uppercase tracking-tighter transition-all group",
                isActive
                  ? "bg-dragon-red text-white shadow-md"
                  : "bg-parchment-200/50 text-dragon-red/60 hover:bg-parchment-300 hover:text-dragon-red"
              )}
            >
              <span>{label}</span>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                isActive ? "bg-dragon-gold animate-pulse" : "bg-dragon-red/20 group-hover:bg-dragon-red/40"
              )} />
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-dragon-gold/20 flex flex-col gap-2">
         <div className="flex items-center justify-between text-[8px] font-bold text-parchment-500 uppercase">
            <span>Exploration Progress</span>
            <span>12%</span>
         </div>
         <div className="w-full h-1 bg-parchment-300 rounded-full overflow-hidden">
            <div className="h-full bg-dragon-red w-[12%]" />
         </div>
      </div>
    </div>
  );
};
