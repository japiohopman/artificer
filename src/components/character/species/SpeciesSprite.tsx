import React, { useState, useEffect } from 'react';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { getSpeciesSpriteCoord, SPRITE_SHEET_CONFIG } from './speciesSpriteMap';

interface SpeciesSpriteProps {
  speciesKey: string;
  className?: string;
  alt?: string;
  fallbackUrl?: string;
  style?: React.CSSProperties;
}

export const SpeciesSprite: React.FC<SpeciesSpriteProps> = ({
  speciesKey,
  className = '',
  alt,
  fallbackUrl,
  style
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const coord = getSpeciesSpriteCoord(speciesKey);

  useEffect(() => {
    setHasError(false);
    if (!coord) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = SPRITE_SHEET_CONFIG.src;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [speciesKey, coord?.spriteRow, coord?.spriteColumn]);

  if (!coord || hasError) {
    if (fallbackUrl) {
      return (
        <ChromaKeyImage
          src={fallbackUrl}
          alt={alt || speciesKey}
          className={className}
          style={style}
          onError={() => setHasError(true)}
        />
      );
    }
    return (
      <div
        className={`flex items-center justify-center bg-dragon-darkRed/20 text-dragon-gold text-xs font-bold rounded p-2 ${className}`}
        style={{ aspectRatio: '3/2', ...style }}
      >
        {alt || speciesKey}
      </div>
    );
  }

  // Calculate crop geometry based on loaded sheet dimensions or canonical 2688x512 resolution
  const sheetWidth = imageDimensions?.width || 2688;
  const sheetHeight = imageDimensions?.height || 512;

  const cellWidth = sheetWidth / SPRITE_SHEET_CONFIG.cols;
  const cellHeight = sheetHeight / SPRITE_SHEET_CONFIG.rows;

  const crop = {
    sx: coord.spriteColumn * cellWidth,
    sy: coord.spriteRow * cellHeight,
    sw: cellWidth,
    sh: cellHeight,
  };

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ aspectRatio: '3/2', ...style }}
    >
      <ChromaKeyImage
        src={SPRITE_SHEET_CONFIG.src}
        alt={alt || coord.speciesId}
        crop={crop}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};
