import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { fetchClassData, fetchSpellList } from '../../../services/storageService';
import { soundService } from '../../../services/soundService';
import { GameIcon } from '../../../game_icons';
import { DnDMarkdown } from '../../ui/DnDMarkdown';
import { SpellSprite } from '../../atlas/SpellSprite';
import { SpellCard } from '../../atlas/SpellCard';

export interface ClassSpellLimits {
  cantrips: number;
  spells: number;
}

export const LEVEL_1_SPELL_LIMITS: Record<string, ClassSpellLimits> = {
  wizard: { cantrips: 3, spells: 6 },
  sorcerer: { cantrips: 4, spells: 2 },
  cleric: { cantrips: 3, spells: 4 },
  druid: { cantrips: 2, spells: 4 },
  bard: { cantrips: 2, spells: 4 },
  warlock: { cantrips: 2, spells: 2 },
  artificer: { cantrips: 2, spells: 3 },
  paladin: { cantrips: 0, spells: 0 },
  ranger: { cantrips: 0, spells: 0 }
};

export const SpellsStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [classData, setClassData] = useState<any>(null);
    const [availableSpells, setAvailableSpells] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

    // Spell Sheet Inspect Modal State
    const [inspectedSpell, setInspectedSpell] = useState<any | null>(null);

    // Help modal state
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [activeHelpTab, setActiveHelpTab] = useState<'choice' | 'help'>('choice');
    const [choiceMarkdown, setChoiceMarkdown] = useState<string>('');
    const [helpMarkdown, setHelpMarkdown] = useState<string>('');

    const classIndex = newChar.class?.toLowerCase() || '';
    const limits = LEVEL_1_SPELL_LIMITS[classIndex] || { cantrips: 3, spells: 4 };
    const cantripLimit = classData?.spellcasting?.cantrips_known ?? limits.cantrips;
    const spellLimit = limits.spells;

    const getSpellLevel = (s: any): number => {
        if (!s || s.level === undefined || s.level === null) return 0;
        return Number(s.level);
    };

    const currentKnown = newChar.knownSpells || [];
    const selectedCantrips = currentKnown.filter((s: any) => getSpellLevel(s) === 0);
    const selectedLevel1 = currentKnown.filter((s: any) => getSpellLevel(s) === 1);

    const isSpellSelected = (spell: any): boolean => {
        if (!spell) return false;
        return currentKnown.some((s: any) =>
            s.index === spell.index ||
            (s.name && spell.name && s.name.toLowerCase() === spell.name.toLowerCase())
        );
    };

    const getSelectionDisabledReason = (spell: any): string | undefined => {
        if (!spell) return undefined;
        const isSelected = isSpellSelected(spell);
        if (isSelected) return undefined;

        const spellLevel = getSpellLevel(spell);
        const isCantrip = spellLevel === 0;

        if (isCantrip) {
            if (cantripLimit > 0 && selectedCantrips.length >= cantripLimit) {
                return `Max ${cantripLimit} Cantrip${cantripLimit > 1 ? 's' : ''} Limit Reached`;
            }
        } else {
            if (spellLimit > 0 && selectedLevel1.length >= spellLimit) {
                return `Max ${spellLimit} Spell${spellLimit > 1 ? 's' : ''} Limit Reached`;
            }
        }
        return undefined;
    };

    // Load markdown guide files
    useEffect(() => {
        const loadMarkdownFiles = async () => {
            try {
                const [choiceRes, helpRes] = await Promise.all([
                    fetch('/assets/ui/official/spells/spell_choice.md'),
                    fetch('/assets/ui/official/spells/spell_help.md')
                ]);
                if (choiceRes.ok) {
                    const text = await choiceRes.text();
                    setChoiceMarkdown(text);
                }
                if (helpRes.ok) {
                    const text = await helpRes.text();
                    setHelpMarkdown(text);
                }
            } catch (err) {
                console.error('Failed to load spell guide markdown files', err);
            }
        };
        loadMarkdownFiles();
    }, []);

    // Load class data & spells
    useEffect(() => {
        if (newChar.class) {
            setLoading(true);
            Promise.all([
                fetchClassData(newChar.class, newChar.ruleset),
                fetchSpellList(newChar.ruleset)
            ]).then(async ([cData, spells]) => {
                setClassData(cData);
                const levelFiltered = spells.filter((s: any) => getSpellLevel(s) <= 1);
                
                const detailedSpells = await Promise.all(
                    levelFiltered.map(async (s: any) => {
                        if (Array.isArray(s.classes) && s.classes.length > 0) {
                            return s;
                        }
                        const { fetchSpellData } = await import('../../../services/storageService');
                        const fullData = await fetchSpellData(s.index, newChar.ruleset);
                        return fullData || s;
                    })
                );

                // Strict class filtering: ONLY include spells whose classes explicitly contain classIndex
                const filtered = detailedSpells.filter((s: any) => {
                    if (!s || getSpellLevel(s) > 1) return false;
                    if (!Array.isArray(s.classes) || s.classes.length === 0) {
                        return false; // Exclude unclassed/hashed fallback entries
                    }
                    return s.classes.some((c: any) => {
                        const cName = typeof c === 'string' ? c : c.index || c.name || '';
                        return cName.toLowerCase() === classIndex;
                    });
                });

                // Deduplicate by normalized spell name
                const uniqueMap = new Map<string, any>();
                for (const spell of filtered) {
                    const key = (spell.name || spell.index).toLowerCase().trim();
                    if (!uniqueMap.has(key) || (Array.isArray(spell.classes) && spell.classes.length > 0)) {
                        uniqueMap.set(key, spell);
                    }
                }

                setAvailableSpells(Array.from(uniqueMap.values()));
                setLoading(false);
            }).catch(err => {
                console.error("Error loading spells:", err);
                setLoading(false);
            });
        }
    }, [newChar.class, classIndex]);

    const toggleSpell = (spell: any) => {
        const isSelected = isSpellSelected(spell);

        if (isSelected) {
            setNoticeMsg(null);
            setNewChar({ 
                ...newChar, 
                knownSpells: currentKnown.filter((s: any) => 
                    s.index !== spell.index && 
                    (!s.name || !spell.name || s.name.toLowerCase() !== spell.name.toLowerCase())
                ),
                preparedSpells: (newChar.preparedSpells || []).filter((index: string) => index !== spell.index)
            });
            soundService.playEffect('UI_CLICK_LIGHT');
        } else {
            const spellLevel = getSpellLevel(spell);
            const isCantrip = spellLevel === 0;

            if (isCantrip) {
                if (cantripLimit > 0 && selectedCantrips.length >= cantripLimit) {
                    soundService.playEffect('UI_ERROR');
                    setNoticeMsg(`You can select a maximum of ${cantripLimit} cantrip${cantripLimit > 1 ? 's' : ''} for a Level 1 ${newChar.class}.`);
                    return;
                }
            } else {
                if (spellLimit > 0 && selectedLevel1.length >= spellLimit) {
                    soundService.playEffect('UI_ERROR');
                    setNoticeMsg(`You can select a maximum of ${spellLimit} Level 1 spell${spellLimit > 1 ? 's' : ''} for a Level 1 ${newChar.class}.`);
                    return;
                }
            }

            setNoticeMsg(null);
            setNewChar({ 
                ...newChar, 
                knownSpells: [...currentKnown, spell],
                preparedSpells: [...(newChar.preparedSpells || []), spell.index]
            });
            soundService.playEffect('UI_CLICK_LIGHT');
        }
    };

    const SPELLCASTER_CLASSES = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'warlock', 'paladin', 'ranger', 'artificer'];
    const isSpellcasterClass = SPELLCASTER_CLASSES.includes(classIndex);

    if (!isSpellcasterClass && !classData?.spellcasting && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="p-8 bg-dragon-gold/5 rounded-full border-2 border-dragon-gold/10 text-dragon-gold/20">
                    <GameIcon name="death" size={80} color="currentColor" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase">Physical Path</h3>
                    <p className="text-parchment-500 font-medium max-w-sm">Your chosen path relies on mortal steel and physical prowess. The arcane winds do not call to you.</p>
                </div>
            </div>
        );
    }

    const cantrips = availableSpells.filter(s => getSpellLevel(s) === 0);
    const level1Spells = availableSpells.filter(s => getSpellLevel(s) === 1);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
            {/* Step Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-dragon-gold/20 pb-4 gap-4">
                <div>
                    <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-widest mb-1 flex items-center gap-2">
                        <GameIcon name="magic_effect" size={24} color="#8B0000" />
                        Arcana Selection ({newChar.class})
                    </h3>
                    <p className="text-[10px] text-parchment-500 font-black uppercase tracking-[0.2em]">
                        Choose spells that resonate with your inner power
                    </p>
                </div>

                {/* Help Guide Button */}
                <button
                    onClick={() => {
                        setIsHelpOpen(true);
                        soundService.playEffect('UI_CLICK_LIGHT');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-dragon-gold/10 border border-dragon-gold/30 hover:border-dragon-gold text-dragon-darkRed hover:bg-dragon-gold/20 rounded-sm transition-all text-xs font-header font-black uppercase tracking-wider shrink-0 self-start md:self-auto"
                >
                    <GameIcon name="book" size={16} color="#8B0000" />
                    <span>Spell Guide & Rules</span>
                </button>
            </div>

            {/* FIXED / STICKY Selection Limits Banner */}
            <div className="sticky top-0 z-30 bg-parchment-100/95 backdrop-blur-md border-b-2 border-dragon-gold/40 p-3 sm:p-4 rounded-b-md shadow-md transition-all -mx-2 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Cantrip counter */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-dragon-darkRed text-white rounded-sm shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider">Cantrips:</span>
                        <span className={cn(
                            "text-xs font-black px-2 py-0.5 rounded transition-all",
                            selectedCantrips.length === cantripLimit && cantripLimit > 0
                                ? "bg-dragon-gold text-stone-950 font-bold"
                                : "bg-black/30 text-dragon-gold"
                        )}>
                            {selectedCantrips.length} / {cantripLimit}
                        </span>
                        {cantripLimit > 0 && selectedCantrips.length === cantripLimit && (
                            <GameIcon name="check" size={12} color="#D4AF37" />
                        )}
                    </div>

                    {/* Level 1 Spells counter */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-dragon-darkRed text-white rounded-sm shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider">1st-Level Spells:</span>
                        <span className={cn(
                            "text-xs font-black px-2 py-0.5 rounded transition-all",
                            selectedLevel1.length === spellLimit && spellLimit > 0
                                ? "bg-dragon-gold text-stone-950 font-bold"
                                : "bg-black/30 text-dragon-gold"
                        )}>
                            {selectedLevel1.length} / {spellLimit}
                        </span>
                        {spellLimit > 0 && selectedLevel1.length === spellLimit && (
                            <GameIcon name="check" size={12} color="#D4AF37" />
                        )}
                    </div>
                </div>

                <p className="text-[11px] font-medium text-parchment-700 italic">
                    Class Limits for Level 1 {newChar.class}: {cantripLimit} Cantrips & {spellLimit} Spells
                </p>
            </div>

            {/* Warning / Limit Toast Notice */}
            {noticeMsg && (
                <div className="p-3 bg-dragon-red/10 border border-dragon-red/40 rounded-sm text-dragon-darkRed text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
                    <GameIcon name="alert" size={16} color="#8B0000" />
                    <span>{noticeMsg}</span>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <GameIcon name="refresh" size={40} color="#B8860B" className="animate-spin" />
                    <span className="text-[12px] font-black text-dragon-gold uppercase tracking-[0.3em]">Incanting Spells...</span>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Cantrips Section */}
                    {cantripLimit > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-dragon-gold/15 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-dragon-red/10 text-dragon-red rounded-sm">
                                        <GameIcon name="magic_effect" size={16} color="currentColor" />
                                    </div>
                                    <h4 className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest">Cantrips (Level 0)</h4>
                                </div>
                                <span className="text-xs font-bold text-parchment-600">
                                    Selected {selectedCantrips.length} of {cantripLimit}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {cantrips.map(spell => {
                                    const active = isSpellSelected(spell);
                                    return (
                                        <SpellGridTile
                                            key={spell.index || spell.name}
                                            spell={spell}
                                            active={active}
                                            ruleset={newChar.ruleset}
                                            onClick={() => toggleSpell(spell)}
                                            onInspect={() => {
                                                setInspectedSpell(spell);
                                                soundService.playEffect('UI_CLICK_LIGHT');
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Level 1 Spells Section */}
                    {spellLimit > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-dragon-gold/15 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-dragon-red/10 text-dragon-red rounded-sm">
                                        <GameIcon name="energy" size={16} color="currentColor" />
                                    </div>
                                    <h4 className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest">Level 1 Spells</h4>
                                </div>
                                <span className="text-xs font-bold text-parchment-600">
                                    Selected {selectedLevel1.length} of {spellLimit}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {level1Spells.map(spell => {
                                    const active = isSpellSelected(spell);
                                    return (
                                        <SpellGridTile
                                            key={spell.index || spell.name}
                                            spell={spell}
                                            active={active}
                                            ruleset={newChar.ruleset}
                                            onClick={() => toggleSpell(spell)}
                                            onInspect={() => {
                                                setInspectedSpell(spell);
                                                soundService.playEffect('UI_CLICK_LIGHT');
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FULL SPELL CARD SHEET INSPECTION MODAL */}
            {inspectedSpell && (
                <div
                    className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
                    onClick={() => setInspectedSpell(null)}
                >
                    <div
                        className="relative flex flex-col items-center max-w-full max-h-full overflow-y-auto custom-scrollbar p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Modal Button floating top right */}
                        <button
                            onClick={() => setInspectedSpell(null)}
                            className="self-end mb-2 px-3 py-1 bg-stone-900/90 text-dragon-gold hover:text-white border border-dragon-gold/40 rounded-md text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-colors z-20"
                        >
                            <GameIcon name="close" size={14} color="currentColor" />
                            <span>Close Sheet</span>
                        </button>

                        <SpellCard
                            spell={inspectedSpell}
                            ruleset={newChar.ruleset}
                            isSelected={isSpellSelected(inspectedSpell)}
                            onToggleSelect={() => toggleSpell(inspectedSpell)}
                            isSelectionDisabled={Boolean(getSelectionDisabledReason(inspectedSpell))}
                            disabledReason={getSelectionDisabledReason(inspectedSpell)}
                            hideLearnButton={true}
                        />
                    </div>
                </div>
            )}

            {/* Help & Guide Modal Overlay */}
            {isHelpOpen && (
                <div 
                    className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setIsHelpOpen(false)}
                >
                    <div 
                        className="bg-parchment-100 border-2 border-dragon-gold/60 rounded-sm max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-4 bg-dragon-darkRed text-white flex items-center justify-between border-b border-dragon-gold/40">
                            <div className="flex items-center gap-3">
                                <GameIcon name="book" size={20} color="#D4AF37" />
                                <h3 className="text-lg font-header font-black uppercase tracking-wider text-dragon-gold">
                                    Spellcasting Codex & Guide
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsHelpOpen(false)}
                                className="p-1 hover:bg-white/10 rounded transition-colors text-parchment-300 hover:text-white"
                            >
                                <GameIcon name="close" size={18} color="currentColor" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex border-b border-dragon-gold/30 bg-parchment-200/80 px-4 pt-2 gap-2">
                            <button
                                onClick={() => setActiveHelpTab('choice')}
                                className={cn(
                                    "px-4 py-2 text-xs font-header font-black uppercase tracking-wider border-t-2 border-x rounded-t-sm transition-all",
                                    activeHelpTab === 'choice'
                                        ? "bg-parchment-100 border-dragon-gold/60 text-dragon-darkRed border-b-transparent -mb-[1px]"
                                        : "bg-parchment-300/40 border-transparent text-parchment-700 hover:text-dragon-darkRed"
                                )}
                            >
                                Overview & Concepts
                            </button>
                            <button
                                onClick={() => setActiveHelpTab('help')}
                                className={cn(
                                    "px-4 py-2 text-xs font-header font-black uppercase tracking-wider border-t-2 border-x rounded-t-sm transition-all",
                                    activeHelpTab === 'help'
                                        ? "bg-parchment-100 border-dragon-gold/60 text-dragon-darkRed border-b-transparent -mb-[1px]"
                                        : "bg-parchment-300/40 border-transparent text-parchment-700 hover:text-dragon-darkRed"
                                )}
                            >
                                Rules & Mechanics
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                            <DnDMarkdown content={activeHelpTab === 'choice' ? choiceMarkdown : helpMarkdown} />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 bg-parchment-200 border-t border-dragon-gold/30 flex justify-end">
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="px-4 py-1.5 bg-dragon-darkRed text-white hover:bg-dragon-red text-xs font-header font-black uppercase tracking-wider rounded-sm shadow transition-all"
                            >
                                Close Codex
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SpellGridTile: React.FC<{
    spell: any,
    active: boolean,
    onClick: () => void,
    onInspect: () => void,
    ruleset?: '2014' | '2024'
}> = ({ spell, active, onClick, onInspect, ruleset }) => (
    <div
        onClick={onClick}
        className={cn(
            "p-3 rounded-sm border text-left transition-all relative flex flex-col justify-between gap-3 group overflow-hidden h-full min-h-[120px] cursor-pointer shadow-sm hover:shadow-md",
            active 
                ? "bg-dragon-darkRed text-white border-dragon-gold ring-1 ring-dragon-gold/50"
                : "bg-white/60 border-dragon-gold/20 hover:border-dragon-red/40 hover:bg-white"
        )}
    >
        <div className="flex items-start gap-3 relative z-10 w-full">
            <SpellSprite spell={spell} ruleset={ruleset} size={44} className="rounded border border-dragon-gold/30 bg-stone-900/20 p-0.5 shadow-sm shrink-0" />
            
            <div className="flex flex-col min-w-0 flex-1">
                <span className={cn(
                    "text-[11px] font-black uppercase tracking-tight leading-snug truncate",
                    active ? "text-dragon-gold" : "text-dragon-darkRed group-hover:text-dragon-red"
                )} title={spell.name}>
                    {spell.name}
                </span>
                
                <span className="text-[8px] font-black uppercase opacity-60 tracking-wider mt-0.5">
                    {typeof spell.school === 'string' ? spell.school : spell.school?.name || 'Arcane'}
                </span>
                
                <div className="flex items-center gap-1 mt-1 text-[8px] font-bold opacity-75">
                    <span className="truncate">Range: {spell.range}</span>
                </div>
            </div>
        </div>

        <div className="flex justify-between items-center relative z-10 pt-1.5 border-t border-dragon-gold/15">
            <span className="text-[7.5px] font-bold uppercase tracking-wider opacity-70">
                {spell.casting_time}
            </span>

            <div className="flex items-center gap-1.5">
                {/* Inspect / Sheet Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onInspect();
                    }}
                    className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all",
                        active
                            ? "bg-stone-900/40 text-dragon-gold border-dragon-gold/40 hover:bg-stone-900/70"
                            : "bg-dragon-gold/10 text-dragon-darkRed border-dragon-gold/30 hover:bg-dragon-gold/20"
                    )}
                    title="Inspect Spell Sheet"
                >
                    <GameIcon name="info" size={10} color="currentColor" />
                    <span>Sheet</span>
                </button>

                <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                    active ? "bg-dragon-gold text-stone-950 font-bold" : "bg-dragon-red/10 text-dragon-red"
                )}>
                    {(spell.level === 0 || spell.level === "0") ? 'Cantrip' : `Lvl ${spell.level}`}
                </span>
            </div>
        </div>
        
        {active && (
            <div className="absolute top-1 right-1 z-20 bg-dragon-gold/30 text-dragon-gold p-0.5 rounded">
                <GameIcon name="check" size={10} color="currentColor" />
            </div>
        )}
        
        {/* Background Accent */}
        <div className={cn(
            "absolute -bottom-4 -right-4 opacity-5 transition-transform duration-500 group-hover:scale-110 pointer-events-none",
            active ? "text-dragon-gold" : "text-dragon-darkRed"
        )}>
            <GameIcon name="energy" size={60} color="currentColor" />
        </div>
    </div>
);
