import React, { useState, useEffect } from 'react';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { resolveVisualIdentity } from '../../../lib/inventoryVisuals/visualIdentity';
import {
  getSpriteCellForVisual,
  getSpriteSheetDefinition,
} from '../../../lib/inventoryVisuals/spriteManifest';

interface EquipmentSpriteProps {
  itemKey: string | { template?: string; index?: string; id?: string; name?: string };
  ruleset?: '2014' | '2024';
  className?: string;
  alt?: string;
  fallbackUrl?: string;
  style?: React.CSSProperties;
}

export const EquipmentSprite: React.FC<EquipmentSpriteProps> = ({
  itemKey,
  ruleset,
  className = '',
  alt,
  fallbackUrl,
  style
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const visualId = resolveVisualIdentity(itemKey, ruleset);
  const cell = getSpriteCellForVisual(visualId);
  const sheet = cell ? getSpriteSheetDefinition(cell.sheetId) : undefined;
  const sheetPath = sheet?.path;

  const itemAltText = typeof itemKey === 'string' ? itemKey : itemKey?.name || itemKey?.template || 'equipment item';

  useEffect(() => {
    setHasError(false);
    if (!cell || !sheet || !sheetPath) return;

    const img = new Image();
    img.src = sheetPath;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [visualId, cell?.sheetId, cell?.row, cell?.col, sheetPath]);

  if (!cell || !sheet || !sheetPath || hasError) {
    if (fallbackUrl) {
      return (
        <ChromaKeyImage
          src={fallbackUrl}
          alt={alt || itemAltText}
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

  const cols = sheet.grid.cols;
  const rows = sheet.grid.rows;
  const cellWidth = imageDimensions.width / cols;
  const cellHeight = imageDimensions.height / rows;

  const crop = {
    sx: cell.col * cellWidth,
    sy: cell.row * cellHeight,
    sw: cellWidth,
    sh: cellHeight,
  };

  return (
    <ChromaKeyImage
      src={sheetPath}
      alt={alt || itemAltText}
      crop={crop}
      onError={() => setHasError(true)}
      className={className}
      style={style}
    />
  );
};

