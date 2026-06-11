import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useStore';
import { cn } from '../../../lib/utils';
import { soundService } from '../../../services/soundService';
import { fetchClassLevels, fetchFeatureData } from '../../../services/storageService';
import { GameIcon } from '../../../game_icons';

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
    'underdark': 'death'
};

export const ChoicesStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadLevelData = async () => {
            if (!newChar.class) return;
            setLoading(true);
            try {
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

    const handleChoice = (featureId: string, selection: string) => {
        const currentChoices = { ... (newChar.choices || {}) };
        currentChoices[featureId] = [selection];
        setNewChar({ ...newChar, choices: currentChoices });
        soundService.playEffect('UI_CLICK_LIGHT');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <GameIcon name="refresh" size={40} color="#B8860B" className="animate-spin" />
            <span className="text-[12px] font-black text-dragon-gold uppercase tracking-[0.3em]">Revealing Path...</span>
        </div>
    );

    const choiceFeatures = features.filter(f => 
        f.index?.includes('choice') || 
        f.index?.includes('favored-enemy') || 
        f.index?.includes('natural-explorer') ||
        f.index?.includes('fighting-style')
    );

    if (choiceFeatures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-dragon-gold/5 border border-dragon-gold/10 rounded-sm">
                <GameIcon name="book" size={40} color="#B8860B" className="opacity-40 mb-4" />
                <h3 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-widest">No Threshold Selections</h3>
                <p className="text-[11px] text-parchment-600 font-bold max-w-xs mt-2 uppercase tracking-tighter">
                    Your path for the first level is set in stone. Continue to arm yourself for the journey ahead.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col border-b border-dragon-gold/20 pb-4">
                <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-widest mb-1">Threshold Choices</h3>
                <p className="text-[10px] text-parchment-500 font-black uppercase tracking-[0.2em]">Refine your specialty training at Level 1</p>
            </div>

            {choiceFeatures.map((f, idx) => {
                let options = f.choice?.from?.options || [];
                let title = f.name || "Specialty Choice";
                
                // Special handling for Ranger features if options are missing in JSON
                if (f.index?.includes('favored-enemy') && options.length === 0) {
                    options = FAVORED_ENEMIES.map(e => ({ name: e.name, index: e.index }));
                }
                if (f.index?.includes('natural-explorer') && options.length === 0) {
                    options = NATURAL_TERRAINS.map(t => ({ name: t.name, index: t.index }));
                }

                return (
                    <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black bg-dragon-darkRed text-dragon-gold px-2 py-0.5 rounded-full">0{idx + 1}</span>
                            <h4 className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest">{title}</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {options.map((opt: any, oIdx: number) => {
                                const val = opt.index || opt.item?.index || opt.name;
                                const label = opt.name || opt.item?.name || val;
                                const isSelected = newChar.choices?.[f.index]?.includes(val);
                                const Icon = CHOICE_ICON_MAP[val.toLowerCase()];
                                
                                return (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleChoice(f.index, val)}
                                        className={cn(
                                            "p-4 border rounded-sm transition-all text-center flex flex-col items-center justify-center gap-2 group relative overflow-hidden",
                                            isSelected 
                                                ? "bg-dragon-darkRed text-white border-dragon-gold shadow-lg" 
                                                : "bg-white/40 border-dragon-gold/10 hover:border-dragon-red/30 hover:bg-white"
                                        )}
                                    >
                                        {Icon && (
                                            <div className="mb-1 pointer-events-none">
                                                <GameIcon name={Icon as any} size={32} color={isSelected ? "#B8860B" : "currentColor"} className={isSelected ? "" : "opacity-60 group-hover:opacity-100"} />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "text-[10px] font-black uppercase tracking-tight",
                                            isSelected ? "text-dragon-gold" : "text-dragon-darkRed group-hover:text-dragon-red"
                                        )}>
                                            {label}
                                        </div>
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
        </div>
    );
};
