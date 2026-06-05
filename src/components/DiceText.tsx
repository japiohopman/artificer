import React from 'react';
import { GameIcon, GAME_ICONS } from '../game_icons';
import { cn } from '../lib/utils';

interface DiceTextProps {
  children: React.ReactNode;
  iconSize?: number;
  className?: string;
}

const DAMAGE_TYPE_CONFIG: Record<string, { color: string; icon: keyof typeof GAME_ICONS }> = {
  acid: { color: '#166534', icon: 'acid' }, // Dark Green
  bludgeoning: { color: '#78350f', icon: 'bludgeoning' }, // Brown
  cold: { color: '#3b82f6', icon: 'cold' }, // Blue
  fire: { color: '#ef4444', icon: 'fire' }, // Red
  force: { color: '#d946ef', icon: 'force' }, // Pink/Purple
  lightning: { color: '#eab308', icon: 'lightning' }, // Yellow
  necrotic: { color: '#a855f7', icon: 'necrotic' }, // Purple
  piercing: { color: '#475569', icon: 'piercing' }, // Slate
  poison: { color: '#22c55e', icon: 'poison' }, // Green
  psychic: { color: '#f472b6', icon: 'psychic' }, // Hot Pink
  radiant: { color: '#fbbf24', icon: 'radiant' }, // Gold
  slashing: { color: '#991b1b', icon: 'slashing' }, // Dark Red
  thunder: { color: '#94a3b8', icon: 'thunder' }, // Slate Blue
};

export const DiceText: React.FC<DiceTextProps> = ({ children, iconSize = 10, className }) => {
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
        const iconName = "d8" as keyof typeof GAME_ICONS;
        const hasIcon = Object.prototype.hasOwnProperty.call(GAME_ICONS, iconName);
        
        return (
          <span 
            key={i} 
            className={cn(
              "inline-flex items-center gap-1 font-bold text-dragon-red bg-dragon-red/10 rounded mx-0.5 border border-dragon-red/20 h-fit align-middle shadow-sm transition-all duration-200",
              iconSize > 15 ? "py-1 px-3" : "px-0.5"
            )}
            style={{ fontSize: iconSize > 15 ? `${Math.max(1, iconSize/24)}em` : 'inherit' }}
          >
            {hasIcon && (
              <GameIcon 
                name={iconName as any} 
                size={iconSize} 
                className={cn("inline", iconSize > 15 ? "mb-0" : "mb-0.5")} 
                color="#8B0000" 
              />
            )}
            <span className={iconSize > 15 ? "ml-1" : ""}>{part}</span>
          </span>
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
              name={config.icon as any} 
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
