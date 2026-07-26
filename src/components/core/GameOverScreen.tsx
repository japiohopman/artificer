import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { soundService } from '../../services/soundService';
import { playClickSound, playSuccessSound } from '../../services/storageService';
import { GameIcon } from '../../game_icons';

export const GameOverScreen: React.FC = () => {
  const { loadCharacters, activeCharacterId, setMainCharacter, setActiveCharacter } = useCharacterStore();
  const { setIsLoading, setIsGameOver, setGameMode } = useUIStore();
  const { setIsGameStarted } = useGameStore();

  useEffect(() => {
    // Play error sound and transition to startup ambient music on game over
    soundService.playEffect('UI_ERROR');
    soundService.playMusic('startup');
  }, []);

  const handleLoadLastSave = async () => {
    playClickSound();
    setIsLoading(true, "Terugspoelen naar laatste save...");
    try {
      // 1. Load saved characters from slots/local templates
      await loadCharacters();

      const freshSlots = useCharacterStore.getState().mainCharacterSlots;
      // 2. Identify the active slot character or fall back to any available
      const targetChar = freshSlots.find(c => c && c.id === activeCharacterId) || freshSlots.find(c => c !== null);

      if (targetChar) {
        setMainCharacter(targetChar);
        setActiveCharacter(targetChar.id);

        // 3. Clear combat state and restore to exploration
        useGameStore.setState(state => ({
          combatState: {
            ...state.combatState,
            monsters: [],
            initiativeOrder: [],
            activeTurnIndex: 0,
            activeConditions: {}
          }
        }));

        setGameMode('exploration');
        setIsGameOver(false);
        playSuccessSound();
        soundService.playMusic('game');
      } else {
        alert("Geen geldig opslagbestand gevonden!");
      }
    } catch (e) {
      console.error("Save restoration failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuitToTitle = () => {
    playClickSound();
    // Reset states
    useGameStore.setState(state => ({
      combatState: {
        ...state.combatState,
        monsters: [],
        initiativeOrder: [],
        activeTurnIndex: 0,
        activeConditions: {}
      }
    }));
    setGameMode('exploration');
    setIsGameOver(false);
    setIsGameStarted(false);
    soundService.playMusic('startup');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Dark Vignette & Dynamic Deep Red Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/20 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none mix-blend-overlay" />

      {/* Floating ash particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 50,
              opacity: 0,
              scale: 0.5 + Math.random() * 0.8
            }}
            animate={{
              y: -100,
              x: `+= ${Math.sin(i) * 50}`,
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 6
            }}
            className="w-1.5 h-1.5 bg-red-700/60 rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="p-4 bg-red-950/20 border-2 border-red-900/30 rounded-full shadow-[0_0_50px_rgba(139,0,0,0.3)] mb-4 inline-block">
            <GameIcon name="skull" size={48} className="text-red-600 animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl font-elan font-black tracking-tighter text-red-700 uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-3">
            UW GEZELSCHAP IS GESNEUVELD
          </h1>
          <p className="text-dragon-gold font-header uppercase tracking-[0.3em] text-xs max-w-md leading-relaxed">
            De kerker heeft uw voortgang opgeëist. Uw zielen dwalen nu rond in de diepten van de vergetelheid.
          </p>
        </motion.div>

        {/* Buttons Layer */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full space-y-4 max-w-xs"
        >
          <button
            onClick={handleLoadLastSave}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 text-white font-header font-bold text-sm uppercase py-4 px-6 rounded-sm border border-red-700/40 shadow-[0_4px_20px_rgba(139,0,0,0.4)] transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3"
          >
            <GameIcon name="refresh" size={16} color="#FFFFFF" />
            Laad Laatste Save
          </button>

          <button
            onClick={handleQuitToTitle}
            className="w-full relative group overflow-hidden bg-stone-900 hover:bg-stone-850 text-white/70 hover:text-white font-header font-bold text-xs uppercase py-3.5 px-6 rounded-sm border border-stone-800 shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
          >
            <GameIcon name="close" size={14} color="currentColor" />
            Terug naar Hoofdmenu
          </button>
        </motion.div>
      </div>

      {/* Subtle outer vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.95)]" />
    </motion.div>
  );
};
