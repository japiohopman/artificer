import React, { useMemo, useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../../store/useGameStore';
import { useUIStore } from '../../../store/useUIStore';
import { useWorldStore } from '../../../store/useWorldStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { checkLoS, findPath, getDistance } from '../../../lib/combatUtils';

export const CombatGrid: React.FC = () => {
  const { combatState, setPlayerPos, addLog, resolveCombatAction, toggleDoor } = useGameStore();
  const { characters, activeCharacterId } = useCharacterStore();
  const { partyLocation } = useWorldStore();
  const { isTargeting, targetingAction, setIsTargeting, setTargetingAction, isGridVisible, setIsGridVisible } = useUIStore();
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeChar = characters.find(c => c.id === activeCharacterId);
  const { playerPos, monsters, grid } = combatState;

  // Grid constants
  const cellSize = 60; // 60px = 5ft
  const gridWidth = grid[0]?.length || 32;
  const gridHeight = grid.length || 20;

  const terrain = (partyLocation?.category || partyLocation?.type || 'land').toLowerCase();

  // Memoize visible cells
  const visibleCells = useMemo(() => {
    const visible = new Set<string>();
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (checkLoS(playerPos, { x, y }, grid)) {
          visible.add(`${x},${y}`);
        }
      }
    }
    return visible;
  }, [playerPos, grid, gridHeight, gridWidth]);

  // Memoize valid target cells
  const validTargetCells = useMemo(() => {
    if (!isTargeting || !targetingAction) return new Set<string>();
    const cells = new Set<string>();
    const range = targetingAction.range || 0;

    for (let x = playerPos.x - range; x <= playerPos.x + range; x++) {
      for (let y = playerPos.y - range; y <= playerPos.y + range; y++) {
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
          if (targetingAction.id === 'move') {
            const path = findPath(playerPos, { x, y }, grid);
            if (!path || path.length > range) continue;
          }
          cells.add(`${x},${y}`);
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

    // 1. Draw Grid Lines (if visible)
    if (isGridVisible) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= gridWidth; x++) {
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, gridHeight * cellSize);
      }
      for (let y = 0; y <= gridHeight; y++) {
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(gridWidth * cellSize, y * cellSize);
      }
      ctx.stroke();
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

    // 4. Draw Targeted Sphere
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

  }, [grid, isGridVisible, visibleCells, isTargeting, targetingAction, validTargetCells, hoveredCell, gridWidth, gridHeight]);

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

  const rulerDistance = useMemo(() => {
    if (!hoveredCell) return null;
    return getDistance(playerPos, hoveredCell) * 5; // 5ft per cell
  }, [playerPos, hoveredCell]);

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
               animate={{ x: playerPos.x * cellSize, y: playerPos.y * cellSize }}
               className="absolute p-1"
               style={{ width: cellSize, height: cellSize }}
             >
                <div className="w-full h-full rounded-full border-2 border-blue-500 bg-blue-900/80 flex items-center justify-center overflow-hidden relative shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  {activeChar?.avatarUrl ? (
                    <img src={activeChar.avatarUrl} className="w-full h-full object-cover" alt={activeChar.name} />
                  ) : (
                    <GameIcon name="user" size={24} color="#FFF" />
                  )}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-900/95 text-white text-[7px] font-black px-2 py-0.5 rounded-full border border-blue-400/50 uppercase whitespace-nowrap shadow-lg">
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
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-dragon-darkRed/95 text-white text-[7px] font-black px-2 py-0.5 rounded-full border border-dragon-red/50 uppercase whitespace-nowrap shadow-lg">
                        {monster.name}
                      </div>
                   </motion.div>
                 );
               })}
             </AnimatePresence>
          </div>

          {/* Ruler and Distance Tooltip */}
          {hoveredCell && (
            <>
              <div 
                className="absolute pointer-events-none z-[120] flex flex-col items-center"
                style={{
                  left: hoveredCell.x * cellSize + cellSize / 2,
                  top: hoveredCell.y * cellSize - 40,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-stone-900/90 border border-dragon-gold px-2 py-1 rounded text-[10px] font-black text-dragon-gold shadow-xl flex items-center gap-2">
                  <GameIcon name="footsteps" size={12} color="#D4AF37" />
                  {rulerDistance} ft
                </div>
              </div>
              <svg className="absolute inset-0 z-[110] pointer-events-none w-full h-full overflow-visible">
                <line
                  x1={playerPos.x * cellSize + cellSize / 2}
                  y1={playerPos.y * cellSize + cellSize / 2}
                  x2={hoveredCell.x * cellSize + cellSize / 2}
                  y2={hoveredCell.y * cellSize + cellSize / 2}
                  stroke="#D4AF37"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
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
