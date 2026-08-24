import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { SpeciesSprite } from '../species/SpeciesSprite';
import { ClassSprite } from '../classes/ClassSprite';
import { BackgroundSprite } from '../backgrounds/BackgroundSprite';
import { soundService } from '../../../services/soundService';

interface ChoiceCardProps {
  id: string;
  name: string;
  category: 'species' | 'class' | 'backgrounds' | string;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  id,
  name,
  category,
  isSelected,
  onSelect,
  className,
}) => {
  const handleClick = () => {
    soundService.playEffect('UI_CHARACTER_SELECT');
    onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.button
      type="button"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex items-center gap-3 p-2 rounded-sm border transition-all overflow-hidden text-left cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-dragon-gold shrink-0",
        isSelected
          ? "bg-dragon-darkRed text-white border-dragon-gold shadow-lg shadow-dragon-red/30 z-10"
          : "bg-white/40 border-dragon-gold/20 hover:border-dragon-red/40 hover:bg-white/70 text-parchment-950 shadow-sm",
        className
      )}
    >
      {/* Sprite thumbnail container */}
      <div className={cn(
        "relative shrink-0 overflow-hidden rounded-sm border flex items-center justify-center p-0.5",
        category === 'species' ? "w-14 h-10 aspect-[3/2]" :
        category === 'class' ? "w-10 h-14 aspect-[2/3]" :
        "w-12 h-12 aspect-square",
        isSelected ? "border-dragon-gold bg-black/30" : "border-dragon-gold/20 bg-parchment-200/50"
      )}>
        {category === 'species' ? (
          <SpeciesSprite speciesKey={id} alt={name} className="w-full h-full object-contain" />
        ) : category === 'class' ? (
          <ClassSprite classKey={id} alt={name} className="w-full h-full object-contain" />
        ) : (
          <BackgroundSprite backgroundKey={id} alt={name} className="w-full h-full object-contain" />
        )}
      </div>

      {/* Label and status */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className={cn(
          "text-xs font-header font-black uppercase tracking-wider truncate",
          isSelected ? "text-dragon-gold drop-shadow-sm" : "text-dragon-darkRed"
        )}>
          {name}
        </span>
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-tight",
          isSelected ? "text-white/80" : "text-parchment-600 opacity-60"
        )}>
          {isSelected ? "Selected" : "Choose"}
        </span>
      </div>

      {/* Selected Badge Indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-dragon-gold shadow-sm animate-pulse" />
      )}
    </motion.button>
  );
};
