import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';

interface SelectionListProps {
  items: { name: string; index: string }[];
  selected?: string;
  onSelect: (val: string) => void;
  category: string;
}

export const SelectionList: React.FC<SelectionListProps> = ({
  items,
  selected,
  onSelect,
  category
}) => {
  const isGrid = category === 'backgrounds';

  return (
    <div
      className={cn(
        "overflow-y-auto custom-scrollbar content-start py-2 shrink-0",
        isGrid
          ? "w-full md:w-80 grid grid-cols-2 gap-2 pr-2"
          : "w-52 grid grid-cols-1 gap-1.5 pr-2 border-r border-dragon-gold/15"
      )}
    >
      {items.map(item => {
        const isSelected = selected === item.index;

        return (
          <button
            key={item.index}
            onClick={() => onSelect(item.index)}
            title={item.name}
            className={cn(
              "flex items-center rounded-sm border transition-all relative shrink-0 overflow-hidden text-left",
              isGrid ? "w-full h-12 px-3 justify-start bg-white/40" : "w-full h-10 px-3 justify-start",
              isSelected
                ? "bg-dragon-red text-white border-dragon-red shadow-lg scale-[1.01] z-10"
                : "bg-white/10 border-dragon-red/5 hover:border-dragon-red/20 text-parchment-950 hover:bg-white/40"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="selection-highlight"
                className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"
              />
            )}

            <div className="flex flex-col items-start overflow-hidden w-full">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest truncate w-full",
                  isSelected ? "text-white" : "text-dragon-darkRed"
                )}
              >
                {item.name}
              </span>
              {isSelected && (
                <span className="text-[7px] text-white/70 font-bold uppercase tracking-tighter">
                  Selected
                </span>
              )}
            </div>

            {isSelected && (
              <div className="absolute top-1 right-1">
                <GameIcon name="check" size={10} color="#FFFFFF" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
