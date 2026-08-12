import { EditorTool } from '../types/battleMap';
import React from 'react';
import {
  handlePanDown,
  handlePanMove,
  handleRoomDown,
  handleRoomMove,
  handleWallDown,
  handleDoorDown,
  handleTerrainDown,
  handleTerrainMove,
  handleObjectDown,
  handleTokenDown,
  handleMeasureDown,
  handleEraserDown,
  handleEraserMove,
  handleSelectDown,
  handleSelectMove,
  handlePaintUp,
  handleRoomUp,
  handleSelectUp
} from './toolHandlers';

export interface ToolContext {
  canvas: HTMLCanvasElement;
  pointerId: number;
  clickX: number;
  clickY: number;
  gridPos: { x: number; y: number };
  snap: { x: number; y: number; orientation: 'horizontal' | 'vertical' };
  zoom: number;
  panX: number;
  panY: number;
  cellSize: number;
  activeTool: EditorTool;

  // Callbacks for MapViewport local preview rendering
  setRoomStartPos: (pos: { x: number; y: number } | null) => void;
  setRoomEndPos: (pos: { x: number; y: number } | null) => void;
  setIsDrawingRoom: (drawing: boolean) => void;
  isDrawingRoom: boolean;
  roomStartPos: { x: number; y: number } | null;
  roomEndPos: { x: number; y: number } | null;

  // Mutable Refs
  isPaintingRef: React.MutableRefObject<boolean>;
  lastPaintedCellRef: React.MutableRefObject<{ x: number; y: number } | null>;
  hasModifiedRef: React.MutableRefObject<boolean>;
  isDraggingRef: React.MutableRefObject<boolean>;
  dragStartRef: React.MutableRefObject<{ x: number; y: number }>;
  accumulatedTerrainChangesRef: React.MutableRefObject<any[]>;
}

export const dispatchPointerDown = (activeTool: EditorTool, ctx: ToolContext, e: React.PointerEvent<HTMLCanvasElement>) => {
  // 1. Pan override: Space, Middle click (button === 1), or Shift+Select
  if (activeTool === 'pan' || e.button === 1 || (activeTool === 'select' && e.shiftKey)) {
    handlePanDown(ctx);
    return;
  }

  // 2. Delegate to active tool handler
  switch (activeTool) {
    case 'room':
      handleRoomDown(ctx);
      break;
    case 'wall':
      handleWallDown(ctx);
      break;
    case 'door':
      handleDoorDown(ctx);
      break;
    case 'terrain':
      handleTerrainDown(ctx);
      break;
    case 'object':
      handleObjectDown(ctx);
      break;
    case 'token':
      handleTokenDown(ctx);
      break;
    case 'measure':
      handleMeasureDown(ctx);
      break;
    case 'eraser':
      handleEraserDown(ctx);
      break;
    case 'select':
      handleSelectDown(ctx);
      break;
    default:
      break;
  }
};

export const dispatchPointerMove = (activeTool: EditorTool, ctx: ToolContext, e: React.PointerEvent<HTMLCanvasElement>) => {
  // 1. Pan drag override
  if (ctx.isDraggingRef.current && (activeTool === 'pan' || e.buttons === 4 || (activeTool === 'select' && e.shiftKey))) {
    handlePanMove(ctx);
    return;
  }

  // 2. Continuous painting overrides
  if (ctx.isPaintingRef.current) {
    if (activeTool === 'terrain') {
      handleTerrainMove(ctx);
    } else if (activeTool === 'eraser') {
      handleEraserMove(ctx);
    }
    return;
  }

  // 3. Delegate specific moves
  switch (activeTool) {
    case 'room':
      if (ctx.isDrawingRoom) {
        handleRoomMove(ctx);
      }
      break;
    case 'select':
      handleSelectMove(ctx);
      break;
    default:
      break;
  }
};

export const dispatchPointerUp = (activeTool: EditorTool, ctx: ToolContext, e: React.PointerEvent<HTMLCanvasElement>) => {
  // 1. Finish continuous paint stroke
  if (ctx.isPaintingRef.current) {
    handlePaintUp(ctx);
    return;
  }

  // 2. Finish room tool addition
  if (activeTool === 'room' && ctx.isDrawingRoom) {
    handleRoomUp(ctx);
    return;
  }

  // 3. Finish select drag / other pan drags
  if (ctx.isDraggingRef.current) {
    handleSelectUp(ctx);
    return;
  }
};
