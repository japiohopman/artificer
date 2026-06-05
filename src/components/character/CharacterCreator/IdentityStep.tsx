import React from 'react';
import { Character } from '../../../store/useStore';
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
                <GameIcon name="fingerprint" size={80} color="#B8860B" className="opacity-20 mx-auto" />
                <h2 className="text-4xl font-header font-black text-dragon-darkRed uppercase tracking-tight">The Great Sigil</h2>
                <p className="text-xs text-parchment-600 font-bold uppercase tracking-widest">Enshrine your identity.</p>
            </div>

            <div className="w-full flex flex-col md:flex-row gap-12 items-center justify-center">
                <div className="space-y-6 w-full max-w-sm">
                    <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-[0.4em] border-b border-dragon-red/10 pb-2">Manifested Polarity</h3>
                    <div className="flex gap-4">
                        {[{ id: 'Male', icon: 'warriors', label: 'Male' }, { id: 'Female', icon: 'sorceress', label: 'Female' }].map(g => (
                            <button key={g.id} onClick={() => { setNewChar({...newChar, gender: g.id as any}); soundService.playEffect('UI_CLICK_LIGHT'); }} className={cn("w-32 h-44 rounded-sm border-2 transition-all flex flex-col items-center justify-center gap-4", newChar.gender === g.id ? "bg-dragon-red border-dragon-gold text-white" : "bg-white/20 border-dragon-gold/10 text-parchment-300")}>
                                <GameIcon name={g.icon as any} size={40} color={newChar.gender === g.id ? "#FFFFFF" : "#991B1B"} />
                                <span className="font-header font-black text-xs uppercase text-center px-2">{g.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 w-full max-w-sm">
                    <h3 className="text-[10px] font-black text-dragon-red uppercase tracking-[0.4em] border-b border-dragon-red/10 pb-2">Soul Name</h3>
                    <input type="text" placeholder="Enter Moniker..." value={newChar.name || ''} onChange={(e) => setNewChar({ ...newChar, name: e.target.value })} className="w-full text-4xl font-header font-black uppercase bg-transparent border-b-4 border-dragon-gold/20 focus:border-dragon-red outline-none py-3" />
                </div>
            </div>
        </div>
    );
};
