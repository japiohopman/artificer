import React, { useMemo, useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../../store/useGameStore';
import { useUIStore } from '../../../store/useUIStore';
import { useWorldStore } from '../../../store/useWorldStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { checkLoS, findPath, getDistance, getReachableCells } from '../../../lib/combatUtils';

export const CombatGrid: React.FC = () => {
  const { combatState, setPlayerPos, addLog, resolveCombatAction, toggleDoor } = useGameStore();
  const { characters, activeCharacterId } = useCharacterStore();
  const { partyLocation } = useWorldStore();
  const { isTargeting, targetingAction, setIsTargeting, setTargetingAction, isGridVisible, setIsGridVisible } = useUIStore();
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
  const [draggedPos, setDraggedPos] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeChar = characters.find(c => c.id === activeCharacterId);
  const { playerPos, monsters, grid } = combatState;

  // Grid constants
  const cellSize = 60; // 60px = 5ft
  const gridWidth = grid[0]?.length || 32;
  const gridHeight = grid.length || 20;

  const terrain = (partyLocation?.category || partyLocation?.type || 'land').toLowerCase();

  // Memoize visible cells (updates dynamically during drag)
  const visibleCells = useMemo(() => {
    const visible = new Set<string>();
    const center = draggedPos || playerPos;
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (checkLoS(center, { x, y }, grid)) {
          visible.add(`${x},${y}`);
        }
      }
    }
    return visible;
  }, [playerPos, draggedPos, grid, gridHeight, gridWidth]);

  // Memoize valid target cells
  const validTargetCells = useMemo(() => {
    if (!isTargeting || !targetingAction) return new Set<string>();
    const range = targetingAction.range || 0;

    if (targetingAction.id === 'move') {
      return getReachableCells(playerPos, range, grid);
    }

    const cells = new Set<string>();
    for (let x = playerPos.x - range; x <= playerPos.x + range; x++) {
      for (let y = playerPos.y - range; y <= playerPos.y + range; y++) {
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
          if (getDistance(playerPos, { x, y }) <= range) {
            cells.add(`${x},${y}`);
          }
        }
      }
    }
    return cells;
  }, [isTargeting, targetingAction, playerPos, grid, gridWidth, gridHeight]);

  // Canvas drawing effect for grid and highlights
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Grid Lines (Selective Grid Mode)
    if (isGridVisible) {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)'; // Dragon Gold
      ctx.lineWidth = 1;

      const drawGridAround = (center: {x: number, y: number}, radius: number) => {
        const startX = Math.max(0, center.x - radius);
        const endX = Math.min(gridWidth, center.x + radius);
        const startY = Math.max(0, center.y - radius);
        const endY = Math.min(gridHeight, center.y + radius);

        ctx.beginPath();
        for (let x = startX; x <= endX; x++) {
          ctx.moveTo(x * cellSize, startY * cellSize);
          ctx.lineTo(x * cellSize, endY * cellSize);
        }
        for (let y = startY; y <= endY; y++) {
          ctx.moveTo(startX * cellSize, y * cellSize);
          ctx.lineTo(endX * cellSize, y * cellSize);
        }
        ctx.stroke();
      };

      // Draw around active position and hover
      drawGridAround(draggedPos || playerPos, 5);
      if (hoveredCell) drawGridAround(hoveredCell, 2);
    }

    // 2. Draw Walls and Base Terrain
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        const isVisible = visibleCells.has(`${x},${y}`);
        
        if (cell.type === 'wall') {
          ctx.fillStyle = isVisible ? '#292524' : '#1c1917';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          if (isVisible) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.strokeRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4);
          }
        } else if (cell.type === 'door') {
          ctx.fillStyle = isVisible ? 'rgba(120, 53, 15, 0.4)' : 'rgba(120, 53, 15, 0.2)';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }

        // Fog of War / Visibility Overlay
        if (!isVisible) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      });
    });

    // 3. Draw Range Highlights
    if (isTargeting) {
      const rangeColor = targetingAction?.id === 'move' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(220, 38, 38, 0.15)';
      validTargetCells.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = rangeColor;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = rangeColor.replace('0.15', '0.3');
        ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
      });
    }

    // 4. Threat Range (on monster hover)
    const hoveredMonster = monsters.find(m => m.x === hoveredCell?.x && m.y === hoveredCell?.y);
    if (hoveredMonster && visibleCells.has(`${hoveredMonster.x},${hoveredMonster.y}`)) {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.1)';
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
      const threatRange = 6; // Assume 30ft for now
      for (let dy = -threatRange; dy <= threatRange; dy++) {
        for (let dx = -threatRange; dx <= threatRange; dx++) {
          const tx = hoveredMonster.x + dx;
          const ty = hoveredMonster.y + dy;
          if (tx >= 0 && tx < gridWidth && ty >= 0 && ty < gridHeight) {
            if (getDistance(hoveredMonster, { x: tx, y: ty }) <= threatRange) {
              ctx.fillRect(tx * cellSize, ty * cellSize, cellSize, cellSize);
            }
          }
        }
      }
    }

    // 5. Draw Targeted Sphere
    if (isTargeting && targetingAction?.targetType === 'sphere' && hoveredCell) {
      const radius = targetingAction.radius || 0;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const tx = hoveredCell.x + dx;
          const ty = hoveredCell.y + dy;
          if (tx >= 0 && tx < gridWidth && ty >= 0 && ty < gridHeight) {
            ctx.fillRect(tx * cellSize, ty * cellSize, cellSize, cellSize);
            ctx.strokeRect(tx * cellSize + 1, ty * cellSize + 1, cellSize - 2, cellSize - 2);
          }
        }
      }
    }

  }, [grid, isGridVisible, visibleCells, isTargeting, targetingAction, validTargetCells, hoveredCell, gridWidth, gridHeight, monsters]);

  const handleInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return;

    const cell = grid[y][x];

    // Interaction check for doors
    if (cell.type === 'door') {
      const dist = getDistance(playerPos, { x, y });
      if (dist <= 1) {
        toggleDoor(x, y);
        addLog(`${cell.isOpen ? 'Closed' : 'Opened'} the door.`, 'info');
        const { consumeAction } = useCharacterStore.getState();
        consumeAction(activeCharacterId, 'objectInteractions');
      } else {
        addLog("You are too far away to interact with that door!", 'warning');
      }
      return;
    }

    if (isTargeting) {
      if (targetingAction?.targetType === 'sphere') {
        const radius = targetingAction.radius || 0;
        const targets = monsters.filter(m => {
          const dx = Math.abs(m.x - x);
          const dy = Math.abs(m.y - y);
          return Math.max(dx, dy) <= radius;
        });

        targets.forEach(monster => {
          resolveCombatAction({ name: activeChar?.name || 'Player', id: 'player' }, monster, targetingAction);
        });

        const { consumeAction } = useCharacterStore.getState();
        consumeAction(activeCharacterId, 'actions');

        setIsTargeting(false);
        setTargetingAction(null);
        return;
      }

      if (targetingAction?.id === 'move') {
        const path = findPath(playerPos, { x, y }, grid);

        if (path && path.length <= 6) {
          setPlayerPos(x, y);
          addLog(`Moved to position (${x}, ${y})`, 'info');

          const { consumeMovement } = useCharacterStore.getState();
          consumeMovement(activeCharacterId, path.length * 5); // 5ft per cell

          setIsTargeting(false);
          setTargetingAction(null);
        } else if (!path) {
          addLog("You cannot reach that position!", 'warning');
        } else {
          addLog("That position is out of your movement range!", 'warning');
        }
      }
      return;
    }

    // Default movement logic
    const { gameMode } = useUIStore.getState();
    const path = findPath(playerPos, { x, y }, grid);

    if (path && path.length > 0) {
      const isCombat = gameMode === 'combat';
      const moveLimit = 6; // 30ft

      if (!isCombat || path.length <= moveLimit) {
        setPlayerPos(x, y);
        addLog(`${isCombat ? 'Combat move' : 'Exploration move'} to (${x}, ${y})`, 'info');

        if (isCombat) {
          const { consumeMovement } = useCharacterStore.getState();
          consumeMovement(activeCharacterId, path.length * 5);
        }
      } else {
        addLog("That position is too far for a single turn!", 'warning');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      if (hoveredCell?.x !== x || hoveredCell?.y !== y) {
        setHoveredCell({ x, y });
      }
    } else {
      setHoveredCell(null);
    }
  };

  const rulerPath = useMemo(() => {
    const target = hoveredCell || draggedPos;
    if (!target) return null;
    return findPath(playerPos, target, grid);
  }, [playerPos, hoveredCell, draggedPos, grid]);

  const rulerDistance = useMemo(() => {
    const target = hoveredCell || draggedPos;
    if (!target) return null;
    const dist = rulerPath ? rulerPath.length : getDistance(playerPos, target);
    return dist * 5; // 5ft per cell
  }, [playerPos, hoveredCell, draggedPos, rulerPath]);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-950 font-body">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('/assets/images/ui/map_fog_cloud.webp')] bg-repeat animate-[pulse_8s_infinite]" />
      
      {/* Control Overlay */}
      <div className="absolute top-4 right-4 z-[200] flex flex-col gap-2">
        <button
          onClick={() => setIsGridVisible(!isGridVisible)}
          className={cn(
            "p-2 rounded border-2 transition-all shadow-lg pointer-events-auto",
            isGridVisible ? "bg-dragon-red border-dragon-gold text-white" : "bg-stone-900/80 border-white/20 text-white/60 hover:text-white"
          )}
          title="Toggle Grid"
        >
          <GameIcon name="panel" size={18} />
        </button>
      </div>

      {/* Grid Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
        {/* Carved Frame Overlay */}
        <div className="absolute inset-0 border-[24px] border-dragon-gold/10 pointer-events-none z-[150] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] rounded-[2.5rem]" />

        <motion.div
          drag
          dragMomentum={false}
          className="relative shadow-2xl cursor-grab active:cursor-grabbing border-4 border-white/5"
          style={{ width: gridWidth * cellSize, height: gridHeight * cellSize }}
        >
          {/* Main Tactical Canvas */}
          <canvas
            ref={canvasRef}
            width={gridWidth * cellSize}
            height={gridHeight * cellSize}
            onClick={handleInteraction}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredCell(null)}
            className="absolute inset-0 z-10 cursor-crosshair"
          />

          {/* Tokens Layer (Still React for animations/interactions) */}
          <div className="absolute inset-0 pointer-events-none z-20">
             {/* Player Token */}
             <motion.div 
               drag
               dragMomentum={false}
               dragElastic={0.1}
               onDrag={(_, info) => {
                 const rect = canvasRef.current?.getBoundingClientRect();
                 if (rect) {
                   const x = Math.floor((info.point.x - rect.left) / cellSize);
                   const y = Math.floor((info.point.y - rect.top) / cellSize);
                   if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                     if (draggedPos?.x !== x || draggedPos?.y !== y) {
                       setDraggedPos({ x, y });
                     }
                   }
                 }
               }}
               onDragEnd={(_, info) => {
                 const rect = canvasRef.current?.getBoundingClientRect();
                 if (rect) {
                    const x = Math.floor((info.point.x - rect.left) / cellSize);
                    const y = Math.floor((info.point.y - rect.top) / cellSize);
                    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                      // Trigger move logic
                      const { gameMode } = useUIStore.getState();
                      const path = findPath(playerPos, { x, y }, grid);
                      if (path && path.length > 0) {
                        const isCombat = gameMode === 'combat';
                        if (!isCombat || path.length <= 6) {
                          setPlayerPos(x, y);
                          addLog(`${isCombat ? 'Combat move' : 'Exploration move'} to (${x}, ${y})`, 'info');
                          if (isCombat) {
                            const { consumeMovement } = useCharacterStore.getState();
                            consumeMovement(activeCharacterId, path.length * 5);
                          }
                        } else {
                          addLog("That position is too far!", 'warning');
                        }
                      }
                    }
                 }
                 setDraggedPos(null);
               }}
               animate={draggedPos ? {} : { x: playerPos.x * cellSize, y: playerPos.y * cellSize }}
               className="absolute p-1 pointer-events-auto cursor-grab active:cursor-grabbing z-[100]"
               style={{ width: cellSize, height: cellSize }}
             >
                <div className="w-full h-full rounded-full border-2 border-blue-500 bg-blue-900/80 flex items-center justify-center overflow-hidden relative shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  {activeChar?.avatarUrl ? (
                    <img src={activeChar.avatarUrl} className="w-full h-full object-cover" alt={activeChar.name} />
                  ) : (
                    <GameIcon name="user" size={24} color="#FFF" />
                  )}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-900/95 text-white text-[8px] font-elan px-2 py-0.5 rounded-sm border border-blue-400/50 uppercase whitespace-nowrap shadow-lg tracking-wider">
                  {activeChar?.name || 'Player'}
                </div>
             </motion.div>

             {/* Monster Tokens */}
             <AnimatePresence>
               {monsters.map((monster) => {
                 const isVisible = visibleCells.has(`${monster.x},${monster.y}`);
                 if (!isVisible) return null;

                 return (
                   <motion.div
                    key={monster.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, x: monster.x * cellSize, y: monster.y * cellSize }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute p-2 pointer-events-auto cursor-pointer"
                    style={{ width: cellSize, height: cellSize }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTargeting) {
                        const dist = getDistance(playerPos, { x: monster.x, y: monster.y });
                        if (dist <= (targetingAction?.range || 1)) {
                          resolveCombatAction({ name: activeChar?.name || 'Player', id: 'player' }, monster, targetingAction);
                          const { consumeAction } = useCharacterStore.getState();
                          consumeAction(activeCharacterId, 'actions');
                          setIsTargeting(false);
                          setTargetingAction(null);
                        } else {
                          addLog("Target out of range!", "warning");
                        }
                      }
                    }}
                   >
                      <div className="w-full h-full rounded-full border-2 border-dragon-red bg-red-900/80 flex items-center justify-center overflow-hidden relative shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                        {monster.imageUrl ? (
                          <img src={monster.imageUrl} className="w-full h-full object-cover" alt={monster.name} />
                        ) : (
                          <GameIcon name="identity" size={24} color="#FFF" />
                        )}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/60">
                          <div className="h-full bg-dragon-red" style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} />
                        </div>
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-dragon-darkRed/95 text-white text-[8px] font-elan px-2 py-0.5 rounded-sm border border-dragon-red/50 uppercase whitespace-nowrap shadow-lg tracking-wider">
                        {monster.name}
                      </div>
                   </motion.div>
                 );
               })}
             </AnimatePresence>
          </div>

          {/* Ruler and Distance Tooltip */}
          {(hoveredCell || draggedPos) && (
            <>
              <div 
                className="absolute pointer-events-none z-[120] flex flex-col items-center"
                style={{
                  left: (hoveredCell || draggedPos)!.x * cellSize + cellSize / 2,
                  top: (hoveredCell || draggedPos)!.y * cellSize - 40,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-stone-900/95 border-2 border-dragon-gold/50 px-3 py-1.5 rounded-sm text-[11px] font-elan text-dragon-gold shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-2 backdrop-blur-sm before:absolute before:inset-0 before:bg-[url('/assets/images/ui/parchment_texture.webp')] before:opacity-10 before:pointer-events-none">
                  <GameIcon name="footsteps" size={14} color="#D4AF37" />
                  <span className="tracking-widest uppercase">{rulerDistance} ft</span>
                </div>
              </div>
              <svg className="absolute inset-0 z-[110] pointer-events-none w-full h-full overflow-visible">
                {rulerPath ? (
                  <polyline
                    points={`${playerPos.x * cellSize + cellSize / 2},${playerPos.y * cellSize + cellSize / 2} ${rulerPath.map(p => `${p.x * cellSize + cellSize / 2},${p.y * cellSize + cellSize / 2}`).join(' ')}`}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                    opacity="0.6"
                  />
                ) : (
                  <line
                    x1={playerPos.x * cellSize + cellSize / 2}
                    y1={playerPos.y * cellSize + cellSize / 2}
                    x2={(hoveredCell || draggedPos)!.x * cellSize + cellSize / 2}
                    y2={(hoveredCell || draggedPos)!.y * cellSize + cellSize / 2}
                    stroke="#D4AF37"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.4"
                  />
                )}
              </svg>
            </>
          )}
        </motion.div>
      </div>
      
      {/* HUD Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
