import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../../store/useGameStore';
import { useUIStore } from '../../../store/useUIStore';
import { useWorldStore } from '../../../store/useWorldStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';
import { checkLoS, findPath, getDistance } from '../../../lib/combatUtils';

export const CombatGrid: React.FC = () => {
  const { combatState, setPlayerPos, addLog, startCombat, resolveCombatAction, toggleDoor } = useGameStore();
  const { characters, activeCharacterId } = useCharacterStore();
  const { partyLocation, weather, gameTime } = useWorldStore();
  const { isTargeting, targetingAction, setIsTargeting, setTargetingAction } = useUIStore();
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

  const activeChar = characters.find(c => c.id === activeCharacterId);
  const { playerPos, monsters, initiativeOrder, activeTurnIndex, grid } = combatState;

  // Grid constants
  const cellSize = 60; // 60px = 5ft
  const gridWidth = grid[0]?.length || 32;
  const gridHeight = grid.length || 20;

  const handleCellClick = (x: number, y: number) => {
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
      // Logic for targeting specific actions
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
      } else if (targetingAction?.id === 'items') {
        addLog(`Used item at position (${x}, ${y})`, 'success');
        setIsTargeting(false);
        setTargetingAction(null);
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
    } else if (path === null && cell.type !== 'wall') {
      addLog("Path is blocked!", 'warning');
    }
  };

  const handleMonsterClick = (monster: any) => {
    if (isTargeting) {
      if (targetingAction?.id === 'attack' || targetingAction?.id === 'spells') {
        const dx = Math.abs(monster.x - playerPos.x);
        const dy = Math.abs(monster.y - playerPos.y);
        const distance = Math.max(dx, dy);
        const range = targetingAction.range || 1;

        if (distance <= range) {
          resolveCombatAction({ name: activeChar?.name || 'Player', id: 'player' }, monster, targetingAction);

          const { consumeAction } = useCharacterStore.getState();
          consumeAction(activeCharacterId, 'actions');

          setIsTargeting(false);
          setTargetingAction(null);
        } else {
          addLog("Target is out of range!", 'warning');
        }
      } else if (targetingAction?.id === 'items') {
        addLog(`Used item on ${monster.name}`, 'success');
        setIsTargeting(false);
        setTargetingAction(null);
      }
    }
  };

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

  const isNight = gameTime < 360 || gameTime > 1200;
  const terrain = (partyLocation?.category || partyLocation?.type || 'land').toLowerCase();

  // Dynamic Background selection based on location
  const getDynamicBg = () => {
    if (terrain.includes('forest') || terrain.includes('wood')) return 'bg-[#0a0f0a]';
    if (terrain.includes('mountain') || terrain.includes('peak')) return 'bg-[#1a1a1c]';
    if (terrain.includes('dungeon') || terrain.includes('cave') || terrain.includes('underdark')) return 'bg-[#050505]';
    if (terrain.includes('water') || terrain.includes('sea') || terrain.includes('lake')) return 'bg-[#080c14]';
    if (terrain.includes('desert') || terrain.includes('waste')) return 'bg-[#1c1612]';
    return 'bg-stone-950';
  };

  return (
    <div className={cn(
      "w-full h-full relative overflow-hidden flex items-center justify-center font-body transition-colors duration-1000",
      getDynamicBg()
    )}>
      {/* Region Specific Texture Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay",
        terrain.includes('forest') ? "bg-[radial-gradient(circle_at_center,_#228B22_0%,_transparent_70%)]" :
        terrain.includes('mountain') ? "bg-[radial-gradient(circle_at_center,_#444_0%,_transparent_70%)]" :
        "bg-transparent"
      )} />


      {/* Tactical Background Grid - Moved inside draggable container */}
      
      {/* Container for the tactical overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center border-4 border-dragon-gold/20 rounded-3xl overflow-hidden bg-stone-950/40">

        {/* Initiative Bar (Horizontal Top) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[100] bg-black/60 backdrop-blur-xl p-2 rounded-full border border-dragon-gold/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
           <div className="px-4 border-r border-white/10 mr-2">
             <div className="text-[8px] font-black text-dragon-gold uppercase tracking-[0.3em] leading-tight">Turn</div>
             <div className="text-[11px] font-black text-white uppercase leading-tight tracking-wider">Order</div>
           </div>

           <div className="flex items-center gap-4 px-2 py-1 overflow-x-auto no-scrollbar max-w-[60vw]">
             {initiativeOrder.map((entry, idx) => {
               const isActive = idx === activeTurnIndex;
               // Attempt to find character avatar if it's a player
               const char = characters.find(c => c.id === entry.id || c.name === entry.name);
               const avatar = char?.avatarUrl;

               return (
                 <motion.div
                  key={entry.id}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  className={cn(
                    "flex flex-col items-center relative transition-all duration-500",
                    isActive ? "z-10" : "z-0"
                  )}
                 >
                    <div className={cn(
                      "w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center bg-stone-900 shadow-xl",
                      entry.isPlayer ? "border-blue-500" : "border-dragon-red",
                      isActive ? "border-dragon-gold ring-4 ring-dragon-gold/30 shadow-dragon-gold/20" : "border-white/10"
                    )}>
                       {avatar ? (
                         <img src={avatar} className="w-full h-full object-cover" alt={entry.name} />
                       ) : (
                         <GameIcon name={entry.isPlayer ? "user" : "identity"} size={20} color={entry.isPlayer ? "#3B82F6" : "#DC2626"} />
                       )}
                    </div>

                    {/* Active Indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute -bottom-6 flex flex-col items-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-dragon-gold animate-pulse shadow-[0_0_8px_#D4AF37]" />
                          <div className="text-[7px] font-black text-dragon-gold uppercase tracking-tighter whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-dragon-gold/20 mt-1">Current Turn</div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Turn Number Badge */}
                    <div className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 transition-colors",
                      isActive ? "bg-dragon-gold text-stone-950 border-stone-950" : "bg-stone-800 text-white/40 border-white/10"
                    )}>
                      {idx + 1}
                    </div>
                 </motion.div>
               );
             })}

             {initiativeOrder.length === 0 && (
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-8">Waiting for Initiative...</div>
             )}
           </div>

           <button
             onClick={startCombat}
             title="Reroll Initiative"
             className="ml-2 w-10 h-10 bg-stone-800 hover:bg-stone-700 text-dragon-gold hover:text-white rounded-full border border-white/10 transition-all flex items-center justify-center shadow-lg active:scale-90"
           >
             <GameIcon name="dice" size={16} color="currentColor" />
           </button>
        </div>


        {/* Unit Tokens Container - Draggable */}
        <motion.div
          drag
          dragMomentum={false}
          initial={{ x: 0, y: 0 }}
          className="relative border-2 border-white/5 shadow-2xl z-[70] cursor-grab active:cursor-grabbing"
          style={{
            width: gridWidth * cellSize,
            height: gridHeight * cellSize,
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 100%)'
          }}
        >
          {/* Tactical Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #444 1px, transparent 1px),
                linear-gradient(to bottom, #444 1px, transparent 1px)
              `,
              backgroundSize: `${cellSize}px ${cellSize}px`,
              width: '100%',
              height: '100%'
            }}
          />
          {/* Interactive Grid Overlay - Now perfectly aligned with token container */}
          <div
            className="absolute inset-0 z-20"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridWidth}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridHeight}, ${cellSize}px)`,
            }}
          >
            {grid.flat().map((cell, i) => {
              const { x, y, type, isOpen } = cell;
              const inRange = validTargetCells.has(`${x},${y}`);
              const isVisible = visibleCells.has(`${x},${y}`);

              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  onMouseEnter={() => setHoveredCell({ x, y })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={cn(
                    "w-full h-full cursor-crosshair transition-all border border-white/5 flex items-center justify-center relative",
                    !isVisible && "brightness-[0.2] saturate-50",
                    isTargeting && inRange ? "bg-blue-500/20 hover:bg-blue-500/40" : "hover:bg-white/5",
                    isTargeting && targetingAction?.targetType === 'sphere' && hoveredCell && 
                      Math.max(Math.abs(x - hoveredCell.x), Math.abs(y - hoveredCell.y)) <= (targetingAction.radius || 0) &&
                      "bg-dragon-red/30 border-dragon-red/50",
                    type === 'wall' && "bg-stone-800",
                    type === 'door' && "bg-amber-900/40"
                  )}
                >
                  {type === 'door' && (
                    <GameIcon
                      name={isOpen ? "package" : "lock"}
                      size={24}
                      color={isOpen ? "#D4AF37" : "#8B0000"}
                    />
                  )}
                  {type === 'wall' && isVisible && (
                    <div className="absolute inset-1 border border-white/10 opacity-20" />
                  )}
                </div>
              );
            })}
          </div>
           {/* Player Token */}
           <motion.div 
             initial={{ scale: 0 }}
             animate={{
               scale: 1,
               x: playerPos.x * cellSize,
               y: playerPos.y * cellSize
             }}
             className="absolute p-1 z-[100]"
             style={{ width: cellSize, height: cellSize }}
           >
              <div className={cn(
                "w-full h-full rounded-full border-2 border-blue-500 bg-blue-900/80 flex items-center justify-center overflow-hidden group cursor-pointer hover:scale-110 transition-transform relative shadow-[0_0_20px_rgba(59,130,246,0.4)]",
                initiativeOrder[activeTurnIndex]?.id === activeCharacterId && "border-dragon-gold ring-4 ring-dragon-gold/40 animate-[pulse_2s_infinite]"
              )}>
                {activeChar?.avatarUrl ? (
                  <img src={activeChar.avatarUrl} className="w-full h-full object-cover" alt={activeChar.name} />
                ) : (
                  <GameIcon name="user" size={24} color="#FFF" />
                )}

                {/* Status Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent pointer-events-none" />

                {/* Active Turn Glow */}
                {initiativeOrder[activeTurnIndex]?.id === activeCharacterId && (
                  <div className="absolute inset-0 border-2 border-dragon-gold rounded-full animate-pulse shadow-[inset_0_0_10px_#D4AF37]" />
                )}
              </div>

              {/* Character Name Label */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-900/95 text-white text-[7px] font-black px-2 py-0.5 rounded-full border border-blue-400/50 uppercase whitespace-nowrap z-20 shadow-lg tracking-tighter">
                {activeChar?.name || 'Player'}
              </div>

              {/* Movement Range Pulse */}
              <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-ping pointer-events-none" />
           </motion.div>

           {/* Monster Tokens */}
           <AnimatePresence>
             {monsters.map((monster, idx) => {
               const isVisible = visibleCells.has(`${monster.x},${monster.y}`);
               if (!isVisible) return null;

               const canTarget = isTargeting && (
                 (targetingAction?.id === 'attack' && Math.max(Math.abs(monster.x - playerPos.x), Math.abs(monster.y - playerPos.y)) <= 1) ||
                 (targetingAction?.id === 'items' && Math.max(Math.abs(monster.x - playerPos.x), Math.abs(monster.y - playerPos.y)) <= 4)
               );

               return (
                 <motion.div
                  key={monster.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: monster.x * cellSize,
                    y: monster.y * cellSize
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="absolute p-2 z-[90]"
                  style={{ width: cellSize, height: cellSize }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMonsterClick(monster);
                  }}
                 >
                    {/* View Cone indicator for non-combat monsters */}
                    {monster.awareness !== 'combat' && (
                      <div
                        className="absolute inset-0 bg-dragon-red/10 rounded-full animate-pulse pointer-events-none"
                        style={{
                          transform: `rotate(${monster.viewDirection * 90}deg) scaleY(2) translateY(-25%)`,
                          opacity: 0.3
                        }}
                      />
                    )}

                    <div className={cn(
                      "w-full h-full rounded-full border-2 bg-red-900/80 flex items-center justify-center overflow-hidden group cursor-pointer hover:scale-110 transition-transform relative shadow-[0_0_15px_rgba(220,38,38,0.3)]",
                      canTarget ? "border-dragon-gold ring-4 ring-dragon-gold/40 animate-pulse" : "border-dragon-red",
                      initiativeOrder[activeTurnIndex]?.id === monster.id ? "border-dragon-gold ring-4 ring-dragon-gold/40" : "",
                      monster.awareness === 'idle' ? "opacity-60" : "opacity-100"
                    )}>
                      {monster.imageUrl ? (
                        <img src={monster.imageUrl} className="w-full h-full object-cover" alt={monster.name} />
                      ) : (
                        <GameIcon name="identity" size={24} color="#FFF" />
                      )}

                      {/* Health Bar Overlay */}
                      <div className="absolute bottom-0 left-0 w-full h-2 bg-black/60 border-t border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-dragon-red to-red-500 transition-all duration-300"
                          style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                        />
                      </div>

                      {/* Active Turn Glow */}
                      {initiativeOrder[activeTurnIndex]?.id === monster.id && (
                        <div className="absolute inset-0 border-2 border-dragon-gold rounded-full animate-pulse shadow-[inset_0_0_10px_#D4AF37]" />
                      )}
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-dragon-darkRed/95 text-white text-[7px] font-black px-2 py-0.5 rounded-full border border-dragon-red/50 uppercase whitespace-nowrap z-20 shadow-lg tracking-tighter">
                      {monster.name}
                    </div>
                 </motion.div>
               );
             })}
           </AnimatePresence>
        </motion.div>
      </div>
      
      {/* HUD Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
