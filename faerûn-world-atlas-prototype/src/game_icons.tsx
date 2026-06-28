import React from 'react';
import { ALL_ICONS } from './components/assets/icons';

/**
 * Game Icons Registry
 * Categorized icons are imported from ./assets/icons
 * To add a new icon, add a placeholder string in the appropriate category file.
 * Using 512x512 viewport paths for custom game icons.
 */

export const GAME_ICONS = ALL_ICONS;

export type GameIconName = keyof typeof GAME_ICONS;

interface GameIconProps extends React.SVGAttributes<SVGElement> {
  name: GameIconName;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({ name, className, size, width, height, color = "currentColor", ...props }) => {
  const path = GAME_ICONS[name];
  if (!path) {
    return null;
  }

  const w = width || size || 24;
  const h = height || size || 24;

  return (
    <svg 
      viewBox="0 0 512 512" 
      width={w} 
      height={h} 
      fill={color} 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={path} />
    </svg>
  );
};

/**
 * Returns an icon component for the given name.
 * Useful for components that expect a Lucide-style icon component.
 */
export function getIcon(category: string, name: string) {
  const iconName = name.replace(/-/g, '_') as GameIconName;
  return (props: any) => <GameIcon name={iconName} {...props} />;
}
