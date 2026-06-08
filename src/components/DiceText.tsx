import React from 'react';
import { GameIcon } from '../game_icons';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { DAMAGE_TYPE_ICONS } from '../assets/icons/damage_types';
import { DICE_ICONS } from '../assets/icons/dice';

interface DiceTextProps {
  children: React.ReactNode;
  iconSize?: number;
  className?: string;
}

const DAMAGE_TYPE_CONFIG: Record<string, { color: string; path: string }> = {
  acid: { color: '#166534', path: DAMAGE_TYPE_ICONS.acid }, // Dark Green
  bludgeoning: { color: '#78350f', path: DAMAGE_TYPE_ICONS.bludgeoning }, // Brown
  cold: { color: '#3b82f6', path: DAMAGE_TYPE_ICONS.cold }, // Blue
  fire: { color: '#ef4444', path: DAMAGE_TYPE_ICONS.fire }, // Red
  force: { color: '#d946ef', path: DAMAGE_TYPE_ICONS.force }, // Pink/Purple
  lightning: { color: '#eab308', path: DAMAGE_TYPE_ICONS.lightning }, // Yellow
  necrotic: { color: '#a855f7', path: DAMAGE_TYPE_ICONS.necrotic }, // Purple
  piercing: { color: '#475569', path: DAMAGE_TYPE_ICONS.piercing }, // Slate
  poison: { color: '#22c55e', path: DAMAGE_TYPE_ICONS.poison }, // Green
  psychic: { color: '#f472b6', path: DAMAGE_TYPE_ICONS.psychic }, // Hot Pink
  radiant: { color: '#fbbf24', path: DAMAGE_TYPE_ICONS.radiant }, // Gold
  slashing: { color: '#991b1b', path: DAMAGE_TYPE_ICONS.slashing }, // Dark Red
  thunder: { color: '#94a3b8', path: DAMAGE_TYPE_ICONS.thunder }, // Slate Blue
};

export const DiceText: React.FC<DiceTextProps> = ({ children, iconSize = 10, className }) => {
  const { rollDice3D } = useStore();

  const processString = (text: string) => {
    // Regex matches dice patterns OR any of our damage types
    const types = Object.keys(DAMAGE_TYPE_CONFIG).join('|');
    const combinedRegex = new RegExp(`(\\d*d\\d+|\\b(?:${types})\\b)`, 'gi');
    
    const parts = text.split(combinedRegex);
    
    return parts.map((part, i) => {
      if (!part) return null;

      // Handle Dice
      if (part.match(/^\d*d\d+$/i)) {
        // Use d8 specifically as requested by the user for all dice notations
        const dicePath = DICE_ICONS.d8;
        
        return (
          <button 
            key={i} 
            onClick={() => rollDice3D(part, "Manual Roll")}
            className={cn(
              "inline-flex items-center gap-1 font-bold text-dragon-red bg-dragon-red/10 rounded mx-0.5 border border-dragon-red/20 h-fit align-middle shadow-sm transition-all duration-200 hover:bg-dragon-red/20 hover:scale-105 active:scale-95 cursor-pointer",
              iconSize > 15 ? "py-1 px-3" : "px-0.5"
            )}
            style={{ fontSize: iconSize > 15 ? `${Math.max(1, iconSize/24)}em` : 'inherit' }}
          >
            {dicePath && (
              <GameIcon 
                path={dicePath} 
                size={iconSize} 
                className={cn("inline", iconSize > 15 ? "mb-0" : "mb-0.5")} 
                color="#8B0000" 
              />
            )}
            <span className={iconSize > 15 ? "ml-1" : ""}>{part}</span>
          </button>
        );
      }

      // Handle Damage Type
      const lowPart = part.toLowerCase();
      if (DAMAGE_TYPE_CONFIG[lowPart]) {
        const config = DAMAGE_TYPE_CONFIG[lowPart];
        return (
          <span 
            key={i} 
            className={cn(
              "inline-flex items-center gap-1 font-bold rounded mx-0.5 border h-fit align-middle shadow-sm transition-all duration-200",
              iconSize > 15 ? "py-1 px-3" : "px-1"
            )}
            style={{ 
              color: config.color,
              backgroundColor: `${config.color}15`, // ~8% opacity
              borderColor: `${config.color}40`, // ~25% opacity
              fontSize: iconSize > 15 ? `${Math.max(1, iconSize/24)}em` : 'inherit'
            }}
          >
            <GameIcon 
              path={config.path} 
              size={iconSize} 
              className={cn("inline", iconSize > 15 ? "mb-0" : "mb-0.5")} 
              color={config.color} 
            />
            <span className={iconSize > 15 ? "ml-1" : "capitalize"}>{part}</span>
          </span>
        );
      }

      return part;
    });
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return processString(child);
        }
        if (React.isValidElement(child)) {
          const el = child as React.ReactElement<any>;
          if (el.props.children) {
            return React.cloneElement(el, {
              children: <DiceText iconSize={iconSize}>{el.props.children}</DiceText>
            });
          }
        }
        return child;
      })}
    </>
  );
};
