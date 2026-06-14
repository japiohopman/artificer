import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDAndD } from '@fortawesome/free-brands-svg-icons';
import { playClickSound, playSuccessSound, REPO, BRANCH } from '../../services/storageService';
import { soundService } from '../../services/soundService';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';

export const TitleScreen: React.FC = () => {
  const { 
    characters,
    mainCharacterSlots,
    loadCharacters, 
    setActiveCharacter,
    setMainCharacter,
  } = useCharacterStore();

  const {
    isLoadingSaves,
    setIsCharacterCreatorOpen,
    setIsGameStarted,
    isMusicPlaying
  } = useStore();

  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadCharacters();
      setHasLoaded(true);
    };
    init();
  }, [loadCharacters]);

  const handleStartInteraction = () => {
    // Only play if not already playing - prevents overlaps on multiple clicks
    if (!isMusicPlaying) {
      soundService.playMusic('startup');
    }
  };

  const handleNewGame = () => {
    playClickSound();
    setIsCharacterCreatorOpen(true);
    setIsGameStarted(true);
    // Already playing startup music from interaction, but ensure playlist is correct
    soundService.playMusic('startup');
  };

  const handleContinue = () => {
    const selectedChar = selectedSlotIndex !== null ? mainCharacterSlots[selectedSlotIndex] : (mainCharacterSlots.find(c => c !== null) || null);
    
    if (selectedChar) {
      setMainCharacter(selectedChar);
      setActiveCharacter(selectedChar.id);
      playSuccessSound();
      setIsGameStarted(true);
      // Explicitly switch to game playlist - stops previous startup music
      soundService.playMusic('game');
    }
  };

  if (!hasLoaded && isLoadingSaves) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center flex-col gap-4 z-[100]">
        <GameIcon name="loading" size={48} color="#8B0000" className="animate-spin" />
        <p className="font-header text-parchment-400 uppercase tracking-widest animate-pulse">Decrypting Save Data...</p>
      </div>
    );
  }

  const hasAnySaves = mainCharacterSlots.some(s => s !== null);

  return (
    <div 
      className="fixed inset-0 bg-[#0a0a0a] z-[90] flex items-center justify-center overflow-hidden"
      onClick={handleStartInteraction}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-dragon-red/10 via-transparent to-black" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-50" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="w-1 h-1 bg-dragon-gold rounded-full"
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/40" />
            <GameIcon name="magic_effect" size={24} color="#FFFFFF" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/40" />
          </div>
          <h1 className="text-7xl font-elan font-black text-dragon-red tracking-tighter uppercase leading-none mb-4 flex items-center justify-center">
            <span className="ml-[-6px]">Dungeons</span>
            <FontAwesomeIcon 
              icon={faDAndD} 
              className="text-[1.1em] drop-shadow-[0_0_15px_rgba(139,0,0,0.5)] relative z-10 ml-[-3px] mr-[-11px] mb-[16px] pb-0" 
            />
            <span>Dragons</span>
          </h1>
          <p className="text-dragon-gold font-header uppercase tracking-[0.4em] text-xs">
            The Arcane Forge & Database
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6">New Game</h2>
            <button
              onClick={handleNewGame}
              className="w-full group relative overflow-hidden bg-dragon-red py-8 rounded-sm border border-dragon-red/50 shadow-[0_0_30px_rgba(139,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <div className="relative flex items-center justify-center gap-4 text-white">
                <GameIcon name="plus" size={24} color="#FFFFFF" />
                <span className="text-2xl font-header font-black uppercase tracking-widest">New Game</span>
              </div>
            </button>
            <p className="text-[10px] text-parchment-500 opacity-60 text-center px-8">
              "Create a fresh identity in the codex. Existing manifest in chosen slot will be purged."
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6">Continue Adventure</h2>
            
            <div className="grid grid-cols-1 gap-3">
              {mainCharacterSlots.map((char, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (char) {
                      setSelectedSlotIndex(index);
                      playClickSound();
                    }
                  }}
                  disabled={!char}
                  className={`relative p-4 rounded-sm border transition-all flex items-center gap-4 group ${
                    !char ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed' :
                    selectedSlotIndex === index ? 'bg-dragon-red/20 border-dragon-red shadow-[0_0_20px_rgba(139,0,0,0.2)]' :
                    'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="w-12 h-12 bg-black/40 rounded-sm border border-white/5 overflow-hidden shrink-0">
                    {char && (
                      <img 
                        src={char.avatarUrl || `https://raw.githubusercontent.com/${REPO}/${BRANCH}/data/character_save/images/slot${index + 1}/slot${index + 1}_avatar.webp?t=${Date.now()}`} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const slotId = char.id || `slot${index + 1}`;
                          if (!target.src.includes('raw.githubusercontent.com')) {
                            target.src = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/data/character_save/images/${slotId}/${slotId}_avatar.webp?t=${Date.now()}`;
                          } else {
                            target.src = `https://picsum.photos/seed/${slotId}/100/100`;
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-dragon-red/60 uppercase tracking-widest">Slot 0{index + 1}</span>
                      {char && <span className="text-[9px] font-bold text-parchment-500 uppercase tracking-widest">Lvl {char.level}</span>}
                    </div>
                    <h3 className="font-header font-black text-white uppercase tracking-wider truncate">
                      {char ? char.name : 'Empty Slot'}
                    </h3>
                  </div>
                  {selectedSlotIndex === index && (
                    <div className="w-2 h-2 rounded-full bg-dragon-red animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleContinue}
              disabled={!hasAnySaves || selectedSlotIndex === null}
              className="w-full group relative overflow-hidden bg-dragon-gold/10 py-4 rounded-sm border border-dragon-gold/20 transition-all hover:bg-dragon-gold/20 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 mt-4"
            >
              <div className="relative flex items-center justify-center gap-4 text-dragon-gold">
                <GameIcon name="play" size={20} color="#D4AF37" />
                <span className="text-sm font-header font-black uppercase tracking-[0.2em]">Continue Adventure</span>
              </div>
            </button>
          </motion.div>
        </div>

        <div className="mt-16 text-[8px] font-black text-white/10 uppercase tracking-[1em]">
          Version 3.0.0 // Prime Protocol
        </div>
      </div>
    </div>
  );
};
