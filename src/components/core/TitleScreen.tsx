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
    deleteCharacter,
    isLoadingSaves,
  } = useCharacterStore();

  const {
    setIsCharacterCreatorOpen,
    setIsLoading,
  } = useUIStore();

  const { setIsGameStarted } = useGameStore();
  const { isMusicPlaying } = useAudioStore();

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<number | null>(null);

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

  // Set default selection to first populated character if available
  useEffect(() => {
    if (selectedSlotIndex === null) {
      const firstPopulated = mainCharacterSlots.findIndex(c => c !== null);
      if (firstPopulated !== -1) {
        setSelectedSlotIndex(firstPopulated);
      }
    }
  }, [mainCharacterSlots, selectedSlotIndex]);

  const handleStartInteraction = () => {
    if (!isMusicPlaying) {
      soundService.playMusic('startup');
    }
  };

  const handleNewGame = () => {
    playClickSound();
    setIsLoading(true, "Entering Realm...");
    setIsCharacterCreatorOpen(true);
    setIsGameStarted(true);
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
      soundService.playMusic('game');
    }
  };

  const handleDeleteSlot = async (index: number) => {
    const char = mainCharacterSlots[index];
    if (!char) return;

    setIsLoading(true, `Banishing ${char.name}...`);
    try {
      playClickSound();
      const success = await deleteCharacter(char.id);
      if (success) {
        setSelectedSlotIndex(null);
      }
    } finally {
      setIsLoading(false);
      setDeleteConfirmSlot(null);
    }
  };

  const hasAnySaves = mainCharacterSlots.some(s => s !== null);

  // Helper to format timestamps nicely
  const formatLastSaved = (dateStr?: string) => {
    if (!dateStr) return 'Unknown Era';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Unknown Era';
      return d.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown Era';
    }
  };

  // Helper to calculate modifiers
  const getMod = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Formatter for general text keys
  const formatText = (text?: string) => {
    if (!text) return '';
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div 
      className="fixed inset-0 bg-[#0d0a08] z-[90] flex items-center justify-center overflow-hidden"
      onClick={handleStartInteraction}
    >
      {/* Dynamic Gothic/Underground Background */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a1204]/15 via-transparent to-black" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-60" />
      </div>

      {/* Atmospheric Ember/Gold Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 50,
              opacity: 0,
              scale: 0.5 + Math.random() * 1.5
            }}
            animate={{ 
              y: [null, Math.random() * -300],
              x: [null, `calc(100% + ${Math.random() * 40 - 20}px)`],
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear"
            }}
            className="w-1.5 h-1.5 bg-gradient-to-t from-amber-500 to-red-600 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-6xl w-full px-8 py-6 h-full overflow-y-auto justify-between select-none">
        {/* Header Title Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mt-2 mb-6"
        >
          <div className="flex items-center justify-center gap-4 mb-1">
            <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <GameIcon name="magic_effect" size={20} color="#F59E0B" />
            <div className="h-[2px] w-16 bg-gradient-to-l from-transparent via-amber-500/50 to-transparent" />
          </div>
          <h1 className="text-6xl md:text-7xl font-elan font-black text-amber-500 tracking-tighter uppercase leading-none mb-1 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            <span className="ml-[-6px] text-white">Dungeons</span>
            <FontAwesomeIcon 
              icon={faDAndD} 
              className="text-[1.1em] text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] relative z-10 ml-[-2px] mr-[-8px] mb-[12px]"
            />
            <span className="text-red-600">Dragons</span>
          </h1>
          <p className="text-amber-500/80 font-header uppercase tracking-[0.45em] text-[10px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            The Arcane Forge & Database
          </p>
        </motion.div>

        {/* 3 Horizontal Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl my-4">
          {[0, 1, 2].map((index) => {
            const char = mainCharacterSlots[index];
            const isSelected = selectedSlotIndex === index;
            const hasCharacter = !!char;

            // Generate exact 2:3 fallback or retrieve the customized portrait image
            const portraitUrl = char?.imageUrl || `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/data/character_save/images/slot${index + 1}/slot${index + 1}_portrait.webp?t=${Date.now()}`;

            return (
              <motion.div
                key={index}
                whileHover={hasCharacter ? { y: -6, scale: 1.02 } : { scale: 1.01 }}
                onClick={() => {
                  if (hasCharacter) {
                    setSelectedSlotIndex(index);
                    playClickSound();
                  } else {
                    setSelectedSlotIndex(index);
                    handleNewGame();
                  }
                }}
                className={cn(
                  "relative flex flex-col rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 aspect-[3/4.6] shadow-2xl group",
                  hasCharacter
                    ? isSelected
                      ? "border-amber-400 bg-stone-900/95 ring-4 ring-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.25)]"
                      : "border-stone-800 bg-stone-950/90 hover:border-stone-600"
                    : "border-dashed border-stone-800 bg-stone-950/40 hover:border-amber-500/30 hover:bg-stone-900/40"
                )}
              >
                {hasCharacter ? (
                  <div className="flex flex-col h-full relative">
                    {/* Header Plate of Card */}
                    <div className="px-4 py-2 bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800 flex justify-between items-center z-20 shrink-0">
                      <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">
                        SLOT 0{index + 1}
                      </span>
                      <span className="text-[9px] font-bold text-stone-400">
                        {formatLastSaved(char.lastSaved)}
                      </span>
                    </div>

                    {/* Portrait Area - Beautifully Framed 2:3 */}
                    <div className="relative h-[48%] overflow-hidden shrink-0 border-b border-stone-800 bg-stone-900">
                      <img 
                        src={portraitUrl}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                      {/* Atmospheric Vignette Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                      {/* Class Icon Sprites or Level Badge */}
                      <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow-lg border border-amber-300/30 z-20 uppercase tracking-wider">
                        LVL {char.level || 1}
                      </div>

                      {/* Small Quick-Delete Banish Button right on the card */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          setDeleteConfirmSlot(index);
                        }}
                        className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-red-700 border border-white/10 hover:border-red-500 rounded text-stone-400 hover:text-white transition-all duration-200 z-30"
                        title="Delete Hero"
                      >
                        <GameIcon name="refresh" size={12} color="currentColor" />
                      </button>
                    </div>

                    {/* Content Plate with Warm Details */}
                    <div className="flex-1 p-3.5 flex flex-col justify-between bg-[#151210] relative z-10 border-t border-[#2d2118]/40">
                      {/* Parchment background look for information sheet */}
                      <div className="absolute inset-0 bg-[#f5ebd0]/[0.03] mix-blend-overlay pointer-events-none" />

                      {/* Character Name and Class/Race Subtitle */}
                      <div>
                        <h3 className="text-xl font-header font-black text-amber-500 uppercase tracking-wide truncate leading-none mb-1">
                          {char.name}
                        </h3>
                        <p className="text-[10px] text-stone-300 font-black uppercase tracking-widest truncate">
                          {formatText(char.subrace || char.race)} • {formatText(char.subclass || char.class)}
                        </p>
                        <p className="text-[9px] text-stone-400/80 font-bold uppercase tracking-wider mt-0.5">
                          {formatText(char.alignment)} • {formatText(char.background)}
                        </p>
                      </div>

                      {/* Micro Stats Grid with Modifiers */}
                      <div className="grid grid-cols-6 gap-1 my-2 bg-stone-950/60 border border-[#3e2e21]/40 rounded p-1.5">
                        {Object.entries(char.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }).map(([stat, val]) => (
                          <div key={stat} className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-amber-500/50 uppercase">{stat}</span>
                            <span className="text-[11px] font-bold text-stone-200">{val as any}</span>
                            <span className="text-[7px] font-bold text-stone-400 mt-0.5">{getMod(val as number)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Vitals, XP, and Money display */}
                      <div className="flex flex-col gap-1.5 text-[9px] font-bold text-stone-300 uppercase tracking-wide bg-stone-950/30 p-1.5 rounded border border-stone-900/50">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <GameIcon name="shield" size={10} color="#EF4444" />
                            HP: <span className="text-white font-extrabold">{char.hp}/{char.maxHp}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <GameIcon name="magic_effect" size={10} color="#A78BFA" />
                            XP: <span className="text-white font-extrabold">{(char.xp || 0).toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="h-[1px] bg-[#3a2c20]/40 w-full" />
                        <div className="flex justify-between items-center text-amber-500/90 text-[8px] font-black">
                          <span>WEALTH MANIFEST</span>
                          <span className="flex items-center gap-0.5">
                            <GameIcon name="money" size={9} color="#F59E0B" />
                            {char.money?.gp || 0} GP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-stone-950/60 to-stone-950/90">
                    <div className="w-14 h-14 bg-stone-900/80 border border-dashed border-stone-800 group-hover:border-amber-500/30 rounded-full flex items-center justify-center text-stone-600 group-hover:text-amber-500/60 transition-colors duration-300">
                      <GameIcon name="plus" size={18} color="currentColor" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest block mb-1">SLOT 0{index + 1}</span>
                      <h3 className="font-header font-black text-stone-500 group-hover:text-amber-500/80 uppercase tracking-wider transition-colors duration-300">
                        Create New Character
                      </h3>
                      <p className="text-[8.5px] text-stone-600 uppercase tracking-tight mt-1 group-hover:text-stone-400 transition-colors duration-300 leading-normal max-w-[180px] mx-auto">
                        Click to write a new legacy in this empty save manifest
                      </p>
                    </div>
                  </div>
                )}

                {/* Selected Ring Accent Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-xl pointer-events-none z-30 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Action Panel Section */}
        <div className="flex flex-col items-center w-full max-w-2xl mt-4 mb-2">
          {selectedSlotIndex !== null && mainCharacterSlots[selectedSlotIndex] && (
            <div className="text-center mb-4 animate-fade-in">
              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-[0.2em]">Selected Hero</span>
              <h4 className="text-lg font-header font-black text-amber-500 uppercase tracking-wider mt-0.5">
                {mainCharacterSlots[selectedSlotIndex]?.name}
              </h4>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
            {/* Create New Character Button */}
            <button
              onClick={handleNewGame}
              className="flex-1 w-full group relative overflow-hidden bg-stone-950 hover:bg-stone-900 py-3.5 px-6 rounded-md border border-[#3e2e21] hover:border-amber-500/30 transition-all duration-200 active:scale-95 text-center shadow-lg"
            >
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-3 text-stone-300 group-hover:text-amber-400 transition-colors">
                <GameIcon name="plus" size={14} color="currentColor" />
                <span className="text-[11px] font-header font-black uppercase tracking-[0.2em]">Create New Character</span>
              </div>
            </button>

            {/* Play/Continue Adventure Button */}
            <button
              onClick={handleContinue}
              disabled={!hasAnySaves || selectedSlotIndex === null || !mainCharacterSlots[selectedSlotIndex]}
              className={cn(
                "flex-1 w-full group relative overflow-hidden py-3.5 px-6 rounded-md border transition-all duration-300 active:scale-95 text-center shadow-xl",
                (!hasAnySaves || selectedSlotIndex === null || !mainCharacterSlots[selectedSlotIndex])
                  ? "bg-stone-950/20 border-stone-900/40 text-stone-600 opacity-20 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-red-500/40 hover:border-amber-500/50 text-white shadow-[0_0_25px_rgba(220,38,38,0.25)]"
              )}
            >
              {hasAnySaves && selectedSlotIndex !== null && mainCharacterSlots[selectedSlotIndex] && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              )}
              <div className="relative flex items-center justify-center gap-3">
                <GameIcon name="play" size={14} color="#FFFFFF" />
                <span className="text-[11px] font-header font-black uppercase tracking-[0.2em]">Continue Adventure</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-[8px] font-black text-stone-600 uppercase tracking-[1em] text-center">
          Version 3.0.0 // Prime Protocol
        </div>
      </div>

      {/* Elegant Medieval Banish/Delete Confirmation Overlay Modal */}
      <AnimatePresence>
        {deleteConfirmSlot !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md border-2 border-red-900/60 rounded-xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(139,0,0,0.25)] text-[#3d2516]"
              style={{
                backgroundImage: `url('/assets/ui/parchment.jpg')`,
                backgroundColor: '#f5ebd0',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-[#e6d5b0]/20 mix-blend-multiply pointer-events-none rounded-xl" />

              <h3 className="font-header text-2xl font-black uppercase text-red-800 tracking-wide text-center mb-2 border-b-2 border-red-900/20 pb-2">
                Banish Character?
              </h3>

              <p className="text-sm font-serif text-amber-950 text-center leading-relaxed mb-6">
                Are you absolutely certain you wish to banish <span className="font-bold text-red-900">{mainCharacterSlots[deleteConfirmSlot]?.name}</span> from the Realm?
                <br />
                <span className="text-xs text-red-700/80 font-bold uppercase mt-2 block">This action is permanent and cannot be undone.</span>
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmSlot(null)}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white py-2 px-4 rounded font-black text-xs uppercase tracking-widest border border-stone-800 transition-colors"
                >
                  Keep Hero
                </button>
                <button
                  onClick={() => handleDeleteSlot(deleteConfirmSlot)}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded font-black text-xs uppercase tracking-widest border border-red-500/40 transition-colors shadow-lg shadow-red-900/20 animate-pulse"
                >
                  Banish Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
