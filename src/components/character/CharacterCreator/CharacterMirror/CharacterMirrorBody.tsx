import React from 'react';
import { Character } from '../../../../store/useCharacterStore';
import { GenderBodySvg } from '../GenderBodySvg';
import { ALIGNMENT_ATMOSPHERE_MAP } from '../SelectionStep';

interface CharacterMirrorBodyProps {
  newChar: Partial<Character>;
  currentStep: string;
}

const SPECIES_ATMOSPHERE_MAP: Record<string, string> = {
  'dragonborn': '/assets/images/enemy_backgrounds/dragon_cave.webp',
  'dwarf': '/assets/images/enemy_backgrounds/mountain1.webp',
  'elf': '/assets/images/enemy_backgrounds/forest1.webp',
  'gnome': '/assets/images/enemy_backgrounds/forest2.webp',
  'half-elf': '/assets/images/enemy_backgrounds/land_forest.webp',
  'half-orc': '/assets/images/enemy_backgrounds/cave1.webp',
  'halfling': '/assets/images/enemy_backgrounds/land_plains1.webp',
  'human': '/assets/images/enemy_backgrounds/land_plains1.webp',
  'tiefling': '/assets/images/enemy_backgrounds/volcano.webp'
};

export const CharacterMirrorBody: React.FC<CharacterMirrorBodyProps> = ({ newChar }) => {
  const gender = (newChar.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female';

  // Determine background atmosphere image
  let bgImage: string | null = null;
  if (newChar.alignment) {
    const key = newChar.alignment.toLowerCase();
    bgImage = ALIGNMENT_ATMOSPHERE_MAP[key] || ALIGNMENT_ATMOSPHERE_MAP[key.replace(/\s+/g, '_')] || null;
  }
  if (!bgImage && newChar.race) {
    const raceKey = newChar.race.toLowerCase();
    bgImage = SPECIES_ATMOSPHERE_MAP[raceKey] || '/assets/images/enemy_backgrounds/land_plains1.webp';
  }

  // Format species name label
  const formattedSpeciesName = newChar.race
    ? `${newChar.race.replace(/-/g, ' ')}${
        newChar.subrace ? ` (${newChar.subrace.replace(/-/g, ' ')})` : ''
      }`.toUpperCase()
    : null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden rounded-sm min-h-[220px]">
      {/* Background Image Layer (Renders BEHIND the species body SVG) */}
      {bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay transition-all duration-700 ease-in-out pointer-events-none filter blur-[0.5px]"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-parchment-200/20 mix-blend-multiply pointer-events-none" />
      )}

      {/* SVG Silhouette Backdrop / Body Layer */}
      <div className="relative z-10 my-auto flex items-center justify-center p-2 max-h-[240px] w-full">
        <GenderBodySvg
          gender={gender}
          race={newChar.race}
          selected={false}
          skinColor={newChar.appearance?.skinColor}
          heightScale={(newChar.appearance as any)?.heightScale}
          weightScale={(newChar.appearance as any)?.weightScale}
          className="border-none bg-transparent hover:bg-transparent shadow-none p-0 scale-90"
        />
      </div>

      {/* Selected Species Name Label */}
      {formattedSpeciesName && (
        <div className="relative z-20 mb-2 px-3 py-1 bg-white/70 backdrop-blur-md border border-dragon-gold/30 rounded shadow-sm text-center">
          <span className="text-[10px] font-header font-black text-dragon-darkRed tracking-widest block">
            {formattedSpeciesName}
          </span>
        </div>
      )}
    </div>
  );
};
