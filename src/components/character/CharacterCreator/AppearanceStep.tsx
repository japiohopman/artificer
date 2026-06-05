import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Character } from '../../../store/useStore';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { fetchSpeciesData } from '../../../services/storageService';

interface Palette {
    skin: string[];
    hair: string[];
    eyes: string[];
    features: { name: string; icon: string }[];
}

const SPECIES_PALETTES: Record<string, Palette> = {
    'dragonborn': {
        skin: ['#B8860B', '#B22222', '#228B22', '#4169E1', '#2F4F4F', '#000000', '#FFFFFF', '#CD853F', '#FFD700'],
        hair: ['None (Crested)', 'None (Webbed)', 'None (Smooth)'],
        eyes: ['Luminous Gold', 'Draconic Red', 'Viper Green', 'Electric Blue', 'Molten Amber'],
        features: [
            { name: 'Draconic Horns', icon: 'avatar' },
            { name: 'Crested Spikes', icon: 'avatar' },
            { name: 'Reinforced Scales', icon: 'avatar' },
            { name: 'Frilled Neck', icon: 'avatar' }
        ]
    },
    'dwarf': {
        skin: ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#332720'],
        hair: ['Iron Gray', 'Stone Brown', 'Fiery Copper', 'Coal Black', 'Snow White', 'Deep Auburn'],
        eyes: ['Steel Gray', 'Earth Brown', 'Sapphire Blue', 'Emerald Green', 'Golden Amber'],
        features: [
            { name: 'Braided Beard', icon: 'avatar' },
            { name: 'Runed Tattoos', icon: 'avatar' },
            { name: 'Gnarled Scars', icon: 'avatar' },
            { name: 'Gemstone Piercings', icon: 'avatar' }
        ]
    },
    'elf': {
        skin: ['#FFF5E1', '#FFE4E1', '#F5F5DC', '#E6E6FA', '#D3D3D3', '#8FBC8F', '#C0C0C0'],
        hair: ['Moonlit Silver', 'Sunlit Gold', 'Autumn Oak', 'Midnight Raven', 'Forest Green', 'Ethereal Blue'],
        eyes: ['Iridescent Violet', 'Luminous Emerald', 'Starry Sapphire', 'Pale Silver', 'Golden Hazel'],
        features: [
            { name: 'Elongated Ears', icon: 'avatar' },
            { name: 'Nature Tattoos', icon: 'avatar' },
            { name: 'Graceful Markings', icon: 'avatar' },
            { name: 'Gem-Inlaid Brow', icon: 'avatar' }
        ]
    },
    'gnome': {
        skin: ['#f1c27d', '#e0ac69', '#8d5524', '#ffdbac', '#d2b48c', '#bc8f8f'],
        hair: ['Shocking Pink', 'Electric Blue', 'Neon Green', 'Sunset Orange', 'Pure White', 'Vivid Purple'],
        eyes: ['Sparkling Amber', 'Bright Turquoise', 'Amethyst Purple', 'Ruby Red', 'Pitch Black'],
        features: [
            { name: 'Goggles', icon: 'avatar' },
            { name: 'Mechanical Tattoos', icon: 'avatar' },
            { name: 'Tool Belt', icon: 'avatar' },
            { name: 'Messy Eyebrows', icon: 'avatar' }
        ]
    },
    'halfling': {
        skin: ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c19a6b', '#8b4513'],
        hair: ['Sandy Blonde', 'Walnut Brown', 'Russet Red', 'Straw Yellow', 'Dark Charcoal'],
        eyes: ['Warm Brown', 'Meadow Green', 'Sky Blue', 'Hazelnut', 'Dark Berries'],
        features: [
            { name: 'Curly Locks', icon: 'avatar' },
            { name: 'Freckles', icon: 'avatar' },
            { name: 'Hairy Feet', icon: 'avatar' },
            { name: 'Cheerful Smile', icon: 'avatar' }
        ]
    },
    'human': {
        skin: ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#332720', '#634735', '#4a3728'],
        hair: ['Jet Black', 'Chocolate Brown', 'Honey Blonde', 'Ash Gray', 'Vibrant Red', 'Snow White'],
        eyes: ['Deep Brown', 'Ocean Blue', 'Leaf Green', 'Steel Gray', 'Light Hazel'],
        features: [
            { name: 'Beard', icon: 'avatar' },
            { name: 'Scar', icon: 'avatar' },
            { name: 'Tattoo', icon: 'avatar' },
            { name: 'War Paint', icon: 'avatar' }
        ]
    },
    'tiefling': {
        skin: ['#8B0000', '#CD5C5C', '#663399', '#4B0082', '#2F4F4F', '#483D8B', '#000000', '#B22222', '#9400D3'],
        hair: ['Obsidian Black', 'Blood Red', 'Vibrant Purple', 'Deep Navy', 'Bone White', 'Sulfur Yellow'],
        eyes: ['Solid Gold', 'Solid Silver', 'Solid Red', 'Glowing Green', 'Milky White (No Pupils)'],
        features: [
            { name: 'Curled Horns', icon: 'avatar' },
            { name: 'Pointed Horns', icon: 'avatar' },
            { name: 'Forked Tail', icon: 'avatar' },
            { name: 'Clawed Hands', icon: 'avatar' }
        ]
    },
    'half-elf': {
        skin: ['#ffdbac', '#f1c27d', '#e0ac69', '#FFE4E1', '#E6E6FA', '#8d5524'],
        hair: ['Chestnut Brown', 'Sunlight Gold', 'Raven Black', 'Autumn Auburn', 'Pale Platinum'],
        eyes: ['Hazel', 'Emerald', 'Sapphire', 'Clear Amber', 'Deep Violet'],
        features: [
            { name: 'Slightly Pointed Ears', icon: 'avatar' },
            { name: 'Elegant Markings', icon: 'avatar' },
            { name: 'Stubbled Chin', icon: 'avatar' },
            { name: 'Refined Jaw', icon: 'avatar' }
        ]
    },
    'half-orc': {
        skin: ['#556B2F', '#8FBC8F', '#2E8B57', '#6B8E23', '#A9A9A9', '#708090', '#3CB371'],
        hair: ['Coarse Black', 'Rough Gray', 'Deep Green', 'Dark Brown', 'Faded Maroon'],
        eyes: ['Savage Red', 'Yellow Slit', 'Dull Gray', 'Burning Orange', 'Deep Black'],
        features: [
            { name: 'Protruding Tusks', icon: 'avatar' },
            { name: 'Battle Scars', icon: 'avatar' },
            { name: 'Tribal Markings', icon: 'avatar' },
            { name: 'Bulky Musculature', icon: 'avatar' }
        ]
    }
};

const DEFAULT_PALETTE: Palette = {
    skin: ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642', '#332720'],
    hair: ['Raven Black', 'Chestnut Brown', 'Golden Blonde', 'Ash Gray', 'Fiery Red', 'Snow White'],
    eyes: ['Deep Brown', 'Ocean Blue', 'Leaf Green', 'Steel Gray', 'Hazelnut'],
    features: [
        { name: 'Distinguishing Scar', icon: 'avatar' },
        { name: 'Mystic Tattoo', icon: 'avatar' },
        { name: 'Unique Piercing', icon: 'avatar' },
        { name: 'Noble Bearing', icon: 'avatar' }
    ]
};

export const AppearanceStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [speciesStats, setSpeciesStats] = useState<any>(null);
    const raceKey = (newChar.race || 'human').toLowerCase();

    useEffect(() => {
        if (newChar.race) {
            fetchSpeciesData(newChar.race).then(setSpeciesStats);
        }
    }, [newChar.race]);

    const palette = (() => {
        const base = SPECIES_PALETTES[raceKey] || DEFAULT_PALETTE;
        if (!speciesStats) return base;

        const speciesFeaturesRaw = speciesStats?.special_features || speciesStats?.features || [];
        const speciesFeatures = Array.isArray(speciesFeaturesRaw) ? speciesFeaturesRaw : [];

        // Try to merge with remote data if available
        return {
            skin: speciesStats.skin_colors || speciesStats.dermal_hues || speciesStats.skin_palettes || base.skin,
            hair: speciesStats.hair_colors || speciesStats.hair_styles || base.hair,
            eyes: speciesStats.eye_colors || base.eyes,
            features: speciesFeatures.map((f: any) => ({
                name: typeof f === 'string' ? f : f.name,
                icon: typeof f === 'string' ? 'avatar' : (f.icon || 'avatar')
            })).concat(base.features.filter((bf: any) => !speciesFeatures.some((sf: any) => (typeof sf === 'string' ? sf : sf.name) === bf.name)))
        };
    })();

    const updateAppearance = (key: keyof Character['appearance'], val: any) => {
        setNewChar({
            ...newChar,
            appearance: {
                ...newChar.appearance!,
                [key]: val
            }
        });
    };

    const toggleFeature = (feature: string) => {
        const currentFeatures = (newChar.appearance as any)?.specialFeatures || [];
        const newFeatures = currentFeatures.includes(feature)
            ? currentFeatures.filter((f: string) => f !== feature)
            : [...currentFeatures, feature];
        
        updateAppearance('specialFeatures' as any, newFeatures);
    };

    const sizes = ['Tiny', 'Small', 'Medium', 'Large'];
    const currentSize = newChar.appearance?.size || speciesStats?.size || 'Medium';

    return (
        <div className="space-y-8 h-full flex flex-col p-6">
            <div className="space-y-1">
                <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Appearance</h2>
                <p className="text-[11px] text-parchment-600 font-bold uppercase tracking-widest">Construct the visual identity of your manifestation.</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start overflow-hidden mini-scrollbar">
                <div className="space-y-8 overflow-y-auto pr-4 h-full">
                    {/* Size Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-400 flex items-center gap-2">
                           <GameIcon name="info" size={12} /> Biometric Scale
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {sizes.map(s => (
                                <button 
                                    key={s}
                                    onClick={() => updateAppearance('size' as any, s)}
                                    className={cn(
                                        "px-2 py-3 text-[10px] font-black uppercase text-center border rounded-sm transition-all", 
                                        currentSize === s 
                                            ? "bg-dragon-red text-white border-dragon-red shadow-md scale-105" 
                                            : "bg-white/40 border-dragon-gold/10 hover:border-dragon-red/20"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Hair and Eyes */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-400">Hair Tone</label>
                                <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                    {palette.hair.map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => updateAppearance('hairColor', c)}
                                            className={cn(
                                                "px-4 py-2 text-[9px] font-black uppercase text-left border rounded-sm transition-all relative overflow-hidden group",
                                                newChar.appearance?.hairColor === c 
                                                    ? "bg-dragon-red text-white border-dragon-red" 
                                                    : "bg-white/20 border-dragon-gold/5 hover:bg-white/60"
                                            )}
                                        >
                                            <span className="relative z-10">{c}</span>
                                            {newChar.appearance?.hairColor === c && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <GameIcon name="check" size={10} color="white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-400">Eye Pigment</label>
                                <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                    {palette.eyes.map(e => (
                                        <button 
                                            key={e}
                                            onClick={() => updateAppearance('eyeColor', e)}
                                            className={cn(
                                                "px-4 py-2 text-[9px] font-black uppercase text-left border rounded-sm transition-all relative overflow-hidden group",
                                                newChar.appearance?.eyeColor === e 
                                                    ? "bg-dragon-red text-white border-dragon-red" 
                                                    : "bg-white/20 border-dragon-gold/5 hover:bg-white/60"
                                            )}
                                        >
                                            <span className="relative z-10">{e}</span>
                                            {newChar.appearance?.eyeColor === e && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <GameIcon name="check" size={10} color="white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Special Features */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-400">Special Features</label>
                            <div className="grid grid-cols-1 gap-1.5 overflow-hidden">
                                {palette.features.map(f => {
                                    const isActive = (newChar.appearance as any)?.specialFeatures?.includes(f.name);
                                    return (
                                        <button 
                                            key={f.name}
                                            onClick={() => toggleFeature(f.name)}
                                            className={cn(
                                                "p-3 text-[9px] font-black uppercase text-left border rounded-sm transition-all flex items-center gap-3 relative group",
                                                isActive 
                                                    ? "bg-dragon-darkRed text-white border-dragon-gold shadow-inner" 
                                                    : "bg-white/20 border-dragon-gold/10 hover:border-dragon-red/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-sm flex items-center justify-center border",
                                                isActive ? "bg-white/10 border-white/20" : "bg-dragon-red/5 border-dragon-red/10"
                                            )}>
                                                <GameIcon name={f.icon as any} size={18} color={isActive ? "white" : "#8B0000"} />
                                            </div>
                                            <span className="flex-1 leading-tight">{f.name}</span>
                                            {isActive && (
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
                    </div>

                    {/* Dermal Hue */}
                    <div className="space-y-4 pt-4 border-t border-dragon-gold/10">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-parchment-400">Dermal Hue (Skin Color)</label>
                        <div className="grid grid-cols-6 sm:grid-cols-9 gap-3 p-5 bg-white/30 border border-dragon-gold/10 rounded-sm">
                            {palette.skin.map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => updateAppearance('skinColor', s)} 
                                    className={cn(
                                        "w-10 h-10 rounded-sm border-2 transition-all relative group shadow-sm", 
                                        newChar.appearance?.skinColor === s 
                                            ? "border-dragon-red ring-4 ring-dragon-red/20 scale-110 z-10" 
                                            : "border-white/60 hover:border-dragon-gold hover:scale-105"
                                    )} 
                                    style={{ backgroundColor: s }} 
                                >
                                    {newChar.appearance?.skinColor === s && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <GameIcon name="check" size={14} color="white" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[6px] px-1 rounded-sm z-20 pointer-events-none">
                                        {s}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="sticky top-0 bg-white/60 border border-dragon-gold/30 rounded-sm p-10 flex flex-col items-center justify-center min-h-[500px] overflow-hidden relative shadow-2xl group/preview">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.05)_0%,transparent_70%)]" />
                    <div className="absolute top-4 left-4 p-2 border border-dragon-gold/20 opacity-40">
                         <GameIcon name="focus" size={16} color="#8B0000" />
                    </div>
                    
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-dragon-red/5 blur-3xl rounded-full scale-150 animate-pulse" />
                        <GameIcon name="user" size={180} color="#8B0000" className="opacity-10 relative z-10" />
                        
                        {/* Visualization Overlays */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                             <div className="w-16 h-1 border-2 border-dragon-red/20 rounded-full mb-4 animate-bounce" />
                             <span className="text-[10px] font-black text-dragon-red/40 uppercase tracking-[0.4em] select-none">V_A_I_S</span>
                        </div>
                    </motion.div>

                    <div className="mt-12 grid grid-cols-2 gap-6 w-full relative z-10">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-parchment-400 px-1">Height (Metrics)</label>
                            <input 
                                type="text" 
                                value={newChar.appearance?.height} 
                                onChange={(e) => updateAppearance('height', e.target.value)} 
                                className="w-full p-3 bg-white/80 border border-dragon-gold/20 rounded-sm text-xs font-black uppercase outline-none focus:ring-1 focus:ring-dragon-red/30 transition-all shadow-inner" 
                                placeholder="5 feet 10 inches" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-parchment-400 px-1">Weight (Mass)</label>
                            <input 
                                type="text" 
                                value={newChar.appearance?.weight} 
                                onChange={(e) => updateAppearance('weight', e.target.value)} 
                                className="w-full p-3 bg-white/80 border border-dragon-gold/20 rounded-sm text-xs font-black uppercase outline-none focus:ring-1 focus:ring-dragon-red/30 transition-all shadow-inner" 
                                placeholder="160 Lbs" 
                            />
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                        <span className="text-[9px] font-black uppercase text-dragon-darkRed">{raceKey} Manifestation</span>
                        <GameIcon name="dna" size={12} color="#8B0000" />
                    </div>
                </div>
            </div>
        </div>
    );
};
