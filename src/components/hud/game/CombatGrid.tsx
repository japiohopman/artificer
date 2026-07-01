import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../../store/useGameStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { GameIcon } from '../../../game_icons';
import { cn } from '../../../lib/utils';

export const CombatGrid: React.FC = () => {
  const { combatState, setPlayerPos, addLog, nextTurn, startCombat } = useGameStore();
  const { characters, activeCharacterId } = useCharacterStore();
  
  const activeChar = characters.find(c => c.id === activeCharacterId);
  const { playerPos, monsters, initiativeOrder, activeTurnIndex } = combatState;

  // Grid constants
  const cellSize = 60; // 60px = 5ft
  const gridWidth = 12;
  const gridHeight = 8;

  const handleCellClick = (x: number, y: number) => {
    // Basic movement logic: check if distance is within range (e.g., 6 cells = 30ft)
    const dx = Math.abs(x - playerPos.x);
    const dy = Math.abs(y - playerPos.y);
    const distance = Math.max(dx, dy); // Chebyshev distance for grid movement

    if (distance > 0 && distance <= 6) {
      setPlayerPos(x, y);
      addLog(`Moved to position (${x}, ${y})`, 'info');
    } else if (distance > 6) {
      addLog("That position is out of your movement range!", 'warning');
    }
  };

  return (
    <div className="w-full h-full relative bg-stone-950 overflow-hidden flex items-center justify-center font-body">
      {/* Tactical Background Grid */}
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
      
      {/* Placeholder content for the tactical overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center border-4 border-dragon-gold/20 m-4 rounded-3xl">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="w-12 h-1 bg-dragon-red" />
            <h2 className="font-header text-3xl text-white uppercase tracking-[0.4em]">Tactical Overlay</h2>
            <div className="w-12 h-1 bg-dragon-red" />
          </div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Combat Matrix Initialized - Waiting for Turn Sequence</p>
        </div>

        {/* Initiative Tracker */}
        <div className="absolute top-24 right-8 flex flex-col gap-3 z-30">
           <div className="text-[9px] font-black text-dragon-gold uppercase tracking-widest text-right mb-1">Initiative Order</div>
           {initiativeOrder.map((entry, idx) => {
             const isActive = idx === activeTurnIndex;
             return (
               <motion.div
                key={entry.id}
                animate={{ scale: isActive ? 1.1 : 1, x: isActive ? -10 : 0 }}
                className={cn(
                  "flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded border transition-all cursor-pointer",
                  isActive ? "border-dragon-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "border-white/10 opacity-60"
                )}
               >
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 overflow-hidden flex items-center justify-center",
                    entry.isPlayer ? "border-blue-500 bg-blue-900/40" : "border-dragon-red bg-red-900/40"
                  )}>
                     <GameIcon name={entry.isPlayer ? "user" : "identity"} size={14} color="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase truncate w-24">{entry.name}</span>
                    <span className="text-[8px] font-bold text-dragon-gold uppercase tracking-tighter">Initiative: {entry.value}</span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-dragon-gold animate-pulse shadow-[0_0_8px_#D4AF37]" />
                  )}
               </motion.div>
             );
           })}

           <button
             onClick={startCombat}
             className="px-4 py-2 bg-stone-800 text-parchment-400 text-[8px] font-black uppercase rounded border border-white/10 hover:bg-stone-700 transition-all"
           >
             Reroll Initiative
           </button>
        </div>


        {/* Unit Tokens Container */}
        <div
          className="relative border-2 border-white/5 shadow-2xl z-10"
          style={{
            width: gridWidth * cellSize,
            height: gridHeight * cellSize,
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 100%)'
          }}
        >
          {/* Interactive Grid Overlay - Now perfectly aligned with token container */}
          <div
            className="absolute inset-0 z-20"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridWidth}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridHeight}, ${cellSize}px)`,
            }}
          >
            {Array.from({ length: gridWidth * gridHeight }).map((_, i) => {
              const x = i % gridWidth;
              const y = Math.floor(i / gridWidth);
              return (
                <div
                  key={i}
                  onClick={() => handleCellClick(x, y)}
                  className="w-full h-full hover:bg-white/5 cursor-crosshair transition-colors border border-white/5"
                />
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
             className="absolute p-2"
             style={{ width: cellSize, height: cellSize }}
           >
              <div className="w-full h-full rounded-full border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-blue-900/80 flex items-center justify-center overflow-hidden group cursor-pointer hover:scale-110 transition-transform">
                {activeChar?.avatarUrl ? (
                  <img src={activeChar.avatarUrl} className="w-full h-full object-cover" alt={activeChar.name} />
                ) : (
                  <GameIcon name="user" size={24} color="#FFF" />
                )}
                {/* Movement Range Pulse */}
                <div className="absolute inset-0 border border-blue-400/30 rounded-full animate-ping pointer-events-none" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-900/90 text-white text-[7px] font-black px-1.5 py-0.5 rounded border border-blue-400 uppercase whitespace-nowrap z-20">
                {activeChar?.name || 'Player'}
              </div>
           </motion.div>

           {/* Monster Tokens */}
           <AnimatePresence>
             {monsters.map((monster, idx) => (
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
                className="absolute p-2"
                style={{ width: cellSize, height: cellSize }}
               >
                  <div className="w-full h-full rounded-full border-2 border-dragon-red shadow-[0_0_15px_rgba(220,38,38,0.5)] bg-red-900/80 flex items-center justify-center overflow-hidden group cursor-pointer hover:scale-110 transition-transform">
                    {monster.imageUrl ? (
                      <img src={monster.imageUrl} className="w-full h-full object-cover" alt={monster.name} />
                    ) : (
                      <GameIcon name="identity" size={24} color="#FFF" />
                    )}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-dragon-darkRed/90 text-white text-[7px] font-black px-1.5 py-0.5 rounded border border-dragon-red/50 uppercase whitespace-nowrap z-20">
                    {monster.name}
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>
      
      {/* HUD Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
