import React, { useState, useEffect } from 'react';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { getClassSpriteCoord, CLASS_SPRITE_SHEET_CONFIG } from './classSpriteMap';

interface ClassSpriteProps {
  classKey: string;
  className?: string;
  alt?: string;
  fallbackUrl?: string;
  style?: React.CSSProperties;
}

export const ClassSprite: React.FC<ClassSpriteProps> = ({
  classKey,
  className = '',
  alt,
  fallbackUrl,
  style
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const coord = getClassSpriteCoord(classKey);

  useEffect(() => {
    setHasError(false);
    if (!coord) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = CLASS_SPRITE_SHEET_CONFIG.src;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [classKey, coord?.spriteRow, coord?.spriteColumn]);

  if (!coord || hasError) {
    if (fallbackUrl) {
      return (
        <div
          className={`relative overflow-hidden flex items-center justify-center max-w-full max-h-full aspect-[2/3] ${className}`}
          style={{ aspectRatio: '2/3', ...style }}
        >
          <ChromaKeyImage
            src={fallbackUrl}
            alt={alt || classKey}
            onError={() => setHasError(true)}
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
        </div>
      );
    }
    return (
      <div
        className={`flex items-center justify-center bg-dragon-darkRed/20 text-dragon-gold text-xs font-bold rounded p-2 max-w-full max-h-full aspect-[2/3] ${className}`}
        style={{ aspectRatio: '2/3', ...style }}
      >
        {alt || classKey}
      </div>
    );
  }

  if (!imageDimensions) {
    return null;
  }
  const sheetWidth = imageDimensions.width;
  const sheetHeight = imageDimensions.height;

  const cellWidth = sheetWidth / CLASS_SPRITE_SHEET_CONFIG.cols;
  const cellHeight = sheetHeight / CLASS_SPRITE_SHEET_CONFIG.rows;

  const crop = {
    sx: coord.spriteColumn * cellWidth,
    sy: coord.spriteRow * cellHeight,
    sw: cellWidth,
    sh: cellHeight,
  };

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center max-w-full max-h-full aspect-[2/3] ${className}`}
      style={{ aspectRatio: '2/3', ...style }}
    >
      <ChromaKeyImage
        src={CLASS_SPRITE_SHEET_CONFIG.src}
        alt={alt || coord.classId}
        crop={crop}
        onError={() => setHasError(true)}
        className="max-w-full max-h-full object-contain pointer-events-none"
      />
    </div>
  );
};
