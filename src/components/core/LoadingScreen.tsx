import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../../store/useUIStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

const ART_ASSETS = [
  '/assets/images/game_art/rule_book/rule_book_1.webp',
  '/assets/images/game_art/rule_book/rule_book_2.webp',
  '/assets/images/game_art/rule_book/rule_book_3.webp',
  '/assets/images/game_art/rule_book/rule_book_4.webp',
  '/assets/images/game_art/rule_book/rule_book_5.webp',
  '/assets/images/game_art/adventuring/adventuring_1.webp',
  '/assets/images/game_art/adventuring/adventuring_2.webp',
  '/assets/images/game_art/adventuring/adventuring_3.webp',
  '/assets/images/game_art/adventuring/adventuring_4.webp',
];

export const LoadingScreen: React.FC = () => {
  const { isLoading, loadingMessage, loadingArt } = useUIStore();
  const [currentArtIndex, setCurrentArtIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // Pick a random art for each loading session if none specified
      setCurrentArtIndex(Math.floor(Math.random() * ART_ASSETS.length));
    }
  }, [isLoading]);

  const activeArt = loadingArt || ART_ASSETS[currentArtIndex];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Art with Zooming Animation */}
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img
              src={activeArt}
              alt="Loading Art"
              className="w-full h-full object-cover grayscale opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-2 border-dashed border-dragon-gold/30 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <GameIcon name="loading" size={40} className="text-dragon-gold animate-spin" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-dragon-gold/30" />
                <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.4em]">Chronicles of Artificer</span>
                <div className="h-px w-8 bg-dragon-gold/30" />
              </div>

              <h2 className="text-3xl font-header text-white uppercase tracking-widest drop-shadow-2xl">
                {loadingMessage}
              </h2>

              <p className="text-parchment-400 text-xs italic font-serif max-w-xs mx-auto opacity-60">
                The threads of fate are weaving together...
              </p>
            </div>

            {/* Decorative corners */}
            <div className="absolute -top-12 -left-12 w-24 h-24 border-l-2 border-t-2 border-dragon-gold/20" />
            <div className="absolute -top-12 -right-12 w-24 h-24 border-r-2 border-t-2 border-dragon-gold/20" />
            <div className="absolute -bottom-12 -left-12 w-24 h-24 border-l-2 border-b-2 border-dragon-gold/20" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 border-r-2 border-b-2 border-dragon-gold/20" />
          </div>

          {/* Progress bar (aesthetic only for now) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-dragon-gold to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
