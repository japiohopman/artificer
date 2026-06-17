import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../../store/useStore';
import { useWorldStore } from '../../../store/useWorldStore';
import { GameIcon } from '../../../game_icons';

const CAMPFIRE_IMAGE = 'https://gen.krea.ai/images/24562ed5-d072-4af4-936f-9d2d513503b5.png';

export const Rest: React.FC = () => {
  const { setCurrentView } = useStore();
  const { gameTime, gameDay, advanceTime } = useWorldStore();
  const [isResting, setIsResting] = useState(false);
  const [restType, setRestType] = useState<'short' | 'long' | null>(null);

  const handleRest = async (hours: number, type: 'short' | 'long') => {
    setIsResting(true);
    setRestType(type);

    // Simulate resting animation duration
    const animationDuration = 3000;
    const start = Date.now();

    const animateTime = () => {
      const now = Date.now();
      const elapsed = now - start;
      const progress = Math.min(elapsed / animationDuration, 1);

      // In a real game we might want to advance time incrementally for visual effect
      // But for now we just do a smooth transition at the end or split it.
      
      if (progress < 1) {
        requestAnimationFrame(animateTime);
      } else {
        finishRest(hours);
      }
    };

    requestAnimationFrame(animateTime);
  };

  const finishRest = async (hours: number) => {
    const minutes = hours * 60;
    advanceTime(minutes);
    
    setIsResting(false);
    setRestType(null);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-stone-950">
      {/* Background Image with Ambient Glow */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={CAMPFIRE_IMAGE} 
          alt="Campfire" 
          className="w-full h-full object-cover brightness-[0.4] saturate-[0.8]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
      </motion.div>

      {/* Atmospheric Particles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-orange-950/20 blur-[120px] animate-pulse" />
      </div>

      <AnimatePresence>
        {!isResting ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-20 flex flex-col items-center gap-8 max-w-md w-full px-6"
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-px w-12 bg-dragon-red/30" />
                <span className="text-[10px] font-bold text-dragon-red uppercase tracking-[0.4em]">The Long Road</span>
                <div className="h-px w-12 bg-dragon-red/30" />
              </div>
              <h2 className="text-5xl font-header text-parchment-100 tracking-tight italic">Campfire Rest</h2>
              <p className="text-parchment-300 text-sm font-body tracking-wide">
                The flames crackle softly as the world drifts into shadow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <button
                onClick={() => handleRest(3, 'short')}
                className="group relative flex flex-col items-center gap-4 p-8 bg-parchment-50/10 backdrop-blur-xl border border-white/10 rounded hover:bg-parchment-50/20 transition-all hover:border-dragon-red/50 hover:-translate-y-1"
              >
                <div className="p-4 bg-dragon-red/20 rounded text-dragon-red group-hover:scale-110 transition-transform">
                  <GameIcon name="coffee" size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">Short Rest</h3>
                  <p className="text-[10px] font-bold text-dragon-red uppercase tracking-widest leading-none">+3 Hours</p>
                </div>
              </button>

              <button
                onClick={() => handleRest(8, 'long')}
                className="group relative flex flex-col items-center gap-4 p-8 bg-parchment-50/10 backdrop-blur-xl border border-white/10 rounded hover:bg-parchment-50/20 transition-all hover:border-dragon-red/50 hover:-translate-y-1"
              >
                <div className="p-4 bg-dragon-red/20 rounded text-dragon-gold group-hover:scale-110 transition-transform">
                  <GameIcon name="bed" size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">Long Rest</h3>
                  <p className="text-[10px] font-bold text-dragon-gold uppercase tracking-widest leading-none">+8 Hours</p>
                </div>
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-parchment-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <GameIcon name="magic_effect" size={12} className="text-dragon-red/40" />
                Your strength returns in the quiet moments
              </div>
              
              <button 
                onClick={() => setCurrentView('atlas')}
                className="mt-4 px-6 py-2 bg-dragon-red hover:bg-dragon-darkRed text-white rounded font-bold uppercase tracking-[0.2em] transition-all shadow-md"
              >
                Return to Atlas
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-30 flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-2 border-dashed border-amber-500/20 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <GameIcon name="loading" size={40} className="text-amber-500 animate-spin" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif text-white italic tracking-wide">
                {restType === 'short' ? 'Brief Respite...' : 'Drifting into Slumber...'}
              </h3>
              <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
                Time is Ebbing
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
