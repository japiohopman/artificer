import React, { useState, useMemo, useRef } from 'react';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const COVER = {
  NO_COVER: 'No Cover',
  HALF_COVER: 'Half Cover',
  THREE_QUARTERS_COVER: 'Three-Quarters Cover',
  FULL_COVER: 'Full Cover'
} as const;

export function calculateCover(attacker: { x: number, y: number }, target: { x: number, y: number }, walls: Set<string>) {
  let x0 = attacker.x;
  let y0 = attacker.y;
  const x1 = target.x;
  const y1 = target.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let blockedCellsCount = 0;
  let totalCells = 0;

  while (true) {
    if (x0 === x1 && y0 === y1) break;

    if (x0 !== attacker.x || y0 !== attacker.y) {
      totalCells++;
      if (walls.has(`${x0},${y0}`)) {
        blockedCellsCount++;
      }
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  if (totalCells === 0) return COVER.NO_COVER;
  const blockedPercent = (blockedCellsCount / totalCells) * 100;

  if (blockedPercent === 0) return COVER.NO_COVER;
  if (blockedPercent >= 75) return COVER.FULL_COVER;
  if (blockedPercent >= 50) return COVER.THREE_QUARTERS_COVER;
  return COVER.HALF_COVER;
}

type DrawTool = 'wall' | 'door' | 'room' | 'enemy' | 'entrance' | 'exit' | 'inspectable' | 'cover_attacker' | 'cover_target' | 'eraser';

export const BattleMapEditor: React.FC = () => {
  const [gridSize, setGridSize] = useState({ width: 16, height: 12 });
  const [activeTool, setActiveTool] = useState<DrawTool>('wall');
  const [scale, setScale] = useState(5); // 5ft per cell
  const [selectedTheme, setSelectedTheme] = useState('dungeon');

  // Element maps/sets
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [doors, setDoors] = useState<Set<string>>(new Set());
  const [rooms, setRooms] = useState<Set<string>>(new Set());
  const [enemies, setEnemies] = useState<Map<string, string>>(new Map()); // "x,y" -> name
  const [entrance, setEntrance] = useState<{ x: number, y: number } | null>(null);
  const [exit, setExit] = useState<{ x: number, y: number } | null>(null);
  const [inspectables, setInspectables] = useState<Map<string, string>>(new Map()); // "x,y" -> desc

  // Auto Cover selection
  const [attacker, setAttacker] = useState<{ x: number, y: number } | null>(null);
  const [target, setTarget] = useState<{ x: number, y: number } | null>(null);

  const calculatedCoverResult = useMemo(() => {
    if (attacker && target) {
      return calculateCover(attacker, target, walls);
    }
    return null;
  }, [attacker, target, walls]);

  const handleCellClick = (x: number, y: number) => {
    const key = `${x},${y}`;
    const newWalls = new Set(walls);
    const newDoors = new Set(doors);
    const newRooms = new Set(rooms);
    const newEnemies = new Map(enemies);
    const newInspectables = new Map(inspectables);

    if (activeTool === 'eraser') {
      newWalls.delete(key);
      newDoors.delete(key);
      newRooms.delete(key);
      newEnemies.delete(key);
      newInspectables.delete(key);
      if (entrance?.x === x && entrance?.y === y) setEntrance(null);
      if (exit?.x === x && exit?.y === y) setExit(null);
      if (attacker?.x === x && attacker?.y === y) setAttacker(null);
      if (target?.x === x && target?.y === y) setTarget(null);

      setWalls(newWalls);
      setDoors(newDoors);
      setRooms(newRooms);
      setEnemies(newEnemies);
      setInspectables(newInspectables);
      return;
    }

    // Single select tool logic
    if (activeTool === 'wall') {
      if (newWalls.has(key)) newWalls.delete(key);
      else newWalls.add(key);
      setWalls(newWalls);
    } else if (activeTool === 'door') {
      if (newDoors.has(key)) newDoors.delete(key);
      else newDoors.add(key);
      setDoors(newDoors);
    } else if (activeTool === 'room') {
      if (newRooms.has(key)) newRooms.delete(key);
      else newRooms.add(key);
      setRooms(newRooms);
    } else if (activeTool === 'enemy') {
      if (newEnemies.has(key)) newEnemies.delete(key);
      else newEnemies.set(key, 'Orc Sentry');
      setEnemies(newEnemies);
    } else if (activeTool === 'inspectable') {
      if (newInspectables.has(key)) newInspectables.delete(key);
      else newInspectables.set(key, 'Ancient Runestone');
      setInspectables(newInspectables);
    } else if (activeTool === 'entrance') {
      setEntrance({ x, y });
    } else if (activeTool === 'exit') {
      setExit({ x, y });
    } else if (activeTool === 'cover_attacker') {
      setAttacker({ x, y });
    } else if (activeTool === 'cover_target') {
      setTarget({ x, y });
    }
  };

  const handleExportMap = () => {
    const mapData = {
      theme: selectedTheme,
      scale,
      gridSize,
      walls: Array.from(walls),
      doors: Array.from(doors),
      rooms: Array.from(rooms),
      enemies: Array.from(enemies.entries()),
      entrance,
      exit,
      inspectables: Array.from(inspectables.entries())
    };
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battlemap_${selectedTheme}.json`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <GameIcon name="panel" size={18} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Map_Crafter_Engine</div>
            <div className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
               Battle Map Editor v1.0
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleExportMap}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 transition-colors border border-purple-500/20 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <GameIcon name="refresh" size={12} className="rotate-180" />
            Export Blueprint
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-[320px] bg-[#1e1e1e] border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          {/* Theme & Scale */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Map Environment Configuration</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-white/50 uppercase font-black">Theme</span>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none"
                >
                  <option value="dungeon">Dungeon Crypt</option>
                  <option value="forest">Fey Forest</option>
                  <option value="tundra">Frozen Tundra</option>
                  <option value="ruins">Temple Ruins</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-white/50 uppercase font-black">Scale</span>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none"
                >
                  <option value={5}>5 ft / cell</option>
                  <option value={10}>10 ft / cell</option>
                  <option value={15}>15 ft / cell</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Draw Tools */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Map Drawing Layers</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'wall', label: 'Wall (Muren)', icon: 'panel', color: 'bg-stone-800 text-amber-500' },
                { id: 'door', label: 'Door (Deur)', icon: 'location', color: 'bg-orange-900/50 text-orange-400' },
                { id: 'room', label: 'Room (Kamer)', icon: 'panel', color: 'bg-blue-900/30 text-blue-400' },
                { id: 'enemy', label: 'Enemy Sentry', icon: 'attack', color: 'bg-red-950 text-red-500' },
                { id: 'entrance', label: 'Entrance (Entree)', icon: 'identity', color: 'bg-green-950 text-green-400' },
                { id: 'exit', label: 'Exit Outpost', icon: 'close', color: 'bg-indigo-950 text-indigo-400' },
                { id: 'inspectable', label: 'Inspectable', icon: 'search', color: 'bg-teal-950 text-teal-400' },
                { id: 'eraser', label: 'Eraser', icon: 'close', color: 'bg-stone-900 text-stone-400 border border-dashed border-white/20' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id as any)}
                  className={cn(
                    "p-3 rounded-lg flex flex-col items-center gap-1.5 text-center transition-all",
                    activeTool === t.id
                      ? "bg-purple-600 text-white ring-2 ring-purple-400 scale-102"
                      : "bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/5"
                  )}
                >
                  <div className={cn("p-1.5 rounded-full shrink-0", activeTool !== t.id && t.color)}>
                     <GameIcon name={t.icon} size={14} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Cover & Shade (Automatic Cover Calculator) */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Levels - Cover Calculator</label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTool('cover_attacker')}
                className={cn(
                  "p-2 rounded border text-[8px] font-black uppercase tracking-widest transition-all",
                  activeTool === 'cover_attacker'
                    ? "bg-yellow-600 text-white border-yellow-500"
                    : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                )}
              >
                Set Attacker
              </button>
              <button
                onClick={() => setActiveTool('cover_target')}
                className={cn(
                  "p-2 rounded border text-[8px] font-black uppercase tracking-widest transition-all",
                  activeTool === 'cover_target'
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                )}
              >
                Set Target
              </button>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-white/60">
                <span>Attacker cell:</span>
                <span className="text-yellow-400 font-mono">{attacker ? `(${attacker.x}, ${attacker.y})` : 'Not Set'}</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-white/60">
                <span>Target cell:</span>
                <span className="text-blue-400 font-mono">{target ? `(${target.x}, ${target.y})` : 'Not Set'}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Auto Cover:</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                  calculatedCoverResult === COVER.NO_COVER ? "bg-green-600/10 text-green-400" :
                  calculatedCoverResult === COVER.HALF_COVER ? "bg-yellow-600/10 text-yellow-400" :
                  calculatedCoverResult === COVER.THREE_QUARTERS_COVER ? "bg-orange-600/10 text-orange-400" :
                  calculatedCoverResult === COVER.FULL_COVER ? "bg-red-600/10 text-red-400" : "text-white/30"
                )}>
                  {calculatedCoverResult || 'Awaiting Inputs'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawing Grid Space */}
        <div className="flex-1 bg-[#151515] p-8 flex items-center justify-center overflow-auto custom-scrollbar">
          <div
            className="grid gap-[1px] bg-white/5 border-2 border-white/10 p-2 shadow-2xl relative"
            style={{
              gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
              width: gridSize.width * 42,
              height: gridSize.height * 42
            }}
          >
            {Array.from({ length: gridSize.height }).map((_, y) => (
              Array.from({ length: gridSize.width }).map((_, x) => {
                const key = `${x},${y}`;
                const isWall = walls.has(key);
                const isDoor = doors.has(key);
                const isRoom = rooms.has(key);
                const hasEnemy = enemies.has(key);
                const hasInspectable = inspectables.has(key);
                const isEntrance = entrance?.x === x && entrance?.y === y;
                const isExit = exit?.x === x && exit?.y === y;
                const isAttackerCell = attacker?.x === x && attacker?.y === y;
                const isTargetCell = target?.x === x && target?.y === y;

                return (
                  <button
                    key={key}
                    onClick={() => handleCellClick(x, y)}
                    className={cn(
                      "w-10 h-10 transition-all relative flex items-center justify-center group font-mono text-[9px]",
                      isWall ? "bg-stone-800 border border-stone-700 shadow-inner" :
                      isDoor ? "bg-orange-950/60 border border-orange-500/50" :
                      isRoom ? "bg-blue-950/30 border border-blue-500/30" :
                      "bg-black/20 border border-white/[0.02] hover:bg-white/[0.04]"
                    )}
                  >
                    {/* Render visual indicators */}
                    {isEntrance && <div className="w-5 h-5 bg-green-500 rounded-sm flex items-center justify-center text-black font-black uppercase text-[8px] shadow">ENT</div>}
                    {isExit && <div className="w-5 h-5 bg-indigo-500 rounded-sm flex items-center justify-center text-white font-black uppercase text-[8px] shadow">EXT</div>}
                    {hasEnemy && <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-[8px] shadow animate-pulse">EN</div>}
                    {hasInspectable && <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center text-black font-bold text-[8px] shadow">?</div>}

                    {/* Attacker / Target Overlays */}
                    {isAttackerCell && (
                      <div className="absolute inset-0 border-2 border-yellow-500 bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold font-elan">
                        ATT
                      </div>
                    )}
                    {isTargetCell && (
                      <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold font-elan">
                        TGT
                      </div>
                    )}

                    {/* Cell Coordinate overlay on Hover */}
                    <span className="absolute opacity-0 group-hover:opacity-60 text-[6px] text-white/40 bottom-0.5 right-1 pointer-events-none">
                      {x},{y}
                    </span>
                  </button>
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
