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

  const getFaceValues = (totalSides: number, primary: number) => {
    const vals: number[] = [primary];
    for (let i = 1; i < totalSides; i++) {
      vals.push(((primary + i - 1) % totalSides) + 1);
    }
    return vals;
  };

  const faceValues = getFaceValues(sides, displayValue);

  const renderGeometry = (sidesCount: number) => {
    if (sidesCount <= 6) {
      // d6: Cube (6 Square Faces)
      return (
        <div className="w-16 h-16 relative [transform-style:preserve-3d]">
          {/* Front Face */}
          <div className="absolute inset-0 bg-gradient-to-br from-dragon-darkRed via-black to-dragon-darkRed border-2 border-dragon-gold rounded shadow-lg flex items-center justify-center [transform:translateZ(32px)]">
            <span className="text-2xl font-header font-black text-dragon-gold drop-shadow-md">{faceValues[0]}</span>
          </div>
          {/* Back Face */}
          <div className="absolute inset-0 bg-stone-900 border-2 border-dragon-gold/60 rounded flex items-center justify-center [transform:rotateY(180deg)_translateZ(32px)]">
            <span className="text-xs font-header font-bold text-dragon-gold/40">{faceValues[1]}</span>
          </div>
          {/* Right Face */}
          <div className="absolute inset-0 bg-stone-900 border-2 border-dragon-gold/60 rounded flex items-center justify-center [transform:rotateY(90deg)_translateZ(32px)]">
            <span className="text-xs font-header font-bold text-dragon-gold/40">{faceValues[2]}</span>
          </div>
          {/* Left Face */}
          <div className="absolute inset-0 bg-stone-900 border-2 border-dragon-gold/60 rounded flex items-center justify-center [transform:rotateY(-90deg)_translateZ(32px)]">
            <span className="text-xs font-header font-bold text-dragon-gold/40">{faceValues[3]}</span>
          </div>
          {/* Top Face */}
          <div className="absolute inset-0 bg-stone-900 border-2 border-dragon-gold/60 rounded flex items-center justify-center [transform:rotateX(90deg)_translateZ(32px)]">
            <span className="text-xs font-header font-bold text-dragon-gold/40">{faceValues[4]}</span>
          </div>
          {/* Bottom Face */}
          <div className="absolute inset-0 bg-stone-900 border-2 border-dragon-gold/60 rounded flex items-center justify-center [transform:rotateX(-90deg)_translateZ(32px)]">
            <span className="text-xs font-header font-bold text-dragon-gold/40">{faceValues[5]}</span>
          </div>
        </div>
      );
    }

    if (sidesCount <= 8) {
      // d8: Octahedron (8 Triangular Faces)
      const topAngles = [0, 90, 180, 270];
      const botAngles = [0, 90, 180, 270];
      return (
        <div className="w-16 h-16 relative [transform-style:preserve-3d]">
          {/* Upper 4 Triangular Faces */}
          {topAngles.map((angle, idx) => (
            <div
              key={`d8-top-${idx}`}
              style={{
                transform: `rotateY(${angle}deg) rotateX(35deg) translateZ(22px)`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}
              className={`absolute inset-0 border border-dragon-gold/80 flex items-center justify-center ${
                idx === 0
                  ? 'bg-gradient-to-br from-dragon-darkRed via-black to-dragon-darkRed z-10'
                  : 'bg-stone-900/90'
              }`}
            >
              <span className={`font-header font-black ${idx === 0 ? 'text-2xl text-dragon-gold drop-shadow-md' : 'text-xs text-dragon-gold/40'}`}>
                {faceValues[idx]}
              </span>
            </div>
          ))}
          {/* Lower 4 Triangular Faces */}
          {botAngles.map((angle, idx) => (
            <div
              key={`d8-bot-${idx}`}
              style={{
                transform: `rotateY(${angle}deg) rotateX(145deg) translateZ(22px)`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}
              className="absolute inset-0 bg-stone-950 border border-dragon-gold/40 flex items-center justify-center"
            >
              <span className="text-xs font-header font-bold text-dragon-gold/30">
                {faceValues[idx + 4]}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (sidesCount <= 10) {
      // d10: Decahedron / Pentagonal Trapezohedron (10 Kite Faces)
      const topAngles = [0, 72, 144, 216, 288];
      const botAngles = [36, 108, 180, 252, 324];
      return (
        <div className="w-16 h-16 relative [transform-style:preserve-3d]">
          {/* Upper 5 Kite Faces */}
          {topAngles.map((angle, idx) => (
            <div
              key={`d10-top-${idx}`}
              style={{
                transform: `rotateY(${angle}deg) rotateX(32deg) translateZ(24px)`,
                clipPath: 'polygon(50% 0%, 100% 40%, 50% 100%, 0% 40%)'
              }}
              className={`absolute inset-0 border border-dragon-gold/80 flex items-center justify-center ${
                idx === 0
                  ? 'bg-gradient-to-br from-dragon-darkRed via-black to-dragon-darkRed z-10'
                  : 'bg-stone-900/90'
              }`}
            >
              <span className={`font-header font-black ${idx === 0 ? 'text-2xl text-dragon-gold drop-shadow-md' : 'text-xs text-dragon-gold/40'}`}>
                {faceValues[idx]}
              </span>
            </div>
          ))}
          {/* Lower 5 Kite Faces */}
          {botAngles.map((angle, idx) => (
            <div
              key={`d10-bot-${idx}`}
              style={{
                transform: `rotateY(${angle}deg) rotateX(148deg) translateZ(24px)`,
                clipPath: 'polygon(50% 0%, 100% 40%, 50% 100%, 0% 40%)'
              }}
              className="absolute inset-0 bg-stone-950 border border-dragon-gold/40 flex items-center justify-center"
            >
              <span className="text-xs font-header font-bold text-dragon-gold/30">
                {faceValues[idx + 5]}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // d12+: Dodecahedron (12 Pentagonal Faces)
    const ringAngles = [0, 72, 144, 216, 288];
    const lowerAngles = [36, 108, 180, 252, 324];
    return (
      <div className="w-16 h-16 relative [transform-style:preserve-3d]">
        {/* Front Pentagonal Face */}
        <div
          style={{
            transform: 'translateZ(30px)',
            clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
          }}
          className="absolute inset-0 bg-gradient-to-br from-dragon-darkRed via-black to-dragon-darkRed border-2 border-dragon-gold flex items-center justify-center z-10"
        >
          <span className="text-2xl font-header font-black text-dragon-gold drop-shadow-md">{faceValues[0]}</span>
        </div>
        {/* Upper Ring (5 Pentagons) */}
        {ringAngles.map((angle, idx) => (
          <div
            key={`d12-ring-${idx}`}
            style={{
              transform: `rotateY(${angle}deg) rotateX(63.4deg) translateZ(30px)`,
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
            className="absolute inset-0 bg-stone-900 border border-dragon-gold/60 flex items-center justify-center"
          >
            <span className="text-xs font-header font-bold text-dragon-gold/40">{faceValues[idx + 1]}</span>
          </div>
        ))}
        {/* Lower Ring (5 Pentagons) */}
        {lowerAngles.map((angle, idx) => (
          <div
            key={`d12-lower-${idx}`}
            style={{
              transform: `rotateY(${angle}deg) rotateX(116.6deg) translateZ(30px)`,
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
            className="absolute inset-0 bg-stone-950 border border-dragon-gold/40 flex items-center justify-center"
          >
            <span className="text-xs font-header font-bold text-dragon-gold/30">{faceValues[idx + 6]}</span>
          </div>
        ))}
        {/* Back Pentagonal Face */}
        <div
          style={{
            transform: 'rotateY(180deg) translateZ(30px)',
            clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
          }}
          className="absolute inset-0 bg-black border border-dragon-gold/20 flex items-center justify-center opacity-40"
        >
          <span className="text-xs font-header font-bold text-dragon-gold/20">{faceValues[11]}</span>
        </div>
      </div>
    );
  };

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
              {renderGeometry(sides)}
            </motion.div>
          ) : (
            <motion.div
              key={`settled-polyhedron-3d-${displayValue}`}
              initial={{ scale: 0.7, rotateX: -25, rotateY: 15, opacity: 0 }}
              animate={{ scale: 1, rotateX: -10, rotateY: 10, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              className="w-16 h-16 relative [transform-style:preserve-3d]"
            >
              {renderGeometry(sides)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
