import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CircleDollarSign, Sparkles, Target, Trophy } from 'lucide-react';
import { GameIcon } from '@/src/game_icons';
import { useGameStore } from '@/src/store/useGameStore';

interface CoinFlipProps {
  isArena?: boolean;
}

export default function CoinFlip({ isArena = false }: CoinFlipProps) {
  const { coinFlipState } = useGameStore();
  const { status, prediction, result, score } = coinFlipState;
  
  const [rotations, setRotations] = useState(0);
  const prevState = useRef(status);

  useEffect(() => {
    if (status === 'tossing' && prevState.current !== 'tossing') {
      const audio = new Audio('https://raw.githubusercontent.com/japiohopman/artificer/main/public/assets/sounds/sfx/coin_swoosh.wav');
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
    prevState.current = status;
  }, [status]);

  useEffect(() => {
    if (status === 'tossing' && result) {
        const extra = result === 'heads' ? 0 : 180;
        const spinCount = 10 + Math.floor(Math.random() * 5); // Faster, more spins
        const nextRotations = rotations + (spinCount * 360) + extra + (360 - (rotations % 360));
        setRotations(nextRotations);
    }
  }, [status, result]);

  return (
    <div className={`flex flex-col ${isArena ? 'h-full bg-transparent border-none' : 'h-[400px] bg-[#0a0a0c] border border-white/5'} w-full rounded-3xl overflow-visible font-mono relative`}>
      {/* Mini Header - Only show in history mode */}
      {!isArena && (
        <div className="bg-[#111114] p-3 flex items-center justify-between text-white z-[110] border-b border-white/5">
          <div className="flex items-center gap-2">
            <CircleDollarSign size={14} className="text-amber-500" />
            <h1 className="font-bold text-[8px] uppercase tracking-[0.2em] text-amber-500/80">Oracle Stage</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-tighter">B:{score.cpu}</span>
              <div className="h-2 w-px bg-white/10" />
              <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-tighter">U:{score.user}</span>
          </div>
        </div>
      )}

      {/* Arena */}
      <div 
        className={`flex-1 ${isArena ? 'bg-transparent' : 'bg-[#0a0a0c]'} flex flex-col relative overflow-visible`}
      >
        <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pb-12 overflow-visible">
                <div className="relative flex flex-col items-center w-full h-full justify-end overflow-visible">
                    {/* Score (Arena Mode Only) */}
                    {isArena && (
                      <div className="absolute top-[280px] right-0 p-4 opacity-50 z-[110]">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black text-amber-500/40 uppercase tracking-widest">Scoreboard</span>
                          <div className="flex gap-4">
                            <div className="text-right">
                              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Oracle</div>
                              <div className="text-xl font-black text-white/40">{score.cpu}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Traveler</div>
                              <div className="text-xl font-black text-white/40">{score.user}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Prediction text during flight - REMOVED, now in NotificationWindow */}

                    {/* Catching Hand */}
                    <motion.div
                        initial={{ opacity: 0, y: 150, x: '-42%', scale: 1.1, rotate: 90, scaleY: -1 }}
                        animate={{ 
                            opacity: status === 'idle' ? 0 : 0.8, 
                            y: status === 'idle' ? 150 : 10, 
                        }}
                        transition={{
                            opacity: { delay: 1.6, duration: 0.1 },
                            y: { 
                                delay: 1.6, 
                                type: "spring", 
                                stiffness: 400, 
                                damping: 15,
                                mass: 0.6 
                            }
                        }}
                        className="absolute bottom-[-20px] left-1/2 z-[90] pointer-events-none"
                    >
                        <GameIcon 
                            name="paper" 
                            size={isArena ? 150 : 100}
                            color="#f3c091" 
                            className="bg-gradient-to-t from-black/20 to-transparent"
                        />
                    </motion.div>

                    <div className="perspective-1000 relative z-[100] overflow-visible">
                        <motion.div
                            initial={{ y: 240, scale: 0.5, opacity: 0 }}
                            animate={status === 'tossing' ? {
                                y: [240, -400, 40], 
                                scale: [0.5, 1.2, 1],
                                opacity: [0, 1, 1]
                            } : status === 'result' ? { y: 40, scale: 1, opacity: 1 } : { y: 240, opacity: 0 }}
                            transition={status === 'tossing' ? {
                                y: {
                                    duration: 2,
                                    times: [0, 0.45, 1],
                                    ease: [0.33, 1, 0.68, 1] 
                                },
                                scale: { duration: 1.8 },
                                opacity: { duration: 0.3 }
                            } : { type: "spring" }}
                            className="flex flex-col items-center overflow-visible"
                        >
                            {/* Reveal Result Bubble - REMOVED, now in NotificationWindow */}

                            <motion.div
                                animate={{ rotateX: rotations }}
                                transition={{ duration: 2, ease: "easeOut" }} // Match Y duration
                                className="preserve-3d"
                                style={{ width: isArena ? '50px' : '36px', height: isArena ? '50px' : '36px' }}
                            >
                                <div className="absolute inset-0 preserve-3d">
                                    <div className="absolute inset-0" style={{ transform: 'translateZ(5px)', backfaceVisibility: 'hidden' }}>
                                        <CoinFace side="heads" size={isArena ? 50 : 36} />
                                    </div>
                                    <div className="absolute inset-0" style={{ transform: 'rotateX(180deg) translateZ(5px)', backfaceVisibility: 'hidden' }}>
                                        <CoinFace side="tails" size={isArena ? 50 : 36} />
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-amber-600 shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]" style={{ transform: 'translateZ(0px)' }} />
                                    <div className="absolute inset-0 rounded-full bg-amber-700" style={{ transform: 'translateZ(2px)' }} />
                                    <div className="absolute inset-0 rounded-full bg-amber-700" style={{ transform: 'translateZ(-2px)' }} />
                                    <div className="absolute inset-0 rounded-full bg-amber-800" style={{ transform: 'translateZ(-4px)' }} />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
}

function CoinFace({ side, size = 50 }: { side: 'heads' | 'tails', size?: number }) {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-amber-600 to-amber-400 rounded-full border border-amber-200/50 overflow-hidden shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none" />
        <GameIcon 
            name={side} 
            size={Math.floor(size * 0.6)} 
            color="#451a03" 
            className="drop-shadow-sm opacity-90" 
        />
    </div>
  );
}
