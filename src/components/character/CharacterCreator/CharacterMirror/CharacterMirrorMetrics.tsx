import React from 'react';
import { Character } from '../../../../store/useCharacterStore';
import { GameIcon } from '../../../../game_icons';

interface CharacterMirrorMetricsProps {
  newChar: Partial<Character>;
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

export const CharacterMirrorMetrics: React.FC<CharacterMirrorMetricsProps> = ({ newChar }) => {
  // Stats
  const dexVal = newChar.stats?.dex ?? 10;
  const conVal = newChar.stats?.con ?? 10;
  const dexMod = Math.floor((dexVal - 10) / 2);
  const conMod = Math.floor((conVal - 10) / 2);

  // Speed calculation
  let speedText = '—';
  if (newChar.subrace && SPECIES_SPEED_MAP[newChar.subrace.toLowerCase()]) {
    speedText = `${SPECIES_SPEED_MAP[newChar.subrace.toLowerCase()]} FT`;
  } else if (newChar.race && SPECIES_SPEED_MAP[newChar.race.toLowerCase()]) {
    speedText = `${SPECIES_SPEED_MAP[newChar.race.toLowerCase()]} FT`;
  } else if (newChar.race) {
    speedText = '30 FT';
  }

  // Initiative calculation
  const initiativeText = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;

  // AC calculation (Only show if character DEX is established, default base AC = 10 + dexMod)
  const acText = `${10 + dexMod}`;

  // HP calculation (Only show if class is selected!)
  let hpText = '—';
  if (newChar.class) {
    // If class selected, show estimated HP or base HP
    const baseHp = (newChar.hp || 10) + conMod;
    hpText = `${Math.max(1, baseHp)}`;
  }

  return (
    <div className="w-full bg-white/70 backdrop-blur-md border border-dragon-gold/30 rounded-sm p-2 shadow-sm my-2">
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {/* HP Metric */}
        <div className="bg-parchment-100/80 border border-dragon-gold/20 p-1.5 rounded flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <GameIcon name="hit-points" size={13} className="text-dragon-red shrink-0" />
            <span className="text-[8px] font-black uppercase text-parchment-600 tracking-wider">HP</span>
          </div>
          <span className="text-[11px] font-black text-dragon-darkRed">{hpText}</span>
        </div>

        {/* AC Metric */}
        <div className="bg-parchment-100/80 border border-dragon-gold/20 p-1.5 rounded flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <img src="/assets/ui/ac-badge.webp" alt="AC" className="w-3.5 h-3.5 object-contain shrink-0" />
            <span className="text-[8px] font-black uppercase text-parchment-600 tracking-wider">AC</span>
          </div>
          <span className="text-[11px] font-black text-dragon-darkRed">{acText}</span>
        </div>

        {/* Speed Metric */}
        <div className="bg-parchment-100/80 border border-dragon-gold/20 p-1.5 rounded flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <GameIcon name="speedfoot" size={13} className="text-dragon-red shrink-0" />
            <span className="text-[8px] font-black uppercase text-parchment-600 tracking-wider">SPD</span>
          </div>
          <span className="text-[11px] font-black text-dragon-darkRed">{speedText}</span>
        </div>

        {/* Initiative Metric */}
        <div className="bg-parchment-100/80 border border-dragon-gold/20 p-1.5 rounded flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <GameIcon name="initiative" size={13} className="text-dragon-red shrink-0" />
            <span className="text-[8px] font-black uppercase text-parchment-600 tracking-wider">INIT</span>
          </div>
          <span className="text-[11px] font-black text-dragon-darkRed">{initiativeText}</span>
        </div>
      </div>
    </div>
  );
};
