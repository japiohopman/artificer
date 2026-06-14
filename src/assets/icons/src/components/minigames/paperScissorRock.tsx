import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';
import { GameIcon } from '@/src/game_icons';
import { useGameStore } from '@/src/store/useGameStore';

interface PaperScissorRockProps {
  isArena?: boolean;
}

export default function PaperScissorRock({ isArena = false }: PaperScissorRockProps) {
  const { currentNPC, rpsState, characters, activeCharacterId } = useGameStore();
  const { status, userChoice, cpuChoice, countdown, score } = rpsState;

  // ANNOUNCEMENT: The color of the hand is decided by the character's appearance metadata (e.g., character Jason)
  // Skin color is retrieved from the visualTraits.skinTone hexadecimal code.
  const cpuSkinColor = currentNPC.visualTraits?.skinTone || '#d2b48c'; 
  const travelerSkinColor = '#f3c091'; 

  return (
    <div className={`flex flex-col ${isArena ? 'h-full bg-transparent border-none' : 'h-[400px] bg-[#0a0a0c] border border-white/5'} w-full rounded-3xl overflow-hidden font-mono relative`}>
      {/* Header - Only in history mode */}
      {!isArena && (
        <div className="bg-[#111114] p-3 flex items-center justify-between text-white z-20 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bot size={14} className="text-indigo-400" />
            <h1 className="font-bold text-[8px] uppercase tracking-[0.2em] text-indigo-400/80">Ritual Arena</h1>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[7px] text-zinc-500 uppercase font-black tracking-tight">{currentNPC.name.substring(0, 5)}:{score.cpu}</span>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-[7px] text-zinc-500 uppercase font-black tracking-tight">You:{score.user}</span>
          </div>
        </div>
      )}

      {/* Battle Arena */}
      <div className={`flex-1 relative flex flex-col items-center justify-center overflow-hidden ${isArena ? 'bg-transparent' : 'bg-[#0a0a0c]'}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-indigo-500/10 blur-xl scale-[3]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[1px] bg-indigo-500/10 blur-xl scale-[3]" />
            </div>

            <div className="relative w-full flex items-center justify-around px-8">
                {/* CPU Hand */}
                <motion.div
                    animate={status === 'ritual' ? {
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    } : { scale: 1.25 }}
                    transition={status === 'ritual' ? {
                        repeat: Infinity,
                        duration: 0.6,
                        ease: "easeInOut"
                    } : { type: "spring" }}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="text-amber-500 font-mono text-[8px] uppercase font-bold tracking-[0.3em] opacity-40">{currentNPC.name}</div>
                    <div className="relative">
                        {status === 'result' && (
                             <motion.div 
                                 initial={{ scale: 0, opacity: 0 }} 
                                 animate={{ scale: 2.5, opacity: 0.15 }} 
                                 className="absolute inset-0 bg-amber-500 rounded-full blur-2xl" 
                             />
                        )}
                        <GameIcon 
                            name={status === 'ritual' ? 'rock' : (cpuChoice || 'rock')} 
                            size={isArena ? 80 : 40} 
                            color={cpuSkinColor} 
                        />
                    </div>
                </motion.div>

                {/* VS / Countdown */}
                <div className="flex flex-col items-center min-w-[60px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={countdown}
                            initial={{ scale: 3, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.2, opacity: 0, rotate: 20 }}
                            className="text-3xl font-black text-white font-mono italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        >
                            {status === 'result' ? 'VS' : countdown === 0 ? '?' : countdown}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* User Hand */}
                <motion.div
                    animate={status === 'ritual' ? {
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    } : { scale: 1.25 }}
                    transition={status === 'ritual' ? {
                        repeat: Infinity,
                        duration: 0.6,
                        ease: "easeInOut"
                    } : { type: "spring" }}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="text-indigo-400 font-mono text-[8px] uppercase font-bold tracking-[0.3em] opacity-40">Traveler</div>
                    <div className="relative scale-x-[-1]">
                        {status === 'result' && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }} 
                                animate={{ scale: 2.5, opacity: 0.15 }} 
                                className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl" 
                            />
                        )}
                        <GameIcon 
                            name={status === 'ritual' ? 'rock' : (userChoice || 'rock')} 
                            size={isArena ? 80 : 40} 
                            color={travelerSkinColor} 
                        />
                    </div>
                </motion.div>
            </div>

            {/* Status Text Underneath */}
            <div className="mt-8 h-12 flex items-center justify-center">
                {status === 'result' && (
                    <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-black/60 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 shadow-2xl"
                    >
                        <span className="text-white font-black tracking-[0.2em] uppercase text-[10px] flex items-center gap-3">
                           <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                            {userChoice === cpuChoice 
                                ? "Stalemate" 
                                : ((userChoice === 'rock' && cpuChoice === 'scissors') || 
                                   (userChoice === 'paper' && cpuChoice === 'rock') || 
                                   (userChoice === 'scissors' && cpuChoice === 'paper'))
                                    ? "Agreement Secured" 
                                    : "Fates Denied"}
                        </span>
                    </motion.div>
                )}
            </div>
      </div>
    </div>
  );
}
