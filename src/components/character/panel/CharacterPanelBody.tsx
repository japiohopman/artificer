import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { GenderBodySvg } from '../GenderBodySvg';
import { ALIGNMENT_ATMOSPHERE_MAP } from '../../../lib/alignmentConstants';

interface CharacterPanelBodyProps {
  character: Partial<Character>;
  currentStep?: string;
  className?: string;
}

export const CharacterPanelBody: React.FC<CharacterPanelBodyProps> = ({ character, className }) => {
  const gender = (character.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female';

  // Determine background atmosphere image from alignment
  let bgImage: string | null = null;
  if (character.alignment) {
    const key = character.alignment.toLowerCase();
    bgImage = ALIGNMENT_ATMOSPHERE_MAP[key] || ALIGNMENT_ATMOSPHERE_MAP[key.replace(/\s+/g, '_')] || null;
  }

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-sm min-h-[220px] ${className || ''}`}>
      {/* Background Image Layer (Fills the ENTIRE container at 60% opacity) */}
      {bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-multiply transition-all duration-700 ease-in-out pointer-events-none"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-parchment-200/40 mix-blend-multiply pointer-events-none" />
      )}

      {/* SVG Silhouette Body Layer */}
      <div className="relative z-10 flex items-center justify-center p-1 w-full h-full max-h-[280px]">
        <GenderBodySvg
          gender={gender}
          race={character.race}
          selected={false}
          skinColor={character.appearance?.skinColor}
          heightScale={(character.appearance as any)?.heightScale}
          weightScale={(character.appearance as any)?.weightScale}
          className="border-none bg-transparent hover:bg-transparent shadow-none p-0 h-full w-auto max-h-[260px] object-contain"
        />
      </div>
    </div>
  );
};
