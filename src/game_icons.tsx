import React from 'react';
import { ALL_ICONS, IconDefinition } from './lib/iconRegistry.generated';

/**
 * Game Icons Registry
 * SVG metadata & public URLs are generated at build time into src/lib/iconRegistry.generated.ts
 * while physical SVG artwork files remain strictly canonical in public/assets/icons/svg/.
 */

export const GAME_ICONS = ALL_ICONS;

export type GameIconName = keyof typeof GAME_ICONS;

interface GameIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  fallbackName?: GameIconName | string;
  title?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({
  name,
  path: directPath,
  className,
  size,
  width,
  height,
  color = "currentColor",
  fallbackName,
  title,
  style,
  ...props
}) => {
  let iconEntry: IconDefinition | string | undefined = directPath || (name ? GAME_ICONS[name as GameIconName] : undefined);

  if (!iconEntry && fallbackName) {
    iconEntry = GAME_ICONS[fallbackName as GameIconName];
  }

  if (!iconEntry) {
    return null;
  }

  const w = width || size || 24;
  const h = height || size || 24;

  const assetUrl = typeof iconEntry === 'string' ? iconEntry : iconEntry.path;
  const label = typeof iconEntry === 'object' ? iconEntry.label : (name || 'icon');

  return (
    <img
      src={assetUrl}
      alt={title || label}
      title={title}
      width={w}
      height={h}
      className={className}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
      {...props}
    />
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
