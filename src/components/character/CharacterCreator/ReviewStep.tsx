import React, { useState } from 'react';
import { Character, useStore } from '../../../store/useStore';
import { cn } from '../../../lib/utils';
import { GameIcon, GameIconName } from '../../../game_icons';
import { ChromaKeyImage } from '../../ui/ChromaKeyImage';
import { generateNPCImages } from '../../../services/ai/npcService';
import { NPCChoiceResolver, ResolvedItem } from '../../../lib/npcChoiceResolver';
import { soundService } from '../../../services/soundService';
import { atlasService } from '../../../services/atlasService';


export const ReviewStep: React.FC<{ 
  newChar: Partial<Character>, 
  setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>
}> = ({ newChar, setNewChar }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnpacking, setIsUnpacking] = useState(false);
    const [hasUnpacked, setHasUnpacked] = useState(false);

    React.useEffect(() => {
        // Automatic unpacking on mount
        if (!hasUnpacked && !isUnpacking) {
            handleUnpackPacks();
            setHasUnpacked(true);
        }
    }, []);

    const handleGenerateImages = async () => {
        setIsGenerating(true);
        soundService.playEffect('UI_MODAL_OPEN');
        try {
            const images = await generateNPCImages(newChar as any);
            setNewChar({
                ...newChar,
                imageUrl: images.profileUrl,
                avatarUrl: images.avatarUrl,
                matrixUrl: images.matrixUrl
            });
            soundService.playEffect('TRANSACTION_SUCCESS');
        } catch (error) {
            console.error("Failed to generate images:", error);
            soundService.playEffect('MENU_ERROR');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUnpackPacks = async () => {
        setIsUnpacking(true);
        soundService.playEffect('UI_CLICK_LIGHT');
        try {
            // Collect all items from backpack and inventory
            const allItems = [
                ...(newChar.backpack || []),
                ...Object.values(newChar.inventory || {}).filter(Boolean)
            ];

            const expanded = await NPCChoiceResolver.expandPacks(allItems);
            const standardized = await NPCChoiceResolver.standardizeItems(expanded);
            const { inventory, backpack } = await NPCChoiceResolver.buildResolvedInventory(newChar, standardized);

            setNewChar({
                ...newChar,
                inventory,
                backpack
            });
            soundService.playEffect('UI_UPGRADE_SUCCESS');
        } catch (error) {
            console.error("Failed to unpack gear:", error);
            soundService.playEffect('MENU_ERROR');
        } finally {
            setIsUnpacking(false);
        }
    };

    const abilityColors: Record<string, string> = {
        str: 'border-red-500/20 text-red-600 bg-red-50',
        dex: 'border-green-500/20 text-green-600 bg-green-50',
        con: 'border-orange-500/20 text-orange-600 bg-orange-50',
        int: 'border-blue-500/20 text-blue-600 bg-blue-50',
        wis: 'border-purple-500/20 text-purple-600 bg-purple-50',
        cha: 'border-pink-500/20 text-pink-600 bg-pink-50',
    };

    const TraitReview: React.FC<{ label: string, value?: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 opacity-40">
                {icon}
                <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-[10px] font-bold text-parchment-100 italic leading-tight">
                {value || <span className="opacity-20 italic">Undefined Fragment</span>}
            </p>
        </div>
    );

    return (
        <div className="space-y-8 h-full overflow-y-auto custom-scrollbar pr-4 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-header font-black text-dragon-darkRed uppercase tracking-tight leading-none italic">Final Manifest</h2>
                    <p className="text-[11px] text-parchment-600 font-bold uppercase tracking-[0.3em] bg-dragon-gold/10 px-3 py-1 inline-block border border-dragon-gold/20 rounded-sm">Verification_Sequence_03</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleGenerateImages}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-dragon-red text-white border border-dragon-red/50 rounded shadow-lg shadow-dragon-red/20 text-[10px] font-black uppercase transition-all active:scale-95 hover:bg-dragon-darkRed"
                    >
                        <GameIcon name="refresh" size={14} color="#FFFFFF" className={isGenerating ? "animate-spin" : ""} />
                        Generate Portraits
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Visuals */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="aspect-[9/16] bg-parchment-100 border-2 border-dragon-gold/30 rounded-sm overflow-hidden shadow-2xl relative group">
                        {newChar.imageUrl ? (
                            <ChromaKeyImage src={newChar.imageUrl} alt={newChar.name || "Character"} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-parchment-300 gap-4">
                                <GameIcon name="user" size={80} color="currentColor" className="opacity-20" />
                                <div className="text-center px-8">
                                    <p className="text-xs font-black uppercase tracking-widest leading-relaxed">No Visual Profile</p>
                                    <p className="text-[9px] italic font-medium opacity-60">Generate portraits to manifest your visual identity in the codex.</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-4 left-4 p-2 bg-dragon-red text-white font-black text-[10px] uppercase tracking-widest rounded-sm shadow-xl">
                            Live_Render
                        </div>
                    </div>

                    {newChar.matrixUrl && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-dragon-red uppercase tracking-[0.4em] flex items-center gap-2">
                                <GameIcon name="image" size={14} color="#8B0000" /> Emotion Matrix
                            </h4>
                            <div className="aspect-[3/2] bg-parchment-100 border border-dragon-gold/20 rounded shadow-lg overflow-hidden translate-z-0">
                                <img src={newChar.matrixUrl} className="w-full h-full object-cover" alt="Emotion Matrix" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Data */}
                <div className="xl:col-span-7 space-y-8">
                    {/* Character Identity Header */}
                    <div className="bg-white/80 border-l-4 border-dragon-red p-6 rounded-sm shadow-md space-y-4 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none rotate-12">
                            <svg viewBox="0 0 512 512" className="w-64 h-64 fill-dragon-red">
                                <GameIcon name="book" size={16} />
                            </svg>
                        </div>

                        <div className="flex items-center justify-between border-b border-dragon-red/10 pb-4 relative z-10">
                            <div>
                                <h3 className="text-5xl font-header font-black text-dragon-darkRed uppercase tracking-tight leading-none mb-2 italic">{newChar.name || 'Hero'}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-black text-dragon-red/60 uppercase tracking-widest">Level {newChar.level} {newChar.class}</span>
                                    <div className="w-1 h-1 rounded-full bg-parchment-300" />
                                    <span className="text-[11px] font-black text-parchment-500 uppercase tracking-widest">{newChar.race?.replace(/-/g, ' ')}</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-dragon-red/10 border border-dragon-red/20 rounded-full flex items-center justify-center shrink-0">
                                {newChar.avatarUrl ? <img src={newChar.avatarUrl} className="w-full h-full object-cover rounded-full" alt="" /> : <GameIcon name="user" size={24} color="currentColor" className="text-dragon-red/30" />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-[10px]">
                            <div className="space-y-1">
                                <p className="font-black text-dragon-red/30 uppercase tracking-widest">Alignment</p>
                                <p className="font-bold text-parchment-900">{newChar.alignment}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-dragon-red/30 uppercase tracking-widest">Background</p>
                                <p className="font-bold text-parchment-900">{newChar.background}</p>
                            </div>
                        </div>
                    </div>

                    {/* Core Attributes */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2">Core Attributes</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {Object.entries(newChar.stats || {}).map(([stat, val]) => (
                                <div key={stat} className={cn("p-3 border rounded-sm flex flex-col items-center gap-1 transition-all", abilityColors[stat])}>
                                    <span className="text-[9px] font-black uppercase opacity-60">{stat}</span>
                                    <span className="text-2xl font-header font-black leading-none">{val}</span>
                                    <span className="text-[10px] font-bold opacity-40">({val >= 10 ? '+' : ''}{Math.floor((val - 10) / 2)})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Proficiencies & Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2 flex items-center gap-2">
                                    <GameIcon name="shield" size={14} color="#8B0000" /> Saving Throws
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(abbr => {
                                        const statVal = (newChar.stats as any)?.[abbr.toLowerCase()] || 10;
                                        const mod = Math.floor((statVal - 10) / 2);
                                        const isProficient = (newChar.proficiencies || []).some(p => {
                                            const pName = typeof p === 'string' ? p : (p as any).name || (p as any).index || '';
                                            return pName.toLowerCase().includes(`saving throw: ${abbr.toLowerCase()}`);
                                        });
                                        const bonus = mod + (isProficient ? 2 : 0);
                                        
                                        return (
                                            <div key={abbr} className={cn(
                                                "flex items-center justify-between p-2 rounded border bg-white/40 transition-all",
                                                isProficient ? "border-dragon-red/30 bg-dragon-red/5" : "border-dragon-gold/10 opacity-60"
                                            )}>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", isProficient ? "bg-dragon-red shadow-[0_0_5px_rgba(139,0,0,0.3)]" : "bg-parchment-200")} />
                                                    <span className="text-[9px] font-black text-parchment-400">{abbr}</span>
                                                </div>
                                                <span className={cn("text-[11px] font-black tabular-nums font-header", isProficient ? "text-dragon-darkRed" : "text-parchment-800")}>
                                                    {bonus >= 0 ? `+${bonus}` : bonus}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2 flex items-center gap-2">
                                    <GameIcon name="check" size={14} color="#8B0000" /> Proficiencies
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {newChar.proficiencies?.filter(p => {
                                        const name = typeof p === 'string' ? p : (p as any).name || (p as any).index || '';
                                        return !name.toLowerCase().includes('saving throw');
                                    }).map((p: any, i) => {
                                        const profName = typeof p === 'string' ? p : (p.name || p.index || 'Proficiency');
                                        return (
                                            <span key={i} className="px-2 py-1 bg-parchment-200 text-parchment-700 text-[9px] font-black uppercase rounded shadow-sm border border-parchment-300">
                                                {profName.replace(/skill: /gi, '').replace(/skill-/gi, '').replace(/_/g, ' ')}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2 flex items-center gap-2">
                                <GameIcon name="sparkles" size={14} color="#8B0000" /> Spells
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {newChar.knownSpells?.map((s: any, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-dragon-red text-white text-[9px] font-black uppercase rounded shadow-md border border-dragon-darkRed">
                                        {s.name}
                                    </span>
                                )) || <span className="text-[10px] italic opacity-40">No spells learned</span>}
                            </div>
                        </div>
                    </div>

                    {/* Features & Traits: Grouped by Source */}
                    <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2 flex items-center gap-2">
                            <GameIcon name="sparkles" size={14} color="#8B0000" /> Features & Traits
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['Class', 'Species', 'Background', 'General'].map(source => {
                                const sourceFeatures = (newChar.features || []).filter((f: any) => (f.source || 'General') === source);
                                if (sourceFeatures.length === 0) return null;

                                return (
                                    <div key={source} className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-gold/20 to-transparent" />
                                            <span className="text-[8px] font-black text-dragon-gold uppercase tracking-[0.2em] px-2 py-0.5 bg-dragon-red/5 border border-dragon-gold/10 rounded-full">
                                                {source}
                                            </span>
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-dragon-gold/20 to-transparent" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {sourceFeatures.map((f: any, i) => (
                                                <div key={i} className="p-3 bg-white/40 border-l-2 border-l-dragon-gold/30 border border-dragon-gold/10 rounded shadow-sm group hover:border-dragon-gold/30 transition-all">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-black text-dragon-darkRed uppercase tracking-tight">{f.name}</span>
                                                    </div>
                                                    <p className="text-[10px] text-parchment-700 leading-relaxed italic border-t border-dragon-gold/5 pt-1 mt-1">
                                                        {f.desc || (f as any).description || 'A unique trait of your ' + source.toLowerCase() + '.'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {(!newChar.features || newChar.features.length === 0) && (
                                <p className="text-[9px] italic opacity-40 col-span-full text-center py-8 bg-black/5 rounded outline-dashed outline-1 outline-dragon-gold/20">
                                    Ancestral archives are being consulted...
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Inventory Unpacked */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2 flex items-center gap-2">
                            <GameIcon name="backpack" size={14} color="#8B0000" /> Equipment & Backpack
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {/* Inventory Slots */}
                            {Object.entries(newChar.inventory || {}).map(([slot, item]: [string, any]) => item && (
                                <div key={slot} className="flex items-center gap-3 p-3 bg-white border border-dragon-gold/10 rounded shadow-sm group">
                                    <div className="w-10 h-10 bg-dragon-red/5 border border-dragon-gold/20 rounded flex items-center justify-center shrink-0">
                                        {item.imageUrl ? <ChromaKeyImage src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" /> : <GameIcon name="shield" size={18} color="#8B0000" className="opacity-10" />}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[8px] font-black text-dragon-red/40 uppercase tracking-widest mb-0.5">{slot}</span>
                                        <span className="text-[9px] font-black uppercase truncate text-parchment-900 group-hover:text-dragon-red transition-colors">{item.name}</span>
                                    </div>
                                </div>
                            ))}
                            {/* Backpack items */}
                            {newChar.backpack?.map((item: any, i) => (
                                <div key={`bp-${i}`} className="flex items-center gap-3 p-3 bg-parchment-50 border border-dragon-gold/5 rounded shadow-sm group">
                                    <div className="w-10 h-10 bg-black/5 border border-dragon-gold/10 rounded flex items-center justify-center shrink-0">
                                        {item.imageUrl ? <ChromaKeyImage src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" /> : <GameIcon name="package" size={18} color="#8B0000" className="opacity-20" />}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[8px] font-black text-parchment-400 uppercase tracking-widest mb-0.5">Backpack</span>
                                        <span className="text-[9px] font-black uppercase truncate text-parchment-900 group-hover:text-dragon-red transition-colors">{item.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Biometrics & Traits */}
                    <div className="bg-dragon-darkRed text-parchment-50 p-6 rounded-sm shadow-xl space-y-8">
                         {/* Chronical/Backstory */}
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2">Chronicle of Origin</h4>
                            <p className="text-[10px] font-medium leading-relaxed italic text-parchment-200">
                                {newChar.backstory || "The archives are silent on the origins of this soul."}
                            </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2">Persona & Ethos</h4>
                                <div className="space-y-3">
                                    <TraitReview label="Personality" value={newChar.traits?.[0]} icon={<GameIcon name="quote" size={10} color="currentColor" />} />
                                    <TraitReview label="Ideal" value={newChar.ideals?.[0]} icon={<GameIcon name="target" size={10} color="currentColor" />} />
                                    <TraitReview label="Bond" value={newChar.bonds?.[0]} icon={<GameIcon name="heart" size={10} color="currentColor" />} />
                                    <TraitReview label="Flaw" value={newChar.flaws?.[0]} icon={<GameIcon name="alert" size={10} color="currentColor" />} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.4em] border-b border-dragon-gold/20 pb-2">Physical Specs</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="opacity-40 uppercase">Hair</span>
                                        <span className="font-bold">{newChar.appearance?.hairColor} ({newChar.appearance?.hairStyle})</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="opacity-40 uppercase">Eyes</span>
                                        <span className="font-bold">{newChar.appearance?.eyeColor}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="opacity-40 uppercase">Height</span>
                                        <span className="font-bold">{newChar.appearance?.height}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="opacity-40 uppercase">Weight</span>
                                        <span className="font-bold">{newChar.appearance?.weight}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 p-8 bg-dragon-red text-white border-l-8 border-dragon-gold rounded-sm shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center animate-pulse shrink-0">
                        <GameIcon name="alert" size={36} color="currentColor" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-header font-black uppercase tracking-[0.2em] italic">Genesis Ready</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">All parameters verified. Proceed to commit character state to the repository archives.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
