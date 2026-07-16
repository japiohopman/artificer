import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { SKILL_LIST } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { soundService } from '../../../services/soundService';
import { fetchClassData, fetchBackgroundJson } from '../../../services/storageService';
import { GameIcon } from '../../../game_icons';

export const SkillsStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [classData, setClassData] = useState<any>(null);
    const [bgData, setBgData] = useState<any>(null);
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
        if (newChar.background) {
            fetchBackgroundJson(newChar.background).then(data => {
                setBgData(data);
            });
        }
    }, [newChar.class, newChar.background]);

    // Standardize skill names to compare them reliably
    const standardizeSkillName = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/^skill:\s*/, '')
            .replace(/^skill_/, '')
            .replace(/_/g, ' ')
            .trim();
    };

    // Skills inherited from background / species / subrace
    const getInheritedSkills = (): string[] => {
        const inherited = new Set<string>();

        // From Background
        if (bgData?.starting_proficiencies) {
            bgData.starting_proficiencies.forEach((p: any) => {
                const name = typeof p === 'string' ? p : p.name || p.index || '';
                if (name.toLowerCase().includes('skill:')) {
                    inherited.add(standardizeSkillName(name));
                }
            });
        }

        // From Species/Subrace (stored as proficiencies or in traits)
        if (newChar.proficiencies) {
            newChar.proficiencies.forEach((p: any) => {
                const name = typeof p === 'string' ? p : p.name || p.index || '';
                // Since final proficiencies might have class skills, we only consider inherited ones
                // by checking if they are not in the current class choices or choices.skills.
            });
        }

        // Racial proficiencies often include "Skill: Perception" etc.
        if (newChar.traits) {
            newChar.traits.forEach((t: any) => {
                if (t.proficiencies) {
                    t.proficiencies.forEach((p: any) => {
                        const name = typeof p === 'string' ? p : p.name || p.index || '';
                        if (name.toLowerCase().includes('skill:')) {
                            inherited.add(standardizeSkillName(name));
                        }
                    });
                }
            });
        }

        return Array.from(inherited);
    };

    const inheritedSkills = getInheritedSkills();

    // Get current selections from choices.skills (initialize if empty)
    const currentSelections: string[] = (newChar.choices?.skills || []).map(standardizeSkillName);

    const isProficient = (skillName: string) => {
        const std = standardizeSkillName(skillName);
        return inheritedSkills.includes(std) || currentSelections.includes(std);
    };

    const toggleSkill = (skillName: string) => {
        const std = standardizeSkillName(skillName);
        if (inheritedSkills.includes(std)) {
            // Cannot toggle inherited skills!
            soundService.playEffect('MENU_ERROR');
            return;
        }

        let updatedSelections = [...currentSelections];
        if (currentSelections.includes(std)) {
            updatedSelections = updatedSelections.filter(s => s !== std);
            soundService.playEffect('UI_CLICK_LIGHT');
        } else {
            if (currentSelections.length < selectionLimit) {
                updatedSelections.push(std);
                soundService.playEffect('TRANSACTION_SUCCESS');
            } else {
                soundService.playEffect('MENU_ERROR');
                return;
            }
        }

        // Map back standardized names to the capitalized versions from SKILL_LIST
        const originalNames = updatedSelections.map(stdName => {
            const match = SKILL_LIST.find(s => standardizeSkillName(s.name) === stdName);
            return match ? match.name : stdName;
        });

        const choices = { ...newChar.choices, skills: originalNames };
        setNewChar({ ...newChar, choices });
    };

    const rawOptions = classData?.proficiency_choices?.[0]?.from?.options || [];
    const classSkillOptions = rawOptions.map((o: any) => {
        const name = o.item?.name || o.name || '';
        return standardizeSkillName(name);
    });

    const selectionsMade = currentSelections.length;
    const remainingPicks = Math.max(0, selectionLimit - selectionsMade);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 p-4">
            <div className="flex justify-between items-end border-b border-dragon-gold/20 pb-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Skill Training</h2>
                    <p className="text-[11px] text-parchment-600 font-bold max-w-2xl uppercase tracking-widest leading-relaxed">
                        Select your professional proficiencies to represent your expertise and training. Green items indicate your heritage, while others represent class recommendations.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-dragon-gold/10 px-4 py-2 rounded-sm border border-dragon-gold/20 shadow-sm shrink-0">
                    <GameIcon name="expertise" size={20} color="#B8860B" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-dragon-gold uppercase leading-none">Proficiency Picks</span>
                        <span className={cn(
                            "text-[18px] font-black leading-none mt-1.5",
                            remainingPicks > 0 ? "text-dragon-red animate-pulse" : "text-dragon-green"
                        )}>
                            {selectionsMade} / {selectionLimit}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(SKILL_LIST as any).map((skill: any) => {
                    const stdName = standardizeSkillName(skill.name);
                    const isRecommended = classSkillOptions.includes(stdName);
                    const isInherited = inheritedSkills.includes(stdName);
                    const active = isProficient(skill.name);
                    
                    return (
                        <button
                            key={skill.name}
                            onClick={() => toggleSkill(skill.name)}
                            className={cn(
                                "p-3 rounded-sm border text-left transition-all relative flex flex-col gap-2 overflow-hidden group min-h-[96px]",
                                isInherited
                                    ? "bg-dragon-darkRed/10 border-dragon-gold/30 text-dragon-darkRed/80 cursor-default"
                                    : active 
                                        ? "bg-dragon-red text-white border-dragon-red shadow-lg scale-[1.02]" 
                                        : "bg-white/20 border-dragon-red/5 hover:border-dragon-red/20 text-parchment-950 hover:bg-white/60",
                                !active && !isRecommended && !isInherited && "opacity-40 grayscale"
                            )}
                        >
                            <div className="flex items-start gap-3 relative z-10">
                                <div className={cn(
                                    "w-10 h-10 rounded-sm flex items-center justify-center border transition-colors shrink-0",
                                    isInherited 
                                        ? "bg-dragon-gold/10 border-dragon-gold/30"
                                        : active 
                                            ? "bg-white/10 border-white/20" 
                                            : "bg-dragon-red/5 border-dragon-red/10 group-hover:bg-dragon-red/10"
                                )}>
                                    <GameIcon 
                                        name={skill.name.toLowerCase().replace(/ /g, '_')} 
                                        size={24} 
                                        color={isInherited ? "#B8860B" : active ? "white" : "#8B0000"} 
                                        fallbackName={skill.ability.toLowerCase()}
                                    />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-black uppercase tracking-tight leading-none mb-1 truncate">{skill.name}</span>
                                    <div className="flex items-center gap-1">
                                        <GameIcon name={skill.ability.toLowerCase()} size={8} color={isInherited ? "#B8860B" : active ? "rgba(255,255,255,0.6)" : "rgba(139,0,0,0.4)"} />
                                        <span className={cn("text-[7px] font-bold uppercase tracking-widest", active && !isInherited ? "text-white/60" : "text-parchment-400")}>{skill.ability}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className={cn("text-[8px] leading-tight line-clamp-2 relative z-10", isInherited ? "text-parchment-600" : active ? "text-white/80" : "text-parchment-500")}>
                                {skill.description}
                            </p>

                            {isInherited && (
                                <div className="absolute top-1 right-1 z-20 flex items-center gap-1">
                                    <span className="text-[6px] font-black bg-dragon-gold/20 text-dragon-gold px-1 py-0.5 rounded uppercase">Heritage</span>
                                    <GameIcon name="lock" size={8} color="#B8860B" />
                                </div>
                            )}

                            {active && !isInherited && (
                                <div className="absolute top-1 right-1 z-20">
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
