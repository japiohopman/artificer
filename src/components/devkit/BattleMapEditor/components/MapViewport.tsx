import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../state/editorStore';
import { useAtlasStore } from '../../../../store/useAtlasStore';
import { worldToGrid, gridToWorld, getWallSnap } from '../geometry/coordinates';
import { findWallAt, findObjectAt, findTokenAt } from '../geometry/hitTesting';
import {
  drawBackground,
  drawTerrain,
  drawGrid,
  drawWallsAndDoors,
  drawObjects,
  drawTokens,
  drawSelectionOverlay
} from '../rendering/renderMap';

export const MapViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const [roomStartPos, setRoomStartPos] = useState<{ x: number; y: number } | null>(null);
  const [roomEndPos, setRoomEndPos] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [redrawKey, setRedrawKey] = useState(0);

  const isPaintingRef = useRef(false);
  const lastPaintedCellRef = useRef<{ x: number; y: number } | null>(null);
  const hasModifiedRef = useRef(false);
  
  const {
    map,
    viewport,
    setViewport,
    activeTool,
    selectedWallType,
    selectedTerrainType,
    selectedStampIndex,
    selectedStampCategory,
    selection,
    setSelection,
    coverAttacker,
    coverTarget,
    setCoverAttacker,
    setCoverTarget,
    addWall,
    removeWall,
    addTerrain,
    removeTerrain,
    addObject,
    updateObject,
    addToken,
    updateToken,
    removeObject,
    removeToken
  } = useEditorStore();

  const cellSize = map.grid.cellSize;
  const { zoom, panX, panY } = viewport;

  // Track layout dimensions dynamically
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear whole canvas physically
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply panning and zooming offsets globally to the context
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    const rc = {
      ctx,
      cellSize,
      zoom,
      panX,
      panY,
      triggerRedraw: () => setRedrawKey((k) => k + 1)
    };

    // 1. Draw static color or textures
    drawBackground(rc, map);

    // 2. Render terrain details
    drawTerrain(rc, map.terrain);

    // 3. Render grid alignment lines
    if (map.grid.visible && map.grid.type !== 'none') {
      drawGrid(rc, map);
    }

    // 4. Render object stamps
    drawObjects(rc, map.objects);

    // 5. Render tactical top-down tokens
    drawTokens(rc, map.tokens);

    // 6. Draw wall & door line segments
    drawWallsAndDoors(rc, map.walls);

    // 7. Draw active selection bounding box overlays
    if (selection.ids.length > 0) {
      drawSelectionOverlay(rc, selection.ids, map);
    }

    // 8. Visual debug markers for LoS cover pins
    if (coverAttacker) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(coverAttacker.x * cellSize + cellSize / 2, coverAttacker.y * cellSize + cellSize / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (coverTarget) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(coverTarget.x * cellSize + cellSize / 2, coverTarget.y * cellSize + cellSize / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Room Tool Preview
    if (isDrawingRoom && roomStartPos && roomEndPos) {
      const minX = Math.min(roomStartPos.x, roomEndPos.x);
      const maxX = Math.max(roomStartPos.x, roomEndPos.x);
      const minY = Math.min(roomStartPos.y, roomEndPos.y);
      const maxY = Math.max(roomStartPos.y, roomEndPos.y);

      const px = minX * cellSize;
      const py = minY * cellSize;
      const pw = (maxX - minX + 1) * cellSize;
      const ph = (maxY - minY + 1) * cellSize;

      ctx.save();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.fillRect(px, py, pw, ph);

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(px, py, pw, ph);
      ctx.restore();
    }

    ctx.restore();
  }, [map, viewport, selection, coverAttacker, coverTarget, containerSize, isDrawingRoom, roomStartPos, roomEndPos, redrawKey]);

  // Handle pointer interactions on the interactive workspace canvas
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 1. Pan Tool or Middle Mouse drags viewport
    if (activeTool === 'pan' || e.button === 1 || (activeTool === 'select' && e.shiftKey)) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: clickX - panX, y: clickY - panY };
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    const gridPos = worldToGrid(clickX, clickY, panX, panY, zoom, cellSize);
    
    // Bounds check
    if (gridPos.x < 0 || gridPos.x >= map.dimensions.width || gridPos.y < 0 || gridPos.y >= map.dimensions.height) {
      return;
    }

    // Room Drawing tool
    if (activeTool === 'room') {
      setRoomStartPos(gridPos);
      setRoomEndPos(gridPos);
      setIsDrawingRoom(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // 2. Wall Drawing tool
    if (activeTool === 'wall' || activeTool === 'door') {
      const snap = getWallSnap(clickX, clickY, panX, panY, zoom, cellSize);
      const isDoor = activeTool === 'door';
      addWall({
        orientation: snap.orientation,
        x: snap.x,
        y: snap.y,
        type: isDoor ? 'door' : 'wall',
        doorState: isDoor ? 'closed' : undefined
      });
      return;
    }

    // 3. Terrain Brush tool
    if (activeTool === 'terrain') {
      isPaintingRef.current = true;
      lastPaintedCellRef.current = gridPos;
      hasModifiedRef.current = true;
      addTerrain({
        x: gridPos.x,
        y: gridPos.y,
        type: selectedTerrainType
      }, true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // 4. Object Stamp tool
    if (activeTool === 'object' && selectedStampIndex) {
      addObject({
        name: selectedStampIndex === 'barrel' ? 'Barrel Stamp' : selectedStampIndex === 'chest' ? 'Chest Stamp' : 'Table Prop',
        index: selectedStampIndex,
        x: gridPos.x + 0.5, // Center stamp on tile
        y: gridPos.y + 0.5,
        rotation: 0,
        scale: selectedStampIndex === 'table' ? 1.5 : 1,
        layerId: 'objects',
        isLocked: false,
        hasShadow: true
      });
      return;
    }

    // 5. Token Spawner tool
    if (activeTool === 'token' && selectedStampIndex) {
      const monstersList = useAtlasStore.getState().monstersList;
      const foundMonster = monstersList.find(m => m.name === selectedStampIndex || m.index === selectedStampIndex);

      addToken({
        name: foundMonster ? foundMonster.name : selectedStampIndex,
        index: foundMonster ? foundMonster.index : undefined,
        type: selectedStampIndex === 'Player Spawn' ? 'player' : 'enemy',
        x: gridPos.x,
        y: gridPos.y,
        size: foundMonster?.type === 'dragon' || foundMonster?.type === 'giant' ? 'Large' : 'Medium',
        imageUrl: foundMonster ? foundMonster.imageUrl : undefined
      });
      return;
    }

    // 6. Measure / Pins tool
    if (activeTool === 'measure') {
      if (!coverAttacker) {
        setCoverAttacker(gridPos);
      } else if (!coverTarget) {
        setCoverTarget(gridPos);
      } else {
        // Reset pins
        setCoverAttacker(null);
        setCoverTarget(null);
      }
      return;
    }

    // 7. Eraser tool
    if (activeTool === 'eraser') {
      // Find objects/tokens at spot
      const tok = findTokenAt(map.tokens, gridPos.x, gridPos.y);
      if (tok) {
        removeToken(tok.id);
        return;
      }

      const worldCoords = {
        x: (clickX - panX) / zoom,
        y: (clickY - panY) / zoom
      };
      const obj = findObjectAt(map.objects, worldCoords.x, worldCoords.y, cellSize);
      if (obj) {
        removeObject(obj.id);
        return;
      }

      // Try wall erase
      const snap = getWallSnap(clickX, clickY, panX, panY, zoom, cellSize);
      const wall = findWallAt(map.walls, snap.x, snap.y, snap.orientation);
      if (wall) {
        removeWall(wall.id);
        return;
      }

      // Default to terrain continuous erase
      isPaintingRef.current = true;
      lastPaintedCellRef.current = gridPos;
      hasModifiedRef.current = true;
      removeTerrain(gridPos.x, gridPos.y, true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // 8. Select tool (Object, token hit testing)
    if (activeTool === 'select') {
      // Try tokens first
      const tok = findTokenAt(map.tokens, gridPos.x, gridPos.y);
      if (tok) {
        setSelection({ ids: [tok.id], type: 'token' });
        return;
      }

      // Try objects
      const worldCoords = {
        x: (clickX - panX) / zoom,
        y: (clickY - panY) / zoom
      };
      const obj = findObjectAt(map.objects, worldCoords.x, worldCoords.y, cellSize);
      if (obj) {
        setSelection({ ids: [obj.id], type: 'object' });
        
        // Setup dragging for selected objects
        isDraggingRef.current = true;
        dragStartRef.current = { x: worldCoords.x - obj.x * cellSize, y: worldCoords.y - obj.y * cellSize };
        canvas.setPointerCapture(e.pointerId);
        return;
      }

      // Try wall/door segment selection
      const snap = getWallSnap(clickX, clickY, panX, panY, zoom, cellSize);
      const wall = findWallAt(map.walls, snap.x, snap.y, snap.orientation);
      if (wall) {
        setSelection({ ids: [wall.id], type: wall.type === 'door' || wall.type === 'secret-door' ? 'door' : 'wall' });
        return;
      }

      // Clicked void
      setSelection({ ids: [], type: null });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    const gridPos = worldToGrid(currX, currY, panX, panY, zoom, cellSize);
    if (gridPos.x >= 0 && gridPos.x < map.dimensions.width && gridPos.y >= 0 && gridPos.y < map.dimensions.height) {
      setHoveredCell(gridPos);
    } else {
      setHoveredCell(null);
    }

    if (activeTool === 'room' && isDrawingRoom) {
      const clampedX = Math.max(0, Math.min(map.dimensions.width - 1, gridPos.x));
      const clampedY = Math.max(0, Math.min(map.dimensions.height - 1, gridPos.y));
      setRoomEndPos({ x: clampedX, y: clampedY });
      return;
    }

    if (isPaintingRef.current) {
      if (gridPos.x >= 0 && gridPos.x < map.dimensions.width && gridPos.y >= 0 && gridPos.y < map.dimensions.height) {
        if (!lastPaintedCellRef.current || lastPaintedCellRef.current.x !== gridPos.x || lastPaintedCellRef.current.y !== gridPos.y) {
          lastPaintedCellRef.current = gridPos;
          hasModifiedRef.current = true;
          if (activeTool === 'terrain') {
            addTerrain({ x: gridPos.x, y: gridPos.y, type: selectedTerrainType }, true);
          } else if (activeTool === 'eraser') {
            removeTerrain(gridPos.x, gridPos.y, true);
          }
        }
      }
      return;
    }

    if (!isDraggingRef.current) return;

    if (activeTool === 'pan' || e.buttons === 4 || (activeTool === 'select' && e.shiftKey)) {
      // Viewport panning drag
      setViewport({
        panX: currX - dragStartRef.current.x,
        panY: currY - dragStartRef.current.y
      });
    } else if (activeTool === 'select' && selection.type === 'object' && selection.ids[0]) {
      // Dragging selected object stamp
      const objId = selection.ids[0];
      const worldX = (currX - panX) / zoom;
      const worldY = (currY - panY) / zoom;
      
      const newGridX = (worldX - dragStartRef.current.x) / cellSize;
      const newGridY = (worldY - dragStartRef.current.y) / cellSize;

      // Optional snap to cell grid boundaries when dragging stamps
      const snapGridX = Math.floor(newGridX) + 0.5;
      const snapGridY = Math.floor(newGridY) + 0.5;

      updateObject(objId, {
        x: snapGridX,
        y: snapGridY
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      lastPaintedCellRef.current = null;
      canvasRef.current?.releasePointerCapture(e.pointerId);
      if (hasModifiedRef.current) {
        useEditorStore.getState().pushHistory(useEditorStore.getState().map);
        hasModifiedRef.current = false;
      }
      return;
    }

    if (activeTool === 'room' && isDrawingRoom) {
      setIsDrawingRoom(false);
      canvasRef.current?.releasePointerCapture(e.pointerId);
      if (roomStartPos && roomEndPos) {
        const minX = Math.min(roomStartPos.x, roomEndPos.x);
        const maxX = Math.max(roomStartPos.x, roomEndPos.x);
        const minY = Math.min(roomStartPos.y, roomEndPos.y);
        const maxY = Math.max(roomStartPos.y, roomEndPos.y);

        useEditorStore.getState().addRoom(minX, minY, maxX, maxY, selectedTerrainType, selectedWallType);
      }
      setRoomStartPos(null);
      setRoomEndPos(null);
      return;
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.releasePointerCapture(e.pointerId);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom around cursor coordinates to preserve visual coordinate focus
      const zoomIntensity = 0.1;
      const wheelValue = e.deltaY < 0 ? 1 : -1;
      const zoomFactor = Math.exp(wheelValue * zoomIntensity);

      const newZoom = Math.max(0.25, Math.min(4.0, zoom * zoomFactor));

      const worldX = (mouseX - panX) / zoom;
      const worldY = (mouseY - panY) / zoom;

      setViewport({
        zoom: newZoom,
        panX: mouseX - worldX * newZoom,
        panY: mouseY - worldY * newZoom
      });
    };

    canvas.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheelNative);
    };
  }, [zoom, panX, panY, setViewport]);

  return (
    <div ref={containerRef} className="flex-1 bg-[#121212] overflow-hidden flex items-center justify-center relative">
      <canvas
        ref={canvasRef}
        width={containerSize.width}
        height={containerSize.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="cursor-crosshair shadow-2xl border border-white/5 bg-black"
        style={{
          touchAction: 'none'
        }}
      />
      
      {/* HUD Zoom overlay */}
      <div className="absolute bottom-4 right-4 bg-black/80 p-2 px-3 rounded-lg border border-white/10 text-[9px] font-mono tracking-widest text-white/60 select-none pointer-events-none flex items-center gap-3">
        {hoveredCell && (
          <>
            <span>CURSOR: ({hoveredCell.x}, {hoveredCell.y})</span>
            <span>|</span>
          </>
        )}
        <span>ZOOM: {Math.round(zoom * 100)}%</span>
        <span>|</span>
        <span>GRID: {map.dimensions.width}x{map.dimensions.height}</span>
      </div>
    </div>
  );
};
