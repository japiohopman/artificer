import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { soundService } from '../../../services/soundService';
import { GameIcon } from '../../../game_icons';

export const IdentityStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-12 p-8 max-w-4xl mx-auto">
            <div className="space-y-2 text-center relative">
                <GameIcon name="identity" size={80} color="#B8860B" className="opacity-20 mx-auto" />
                <h2 className="text-4xl font-header font-black text-dragon-darkRed uppercase tracking-tight">The Great Sigil</h2>
                <p className="text-xs text-parchment-600 font-bold uppercase tracking-widest">Enshrine your identity.</p>
            </div>

            <div className="w-full flex flex-col gap-10 items-center justify-center">
                {/* Primary Action: Gender Selection */}
                <div className="space-y-4 w-full max-w-md text-center">
                    <div className="flex items-center justify-center gap-2 border-b border-dragon-gold/20 pb-2">
                      <span className="text-xs font-black text-dragon-darkRed uppercase tracking-[0.3em]">Primary Identity: Gender</span>
                    </div>
                    <p className="text-[11px] text-parchment-600 font-medium">Establishes narrative pronouns and character dynamic prompts throughout creation.</p>
                    <div className="flex gap-6 justify-center pt-2">
                        {[
                            { id: 'Male', icon: 'warriors', label: 'Male', pronoun: 'He / Him' },
                            { id: 'Female', icon: 'sorceress', label: 'Female', pronoun: 'She / Her' }
                        ].map(g => (
                            <button
                                key={g.id}
                                onClick={() => { setNewChar({...newChar, gender: g.id as any}); soundService.playEffect('UI_CLICK_LIGHT'); }}
                                className={cn(
                                    "w-40 h-48 rounded-md border-2 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer relative overflow-hidden shadow-sm",
                                    newChar.gender === g.id
                                        ? "bg-dragon-red border-dragon-gold text-white shadow-lg ring-2 ring-dragon-gold/30"
                                        : "bg-white/40 border-dragon-gold/20 text-dragon-darkRed hover:border-dragon-gold/40 hover:bg-white/60"
                                )}
                            >
                                <GameIcon name={g.icon as any} size={48} color={newChar.gender === g.id ? "#FFFFFF" : "#991B1B"} />
                                <div className="text-center">
                                    <span className="font-header font-black text-sm uppercase block">{g.label}</span>
                                    <span className={cn("text-[9px] font-bold uppercase tracking-wider block", newChar.gender === g.id ? "text-dragon-gold" : "text-parchment-500")}>
                                        {g.pronoun}
                                    </span>
                                </div>
                                {newChar.gender === g.id && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-dragon-gold animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Secondary/Temporary Input: Working Name */}
                <div className="space-y-3 w-full max-w-md text-center bg-white/30 border border-dragon-gold/15 rounded-md p-4 shadow-sm">
                    <div className="flex items-center justify-center gap-2 border-b border-dragon-gold/10 pb-1.5">
                        <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.2em]">Working Name (Optional)</span>
                    </div>
                    <p className="text-[10px] text-parchment-500 font-medium italic">You can set a temporary name here or finalize your character's full name in the description step later.</p>
                    <input
                        type="text"
                        placeholder="Enter Working Moniker..."
                        value={newChar.name || ''}
                        onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                        className="w-full text-2xl font-header font-black text-center text-dragon-darkRed uppercase bg-transparent border-b-2 border-dragon-gold/30 focus:border-dragon-red outline-none py-2 transition-colors placeholder:text-parchment-400/50"
                    />
                </div>
            </div>
        </div>
    );
};
