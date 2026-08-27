import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GenderBodySvg } from './GenderBodySvg';
import { GameIcon } from '../../../game_icons';

interface CreatorRightPanelProps {
  newChar: Partial<Character>;
  currentStep: string;
}

export const CreatorRightPanel: React.FC<CreatorRightPanelProps> = ({ newChar, currentStep }) => {
  const gender = (newChar.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female';

  return (
    <div className="w-80 lg:w-96 border-l border-dragon-gold/20 bg-white/30 flex flex-col relative overflow-hidden shrink-0 shadow-inner">
      {/* Background Paper Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      {/* SVG Silhouette Backdrop Layer */}
      <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none p-4 z-0">
        <GenderBodySvg
          gender={gender}
          race={newChar.race}
          selected={false}
          className="border-none bg-transparent hover:bg-transparent shadow-none p-0 scale-110 fill-black stroke-black opacity-90"
        />
      </div>

      {/* Foreground Information Overlay Card */}
      <div className="relative z-10 flex-1 p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar">
        {/* Header Title */}
        <div className="space-y-1 border-b border-dragon-gold/30 pb-3 bg-white/60 backdrop-blur-sm p-3 rounded-sm shadow-sm">
          <span className="text-[9px] font-black uppercase text-dragon-red tracking-[0.3em] block">
            Manifest Frame
          </span>
          <h2 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-tight flex items-center gap-2">
            <GameIcon name="identity" size={18} color="#991B1B" />
            {newChar.name && newChar.name.trim() ? newChar.name : 'Unmanifested Hero'}
          </h2>
          <span className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest block">
            Ruleset: {newChar.ruleset === '2024' ? 'D&D 5.5e (2024)' : 'D&D 5e (2014)'}
          </span>
        </div>

        {/* Dynamic Summary Cards Stack (Only display selections that have been explicitly made) */}
        <div className="my-auto space-y-2.5 py-4">
          {newChar.race && (
            <SummaryRow
              icon="ancestry"
              label="Species"
              value={`${newChar.race.replace(/-/g, ' ')}${
                newChar.subrace ? ` (${newChar.subrace.replace(/-/g, ' ')})` : ''
              }`}
              active={currentStep === 'species'}
            />
          )}

          {newChar.class && (
            <SummaryRow
              icon="weapon"
              label="Class"
              value={newChar.class}
              active={currentStep === 'class'}
            />
          )}

          {newChar.background && (
            <SummaryRow
              icon="scroll"
              label="Origins / Background"
              value={newChar.background}
              active={currentStep === 'background'}
            />
          )}

          {newChar.alignment && (
            <SummaryRow
              icon="shield"
              label="Alignment"
              value={newChar.alignment}
              active={currentStep === 'alignment'}
            />
          )}

          {newChar.gender && (
            <SummaryRow
              icon="info"
              label="Polarity (Gender)"
              value={newChar.gender}
              active={currentStep === 'identity'}
            />
          )}

          {newChar.stats && currentStep !== 'welcome' && currentStep !== 'slot' && currentStep !== 'identity' && (
            <div className="bg-white/70 backdrop-blur-md border border-dragon-gold/30 rounded-sm p-3 shadow-sm">
              <span className="text-[8px] font-black uppercase text-dragon-red tracking-widest block mb-1">
                Attribute Matrix
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {Object.entries(newChar.stats).map(([stat, val]) => (
                  <div key={stat} className="bg-parchment-100 border border-dragon-gold/10 p-1 rounded">
                    <span className="text-[8px] font-black uppercase text-parchment-500 block">{stat}</span>
                    <span className="text-[11px] font-black text-dragon-darkRed">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Badge Footer */}
        <div className="pt-3 border-t border-dragon-gold/30 bg-white/60 backdrop-blur-sm p-3 rounded-sm shadow-sm text-center">
          <span className="text-[9px] font-black uppercase text-dragon-darkRed tracking-widest block">
            Current Stage: {currentStep.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  active?: boolean;
}> = ({ icon, label, value, active }) => (
  <div
    className={`p-2.5 rounded-sm border transition-all backdrop-blur-md flex items-center gap-3 ${
      active
        ? 'bg-dragon-red/10 border-dragon-red shadow-md scale-[1.02]'
        : 'bg-white/70 border-dragon-gold/20 hover:bg-white/80'
    }`}
  >
    <div className="p-1.5 rounded bg-dragon-red/10 text-dragon-red shrink-0">
      <GameIcon name={icon as any} size={14} color="#991B1B" />
    </div>
    <div className="min-w-0 flex-1">
      <span className="text-[8px] font-black uppercase tracking-widest text-parchment-500 block leading-none mb-1">
        {label}
      </span>
      <span className="text-[11px] font-black uppercase text-dragon-darkRed truncate block leading-tight">
        {value}
      </span>
    </div>
  </div>
);
