import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDAndD } from '@fortawesome/free-brands-svg-icons';
import { playClickSound, playSuccessSound, REPO, BRANCH, normalizeImageUrl } from '../../services/storageService';
import { soundService } from '../../services/soundService';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { useAudioStore } from '../../store/useAudioStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { calculateDerivedStats } from '../../lib/statCalculations';

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
        {[...Array(20)].map((_, i) => (
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
              duration: 10 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear"
            }}
            className="w-1.5 h-1.5 bg-gradient-to-t from-amber-500 to-red-600 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full px-8 py-4 h-full justify-between select-none">
        {/* Header Title Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mt-1 mb-2"
        >
          <div className="flex items-center justify-center gap-3 mb-0.5">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <GameIcon name="magic_effect" size={16} color="#F59E0B" />
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent via-amber-500/40 to-transparent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-elan font-black text-amber-500 tracking-tighter uppercase leading-none mb-0.5 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            <span className="ml-[-4px] text-white">Dungeons</span>
            <FontAwesomeIcon 
              icon={faDAndD} 
              className="text-[1.1em] text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] relative z-10 ml-[-2px] mr-[-6px] mb-[6px]"
            />
            <span className="text-red-600">Dragons</span>
          </h1>
          <p className="text-amber-500/70 font-header uppercase tracking-[0.45em] text-[8px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            The Arcane Forge & Database
          </p>
        </motion.div>

        {/* 3 Vertical-stacked Horizontal Character Cards */}
        <div className="flex flex-col gap-3.5 w-full max-w-4xl my-2">
          {[0, 1, 2].map((index) => {
            const char = mainCharacterSlots[index];
            const isSelected = selectedSlotIndex === index;
            const hasCharacter = !!char;

            const portraitUrl = char?.imageUrl
              ? normalizeImageUrl(char.imageUrl, 'character_save', char.id)
              : `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/data/character_save/images/slot${index + 1}/slot${index + 1}_portrait.webp?t=${Date.now()}`;

            const derived = char ? calculateDerivedStats(char) : null;
            const initiativeSign = derived ? (derived.initiative >= 0 ? `+${derived.initiative}` : `${derived.initiative}`) : '';

            return (
              <motion.div
                key={index}
                whileHover={hasCharacter ? { x: 4, scale: 1.005 } : { scale: 1.002 }}
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
                  "relative flex flex-row rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-300 h-[125px] sm:h-[135px] shadow-xl group",
                  hasCharacter
                    ? isSelected
                      ? "border-amber-400 bg-stone-900/95 ring-3 ring-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                      : "border-stone-850 bg-stone-950/90 hover:border-stone-700"
                    : "border-dashed border-stone-850 bg-stone-950/30 hover:border-amber-500/20 hover:bg-stone-900/30"
                )}
              >
                {hasCharacter ? (
                  <>
                    {/* Left Side: 2:3 Portrait Area with Chroma Keying & Attribute Overlay */}
                    <div
                      className="relative w-[90px] h-full overflow-hidden shrink-0 border-r border-stone-850 bg-[#1e1712]"
                      style={{
                        backgroundImage: `url('/assets/ui/parchment.jpg')`,
                        backgroundColor: '#f5ebd0',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {/* Sub-overlay to slightly darken/warm the background parchment texture */}
                      <div className="absolute inset-0 bg-[#3a2a1d]/15 mix-blend-multiply pointer-events-none z-0" />

                      {/* Chroma Key Portrait Canvas */}
                      <ChromaKeyImage
                        src={portraitUrl}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10"
                      />

                      {/* Atmospheric Vignette Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-stone-950/20 z-10 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent z-10 pointer-events-none" />

                      {/* Slot Badge */}
                      <div className="absolute top-1 left-1 bg-stone-950/85 backdrop-blur-sm text-stone-400 text-[6.5px] font-black px-1 py-0.5 rounded border border-stone-800 z-25">
                        SL0{index + 1}
                      </div>

                      {/* Level Badge Overlay */}
                      <div className="absolute top-1 right-1 bg-amber-500 text-stone-950 text-[7px] font-black px-1 py-0.5 rounded shadow-sm uppercase tracking-wider z-25">
                        L{char.level || 1}
                      </div>

                      {/* Attribute Scores Bottom Overlay on image */}
                      <div className="absolute bottom-0 inset-x-0 bg-stone-950/90 backdrop-blur-xs border-t border-stone-800/80 px-0.5 py-1 grid grid-cols-3 gap-x-0.5 gap-y-0.5 text-center z-25">
                        {Object.entries(char.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }).map(([stat, val]) => {
                          const score = val as number;
                          return (
                            <div key={stat} className="flex flex-col items-center">
                              <span className="text-[5px] font-extrabold text-amber-500/80 uppercase leading-none">{stat}</span>
                              <span className="text-[7.5px] font-bold text-stone-200 leading-none mt-0.5">
                                {score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Side: Re-arranged and Spacious Metadata Sheet */}
                    <div className="flex-1 p-3 flex flex-col justify-between bg-[#151210] relative z-10 overflow-hidden">
                      {/* Parchment background overlay for information sheet */}
                      <div className="absolute inset-0 bg-[#f5ebd0]/[0.03] mix-blend-overlay pointer-events-none" />

                      {/* Top Row: Character Name, Race/Class Subtitle and Timestamp */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-header font-black text-amber-500 uppercase tracking-wide truncate leading-none">
                            {char.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 mt-1.5 text-[9px] text-stone-300 font-black uppercase tracking-widest leading-none">
                            <span>{formatText(char.subrace || char.race)}</span>
                            <span className="text-stone-600">•</span>
                            <span className="text-amber-500/80">{formatText(char.subclass || char.class)}</span>
                            <span className="text-stone-600">•</span>
                            <span className="text-stone-400 font-semibold lowercase tracking-wide">{formatText(char.alignment)}</span>
                            <span className="text-stone-600">•</span>
                            <span className="text-stone-400 font-semibold lowercase tracking-wide">{formatText(char.background)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[8.5px] font-bold text-stone-500 whitespace-nowrap bg-stone-950/40 px-2 py-0.5 rounded border border-stone-900/30">
                            {formatLastSaved(char.lastSaved)}
                          </span>
                          {/* Elegant trash/Banish button in the top right header */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playClickSound();
                              setDeleteConfirmSlot(index);
                            }}
                            className="p-1 bg-black/40 hover:bg-red-700/80 border border-stone-800 hover:border-red-500 rounded text-stone-400 hover:text-white transition-all duration-200"
                            title="Delete Hero"
                          >
                            <GameIcon name="refresh" size={10} color="currentColor" />
                          </button>
                        </div>
                      </div>

                      {/* Balanced Vitals Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {/* HP Vital */}
                        <div className="flex items-center gap-2 bg-stone-950/40 border border-stone-900/60 rounded px-2.5 py-1.5 shadow-sm">
                          <div className="p-1 bg-red-950/30 rounded border border-red-900/20 text-red-500 flex items-center justify-center">
                            <GameIcon name="shield" size={10} color="currentColor" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider leading-none">Health</span>
                            <span className="text-[11px] font-extrabold text-stone-200 leading-none mt-1">
                              {char.hp}/{char.maxHp} <span className="text-[8.5px] text-stone-400 font-bold">HP</span>
                            </span>
                          </div>
                        </div>

                        {/* Armor Class Vital */}
                        <div className="flex items-center gap-2 bg-stone-950/40 border border-stone-900/60 rounded px-2.5 py-1.5 shadow-sm">
                          <div className="p-1 bg-amber-950/30 rounded border border-amber-900/20 text-amber-500 flex items-center justify-center">
                            <GameIcon name="armor" size={10} color="currentColor" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider leading-none">Armor Class</span>
                            <span className="text-[11px] font-extrabold text-stone-200 leading-none mt-1">
                              {derived?.ac} <span className="text-[8.5px] text-stone-400 font-bold">AC</span>
                            </span>
                          </div>
                        </div>

                        {/* Initiative Vital */}
                        <div className="flex items-center gap-2 bg-stone-950/40 border border-stone-900/60 rounded px-2.5 py-1.5 shadow-sm">
                          <div className="p-1 bg-blue-950/30 rounded border border-blue-900/20 text-blue-400 flex items-center justify-center">
                            <GameIcon name="sword" size={10} color="currentColor" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider leading-none">Initiative</span>
                            <span className="text-[11px] font-extrabold text-stone-200 leading-none mt-1">
                              {initiativeSign} <span className="text-[8.5px] text-stone-400 font-bold">INIT</span>
                            </span>
                          </div>
                        </div>

                        {/* Gold & Wealth */}
                        <div className="flex items-center gap-2 bg-stone-950/40 border border-stone-900/60 rounded px-2.5 py-1.5 shadow-sm">
                          <div className="p-1 bg-yellow-950/30 rounded border border-yellow-900/20 text-yellow-500 flex items-center justify-center">
                            <GameIcon name="money" size={10} color="currentColor" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider leading-none">Wealth</span>
                            <span className="text-[11px] font-extrabold text-stone-200 leading-none mt-1">
                              {char.money?.gp || 0} <span className="text-[8.5px] text-stone-400 font-bold">GP</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compact XP Progress Bar */}
                      <div className="mt-2 flex items-center gap-3 bg-stone-950/30 border border-stone-900/40 rounded px-2.5 py-1">
                        <span className="text-[7.5px] font-black text-stone-400 uppercase tracking-wider whitespace-nowrap">
                          Experience Points
                        </span>
                        <div className="flex-1 h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-900/50">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, ((char.xp || 0) % 1000) / 10)}%` }}
                          />
                        </div>
                        <span className="text-[8.5px] font-bold text-stone-300 whitespace-nowrap">
                          {(char.xp || 0).toLocaleString()} <span className="text-purple-400/80 font-black">XP</span>
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-row items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-stone-950/70 via-stone-950/90 to-stone-950/60 w-full">
                    {/* Left: Placeholder frame */}
                    <div className="w-[90px] h-full bg-stone-900/50 border border-dashed border-stone-850 group-hover:border-amber-500/20 rounded-l flex items-center justify-center text-stone-700 group-hover:text-amber-500/40 transition-colors duration-300 shrink-0">
                      <GameIcon name="plus" size={14} color="currentColor" />
                    </div>

                    {/* Right: Custom Invitation Banner */}
                    <div className="flex-1 text-left px-4 min-w-0">
                      <span className="text-[8px] font-black text-stone-600 uppercase tracking-widest block mb-0.5">SLOT 0{index + 1}</span>
                      <h3 className="font-header text-base font-black text-stone-500 group-hover:text-amber-500/80 uppercase tracking-wider transition-colors duration-300">
                        Create New Character
                      </h3>
                      <p className="text-[8px] text-stone-600 uppercase tracking-tight mt-0.5 group-hover:text-stone-400 transition-colors duration-300 leading-normal max-w-lg truncate">
                        Begin writing a new legacy in this empty save manifest.
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center justify-center w-10 h-10 border border-stone-850 group-hover:border-amber-500/30 rounded-full text-stone-600 group-hover:text-amber-500/70 transition-all duration-300">
                      <GameIcon name="play" size={12} color="currentColor" />
                    </div>
                  </div>
                )}

                {/* Selected Ring Accent Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-lg pointer-events-none z-30 shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Action Panel Section */}
        <div className="flex flex-col items-center w-full max-w-2xl mt-2 mb-1">
          {selectedSlotIndex !== null && mainCharacterSlots[selectedSlotIndex] && (
            <div className="text-center mb-2 animate-fade-in">
              <span className="text-[8px] font-bold text-stone-500 uppercase tracking-[0.2em]">Selected Hero</span>
              <h4 className="text-base font-header font-black text-amber-500 uppercase tracking-wider mt-0.5">
                {mainCharacterSlots[selectedSlotIndex]?.name}
              </h4>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
            {/* Create New Character Button */}
            <button
              onClick={handleNewGame}
              className="flex-1 w-full group relative overflow-hidden bg-stone-950 hover:bg-stone-900 py-3 px-5 rounded-md border border-[#3e2e21] hover:border-amber-500/30 transition-all duration-200 active:scale-95 text-center shadow-lg"
            >
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-2.5 text-stone-300 group-hover:text-amber-400 transition-colors">
                <GameIcon name="plus" size={12} color="currentColor" />
                <span className="text-[10px] font-header font-black uppercase tracking-[0.2em]">Create New Character</span>
              </div>
            </button>

            {/* Play/Continue Adventure Button */}
            <button
              onClick={handleContinue}
              disabled={!hasAnySaves || selectedSlotIndex === null || !mainCharacterSlots[selectedSlotIndex]}
              className={cn(
                "flex-1 w-full group relative overflow-hidden py-3 px-5 rounded-md border transition-all duration-300 active:scale-95 text-center shadow-xl",
                (!hasAnySaves || selectedSlotIndex === null || !mainCharacterSlots[selectedSlotIndex])
                  ? "bg-stone-950/20 border-stone-900/40 text-stone-600 opacity-20 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-red-500/40 hover:border-amber-500/50 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              )}
            >
              {hasAnySaves && selectedSlotIndex !== null && mainCharacterSlots[selectedSlotIndex] && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              )}
              <div className="relative flex items-center justify-center gap-2.5">
                <GameIcon name="play" size={12} color="#FFFFFF" />
                <span className="text-[10px] font-header font-black uppercase tracking-[0.2em]">Continue Adventure</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-2 text-[8px] font-black text-stone-600 uppercase tracking-[1em] text-center">
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
