import React, { useMemo, useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useUIStore } from '../../store/useUIStore';
import { useWorldStore } from '../../store/useWorldStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { checkLoS, findPath, getDistance, getReachableCells, isCellOccupied } from './combatUtils';
import { Token } from './Token';
import { TokenActionHUD } from './TokenActionHUD';

export const CombatGrid: React.FC = () => {
  const combatState = useGameStore(state => state.combatState);
  const setPlayerPos = useGameStore(state => state.setPlayerPos);
  const addLog = useGameStore(state => state.addLog);
  const resolveCombatAction = useGameStore(state => state.resolveCombatAction);
  const toggleDoor = useGameStore(state => state.toggleDoor);

  const characters = useCharacterStore(state => state.characters);
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId);

  const partyLocation = useWorldStore(state => state.partyLocation);

  const isTargeting = useUIStore(state => state.isTargeting);
  const targetingAction = useUIStore(state => state.targetingAction);
  const setIsTargeting = useUIStore(state => state.setIsTargeting);
  const setTargetingAction = useUIStore(state => state.setTargetingAction);
  const isGridVisible = useUIStore(state => state.isGridVisible);
  const setIsGridVisible = useUIStore(state => state.setIsGridVisible);
  const setFocusedItem = useUIStore(state => state.setFocusedItem);
  const setIsMonsterProfileOpen = useUIStore(state => state.setIsMonsterProfileOpen);
  const gameMode = useUIStore(state => state.gameMode);
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
  const [draggedPos, setDraggedPos] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeChar = characters.find(c => c.id === activeCharacterId);
  const { playerPos, pcPositions, monsters, grid } = combatState;

  // Track dragging for both player, individual PCs, and individual summon/allied monsters
  const [draggedPcId, setDraggedPcId] = useState<string | null>(null);
  const [draggedMonsterId, setDraggedMonsterId] = useState<string | null>(null);

  // Find whose turn it currently is in the initiative order
  const activeTurnActor = useMemo(() => {
    if (combatState.initiativeOrder.length === 0) return null;
    return combatState.initiativeOrder[combatState.activeTurnIndex];
  }, [combatState.initiativeOrder, combatState.activeTurnIndex]);

  // Coordinates of the currently active turn token (either player or summon/ally)
  const activeTokenPos = useMemo(() => {
    if (activeTurnActor) {
      if (!activeTurnActor.isPlayer) {
        const monster = monsters.find(m => m.id === activeTurnActor.id);
        if (monster) return { x: monster.x, y: monster.y };
      } else {
        const pcPos = pcPositions?.[activeTurnActor.id];
        if (pcPos) return { x: pcPos.x, y: pcPos.y };
      }
    }
    return playerPos;
  }, [activeTurnActor, monsters, pcPositions, playerPos]);

  // Grid constants
  const cellSize = 60; // 60px = 5ft
  const gridWidth = grid[0]?.length || 32;
  const gridHeight = grid.length || 20;

  const terrain = (partyLocation?.category || partyLocation?.type || 'land').toLowerCase();

  // Memoize visible cells (updates dynamically during drag)
  const visibleCells = useMemo(() => {
    const visible = new Set<string>();
    const activeParty = characters.filter((c: any) => c && c.name !== 'Empty Slot');

    if (activeParty.length > 0) {
      activeParty.forEach(char => {
        const pos = pcPositions?.[char.id] || playerPos;
        const center = (draggedPcId === char.id && draggedPos) ? draggedPos : pos;
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            if (checkLoS(center, { x, y }, grid)) {
              visible.add(`${x},${y}`);
            }
          }
        }
      });
    } else {
      const center = draggedPos || playerPos;
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          if (checkLoS(center, { x, y }, grid)) {
            visible.add(`${x},${y}`);
          }
        }
      }
    }
    return visible;
  }, [playerPos, pcPositions, draggedPos, draggedPcId, grid, gridHeight, gridWidth, characters]);

  // Memoize valid target cells
  const validTargetCells = useMemo(() => {
    if (!isTargeting || !targetingAction) return new Set<string>();
    const range = targetingAction.range || 0;

    const actorPos = activeTokenPos;

    if (targetingAction.id === 'move') {
      return getReachableCells(actorPos, range, grid, monsters, actorPos);
    }

    const cells = new Set<string>();
    for (let x = actorPos.x - range; x <= actorPos.x + range; x++) {
      for (let y = actorPos.y - range; y <= actorPos.y + range; y++) {
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
          if (getDistance(actorPos, { x, y }) <= range) {
            cells.add(`${x},${y}`);
          }
        }
      }
    }
    return cells;
  }, [isTargeting, targetingAction, activeTokenPos, grid, gridWidth, gridHeight, monsters]);

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

      const drawGridAround = (center: {x: number, y: number}, radius: number, alpha: number = 0.2) => {
        const startX = Math.max(0, center.x - radius);
        const endX = Math.min(gridWidth, center.x + radius);
        const startY = Math.max(0, center.y - radius);
        const endY = Math.min(gridHeight, center.y + radius);

        ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
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

      // Selective grid: only around tokens or when dragging
      monsters.forEach(m => {
        if (visibleCells.has(`${m.x},${m.y}`)) {
          drawGridAround(m, 2, 0.1);
        }
      });
      drawGridAround(draggedPos || playerPos, 4, 0.3);
      if (hoveredCell) drawGridAround(hoveredCell, 1, 0.2);
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
    const hoveredMonster = monsters.find(m => {
      const mFootprint = m.size === 'Large' ? 2 : 1;
      return hoveredCell && 
             hoveredCell.x >= m.x && hoveredCell.x < m.x + mFootprint && 
             hoveredCell.y >= m.y && hoveredCell.y < m.y + mFootprint;
    });

    if (hoveredMonster && visibleCells.has(`${hoveredMonster.x},${hoveredMonster.y}`)) {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.1)';
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
      
      // Calculate threat range based on monster speed or default to 30ft (6 cells)
      const threatRange = hoveredMonster.speed || 6;
      const mFootprint = hoveredMonster.size === 'Large' ? 2 : 1;

      for (let dy = -threatRange; dy <= threatRange + mFootprint - 1; dy++) {
        for (let dx = -threatRange; dx <= threatRange + mFootprint - 1; dx++) {
          const tx = hoveredMonster.x + dx;
          const ty = hoveredMonster.y + dy;
          if (tx >= 0 && tx < gridWidth && ty >= 0 && ty < gridHeight) {
            // Check distance from any cell of the monster's footprint
            let minDist = Infinity;
            for (let fy = 0; fy < mFootprint; fy++) {
              for (let fx = 0; fx < mFootprint; fx++) {
                const dist = getDistance({ x: hoveredMonster.x + fx, y: hoveredMonster.y + fy }, { x: tx, y: ty });
                if (dist < minDist) minDist = dist;
              }
            }
            
            if (minDist <= threatRange) {
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

    const activePcPos = pcPositions?.[activeCharacterId] || playerPos;

    if (isTargeting) {
      if (targetingAction?.targetType === 'sphere') {
        const radius = targetingAction.radius || 0;
        const targets = monsters.filter(m => {
          const mFootprint = m.size === 'Large' ? 2 : 1;
          for (let fy = 0; fy < mFootprint; fy++) {
            for (let fx = 0; fx < mFootprint; fx++) {
              const dx = Math.abs((m.x + fx) - x);
              const dy = Math.abs((m.y + fy) - y);
              if (Math.max(dx, dy) <= radius) return true;
            }
          }
          return false;
        });

        targets.forEach(monster => {
          resolveCombatAction({ name: activeChar?.name || 'Player', id: activeCharacterId }, monster, targetingAction);
        });

        const { consumeAction, castSpell } = useCharacterStore.getState();
        consumeAction(activeCharacterId, targetingAction.actionType || 'actions');
        if (targetingAction.category === 'Spells' && targetingAction.data?.level !== undefined) {
          castSpell(targetingAction.id, targetingAction.data.level);
        }

        setIsTargeting(false);
        setTargetingAction(null);
        return;
      }

      if (targetingAction?.id === 'move') {
        if (isCellOccupied(x, y, activePcPos, monsters, playerPos, 'Medium')) {
          addLog("That position is already occupied!", 'warning');
          return;
        }
        const path = findPath(activePcPos, { x, y }, grid, monsters, playerPos);
        const maxMove = activeChar?.actionEconomy?.movement?.current || 30;

        if (path && path.length * 5 <= maxMove) {
          setPlayerPos(x, y, activeCharacterId);
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
    if (isCellOccupied(x, y, activePcPos, monsters, playerPos, 'Medium')) {
      addLog("That position is already occupied!", 'warning');
      return;
    }
    const { gameMode } = useUIStore.getState();
    const path = findPath(activePcPos, { x, y }, grid, monsters, playerPos);

    if (path && path.length > 0) {
      const isCombat = gameMode === 'combat';
      const moveLimit = 6; // 30ft

      if (!isCombat || path.length <= moveLimit) {
        setPlayerPos(x, y, activeCharacterId);
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
    const activeTokenCoordinates = draggedMonsterId
      ? (monsters.find(m => m.id === draggedMonsterId) || playerPos)
      : activeTokenPos;
    return findPath(activeTokenCoordinates, target, grid, monsters, playerPos);
  }, [activeTokenPos, hoveredCell, draggedPos, grid, monsters, draggedMonsterId, playerPos]);

  const rulerDistance = useMemo(() => {
    const target = hoveredCell || draggedPos;
    if (!target) return null;
    const activeTokenCoordinates = draggedMonsterId
      ? (monsters.find(m => m.id === draggedMonsterId) || playerPos)
      : activeTokenPos;
    const dist = rulerPath ? rulerPath.length : getDistance(activeTokenCoordinates, target);
    return dist * 5; // 5ft per cell
  }, [activeTokenPos, hoveredCell, draggedPos, rulerPath, draggedMonsterId, playerPos]);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-950 font-body">
      {/* Antique Atlas Background */}
      <div className="absolute inset-0 bg-[#0f0e0c] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/assets/images/ui/parchment_texture.webp')] opacity-20 pointer-events-none mix-blend-overlay" />
      
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
          className="relative shadow-2xl cursor-grab active:cursor-grabbing border-4 border-dragon-gold/20 bg-[#1a1814]"
          style={{ 
            width: gridWidth * cellSize, 
            height: gridHeight * cellSize,
            backgroundImage: combatState.combatMapBackground ? `url(${combatState.combatMapBackground.startsWith('http') || combatState.combatMapBackground.startsWith('/') ? combatState.combatMapBackground : `/assets/atlas/combat/combat_map_terrain/${combatState.combatMapBackground}`})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
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

          {/* Tokens Layer */}
          <div className="absolute inset-0 pointer-events-none z-20">
             {/* Floating Token Action HUD (Roll20-style overlay around/above player or allied summon token) */}
             {gameMode === 'combat' && !isTargeting && !draggedPos && !draggedMonsterId && (
               <TokenActionHUD
                 x={activeTokenPos.x}
                 y={activeTokenPos.y}
                 cellSize={cellSize}
               />
             )}

             {/* Player Character Tokens */}
             {characters.filter(char => char && char.name !== 'Empty Slot').map((char) => {
               const pos = pcPositions?.[char.id] || playerPos;
               const rot = (pcPositions?.[char.id] as any)?.rotation || 0;
               const isPcActive = activeTurnActor?.id === char.id;

               return (
                 <Token
                    key={char.id}
                    id={char.id}
                    name={char.name}
                    imageUrl={char.avatarUrl || char.imageUrl}
                    hp={char.hp}
                    maxHp={char.maxHp}
                    x={pos.x}
                    y={pos.y}
                    rotation={rot}
                    cellSize={cellSize}
                    isPlayer
                    isActive={isPcActive}
                    draggedPos={draggedPcId === char.id ? draggedPos : null}
                    onDrag={(_, info) => {
                      setDraggedPcId(char.id);
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
                          if (isCellOccupied(x, y, pos, monsters, playerPos, 'Medium')) {
                            addLog("That position is already occupied!", 'warning');
                            setDraggedPos(null);
                            setDraggedPcId(null);
                            return;
                          }
                          const { gameMode } = useUIStore.getState();
                          const path = findPath(pos, { x, y }, grid, monsters, playerPos);
                          if (path && path.length > 0) {
                            const isCombat = gameMode === 'combat';
                            const maxMove = char?.actionEconomy?.movement?.current || 30;
                            if (!isCombat || path.length * 5 <= maxMove) {
                              setPlayerPos(x, y, char.id);
                              addLog(`${char.name} ${isCombat ? 'Combat move' : 'Exploration move'} to (${x}, ${y})`, 'info');
                              if (isCombat) {
                                const { consumeMovement } = useCharacterStore.getState();
                                consumeMovement(char.id, path.length * 5);
                              }
                            } else {
                              addLog("That position is too far!", 'warning');
                            }
                          }
                        }
                      }
                      setDraggedPos(null);
                      setDraggedPcId(null);
                    }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      // Set this character as active
                      const { setActiveCharacter } = useCharacterStore.getState();
                      setActiveCharacter(char.id);
                      addLog(`Selected character: ${char.name}`, 'info');
                    }}
                 />
               );
             })}

             {/* Monster & Allied Summon Tokens */}
             <AnimatePresence>
               {monsters.map((monster) => {
                 const isVisible = visibleCells.has(`${monster.x},${monster.y}`);
                 if (!isVisible) return null;

                 const isMonsterActive = activeTurnActor?.id === monster.id;

                 let monsterRot = 0;
                 if (monster.viewDirection !== undefined) {
                   if (monster.viewDirection === 0) monsterRot = 180;
                   else if (monster.viewDirection === 1) monsterRot = 270;
                   else if (monster.viewDirection === 2) monsterRot = 0;
                   else if (monster.viewDirection === 3) monsterRot = 90;
                   else monsterRot = monster.viewDirection;
                 }

                 return (
                   <Token
                    key={monster.id}
                    id={monster.id}
                    name={monster.name}
                    imageUrl={monster.imageUrl}
                    hp={monster.hp}
                    maxHp={monster.maxHp}
                    x={monster.x}
                    y={monster.y}
                    rotation={monsterRot}
                    cellSize={cellSize}
                    size={monster.size}
                    isAlly={monster.isAlly}
                    isActive={isMonsterActive}
                    isTargeting={isTargeting}
                    isHovered={hoveredCell?.x === monster.x && hoveredCell?.y === monster.y}
                    draggedPos={draggedMonsterId === monster.id ? draggedPos : null}
                    onDrag={(_, info) => {
                      if (!monster.isAlly) return;
                      setDraggedMonsterId(monster.id);
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
                      if (!monster.isAlly) return;
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect) {
                        const x = Math.floor((info.point.x - rect.left) / cellSize);
                        const y = Math.floor((info.point.y - rect.top) / cellSize);
                        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                          const originalPos = { x: monster.x, y: monster.y };
                          if (isCellOccupied(x, y, originalPos, monsters, playerPos, monster.size || 'Medium')) {
                            addLog("That position is already occupied!", 'warning');
                            setDraggedPos(null);
                            setDraggedMonsterId(null);
                            return;
                          }
                          const path = findPath(originalPos, { x, y }, grid, monsters, playerPos, monster.size || 'Medium');
                          if (path && path.length > 0) {
                            // Move summon/allied monster
                            useGameStore.setState(state => ({
                              combatState: {
                                ...state.combatState,
                                monsters: state.combatState.monsters.map(m => m.id === monster.id ? { ...m, x, y } : m)
                              }
                            }));
                            addLog(`Ally ${monster.name} moved to (${x}, ${y})`, 'info');
                          }
                        }
                      }
                      setDraggedPos(null);
                      setDraggedMonsterId(null);
                    }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isTargeting) {
                        const dist = getDistance(playerPos, { x: monster.x, y: monster.y });
                        if (dist <= (targetingAction?.range || 1)) {
                          resolveCombatAction({ name: activeChar?.name || 'Player', id: 'player' }, monster, targetingAction);
                          const { consumeAction, castSpell } = useCharacterStore.getState();
                          consumeAction(activeCharacterId, targetingAction?.actionType || 'actions');
                          if (targetingAction?.category === 'Spells' && targetingAction.data?.level !== undefined) {
                            castSpell(targetingAction.id, targetingAction.data.level);
                          }
                          setIsTargeting(false);
                          setTargetingAction(null);
                        } else {
                          addLog("Target out of range!", "warning");
                        }
                      } else {
                        const { fetchMonsterData } = await import('../../services/storageService');
                        const fullData = await fetchMonsterData(monster.type || monster.name.toLowerCase().replace(/\s+/g, '-'));
                        setFocusedItem(fullData || monster);
                        setIsMonsterProfileOpen(true);
                      }
                    }}
                   />
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
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#D4AF37" />
                  </marker>
                </defs>
                <line
                  x1={(draggedMonsterId ? (monsters.find(m => m.id === draggedMonsterId)?.x ?? playerPos.x) : activeTokenPos.x) * cellSize + cellSize / 2}
                  y1={(draggedMonsterId ? (monsters.find(m => m.id === draggedMonsterId)?.y ?? playerPos.y) : activeTokenPos.y) * cellSize + cellSize / 2}
                  x2={(hoveredCell || draggedPos)!.x * cellSize + cellSize / 2}
                  y2={(hoveredCell || draggedPos)!.y * cellSize + cellSize / 2}
                  stroke="#D4AF37"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  opacity="0.6"
                  markerEnd="url(#arrowhead)"
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
