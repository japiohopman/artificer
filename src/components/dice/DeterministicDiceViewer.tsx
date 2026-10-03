import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import { soundService } from '../../services/soundService';
import { deterministicDiceAdapter, DeterministicDiceParams } from '../../dice_roller/deterministicDiceAdapter';

export interface DeterministicDiceViewerProps {
  sides: number;
  value: number;
  label?: string;
  onComplete?: () => void;
}

export const DeterministicDiceViewer: React.FC<DeterministicDiceViewerProps> = ({
  sides,
  value,
  label = 'Authoritative Roll',
  onComplete
}) => {
  const [animating, setAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    const presenterId = `deterministic_css3d_presenter_${Math.random().toString(36).substr(2, 9)}`;

    deterministicDiceAdapter.registerPresenter({
      id: presenterId,
      name: 'CSS 3D Polyhedron & Motion Presenter',
      presentRoll: async (params: DeterministicDiceParams) => {
        setDisplayValue(params.value);
        setAnimating(true);
        soundService.playEffect('DICE_ROLL');
        await new Promise(resolve => setTimeout(resolve, 850));
        setAnimating(false);
        onComplete?.();
      }
    });

    return () => {
      deterministicDiceAdapter.unregisterPresenter(presenterId);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-3 my-2 bg-black/20 rounded border border-dragon-gold/20 shadow-inner">
      <div className="text-[10px] font-black uppercase tracking-widest text-parchment-400 mb-2">
        {label} (d{sides})
      </div>

      <div className="relative w-24 h-24 flex items-center justify-center [perspective:800px]">
        <AnimatePresence mode="wait">
          {animating ? (
            <motion.div
              key="rolling-3d"
              initial={{ rotateX: 0, rotateY: 0, rotateZ: 0, scale: 0.7 }}
              animate={{
                rotateX: [0, 360, 720, 1080],
                rotateY: [0, 180, 540, 720],
                rotateZ: [0, 90, 270, 360],
                scale: [0.7, 1.15, 0.95, 1],
                opacity: [0.8, 1, 1, 1]
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="w-16 h-16 bg-gradient-to-br from-dragon-red via-dragon-darkRed to-black border-2 border-dragon-gold rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.7)] flex items-center justify-center [transform-style:preserve-3d]"
            >
              <GameIcon name="dice" size={32} color="#D4AF37" />
            </motion.div>
          ) : (
            <motion.div
              key={`settled-3d-${displayValue}`}
              initial={{ scale: 0.7, rotateX: -30, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              className="w-16 h-16 bg-gradient-to-br from-dragon-darkRed to-black border-2 border-dragon-gold rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.9)] flex items-center justify-center relative overflow-hidden [transform-style:preserve-3d]"
            >
              {/* Inner ambient glow & parchment texture */}
              <div className="absolute inset-0 bg-dragon-gold/15 mix-blend-overlay pointer-events-none" />

              {/* Corner accent rivets */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-dragon-gold rounded-full opacity-80" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-dragon-gold rounded-full opacity-80" />
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-dragon-gold rounded-full opacity-80" />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-dragon-gold rounded-full opacity-80" />

              {/* Authoritative display value */}
              <span className="text-3xl font-header font-black text-dragon-gold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tabular-nums">
                {displayValue}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
