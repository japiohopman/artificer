import React, { useState, useEffect } from 'react';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { getBackgroundSpriteCoord, BACKGROUND_SPRITE_SHEET_CONFIG } from './backgroundSpriteMap';

interface BackgroundSpriteProps {
  backgroundKey: string;
  className?: string;
  alt?: string;
  fallbackUrl?: string;
  style?: React.CSSProperties;
}

export const BackgroundSprite: React.FC<BackgroundSpriteProps> = ({
  backgroundKey,
  className = '',
  alt,
  fallbackUrl,
  style
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const coord = getBackgroundSpriteCoord(backgroundKey);

  useEffect(() => {
    setHasError(false);
    if (!coord) return;

    const img = new Image();
    if (BACKGROUND_SPRITE_SHEET_CONFIG.src.startsWith('http://') || BACKGROUND_SPRITE_SHEET_CONFIG.src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = BACKGROUND_SPRITE_SHEET_CONFIG.src;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [backgroundKey, coord?.spriteRow, coord?.spriteColumn]);

  if (!coord || hasError) {
    if (fallbackUrl) {
      return (
        <div
          className={`relative overflow-hidden flex items-center justify-center max-w-full max-h-full aspect-square ${className}`}
          style={{ aspectRatio: '1/1', ...style }}
        >
          <ChromaKeyImage
            src={fallbackUrl}
            alt={alt || backgroundKey}
            onError={() => setHasError(true)}
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
        </div>
      );
    }
    return (
      <div
        className={`flex items-center justify-center bg-dragon-darkRed/20 text-dragon-gold text-xs font-bold rounded p-2 max-w-full max-h-full aspect-square ${className}`}
        style={{ aspectRatio: '1/1', ...style }}
      >
        {alt || backgroundKey}
      </div>
    );
  }

  const sheetWidth = imageDimensions?.width || 1024;
  const sheetHeight = imageDimensions?.height || 1024;

  const cellWidth = sheetWidth / BACKGROUND_SPRITE_SHEET_CONFIG.cols;
  const cellHeight = sheetHeight / BACKGROUND_SPRITE_SHEET_CONFIG.rows;

  const crop = {
    sx: coord.spriteColumn * cellWidth,
    sy: coord.spriteRow * cellHeight,
    sw: cellWidth,
    sh: cellHeight,
  };

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center max-w-full max-h-full aspect-square ${className}`}
      style={{ aspectRatio: '1/1', ...style }}
    >
      <ChromaKeyImage
        src={BACKGROUND_SPRITE_SHEET_CONFIG.src}
        alt={alt || coord.backgroundId}
        crop={crop}
        onError={() => setHasError(true)}
        className="max-w-full max-h-full object-contain pointer-events-none"
      />
    </div>
  );
};
