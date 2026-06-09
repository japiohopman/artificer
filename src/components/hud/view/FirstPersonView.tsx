import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../../store/useStore';
import { NPCDisplay } from './NPCDisplay';

interface FirstPersonViewProps {
  selectedArch?: string;
}

export const FirstPersonView: React.FC<FirstPersonViewProps> = ({ selectedArch }) => {
  const { currentNPC, emotion, getActiveBackground } = useStore();
  const bgUrl = getActiveBackground();

  return (
    <div className="w-full h-full relative group pointer-events-none">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 transition-all duration-1000 group-hover:scale-105 pointer-events-none"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* NPC Layer */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <div className="w-full h-[120%] pointer-events-auto">
          <NPCDisplay 
            species={currentNPC?.species || 'Unknown'}
            emotion={emotion}
            name={currentNPC?.name || 'Unknown'}
            type={currentNPC?.classJob || 'Traveler'}
            portraitUrl={currentNPC?.image}
          />
        </div>
      </div>
    </div>
  );
};
