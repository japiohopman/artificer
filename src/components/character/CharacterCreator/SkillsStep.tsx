import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useStore';
import { SKILL_LIST } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { soundService } from '../../../services/soundService';
import { fetchClassData } from '../../../services/storageService';
import { GameIcon } from '../../../game_icons';

export const SkillsStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [classData, setClassData] = useState<any>(null);
    const [selectionLimit, setSelectionLimit] = useState(2);

    useEffect(() => {
        if (newChar.class) {
            fetchClassData(newChar.class).then(data => {
                setClassData(data);
                if (data?.proficiency_choices?.[0]) {
                    setSelectionLimit(data.proficiency_choices[0].choose);
                }
            });
        }
    }, [newChar.class]);

    const isProficient = (skillName: string) => {
        return newChar.proficiencies?.includes(skillName);
    };

    const toggleSkill = (skillName: string) => {
        const current = newChar.proficiencies || [];
        if (current.includes(skillName)) {
            setNewChar({ ...newChar, proficiencies: current.filter(s => s !== skillName) });
        } else {
            if (current.length < (classData?.proficiencies?.length || 0) + selectionLimit) {
                 setNewChar({ ...newChar, proficiencies: [...current, skillName] });
            }
        }
        soundService.playEffect('UI_CLICK_LIGHT');
    };

    const rawOptions = classData?.proficiency_choices?.[0]?.from;
    const classSkillOptions = Array.isArray(rawOptions) 
        ? rawOptions.map((f: any) => f.name.replace('Skill: ', ''))
        : [];

    const selectionsMade = (newChar.proficiencies?.length || 0) - (classData?.proficiencies?.length || 0);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Skill Training</h2>
                <p className="text-[11px] text-parchment-600 font-medium max-w-xl">
                    Choose <span className="text-dragon-red font-bold">{selectionLimit - Math.max(0, selectionsMade)}</span> more skills based on your path.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {(SKILL_LIST as any).map((skill: any) => {
                    const isRecommended = classSkillOptions.includes(skill.name);
                    const active = isProficient(skill.name);
                    
                    return (
                        <button
                            key={skill.name}
                            onClick={() => toggleSkill(skill.name)}
                            className={cn(
                                "p-3 rounded-sm border text-left transition-all relative flex flex-col gap-2 overflow-hidden group",
                                active 
                                    ? "bg-dragon-red text-white border-dragon-red shadow-lg scale-[1.02]" 
                                    : "bg-white/20 border-dragon-red/5 hover:border-dragon-red/20 text-parchment-950 hover:bg-white/60",
                                !active && !isRecommended && "opacity-40 grayscale"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-sm flex items-center justify-center border transition-colors",
                                    active ? "bg-white/10 border-white/20" : "bg-dragon-red/5 border-dragon-red/10 group-hover:bg-dragon-red/10"
                                )}>
                                    <GameIcon 
                                        name={skill.name.toLowerCase().replace(/ /g, '_')} 
                                        size={24} 
                                        color={active ? "white" : "#8B0000"} 
                                        fallbackName={skill.ability.toLowerCase()}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{skill.name}</span>
                                    <div className="flex items-center gap-1">
                                        <GameIcon name={skill.ability.toLowerCase()} size={8} color={active ? "rgba(255,255,255,0.6)" : "rgba(139,0,0,0.4)"} />
                                        <span className={cn("text-[7px] font-bold uppercase tracking-widest", active ? "text-white/60" : "text-parchment-400")}>{skill.ability}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className={cn("text-[7px] leading-tight line-clamp-2", active ? "text-white/80" : "text-parchment-500")}>
                                {skill.description}
                            </p>

                            {active && (
                                <div className="absolute top-1 right-1">
                                    <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                                        <GameIcon name="check" size={8} color="#FFFFFF" />
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
