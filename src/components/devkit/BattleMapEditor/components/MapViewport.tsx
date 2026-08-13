import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../state/editorStore';
import { worldToGrid, getWallSnap } from '../geometry/coordinates';
import { GameIcon } from '../../../../game_icons';
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

import { findWallAt, findObjectAt, findTokenAt } from '../geometry/hitTesting';

export const MapViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const [roomStartPos, setRoomStartPos] = useState<{ x: number; y: number } | null>(null);
  const [roomEndPos, setRoomEndPos] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [redrawKey, setRedrawKey] = useState(0);

  // Custom Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    gridX: number;
    gridY: number;
    target: { id: string; type: 'token' | 'object' | 'wall' | 'door' } | null;
  } | null>(null);

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
    setActiveTool,
    selection,
    setSelection,
    coverAttacker,
    coverTarget,
    setCoverAttacker,
    setCoverTarget,
    selectedStampIndex,
    selectedTerrainType,
    selectedWallType,
    addObject,
    addToken,
    addRoom,
    updateObject,
    updateToken,
    updateWall,
    removeObject,
    removeToken,
    removeWall
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
    // Left-click closes active context menu
    setContextMenu(null);

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

  // Right-Click Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridPos = worldToGrid(clickX, clickY, panX, panY, zoom, cellSize);
    const snap = getWallSnap(clickX, clickY, panX, panY, zoom, cellSize);
    const worldCoords = {
      x: (clickX - panX) / zoom,
      y: (clickY - panY) / zoom
    };

    // Hit test target selection under cursor
    let hitTarget: { id: string; type: 'token' | 'object' | 'wall' | 'door' } | null = null;

    const tok = findTokenAt(map.tokens, gridPos.x, gridPos.y);
    if (tok) {
      hitTarget = { id: tok.id, type: 'token' };
    } else {
      const obj = findObjectAt(map.objects, worldCoords.x, worldCoords.y, cellSize);
      if (obj) {
        hitTarget = { id: obj.id, type: 'object' };
      } else {
        const wall = findWallAt(map.walls, snap.x, snap.y, snap.orientation);
        if (wall) {
          hitTarget = { id: wall.id, type: wall.type === 'door' || wall.type === 'secret-door' ? 'door' : 'wall' };
        }
      }
    }

    // Set selection state to the right-clicked target if any
    if (hitTarget) {
      setSelection({ ids: [hitTarget.id], type: hitTarget.type });
    }

    // Get client position relative to the container element
    const containerRect = containerRef.current?.getBoundingClientRect();
    const clientX = containerRect ? e.clientX - containerRect.left : e.clientX;
    const clientY = containerRect ? e.clientY - containerRect.top : e.clientY;

    setContextMenu({
      x: clientX,
      y: clientY,
      gridX: gridPos.x,
      gridY: gridPos.y,
      target: hitTarget
    });
  };

  // Context Actions Trigger Routines
  const handleContextEdit = () => {
    if (contextMenu?.target) {
      setSelection({ ids: [contextMenu.target.id], type: contextMenu.target.type });
      setActiveTool('select');
    }
    setContextMenu(null);
  };

  const handleContextDelete = () => {
    if (contextMenu?.target) {
      const { id, type } = contextMenu.target;
      if (type === 'token') removeToken(id);
      else if (type === 'object') removeObject(id);
      else if (type === 'wall' || type === 'door') removeWall(id);
      setSelection({ ids: [], type: null });
    }
    setContextMenu(null);
  };

  const handleContextDuplicate = () => {
    if (contextMenu?.target) {
      const { id, type } = contextMenu.target;
      if (type === 'token') {
        const origin = map.tokens.find(t => t.id === id);
        if (origin) {
          addToken({
            ...origin,
            name: `${origin.name} (Copy)`,
            x: origin.x + 1,
            y: origin.y
          });
        }
      } else if (type === 'object') {
        const origin = map.objects.find(o => o.id === id);
        if (origin) {
          addObject({
            ...origin,
            name: `${origin.name} (Copy)`,
            x: origin.x + 1,
            y: origin.y + 1
          });
        }
      }
    }
    setContextMenu(null);
  };

  const handleContextCreateRoom = () => {
    if (contextMenu) {
      const { gridX, gridY } = contextMenu;
      // Creates a standard 3x3 stone room centered at right-click location
      addRoom(gridX - 1, gridY - 1, gridX + 1, gridY + 1, selectedTerrainType || 'stone', selectedWallType || 'wall');
    }
    setContextMenu(null);
  };

  const handleContextAddObject = () => {
    if (contextMenu && selectedStampIndex) {
      const { gridX, gridY } = contextMenu;
      addObject({
        name: selectedStampIndex === 'barrel' ? 'Barrel Stamp' : selectedStampIndex === 'chest' ? 'Chest Stamp' : 'Table Prop',
        index: selectedStampIndex,
        x: gridX + 0.5,
        y: gridY + 0.5,
        rotation: 0,
        scale: selectedStampIndex === 'table' ? 1.5 : 1,
        layerId: 'objects',
        isLocked: false,
        hasShadow: true
      });
    }
    setContextMenu(null);
  };

  const handleContextAddToken = () => {
    if (contextMenu && selectedStampIndex) {
      const { gridX, gridY } = contextMenu;
      addToken({
        name: selectedStampIndex,
        type: selectedStampIndex === 'Player Spawn' ? 'player' : 'enemy',
        x: gridX,
        y: gridY,
        size: 'Medium'
      });
    }
    setContextMenu(null);
  };

  const handleContextSelectAll = () => {
    const allIds = [
      ...map.tokens.map(t => t.id),
      ...map.objects.map(o => o.id),
      ...map.walls.map(w => w.id)
    ];
    setSelection({ ids: allIds, type: 'object' });
    setContextMenu(null);
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
        onContextMenu={handleContextMenu}
        className="cursor-crosshair shadow-2xl border border-white/5 bg-black"
        style={{
          touchAction: 'none'
        }}
      />

      {/* --- Themed Right-Click Context Menu Overlay --- */}
      {contextMenu && (
        <div
          className="absolute bg-[#151515] border border-white/10 rounded shadow-2xl py-1 z-[2000] text-[9px] font-bold uppercase tracking-wider text-white/80 w-44"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {contextMenu.target ? (
            <>
              {/* Entity Context Actions */}
              <div className="px-3 py-1 border-b border-white/5 text-[8px] text-white/40 mb-1">
                {contextMenu.target.type.toUpperCase()}: {contextMenu.target.id.slice(0, 10)}
              </div>
              <button onClick={handleContextEdit} className="w-full text-left px-3 py-1.5 hover:bg-white/5 hover:text-white flex items-center gap-2">
                <GameIcon name="search" size={9} /> Edit Properties
              </button>
              {contextMenu.target.type !== 'wall' && contextMenu.target.type !== 'door' && (
                <button onClick={handleContextDuplicate} className="w-full text-left px-3 py-1.5 hover:bg-white/5 hover:text-white flex items-center gap-2">
                  <GameIcon name="plus" size={9} /> Duplicate
                </button>
              )}
              <button onClick={handleContextDelete} className="w-full text-left px-3 py-1.5 hover:bg-white/5 hover:text-red-400 flex items-center gap-2 text-red-500/80">
                <GameIcon name="close" size={9} /> Delete Element
              </button>
            </>
          ) : (
            <>
              {/* Empty Map Context Actions */}
              <div className="px-3 py-1 border-b border-white/5 text-[8px] text-white/40 mb-1">
                COORDINATES: ({contextMenu.gridX}, {contextMenu.gridY})
              </div>
              <button onClick={handleContextCreateRoom} className="w-full text-left px-3 py-1.5 hover:bg-white/5 hover:text-white flex items-center gap-2">
                <GameIcon name="panel" size={9} /> Create 3x3 Room
              </button>
              {selectedStampIndex && activeTool === 'object' && (
                <button onClick={handleContextAddObject} className="w-full text-left px-3 py-1.5 hover:bg-white/5 hover:text-white flex items-center gap-2">
                  <GameIcon name="package" size={9} /> Place Stamp: {selectedStampIndex}
                </button>
              )}
              {selectedStampIndex && activeTool === 'token' && (
                <button onClick={handleContextAddToken} className="w-full text-left px-3 py-1.5 hover:bg-white/5 hover:text-white flex items-center gap-2">
                  <GameIcon name="identity" size={9} /> Place Token: {selectedStampIndex}
                </button>
              )}
              <button onClick={handleContextSelectAll} className="w-full text-left px-3 py-1.5 hover:bg-white/5 hover:text-white flex items-center gap-2">
                <GameIcon name="adjust" size={9} /> Select All
              </button>
            </>
          )}
        </div>
      )}
      
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
