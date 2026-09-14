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
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className || ''}`}>
      {/* Background Image Layer (Fills 100% of the stage container at 60% opacity) */}
      {bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-multiply transition-all duration-700 ease-in-out pointer-events-none"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-parchment-200/40 mix-blend-multiply pointer-events-none" />
      )}

      {/* SVG Silhouette Body Layer - Centered & Responsive to Available Mirror Space */}
      <div className="absolute inset-x-2 top-2 bottom-12 z-10 flex items-center justify-center pointer-events-none overflow-hidden">
        <GenderBodySvg
          gender={gender}
          race={character.race}
          selected={false}
          skinColor={character.appearance?.skinColor}
          heightScale={(character.appearance as any)?.heightScale}
          weightScale={(character.appearance as any)?.weightScale}
          hideLabel={true}
          hideContainerStyles={true}
          className="h-full w-auto max-h-full max-w-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};
