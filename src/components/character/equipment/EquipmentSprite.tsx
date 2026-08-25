import React, { useState, useEffect } from 'react';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import {
  getEquipmentSpriteCoord,
  SPRITE_SHEET_PATHS
} from './equipmentSpriteMap';

interface EquipmentSpriteProps {
  itemKey: string;
  className?: string;
  alt?: string;
  fallbackUrl?: string;
  style?: React.CSSProperties;
}

export const EquipmentSprite: React.FC<EquipmentSpriteProps> = ({
  itemKey,
  className = '',
  alt,
  fallbackUrl,
  style
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const coord = getEquipmentSpriteCoord(itemKey);
  const sheetPath = coord ? SPRITE_SHEET_PATHS[coord.sheet] : undefined;

  useEffect(() => {
    setHasError(false);
    if (!coord || !sheetPath) return;

    const img = new Image();
    img.src = sheetPath;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [itemKey, coord?.sheet, coord?.row, coord?.col]);

  if (!coord || !sheetPath || hasError) {
    if (fallbackUrl) {
      return (
        <ChromaKeyImage
          src={fallbackUrl}
          alt={alt || itemKey}
          onError={() => setHasError(true)}
          className={className}
          style={style}
        />
      );
    }
    return null;
  }

  if (!imageDimensions) {
    return null;
  }

  const cellWidth = imageDimensions.width / 4;
  const cellHeight = imageDimensions.height / 4;

  const crop = {
    sx: coord.col * cellWidth,
    sy: coord.row * cellHeight,
    sw: cellWidth,
    sh: cellHeight,
  };

  return (
    <ChromaKeyImage
      src={sheetPath}
      alt={alt || itemKey}
      crop={crop}
      onError={() => setHasError(true)}
      className={className}
      style={style}
    />
  );
};
