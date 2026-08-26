import React from 'react';
import { cn } from '../../lib/utils';
import { resolveSpellVisualIdentity, getSpellSpriteCellForVisual, getSpellSpriteSheetDefinition } from '../../lib/spellVisuals';
import { GameIcon } from '../../game_icons';

interface SpellSpriteProps {
  spell: string | { index?: string; id?: string; name?: string; imageUrl?: string };
  ruleset?: '2014' | '2024';
  className?: string;
  size?: number | string;
  alt?: string;
}

export const SpellSprite: React.FC<SpellSpriteProps> = ({
  spell,
  ruleset,
  className,
  size = 48,
  alt
}) => {
  const visualId = resolveSpellVisualIdentity(spell, ruleset);
  let mapping = getSpellSpriteCellForVisual(visualId);

  // If status is PLANNED and has an explicit fallback, resolve fallback mapping
  if (mapping && mapping.status === 'PLANNED' && mapping.fallbackVisualId) {
    const fallback = getSpellSpriteCellForVisual(mapping.fallbackVisualId);
    if (fallback && fallback.status === 'READY') {
      mapping = fallback;
    }
  }

  // Raw custom image URL provided on object fallback
  const rawCustomUrl = typeof spell === 'object' && spell !== null ? spell.imageUrl : undefined;

  // Case 1: READY with standalonePath image file
  if (mapping && mapping.status === 'READY' && mapping.standalonePath) {
    return (
      <div
        className={cn('relative overflow-hidden shrink-0 flex items-center justify-center', className)}
        style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
      >
        <img
          src={mapping.standalonePath}
          alt={alt || visualId}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          loading="lazy"
        />
      </div>
    );
  }

  // Case 2: READY with sprite sheet cell crop
  if (
    mapping &&
    mapping.status === 'READY' &&
    mapping.sheetId &&
    mapping.row !== undefined &&
    mapping.col !== undefined
  ) {
    const sheet = getSpellSpriteSheetDefinition(mapping.sheetId);
    if (sheet) {
      const bgSizeX = sheet.grid.cols * 100;
      const bgSizeY = sheet.grid.rows * 100;
      const posX = (mapping.col / (sheet.grid.cols - 1)) * 100;
      const posY = (mapping.row / (sheet.grid.rows - 1)) * 100;

      return (
        <div
          className={cn('relative overflow-hidden shrink-0 bg-no-repeat', className)}
          style={{
            width: typeof size === 'number' ? `${size}px` : size,
            height: typeof size === 'number' ? `${size}px` : size,
            backgroundImage: `url('${sheet.path}')`,
            backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
            backgroundPosition: `${posX}% ${posY}%`
          }}
          aria-label={alt || visualId}
          role="img"
        />
      );
    }
  }

  // Case 3: Raw image URL provided on object
  if (rawCustomUrl) {
    return (
      <div
        className={cn('relative overflow-hidden shrink-0 flex items-center justify-center', className)}
        style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
      >
        <img
          src={rawCustomUrl}
          alt={alt || 'Spell asset'}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          loading="lazy"
        />
      </div>
    );
  }

  // Case 4: PLANNED (without valid fallback) or MISSING fallback visual icon
  return (
    <div
      className={cn(
        'relative shrink-0 bg-stone-900/60 border border-dragon-gold/30 rounded flex items-center justify-center text-dragon-gold shadow-inner',
        className
      )}
      style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
    >
      <GameIcon name="magic_effect" size={typeof size === 'number' ? Math.floor(size * 0.5) : 24} color="#D4AF37" />
    </div>
  );
};
