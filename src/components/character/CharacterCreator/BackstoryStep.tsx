import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { fetchBackgroundJson } from '../../../services/storageService';
import { ai, MODELS } from '../../../services/ai/config';

interface BackstoryStepProps {
  newChar: Partial<Character>;
  setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}

export const BackstoryStep: React.FC<BackstoryStepProps> = ({ newChar, setNewChar }) => {
  const [backgroundData, setBackgroundData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingBg, setLoadingBg] = useState(false);

  useEffect(() => {
    if (newChar.background) {
      loadBackgroundData(newChar.background);
    }
  }, [newChar.background]);

  const loadBackgroundData = async (index: string) => {
    setLoadingBg(true);
    try {
      const data = await fetchBackgroundJson(index);
      setBackgroundData(data);
    } catch (e) {
      console.error("Failed to load background json", e);
    } finally {
      setLoadingBg(false);
    }
  };

  const getRandomItem = (arr: any[]) => {
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const handleRandomizeTraits = () => {
    if (!backgroundData) return;

    const suggestions = backgroundData.suggested_characteristics || {};

    setNewChar(prev => ({
      ...prev,
      traits: [getRandomItem(suggestions.traits || [])],
      ideals: [getRandomItem(suggestions.ideals || [])],
      bonds: [getRandomItem(suggestions.bonds || [])],
      flaws: [getRandomItem(suggestions.flaws || [])]
    }));
  };

  const handleGenerateBackstory = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
        You are a master storyteller for a high-fantasy Dungeons & Dragons world.
        Create a compelling, immersive backstory for a D&D character with the following traits:
        
        Name: ${newChar.name || 'Unknown'}
        Race: ${newChar.race} ${newChar.subrace ? `(${newChar.subrace})` : ''}
        Class: ${newChar.class}
        Background: ${newChar.background}
        
        Personality Traits: ${newChar.traits?.join(', ')}
        Ideals: ${newChar.ideals?.join(', ')}
        Bonds: ${newChar.bonds?.join(', ')}
        Flaws: ${newChar.flaws?.join(', ')}
        
        The backstory should be around 2-3 paragraphs. 
        Focus on their origins, why they chose their class, and what drives them to adventure.
        Maintain a tone consistent with classic heroic fantasy.
        Do not use any labels or headers, just the prose.
      `;

      const result = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: prompt
      });
      
      const backstory = result.text;
      setNewChar({ ...newChar, backstory });
    } catch (e) {
      console.error("Failed to generate backstory", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center gap-4 border-b border-dragon-gold/20 pb-4">
        <div className="p-3 bg-dragon-red text-white rounded-sm shadow-xl">
           <GameIcon name="book" size={24} color="#FFFFFF" />
        </div>
        <div>
          <h2 className="text-3xl font-header font-black text-dragon-darkRed uppercase tracking-tight">Crest & Chronicle</h2>
          <p className="text-[11px] font-bold text-parchment-500 uppercase tracking-widest italic">"Every legend begins with a single line of history."</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traits Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-dragon-darkRed uppercase tracking-[0.2em] flex items-center gap-2">
               <GameIcon name="citation" size={14} color="#B8860B" />
               Soul Fragments
            </h3>
            <button 
              onClick={handleRandomizeTraits}
              disabled={!backgroundData}
              className="px-3 py-1 bg-dragon-red/5 hover:bg-dragon-red/10 border border-dragon-red/20 rounded-sm text-[9px] font-black text-dragon-red uppercase tracking-widest transition-all flex items-center gap-2"
            >
               <GameIcon name="refresh" size={10} color="currentColor" />
               Randomize
            </button>
          </div>

          <div className="space-y-4">
            <TraitBox 
               label="Personality Trait" 
               value={newChar.traits?.[0] || 'Unselected'} 
               icon={<GameIcon name="citation" size={16} color="currentColor" />} 
               color="text-dragon-red"
            />
            <TraitBox 
               label="Ideal" 
               value={newChar.ideals?.[0] || 'Unselected'} 
               icon={<GameIcon name="range" size={16} color="currentColor" />} 
               color="text-blue-600"
            />
            <TraitBox 
               label="Bond" 
               value={newChar.bonds?.[0] || 'Unselected'} 
               icon={<GameIcon name="heart" size={16} color="currentColor" />} 
               color="text-emerald-600"
            />
            <TraitBox 
               label="Flaw" 
               value={newChar.flaws?.[0] || 'Unselected'} 
               icon={<GameIcon name="alert" size={16} color="currentColor" />} 
               color="text-amber-600"
            />
          </div>

          {!backgroundData && !loadingBg && (
            <div className="p-4 bg-dragon-red/5 border border-dragon-red/10 rounded-sm text-center">
               <p className="text-[10px] font-bold text-dragon-red/60 italic uppercase">Please select a background first to populate traits.</p>
            </div>
          )}
          {loadingBg && (
             <div className="flex items-center justify-center py-8">
                <GameIcon name="refresh" size={24} color="#B8860B" className="animate-spin" />
             </div>
          )}
        </div>

        {/* Backstory Generation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-dragon-darkRed uppercase tracking-[0.2em] flex items-center gap-2">
               <GameIcon name="wand" size={14} color="#B8860B" />
               The Chronicle
            </h3>
            <button 
              onClick={handleGenerateBackstory}
              disabled={isGenerating || !newChar.background}
              className="px-4 py-2 bg-dragon-red text-white border border-dragon-red/50 rounded-sm shadow-lg shadow-dragon-red/20 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
               <GameIcon name={isGenerating ? "refresh" : "magic_effect"} size={12} color="#FFFFFF" className={isGenerating ? "animate-spin" : ""} />
               Invoke Scribe
            </button>
          </div>

          <div className="relative min-h-[300px] bg-white/40 border border-dragon-gold/20 rounded-sm p-6 shadow-inner overflow-hidden flex flex-col group">
            <div className="absolute inset-0 bg-paper-texture opacity-30 mix-blend-multiply pointer-events-none" />
            
            {newChar.backstory ? (
               <div className="relative z-10 text-[11px] font-medium text-parchment-900 leading-relaxed space-y-4">
                  {newChar.backstory.split('\n').filter(p => p.trim()).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-4 relative z-10">
                  <GameIcon name="book" size={48} color="currentColor" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] max-w-[200px] text-center">
                    The pages are blank. Invoke the scribe or write your own destiny.
                  </p>
               </div>
            )}

            {isGenerating && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 bg-dragon-red rounded-full flex items-center justify-center animate-pulse shadow-xl">
                    <GameIcon name="magic_effect" size={24} color="#FFFFFF" />
                  </div>
                  <span className="text-[10px] font-black text-dragon-red uppercase tracking-widest animate-pulse">Weaving Threads of Fate...</span>
               </div>
            )}
          </div>

          <textarea 
            value={newChar.backstory || ''}
            onChange={(e) => setNewChar({ ...newChar, backstory: e.target.value })}
            placeholder="Type your own backstory here..."
            className="w-full h-32 bg-white/20 border border-dragon-gold/10 rounded-sm p-3 text-[11px] font-medium text-parchment-900 focus:ring-1 focus:ring-dragon-red/20 focus:outline-none placeholder:text-parchment-400 placeholder:italic resize-none custom-scrollbar"
          />
        </div>
      </div>
    </div>
  );
};

const TraitBox: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white/40 border border-dragon-gold/10 rounded-sm p-3 flex gap-4 items-center group hover:bg-white/60 hover:border-dragon-gold/30 transition-all">
    <div className={cn("p-2 rounded-sm bg-white shadow-sm border border-dragon-gold/5", color)}>
       {icon}
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-[8px] font-black uppercase text-parchment-400 tracking-widest block mb-1">{label}</span>
      <p className="text-[10px] font-bold text-parchment-900 truncate leading-none group-hover:text-dragon-red transition-colors">
        {value === 'Unselected' ? <span className="italic opacity-30">{value}</span> : value}
      </p>
    </div>
  </div>
);
