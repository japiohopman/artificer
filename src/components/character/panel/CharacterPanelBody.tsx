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

  // Formatted labels for race and class
  const formattedRace = character.race
    ? `${character.race.replace(/-/g, ' ')}${
        character.subrace ? ` (${character.subrace.replace(/-/g, ' ')})` : ''
      }`.toUpperCase()
    : null;
  const formattedClass = character.class ? character.class.toUpperCase() : null;

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-between overflow-hidden rounded-sm min-h-[220px] ${className || ''}`}>
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
          race={character.race}
          selected={false}
          skinColor={character.appearance?.skinColor}
          heightScale={(character.appearance as any)?.heightScale}
          weightScale={(character.appearance as any)?.weightScale}
          className="border-none bg-transparent hover:bg-transparent shadow-none p-0 scale-90"
        />
      </div>
    </div>
  );
};
