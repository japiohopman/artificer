import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import { cn } from '../../lib/utils';
import { ChromaKeyImage } from '../ui/ChromaKeyImage';
import { normalizeImageUrl, fetchSubclassesList } from '../../services/storageService';
import { extractStructuredOptionsFromFeature, getChoiceLimit, getFeatureIcon, getAlignmentIcon } from '../../lib/atlasUtils';
import { soundService } from '../../services/soundService';
import { atlasService } from '../../services/atlasService';
import { CLASS_DATA } from '../../lib/characterUtils';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useAudioStore } from '../../store/useAudioStore';

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
    <GameIcon name="magic_effect" size={12} color="#D4AF37" />
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
    activeLevelUpSession,
    cancelLevelUpSession,
    updateLevelUpSession,
    commitLevelUpSession,
    characters
  } = useCharacterStore();

  const { updateLayerVolume } = useAudioStore();

  const [optionDetails, setOptionDetails] = useState<Record<string, string>>({});
  const [subclassOptions, setSubclassOptions] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const session = activeLevelUpSession;
  const character = characters.find(c => c.id === session?.characterId);

  const conModifier = Math.floor((((character?.stats?.con || 10) + (session?.statIncreases?.con || 0) - 10)) / 2);
  const classHitDie = character ? (CLASS_DATA[character.class]?.hitDie || 8) : 8;
  const fixedHpGain = session?.hpIncrease || Math.max(1, Math.floor(classHitDie / 2) + 1 + conModifier);

  useEffect(() => {
    if (session && character) {
      setCurrentStepIndex(0);
      updateLayerVolume(1, 0);
      updateLayerVolume(4, 0);
      soundService.playEffect('LEVEL_UP');

      const hasSubclassGrant = session.features.some(f =>
        f.feature_specific?.subfeature_options?.type === 'subclass'
      );

      if (hasSubclassGrant) {
        fetchSubclassesList(character.ruleset, character.class).then(async (list) => {
          if (list && list.length > 0) {
            setSubclassOptions(list);
            for (const s of list) {
              const subData = await atlasService.loadSubclass(s.index, character.ruleset);
              if (subData) {
                const desc = Array.isArray(subData.desc) ? subData.desc.join('\n') : (subData.desc || '');
                setOptionDetails(prev => ({ ...prev, [s.index]: desc }));
              }
            }
          }
        });
      }

      session.features.forEach((feat) => {
        const options = extractStructuredOptionsFromFeature(feat);
        options.forEach(opt => {
          if (opt.desc) {
            setOptionDetails(prev => ({ ...prev, [opt.index]: opt.desc! }));
          } else {
            atlasService.loadFeature(opt.index).then(fullFeat => {
              if (fullFeat && fullFeat.desc) {
                const desc = Array.isArray(fullFeat.desc) ? fullFeat.desc.join('\n') : fullFeat.desc;
                setOptionDetails(prev => ({ ...prev, [opt.index]: desc }));
              }
            });
          }
        });
      });
    }
  }, [session?.characterId, session?.targetLevel]);

  if (!session || !character) return null;

  const getOptionsForChoice = (feat: any) => {
    const isSubclassChoice = feat.feature_specific?.subfeature_options?.type === 'subclass';

    if (isSubclassChoice && subclassOptions.length > 0) {
      return subclassOptions.map(s => ({
        index: s.index,
        name: s.name
      }));
    }

    return extractStructuredOptionsFromFeature(feat);
  };

  const choiceFeatures = session.features.filter(f => getOptionsForChoice(f).length > 0);

  // Progression Wizard Steps
  const wizardSteps: { id: string; title: string }[] = [
    { id: 'summary', title: 'Grants & Vitality' }
  ];
  if (choiceFeatures.length > 0) {
    wizardSteps.push({ id: 'choices', title: 'Specialty Choices' });
  }
  if (session.hasASI) {
    wizardSteps.push({ id: 'asi', title: 'Ability Score Improvement' });
  }

  const activeStep = wizardSteps[currentStepIndex] || wizardSteps[0];
  const isLastStep = currentStepIndex === wizardSteps.length - 1;

  const pointsSpent = Object.values(session.statIncreases || {}).reduce((a, b) => a + (b || 0), 0);
  const pointsRemaining = 2 - pointsSpent;

  const handleStatChange = (statId: string, delta: number) => {
    const currentIncreases = session.statIncreases || {};
    const currentVal = currentIncreases[statId] || 0;
    const baseVal = (character.stats as any)[statId] || 10;

    if (delta > 0 && pointsRemaining <= 0) return;
    if (delta < 0 && currentVal <= 0) return;
    if (delta > 0 && baseVal + currentVal >= 20) return;

    updateLevelUpSession({
      statIncreases: {
        ...currentIncreases,
        [statId]: currentVal + delta
      }
    });
  };

  const handleToggleChoice = (featIndex: string, optionIndex: string, limit: number, isSubclassChoice?: boolean) => {
    const currentChoices = session.choices?.[featIndex] || [];
    let newSelections: string[];

    if (currentChoices.includes(optionIndex)) {
      newSelections = currentChoices.filter(i => i !== optionIndex);
    } else {
      if (currentChoices.length >= limit) {
        if (limit === 1) {
          newSelections = [optionIndex];
        } else {
          return;
        }
      } else {
        newSelections = [...currentChoices, optionIndex];
      }
    }

    const updatedChoices = {
      ...(session.choices || {}),
      [featIndex]: newSelections
    };

    updateLevelUpSession({
      choices: updatedChoices,
      subclassChoice: isSubclassChoice ? (newSelections[0] || undefined) : session.subclassChoice
    });
  };

  const handleNextStep = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
      soundService.playEffect('UI_CLICK_LIGHT');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      soundService.playEffect('UI_CLICK_LIGHT');
    }
  };

  const handleCommit = async () => {
    const success = await commitLevelUpSession();
    if (success) {
      updateLayerVolume(1, 0.5);
      updateLayerVolume(4, 0.4);
    }
  };

  const handleCancel = () => {
    updateLayerVolume(1, 0.5);
    updateLayerVolume(4, 0.4);
    cancelLevelUpSession();
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
          onClick={handleCancel}
        />

        {/* Content Card - Parchment Theme */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.1, opacity: 0 }}
          className="relative w-full max-w-5xl rounded shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-visible"
          style={{
            backgroundImage: `url('/assets/ui/old_paper.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Header Shield/Emblem */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-dragon-darkRed rounded-full border-4 border-dragon-gold shadow-2xl flex items-center justify-center z-20">
             <GameIcon name={character.class?.toLowerCase()} fallbackName="award" size={48} color="#D4AF37" />
          </div>

          {/* Close/Cancel Button */}
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-dragon-darkRed/80 hover:bg-dragon-darkRed border-2 border-dragon-gold text-dragon-gold font-black flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            title="Cancel Level Up"
          >
            ✕
          </button>

          <div className="relative z-10 flex flex-col h-full max-h-[92vh]">
            {/* Header Section */}
            <div className="bg-dragon-darkRed/95 backdrop-blur-sm pt-[35px] pb-[35px] text-center relative overflow-hidden">
               <div className="absolute top-1/2 left-0 right-0 h-px bg-dragon-gold/30 -translate-y-1/2" />
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-dragon-gold to-transparent" />
               
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
                  <h2 className="text-[36px] font-cinzel font-black text-dragon-gold uppercase tracking-[0.3em] mb-1 shadow-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    Level Ascended
                  </h2>
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent to-dragon-gold/60" />
                    <span className="text-parchment-200 font-bold uppercase tracking-[0.4em] text-[10px]">
                      {character.name} — Target Level {session.targetLevel}
                    </span>
                    <div className="h-px w-24 bg-gradient-to-l from-transparent to-dragon-gold/60" />
                  </div>
               </motion.div>

               {/* Step Navigation Indicator Tabs */}
               {wizardSteps.length > 1 && (
                 <div className="flex items-center justify-center gap-3 mt-4">
                   {wizardSteps.map((step, sIdx) => (
                     <button
                       key={step.id}
                       onClick={() => { setCurrentStepIndex(sIdx); soundService.playEffect('UI_CLICK_LIGHT'); }}
                       className={cn(
                         "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                         sIdx === currentStepIndex
                           ? "bg-dragon-gold text-dragon-darkRed border-dragon-gold shadow-md"
                           : "bg-black/30 text-parchment-300 border-dragon-gold/20 hover:border-dragon-gold/50"
                       )}
                     >
                       Step {sIdx + 1}: {step.title}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            {/* Validation Error Banner */}
            {session.validationError && (
              <div className="bg-red-950/90 border-y-2 border-red-500 text-red-200 px-6 py-3 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 z-20 animate-shake">
                <GameIcon name="warning" size={16} color="#EF4444" />
                <span>{session.validationError}</span>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative">
               <div className="absolute inset-0 bg-paper-texture opacity-20 mix-blend-multiply pointer-events-none z-[1]" />
               <div className="absolute inset-0 bg-parchment-100/10 pointer-events-none z-[2]" />
               
               <div className="relative z-10 w-full pb-20">
                  
                  {/* STEP 1: Summary / Grants & Vitality */}
                  {activeStep.id === 'summary' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <div className="text-center py-2">
                             <h3 className="text-[26px] font-cinzel font-black text-dragon-darkRed uppercase tracking-[0.2em]">
                               <GameIcon name={character.class?.toLowerCase()} size={24} color="currentColor" fallbackName="award" /> {character.class}
                             </h3>
                             <p className="text-[11px] font-black text-parchment-500 uppercase tracking-[0.3em] mt-1">
                               <GameIcon name={character.race?.toLowerCase().replace(/-/g, "_")} size={12} color="currentColor" fallbackName="award" /> {character.race} // <GameIcon name={getAlignmentIcon(character.alignment || "neutral")} size={12} color="currentColor" fallbackName="award" /> {character.alignment}
                             </p>
                          </div>

                          <div className="flex flex-col items-center gap-4">
                             <div className="relative w-full max-w-[260px] aspect-[4/3] drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                                {character.imageUrl ? (
                                   <ChromaKeyImage
                                      src={normalizeImageUrl(character.imageUrl, 'character', character.id)}
                                      alt={character.name}
                                      className="w-full h-full object-contain relative z-20"
                                      threshold={60}
                                   />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-dragon-darkRed/20">
                                    <GameIcon name="user" size={64} />
                                  </div>
                                )}
                             </div>
                          </div>

                          <div className="bg-black/10 p-4 rounded-sm border border-dragon-gold/15 space-y-2">
                             <span className="text-[10px] font-black text-parchment-400 uppercase tracking-[0.2em] block">Hit Point Progression</span>
                             <div className="p-3 bg-white/40 rounded-sm border border-dragon-gold/20 text-center">
                                <span className="text-xs font-bold text-parchment-600 block">Class Hit Die: 1d{classHitDie}</span>
                                <span className="text-xl font-header font-black text-dragon-darkRed mt-1 block">
                                  +{fixedHpGain} HP (Average {Math.floor(classHitDie / 2) + 1} + {conModifier} CON)
                                </span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center gap-4">
                             <div className="h-px flex-1 bg-gradient-to-r from-transparent to-dragon-darkRed/20" />
                             <span className="text-[12px] font-black text-dragon-darkRed uppercase tracking-[0.3em] italic">
                               Level {session.targetLevel} Grants
                             </span>
                             <div className="h-px flex-1 bg-gradient-to-l from-transparent to-dragon-darkRed/20" />
                          </div>

                          {session.features.map((feat, idx) => {
                            const descLines = Array.isArray(feat.desc) ? feat.desc : [feat.desc || ''];
                            return (
                              <div key={feat.index || idx} className="group bg-gradient-to-r from-black/5 to-transparent p-4 rounded-sm flex gap-4 items-start border-l-4 border-dragon-gold/40">
                                <div className="w-10 h-10 bg-white/20 rounded border border-dragon-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <GameIcon name={getFeatureIcon(feat.index, feat.name)} size={22} color="#D4AF37" fallbackName="award" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-header font-black text-dragon-darkRed uppercase tracking-widest">{feat.name}</h4>
                                  <div className="space-y-1 mt-1">
                                    {descLines.filter(Boolean).map((line: string, lIdx: number) => (
                                      <p key={lIdx} className="text-[11px] text-parchment-700 leading-relaxed font-medium">{line}</p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  )}

                  {/* STEP 2: Feature Choices */}
                  {activeStep.id === 'choices' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="h-px flex-1 bg-gradient-to-r from-transparent to-dragon-darkRed/20" />
                         <span className="text-[14px] font-black text-dragon-darkRed uppercase tracking-[0.3em] italic">
                           Specialty Choices
                         </span>
                         <div className="h-px flex-1 bg-gradient-to-l from-transparent to-dragon-darkRed/20" />
                      </div>

                      {choiceFeatures.map(feat => {
                        const options = getOptionsForChoice(feat);
                        const selections = session.choices?.[feat.index] || [];
                        const limit = getChoiceLimit(feat) || 1;
                        const isSubclassChoice = feat.feature_specific?.subfeature_options?.type === 'subclass';

                        return (
                          <div key={feat.index} className="space-y-3 bg-black/5 p-4 rounded border border-dragon-gold/15">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-header font-black text-dragon-darkRed uppercase tracking-widest">
                                {feat.name}
                              </h4>
                              <span className="text-xs font-black text-dragon-gold tabular-nums">
                                {selections.length} / {limit} selected
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {options.map((opt: any) => {
                                const isSelected = selections.includes(opt.index);
                                const description = optionDetails[opt.index] || opt.desc;

                                return (
                                  <button
                                    key={opt.index}
                                    onClick={() => handleToggleChoice(feat.index, opt.index, limit, isSubclassChoice)}
                                    className={cn(
                                      "text-left p-3 rounded-sm border-2 transition-all uppercase flex flex-col gap-1 relative overflow-hidden",
                                      isSelected
                                        ? "bg-dragon-darkRed text-dragon-gold border-dragon-gold shadow-md"
                                        : "bg-white/40 border-dragon-gold/10 text-parchment-600 hover:bg-white hover:border-dragon-gold/40"
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center transition-all",
                                          isSelected ? "bg-dragon-gold border-dragon-gold rotate-45" : "bg-transparent border-dragon-darkRed/20"
                                        )}>
                                          {isSelected && (
                                            <span className="-rotate-45 text-[10px] text-dragon-darkRed font-black">✓</span>
                                          )}
                                        </div>
                                        <span className="font-header font-black tracking-wider text-xs">
                                          {opt.name.replace(/fighting style:\s*/i, '').replace(/expertise:\s*/i, '')}
                                        </span>
                                      </div>
                                    </div>

                                    {description && (
                                      <p className={cn(
                                        "text-[10px] leading-relaxed font-medium ml-7 normal-case",
                                        isSelected ? "text-dragon-gold/80" : "text-parchment-500"
                                      )}>
                                        {description}
                                      </p>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* STEP 3: ASI Allocation */}
                  {activeStep.id === 'asi' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-dragon-darkRed/10 pb-3">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-dragon-darkRed uppercase tracking-widest">
                            Ability Score Improvement
                          </span>
                          <span className="text-[10px] font-bold text-parchment-500 uppercase tracking-widest">
                            Allocate 2 attribute points total
                          </span>
                        </div>
                        <div className="px-4 py-2 bg-dragon-darkRed text-dragon-gold rounded-sm border border-dragon-gold text-xs font-black">
                          {pointsRemaining} PTS REMAINING
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {STATS.map(stat => {
                          const currentInc = session.statIncreases?.[stat.id] || 0;
                          const baseVal = (character.stats as any)[stat.id] || 10;
                          const newVal = baseVal + currentInc;

                          return (
                            <div key={stat.id} className="bg-black/5 p-4 rounded-sm flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center border border-dragon-gold/10">
                                  <GameIcon name={stat.abbr.toLowerCase() as any} size={20} color="#8B0000" />
                                </div>
                                <div>
                                  <span className="text-xs font-black text-parchment-400 uppercase tracking-wider block">{stat.name}</span>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-header font-black text-dragon-darkRed">{newVal}</span>
                                    {currentInc > 0 && (
                                      <span className="text-xs font-black text-green-600">+{currentInc}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStatChange(stat.id, -1)}
                                  disabled={currentInc <= 0}
                                  className="w-9 h-9 rounded-full bg-white/60 border border-dragon-gold/10 flex items-center justify-center text-dragon-darkRed hover:bg-dragon-red hover:text-white disabled:opacity-20 font-black"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleStatChange(stat.id, 1)}
                                  disabled={pointsRemaining <= 0 || newVal >= 20}
                                  className="w-9 h-9 rounded-full bg-dragon-gold/20 border border-dragon-gold flex items-center justify-center text-dragon-darkRed hover:bg-dragon-gold hover:text-white disabled:opacity-20 font-black"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

               </div>
            </div>

            {/* Step Navigation Controls Footer */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2100] flex items-center gap-4">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-2.5 rounded-full bg-black/60 border border-dragon-gold/40 text-parchment-200 text-xs font-black uppercase tracking-widest hover:bg-black/80 transition-all"
                >
                  Previous Step
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3 rounded-full bg-dragon-darkRed border-2 border-dragon-gold shadow-[0_0_30px_rgba(212,175,55,0.4)] text-xs font-black text-dragon-gold uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Continue</span>
                  <GameIcon name="advance" size={18} color="#D4AF37" />
                </button>
              ) : (
                <button
                  onClick={handleCommit}
                  className="group relative flex flex-col items-center gap-2"
                >
                   <div className="absolute inset-0 bg-dragon-gold/20 blur-xl rounded-full animate-pulse" />
                   <div className="px-8 py-3 rounded-full bg-dragon-darkRed border-2 border-dragon-gold shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
                      <GameIcon name="advance" size={24} color="#D4AF37" />
                      <span className="text-xs font-black text-dragon-gold uppercase tracking-[0.3em]">Manifest Evolution</span>
                   </div>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
