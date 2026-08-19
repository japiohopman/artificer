import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { fetchSpeciesData, fetchSubraceData } from '../../../services/storageService';
import { soundService } from '../../../services/soundService';

const POINT_BUY_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const MAX_POINT_BUY = 27;

export const StatsStep: React.FC<{
  newChar: Partial<Character>;
  setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
  const [speciesData, setSpeciesData] = useState<any>(null);
  const [subraceData, setSubraceData] = useState<any>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [pool, setPool] = useState<number[]>([15, 14, 13, 12, 10, 8]);
  const [poolType, setPoolType] = useState<'standard' | 'pointbuy' | 'rolled'>('standard');

  const statsList: (keyof Character['stats'])[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const labels: Record<string, string> = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
  const [assignments, setAssignments] = useState<Record<string, number>>({});

  const [pointBuyStats, setPointBuyStats] = useState<Record<string, number>>({
    str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8
  });

  const totalSpentPoints = Object.values(pointBuyStats).reduce((acc, score) => acc + (POINT_BUY_COSTS[score] || 0), 0);
  const remainingPoints = MAX_POINT_BUY - totalSpentPoints;

  useEffect(() => {
    if (newChar.race) fetchSpeciesData(newChar.race).then(setSpeciesData);
    if (newChar.subrace) fetchSubraceData(newChar.subrace).then(setSubraceData);

    if (newChar.stats && Object.keys(assignments).length === 0) {
      const initial: Record<string, number> = {};
      statsList.forEach(s => {
        if (newChar.stats && newChar.stats[s]) initial[s] = newChar.stats[s];
      });
      setAssignments(initial);
    }
  }, [newChar.race, newChar.subrace]);

  const handleAssign = (stat: keyof Character['stats'], value: number) => {
    const newAssignments = { ...assignments, [stat]: value };
    setAssignments(newAssignments);
    const newStats = { ...(newChar.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }), [stat]: value };
    setNewChar({ ...newChar, stats: newStats });
    soundService.playEffect('UI_CLICK_LIGHT');
  };

  const handleUnassign = (stat: keyof Character['stats']) => {
    const newAssignments = { ...assignments };
    delete newAssignments[stat];
    setAssignments(newAssignments);
    const newStats = { ...(newChar.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }), [stat]: 10 };
    setNewChar({ ...newChar, stats: newStats });
  };

  const rollAbilityScore = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    return rolls.slice(1).reduce((acc, val) => acc + val, 0);
  };

  const handleRollAttribute = (stat: keyof Character['stats']) => {
    soundService.playEffect('DICE_ROLL');
    setIsRolling(true);
    setTimeout(() => {
      const val = rollAbilityScore();
      handleAssign(stat, val);
      setIsRolling(false);
    }, 300);
  };

  const handleRollPool = () => {
    setIsRolling(true);
    soundService.playEffect('DICE_ROLL');
    setTimeout(() => {
      const newStats: Record<string, number> = {};
      statsList.forEach(s => {
        newStats[s] = rollAbilityScore();
      });
      setAssignments(newStats);
      setNewChar({ ...newChar, stats: newStats as any });
      setPoolType('rolled');
      setIsRolling(false);
    }, 500);
  };

  const handlePointBuyChange = (stat: string, delta: number) => {
    const current = pointBuyStats[stat] || 8;
    const next = current + delta;
    if (next < 8 || next > 15) return;

    const currentCost = POINT_BUY_COSTS[current] || 0;
    const nextCost = POINT_BUY_COSTS[next] || 0;
    const costDiff = nextCost - currentCost;

    if (delta > 0 && remainingPoints < costDiff) {
      soundService.playEffect('MENU_ERROR');
      return;
    }

    const updatedPointBuy = { ...pointBuyStats, [stat]: next };
    setPointBuyStats(updatedPointBuy);
    setNewChar({ ...newChar, stats: updatedPointBuy as any });
    soundService.playEffect('UI_CLICK_LIGHT');
  };

  const getBonus = (stat: string) => {
    let bonus = 0;
    const sKey = stat.toLowerCase();
    if (speciesData?.ability_bonuses) {
      const b = speciesData.ability_bonuses.find((ab: any) => ab.ability_score.index === sKey || ab.ability_score.name.toLowerCase().includes(sKey));
      if (b) bonus += b.bonus;
    }
    if (subraceData?.ability_bonuses) {
      const b = subraceData.ability_bonuses.find((ab: any) => ab.ability_score.index === sKey || ab.ability_score.name.toLowerCase().includes(sKey));
      if (b) bonus += b.bonus;
    }
    return bonus;
  };

  const usedIndices = (() => {
    const indices: number[] = [];
    const poolCopy = [...pool];
    Object.values(assignments).forEach(val => {
      const idx = poolCopy.findIndex(pv => pv === val);
      if (idx !== -1) {
        indices.push(idx);
        poolCopy[idx] = -1;
      }
    });
    return indices;
  })();

  return (
    <div className="space-y-6 h-full flex flex-col p-4">
      <div className="flex justify-between items-center border-b border-dragon-gold/20 pb-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-header font-black text-dragon-darkRed uppercase">Ability Scores</h2>
          <p className="text-[10px] font-bold text-parchment-600 uppercase tracking-wider">
            {poolType === 'standard' && "Standard Array (15, 14, 13, 12, 10, 8)"}
            {poolType === 'pointbuy' && `Point Buy Budget (${remainingPoints} / ${MAX_POINT_BUY} Points Remaining)`}
            {poolType === 'rolled' && "4d6 Drop Lowest Rolling Method"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPoolType('standard');
              setPool([15, 14, 13, 12, 10, 8]);
              setAssignments({});
              setNewChar({ ...newChar, stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } });
            }}
            className={cn("px-3 py-1.5 rounded-sm text-[10px] font-black uppercase border transition-all", poolType === 'standard' ? "bg-dragon-red text-white border-dragon-gold shadow-md" : "bg-white/40 border-dragon-gold/30 text-dragon-darkRed hover:bg-white")}
          >
            Standard Array
          </button>

          <button
            onClick={() => {
              setPoolType('pointbuy');
              setPointBuyStats({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
              setNewChar({ ...newChar, stats: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } });
            }}
            className={cn("px-3 py-1.5 rounded-sm text-[10px] font-black uppercase border transition-all", poolType === 'pointbuy' ? "bg-dragon-red text-white border-dragon-gold shadow-md" : "bg-white/40 border-dragon-gold/30 text-dragon-darkRed hover:bg-white")}
          >
            Point Buy (27 Pt)
          </button>

          <button
            onClick={() => {
              setPoolType('rolled');
              setAssignments({});
            }}
            className={cn("px-3 py-1.5 rounded-sm text-[10px] font-black uppercase border transition-all flex items-center gap-1.5", poolType === 'rolled' ? "bg-dragon-red text-white border-dragon-gold shadow-md" : "bg-white/40 border-dragon-gold/30 text-dragon-darkRed hover:bg-white")}
          >
            <GameIcon name="dice" size={14} color="currentColor" />
            Roll 4d6 Drop Lowest
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Attributes Column */}
        <div className="w-full lg:w-[65%] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {statsList.map(stat => {
            const base = poolType === 'pointbuy' ? (pointBuyStats[stat] || 8) : (assignments[stat] || 10);
            const bonus = getBonus(stat);
            const total = base + bonus;
            const mod = Math.floor((total - 10) / 2);
            const hasAssignment = assignments[stat] !== undefined || poolType === 'pointbuy';

            return (
              <div key={stat} className={cn("p-3.5 bg-white/60 border rounded-sm flex items-center justify-between group transition-all", hasAssignment ? "border-dragon-red/30 bg-white/80 shadow-sm" : "border-dragon-gold/20 hover:border-dragon-red/30")}>
                <div className="flex gap-4 items-center">
                  <div className={cn(
                    "w-12 h-12 border rounded-sm flex items-center justify-center transition-colors shadow-inner shrink-0",
                    hasAssignment ? "bg-dragon-red/10 border-dragon-red/30" : "bg-dragon-red/5 border-dragon-red/10 group-hover:bg-dragon-red/10"
                  )}>
                    <GameIcon name={stat} size={28} color={hasAssignment ? "#8B0000" : "rgba(139,0,0,0.4)"} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-parchment-500 tracking-widest leading-none mb-1">{stat}</span>
                    <span className="font-header font-black text-dragon-darkRed uppercase text-xl leading-tight">{labels[stat]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Score and Modifier Badge */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center w-14 h-14 bg-dragon-gold/10 border border-dragon-gold/30 rounded-sm justify-center shadow-inner relative overflow-hidden">
                      <span className="text-2xl font-header font-black text-dragon-darkRed leading-none mb-0.5">{total}</span>
                      <span className="text-[9px] font-black uppercase bg-dragon-red/10 px-1 rounded text-dragon-red">{mod >= 0 ? `+${mod}` : mod}</span>
                    </div>
                  </div>

                  {/* Mode-Specific Allocation Controls */}
                  <div className="w-36 flex items-center justify-center">
                    {poolType === 'pointbuy' ? (
                      <div className="flex items-center gap-2 bg-white/80 border border-dragon-gold/30 rounded p-1 shadow-sm">
                        <button
                          onClick={() => handlePointBuyChange(stat, -1)}
                          disabled={base <= 8}
                          className="w-8 h-8 bg-dragon-red/10 text-dragon-darkRed font-black rounded hover:bg-dragon-red hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-header font-black text-dragon-darkRed">{base}</span>
                        <button
                          onClick={() => handlePointBuyChange(stat, 1)}
                          disabled={base >= 15 || remainingPoints <= 0}
                          className="w-8 h-8 bg-dragon-red/10 text-dragon-darkRed font-black rounded hover:bg-dragon-red hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-lg"
                        >
                          +
                        </button>
                      </div>
                    ) : poolType === 'rolled' ? (
                      <button
                        onClick={() => handleRollAttribute(stat)}
                        disabled={isRolling}
                        className="px-3 py-2 bg-dragon-red text-white border border-dragon-gold/40 rounded-sm font-header font-black text-xs uppercase tracking-wider shadow-md hover:bg-dragon-darkRed transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        <GameIcon name="dice" size={14} color="#FFFFFF" />
                        {assignments[stat] !== undefined ? `Roll (${assignments[stat]})` : 'Roll 4d6'}
                      </button>
                    ) : hasAssignment ? (
                      <button
                        onClick={() => handleUnassign(stat)}
                        className="group/btn relative px-6 py-2 bg-dragon-red text-white rounded-sm font-header font-black text-sm shadow-md hover:bg-dragon-darkRed transition-all"
                      >
                        {base}
                        <span className="ml-2 text-[9px] opacity-60">✕</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 border-2 border-dashed border-dragon-gold/30 rounded-sm text-[10px] font-black uppercase text-parchment-400 italic tracking-widest bg-white/20">
                        Assign Pool
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pool / Instructions Side Panel */}
        <div className="hidden lg:flex flex-1 bg-dragon-darkRed border border-dragon-gold/30 rounded-sm p-6 flex-col justify-between shadow-2xl relative overflow-hidden text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-dragon-gold/30 pb-3">
              <GameIcon name="dice" size={24} color="#B8860B" />
              <h3 className="text-xl font-header font-black text-dragon-gold uppercase">
                {poolType === 'standard' && "Standard Array Pool"}
                {poolType === 'pointbuy' && "Point Buy Rules"}
                {poolType === 'rolled' && "4d6 Drop Lowest"}
              </h3>
            </div>

            {poolType === 'standard' && (
              <div className="space-y-4">
                <p className="text-xs text-parchment-200 leading-relaxed font-body">
                  Click a score from the pool to assign it to the next available attribute on the left.
                </p>
                <div className="flex flex-wrap gap-3">
                  {pool.map((val, idx) => {
                    const isAssigned = usedIndices.includes(idx);
                    return (
                      <button
                        key={`${val}-${idx}`}
                        disabled={isAssigned || isRolling}
                        onClick={() => {
                          const nextStat = statsList.find(s => assignments[s] === undefined);
                          if (nextStat) handleAssign(nextStat, val);
                        }}
                        className={cn(
                          "w-14 h-14 flex flex-col items-center justify-center rounded-sm border-2 transition-all relative font-header text-xl font-black",
                          isAssigned
                            ? "bg-black/50 border-white/10 text-white/30 cursor-not-allowed opacity-30"
                            : "bg-white/10 border-dragon-gold/40 text-dragon-gold hover:bg-dragon-gold hover:text-dragon-darkRed shadow-lg hover:scale-105"
                        )}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {poolType === 'pointbuy' && (
              <div className="space-y-3 text-xs font-body text-parchment-200">
                <p className="leading-relaxed">
                  All ability scores start at 8. You have 27 points to distribute across your 6 core attributes.
                </p>
                <div className="p-3 bg-black/40 border border-dragon-gold/20 rounded space-y-1">
                  <span className="text-[10px] font-black uppercase text-dragon-gold block">Cost Table:</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <span>Score 8-13: +1 pt per score</span>
                    <span>Score 14-15: +2 pt per score</span>
                  </div>
                </div>
              </div>
            )}

            {poolType === 'rolled' && (
              <div className="space-y-4">
                <p className="text-xs text-parchment-200 font-body leading-relaxed">
                  Roll 4 six-sided dice (4d6) for each attribute, drop the lowest single die, and sum the top 3 die results.
                </p>
                <button
                  onClick={handleRollPool}
                  disabled={isRolling}
                  className="w-full py-3 bg-dragon-gold text-dragon-darkRed border border-white font-header font-black uppercase tracking-wider rounded-sm shadow-xl hover:bg-white transition-all flex items-center justify-center gap-2"
                >
                  <GameIcon name="refresh" size={16} color="currentColor" className={isRolling ? "animate-spin" : ""} />
                  Roll All 6 Attributes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
