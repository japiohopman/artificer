import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { soundService } from '../../../services/soundService';
import { fetchClassLevels, fetchFeatureData } from '../../../services/storageService';
import { atlasService } from '../../../services/atlasService';
import { GameIcon } from '../../../game_icons';
import { extractOptionsFromFeature, getChoiceLimit, getFeatureIcon } from '../../../lib/atlasUtils';

export const FAVORED_ENEMIES = [
    { index: 'aberrations', name: 'Aberrations', desc: 'Gain advantages against bizarre entities born of the Far Realm.' },
    { index: 'beasts', name: 'Beasts', desc: 'Expert tracking and knowledge of natural creatures and wild fauna.' },
    { index: 'celestials', name: 'Celestials', desc: 'Specialized focus on beings of the Upper Planes, angels, and holy guides.' },
    { index: 'constructs', name: 'Constructs', desc: 'Understand the animatronics, golems, and clockwork creations.' },
    { index: 'dragons', name: 'Dragons', desc: 'Mastery of lore regarding the ancient, scaled monarchs of the skies.' },
    { index: 'elementals', name: 'Elementals', desc: 'In-tune with creatures of pure fire, earth, water, or air.' },
    { index: 'fey', name: 'Fey', desc: 'Knowledge of the wild spirits, elves, and tricksters of the Feywild.' },
    { index: 'fiends', name: 'Fiends', desc: 'Specialized tracking of demons, devils, and residents of the Lower Planes.' },
    { index: 'giants', name: 'Giants', desc: 'Combat tactics against ogres, trolls, and the ancient giant families.' },
    { index: 'monstrosities', name: 'Monstrosities', desc: 'Lore about unnatural, cursed, or mutated beasts of the world.' },
    { index: 'oozes', name: 'Oozes', desc: 'Understand the behaviors of acidic, gelatinous dungeon denizens.' },
    { index: 'plants', name: 'Plants', desc: 'Interaction with ambulatory flora, shambling mounds, and spore servants.' },
    { index: 'undead', name: 'Undead', desc: 'Specialized protection and research against walking corpses and spirits.' },
    { index: 'humanoids', name: 'Humanoids', desc: 'Focused study of the civilized races and tribal groups.' }
];

export const NATURAL_TERRAINS = [
    { index: 'arctic', name: 'Arctic', desc: 'Thrive in frozen tundras, glacial passes, and biting sub-zero lands.' },
    { index: 'coast', name: 'Coast', desc: 'Navigate rocky shores, vast beaches, tidal flats, and maritime winds.' },
    { index: 'desert', name: 'Desert', desc: 'Survive in scorching sands, arid dunes, canyons, and dry badlands.' },
    { index: 'forest', name: 'Forest', desc: 'Master canopy trails, dense woodlands, dark groves, and jungle foliage.' },
    { index: 'grassland', name: 'Grassland', desc: 'Traverse open prairies, savannas, rolling plains, and endless fields.' },
    { index: 'mountain', name: 'Mountain', desc: 'Climb steep peaks, high ridges, rocky crags, and alpine passes.' },
    { index: 'swamp', name: 'Swamp', desc: 'Familiarity with murky bogs, peat moss, wetlands, and misty mires.' },
    { index: 'underdark', name: 'Underdark', desc: 'Navigate subterranean caverns, abyssal tunnels, and luminous caves.' }
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
    'underdark': 'death'
};

export const ChoicesStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [features, setFeatures] = useState<any[]>([]);
    const [subclassOptions, setSubclassOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [optionDescriptions, setOptionDescriptions] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadLevelData = async () => {
            if (!newChar.class) return;
            setLoading(true);
            try {
                // Fetch subclasses index
                const subIndexRes = await fetch('/assets/atlas/subclasses/index.json');
                if (subIndexRes.ok) {
                    const subIndex = await subIndexRes.json();
                    const filtered = subIndex.filter((s: any) => s.class?.toLowerCase() === newChar.class?.toLowerCase());
                    setSubclassOptions(filtered);
                }

                const levels = await fetchClassLevels(newChar.class!);
                const level1 = levels.find((l: any) => l.level === 1);
                
                if (level1?.features) {
                    const featureDetails = await Promise.all(
                        level1.features.map(async (f: any) => {
                            const details = await fetchFeatureData(f.index);
                            return details || f;
                        })
                    );
                    setFeatures(featureDetails);
                }
            } catch (e) {
                console.error("Error loading level choices", e);
            } finally {
                setLoading(false);
            }
        };
        loadLevelData();
    }, [newChar.class]);

    // Gather and process data-driven options
    const choiceFeatures = features.filter(f => {
        const options = extractOptionsFromFeature(f);
        return options.length > 0 || 
               f.feature_specific?.subfeature_options?.type === 'subclass' ||
               f.index?.includes('choice') || 
               f.index?.includes('favored-enemy') || 
               f.index?.includes('favored_enemy') || 
               f.index?.includes('natural-explorer') || 
               f.index?.includes('natural_explorer') || 
               f.index?.includes('fighting-style') ||
               f.index?.includes('fighting_style');
    });

    const nonChoiceFeatures = features.filter(f => !choiceFeatures.includes(f));

    useEffect(() => {
        const loadOptionDescriptions = async () => {
            const descriptions: Record<string, string> = {};
            
            // Build fallback descriptions
            FAVORED_ENEMIES.forEach(e => { descriptions[e.index] = e.desc; });
            NATURAL_TERRAINS.forEach(t => { descriptions[t.index] = t.desc; });

            const allOptions = choiceFeatures.flatMap(f => {
                let opts = extractOptionsFromFeature(f);
                if (opts.length === 0) {
                    if (f.feature_specific?.subfeature_options?.type === 'subclass') {
                        opts = subclassOptions.map((sc: any) => ({
                            name: sc.name,
                            index: sc.index,
                            desc: sc.desc || `Access the mystical teachings of the ${sc.name} subclass.`
                        }));
                    } else if (f.index?.includes('favored-enemy') || f.index?.includes('favored_enemy')) {
                        opts = FAVORED_ENEMIES.map(e => ({ name: e.name, index: e.index }));
                    } else if (f.index?.includes('natural-explorer') || f.index?.includes('natural_explorer')) {
                        opts = NATURAL_TERRAINS.map(t => ({ name: t.name, index: t.index }));
                    }
                }
                return opts;
            });

            await Promise.all(allOptions.map(async (opt) => {
                try {
                    const fullFeat = await fetchFeatureData(opt.index);
                    if (fullFeat && fullFeat.desc) {
                        descriptions[opt.index] = Array.isArray(fullFeat.desc) ? fullFeat.desc.join('\n') : fullFeat.desc;
                    } else {
                        const fullSub = await atlasService.loadSubclass(opt.index);
                        if (fullSub && fullSub.desc) {
                            descriptions[opt.index] = Array.isArray(fullSub.desc) ? fullSub.desc.join('\n') : fullSub.desc;
                        }
                    }
                } catch (e) {
                    // Fail silently for static custom fallback options
                }
            }));
            
            setOptionDescriptions(prev => ({ ...prev, ...descriptions }));
        };

        if (choiceFeatures.length > 0) {
            loadOptionDescriptions();
        }
    }, [features, subclassOptions]);

    const handleChoice = (featureId: string, selection: string, limit: number) => {
        const currentChoices = { ... (newChar.choices || {}) };
        let selections = currentChoices[featureId] || [];
        
        if (selections.includes(selection)) {
            selections = selections.filter(s => s !== selection);
            soundService.playEffect('UI_CLICK_LIGHT');
        } else {
            if (selections.length < limit) {
                selections = [...selections, selection];
                soundService.playEffect('TRANSACTION_SUCCESS');
            } else if (limit === 1) {
                selections = [selection];
                soundService.playEffect('TRANSACTION_SUCCESS');
            } else {
                soundService.playEffect('MENU_ERROR');
                return;
            }
        }
        
        currentChoices[featureId] = selections;
        
        // Specially sync fighting style for statCalculations
        const lowerId = featureId.toLowerCase();
        if (lowerId.includes('fighting_style') || lowerId.includes('fighting-style')) {
            currentChoices['fighting-style'] = selections;
        }
        
        setNewChar({ ...newChar, choices: currentChoices });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <GameIcon name="refresh" size={40} color="#B8860B" className="animate-spin" />
            <span className="text-[12px] font-black text-dragon-gold uppercase tracking-[0.3em]">Revealing Path...</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 p-4">
            {choiceFeatures.length > 0 ? (
                <>
                    <div className="flex flex-col border-b border-dragon-gold/20 pb-4">
                        <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-widest mb-1">Threshold Choices</h3>
                        <p className="text-[10px] text-parchment-500 font-black uppercase tracking-[0.2em]">Refine your specialty training at Level 1</p>
                    </div>

                    {choiceFeatures.map((f, idx) => {
                        let options = extractOptionsFromFeature(f);
                        let title = f.name || "Specialty Choice";
                        let limit = getChoiceLimit(f) || 1;
                        
                        // Fallback options mapping for Rangers and legacy features
                        if (options.length === 0) {
                            if (f.feature_specific?.subfeature_options?.type === 'subclass') {
                                options = subclassOptions.map((sc: any) => ({
                                    name: sc.name,
                                    index: sc.index,
                                    desc: sc.desc || `Access the mystical teachings of the ${sc.name} subclass.`
                                }));
                                limit = f.feature_specific?.subfeature_options?.choose || 1;
                            } else if (f.index?.includes('favored-enemy') || f.index?.includes('favored_enemy')) {
                                options = FAVORED_ENEMIES.map(e => ({ name: e.name, index: e.index }));
                            } else if (f.index?.includes('natural-explorer') || f.index?.includes('natural_explorer')) {
                                options = NATURAL_TERRAINS.map(t => ({ name: t.name, index: t.index }));
                            }
                        }

                        const selections = newChar.choices?.[f.index] || [];
                        const remaining = Math.max(0, limit - selections.length);

                        return (
                            <div key={idx} className="space-y-4 bg-white/20 p-5 rounded-sm border border-dragon-gold/10 shadow-sm">
                                <div className="flex items-center justify-between border-b border-dragon-gold/10 pb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black bg-dragon-darkRed text-dragon-gold px-2.5 py-1 rounded-full">0{idx + 1}</span>
                                        <h4 className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest text-wrap">{title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-dragon-gold/10 px-2 py-0.5 rounded border border-dragon-gold/20 text-dragon-darkRed">
                                            Limit: {selections.length} / {limit}
                                        </span>
                                        {remaining > 0 ? (
                                            <span className="text-[8px] font-black bg-dragon-red text-white px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                                                Pick {remaining}
                                            </span>
                                        ) : (
                                            <span className="text-[8px] font-black bg-dragon-green text-white px-2 py-0.5 rounded uppercase tracking-widest">
                                                Complete
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <p className="text-[10px] text-parchment-600 leading-relaxed max-w-2xl italic">
                                    {f.desc ? (Array.isArray(f.desc) ? f.desc.join(' ') : f.desc) : "Select an option from your specialty training class advancement."}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {options.map((opt: any, oIdx: number) => {
                                        const val = opt.index || opt.item?.index || opt.name;
                                        const label = opt.name || opt.item?.name || val;
                                        const isSelected = selections.includes(val);
                                        
                                        // Find appropriate icon
                                        let iconName = CHOICE_ICON_MAP[val.toLowerCase()] || CHOICE_ICON_MAP[label.toLowerCase()];
                                        if (!iconName) {
                                            iconName = getFeatureIcon(val, label);
                                        }

                                        const desc = optionDescriptions[val] || opt.desc || "";
                                        
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleChoice(f.index, val, limit)}
                                                className={cn(
                                                    "p-4 border rounded-sm transition-all text-left flex flex-col gap-2 group relative overflow-hidden h-full min-h-[110px]",
                                                    isSelected 
                                                        ? "bg-dragon-darkRed text-white border-dragon-gold shadow-lg scale-102" 
                                                        : "bg-white/40 border-dragon-gold/10 hover:border-dragon-red/30 hover:bg-white"
                                                )}
                                            >
                                                <div className="flex justify-between items-start w-full relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        {iconName && (
                                                            <div className="pointer-events-none">
                                                                <GameIcon 
                                                                    name={iconName as any} 
                                                                    size={20} 
                                                                    color={isSelected ? "#B8860B" : "#8B0000"} 
                                                                    className={isSelected ? "" : "opacity-60 group-hover:opacity-100"} 
                                                                />
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "text-[10px] font-black uppercase tracking-tight",
                                                            isSelected ? "text-dragon-gold" : "text-dragon-darkRed group-hover:text-dragon-red"
                                                        )}>
                                                            {label.replace(/fighting style:\s*/i, '').replace(/expertise:\s*/i, '')}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-4 h-4 bg-dragon-gold/20 rounded-full flex items-center justify-center">
                                                            <GameIcon name="check" size={8} color="#B8860B" />
                                                        </div>
                                                    )}
                                                </div>

                                                {desc && (
                                                    <p className={cn(
                                                        "text-[8px] leading-relaxed normal-case line-clamp-3 relative z-10",
                                                        isSelected ? "text-parchment-200" : "text-parchment-600"
                                                    )}>
                                                        {desc}
                                                    </p>
                                                )}

                                                {/* Background Accent */}
                                                <div className={cn(
                                                    "absolute -bottom-4 -right-4 opacity-5 transition-transform duration-500 group-hover:scale-110",
                                                    isSelected ? "text-dragon-gold" : "text-dragon-darkRed"
                                                )}>
                                                    <GameIcon name={iconName as any || 'award'} size={60} color="currentColor" />
                                                </div>
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
