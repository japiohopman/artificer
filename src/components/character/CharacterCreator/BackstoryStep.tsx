import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../../../store/useCharacterStore';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { fetchBackgroundJson } from '../../../services/storageService';
import { ai, MODELS } from '../../../services/ai/config';
import { generateName } from '../../../lib/naming';
import { resolvePersonality, generateDeterministicBackstory } from '../../../lib/narrative/narrativeResolver';

interface BackstoryStepProps {
  newChar: Partial<Character>;
  setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
}

const formatTraits = (items: string[]) => {
  return items.map(t => ({ name: t, index: t, desc: t }));
};

export const BackstoryStep: React.FC<BackstoryStepProps> = ({ newChar, setNewChar }) => {
  const [backgroundData, setBackgroundData] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [loadingBg, setLoadingBg] = useState(false);
  const hasAutoPopulated = useRef(false);

  useEffect(() => {
    if (newChar.background) {
      loadBackgroundData(newChar.background);
    }
  }, [newChar.background]);

  const loadBackgroundData = async (index: string) => {
    setLoadingBg(true);
    try {
      const data = await fetchBackgroundJson(index, newChar.ruleset);
      setBackgroundData(data);
    } catch (e) {
      console.error("Failed to load background json", e);
    } finally {
      setLoadingBg(false);
    }
  };

  // Auto-populate missing narrative elements deterministically on load
  useEffect(() => {
    if (hasAutoPopulated.current && newChar.name && newChar.backstory) return;

    let updated = false;
    let nextChar = { ...newChar };

    // 1. Auto-generate Name if missing
    if (!nextChar.name || !nextChar.name.trim()) {
      try {
        const result = generateName({
          species: nextChar.race || 'human',
          subrace: nextChar.subrace,
          gender: nextChar.gender?.toLowerCase() || 'male',
          background: nextChar.background,
          class: nextChar.class,
          alignment: nextChar.alignment,
          seed: `name_${nextChar.race}_${nextChar.class}_${nextChar.background}`
        });
        nextChar.name = result.displayName;
        updated = true;
      } catch (e) {
        console.error("Failed to auto-generate initial name", e);
      }
    }

    // 2. Auto-resolve Personality if empty and background is loaded
    const hasTraits = (nextChar.traits || []).length > 0;
    const hasIdeals = (nextChar.ideals || []).length > 0;
    const hasBonds = (nextChar.bonds || []).length > 0;
    const hasFlaws = (nextChar.flaws || []).length > 0;

    if (!hasTraits && !hasIdeals && !hasBonds && !hasFlaws && backgroundData) {
      const personality = resolvePersonality(
        backgroundData,
        `personality_${nextChar.name}_${nextChar.background}`
      );
      nextChar.traits = formatTraits(personality.traits);
      nextChar.ideals = personality.ideals;
      nextChar.bonds = personality.bonds;
      nextChar.flaws = personality.flaws;
      updated = true;
    }

    // 3. Auto-generate Backstory if missing
    if (!nextChar.backstory || !nextChar.backstory.trim()) {
      const backstory = generateDeterministicBackstory(
        nextChar,
        `backstory_${nextChar.name}_${nextChar.race}_${nextChar.class}`
      );
      nextChar.backstory = backstory;
      updated = true;
    }

    if (updated) {
      hasAutoPopulated.current = true;
      setNewChar(nextChar);
    }
  }, [backgroundData, newChar.background, newChar.race, newChar.class]);

  const handleGenerateMoniker = (seedOverride?: number | string) => {
    try {
      const result = generateName({
        species: newChar.race || 'human',
        subrace: newChar.subrace,
        gender: newChar.gender?.toLowerCase() || 'male',
        background: newChar.background,
        class: newChar.class,
        alignment: newChar.alignment,
        seed: seedOverride ?? Date.now()
      });
      setNewChar(prev => {
        const updated = { ...prev, name: result.displayName };
        // If backstory was unedited code backstory, update backstory to match new name
        if (!prev.backstory || prev.backstory.includes('The Hero') || prev.backstory.includes(prev.name || '')) {
          updated.backstory = generateDeterministicBackstory(updated, Date.now());
        }
        return updated;
      });
    } catch (e) {
      console.error("Failed to auto-generate name", e);
    }
  };

  const handleRandomizeTraits = (seedOverride?: number | string) => {
    if (!backgroundData) return;

    const seed = seedOverride ?? Date.now();
    const personality = resolvePersonality(backgroundData, seed);

    setNewChar(prev => {
      const updated: Partial<Character> = {
        ...prev,
        traits: formatTraits(personality.traits),
        ideals: personality.ideals,
        bonds: personality.bonds,
        flaws: personality.flaws
      };
      // Regenerate backstory deterministically with new personality
      updated.backstory = generateDeterministicBackstory(updated, seed);
      return updated;
    });
  };

  const handleGenerateDeterministicBackstory = (seedOverride?: number | string) => {
    const backstory = generateDeterministicBackstory(newChar, seedOverride ?? Date.now());
    setNewChar(prev => ({ ...prev, backstory }));
  };

  const handleEnhanceWithAi = async () => {
    setIsGeneratingAi(true);
    try {
      const prompt = `
        You are a master storyteller for a high-fantasy Dungeons & Dragons world.
        Refine and enhance the following character backstory into compelling 2-3 paragraph prose:
        
        Name: ${newChar.name || 'Unknown'}
        Race: ${newChar.race} ${newChar.subrace ? `(${newChar.subrace})` : ''}
        Class: ${newChar.class}
        Background: ${newChar.background}
        Alignment: ${newChar.alignment || 'Unknown'}
        
        Personality Traits: ${((newChar.traits as any[]) || []).map(t => typeof t === "string" ? t : t.name).join(', ')}
        Ideals: ${((newChar.ideals as any[]) || []).map(t => typeof t === "string" ? t : t.name).join(', ')}
        Bonds: ${((newChar.bonds as any[]) || []).map(t => typeof t === "string" ? t : t.name).join(', ')}
        Flaws: ${((newChar.flaws as any[]) || []).map(t => typeof t === "string" ? t : t.name).join(', ')}
        
        Current Backstory Draft:
        ${newChar.backstory || ''}

        Maintain a tone consistent with classic heroic fantasy.
        Do not use any labels, headers, or bullet points, just clean narrative prose paragraphs.
      `;

      const result = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: prompt
      });
      
      if (result && result.text) {
        setNewChar(prev => ({ ...prev, backstory: result.text }));
      }
    } catch (e) {
      console.warn("AI backstory enhancement failed or offline; preserving code-generated backstory:", e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Soul Moniker / Name Selection Header */}
      <div className="bg-white/40 border border-dragon-gold/30 rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-dragon-darkRed uppercase tracking-[0.2em] flex items-center gap-2">
            <GameIcon name="identity" size={16} color="#B8860B" />
            Soul Moniker (Character Name)
          </label>
          <button
            type="button"
            onClick={() => handleGenerateMoniker()}
            className="px-3 py-1 bg-dragon-red text-white hover:bg-dragon-darkRed rounded-sm text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow cursor-pointer"
          >
            <GameIcon name="refresh" size={12} color="currentColor" />
            Auto-Generate Name
          </button>
        </div>
        <input
          type="text"
          placeholder="Enter Character Name or Moniker..."
          value={newChar.name || ''}
          onChange={(e) => setNewChar(prev => ({ ...prev, name: e.target.value }))}
          className="w-full text-2xl font-header font-black uppercase bg-white/60 border-b-2 border-dragon-gold/40 focus:border-dragon-red outline-none px-3 py-2 text-dragon-darkRed placeholder:text-parchment-400 placeholder:normal-case placeholder:font-normal"
        />
      </div>

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
              type="button"
              onClick={() => handleRandomizeTraits()}
              disabled={!backgroundData}
              className="px-3 py-1 bg-dragon-red/5 hover:bg-dragon-red/10 border border-dragon-red/20 rounded-sm text-[9px] font-black text-dragon-red uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
               <GameIcon name="refresh" size={10} color="currentColor" />
               Randomize
            </button>
          </div>

          <div className="space-y-4">
            <TraitBox 
               label="Personality Trait" 
               value={typeof newChar.traits?.[0] === 'object' ? (newChar.traits[0] as any).name : (newChar.traits?.[0] || 'Unselected')} 
               icon={<GameIcon name="citation" size={16} color="currentColor" />} 
               color="text-dragon-red"
            />
            <TraitBox 
               label="Ideal" 
               value={typeof newChar.ideals?.[0] === 'object' ? (newChar.ideals[0] as any).name : (newChar.ideals?.[0] || 'Unselected')} 
               icon={<GameIcon name="range" size={16} color="currentColor" />} 
               color="text-blue-600"
            />
            <TraitBox 
               label="Bond" 
               value={typeof newChar.bonds?.[0] === 'object' ? (newChar.bonds[0] as any).name : (newChar.bonds?.[0] || 'Unselected')} 
               icon={<GameIcon name="heart" size={16} color="currentColor" />} 
               color="text-emerald-600"
            />
            <TraitBox 
               label="Flaw" 
               value={typeof newChar.flaws?.[0] === 'object' ? (newChar.flaws[0] as any).name : (newChar.flaws?.[0] || 'Unselected')} 
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
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-black text-dragon-darkRed uppercase tracking-[0.2em] flex items-center gap-2">
               <GameIcon name="wand" size={14} color="#B8860B" />
               The Chronicle
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGenerateDeterministicBackstory()}
                className="px-3 py-1.5 bg-dragon-gold/10 hover:bg-dragon-gold/20 text-dragon-darkRed border border-dragon-gold/40 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Generate deterministic backstory from character inputs without network/AI"
              >
                 <GameIcon name="refresh" size={10} color="currentColor" />
                 Code Backstory
              </button>
              <button
                type="button"
                onClick={handleEnhanceWithAi}
                disabled={isGeneratingAi || !newChar.background}
                className="px-3 py-1.5 bg-dragon-red text-white border border-dragon-red/50 rounded-sm shadow-md text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                title="Optional AI prose enhancement"
              >
                 <GameIcon name={isGeneratingAi ? "refresh" : "magic_effect"} size={10} color="#FFFFFF" className={isGeneratingAi ? "animate-spin" : ""} />
                 AI Scribe
              </button>
            </div>
          </div>

          <div className="relative min-h-[260px] bg-white/40 border border-dragon-gold/20 rounded-sm p-6 shadow-inner overflow-y-auto max-h-[360px] custom-scrollbar flex flex-col group">
            <div className="absolute inset-0 bg-paper-texture opacity-30 mix-blend-multiply pointer-events-none" />
            
            {newChar.backstory ? (
               <div className="relative z-10 text-[11px] font-medium text-parchment-900 leading-relaxed space-y-4">
                  {newChar.backstory.split('\n').filter(p => p.trim()).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-4 relative z-10 py-8">
                  <GameIcon name="book" size={48} color="currentColor" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] max-w-[200px] text-center">
                    The pages are blank. Generate backstory or write your own destiny.
                  </p>
               </div>
            )}

            {isGeneratingAi && (
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
            onChange={(e) => setNewChar(prev => ({ ...prev, backstory: e.target.value }))}
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
