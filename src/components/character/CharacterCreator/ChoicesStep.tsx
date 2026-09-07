import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { soundService } from '../../../services/soundService';
import { fetchClassLevels, fetchSubclassesList } from '../../../services/storageService';
import { GameIcon } from '../../../game_icons';
import { extractOptionsFromFeature, getChoiceLimit } from '../../../lib/atlasUtils';
import { atlasService } from '../../../services/atlasService';

export const FAVORED_ENEMIES = [
    { index: 'aberrations', name: 'Aberrations' },
    { index: 'beasts', name: 'Beasts' },
    { index: 'celestials', name: 'Celestials' },
    { index: 'constructs', name: 'Constructs' },
    { index: 'dragons', name: 'Dragons' },
    { index: 'elementals', name: 'Elementals' },
    { index: 'fey', name: 'Fey' },
    { index: 'fiends', name: 'Fiends' },
    { index: 'giants', name: 'Giants' },
    { index: 'monstrosities', name: 'Monstrosities' },
    { index: 'oozes', name: 'Oozes' },
    { index: 'plants', name: 'Plants' },
    { index: 'undead', name: 'Undead' },
    { index: 'humanoids', name: 'Humanoids' }
];

export const NATURAL_TERRAINS = [
    { index: 'arctic', name: 'Arctic' },
    { index: 'coast', name: 'Coast' },
    { index: 'desert', name: 'Desert' },
    { index: 'forest', name: 'Forest' },
    { index: 'grassland', name: 'Grassland' },
    { index: 'mountain', name: 'Mountain' },
    { index: 'swamp', name: 'Swamp' },
    { index: 'underdark', name: 'Underdark' }
];

export const CHOICE_ICON_MAP: Record<string, any> = {
    // Creature Types
    'aberrations': 'aberration',
    'beasts': 'beast',
    'celestials': 'celestial',
    'constructs': 'construct',
    'dragons': 'dragons',
    'elementals': 'elemental',
    'fey': 'fey',
    'fiends': 'fiend',
    'giants': 'giant',
    'monstrosities': 'monstrosity',
    'oozes': 'ooze',
    'plants': 'trees',
    'undead': 'undead',
    'humanoids': 'humanoid',
    // Terrains
    'arctic': 'mountain',
    'coast': 'wind',
    'desert': 'fire',
    'forest': 'trees',
    'grassland': 'compass',
    'mountain': 'mountain',
    'swamp': 'ghost',
    'underdark': 'death',
    // Classes / Fighting Styles / Subclasses
    'life': 'life',
    'life_domain': 'life',
    'devotion': 'fighting_style_defense',
    'oath_of_devotion': 'fighting_style_defense',
    'defense': 'fighting_style_defense',
    'dueling': 'fighting_style_dueling',
    'great_weapon_fighting': 'fighting_style_great_weapon_fighting',
    'protection': 'fighting_style_protection',
    'two_weapon_fighting': 'fighter_fighting_style_two_weapon_fighting',
    'archery': 'fighter_fighting_style_archery'
};

export const ChoicesStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [features, setFeatures] = useState<any[]>([]);
    const [subclasses, setSubclasses] = useState<any[]>([]);
    const [optionDetails, setOptionDetails] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadLevelData = async () => {
            if (!newChar.class) return;
            setLoading(true);
            try {
                const levels = await fetchClassLevels(newChar.class!, newChar.ruleset);
                const level1 = levels.find((l: any) => l.level === 1);
                
                if (level1?.features) {
                    const featureDetails = await Promise.all(
                        level1.features.map(async (f: any) => {
                            const details = await atlasService.loadFeature(f.index);
                            return details || f;
                        })
                    );
                    setFeatures(featureDetails);
                }

                // Fetch subclass list
                const subclassData = await fetchSubclassesList(newChar.ruleset, newChar.class);
                setSubclasses(subclassData);
            } catch (e) {
                console.error("Error loading level choices", e);
            } finally {
                setLoading(false);
            }
        };
        loadLevelData();
    }, [newChar.class]);

    useEffect(() => {
        const loadOptionDescriptions = async () => {
            const details: Record<string, string> = {};
            for (const f of features) {
                const isSubclassChoice = f.feature_specific?.subfeature_options?.type === 'subclass';
                let options = extractOptionsFromFeature(f);
                if (isSubclassChoice) {
                    options = subclasses
                        .filter((s: any) => !s.classIndex || s.classIndex.toLowerCase() === newChar.class?.toLowerCase())
                        .map((s: any) => ({
                            index: s.index,
                            name: s.name
                        }));
                } else {
                    // Special handling for Ranger features if options are missing in JSON
                    if (f.index?.includes('favored-enemy') && options.length === 0) {
                        options = FAVORED_ENEMIES.map(e => ({ name: e.name, index: e.index }));
                    }
                    if (f.index?.includes('natural-explorer') && options.length === 0) {
                        options = NATURAL_TERRAINS.map(t => ({ name: t.name, index: t.index }));
                    }
                }

                for (const opt of options) {
                    if (isSubclassChoice) {
                        const subData = await atlasService.loadSubclass(opt.index, newChar.ruleset);
                        if (subData) {
                            const desc = Array.isArray(subData.desc) ? subData.desc.join('\n') : (subData.desc || "");
                            details[opt.index] = desc;
                        }
                    } else {
                        const featData = await atlasService.loadFeature(opt.index);
                        if (featData) {
                            const desc = Array.isArray(featData.desc) ? featData.desc.join('\n') : (featData.desc || "");
                            details[opt.index] = desc;
                        }
                    }
                }
            }
            setOptionDetails(prev => ({ ...prev, ...details }));
        };
        if (features.length > 0) {
            loadOptionDescriptions();
        }
    }, [features, subclasses, newChar.class]);

    const handleChoice = (featureId: string, selection: string, limit: number, isSubclassChoice?: boolean) => {
        const currentChoices = { ... (newChar.choices || {}) };
        const currentSelections = currentChoices[featureId] || [];

        let newSelections: string[];
        if (currentSelections.includes(selection)) {
            newSelections = currentSelections.filter((s: string) => s !== selection);
        } else {
            if (currentSelections.length >= limit) {
                if (limit === 1) {
                    newSelections = [selection];
                } else {
                    return; // Max selections reached
                }
            } else {
                newSelections = [...currentSelections, selection];
            }
        }

        currentChoices[featureId] = newSelections;

        const updatedChar: Partial<Character> = {
            ...newChar,
            choices: currentChoices
        };

        if (isSubclassChoice) {
            updatedChar.subclass = newSelections[0] || undefined;
        }

        setNewChar(updatedChar);
        soundService.playEffect('UI_CLICK_LIGHT');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <GameIcon name="refresh" size={40} color="#B8860B" className="animate-spin" />
            <span className="text-[12px] font-black text-dragon-gold uppercase tracking-[0.3em]">Revealing Path...</span>
        </div>
    );

    const choiceFeatures = features.filter(f => {
        const opts = extractOptionsFromFeature(f);
        if (opts && opts.length > 0) return true;
        if (f.feature_specific?.subfeature_options?.type === 'subclass') return true;

        return f.index?.includes('choice') ||
               f.index?.includes('favored-enemy') ||
               f.index?.includes('natural-explorer') ||
               f.index?.includes('fighting-style');
    });

    const nonChoiceFeatures = features.filter(f => !choiceFeatures.includes(f));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {choiceFeatures.length > 0 ? (
                <>
                    <div className="flex flex-col border-b border-dragon-gold/20 pb-4">
                        <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-widest mb-1">Threshold Choices</h3>
                        <p className="text-[10px] text-parchment-500 font-black uppercase tracking-[0.2em]">Refine your specialty training at Level 1</p>
                    </div>

                    {choiceFeatures.map((f, idx) => {
                        const isSubclassChoice = f.feature_specific?.subfeature_options?.type === 'subclass';
                        let options = extractOptionsFromFeature(f);
                        let title = f.name || "Specialty Choice";
                        const limit = getChoiceLimit(f) || 1;
                        
                        if (isSubclassChoice) {
                            options = subclasses
                                .filter((s: any) => !s.classIndex || s.classIndex.toLowerCase() === newChar.class?.toLowerCase())
                                .map((s: any) => ({
                                    index: s.index,
                                    name: s.name
                                }));
                        } else {
                            // Special handling for Ranger features if options are missing in JSON
                            if (f.index?.includes('favored-enemy') && options.length === 0) {
                                options = FAVORED_ENEMIES.map(e => ({ name: e.name, index: e.index }));
                            }
                            if (f.index?.includes('natural-explorer') && options.length === 0) {
                                options = NATURAL_TERRAINS.map(t => ({ name: t.name, index: t.index }));
                            }
                        }

                        return (
                            <div key={idx} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black bg-dragon-darkRed text-dragon-gold px-2 py-0.5 rounded-full">0{idx + 1}</span>
                                        <h4 className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest">{title}</h4>
                                    </div>
                                    <div className="text-[10px] font-black text-dragon-gold uppercase tracking-wider">
                                        Choose {limit} option{limit > 1 ? 's' : ''}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {options.map((opt: any, oIdx: number) => {
                                        const val = opt.index || opt.item?.index || opt.name;
                                        const label = opt.name || opt.item?.name || val;
                                        const isSelected = newChar.choices?.[f.index]?.includes(val);

                                        // Try to map to the icon using the lowercase version of the value or label
                                        const iconKey = val.toLowerCase().replace(/[\s-]/g, '_');
                                        const labelKey = label.toLowerCase().replace(/[\s-]/g, '_');
                                        const Icon = CHOICE_ICON_MAP[iconKey] || CHOICE_ICON_MAP[labelKey] || 'award';
                                        const description = optionDetails[val];
                                        
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleChoice(f.index, val, limit, isSubclassChoice)}
                                                className={cn(
                                                    "p-5 border rounded-sm transition-all text-center flex flex-col items-center justify-start gap-2 group relative overflow-hidden h-full min-h-[140px]",
                                                    isSelected 
                                                        ? "bg-dragon-darkRed text-white border-dragon-gold shadow-lg"
                                                        : "bg-white/40 border-dragon-gold/10 hover:border-dragon-red/30 hover:bg-white"
                                                )}
                                            >
                                                {Icon && (
                                                    <div className="mb-1 pointer-events-none">
                                                        <GameIcon name={Icon as any} size={28} color={isSelected ? "#B8860B" : "currentColor"} className={isSelected ? "" : "opacity-60 group-hover:opacity-100"} />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "text-[10px] font-black uppercase tracking-tight",
                                                    isSelected ? "text-dragon-gold" : "text-dragon-darkRed group-hover:text-dragon-red"
                                                )}>
                                                    {label}
                                                </div>

                                                {description && (
                                                    <div className={cn(
                                                        "text-[9px] leading-relaxed font-medium transition-colors normal-case text-center opacity-85 mt-1 line-clamp-3",
                                                        isSelected ? "text-dragon-gold" : "text-parchment-600"
                                                    )} title={description}>
                                                        {description}
                                                    </div>
                                                )}

                                                {isSelected && (
                                                    <div className="absolute top-1 right-1">
                                                        <GameIcon name="check" size={10} color="#B8860B" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col border-b border-dragon-gold/20 pb-4">
                        <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-widest mb-1">Level 1 Class Features</h3>
                        <p className="text-[10px] text-parchment-500 font-black uppercase tracking-[0.2em]">Your innate abilities at the beginning of your journey</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nonChoiceFeatures.map((f, idx) => {
                            const desc = Array.isArray(f.desc) ? f.desc.join('\n\n') : f.desc || "Class Feature";
                            return (
                                <div key={idx} className="p-5 bg-white/40 border border-dragon-gold/15 rounded-sm hover:border-dragon-red/20 transition-all flex flex-col gap-3 relative overflow-hidden group shadow-sm">
                                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <GameIcon name="book" size={48} color="#8B0000" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-dragon-red/5 text-dragon-red border border-dragon-red/10 rounded-sm shrink-0">
                                            <GameIcon name="magic_effect" size={16} color="currentColor" />
                                        </div>
                                        <h4 className="text-[12px] font-black text-dragon-darkRed uppercase tracking-widest">{f.name}</h4>
                                    </div>
                                    <p className="text-[10px] text-parchment-700 leading-relaxed font-medium">
                                        {desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
