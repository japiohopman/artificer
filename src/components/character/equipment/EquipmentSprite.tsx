import React, { useState, useEffect } from 'react';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { resolveVisualIdentity } from '../../../lib/inventoryVisuals/visualIdentity';
import { getSpriteCellForVisual, getSpriteSheetDefinition } from '../../../lib/inventoryVisuals/spriteManifest';

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

  // 1. Resolve canonical visual identity
  const visualId = resolveVisualIdentity(itemKey, ruleset);

  // 2. Look up corresponding manifest entry
  let cellMapping = getSpriteCellForVisual(visualId);

  // If entry has explicit fallbackVisualId, fallback to canonical target
  if (cellMapping?.fallbackVisualId) {
    const fallbackMapping = getSpriteCellForVisual(cellMapping.fallbackVisualId);
    if (fallbackMapping) {
      cellMapping = fallbackMapping;
    }
  }

  // A mapping is only renderable as a sprite cell if it is READY and has assigned cell coordinates
  const isRenderableCell = Boolean(
    cellMapping &&
    cellMapping.status === 'READY' &&
    cellMapping.sheetId &&
    cellMapping.row !== undefined &&
    cellMapping.col !== undefined
  );

  // 3. Retrieve authoritative sheet definition if cell mapping is renderable
  const sheetDefinition = isRenderableCell && cellMapping?.sheetId ? getSpriteSheetDefinition(cellMapping.sheetId) : undefined;
  const sheetPath = sheetDefinition?.path;

  // 4. Check 4x4 grid bounds (rows: 0..3, cols: 0..3)
  const isOutOfBounds = isRenderableCell && cellMapping && sheetDefinition && cellMapping.row !== undefined && cellMapping.col !== undefined ? (
    cellMapping.row < 0 ||
    cellMapping.row >= sheetDefinition.grid.rows ||
    cellMapping.col < 0 ||
    cellMapping.col >= sheetDefinition.grid.cols
  ) : true;

  useEffect(() => {
    setHasError(false);
    setImageDimensions(null);
    if (!isRenderableCell || !cellMapping || !sheetDefinition || !sheetPath || isOutOfBounds) return;

    const img = new Image();
    img.src = sheetPath;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [visualId, cellMapping?.sheetId, cellMapping?.row, cellMapping?.col, sheetPath, isOutOfBounds, isRenderableCell]);

  const altText = alt || (typeof itemKey === 'string' ? itemKey : itemKey?.name || itemKey?.template || 'item');

  // Fallback rendering on missing mapping, PLANNED without READY fallback, out of bounds, asset load failure, or uninitialized dimensions
  if (!isRenderableCell || !cellMapping || cellMapping.row === undefined || cellMapping.col === undefined || !sheetDefinition || !sheetPath || isOutOfBounds || hasError || !imageDimensions) {
    if (fallbackUrl) {
      return (
        <ChromaKeyImage
          src={fallbackUrl}
          alt={altText}
          onError={() => setHasError(true)}
          className={className}
          style={style}
        />
      );
    }
    return null;
  }

  // 5. Derive crop dynamically using the canonical grid metadata (4 x 4)
  const cellWidth = imageDimensions.width / sheetDefinition.grid.cols;
  const cellHeight = imageDimensions.height / sheetDefinition.grid.rows;

  const crop = {
    sx: cellMapping.col * cellWidth,
    sy: cellMapping.row * cellHeight,
    sw: cellWidth,
    sh: cellHeight,
  };

  return (
    <ChromaKeyImage
      src={sheetPath}
      alt={altText}
      crop={crop}
      onError={() => setHasError(true)}
      className={className}
      style={style}
    />
  );
};
