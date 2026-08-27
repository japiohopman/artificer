import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GenderBodySvg } from './GenderBodySvg';
import { GameIcon } from '../../../game_icons';
import { ALIGNMENT_ATMOSPHERE_MAP } from './SelectionStep';

interface CreatorRightPanelProps {
  newChar: Partial<Character>;
  currentStep: string;
}

export const CreatorRightPanel: React.FC<CreatorRightPanelProps> = ({ newChar, currentStep }) => {
  const gender = (newChar.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female';
  const alignmentBg = newChar.alignment ? ALIGNMENT_ATMOSPHERE_MAP[newChar.alignment.toLowerCase()] : null;

  // Calculate quick stats
  const dexVal = newChar.stats?.dex || 10;
  const conVal = newChar.stats?.con || 10;
  const dexMod = Math.floor((dexVal - 10) / 2);
  const conMod = Math.floor((conVal - 10) / 2);

  const ac = 10 + dexMod;
  const initiative = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
  const speed = newChar.race?.toLowerCase().includes('dwarf') || newChar.race?.toLowerCase().includes('halfling') || newChar.race?.toLowerCase().includes('gnome') ? '25 ft' : '30 ft';
  const hp = 8 + conMod; // Estimated base L1 HP

  return (
    <div className="w-[360px] lg:w-[420px] border-l border-dragon-gold/20 bg-white/30 flex flex-col relative overflow-hidden shrink-0 shadow-inner">
      {/* Background Paper Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      {/* Alignment Enemy Background Backdrop Layer */}
      {alignmentBg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none transition-all duration-700 ease-in-out filter blur-[1px]"
          style={{ backgroundImage: `url('${alignmentBg}')` }}
        />
      )}

      {/* Central SVG Silhouette Backdrop Layer */}
      <div className="absolute inset-0 flex items-center justify-center opacity-90 pointer-events-none p-2 z-0">
        <GenderBodySvg
          gender={gender}
          race={newChar.race}
          selected={false}
          skinColor={newChar.appearance?.skinColor}
          heightScale={(newChar.appearance as any)?.heightScale}
          weightScale={(newChar.appearance as any)?.weightScale}
          className="border-none bg-transparent hover:bg-transparent shadow-none p-0 scale-125 stroke-black opacity-95"
        />
      </div>

      {/* Foreground Information Overlay */}
      <div className="relative z-10 flex-1 p-4 flex flex-col justify-between overflow-hidden">
        {/* Header Title Bar */}
        <div className="space-y-0.5 border-b border-dragon-gold/30 pb-2 bg-white/70 backdrop-blur-sm p-3 rounded-sm shadow-sm">
          <span className="text-[8px] font-black uppercase text-dragon-red tracking-[0.3em] block leading-none">
            Manifest Frame
          </span>
          <h2 className="text-lg font-header font-black text-dragon-darkRed uppercase tracking-tight truncate flex items-center gap-2">
            <GameIcon name="identity" size={16} color="#991B1B" />
            {newChar.name && newChar.name.trim() ? newChar.name : 'Unmanifested Hero'}
          </h2>
          <span className="text-[9px] font-bold text-parchment-600 uppercase tracking-widest block leading-none">
            Ruleset: {newChar.ruleset === '2024' ? 'D&D 5.5e (2024)' : 'D&D 5e (2014)'}
          </span>
        </div>

        {/* Two-Column Side Overlay Stack (Leaves Center Silhouette Completely Visible) */}
        <div className="flex-1 my-2 grid grid-cols-2 gap-3 items-start pointer-events-none">
          {/* Left Column: Selection Summaries */}
          <div className="space-y-1.5 pointer-events-auto">
            {newChar.race && (
              <CompactSummaryRow
                icon="ancestry"
                label="Species"
                value={`${newChar.race.replace(/-/g, ' ')}${
                  newChar.subrace ? ` (${newChar.subrace.replace(/-/g, ' ')})` : ''
                }`}
                active={currentStep === 'species'}
              />
            )}

            {newChar.class && (
              <CompactSummaryRow
                icon="weapon"
                label="Class"
                value={newChar.class}
                active={currentStep === 'class'}
              />
            )}

            {newChar.background && (
              <CompactSummaryRow
                icon="scroll"
                label="Origins / Background"
                value={newChar.background}
                active={currentStep === 'background'}
              />
            )}

            {newChar.alignment && (
              <CompactSummaryRow
                icon="shield"
                label="Alignment"
                value={newChar.alignment}
                active={currentStep === 'alignment'}
              />
            )}

            {newChar.gender && (
              <CompactSummaryRow
                icon="info"
                label="Polarity (Gender)"
                value={newChar.gender}
                active={currentStep === 'identity'}
              />
            )}
          </div>

          {/* Right Column: Dynamic Combat & Vitals Box */}
          <div className="space-y-2 pointer-events-auto bg-white/75 backdrop-blur-md border border-dragon-gold/30 rounded-sm p-3 shadow-md">
            <span className="text-[8px] font-black uppercase text-dragon-red tracking-widest block border-b border-dragon-gold/20 pb-1">
              Combat Vitals
            </span>
            <div className="space-y-1.5">
              <VitalStatRow label="HP" value={hp.toString()} icon="heart" />
              <VitalStatRow label="Armor Class (AC)" value={ac.toString()} icon="shield" />
              <VitalStatRow label="Speed" value={speed} icon="direction_right" />
              <VitalStatRow label="Initiative" value={initiative} icon="dice" />
            </div>
          </div>
        </div>

        {/* Bottom Horizontal 1-Row Attribute Matrix */}
        <div className="bg-white/80 backdrop-blur-md border border-dragon-gold/30 rounded-sm p-2 shadow-md">
          <span className="text-[8px] font-black uppercase text-dragon-red tracking-widest block mb-1.5 text-center">
            Attribute Matrix
          </span>
          <div className="grid grid-cols-6 gap-1 text-center">
            {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((stat) => {
              const val = newChar.stats?.[stat as keyof typeof newChar.stats] || 10;
              return (
                <div key={stat} className="bg-parchment-100/90 border border-dragon-gold/20 p-1 rounded-sm">
                  <span className="text-[7px] font-black uppercase text-parchment-600 block leading-none">{stat}</span>
                  <span className="text-[11px] font-black text-dragon-darkRed leading-tight block mt-0.5">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactSummaryRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  active?: boolean;
}> = ({ icon, label, value, active }) => (
  <div
    className={`p-1.5 rounded-sm border transition-all backdrop-blur-md flex items-center gap-2 ${
      active
        ? 'bg-dragon-red/10 border-dragon-red shadow-sm scale-[1.02]'
        : 'bg-white/75 border-dragon-gold/20 hover:bg-white/90'
    }`}
  >
    <div className="p-1 rounded bg-dragon-red/10 text-dragon-red shrink-0">
      <GameIcon name={icon as any} size={12} color="#991B1B" />
    </div>
    <div className="min-w-0 flex-1">
      <span className="text-[7px] font-black uppercase tracking-widest text-parchment-500 block leading-none">
        {label}
      </span>
      <span className="text-[9px] font-black uppercase text-dragon-darkRed truncate block leading-tight">
        {value}
      </span>
    </div>
  </div>
);

const VitalStatRow: React.FC<{
  label: string;
  value: string;
  icon: string;
}> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between text-left">
    <div className="flex items-center gap-1.5">
      <GameIcon name={icon as any} size={10} color="#8B0000" />
      <span className="text-[8px] font-black uppercase text-parchment-600 tracking-wider">{label}</span>
    </div>
    <span className="text-[11px] font-black text-dragon-darkRed">{value}</span>
  </div>
);
