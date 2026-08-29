import React, { useState, useEffect } from 'react';
import { ALL_ICONS, IconDefinition } from './lib/iconRegistry.generated';

/**
 * Game Icons Registry
 * SVG metadata & public URLs are generated at build time into src/lib/iconRegistry.generated.ts
 * while physical SVG artwork files remain strictly canonical in public/assets/icons/svg/.
 * Raw SVG content is fetched on demand from static public URLs and cached in memory to preserve
 * inline <svg> rendering behavior (color="currentColor", fill, stroke, CSS classes).
 */

export const GAME_ICONS = ALL_ICONS;

export type GameIconName = keyof typeof GAME_ICONS;

export interface GameIconProps extends React.SVGAttributes<SVGElement> {
  name?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  fallbackName?: GameIconName | string;
  title?: string;
}

// In-memory cache for fetched SVG inner HTML strings
const svgContentCache = new Map<string, string>();

function cleanSvgInnerHtml(rawContent: string): string {
  let content = rawContent
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .trim();

  const svgMatch = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (svgMatch) {
    content = svgMatch[1].trim();
  }
  return content;
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
  fill,
  stroke,
  strokeWidth,
  viewBox: customViewBox,
  ...props
}) => {
  let iconEntry: IconDefinition | string | undefined = directPath || (name ? GAME_ICONS[name as GameIconName] : undefined);

  if (!iconEntry && fallbackName) {
    iconEntry = GAME_ICONS[fallbackName as GameIconName];
  }

  if (!iconEntry) {
    return null;
  }

  const assetUrl = typeof iconEntry === 'string' ? iconEntry : iconEntry.path;
  const defaultViewBox = (typeof iconEntry === 'object' && iconEntry.viewBox) || "0 0 512 512";
  const viewBox = customViewBox || defaultViewBox;

  const [innerHtml, setInnerHtml] = useState<string | null>(() => {
    return svgContentCache.get(assetUrl) || null;
  });

  useEffect(() => {
    if (!assetUrl) return;

    if (svgContentCache.has(assetUrl)) {
      setInnerHtml(svgContentCache.get(assetUrl)!);
      return;
    }

    let isMounted = true;
    fetch(assetUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        const cleaned = cleanSvgInnerHtml(text);
        svgContentCache.set(assetUrl, cleaned);
        if (isMounted) {
          setInnerHtml(cleaned);
        }
      })
      .catch(err => {
        console.warn(`[GameIcon] Failed to fetch SVG from ${assetUrl}:`, err);
      });

    return () => { isMounted = false; };
  }, [assetUrl]);

  const w = width || size || 24;
  const h = height || size || 24;
  const fillColor = fill || color;

  if (!innerHtml) {
    // Render placeholder <svg> shell while async fetch completes
    return (
      <svg
        viewBox={viewBox}
        width={w}
        height={h}
        fill={fillColor}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {title && <title>{title}</title>}
      </svg>
    );
  }

  return (
    <svg
      viewBox={viewBox}
      width={w}
      height={h}
      fill={fillColor}
      stroke={stroke}
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + innerHtml }}
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
