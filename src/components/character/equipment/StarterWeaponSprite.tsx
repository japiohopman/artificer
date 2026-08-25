import React, { useState, useEffect } from 'react';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import {
  getStarterWeaponSpriteCoord,
  STARTER_WEAPONS_01_PATH,
  STARTER_WEAPONS_02_PATH
} from './starterWeaponSpriteMap';

interface StarterWeaponSpriteProps {
  weaponKey: string;
  className?: string;
  alt?: string;
  fallbackUrl?: string;
  style?: React.CSSProperties;
}

export const StarterWeaponSprite: React.FC<StarterWeaponSpriteProps> = ({
  weaponKey,
  className = '',
  alt,
  fallbackUrl,
  style
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const coord = getStarterWeaponSpriteCoord(weaponKey);
  const sheetPath = coord?.sheet === 'starter_weapons_01' ? STARTER_WEAPONS_01_PATH : STARTER_WEAPONS_02_PATH;

  useEffect(() => {
    setHasError(false);
    if (!coord) return;

    const img = new Image();
    img.src = sheetPath;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [weaponKey, coord?.sheet, coord?.row, coord?.col]);

  if (!coord || hasError) {
    if (fallbackUrl) {
      return (
        <ChromaKeyImage
          src={fallbackUrl}
          alt={alt || weaponKey}
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
      alt={alt || weaponKey}
      crop={crop}
      onError={() => setHasError(true)}
      className={className}
      style={style}
    />
  );
};
