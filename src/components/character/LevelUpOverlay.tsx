import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { normalizeImageUrl } from '../../services/storageService';
import { extractOptionsFromFeature, getChoiceLimit, FeatureOption, getFeatureIcon, getAlignmentIcon, getTraitIcon, getFeatIcon , getMagicSchoolIcon, getLanguageIcon, getBackgroundIcon, getProficiencyIcon, getAttackIcon } from '../../lib/atlasUtils';
import { soundService } from '../../services/soundService';
import { atlasService } from '../../services/atlasService';

import { calculateMaxSpellSlots } from '../../lib/statCalculations';

const Sparkle: React.FC<{ delay: number; x: string; y: string }> = ({ delay, x, y }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1, 0.5, 0], 
      opacity: [0, 1, 1, 0],
      rotate: [0, 180, 360]
    }}
    transition={{ 
      duration: 2, 
      delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className="absolute pointer-events-none z-50"
    style={{ left: x, top: y }}
  >
    <GameIcon name="sparkles" size={12} color="#D4AF37" />
  </motion.div>
);

const STATS = [
  { id: 'str', name: 'Strength', abbr: 'STR' },
  { id: 'dex', name: 'Dexterity', abbr: 'DEX' },
  { id: 'con', name: 'Constitution', abbr: 'CON' },
  { id: 'int', name: 'Intelligence', abbr: 'INT' },
  { id: 'wis', name: 'Wisdom', abbr: 'WIS' },
  { id: 'cha', name: 'Charisma', abbr: 'CHA' }
] as const;

export const LevelUpOverlay: React.FC = () => {
  const { 
    levelUpQueue, 
    dismissLevelUp, 
    characters, 
    updateCharacterStats,
    updateCharacter,
    updateLayerVolume 
  } = useStore();
  
  const levelUpResult = levelUpQueue[0];
  
  const [points, setPoints] = useState(2);
  const [tempStats, setTempStats] = useState<Record<string, number>>({});
  const [originalStats, setOriginalStats] = useState<Record<string, number>>({});
  const [featureChoices, setFeatureChoices] = useState<Record<string, string[]>>({});
  const [optionDetails, setOptionDetails] = useState<Record<string, string>>({});
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [expandedMainFeatures, setExpandedMainFeatures] = useState<any[]>([]);
  const [subclassFeatures, setSubclassFeatures] = useState<any[]>([]);
  
  const character = characters.find(c => c.id === levelUpResult?.characterId);

  useEffect(() => {
    if (levelUpResult && character) {
      setOriginalStats(character.stats || {});
      setTempStats(character.stats || {});
      setPoints(2);
      setFeatureChoices({});
      setOptionDetails({});
      setAnimationsComplete(false);
      setExpandedMainFeatures([]);
      setSubclassFeatures([]);
      
      // Load full feature data for main features
      const loadMainFeatures = async () => {
        const expanded = await Promise.all(levelUpResult.features.map(async (feat) => {
          if (feat.choice || feat.feature_specific) return feat;
          const full = await atlasService.loadFeature(feat.index);
          return full ? { ...feat, ...full } : feat;
        }));
        setExpandedMainFeatures(expanded);

        // Load descriptions for choices in main features
        expanded.forEach(async (feat) => {
          const options = extractOptionsFromFeature(feat);
          for (const opt of options) {
            if (opt.desc) {
              setOptionDetails(prev => ({ ...prev, [opt.index]: opt.desc! }));
            }

            atlasService.loadFeature(opt.index).then(fullFeat => {
              if (fullFeat && fullFeat.desc) {
                const description = Array.isArray(fullFeat.desc) ? fullFeat.desc.join('\n') : fullFeat.desc;
                setOptionDetails(prev => ({ ...prev, [opt.index]: description }));
              }
            });
          }
        });
      };
      loadMainFeatures();
      
      // Delay button appearance to let animations play
      const timer = setTimeout(() => setAnimationsComplete(true), 2500);
      
      // Audio transition
      updateLayerVolume(1, 0);
      updateLayerVolume(4, 0);
      soundService.playEffect('LEVEL_UP');

      return () => clearTimeout(timer);
    }
  }, [levelUpResult?.characterId, levelUpResult?.newLevel]); // More specific triggers

  useEffect(() => {
    if (!levelUpResult) return;

    const subclassEntries = Object.entries(featureChoices).filter(([key]) => 
      key.toLowerCase().includes('archetype') || 
      key.toLowerCase().includes('subclass') ||
      key.toLowerCase().includes('tradition') ||
      key.toLowerCase().includes('circle') ||
      key.toLowerCase().includes('oath') ||
      key.toLowerCase().includes('college') ||
      key.toLowerCase().includes('patron') ||
      key.toLowerCase().includes('origin')
    );

    if (subclassEntries.length > 0) {
      const subclassIndex = subclassEntries[0][1][0];
      if (subclassIndex) {
        atlasService.loadSubclass(subclassIndex).then(async (subData) => {
          if (subData && subData.features) {
            const currentLevelFeatures = subData.features.filter((f: any) => f.level === levelUpResult.newLevel);
            
            // Expand subclass features
            const expanded = await Promise.all(currentLevelFeatures.map(async (f: any) => {
              const full = await atlasService.loadFeature(f.index);
              return full ? { ...f, ...full } : f;
            }));
            
            setSubclassFeatures(expanded);

            // Load descriptions for choices in subclass features
            expanded.forEach((feat) => {
              const options = extractOptionsFromFeature(feat);
              options.forEach(opt => {
                if (opt.desc) {
                  setOptionDetails(prev => ({ ...prev, [opt.index]: opt.desc! }));
                }
              });
            });
          }
        });
      }
    } else if (character?.subclass) {
      // If character already has a subclass, check it for new features at this level
      atlasService.loadSubclass(character.subclass).then(async (subData) => {
        if (subData && subData.features) {
          const currentLevelFeatures = subData.features.filter((f: any) => f.level === levelUpResult.newLevel);
          
          // Expand subclass features
          const expanded = await Promise.all(currentLevelFeatures.map(async (f: any) => {
            const full = await atlasService.loadFeature(f.index);
            return full ? { ...f, ...full } : f;
          }));
          
          setSubclassFeatures(expanded);
        }
      });
    }
  }, [featureChoices, levelUpResult?.newLevel, character?.subclass]);

  if (!levelUpResult || !character) return null;

  const handleStatChange = (statId: string, delta: number) => {
    const currentVal = tempStats[statId] || 10;
    const originalVal = originalStats[statId] || 10;
    
    // Limits
    if (delta > 0 && points <= 0) return;
    if (delta < 0 && currentVal <= originalVal) return;
    if (delta > 0 && currentVal >= 20) return;

    setTempStats(prev => ({ ...prev, [statId]: currentVal + delta }));
    setPoints(prev => prev - delta);
  };

  const handleComplete = () => {
    if (levelUpResult.hasASI && points > 0) return false; // Must spend all points
    
    const allFeatures = [...expandedMainFeatures, ...subclassFeatures];
    const featuresWithChoices = allFeatures.filter(f => 
       f.choice || 
       f.feature_specific?.subfeature_options || 
       isExpertise(f)
    );
    for (const feat of featuresWithChoices) {
      const selections = featureChoices[feat.index] || [];
      
      let limit = getChoiceLimit(feat);
      if (limit === 0 && isExpertise(feat)) {
        limit = 2; // Default for Rogue 1st level expertise
      }
      if (limit === 0) limit = 1;

      if (selections.length < limit) return;
    }

    if (levelUpResult.hasASI) {
      updateCharacterStats(character.id, tempStats);
    }

    const currentChoices = JSON.parse(JSON.stringify(character.choices || {}));
    const newFeatures = [...(character.features || [])];
    
    // Add subclass features (avoid duplicates)
    subclassFeatures.forEach(sf => {
      if (!newFeatures.some(f => f.index === sf.index)) {
        newFeatures.push({
          name: sf.name,
          index: sf.index,
          desc: Array.isArray(sf.desc) ? sf.desc.join('\n') : (sf.desc || ''),
          source: 'Subclass'
        });
      }
    });

    if (Object.keys(featureChoices).length > 0) {
      // Specifically handle expertise and subclasses to match CharacterStats convention
      Object.entries(featureChoices).forEach(([featIndex, selections]) => {
        currentChoices[featIndex] = selections;
        
        const lowerIndex = featIndex.toLowerCase();
        if (lowerIndex.includes('fighting_style')) {
           currentChoices['fighting-style'] = [...(currentChoices['fighting-style'] || []), ...selections];
        }
        if (lowerIndex.includes('expertise')) {
          currentChoices['expertise'] = [...(currentChoices['expertise'] || []), ...selections];
        }
        if (lowerIndex.includes('martial_archetype') || 
            lowerIndex.includes('subclass') || 
            lowerIndex.includes('archetype') || 
            lowerIndex.includes('arcane_tradition') ||
            lowerIndex.includes('druid_circle') ||
            lowerIndex.includes('sacred_oath') ||
            lowerIndex.includes('ranger_archetype') ||
            lowerIndex.includes('monastic_tradition') ||
            lowerIndex.includes('bard_college') ||
            lowerIndex.includes('otherworldly_patron') ||
            lowerIndex.includes('sorcerous_origin')) {
          currentChoices['subclass'] = selections[0]; // Usually just one
        }
      });
    }

    const updateData: any = { 
      choices: currentChoices,
      features: newFeatures
    };
    
    if (currentChoices['subclass']) {
      updateData.subclass = currentChoices['subclass'];
    }
    
    updateCharacter(character.id, updateData);
    
    // Restore audio
    updateLayerVolume(1, 0.5);
    updateLayerVolume(4, 0.4);
    
    dismissLevelUp();
  };

  const handleToggleChoice = (featIndex: string, optionIndex: string, limit: number) => {
    setFeatureChoices(prev => {
      const current = prev[featIndex] || [];
      if (current.includes(optionIndex)) {
        return { ...prev, [featIndex]: current.filter(i => i !== optionIndex) };
      }
      if (current.length >= limit) return prev;
      return { ...prev, [featIndex]: [...current, optionIndex] };
    });
  };

  const getOptionsForChoice = (feat: any) => {
    // 1. Basic extraction from feature data
    const options = extractOptionsFromFeature(feat);
    
    // 2. If it's expertise, prioritize character proficiencies filtering
    if (isExpertise(feat)) {
      const currentProfs = character.proficiencies || [];
      
      if (options.length > 0) {
        // Filter JSON options by what character already has
        const filtered = options.filter(opt => {
           const normalizedName = opt.name.toLowerCase()
             .replace(/fighting style:\s*/i, '')
             .replace(/expertise:\s*/i, '')
             .trim();
           
           return currentProfs.some(p => p.toLowerCase() === normalizedName || p.toLowerCase() === opt.index.toLowerCase());
        });
        if (filtered.length > 0) return filtered;
      }
      
      // Fallback to all current proficiencies if pool is empty or filtering failed
      if (currentProfs.length > 0) {
        return currentProfs.map(p => ({
          index: p,
          name: p
        }));
      }
    }

    if (options.length > 0) return options;

    const choice = feat.choice || feat.feature_specific?.subfeature_options;
    if (!choice) return [];

    // 1. Direct options array
    if (choice.from?.options) {
      return choice.from.options.map((opt: any) => ({
        index: opt.index || opt.item?.index || opt.name,
        name: opt.name || opt.item?.name || opt.index
      }));
    }

    // 2. Option set type is proficiencies
    if (choice.from?.option_set_type === 'proficiencies' || choice.type === 'proficiencies') {
      if (isExpertise(feat)) {
        // Choose from existing proficiencies
        return (character.proficiencies || []).map(p => ({
          index: p,
          name: p
        }));
      } else {
        // Gain new proficiency - show skills not already possessed
        // We use a simplified list of standard skills if the JSON doesn't specify
        const ALL_SKILLS = [
          'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 
          'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 
          'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 
          'Sleight of Hand', 'Stealth', 'Survival'
        ];
        
        return ALL_SKILLS
          .filter(s => !character.proficiencies.includes(s))
          .map(s => ({ index: s, name: s }));
      }
    }
    
    return [];
  };

  const isComplete = () => {
    if (levelUpResult.hasASI && points > 0) return false;
    
    const allFeatures = [...expandedMainFeatures, ...subclassFeatures];
    const featuresWithChoices = allFeatures.filter(f => 
      f.choice || 
      f.feature_specific?.subfeature_options || 
      isExpertise(f)
    );
    
    for (const feat of featuresWithChoices) {
      const selections = featureChoices[feat.index] || [];
      let limit = getChoiceLimit(feat);
      if (limit === 0 && isExpertise(feat)) {
        limit = 2;
      }
      if (limit === 0) limit = 1;
      
      if (selections.length < limit) return false;
    }
    return true;
  };

  const isExpertise = (feat: any) => {
    return feat.index?.toLowerCase().includes('expertise') || feat.name?.toLowerCase().includes('expertise');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        {/* Immersive Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Content Card - Parchment Theme */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.1, opacity: 0 }}
          className="relative w-full max-w-5xl rounded shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-visible"
          style={{
            backgroundImage: `url('https://app-uploads.krea.ai/5ee072e5-3e9c-48b1-afb5-8e28691f52f0/1776054260573-old_paper.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Header Shield/Emblem */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-dragon-darkRed rounded-full border-4 border-dragon-gold shadow-2xl flex items-center justify-center z-20">
             <GameIcon name={character.class?.toLowerCase()} fallbackName="award" size={48} color="#D4AF37" />
          </div>

          <div className="relative z-10 flex flex-col h-full max-h-[92vh]">
            {/* Header Section */}
            <div className="bg-dragon-darkRed/95 backdrop-blur-sm pt-[35px] pb-[35px] text-center relative overflow-hidden">
               {/* Decorative Lines */}
               <div className="absolute top-1/2 left-0 right-0 h-px bg-dragon-gold/30 -translate-y-1/2" />
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-dragon-gold to-transparent" />
               
               {/* Sparkle Effects */}
               <Sparkle delay={0} x="10%" y="20%" />
               <Sparkle delay={0.5} x="85%" y="40%" />
               <Sparkle delay={1.2} x="20%" y="70%" />
               <Sparkle delay={0.8} x="75%" y="15%" />

               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="relative px-8"
               >
                  <h2 className="text-[43px] font-cinzel font-black text-dragon-gold uppercase tracking-[0.3em] mb-1 shadow-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Level Ascended</h2>
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent to-dragon-gold/60" />
                    <span className="text-parchment-200 font-bold uppercase tracking-[0.4em] text-[10px]">
                      {character.name} is now Level {levelUpResult.newLevel}
                    </span>
                    <div className="h-px w-24 bg-gradient-to-l from-transparent to-dragon-gold/60" />
                  </div>
               </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-8 relative">
               <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none z-[1]" />
               <div className="absolute inset-0 bg-parchment-100/10 pointer-events-none z-[2]" />
               
               <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  
                  {/* LEFT PANEL: Profile & Stats */}
                  <div className="space-y-10">
                    {/* Header Info - Moved to Top */}
                    <div className="text-center relative py-4">
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <GameIcon name="award" size={14} color="#D4AF37" className="animate-pulse" />
                          <div className="h-px w-12 bg-dragon-gold/30" />
                          <GameIcon name="award" size={14} color="#D4AF37" className="animate-pulse" />
                       </div>
                       <h3 className="text-[32px] font-cinzel font-black text-dragon-darkRed uppercase tracking-[0.2em]"><GameIcon name={character.class?.toLowerCase()} size={24} color="currentColor" fallbackName="award" /> {character.class}</h3>
                       <p className="text-[11px] font-black text-parchment-500 uppercase tracking-[0.3em] mt-1"><GameIcon name={character.race?.toLowerCase().replace(/-/g, "_")} size={12} color="currentColor" fallbackName="award" /> {character.race} // <GameIcon name={getAlignmentIcon(character.alignment || "neutral")} size={12} color="currentColor" fallbackName="award" /> {character.alignment}</p>
                    </div>

                    {/* Profile Frame & Info */}
                    <div className="flex flex-col items-center gap-6">
                       <div className="relative w-full max-w-[340px] aspect-[4/3] drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] -mt-4">
                          {character.imageUrl ? (
                             <>
                                <ChromaKeyImage 
                                   src={normalizeImageUrl(character.imageUrl, 'character', character.id)} 
                                   alt={character.name} 
                                   className="w-full h-full object-contain relative z-20" 
                                   threshold={60}
                                />
                                <div className="absolute inset-x-20 inset-y-10 bg-dragon-red/10 blur-[90px] rounded-full pointer-events-none z-10" />
                             </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-dragon-darkRed/20">
                              <GameIcon name="user" size={64} />
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Core Attribute Gains */}
                    <div className="grid grid-cols-2 gap-6">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-black/5 p-5 rounded-sm text-center relative group overflow-hidden flex flex-col items-center"
                      >
                         <span className="text-[9px] font-black text-parchment-400 uppercase tracking-[0.2em] mb-3 block">Vitality Matrix</span>
                         <div className="flex items-center justify-center gap-4">
                            <div className="flex flex-col items-end">
                               <span className="text-[10px] font-bold text-parchment-400 line-through opacity-50">{character.maxHp - levelUpResult.hpIncrease}</span>
                               <span className="text-3xl font-header font-black text-dragon-red leading-none">
                                  {character.maxHp}
                               </span>
                            </div>
                            <div className="flex flex-col items-center">
                               <motion.div
                                 animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                                 transition={{ duration: 1.5, repeat: Infinity }}
                               >
                                 <GameIcon name="zap" size={14} color="#D4AF37" />
                               </motion.div>
                               <span className="text-[10px] font-black text-dragon-gold">+{levelUpResult.hpIncrease}</span>
                            </div>
                            <GameIcon name="hp" size={32} color="#8B0000" className="drop-shadow-smAlpha" />
                         </div>
                      </motion.div>

                      <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-black/10 p-5 rounded-sm text-center relative group overflow-hidden"
                      >
                         <span className="text-[9px] font-black text-parchment-400 uppercase tracking-[0.2em] mb-2 block">Task Proficiency</span>
                         <div className="flex items-center justify-center gap-3">
                            <GameIcon name="award" size={24} color="#D4AF37" className="drop-shadow-smAlpha" />
                            <span className="text-3xl font-header font-black text-dragon-darkRed">
                               +{Math.floor(2 + (levelUpResult.newLevel - 1) / 4)}
                            </span>
                         </div>
                         <span className="text-[8px] font-bold text-dragon-gold/60 uppercase tracking-widest mt-1">Tier Advancement</span>
                      </motion.div>
                    </div>

                    {/* Spell Slots Advancement */}
                    {(() => {
                        const oldSlots = calculateMaxSpellSlots(character);
                        
                        // Find current subclass selection in feature choices
                        let newSubclass = character.subclass;
                        Object.entries(featureChoices).forEach(([key, val]) => {
                          const k = key.toLowerCase();
                          if ((k.includes('archetype') || k.includes('subclass') || k.includes('tradition') || k.includes('circle') || k.includes('oath') || k.includes('college') || k.includes('origin') || k.includes('patron')) && val[0]) {
                            newSubclass = val[0];
                          }
                        });

                        const newCharacter = { ...character, level: levelUpResult.newLevel, subclass: newSubclass };
                        const newSlots = calculateMaxSpellSlots(newCharacter as any);
                        
                        const slotLevels = Array.from(new Set([...Object.keys(oldSlots), ...Object.keys(newSlots)]))
                          .sort((a, b) => parseInt(a) - parseInt(b));
                          
                        const hasChanges = slotLevels.some(lvl => newSlots[lvl] !== oldSlots[lvl]);

                        if (!hasChanges) return null;

                        return (
                          <div className="space-y-4 pt-6">
                            <div className="flex items-center gap-4">
                               <div className="h-px flex-1 bg-gradient-to-r from-transparent to-dragon-darkRed/20" />
                               <span className="text-[12px] font-black text-dragon-darkRed uppercase tracking-[0.4em] italic">Weave Refinement</span>
                               <div className="h-px flex-1 bg-gradient-to-l from-transparent to-dragon-darkRed/20" />
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                               {slotLevels.map(lvl => {
                                  const oldVal = oldSlots[lvl] || 0;
                                  const newVal = newSlots[lvl] || 0;
                                  const isNew = newVal > oldVal;
                                  
                                  return (
                                    <motion.div 
                                      key={lvl}
                                      initial={isNew ? { scale: 0.8, opacity: 0 } : false}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className={cn(
                                        "p-2 rounded-sm border flex flex-col items-center gap-1 transition-all",
                                        isNew ? "bg-dragon-gold/10 border-dragon-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "bg-black/5 border-transparent"
                                      )}
                                    >
                                       <span className="text-[8px] font-black text-parchment-400 uppercase tracking-tighter">LVL {lvl}</span>
                                       <div className="flex items-center gap-1.5">
                                          {isNew && (
                                            <span className="text-[10px] font-black text-dragon-gold line-through opacity-50">{oldVal}</span>
                                          )}
                                          <span className={cn("text-lg font-header font-black", isNew ? "text-dragon-gold" : "text-dragon-darkRed")}>
                                            {newVal}
                                          </span>
                                       </div>
                                       {isNew && (
                                          <motion.div 
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-[7px] font-black text-dragon-gold uppercase tracking-widest"
                                          >
                                            NEW SLOT
                                          </motion.div>
                                       )}
                                    </motion.div>
                                  );
                               })}
                            </div>
                          </div>
                        );
                    })()}
                  </div>

                  {/* RIGHT PANEL: Features & ASI */}
                  <div className="space-y-10">
                    {/* New Features */}
                    {levelUpResult.features.length > 0 && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-4">
                           <div className="h-px flex-1 bg-gradient-to-r from-transparent to-dragon-darkRed/20" />
                           <span className="text-[12px] font-black text-dragon-darkRed uppercase tracking-[0.4em] italic">Features Gained</span>
                           <div className="h-px flex-1 bg-gradient-to-l from-transparent to-dragon-darkRed/20" />
                        </div>
                        <div className="grid gap-4">
                           {[...expandedMainFeatures, ...subclassFeatures].map((feat, idx) => {
                             const options = getOptionsForChoice(feat);
                             const selections = featureChoices[feat.index] || [];
                             const isSubclassFeature = subclassFeatures.some(sf => sf.index === feat.index);
                             const limit = getChoiceLimit(feat) || (isExpertise(feat) ? 2 : 0);
                             const hasChoice = (options.length > 0) || (isExpertise(feat) && options.length > 0);
                             const featDescLines = Array.isArray(feat.full_desc) ? feat.full_desc : [feat.desc || ''];

                             return (
                               <motion.div 
                                 key={feat.index} 
                                 initial={{ x: 20, opacity: 0 }}
                                 animate={{ x: 0, opacity: 1 }}
                                 transition={{ delay: 0.3 + (idx * 0.1) }}
                                 className="flex flex-col gap-1"
                               >
                                 <div className={cn(
                                   "group bg-gradient-to-r from-black/5 to-transparent p-4 rounded-sm flex gap-5 items-start relative transition-all hover:bg-black/10 border-l-4",
                                   isSubclassFeature ? "border-dragon-red/60 bg-dragon-red/5" : "border-dragon-gold/40"
                                 )}>
                                   <div className="w-12 h-12 bg-white/20 rounded border border-dragon-gold/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform mt-1">
                                      <GameIcon name={getFeatureIcon(feat.index, feat.name)} size={26} color={isSubclassFeature ? "#8B0000" : "#D4AF37"} fallbackName="award" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-lg font-header font-black text-dragon-darkRed uppercase leading-none tracking-widest">{feat.name}</h4>
                                        {isSubclassFeature && (
                                          <span className="text-[7px] font-black bg-dragon-red/10 text-dragon-red px-1.5 py-0.5 rounded-full uppercase tracking-widest">Archetype Path</span>
                                        )}
                                      </div>
                                      <div className="space-y-1.5">
                                        {featDescLines.filter(Boolean).map((line: string, lIdx: number) => (
                                          <p key={lIdx} className="text-[11px] text-parchment-700 leading-relaxed font-medium opacity-90">{line}</p>
                                        ))}
                                      </div>
                                   </div>
                                 </div>

                                 {/* Choice Selection UI */}
                                 {hasChoice && (
                                   <div className="mt-2 mb-6 ml-6 pl-8 border-l-2 border-dragon-gold/20 space-y-5 py-2">
                                     <div className="flex items-center justify-between">
                                       <div className="flex flex-col">
                                         <span className="text-[13px] font-black text-dragon-darkRed uppercase tracking-[0.2em]">
                                            Select Specialty
                                         </span>
                                         <span className="text-[10px] font-bold text-parchment-500 uppercase tracking-widest">
                                           Choose {limit} option{limit > 1 ? 's' : ''} to manifest
                                         </span>
                                       </div>
                                       
                                       <div className="flex items-center gap-3">
                                         <div className="text-[14px] font-black text-dragon-darkRed tabular-nums">
                                           {selections.length} / {limit}
                                         </div>
                                         {selections.length < limit && (
                                           <motion.div 
                                             animate={{ scale: [1, 1.1, 1] }}
                                             transition={{ duration: 1.5, repeat: Infinity }}
                                             className="flex items-center gap-2 px-2 py-1 bg-dragon-red/10 rounded-sm"
                                           >
                                             <div className="w-1.5 h-1.5 rounded-full bg-dragon-red shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                             <span className="text-[9px] font-black text-dragon-red uppercase tracking-widest">Awaiting Selection</span>
                                           </motion.div>
                                         )}
                                       </div>
                                     </div>

                                     <div className="grid grid-cols-1 gap-3">
                                       {options.map((opt: any) => {
                                         const isSelected = selections.includes(opt.index);
                                         const description = optionDetails[opt.index] || opt.desc;

                                         return (
                                           <button
                                             key={opt.index}
                                             onClick={() => handleToggleChoice(feat.index, opt.index, limit)}
                                             className={cn(
                                               "group/opt text-left p-4 rounded-sm border-2 transition-all uppercase flex flex-col gap-2 relative overflow-hidden",
                                               isSelected 
                                                 ? "bg-dragon-darkRed text-dragon-gold border-dragon-gold shadow-[0_10px_20px_-5px_rgba(139,0,0,0.4)]" 
                                                 : "bg-white/40 border-dragon-gold/10 text-parchment-600 hover:bg-white hover:border-dragon-gold/40 hover:translate-x-1"
                                             )}
                                           >
                                             <div className="flex items-center justify-between gap-4 relative z-10 w-full">
                                               <div className="flex items-center gap-4">
                                                 <div className={cn(
                                                   "w-5 h-5 rounded-sm border-2 shrink-0 flex items-center justify-center transition-all",
                                                   isSelected ? "bg-dragon-gold border-dragon-gold rotate-45" : "bg-transparent border-dragon-darkRed/20 group-hover/opt:border-dragon-darkRed/40"
                                                 )}>
                                                   {isSelected && (
                                                     <motion.div 
                                                       initial={{ scale: 0 }}
                                                       animate={{ scale: 1 }}
                                                       className="-rotate-45"
                                                     >
                                                       <GameIcon name="check" size={12} color="#8B0000" />
                                                     </motion.div>
                                                   )}
                                                 </div>
                                                 <div className="flex items-center gap-3">
                                                   <GameIcon name={getFeatureIcon(opt.index, opt.name)} size={16} color={isSelected ? "#D4AF37" : "#8B0000"} className="opacity-60 group-hover/opt:opacity-100 transition-opacity" fallbackName="award" />
                                                   <span className="font-header font-black tracking-widest text-sm">
                                                     {opt.name.replace(/fighting style:\s*/i, '')
                                                              .replace(/expertise:\s*/i, '')
                                                              .replace(/martial archetype:\s*/i, '')
                                                              .replace(/archetype:\s*/i, '')
                                                              .replace(/arcane tradition:\s*/i, '')
                                                              .replace(/druid circle:\s*/i, '')
                                                              .replace(/sacred oath:\s*/i, '')
                                                              .replace(/ranger archetype:\s*/i, '')
                                                              .replace(/monastic tradition:\s*/i, '')
                                                              .replace(/bard college:\s*/i, '')
                                                              .replace(/otherworldly patron:\s*/i, '')
                                                              .replace(/sorcerous origin:\s*/i, '')
                                                     }
                                                   </span>
                                                 </div>
                                               </div>
                                             </div>
                                             
                                             {description && (
                                               <div className={cn(
                                                 "text-[10px] leading-relaxed font-medium transition-colors ml-9 normal-case",
                                                 isSelected ? "text-dragon-gold/80" : "text-parchment-500"
                                               )}>
                                                 {description}
                                               </div>
                                             )}

                                             {isSelected && (
                                               <motion.div 
                                                 layoutId={`check-${feat.index}`}
                                                 className="absolute right-0 top-0 bottom-0 w-1 bg-dragon-gold"
                                               />
                                             )}
                                           </button>
                                         );
                                       })}
                                     </div>
                                   </div>
                                 )}
                               </motion.div>
                             );
                           })}
                        </div>
                      </div>
                    )}

                    {/* ASI Improvement UI */}
                    {levelUpResult.hasASI && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 pt-10 border-t border-dragon-darkRed/10"
                      >
                         <div className="flex items-center justify-between">
                           <div className="flex flex-col gap-1">
                              <span className="text-[14px] font-black text-dragon-darkRed uppercase tracking-[0.4em]">Ability Score Improvement</span>
                              <span className="text-[11px] text-parchment-500 font-bold uppercase tracking-widest">Apply points to evolve core attributes</span>
                           </div>
                           <div className="px-5 py-3 bg-dragon-darkRed text-dragon-gold rounded-sm border-2 border-dragon-gold text-[13px] font-black shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                              {points} PTS
                           </div>
                         </div>

                         <div className="grid grid-cols-1 gap-4">
                            {STATS.map(stat => {
                              const val = tempStats[stat.id] || 10;
                              const origVal = originalStats[stat.id] || 10;
                              const diff = val - origVal;
                              
                              return (
                                <div key={stat.id} className="bg-black/5 p-4 rounded-sm flex items-center justify-between group hover:bg-black/10 transition-all border-b border-transparent hover:border-dragon-gold/20">
                                   <div className="flex items-center gap-5">
                                      <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center border border-dragon-gold/5 group-hover:bg-dragon-gold/10 transition-all shrink-0">
                                         {true ? (
                                             <GameIcon name={stat.abbr.toLowerCase()} size={24} color="#8B0000" />
                                         ) : (
                                           <GameIcon name="award" size={24} color="#4A4A4A" className="opacity-40 group-hover:opacity-100" />
                                         )}
                                      </div>
                                      <div>
                                         <div className="text-[10px] font-black text-parchment-400 uppercase tracking-[0.2em] mb-1">{stat.name}</div>
                                         <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-header font-black text-dragon-darkRed tabular-nums">{val}</span>
                                            {diff > 0 && (
                                              <motion.span 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-xs font-black text-green-600 px-1.5 py-0.5 bg-green-100 rounded-full"
                                              >
                                                +{diff}
                                              </motion.span>
                                            )}
                                         </div>
                                      </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => handleStatChange(stat.id, -1)}
                                        disabled={val <= origVal}
                                        className="w-10 h-10 rounded-full bg-white/60 border border-dragon-gold/10 flex items-center justify-center text-dragon-darkRed hover:bg-dragon-red hover:text-white disabled:opacity-5 transition-all font-black text-lg shadow-sm"
                                      >
                                        -
                                      </button>
                                      <button 
                                        onClick={() => handleStatChange(stat.id, 1)}
                                        disabled={points <= 0 || val >= 20}
                                        className="w-12 h-12 rounded-full bg-dragon-gold/20 border-2 border-dragon-gold flex items-center justify-center text-dragon-darkRed hover:bg-dragon-gold hover:text-white disabled:opacity-5 transition-all font-black text-2xl shadow-md"
                                      >
                                        +
                                      </button>
                                   </div>
                                </div>
                              );
                            })}
                         </div>
                      </motion.div>
                    )}
                  </div>
               </div>
            </div>

            {/* Evolution Seal Button (Fixed) */}
            <AnimatePresence>
              {isComplete() && animationsComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[2100]"
                >
                  <button 
                    onClick={handleComplete}
                    className="group relative flex flex-col items-center gap-2"
                  >
                     {/* Outer Ring Glow */}
                     <div className="absolute inset-0 bg-dragon-gold/20 blur-2xl rounded-full animate-pulse" />
                     
                     <div className="w-24 h-24 rounded-full bg-dragon-darkRed border-4 border-dragon-gold shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group-hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]">
                        <GameIcon name="advance" size={48} color="#D4AF37" className="drop-shadow-lg" />
                        
                        {/* Inner Spinning Ring */}
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-1 rounded-full border border-dashed border-dragon-gold/30"
                        />
                     </div>
                     
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: 0.5 }}
                       className="px-4 py-1.5 bg-black/80 backdrop-blur-sm rounded-sm border border-dragon-gold/20 shadow-xl"
                     >
                        <span className="text-[10px] font-black text-dragon-gold uppercase tracking-[0.4em] whitespace-nowrap">Manifest Evolution</span>
                     </motion.div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
