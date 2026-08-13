import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../state/editorStore';
import { worldToGrid, getWallSnap } from '../geometry/coordinates';
import { dispatchPointerDown, dispatchPointerMove, dispatchPointerUp, ToolContext } from '../tools/toolDispatcher';
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

  // Interaction refs managed by the dispatcher
  const isPaintingRef = useRef(false);
  const lastPaintedCellRef = useRef<{ x: number; y: number } | null>(null);
  const hasModifiedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const accumulatedTerrainChangesRef = useRef<any[]>([]);
  
  const {
    map,
    viewport,
    setViewport,
    activeTool,
    selection,
    coverAttacker,
    coverTarget,
    setCoverAttacker,
    setCoverTarget
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

  // Build unified Context for Tool Dispatcher
  const buildToolContext = (e: React.PointerEvent<HTMLCanvasElement>): ToolContext | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridPos = worldToGrid(clickX, clickY, panX, panY, zoom, cellSize);
    const snap = getWallSnap(clickX, clickY, panX, panY, zoom, cellSize);

    return {
      canvas,
      pointerId: e.pointerId,
      clickX,
      clickY,
      gridPos,
      snap,
      zoom,
      panX,
      panY,
      cellSize,
      activeTool,
      setRoomStartPos,
      setRoomEndPos,
      setIsDrawingRoom,
      isDrawingRoom,
      roomStartPos,
      roomEndPos,
      isPaintingRef,
      lastPaintedCellRef,
      hasModifiedRef,
      isDraggingRef,
      dragStartRef,
      accumulatedTerrainChangesRef
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = buildToolContext(e);
    if (!ctx) return;
    dispatchPointerDown(activeTool, ctx, e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = buildToolContext(e);
    if (!ctx) return;

    // Track cursor grid coordinates for HUD overlay
    if (ctx.gridPos.x >= 0 && ctx.gridPos.x < map.dimensions.width && ctx.gridPos.y >= 0 && ctx.gridPos.y < map.dimensions.height) {
      setHoveredCell(ctx.gridPos);
    } else {
      setHoveredCell(null);
    }

    dispatchPointerMove(activeTool, ctx, e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = buildToolContext(e);
    if (!ctx) return;
    dispatchPointerUp(activeTool, ctx, e);
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
