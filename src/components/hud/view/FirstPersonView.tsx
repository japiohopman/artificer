import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../../store/useUIStore';
import { useWorldStore } from '../../../store/useWorldStore';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { NPCDisplay } from './NPCDisplay';
import { resolveNPCMatrix } from '../../../lib/npcUtils';

interface FirstPersonViewProps {
}

export const FirstPersonView: React.FC<FirstPersonViewProps> = () => {
  const { currentNPC, emotion } = useCharacterStore();
  const { getActiveBackground, isNight } = useWorldStore();
  const bgUrl = getActiveBackground();
  const night = isNight();

  // Resolve NPC portrait with fallback mapping logic
  const portraitUrl = React.useMemo(() => {
    if (!currentNPC) return undefined;
    return currentNPC.imageUrl || resolveNPCMatrix({
        id: currentNPC.id,
        name: currentNPC.name,
        gender: currentNPC.gender || 'male',
        species: currentNPC.race || 'human',
        classJob: currentNPC.class || 'commoner',
        imageUrl: currentNPC.imageUrl
    });
  }, [currentNPC]);

  return (
    <div className="w-full h-full relative group pointer-events-none overflow-hidden">
      {/* Background Layer */}
      <motion.div 
        key={bgUrl}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 transition-all duration-1000 group-hover:scale-105 pointer-events-none"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: '100% 200%',
          backgroundPosition: night ? 'bottom center' : 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </motion.div>

      {/* NPC Layer */}
      <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {currentNPC && (
            <motion.div
              key={currentNPC.id}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="w-full h-full max-w-4xl mb-[-20px]"
            >
              <NPCDisplay 
                species={currentNPC.race || 'Humanoid'}
                emotion={emotion}
                name={currentNPC.name || 'Traveler'}
                type={currentNPC.class || 'NPC'}
                portraitUrl={portraitUrl}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
