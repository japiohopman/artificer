import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { fetchClassData, fetchSpellList } from '../../../services/storageService';
import { soundService } from '../../../services/soundService';
import { GameIcon } from '../../../game_icons';
import { DnDMarkdown } from '../../ui/DnDMarkdown';

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

    // Help modal state
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [activeHelpTab, setActiveHelpTab] = useState<'choice' | 'help'>('choice');
    const [choiceMarkdown, setChoiceMarkdown] = useState<string>('');
    const [helpMarkdown, setHelpMarkdown] = useState<string>('');

    const classIndex = newChar.class?.toLowerCase() || '';
    const limits = LEVEL_1_SPELL_LIMITS[classIndex] || { cantrips: 3, spells: 4 };
    const cantripLimit = classData?.spellcasting?.cantrips_known ?? limits.cantrips;
    const spellLimit = limits.spells;

    const currentKnown = newChar.knownSpells || [];
    const selectedCantrips = currentKnown.filter((s: any) => s.level === 0);
    const selectedLevel1 = currentKnown.filter((s: any) => s.level === 1);

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
                fetchClassData(newChar.class),
                fetchSpellList()
            ]).then(async ([cData, spells]) => {
                setClassData(cData);
                const levelFiltered = spells.filter((s: any) => s.level <= 1);
                
                const detailedSpells = await Promise.all(
                    levelFiltered.map(async (s: any) => {
                        if (Array.isArray(s.classes) && s.classes.length > 0) {
                            return s;
                        }
                        const { fetchSpellData } = await import('../../../services/storageService');
                        const fullData = await fetchSpellData(s.index);
                        return fullData || s;
                    })
                );

                // Class filtering
                const filtered = detailedSpells.filter((s: any) => {
                    if (!s || s.level > 1) return false;
                    if (!Array.isArray(s.classes) || s.classes.length === 0) {
                        return true;
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
        const isSelected = currentKnown.some((s: any) => s.index === spell.index);

        if (isSelected) {
            setNoticeMsg(null);
            setNewChar({ 
                ...newChar, 
                knownSpells: currentKnown.filter((s: any) => s.index !== spell.index),
                preparedSpells: (newChar.preparedSpells || []).filter((index: string) => index !== spell.index)
            });
            soundService.playEffect('UI_CLICK_LIGHT');
        } else {
            const isCantrip = spell.level === 0;
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

    const cantrips = availableSpells.filter(s => s.level === 0);
    const level1Spells = availableSpells.filter(s => s.level === 1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
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

            {/* Selection Limits Banner & Notice */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/60 border border-dragon-gold/30 rounded-sm shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Cantrip counter */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-dragon-darkRed text-white rounded-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider">Cantrips:</span>
                        <span className={cn(
                            "text-xs font-black px-1.5 py-0.5 rounded",
                            selectedCantrips.length === cantripLimit ? "bg-dragon-gold text-black" : "bg-black/30 text-dragon-gold"
                        )}>
                            {selectedCantrips.length} / {cantripLimit}
                        </span>
                    </div>

                    {/* Level 1 Spells counter */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-dragon-darkRed text-white rounded-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider">1st-Level Spells:</span>
                        <span className={cn(
                            "text-xs font-black px-1.5 py-0.5 rounded",
                            selectedLevel1.length === spellLimit ? "bg-dragon-gold text-black" : "bg-black/30 text-dragon-gold"
                        )}>
                            {selectedLevel1.length} / {spellLimit}
                        </span>
                    </div>
                </div>

                <p className="text-[11px] font-medium text-parchment-700 italic">
                    Class Limits for Level 1 {newChar.class}: {cantripLimit} Cantrips & {spellLimit} Spells
                </p>
            </div>

            {/* Warning / Limit Toast Notice */}
            {noticeMsg && (
                <div className="p-3 bg-dragon-red/10 border border-dragon-red/40 rounded-sm text-dragon-darkRed text-xs font-bold flex items-center gap-2 animate-in fade-in">
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {cantrips.map(spell => {
                                    const active = !!newChar.knownSpells?.some((s: any) => s.index === spell.index);
                                    return (
                                        <SpellCard key={spell.index} spell={spell} active={active} onClick={() => toggleSpell(spell)} />
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {level1Spells.map(spell => {
                                    const active = !!newChar.knownSpells?.some((s: any) => s.index === spell.index);
                                    return (
                                        <SpellCard key={spell.index} spell={spell} active={active} onClick={() => toggleSpell(spell)} />
                                    );
                                })}
                            </div>
                        </div>
                    )}
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

const SpellCard: React.FC<{ spell: any, active: boolean, onClick: () => void }> = ({ spell, active, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-4 rounded-sm border text-left transition-all relative flex flex-col gap-2 group overflow-hidden h-full",
            active 
                ? "bg-dragon-darkRed text-white border-dragon-gold shadow-lg" 
                : "bg-white/40 border-dragon-gold/10 hover:border-dragon-red/30 hover:bg-white"
        )}
    >
        <div className="flex justify-between items-start relative z-10">
            <span className={cn(
                "text-[10px] font-black uppercase tracking-tight leading-tight",
                active ? "text-dragon-gold" : "text-dragon-darkRed"
            )}>
                {spell.name}
            </span>
            <GameIcon name="book" size={12} color={active ? "#B8860B" : "currentColor"} className="opacity-40" />
        </div>
        <div className="flex flex-col gap-0.5 relative z-10">
            <span className="text-[8px] font-black uppercase opacity-60 tracking-wider">
                {typeof spell.school === 'string' ? spell.school : spell.school?.name || 'Arcane'}
            </span>
            <div className="flex items-center gap-1">
                <span className="text-[7px] font-bold text-parchment-400 uppercase">Range: {spell.range}</span>
                <div className="w-0.5 h-0.5 rounded-full bg-parchment-300" />
                <span className="text-[7px] font-bold text-parchment-400 uppercase">{spell.casting_time}</span>
            </div>
        </div>
        
        {active && (
            <div className="absolute top-1 right-1 z-20">
                <GameIcon name="check" size={10} color="#B8860B" />
            </div>
        )}
        
        {/* Background Accent */}
        <div className={cn(
            "absolute -bottom-4 -right-4 opacity-5 transition-transform duration-500 group-hover:scale-110",
            active ? "text-dragon-gold" : "text-dragon-darkRed"
        )}>
            <GameIcon name="energy" size={60} color="currentColor" />
        </div>
    </button>
);
