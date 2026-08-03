import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDAndD } from '@fortawesome/free-brands-svg-icons';
import { playClickSound, playSuccessSound, REPO, BRANCH } from '../../services/storageService';
import { soundService } from '../../services/soundService';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useAudioStore } from '../../store/useAudioStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';

export const TitleScreen: React.FC = () => {
  const { 
    characters,
    mainCharacterSlots,
    loadCharacters, 
    setActiveCharacter,
    setMainCharacter,
    isLoadingSaves,
  } = useCharacterStore();

  const {
    setIsCharacterCreatorOpen,
    setIsLoading,
  } = useUIStore();

  const { setIsGameStarted } = useGameStore();

  const { isMusicPlaying } = useAudioStore();

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true, "Decrypting Save Data...");
      try {
        await loadCharacters();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadCharacters, setIsLoading]);

  const handleStartInteraction = () => {
    // Only play if not already playing - prevents overlaps on multiple clicks
    if (!isMusicPlaying) {
      soundService.playMusic('startup');
    }
  };

  const handleNewGame = () => {
    playClickSound();
    setIsLoading(true, "Entering Realm...");
    setIsCharacterCreatorOpen(true);
    setIsGameStarted(true);
    // Already playing startup music from interaction, but ensure playlist is correct
    soundService.playMusic('startup');
  };

  const handleContinue = () => {
    const selectedChar = selectedSlotIndex !== null ? mainCharacterSlots[selectedSlotIndex] : (mainCharacterSlots.find(c => c !== null) || null);
    
    if (selectedChar) {
      setIsLoading(true, "Entering Realm...");
      setMainCharacter(selectedChar);
      setActiveCharacter(selectedChar.id);
      playSuccessSound();
      setIsGameStarted(true);
      // Explicitly switch to game playlist - stops previous startup music
      soundService.playMusic('game');
    }
  };

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

        {/* Horizontal Character Slots (3 slots) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {mainCharacterSlots.map((char, index) => {
            const isSelected = selectedSlotIndex === index;
            const hasCharacter = !!char;
            const portraitUrl = char?.imageUrl || `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/data/character_save/images/slot${index + 1}/slot${index + 1}_portrait.webp?t=${Date.now()}`;

            return (
              <motion.div
                key={index}
                whileHover={hasCharacter ? { y: -5, scale: 1.02 } : { scale: 1.01 }}
                onClick={() => {
                  if (hasCharacter) {
                    setSelectedSlotIndex(index);
                    playClickSound();
                  } else {
                    handleNewGame();
                  }
                }}
                className={cn(
                  "relative flex flex-col rounded-md border-2 overflow-hidden cursor-pointer transition-all aspect-[3/4] bg-stone-950/80 shadow-2xl",
                  hasCharacter
                    ? isSelected
                      ? "border-dragon-gold ring-4 ring-dragon-red/20 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                      : "border-white/10 hover:border-white/30"
                    : "border-dashed border-white/5 hover:border-white/20 hover:bg-white/5 opacity-50"
                )}
              >
                {hasCharacter ? (
                  <>
                    {/* Portrait background */}
                    <div className="absolute inset-0">
                      <img 
                        src={portraitUrl}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const slotId = char.id || `slot${index + 1}`;
                          if (!target.src.includes('raw.githubusercontent.com')) {
                            target.src = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/data/character_save/images/${slotId}/${slotId}_portrait.webp?t=${Date.now()}`;
                          } else {
                            target.src = `https://picsum.photos/seed/${slotId}/300/400`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                    </div>

                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 bg-dragon-red text-white text-[8px] font-black px-2 py-0.5 rounded border border-dragon-gold/20 shadow-sm z-20">
                      SLOT 0{index + 1}
                    </div>

                    {/* Level Tag Overlay */}
                    <div className="absolute top-3 right-3 bg-dragon-gold text-dragon-darkRed text-[8px] font-black px-2 py-0.5 rounded border border-dragon-darkRed/20 shadow-sm z-20">
                      Lvl {char.level || 1}
                    </div>

                    {/* Character Info aligned to bottom */}
                    <div className="absolute bottom-0 inset-x-0 p-4 space-y-2 z-10">
                      <div>
                        <h3 className="text-lg font-header font-black text-white uppercase tracking-wider leading-tight truncate">
                          {char.name}
                        </h3>
                        <p className="text-[10px] text-dragon-gold font-bold uppercase tracking-widest mt-0.5">
                          {char.race} • {char.class}
                        </p>
                      </div>

                      {/* Micro stats table */}
                      <div className="grid grid-cols-6 gap-1 text-center bg-black/40 border border-white/5 rounded-sm p-1">
                        {Object.entries(char.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }).map(([stat, val]) => (
                          <div key={stat} className="flex flex-col">
                            <span className="text-[6px] font-black text-white/40 uppercase">{stat}</span>
                            <span className="text-[9px] font-black text-white">{val as any}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[8px] font-black text-white/30 uppercase mt-1">
                        <span>HP: {char.hp}/{char.maxHp}</span>
                        <span>XP: {char.xp.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 border border-dashed border-white/10 rounded-full flex items-center justify-center text-white/20">
                      <GameIcon name="plus" size={24} color="currentColor" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">SLOT 0{index + 1}</span>
                      <h3 className="font-header font-black text-white/40 uppercase tracking-wider mt-1">Empty Manifest</h3>
                      <p className="text-[8px] text-white/20 uppercase tracking-tight mt-1">Click to manifest character</p>
                    </div>
                  </div>
                )}

                {/* Selected Ring */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-dragon-gold rounded-md pointer-events-none z-30" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Actions panel */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center items-center">
          <button
            onClick={handleNewGame}
            className="flex-1 w-full group relative overflow-hidden bg-white/5 py-4 px-6 rounded-sm border border-white/10 shadow-lg transition-all hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-95 text-center"
          >
            <div className="relative flex items-center justify-center gap-3 text-white">
              <GameIcon name="plus" size={16} color="#FFFFFF" />
              <span className="text-xs font-header font-black uppercase tracking-[0.25em]">Create New Character</span>
            </div>
          </button>

          <button
            onClick={handleContinue}
            disabled={!hasAnySaves || selectedSlotIndex === null}
            className={cn(
              "flex-1 w-full group relative overflow-hidden py-4 px-6 rounded-sm border transition-all hover:scale-[1.02] active:scale-95 text-center",
              (!hasAnySaves || selectedSlotIndex === null)
                ? "bg-white/5 border-white/5 opacity-20 cursor-not-allowed shadow-none"
                : "bg-dragon-red border-dragon-red/50 text-white shadow-[0_0_30px_rgba(139,0,0,0.3)] hover:brightness-110"
            )}
          >
            <div className="relative flex items-center justify-center gap-3">
              <GameIcon name="play" size={16} color="#FFFFFF" />
              <span className="text-xs font-header font-black uppercase tracking-[0.25em]">Continue Adventure</span>
            </div>
          </button>
        </div>

        <div className="mt-16 text-[8px] font-black text-white/10 uppercase tracking-[1em]">
          Version 3.0.0 // Prime Protocol
        </div>
      </div>
    </div>
  );
};
