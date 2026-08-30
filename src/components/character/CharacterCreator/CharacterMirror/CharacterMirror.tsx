import React from 'react';
import { Character } from '../../../../store/useCharacterStore';
import { GameIcon } from '../../../../game_icons';
import { CharacterMirrorBody } from './CharacterMirrorBody';
import { CharacterMirrorAbilities } from './CharacterMirrorAbilities';

interface CharacterMirrorProps {
  newChar: Partial<Character>;
  currentStep: string;
}

const SPECIES_SPEED_MAP: Record<string, number> = {
  'human': 30,
  'elf': 30,
  'high-elf': 30,
  'wood-elf': 35,
  'drow': 30,
  'dwarf': 25,
  'hill-dwarf': 25,
  'mountain-dwarf': 25,
  'halfling': 25,
  'lightfoot-halfling': 25,
  'stout-halfling': 25,
  'dragonborn': 30,
  'gnome': 25,
  'forest-gnome': 25,
  'rock-gnome': 25,
  'half-elf': 30,
  'half-orc': 30,
  'tiefling': 30
};

export const CharacterMirror: React.FC<CharacterMirrorProps> = ({ newChar, currentStep }) => {
  // Metric Calculations
  const dexVal = newChar.stats?.dex ?? 10;
  const conVal = newChar.stats?.con ?? 10;
  const dexMod = Math.floor((dexVal - 10) / 2);
  const conMod = Math.floor((conVal - 10) / 2);

  let speedText = '—';
  if (newChar.subrace && SPECIES_SPEED_MAP[newChar.subrace.toLowerCase()]) {
    speedText = `${SPECIES_SPEED_MAP[newChar.subrace.toLowerCase()]} FT`;
  } else if (newChar.race && SPECIES_SPEED_MAP[newChar.race.toLowerCase()]) {
    speedText = `${SPECIES_SPEED_MAP[newChar.race.toLowerCase()]} FT`;
  } else if (newChar.race) {
    speedText = '30 FT';
  }

  const initiativeText = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
  const acText = `${10 + dexMod}`;

  let hpText = '—';
  if (newChar.class) {
    const baseHp = (newChar.hp || 10) + conMod;
    hpText = `${Math.max(1, baseHp)}`;
  }

  return (
    <div className="w-80 lg:w-96 border-l border-dragon-gold/20 bg-white/30 flex flex-col relative overflow-hidden shrink-0 shadow-inner h-full">
      {/* Background Paper Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 flex-1 p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar h-full">
        {/* Top Header Card */}
        <div className="space-y-1 border-b border-dragon-gold/30 pb-2 bg-white/60 backdrop-blur-sm p-3 rounded-sm shadow-sm shrink-0">
          <span className="text-[9px] font-black uppercase text-dragon-red tracking-[0.3em] block">
            Manifest Frame
          </span>
          <h2 className="text-xl font-header font-black text-dragon-darkRed uppercase tracking-tight flex items-center gap-2 truncate">
            <GameIcon name="identity" size={18} color="#991B1B" />
            {newChar.name && newChar.name.trim() ? newChar.name : 'Unmanifested Hero'}
          </h2>
          <span className="text-[10px] font-bold text-parchment-600 uppercase tracking-widest block">
            Ruleset: {newChar.ruleset === '2024' ? 'D&D 5.5e (2024)' : 'D&D 5e (2014)'}
          </span>
        </div>

        {/* Central Stage (Background Image + Body SVG + Overlays) */}
        <div className="relative flex-1 my-2 min-h-[280px] flex items-center justify-center overflow-hidden rounded-sm bg-white/20 border border-dragon-gold/20">
          <CharacterMirrorBody newChar={newChar} currentStep={currentStep} />

          {/* Left Overlay: Dynamic Selections (Species, Class, Alignment, Background) */}
          <div className="absolute left-2 top-3 z-20 flex flex-col gap-1.5 max-w-[120px] pointer-events-none">
            {newChar.race && (
              <div className="bg-white/80 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Species</span>
                <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                  {newChar.race.replace(/-/g, ' ')}
                </span>
              </div>
            )}
            {newChar.class && (
              <div className="bg-white/80 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Class</span>
                <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                  {newChar.class}
                </span>
              </div>
            )}
            {newChar.background && (
              <div className="bg-white/80 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Background</span>
                <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                  {newChar.background.replace(/-/g, ' ')}
                </span>
              </div>
            )}
            {newChar.alignment && (
              <div className="bg-white/80 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm">
                <span className="text-[7px] font-black uppercase text-parchment-600 block leading-tight">Alignment</span>
                <span className="text-[10px] font-header font-black text-dragon-darkRed uppercase block truncate leading-tight">
                  {newChar.alignment.replace(/-/g, ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Right Overlay: Vertical Metrics Column (HP, Speed, AC, Initiative) */}
          <div className="absolute right-2 top-3 z-20 flex flex-col gap-2 pointer-events-none items-end">
            {/* HP Metric */}
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
              <GameIcon name="hit-points" size={14} className="text-dragon-red shrink-0" />
              <span className="text-[11px] font-header font-black text-dragon-darkRed">{hpText}</span>
            </div>

            {/* Speed Metric */}
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
              <GameIcon name="speedfoot" size={14} className="text-dragon-red shrink-0" />
              <span className="text-[10px] font-header font-black text-dragon-darkRed">{speedText}</span>
            </div>

            {/* AC Metric */}
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
              <img src="/assets/ui/ac-badge.webp" alt="AC" className="w-3.5 h-3.5 object-contain shrink-0" />
              <span className="text-[11px] font-header font-black text-dragon-darkRed">{acText}</span>
            </div>

            {/* Initiative Metric */}
            <div className="bg-white/85 backdrop-blur-md border border-dragon-gold/30 rounded px-2 py-1 shadow-sm flex items-center gap-1.5 min-w-[65px] justify-between">
              <GameIcon name="initiative" size={14} className="text-dragon-red shrink-0" />
              <span className="text-[11px] font-header font-black text-dragon-darkRed">{initiativeText}</span>
            </div>
          </div>
        </div>

        {/* Bottom Ability Score Strip */}
        <CharacterMirrorAbilities newChar={newChar} />
      </div>
    </div>
  );
};
