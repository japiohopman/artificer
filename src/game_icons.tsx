import React from 'react';
import { ALL_ICONS } from '../public/assets/icons';

/**
 * Game Icons Registry
 * Categorized icons are dynamically loaded from the new solo-SVG architecture
 * in public/assets/icons/svg/.
 * 
 * NOTE: Prefer importing specific icons/categories directly in components
 * to support tree-shaking and reduce bundle size.
 */

export const GAME_ICONS = ALL_ICONS;

export type GameIconName = keyof typeof GAME_ICONS;

interface GameIconProps extends React.SVGAttributes<SVGElement> {
  name?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  fallbackName?: GameIconName | string;
  title?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({ name, path: directPath, className, size, width, height, color = "currentColor", fallbackName, title, ...props }) => {
  let pathEntry = directPath || (name ? GAME_ICONS[name as GameIconName] : undefined);
  
  if (!pathEntry && fallbackName) {
    pathEntry = GAME_ICONS[fallbackName as GameIconName];
  }

  if (!pathEntry) {
    return null;
  }

  const w = width || size || 24;
  const h = height || size || 24;

  const entry = pathEntry as any;

  // Support for the new solo SVG raw HTML content
  if (typeof entry === 'object' && entry && entry.rawHtml) {
    return (
      <svg
        viewBox={entry.viewBox || "0 0 512 512"}
        width={w}
        height={h}
        fill={color}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + entry.rawHtml }}
        {...props}
      />
    );
  }

  // Backward compatibility with legacy string path formats
  const path = typeof entry === 'string' ? entry : entry.path;

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
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  );
};

/**
 * Returns an icon component for the given name.
 * Useful for components that expect a Lucide-style icon component.
 * @deprecated Use GameIcon directly with path or specific icon imports.
 */
export function getIcon(_category: string, name: string) {
  const iconName = name.replace(/-/g, '_') as GameIconName;
  return (props: any) => <GameIcon name={iconName} {...props} />;
}
