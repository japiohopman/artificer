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

  // Formatter for general text keys
  const formatText = (text?: string) => {
    if (!text) return '';
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const selectedChar = selectedSlotIndex !== null ? mainCharacterSlots[selectedSlotIndex] : null;
  const selectedDerived = selectedChar ? calculateDerivedStats(selectedChar) : null;
  const selectedInitiativeSign = selectedDerived ? (selectedDerived.initiative >= 0 ? `+${selectedDerived.initiative}` : `${selectedDerived.initiative}`) : '';

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

      {/* Main cinematic wrapper */}
      <div className="relative z-10 flex flex-col items-center max-w-6xl w-full px-8 py-4 h-full justify-between select-none overflow-y-auto scrollbar-none">
        
        {/* TOP: Header Title Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mt-2 mb-1"
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <GameIcon name="magic_effect" size={16} color="#F59E0B" />
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent via-amber-500/40 to-transparent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-elan font-black text-amber-500 tracking-tighter uppercase leading-none mb-1 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
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

        {/* MIDDLE-TOP: Selected Hero Header above cards */}
        <div className="text-center h-14 flex flex-col justify-center my-1">
          {selectedChar ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedChar.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-500">
                  Selected Hero
                </span>
                <h2 className="text-2xl md:text-3xl font-header font-black text-amber-500 uppercase tracking-widest mt-1 drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]">
                  {selectedChar.name}
                </h2>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-500">
                Choose Your Champion
              </span>
              <h2 className="text-xl md:text-2xl font-header font-black text-stone-600 uppercase tracking-widest mt-1">
                No Hero Selected
              </h2>
            </div>
          )}
        </div>

        {/* MIDDLE: 3 Vertical Character Cards Side-by-Side */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-5xl my-2">
          {[0, 1, 2].map((index) => {
            const char = mainCharacterSlots[index];
            const isSelected = selectedSlotIndex === index;
            const hasCharacter = !!char;

            const portraitUrl = char?.imageUrl
              ? normalizeImageUrl(char.imageUrl, 'character_save', char.id)
              : `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/data/character_save/images/slot${index + 1}/slot${index + 1}_portrait.webp?t=${Date.now()}`;

            return (
              <motion.div
                key={index}
                whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
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
                  "relative flex flex-col rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-300 w-64 md:w-72 h-[340px] md:h-[370px] shadow-xl group",
                  hasCharacter
                    ? isSelected
                      ? "border-amber-400 bg-stone-900/95 ring-3 ring-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.25)] z-20"
                      : "border-stone-850 bg-stone-950/90 hover:border-stone-750 opacity-60 grayscale-[15%]"
                    : "border-dashed border-stone-800 bg-stone-950/20 hover:border-amber-500/30 hover:bg-stone-900/20"
                )}
              >
                {hasCharacter ? (
                  <>
                    {/* Top 70%: Portrait Container */}
                    <div
                      className="relative flex-1 overflow-hidden bg-[#1e1712]"
                      style={{
                        backgroundImage: `url('/assets/ui/parchment.jpg')`,
                        backgroundColor: '#f5ebd0',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {/* Dark blend overlay for portrait bg */}
                      <div className="absolute inset-0 bg-[#3a2a1d]/15 mix-blend-multiply pointer-events-none z-0" />

                      {/* Chroma Key Portrait */}
                      <ChromaKeyImage
                        src={portraitUrl}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10"
                      />

                      {/* Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent z-10 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 bg-stone-950/85 backdrop-blur-sm text-stone-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-stone-800 z-20">
                        SL0{index + 1}
                      </div>

                      <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider z-20">
                        L{char.level || 1}
                      </div>
                    </div>

                    {/* Bottom 30%: Compact Name & Stats */}
                    <div className="p-3 bg-[#13100e] relative z-10 flex flex-col justify-between shrink-0 h-[120px] border-t border-stone-850/40">
                      <div className="absolute inset-0 bg-[#f5ebd0]/[0.02] mix-blend-overlay pointer-events-none" />

                      {/* Name and Race/Class */}
                      <div className="text-center">
                        <h4 className="text-sm font-header font-black text-amber-500 uppercase tracking-wider truncate leading-none mb-1">
                          {char.name}
                        </h4>
                        <p className="text-[8.5px] text-stone-400 font-extrabold uppercase tracking-widest truncate leading-none">
                          {formatText(char.subrace || char.race)} • {formatText(char.subclass || char.class)}
                        </p>
                      </div>

                      {/* D&D Stats Grid: 3 columns x 2 rows */}
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-center mt-1.5 pt-1.5 border-t border-stone-900/60">
                        {Object.entries(char.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }).map(([stat, val]) => {
                          const score = val as number;
                          return (
                            <div key={stat} className="flex flex-col items-center">
                              <span className="text-[6.5px] font-black text-amber-500/70 uppercase leading-none">{stat}</span>
                              <span className="text-[10px] font-bold text-stone-300 leading-none mt-0.5">
                                {score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Empty Slot Card */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-950/40 via-stone-950/70 to-stone-950/95 text-center">
                    <div className="w-12 h-12 rounded-full border border-dashed border-stone-850 flex items-center justify-center text-stone-600 group-hover:text-amber-500/40 group-hover:border-amber-500/30 transition-all duration-300 mb-4">
                      <GameIcon name="plus" size={16} color="currentColor" />
                    </div>
                    <span className="text-[8px] font-black text-stone-600 uppercase tracking-widest block mb-1">SLOT 0{index + 1}</span>
                    <h3 className="font-header text-sm font-black text-stone-500 group-hover:text-amber-500/80 uppercase tracking-wider transition-colors duration-300">
                      EMPTY SLOT
                    </h3>
                    <p className="text-[8px] text-stone-600 uppercase tracking-tight mt-1 max-w-[180px] leading-normal group-hover:text-stone-400 transition-colors duration-300">
                      CREATE CHARACTER
                    </p>
                  </div>
                )}

                {/* Selected Border Accent */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-lg pointer-events-none z-30 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* MIDDLE-BOTTOM: Character Preview Overlay / Inspection Panel */}
        <div className="w-full flex justify-center px-4 my-2">
          <AnimatePresence mode="wait">
            {selectedChar && (
              <motion.div
                key={`preview-${selectedChar.id}`}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full max-w-2xl bg-[#14100e] border-2 border-amber-600/30 shadow-[0_0_30px_rgba(217,119,6,0.15)] rounded-lg p-4 text-stone-200 relative overflow-hidden"
              >
                {/* Subtle paper texture background */}
                <div className="absolute inset-0 bg-[#f5ebd0]/[0.02] mix-blend-overlay pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {/* Left Column: Character Details */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-black text-amber-500/70 uppercase tracking-[0.25em] block mb-1">
                        Character Information
                      </span>
                      <h3 className="text-xl md:text-2xl font-header font-black text-amber-500 uppercase tracking-wide leading-none mb-1">
                        {selectedChar.name}
                      </h3>
                      <p className="text-xs text-stone-300 font-extrabold uppercase tracking-widest">
                        {formatText(selectedChar.subrace || selectedChar.race)} {formatText(selectedChar.subclass || selectedChar.class)}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-2 capitalize">
                        Background: <span className="text-stone-300 font-semibold">{formatText(selectedChar.background)}</span>
                      </p>
                      <p className="text-[10px] text-stone-400 capitalize">
                        Alignment: <span className="text-stone-300 font-semibold">{formatText(selectedChar.alignment)}</span>
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider font-extrabold">
                        Level {selectedChar.level || 1}
                      </p>
                    </div>

                    {/* Banish Button */}
                    <div className="mt-4 md:mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          setDeleteConfirmSlot(selectedSlotIndex);
                        }}
                        className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/40 border border-red-900/40 hover:border-red-500 rounded text-red-400 hover:text-red-200 text-[9px] font-black uppercase tracking-widest transition-all duration-200"
                      >
                        Banish Character
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Vitals */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {/* HP */}
                      <div className="bg-stone-950/40 border border-stone-900/50 rounded p-2 flex items-center gap-2">
                        <div className="p-1.5 bg-red-950/30 rounded border border-red-900/20 text-red-500 flex items-center justify-center">
                          <GameIcon name="shield" size={10} color="currentColor" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider">Health</span>
                          <span className="text-xs font-bold text-stone-200">
                            {selectedChar.hp} / {selectedChar.maxHp} HP
                          </span>
                        </div>
                      </div>

                      {/* AC */}
                      <div className="bg-stone-950/40 border border-stone-900/50 rounded p-2 flex items-center gap-2">
                        <div className="p-1.5 bg-amber-950/30 rounded border border-amber-900/20 text-amber-500 flex items-center justify-center">
                          <GameIcon name="armor" size={10} color="currentColor" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider">Armor Class</span>
                          <span className="text-xs font-bold text-stone-200">
                            {selectedDerived?.ac} AC
                          </span>
                        </div>
                      </div>

                      {/* Initiative */}
                      <div className="bg-stone-950/40 border border-stone-900/50 rounded p-2 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-950/30 rounded border border-blue-900/20 text-blue-400 flex items-center justify-center">
                          <GameIcon name="sword" size={10} color="currentColor" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider">Initiative</span>
                          <span className="text-xs font-bold text-stone-200">
                            {selectedInitiativeSign} INIT
                          </span>
                        </div>
                      </div>

                      {/* Wealth */}
                      <div className="bg-stone-950/40 border border-stone-900/50 rounded p-2 flex items-center gap-2">
                        <div className="p-1.5 bg-yellow-950/30 rounded border border-yellow-900/20 text-yellow-500 flex items-center justify-center">
                          <GameIcon name="money" size={10} color="currentColor" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider">Wealth</span>
                          <span className="text-xs font-bold text-stone-200">
                            {selectedChar.money?.gp || 0} GP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* XP Progress */}
                    <div className="bg-stone-950/30 border border-stone-900/50 rounded p-2 space-y-1">
                      <div className="flex justify-between text-[7.5px] font-black text-stone-400 uppercase tracking-wider">
                        <span>Experience Points</span>
                        <span>{selectedChar.xp || 0} XP</span>
                      </div>
                      <div className="h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-900/50">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, ((selectedChar.xp || 0) % 1000) / 10)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer timestamp info */}
                <div className="border-t border-stone-900 mt-3 pt-2.5 flex justify-between items-center text-[8.5px] text-stone-500 font-bold relative z-10">
                  <span>LAST PLAYED: {formatLastSaved(selectedChar.lastSaved).toUpperCase()}</span>
                  <span className="text-[7.5px] font-black text-amber-500/40 uppercase tracking-widest">
                    ID // {selectedChar.id.slice(0, 8)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM: Action Buttons Section */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl justify-center items-center my-2">
          {/* Create New Character Button (Secondary CTA) */}
          <button
            onClick={handleNewGame}
            className="flex-1 w-full group relative overflow-hidden bg-[#0d0a08] hover:bg-stone-900 py-3 px-6 rounded-md border border-amber-600/30 hover:border-amber-500/60 transition-all duration-200 active:scale-95 text-center shadow-lg"
          >
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            <div className="relative flex items-center justify-center gap-2 text-stone-300 group-hover:text-amber-400 transition-colors">
              <GameIcon name="plus" size={12} color="currentColor" />
              <span className="text-[11px] font-header font-black uppercase tracking-[0.25em]">Create New Character</span>
            </div>
          </button>

          {/* Continue Adventure Button (Primary CTA) */}
          <button
            onClick={handleContinue}
            disabled={selectedSlotIndex === null || !mainCharacterSlots[selectedSlotIndex]}
            className={cn(
              "flex-1 w-full group relative overflow-hidden py-3 px-6 rounded-md border transition-all duration-300 active:scale-[0.98] text-center shadow-xl",
              (selectedSlotIndex === null || !mainCharacterSlots[selectedSlotIndex])
                ? "bg-stone-950/20 border-stone-900/40 text-stone-600 opacity-20 cursor-not-allowed shadow-none"
                : "bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-red-500/50 hover:border-amber-500/70 text-white shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:shadow-[0_0_35px_rgba(220,38,38,0.5)]"
            )}
          >
            {selectedSlotIndex !== null && mainCharacterSlots[selectedSlotIndex] && (
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <GameIcon name="play" size={12} color="#FFFFFF" />
              <span className="text-[11px] font-header font-black uppercase tracking-[0.25em]">
                {selectedSlotIndex !== null && mainCharacterSlots[selectedSlotIndex]
                  ? `Continue with ${mainCharacterSlots[selectedSlotIndex]?.name}`
                  : "Continue Adventure"}
              </span>
            </div>
          </button>
        </div>

        {/* FOOTER: Version Info */}
        <div className="mt-2 mb-1 text-[8px] font-black text-stone-600 uppercase tracking-[1em] text-center">
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
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded font-black text-xs uppercase tracking-widest border border-red-500/40 transition-colors shadow-lg shadow-red-900/20"
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
