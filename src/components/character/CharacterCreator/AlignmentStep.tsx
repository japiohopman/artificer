import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { soundService } from '../../../services/soundService';

interface AlignmentOption {
  index: string;
  name: string;
  lawAxis: 'Lawful' | 'Neutral' | 'Chaotic';
  goodAxis: 'Good' | 'Neutral' | 'Evil';
  desc: string;
  bgUrl: string;
}

const ALIGNMENT_GRID: AlignmentOption[] = [
  {
    index: 'lawful_good',
    name: 'Lawful Good',
    lawAxis: 'Lawful',
    goodAxis: 'Good',
    desc: 'Acts with honor, compassion, and a strict duty to protect order and the innocent.',
    bgUrl: '/assets/images/enemy_backgrounds/church.webp'
  },
  {
    index: 'neutral_good',
    name: 'Neutral Good',
    lawAxis: 'Neutral',
    goodAxis: 'Good',
    desc: 'Guided by conscience to do the right thing without bias toward or against rules.',
    bgUrl: '/assets/images/enemy_backgrounds/mountain2.webp'
  },
  {
    index: 'chaotic_good',
    name: 'Chaotic Good',
    lawAxis: 'Chaotic',
    goodAxis: 'Good',
    desc: 'Follows their moral compass, valuing freedom and benevolence above law.',
    bgUrl: '/assets/images/enemy_backgrounds/air1.webp'
  },
  {
    index: 'lawful_neutral',
    name: 'Lawful Neutral',
    lawAxis: 'Lawful',
    goodAxis: 'Neutral',
    desc: 'Believes strongly in order, tradition, law, or personal codes above all.',
    bgUrl: '/assets/images/enemy_backgrounds/castle2.webp'
  },
  {
    index: 'true_neutral',
    name: 'True Neutral',
    lawAxis: 'Neutral',
    goodAxis: 'Neutral',
    desc: 'Prefers balance, pragmatism, and avoiding dogmatic extremes.',
    bgUrl: '/assets/images/enemy_backgrounds/land_plains1.webp'
  },
  {
    index: 'chaotic_neutral',
    name: 'Chaotic Neutral',
    lawAxis: 'Chaotic',
    goodAxis: 'Neutral',
    desc: 'Follows personal whims and values individual liberty above social expectation.',
    bgUrl: '/assets/images/enemy_backgrounds/air3.webp'
  },
  {
    index: 'lawful_evil',
    name: 'Lawful Evil',
    lawAxis: 'Lawful',
    goodAxis: 'Evil',
    desc: 'Methodically takes what they want within the boundaries of a code or authority.',
    bgUrl: '/assets/images/enemy_backgrounds/volcano.webp'
  },
  {
    index: 'neutral_evil',
    name: 'Neutral Evil',
    lawAxis: 'Neutral',
    goodAxis: 'Evil',
    desc: 'Pure self-interest uninhibited by sympathy or qualms about breaking laws.',
    bgUrl: '/assets/images/enemy_backgrounds/void3.webp'
  },
  {
    index: 'chaotic_evil',
    name: 'Chaotic Evil',
    lawAxis: 'Chaotic',
    goodAxis: 'Evil',
    desc: 'Driven by passion, greed, or malice with utter disregard for law and life.',
    bgUrl: '/assets/images/enemy_backgrounds/void.webp'
  }
];

export const AlignmentStep: React.FC<{
  newChar: Partial<Character>;
  setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}> = ({ newChar, setNewChar }) => {
  const [allGods, setAllGods] = useState<any[]>([]);
  const [matchingGods, setMatchingGods] = useState<any[]>([]);

  const selectedAlignmentIndex = ALIGNMENT_GRID.find(
    a => a.index === newChar.alignment || a.name.toLowerCase() === newChar.alignment?.toLowerCase()
  )?.index || newChar.alignment || 'neutral_good';

  const selectedOption = ALIGNMENT_GRID.find(a => a.index === selectedAlignmentIndex) || ALIGNMENT_GRID[1];

  useEffect(() => {
    fetch('/assets/atlas/gods/all_gods.json')
      .then(res => res.json())
      .then(data => setAllGods(data))
      .catch(e => console.error("Failed to load gods", e));
  }, []);

  useEffect(() => {
    if (allGods.length > 0 && selectedOption) {
      const matched = allGods.filter(g => {
        const gAlign = typeof g.alignment === 'object' ? g.alignment.index : g.alignment;
        const gAlignName = typeof g.alignment === 'object' ? g.alignment.name : g.alignment;
        return (
          gAlign?.toLowerCase() === selectedOption.index.toLowerCase() ||
          gAlignName?.toLowerCase() === selectedOption.name.toLowerCase()
        );
      });
      setMatchingGods(matched.slice(0, 4));
    }
  }, [allGods, selectedOption]);

  const handleSelectAlignment = (opt: AlignmentOption) => {
    soundService.playEffect('UI_CHARACTER_SELECT');
    setNewChar(prev => ({
      ...prev,
      alignment: opt.index,
      startingAlignment: opt.index
    }));
  };

  return (
    <div className="h-full relative overflow-hidden flex flex-col p-4">
      {/* Blurred Atmospheric Background Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedOption.bgUrl}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.35, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center filter blur-[2px] pointer-events-none z-0"
          style={{ backgroundImage: `url('${selectedOption.bgUrl}')` }}
        />
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col space-y-4 max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar pr-1">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-dragon-gold/20 pb-3">
          <div>
            <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-tight">
              Ethical Ethos & Alignment
            </h2>
            <p className="text-[11px] font-bold text-parchment-600 uppercase tracking-widest">
              Choose the moral compass and world philosophy guiding your hero.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-dragon-gold/15 border border-dragon-gold/30 rounded-sm">
            <GameIcon name="shield" size={14} color="#991B1B" />
            <span className="text-[10px] font-black text-dragon-darkRed uppercase">
              Current: {selectedOption.name}
            </span>
          </div>
        </div>

        {/* 3x3 Grid Section */}
        <div className="grid grid-cols-3 gap-3">
          {ALIGNMENT_GRID.map((opt) => {
            const isSelected = selectedOption.index === opt.index;

            return (
              <button
                key={opt.index}
                onClick={() => handleSelectAlignment(opt)}
                className={cn(
                  "p-3.5 rounded-sm border-2 transition-all flex flex-col justify-between text-left relative overflow-hidden group shadow-sm min-h-[100px]",
                  isSelected
                    ? "bg-dragon-red/90 border-dragon-gold text-white shadow-xl scale-[1.02] z-10"
                    : "bg-white/60 border-dragon-gold/20 text-dragon-darkRed hover:bg-white/80 hover:border-dragon-gold/40"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={cn(
                      "font-header font-black text-xs uppercase tracking-wide",
                      isSelected ? "text-white" : "text-dragon-darkRed"
                    )}
                  >
                    {opt.name}
                  </span>
                  {isSelected && (
                    <GameIcon name="check" size={12} color="#FFFFFF" />
                  )}
                </div>

                <p
                  className={cn(
                    "text-[10px] font-medium leading-tight line-clamp-3",
                    isSelected ? "text-parchment-100" : "text-parchment-800"
                  )}
                >
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Details & Associated Gods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Alignment Overview */}
          <div className="md:col-span-2 p-4 bg-white/70 border border-dragon-gold/30 rounded-sm shadow-sm space-y-2">
            <h4 className="text-[10px] font-black text-dragon-red uppercase tracking-[0.2em] flex items-center gap-2">
              <GameIcon name="scroll" size={14} color="currentColor" />
              Manifested Ethos: {selectedOption.name}
            </h4>
            <p className="text-[11px] font-bold text-parchment-800 leading-relaxed italic">
              "{selectedOption.desc}"
            </p>
          </div>

          {/* Example Associated Gods / Beliefs */}
          <div className="p-4 bg-dragon-gold/10 border border-dragon-gold/30 rounded-sm shadow-sm space-y-2">
            <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-[0.2em] flex items-center gap-1.5">
              <GameIcon name="book" size={12} color="#B8860B" />
              Example Associated Beliefs
            </h4>
            <div className="space-y-1.5">
              {matchingGods.length > 0 ? (
                matchingGods.map((god, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] border-b border-dragon-gold/15 pb-1">
                    <span className="font-bold text-dragon-darkRed">{god.name}</span>
                    <span className="text-[8px] font-black text-parchment-500 uppercase">{god.domains?.join(', ')}</span>
                  </div>
                ))
              ) : (
                <p className="text-[9px] font-medium text-parchment-600 italic">
                  Diverse pantheons and faiths revere champions of this ethos across Faerûn.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
