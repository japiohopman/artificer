import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundService } from '../../services/soundService';
import { deterministicDiceAdapter, DeterministicDiceParams } from '../../dice_roller/deterministicDiceAdapter';

export interface DeterministicDiceViewerProps {
  sides: number;
  value: number;
  label?: string;
  onComplete?: () => void;
}

const PRESENTER_ID = 'css_3d_polyhedron_presenter';

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
    deterministicDiceAdapter.registerPresenter({
      id: PRESENTER_ID,
      name: 'CSS 3D Polyhedron Presenter',
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
      deterministicDiceAdapter.unregisterPresenter(PRESENTER_ID);
    };
  }, [onComplete]);

  // Compute adjacent face values deterministically for 3D polyhedron depth
  const backValue = Math.max(1, (sides + 1) - displayValue);
  const topValue = ((displayValue % sides) + 1);
  const bottomValue = (((displayValue + 2) % sides) + 1);
  const rightValue = (((displayValue + 3) % sides) + 1);
  const leftValue = (((displayValue + 4) % sides) + 1);

  return (
    <div className="flex flex-col items-center justify-center p-3 my-2 bg-black/20 rounded border border-dragon-gold/20 shadow-inner">
      <div className="text-[10px] font-black uppercase tracking-widest text-parchment-400 mb-2">
        {label} (d{sides})
      </div>

      <div className="relative w-28 h-28 flex items-center justify-center [perspective:800px]">
        <AnimatePresence mode="wait">
          {animating ? (
            <motion.div
              key="rolling-polyhedron-3d"
              initial={{ rotateX: 0, rotateY: 0, rotateZ: 0, scale: 0.7 }}
              animate={{
                rotateX: [0, 360, 720, 1080],
                rotateY: [0, 180, 540, 720],
                rotateZ: [0, 90, 270, 360],
                scale: [0.7, 1.15, 0.95, 1],
                opacity: [0.8, 1, 1, 1]
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="w-16 h-16 relative [transform-style:preserve-3d]"
            >
              {/* Face 1: Front */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-red via-dragon-darkRed to-black border-2 border-dragon-gold rounded shadow-lg flex items-center justify-center [transform:translateZ(32px)]">
                <span className="text-xl font-header font-black text-dragon-gold">{displayValue}</span>
              </div>
              {/* Face 2: Back */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-darkRed to-black border-2 border-dragon-gold rounded shadow-lg flex items-center justify-center [transform:rotateY(180deg)_translateZ(32px)]">
                <span className="text-xl font-header font-black text-dragon-gold/70">{backValue}</span>
              </div>
              {/* Face 3: Right */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-red to-black border-2 border-dragon-gold rounded shadow-lg flex items-center justify-center [transform:rotateY(90deg)_translateZ(32px)]">
                <span className="text-xl font-header font-black text-dragon-gold/70">{rightValue}</span>
              </div>
              {/* Face 4: Left */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-darkRed to-black border-2 border-dragon-gold rounded shadow-lg flex items-center justify-center [transform:rotateY(-90deg)_translateZ(32px)]">
                <span className="text-xl font-header font-black text-dragon-gold/70">{leftValue}</span>
              </div>
              {/* Face 5: Top */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-red to-black border-2 border-dragon-gold rounded shadow-lg flex items-center justify-center [transform:rotateX(90deg)_translateZ(32px)]">
                <span className="text-xl font-header font-black text-dragon-gold/70">{topValue}</span>
              </div>
              {/* Face 6: Bottom */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-darkRed to-black border-2 border-dragon-gold rounded shadow-lg flex items-center justify-center [transform:rotateX(-90deg)_translateZ(32px)]">
                <span className="text-xl font-header font-black text-dragon-gold/70">{bottomValue}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`settled-polyhedron-3d-${displayValue}`}
              initial={{ scale: 0.7, rotateX: -25, rotateY: 25, opacity: 0 }}
              animate={{ scale: 1, rotateX: -12, rotateY: 15, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              className="w-16 h-16 relative [transform-style:preserve-3d]"
            >
              {/* True 3D Settled Polyhedron Die - Front Face displaying authoritative roll */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-darkRed via-black to-dragon-darkRed border-2 border-dragon-gold rounded shadow-[0_0_20px_rgba(212,175,55,0.8)] flex items-center justify-center relative overflow-hidden [transform:translateZ(32px)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-dragon-gold/20 to-white/10 pointer-events-none" />
                <span className="text-3xl font-header font-black text-dragon-gold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tabular-nums relative z-10">
                  {displayValue}
                </span>
              </div>

              {/* 3D Polyhedron Top Bevel Face */}
              <div className="absolute inset-0 bg-gradient-to-br from-dragon-darkRed to-stone-900 border border-dragon-gold/60 rounded flex items-center justify-center [transform:rotateX(90deg)_translateZ(32px)] opacity-90">
                <span className="text-xs font-header font-bold text-dragon-gold/50">{topValue}</span>
              </div>

              {/* 3D Polyhedron Right Bevel Face */}
              <div className="absolute inset-0 bg-gradient-to-br from-stone-950 to-dragon-darkRed border border-dragon-gold/60 rounded flex items-center justify-center [transform:rotateY(90deg)_translateZ(32px)] opacity-85">
                <span className="text-xs font-header font-bold text-dragon-gold/50">{rightValue}</span>
              </div>

              {/* 3D Polyhedron Bottom Bevel Face */}
              <div className="absolute inset-0 bg-black border border-dragon-gold/40 rounded flex items-center justify-center [transform:rotateX(-90deg)_translateZ(32px)] opacity-70">
                <span className="text-xs font-header font-bold text-dragon-gold/30">{bottomValue}</span>
              </div>

              {/* 3D Polyhedron Left Bevel Face */}
              <div className="absolute inset-0 bg-black border border-dragon-gold/40 rounded flex items-center justify-center [transform:rotateY(-90deg)_translateZ(32px)] opacity-70">
                <span className="text-xs font-header font-bold text-dragon-gold/30">{leftValue}</span>
              </div>

              {/* 3D Polyhedron Back Face */}
              <div className="absolute inset-0 bg-black border border-dragon-gold/20 rounded flex items-center justify-center [transform:rotateY(180deg)_translateZ(32px)] opacity-50">
                <span className="text-xs font-header font-bold text-dragon-gold/20">{backValue}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
