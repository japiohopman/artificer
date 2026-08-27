import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { soundService } from '../../../services/soundService';
import { GameIcon } from '../../../game_icons';
import { GenderBodySvg } from './GenderBodySvg';

export const IdentityStep: React.FC<{
    newChar: Partial<Character>;
    setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-8 p-6 max-w-4xl mx-auto">
            <div className="space-y-2 text-center relative">
                <GameIcon name="identity" size={64} color="#B8860B" className="opacity-20 mx-auto" />
                <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Manifested Polarity</h2>
                <p className="text-xs text-parchment-600 font-bold uppercase tracking-widest">Select your physical form and archetype</p>
            </div>

            <div className="w-full flex flex-row gap-8 items-center justify-center">
                <GenderBodySvg
                    gender="Male"
                    race={newChar.race}
                    selected={newChar.gender === 'Male'}
                    onClick={() => {
                        setNewChar({ ...newChar, gender: 'Male' });
                        soundService.playEffect('UI_CLICK_LIGHT');
                    }}
                />
                <GenderBodySvg
                    gender="Female"
                    race={newChar.race}
                    selected={newChar.gender === 'Female'}
                    onClick={() => {
                        setNewChar({ ...newChar, gender: 'Female' });
                        soundService.playEffect('UI_CLICK_LIGHT');
                    }}
                />
            </div>
        </div>
    );
};
