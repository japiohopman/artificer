import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useStore';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { fetchSpeciesData, fetchSubraceData } from '../../../services/storageService';
import { soundService } from '../../../services/soundService';

const STAT_ICONS: Record<string, any> = {
    str: 'str',
    dex: 'dex',
    con: 'con',
    int: 'int',
    wis: 'wis',
    cha: 'cha'
};

export const StatsStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [speciesData, setSpeciesData] = useState<any>(null);
    const [subraceData, setSubraceData] = useState<any>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [pool, setPool] = useState<number[]>([15, 14, 13, 12, 10, 8]);
    const [poolType, setPoolType] = useState<'standard' | 'rolled'>('standard');
    
    const statsList: (keyof Character['stats'])[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const labels = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
    const [assignments, setAssignments] = useState<Record<string, number>>({});

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

    const handleRollPool = () => {
        setIsRolling(true);
        setTimeout(() => {
            const newPool = Array.from({ length: 6 }, rollAbilityScore).sort((a, b) => b - a);
            setPool(newPool);
            setPoolType('rolled');
            setAssignments({});
            setNewChar({ ...newChar, stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } });
            setIsRolling(false);
            soundService.playEffect('DICE_ROLL');
        }, 600);
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
            <div className="flex justify-between items-end">
                <h2 className="text-2xl font-header font-black text-dragon-darkRed uppercase">Core Attributes</h2>
                <div className="flex gap-2">
                    <button onClick={() => { setPool([15, 14, 13, 12, 10, 8]); setPoolType('standard'); setAssignments({}); setNewChar({...newChar, stats: {str:10,dex:10,con:10,int:10,wis:10,cha:10}}); }} className={cn("px-3 py-1.5 rounded-sm text-[9px] font-black uppercase border", poolType === 'standard' ? "bg-dragon-red text-white" : "bg-white/40")}>Standard Array</button>
                    <button onClick={handleRollPool} disabled={isRolling} className={cn("px-3 py-1.5 rounded-sm text-[9px] font-black uppercase border flex items-center gap-2", poolType === 'rolled' ? "bg-dragon-red text-white" : "bg-white/40")}>Roll Pools</button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className="w-[60%] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {statsList.map(stat => {
                        const base = assignments[stat] || 10;
                        const bonus = getBonus(stat);
                        const total = base + bonus;
                        const mod = Math.floor((total - 10) / 2);
                        const hasAssignment = assignments[stat] !== undefined;

                        return (
                            <div key={stat} className={cn("p-4 bg-white/40 border rounded-sm flex items-center justify-between group transition-all", hasAssignment ? "border-dragon-red/30 bg-white/70 shadow-sm" : "border-dragon-gold/10 hover:border-dragon-red/20")}>
                                 <div className="flex gap-4 items-center">
                                     <div className={cn(
                                         "w-12 h-12 border rounded-sm flex items-center justify-center transition-colors shadow-inner",
                                         hasAssignment ? "bg-dragon-red/10 border-dragon-red/30" : "bg-dragon-red/5 border-dragon-red/10 group-hover:bg-dragon-red/10"
                                     )}>
                                         <GameIcon name={stat} size={32} color={hasAssignment ? "#8B0000" : "rgba(139,0,0,0.4)"} />
                                     </div>
                                     <div className="flex flex-col">
                                         <span className="text-[9px] font-black uppercase text-parchment-400 tracking-widest leading-none mb-1">{stat}</span>
                                         <span className="font-header font-black text-dragon-darkRed uppercase text-xl leading-tight">{labels[stat]}</span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-8">
                                     <div className="flex flex-col items-center w-14 h-16 bg-dragon-red/5 border border-dragon-red/20 rounded-sm justify-center shadow-lg relative overflow-hidden group/mod">
                                         <div className="absolute inset-x-0 top-0 h-0.5 bg-dragon-red opacity-30" />
                                         <span className="text-3xl font-header font-black text-dragon-red leading-none mb-1">{total}</span>
                                         <div className="flex items-center gap-1">
                                             <span className="text-[10px] font-black uppercase bg-dragon-red/10 px-1 rounded-sm text-dragon-darkRed">{mod >= 0 ? `+${mod}` : mod}</span>
                                         </div>
                                     </div>
                                     <div className="w-28 flex items-center justify-center">
                                         {hasAssignment ? (
                                             <button 
                                                 onClick={() => handleUnassign(stat)} 
                                                 className="group/btn relative px-6 py-2 bg-dragon-red text-white rounded-sm font-header font-black text-lg shadow-md hover:bg-dragon-darkRed transition-all hover:scale-105 active:scale-95"
                                             >
                                                 {base}
                                                 <div className="absolute -top-1 -right-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                                     <GameIcon name="close" size={12} color="#FFFFFF" className="bg-black rounded-full p-0.5" />
                                                 </div>
                                             </button>
                                         ) : (
                                             <div className="px-6 py-2 border-2 border-dashed border-dragon-gold/30 rounded-sm text-[10px] font-black uppercase text-parchment-300 italic tracking-widest bg-white/20">
                                                 Assign
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                        );
                    })}
                </div>

                <div className="flex-1 bg-dragon-darkRed border border-dragon-gold/30 rounded-sm p-6 flex flex-col gap-6 shadow-2xl overflow-hidden relative">
                    <div className="flex flex-wrap gap-4">
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
                                    className={cn("w-16 h-16 flex flex-col items-center justify-center rounded-sm border-2 transition-all relative", isAssigned ? "bg-black/40 opacity-20" : "bg-white/10 border-dragon-gold/30 text-dragon-gold hover:bg-dragon-gold hover:text-dragon-darkRed hover:border-white shadow-lg")}
                                >
                                    <span className="text-2xl font-header font-black">{val}</span>
                                    {isAssigned && <GameIcon name="check" size={14} color="#8B0000" className="absolute top-2 right-2" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
