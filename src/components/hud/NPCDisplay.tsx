import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import { Emotion } from '../../store/useStore';

interface NPCDisplayProps {
  species: string;
  emotion: Emotion;
  name: string;
  type: string;
  portraitUrl?: string;
  isLoading?: boolean;
  isError?: boolean;
  onGenerate?: () => void;
  onError?: () => void;
  isSaving?: boolean;
  minimal?: boolean;
  banner?: boolean;
  customRow?: number;
  customCol?: number;
}

const EMOTION_INDEX_MAP: Record<Emotion, number> = {
  Neutral: 0, Curious: 1, Skeptical: 2,
  Happy: 3, Greedy: 4, Angry: 5,
  Sad: 6, Surprised: 7, Proud: 8
};

export const NPCDisplay: React.FC<NPCDisplayProps> = ({ species, emotion, name, type, portraitUrl, isLoading, isError, onGenerate, onError, isSaving, minimal, banner, customRow, customCol }) => {
  // Robust matrix detection
  const isMatrix = 
    portraitUrl?.includes('_matrix') || 
    portraitUrl?.includes('sprite') || 
    portraitUrl?.startsWith('data:image') ||
    ((portraitUrl?.includes('/assets/npcs/') || portraitUrl?.includes('/assets/images/npcs/') || portraitUrl?.includes('/assets/atlas/')) && 
     (portraitUrl?.endsWith('.webp') || portraitUrl?.endsWith('.png')));
  
  // Default to 3x3 grid
  const cols = 3;
  const rows = 3;
  
  const cellIndex = EMOTION_INDEX_MAP[emotion] ?? 0;
  const row = customRow ?? Math.floor(cellIndex / cols);
  const col = customCol ?? (cellIndex % cols);

  // Precise background-position calculation for N cells
  const posX = (col / (cols - 1)) * 100;
  const posY = (row / (rows - 1)) * 100;

  if (banner) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={portraitUrl || (isLoading ? 'loading' : 'ready')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-none animate-spin" />
              </div>
            ) : portraitUrl ? (
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${portraitUrl})`,
                  backgroundSize: isMatrix ? `${cols * 100}% ${rows * 100}%` : 'cover',
                  backgroundPosition: isMatrix ? `${posX}% ${posY}%` : 'center 20%',
                  backgroundRepeat: 'no-repeat',
                  filter: 'contrast(1.1) brightness(0.8) saturate(1.1) blur(2px)',
                  opacity: 0.6
                }}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (minimal) {
    return (
      <div className="relative w-full h-full overflow-hidden aspect-square">
        <AnimatePresence mode="wait">
          <motion.div
            key={portraitUrl || (isLoading ? 'loading' : 'ready')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/40">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-none animate-spin" />
              </div>
            ) : portraitUrl ? (
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${portraitUrl})`,
                  backgroundSize: isMatrix ? `${cols * 100}% ${rows * 100}%` : 'contain',
                  backgroundPosition: isMatrix ? `${posX}% ${posY}%` : 'center bottom',
                  backgroundRepeat: 'no-repeat',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5)) contrast(1.1) brightness(1.1)',
                  transform: isMatrix ? 'scale(1.1)' : 'none',
                  transformOrigin: 'bottom center',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900/40">
                <GameIcon name="message_square" className="text-white/10" size={32} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-end h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={portraitUrl || (isLoading ? 'loading' : 'ready')}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -10 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full flex items-end justify-center"
        >
          <div className="relative z-10 w-full h-full flex items-end justify-center">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-black/20 rounded-t-md">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-emerald-400/60 font-mono text-[8px] uppercase tracking-widest animate-pulse">Summoning...</p>
              </div>
            ) : portraitUrl ? (
              <div className="relative w-full h-full flex items-end justify-center overflow-hidden rounded-t-md">
                <div 
                  className="h-full aspect-[4/3]"
                  style={{
                    backgroundImage: `url(${portraitUrl})`,
                    backgroundSize: isMatrix ? `${cols * 100}% ${rows * 100}%` : 'contain',
                    backgroundPosition: isMatrix ? `${posX}% ${posY}%` : 'center bottom',
                    backgroundRepeat: 'no-repeat',
                    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5)) contrast(1.1) brightness(1.05)',
                    transform: isMatrix ? 'scale(0.85)' : 'none',
                    transformOrigin: 'bottom center',
                  }}
                />
                {isSaving && (
                  <div className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 flex items-center space-x-2 rounded-md">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">Saving...</span>
                  </div>
                )}
              </div>
            ) : (isError || !portraitUrl) && onGenerate ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-black/40 backdrop-blur-sm rounded-t-md p-8 text-center border border-white/5">
                <GameIcon name="shield_alert" className="text-amber-500/60" size={24} />
                <p className="text-white/40 text-[9px] uppercase tracking-widest leading-relaxed">
                  Portrait data missing.<br/>Generate from description?
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerate();
                  }}
                  className="flex items-center space-x-2 bg-emerald-500/80 hover:bg-emerald-400 text-black px-4 py-2 rounded-md font-bold text-[9px] uppercase tracking-widest transition-all pointer-events-auto shadow-lg"
                >
                  <GameIcon name="sparkles" size={12} />
                  <span>Generate</span>
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-t-md bg-white/5">
                <div className="w-32 h-32 rounded-md border border-white/10 flex items-center justify-center">
                  <GameIcon name="message_square" className="text-white/20" size={48} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
