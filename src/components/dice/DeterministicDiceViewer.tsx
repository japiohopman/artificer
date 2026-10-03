import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import { soundService } from '../../services/soundService';
import { deterministicDiceAdapter, DeterministicDiceParams } from '../../dice_roller/deterministicDiceAdapter';

export interface DeterministicDiceViewerProps {
  sides: number;
  value: number;
  label?: string;
  isRolling?: boolean;
  onComplete?: () => void;
}

export const DeterministicDiceViewer: React.FC<DeterministicDiceViewerProps> = ({
  sides,
  value,
  label = 'Authoritative Roll',
  isRolling = false,
  onComplete
}) => {
  const [animating, setAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState<number | null>(value);

  useEffect(() => {
    // Register adapter presenter
    deterministicDiceAdapter.registerPresenter({
      id: 'css_framer_3d_presenter',
      name: 'CSS 3D Polyhedron & Motion Presenter',
      presentRoll: async (params: DeterministicDiceParams) => {
        setDisplayValue(params.value);
        setAnimating(true);
        soundService.playEffect('DICE_ROLL');
        await new Promise(resolve => setTimeout(resolve, 900));
        setAnimating(false);
        onComplete?.();
      }
    });
  }, [value, onComplete]);

  useEffect(() => {
    if (isRolling) {
      setAnimating(true);
      soundService.playEffect('DICE_ROLL');
      const timer = setTimeout(() => {
        setAnimating(false);
        onComplete?.();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isRolling, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-3 my-2 bg-black/20 rounded border border-dragon-gold/20 shadow-inner">
      <div className="text-[10px] font-black uppercase tracking-widest text-parchment-400 mb-2">
        {label} (d{sides})
      </div>

      <div className="relative w-20 h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {animating ? (
            <motion.div
              key="rolling"
              initial={{ rotateX: 0, rotateY: 0, rotateZ: 0, scale: 0.8, opacity: 0.7 }}
              animate={{
                rotateX: [0, 360, 720, 1080],
                rotateY: [0, 180, 540, 720],
                rotateZ: [0, 90, 270, 360],
                scale: [0.8, 1.15, 0.95, 1],
                opacity: 1
              }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="w-16 h-16 bg-dragon-darkRed border-2 border-dragon-gold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.6)] flex items-center justify-center"
            >
              <GameIcon name="dice" size={32} color="#D4AF37" />
            </motion.div>
          ) : (
            <motion.div
              key="settled"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-16 h-16 bg-gradient-to-br from-dragon-darkRed to-black border-2 border-dragon-gold rounded-lg shadow-[0_0_25px_rgba(212,175,55,0.8)] flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-dragon-gold/10 mix-blend-overlay" />
              <span className="text-3xl font-header font-black text-dragon-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {value}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
