import { BattleMap, TerrainCell, WallSegment, MapObject, MapToken, MapLabel, MapMarker } from '../types/battleMap';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  cellSize: number;
  zoom: number;
  panX: number;
  panY: number;
}

export function drawBackground(rc: RenderContext, map: BattleMap) {
  const { ctx, zoom } = rc;
  const width = map.dimensions.width * rc.cellSize;
  const height = map.dimensions.height * rc.cellSize;

  ctx.save();
  ctx.fillStyle = map.background.value || '#151515';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function drawTerrain(rc: RenderContext, terrain: TerrainCell[]) {
  const { ctx, cellSize } = rc;
  ctx.save();

  for (const t of terrain) {
    const x = t.x * cellSize;
    const y = t.y * cellSize;

    ctx.save();
    switch (t.type) {
      case 'stone':
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = '#3a3a3a';
        ctx.strokeRect(x, y, cellSize, cellSize);
        break;
      case 'wood':
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(x, y, cellSize, cellSize);
        break;
      case 'water':
        ctx.fillStyle = '#1a365d';
        ctx.fillRect(x, y, cellSize, cellSize);
        break;
      case 'grass':
        ctx.fillStyle = '#1c3d1c';
        ctx.fillRect(x, y, cellSize, cellSize);
        break;
      case 'lava':
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(x, y, cellSize, cellSize);
        break;
      case 'sand':
        ctx.fillStyle = '#c2b280';
        ctx.fillRect(x, y, cellSize, cellSize);
        break;
      default:
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x, y, cellSize, cellSize);
    }
    ctx.restore();
  }

  ctx.restore();
}

export function drawGrid(rc: RenderContext, map: BattleMap) {
  const { ctx, cellSize } = rc;
  const { width, height } = map.dimensions;

  ctx.save();
  ctx.strokeStyle = map.grid.color || '#ffffff';
  ctx.globalAlpha = map.grid.opacity ?? 0.15;
  ctx.lineWidth = map.grid.lineWidth || 1;

  // Draw vertical lines
  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, height * cellSize);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(width * cellSize, y * cellSize);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawWallsAndDoors(rc: RenderContext, walls: WallSegment[]) {
  const { ctx, cellSize } = rc;
  ctx.save();

  for (const w of walls) {
    const startX = w.x * cellSize;
    const startY = w.y * cellSize;
    const endX = w.orientation === 'horizontal' ? (w.x + 1) * cellSize : w.x * cellSize;
    const endY = w.orientation === 'vertical' ? (w.y + 1) * cellSize : w.y * cellSize;

    ctx.save();
    if (w.type === 'wall') {
      ctx.strokeStyle = '#d7ccc8';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (w.type === 'door' || w.type === 'secret-door') {
      const isOpen = w.doorState === 'open';
      ctx.strokeStyle = w.type === 'secret-door' ? '#9c27b0' : '#ff9800';
      ctx.lineWidth = 4;

      if (isOpen) {
        // Draw door pivoted open at 90 degrees
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        if (w.orientation === 'horizontal') {
          ctx.lineTo(startX, startY - cellSize);
        } else {
          ctx.lineTo(startX - cellSize, startY);
        }
        ctx.stroke();
      } else {
        // Draw solid door block
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw center latch indicator
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        ctx.fillStyle = '#ff5722';
        ctx.beginPath();
        ctx.arc(midX, midY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  ctx.restore();
}

export function drawObjects(rc: RenderContext, objects: MapObject[]) {
  const { ctx, cellSize } = rc;
  ctx.save();

  for (const o of objects) {
    const wx = o.x * cellSize;
    const wy = o.y * cellSize;

    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate((o.rotation * Math.PI) / 180);

    const size = cellSize * o.scale;

    if (o.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }

    // Custom vector/icon stamp renderer
    ctx.fillStyle = o.isLocked ? '#424242' : '#8d6e63';
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;

    if (o.index === 'barrel') {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (o.index === 'chest') {
      ctx.fillRect(-size / 2, -size / 3, size, size * 0.6);
      ctx.strokeRect(-size / 2, -size / 3, size, size * 0.6);
    } else if (o.index === 'table') {
      ctx.fillRect(-size * 0.8, -size * 0.4, size * 1.6, size * 0.8);
      ctx.strokeRect(-size * 0.8, -size * 0.4, size * 1.6, size * 0.8);
    } else if (o.index === 'torch') {
      ctx.fillStyle = '#ff5722';
      ctx.beginPath();
      ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff9800';
      ctx.stroke();
    } else {
      // Default geometric representation of stamps/props
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.strokeRect(-size / 2, -size / 2, size, size);
    }

    ctx.restore();
  }

  ctx.restore();
}

export function drawTokens(rc: RenderContext, tokens: MapToken[]) {
  const { ctx, cellSize } = rc;
  ctx.save();

  for (const t of tokens) {
    const footprint = t.size === 'Large' ? 2 : 1;
    const r = (footprint * cellSize) / 2;
    const cx = t.x * cellSize + r;
    const cy = t.y * cellSize + r;

    ctx.save();
    // Border based on type
    let color = '#3f51b5'; // player
    if (t.type === 'enemy') color = '#f44336';
    else if (t.type === 'npc') color = '#4caf50';
    else if (t.type === 'marker') color = '#9c27b0';

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // Fill Token
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    ctx.fill();

    // Stroke Ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Render Initials or Icon
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${footprint === 2 ? '14px' : '10px'} monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.name.substr(0, 3).toUpperCase(), cx, cy);

    ctx.restore();
  }

  ctx.restore();
}

export function drawSelectionOverlay(rc: RenderContext, selectedIds: string[], map: BattleMap) {
  const { ctx, cellSize } = rc;
  ctx.save();

  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);

  // Highlight selected items
  for (const id of selectedIds) {
    const obj = map.objects.find((o) => o.id === id);
    if (obj) {
      const size = cellSize * obj.scale;
      ctx.strokeRect(obj.x * cellSize - size / 2, obj.y * cellSize - size / 2, size, size);
    }

    const tok = map.tokens.find((t) => t.id === id);
    if (tok) {
      const footprint = tok.size === 'Large' ? 2 : 1;
      ctx.strokeRect(tok.x * cellSize, tok.y * cellSize, footprint * cellSize, footprint * cellSize);
    }
  }

  ctx.restore();
}
