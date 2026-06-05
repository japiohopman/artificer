import React, { useState, useEffect } from 'react';
import { Character } from '../../../store/useStore';
import { cn } from '../../../lib/utils';
import { fetchClassData, fetchSpellList } from '../../../services/storageService';
import { GameIcon } from '../../../game_icons';

export const SpellsStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    const [classData, setClassData] = useState<any>(null);
    const [availableSpells, setAvailableSpells] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (newChar.class) {
            setLoading(true);
            Promise.all([
                fetchClassData(newChar.class),
                fetchSpellList()
            ]).then(([cData, spells]) => {
                setClassData(cData);
                // Filter spells for this class: check if the class index or name matches
                const classIndex = newChar.class?.toLowerCase();
                const filtered = spells.filter(s => {
                    const matchesLevel = s.level <= 1;
                    const matchesClass = Array.isArray(s.classes) && 
                        s.classes.some((c: any) => {
                            if (typeof c === 'string') return c.toLowerCase() === classIndex;
                            return c.index?.toLowerCase() === classIndex || 
                                   c.name?.toLowerCase() === classIndex;
                        });
                    return matchesLevel && matchesClass;
                });
                setAvailableSpells(filtered);
                setLoading(false);
            });
        }
    }, [newChar.class]);

    const toggleSpell = (spell: any) => {
        const currentKnown = newChar.knownSpells || [];
        const currentPrepared = newChar.preparedSpells || [];

        if (currentKnown.find(s => s.index === spell.index)) {
            setNewChar({ 
                ...newChar, 
                knownSpells: currentKnown.filter(s => s.index !== spell.index),
                preparedSpells: currentPrepared.filter(index => index !== spell.index)
            });
        } else {
            if (currentKnown.length < 6) {
                setNewChar({ 
                    ...newChar, 
                    knownSpells: [...currentKnown, spell],
                    preparedSpells: [...currentPrepared, spell.index]
                });
            }
        }
    };

    if (!classData?.spellcasting && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="p-8 bg-dragon-gold/5 rounded-full border-2 border-dragon-gold/10 text-dragon-gold/20">
                    <GameIcon name="skull" size={80} color="currentColor" />
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col border-b border-dragon-gold/20 pb-4">
                <h3 className="text-2xl font-header font-black text-dragon-darkRed uppercase tracking-widest mb-1">Arcana Selection</h3>
                <p className="text-[10px] text-parchment-500 font-black uppercase tracking-[0.2em]">Choose spells that resonate with your inner power</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <GameIcon name="refresh" size={40} color="#B8860B" className="animate-spin" />
                    <span className="text-[12px] font-black text-dragon-gold uppercase tracking-[0.3em]">Incanting Spells...</span>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Cantrips Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-dragon-red/10 text-dragon-red rounded-sm">
                                <GameIcon name="sparkles" size={16} color="currentColor" />
                            </div>
                            <h4 className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest">Cantrips (Level 0)</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {cantrips.map(spell => {
                                const active = newChar.knownSpells?.some(s => s.index === spell.index);
                                return (
                                    <SpellCard key={spell.index} spell={spell} active={active} onClick={() => toggleSpell(spell)} />
                                );
                            })}
                        </div>
                    </div>

                    {/* Level 1 Spells Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-dragon-red/10 text-dragon-red rounded-sm">
                                <GameIcon name="zap" size={16} color="currentColor" />
                            </div>
                            <h4 className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest">Level 1 Spells</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {level1Spells.map(spell => {
                                const active = newChar.knownSpells?.some(s => s.index === spell.index);
                                return (
                                    <SpellCard key={spell.index} spell={spell} active={active} onClick={() => toggleSpell(spell)} />
                                );
                            })}
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
                {spell.school?.name || 'Arcane'}
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
            <GameIcon name="zap" size={60} color="currentColor" />
        </div>
    </button>
);
