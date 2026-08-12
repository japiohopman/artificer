import { useEditorStore } from '../state/editorStore';
import { useAtlasStore } from '../../../../store/useAtlasStore';
import { findWallAt, findObjectAt, findTokenAt } from '../geometry/hitTesting';
import { ToolContext } from './toolDispatcher';

// --- PAN TOOL ---
export const handlePanDown = (ctx: ToolContext) => {
  ctx.isDraggingRef.current = true;
  ctx.dragStartRef.current = { x: ctx.clickX - ctx.panX, y: ctx.clickY - ctx.panY };
  ctx.canvas.setPointerCapture(ctx.pointerId);
};

export const handlePanMove = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  store.setViewport({
    panX: ctx.clickX - ctx.dragStartRef.current.x,
    panY: ctx.clickY - ctx.dragStartRef.current.y
  });
};

// --- ROOM TOOL ---
export const handleRoomDown = (ctx: ToolContext) => {
  ctx.setRoomStartPos(ctx.gridPos);
  ctx.setRoomEndPos(ctx.gridPos);
  ctx.setIsDrawingRoom(true);
  ctx.canvas.setPointerCapture(ctx.pointerId);
};

export const handleRoomMove = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  const clampedX = Math.max(0, Math.min(store.map.dimensions.width - 1, ctx.gridPos.x));
  const clampedY = Math.max(0, Math.min(store.map.dimensions.height - 1, ctx.gridPos.y));
  ctx.setRoomEndPos({ x: clampedX, y: clampedY });
};

export const handleRoomUp = (ctx: ToolContext) => {
  ctx.setIsDrawingRoom(false);
  ctx.canvas.releasePointerCapture(ctx.pointerId);
  if (ctx.roomStartPos && ctx.roomEndPos) {
    const minX = Math.min(ctx.roomStartPos.x, ctx.roomEndPos.x);
    const maxX = Math.max(ctx.roomStartPos.x, ctx.roomEndPos.x);
    const minY = Math.min(ctx.roomStartPos.y, ctx.roomEndPos.y);
    const maxY = Math.max(ctx.roomStartPos.y, ctx.roomEndPos.y);

    const store = useEditorStore.getState();
    store.addRoom(minX, minY, maxX, maxY, store.selectedTerrainType, store.selectedWallType);
  }
  ctx.setRoomStartPos(null);
  ctx.setRoomEndPos(null);
};

// --- WALL TOOL ---
export const handleWallDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  store.addWall({
    orientation: ctx.snap.orientation,
    x: ctx.snap.x,
    y: ctx.snap.y,
    type: 'wall'
  });
};

// --- DOOR TOOL ---
export const handleDoorDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  store.addWall({
    orientation: ctx.snap.orientation,
    x: ctx.snap.x,
    y: ctx.snap.y,
    type: 'door',
    doorState: 'closed'
  });
};

// --- TERRAIN TOOL ---
export const handleTerrainDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  ctx.isPaintingRef.current = true;
  ctx.lastPaintedCellRef.current = ctx.gridPos;
  ctx.hasModifiedRef.current = true;
  ctx.accumulatedTerrainChangesRef.current = [];

  const existing = store.map.terrain.find(t => t.x === ctx.gridPos.x && t.y === ctx.gridPos.y);
  ctx.accumulatedTerrainChangesRef.current.push({
    x: ctx.gridPos.x,
    y: ctx.gridPos.y,
    oldType: existing?.type,
    newType: store.selectedTerrainType
  });

  store.addTerrain({
    x: ctx.gridPos.x,
    y: ctx.gridPos.y,
    type: store.selectedTerrainType
  }, true); // skipHistory during active drag

  ctx.canvas.setPointerCapture(ctx.pointerId);
};

export const handleTerrainMove = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  const gridPos = ctx.gridPos;
  if (gridPos.x >= 0 && gridPos.x < store.map.dimensions.width && gridPos.y >= 0 && gridPos.y < store.map.dimensions.height) {
    if (!ctx.lastPaintedCellRef.current || ctx.lastPaintedCellRef.current.x !== gridPos.x || ctx.lastPaintedCellRef.current.y !== gridPos.y) {
      ctx.lastPaintedCellRef.current = gridPos;
      ctx.hasModifiedRef.current = true;

      const alreadyRecorded = ctx.accumulatedTerrainChangesRef.current.some(c => c.x === gridPos.x && c.y === gridPos.y);
      if (!alreadyRecorded) {
        const existing = store.map.terrain.find(t => t.x === gridPos.x && t.y === gridPos.y);
        ctx.accumulatedTerrainChangesRef.current.push({
          x: gridPos.x,
          y: gridPos.y,
          oldType: existing?.type,
          newType: store.selectedTerrainType
        });
      }

      store.addTerrain({ x: gridPos.x, y: gridPos.y, type: store.selectedTerrainType }, true);
    }
  }
};

// --- OBJECT TOOL ---
export const handleObjectDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  if (!store.selectedStampIndex) return;
  store.addObject({
    name: store.selectedStampIndex === 'barrel' ? 'Barrel Stamp' : store.selectedStampIndex === 'chest' ? 'Chest Stamp' : 'Table Prop',
    index: store.selectedStampIndex,
    x: ctx.gridPos.x + 0.5,
    y: ctx.gridPos.y + 0.5,
    rotation: 0,
    scale: store.selectedStampIndex === 'table' ? 1.5 : 1,
    layerId: 'objects',
    isLocked: false,
    hasShadow: true
  });
};

// --- TOKEN TOOL ---
export const handleTokenDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  if (!store.selectedStampIndex) return;

  const monstersList = useAtlasStore.getState().monstersList;
  const foundMonster = monstersList.find(m => m.name === store.selectedStampIndex || m.index === store.selectedStampIndex);

  store.addToken({
    name: foundMonster ? foundMonster.name : store.selectedStampIndex,
    index: foundMonster ? foundMonster.index : undefined,
    type: store.selectedStampIndex === 'Player Spawn' ? 'player' : 'enemy',
    x: ctx.gridPos.x,
    y: ctx.gridPos.y,
    size: foundMonster?.type === 'dragon' || foundMonster?.type === 'giant' ? 'Large' : 'Medium',
    imageUrl: foundMonster ? foundMonster.imageUrl : undefined
  });
};

// --- MEASURE TOOL ---
export const handleMeasureDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  if (!store.coverAttacker) {
    store.setCoverAttacker(ctx.gridPos);
  } else if (!store.coverTarget) {
    store.setCoverTarget(ctx.gridPos);
  } else {
    store.setCoverAttacker(null);
    store.setCoverTarget(null);
  }
};

// --- ERASER TOOL ---
export const handleEraserDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();

  const tok = findTokenAt(store.map.tokens, ctx.gridPos.x, ctx.gridPos.y);
  if (tok) {
    store.removeToken(tok.id);
    return;
  }

  const worldCoords = {
    x: (ctx.clickX - ctx.panX) / ctx.zoom,
    y: (ctx.clickY - ctx.panY) / ctx.zoom
  };
  const obj = findObjectAt(store.map.objects, worldCoords.x, worldCoords.y, ctx.cellSize);
  if (obj) {
    store.removeObject(obj.id);
    return;
  }

  const wall = findWallAt(store.map.walls, ctx.snap.x, ctx.snap.y, ctx.snap.orientation);
  if (wall) {
    store.removeWall(wall.id);
    return;
  }

  // Otherwise, continuous terrain erasing
  ctx.isPaintingRef.current = true;
  ctx.lastPaintedCellRef.current = ctx.gridPos;
  ctx.hasModifiedRef.current = true;
  ctx.accumulatedTerrainChangesRef.current = [];

  const existing = store.map.terrain.find(t => t.x === ctx.gridPos.x && t.y === ctx.gridPos.y);
  if (existing) {
    ctx.accumulatedTerrainChangesRef.current.push({
      x: ctx.gridPos.x,
      y: ctx.gridPos.y,
      oldType: existing.type,
      newType: undefined
    });
  }

  store.removeTerrain(ctx.gridPos.x, ctx.gridPos.y, true);
  ctx.canvas.setPointerCapture(ctx.pointerId);
};

export const handleEraserMove = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  const gridPos = ctx.gridPos;
  if (gridPos.x >= 0 && gridPos.x < store.map.dimensions.width && gridPos.y >= 0 && gridPos.y < store.map.dimensions.height) {
    if (!ctx.lastPaintedCellRef.current || ctx.lastPaintedCellRef.current.x !== gridPos.x || ctx.lastPaintedCellRef.current.y !== gridPos.y) {
      ctx.lastPaintedCellRef.current = gridPos;
      ctx.hasModifiedRef.current = true;

      const alreadyRecorded = ctx.accumulatedTerrainChangesRef.current.some(c => c.x === gridPos.x && c.y === gridPos.y);
      if (!alreadyRecorded) {
        const existing = store.map.terrain.find(t => t.x === gridPos.x && t.y === gridPos.y);
        if (existing) {
          ctx.accumulatedTerrainChangesRef.current.push({
            x: gridPos.x,
            y: gridPos.y,
            oldType: existing.type,
            newType: undefined
          });
        }
      }

      store.removeTerrain(gridPos.x, gridPos.y, true);
    }
  }
};

// --- SELECT TOOL ---
export const handleSelectDown = (ctx: ToolContext) => {
  const store = useEditorStore.getState();

  const tok = findTokenAt(store.map.tokens, ctx.gridPos.x, ctx.gridPos.y);
  if (tok) {
    store.setSelection({ ids: [tok.id], type: 'token' });
    return;
  }

  const worldCoords = {
    x: (ctx.clickX - ctx.panX) / ctx.zoom,
    y: (ctx.clickY - ctx.panY) / ctx.zoom
  };
  const obj = findObjectAt(store.map.objects, worldCoords.x, worldCoords.y, ctx.cellSize);
  if (obj) {
    store.setSelection({ ids: [obj.id], type: 'object' });
    ctx.isDraggingRef.current = true;
    ctx.dragStartRef.current = { x: worldCoords.x - obj.x * ctx.cellSize, y: worldCoords.y - obj.y * ctx.cellSize };
    ctx.canvas.setPointerCapture(ctx.pointerId);
    return;
  }

  const wall = findWallAt(store.map.walls, ctx.snap.x, ctx.snap.y, ctx.snap.orientation);
  if (wall) {
    store.setSelection({ ids: [wall.id], type: wall.type === 'door' || wall.type === 'secret-door' ? 'door' : 'wall' });
    return;
  }

  store.setSelection({ ids: [], type: null });
};

export const handleSelectMove = (ctx: ToolContext) => {
  const store = useEditorStore.getState();
  if (ctx.isDraggingRef.current && store.selection.type === 'object' && store.selection.ids[0]) {
    const objId = store.selection.ids[0];
    const worldX = (ctx.clickX - ctx.panX) / ctx.zoom;
    const worldY = (ctx.clickY - ctx.panY) / ctx.zoom;

    const newGridX = (worldX - ctx.dragStartRef.current.x) / ctx.cellSize;
    const newGridY = (worldY - ctx.dragStartRef.current.y) / ctx.cellSize;

    const snapGridX = Math.floor(newGridX) + 0.5;
    const snapGridY = Math.floor(newGridY) + 0.5;

    store.updateObject(objId, {
      x: snapGridX,
      y: snapGridY
    });
  }
};

// --- FINISHING ACTIONS (POINTER UP) ---
export const handlePaintUp = (ctx: ToolContext) => {
  ctx.isPaintingRef.current = false;
  ctx.lastPaintedCellRef.current = null;
  ctx.canvas.releasePointerCapture(ctx.pointerId);

  if (ctx.hasModifiedRef.current && ctx.accumulatedTerrainChangesRef.current.length > 0) {
    const store = useEditorStore.getState();
    store.commitPaintTerrain(ctx.accumulatedTerrainChangesRef.current);
    ctx.hasModifiedRef.current = false;
  }
};

export const handleSelectUp = (ctx: ToolContext) => {
  ctx.isDraggingRef.current = false;
  ctx.canvas.releasePointerCapture(ctx.pointerId);
};
