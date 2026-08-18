import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCharacterStore, Character } from '../../store/useCharacterStore';
import { cn } from '../../lib/utils';
import { soundService } from '../../services/soundService';
import { GameIcon } from '../../game_icons';
import { 
  fetchSpeciesList, fetchSpeciesData,
  fetchClassesList, fetchClassData,
  fetchBackgroundsList, fetchBackgroundData,
  fetchAlignmentsList, fetchAlignmentData,
  fetchSubraceList, fetchSubraceData,
  REPO, BRANCH
} from '../../services/storageService';

import { WelcomeStep } from './CharacterCreator/WelcomeStep';
import { SelectionStep } from './CharacterCreator/SelectionStep';
import { SpellsStep } from './CharacterCreator/SpellsStep';
import { EquipmentStep } from './CharacterCreator/EquipmentStep';
import { ChoicesStep } from './CharacterCreator/ChoicesStep';
import { StatsStep } from './CharacterCreator/StatsStep';
import { SkillsStep } from './CharacterCreator/SkillsStep';
import { AppearanceStep } from './CharacterCreator/AppearanceStep';
import { IdentityStep } from './CharacterCreator/IdentityStep';
import { ReviewStep } from './CharacterCreator/ReviewStep';
import { SlotStep } from './CharacterCreator/SlotStep';
import { BackstoryStep } from './CharacterCreator/BackstoryStep';
import { AlignmentStep } from './CharacterCreator/AlignmentStep';
import { validateStep, validateFullCharacter, ValidationError, CreationStep } from './CharacterCreator/validation';
import { ValidationOverlay } from './CharacterCreator/ValidationOverlay';
import { saveService } from '../../services/saveService';
import { atlasService } from '../../services/atlasService';

const ALL_STEPS: { id: CreationStep; label: string; icon: any }[] = [
  { id: 'welcome', label: 'Welcome', icon: 'devkit' },
  { id: 'slot', label: 'Save Slot', icon: 'save_data' },
  { id: 'identity', label: 'Identity', icon: 'info' },
  { id: 'species', label: 'Species', icon: 'ancestry' },
  { id: 'class', label: 'Class', icon: 'weapon' },
  { id: 'background', label: 'Origins', icon: 'scroll' },
  { id: 'alignment', label: 'Ethos', icon: 'shield' },
  { id: 'stats', label: 'Attributes', icon: 'dice' },
  { id: 'choices', label: 'Skills & Choices', icon: 'book' },
  { id: 'spells', label: 'Arcana', icon: 'magic_effect' },
  { id: 'equipment', label: 'Gear', icon: 'shield' },
  { id: 'appearance', label: 'Appearance', icon: 'identity' },
  { id: 'describe', label: 'Describe Your Character', icon: 'citation' },
  { id: 'review', label: 'Commit', icon: 'save_data' },
];

const PLAYABLE_SPECIES = ['dragonborn', 'dwarf', 'elf', 'gnome', 'half-elf', 'half-orc', 'halfling', 'human', 'tiefling'];

import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';

export const CharacterCreator: React.FC = () => {
  const { 
    isCharacterCreatorOpen, 
    setIsCharacterCreatorOpen, 
    setIsLoading,
  } = useUIStore();
  const { setIsGameStarted } = useGameStore();

  const {
    characters,
    setCharacters,
    setMainCharacter,
    loadCharacters,
    setActiveCharacter
  } = useCharacterStore();

  const [currentStep, setCurrentStep] = useState<CreationStep>(() => {
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT_TEST_STEP__) {
      return (window as any).__PLAYWRIGHT_TEST_STEP__;
    }
    return 'welcome';
  });
  const [direction, setDirection] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidationOpen, setIsValidationOpen] = useState(false);

  // New character state
  const [newChar, setNewChar] = useState<Partial<Character>>({
    ruleset: '2014',
    level: 0,
    xp: 0,
    saveVersion: 2,
    gender: 'Male',
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    proficiencies: [],
    traits: [],
    features: [],
    flaws: [],
    ideals: [],
    bonds: [],
    money: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
    appearance: {
      hairColor: 'Raven Black',
      hairStyle: 'Short',
      bodyType: 'Medium',
      eyeColor: 'Brown',
      skinColor: '#ffdbac',
      height: "5'10\"",
      weight: '160 lbs',
      size: 'Medium',
      specialFeatures: []
    },
    items: {},
    containers: {},
    equipment: {
      containerId: '',
      slots: []
    },
    backpack: [],
    inventory: {},
    knownSpells: [],
    languages: ['common'],
    preparedSpells: [],
    spellSlots: {},
    choices: {}
  });

  const handleRulesetChange = (ruleset: '2014' | '2024') => {
    if (newChar.ruleset === ruleset) return;
    soundService.playEffect('UI_CLICK_LIGHT');
    setNewChar(prev => ({
      ...prev,
      ruleset,
      race: undefined,
      subrace: undefined,
      class: undefined,
      subclass: undefined,
      background: undefined,
      proficiencies: [],
      traits: [],
      features: [],
      knownSpells: [],
      preparedSpells: [],
      backpack: [],
      inventory: {},
      choices: {}
    }));
  };

  const [isClassSpellcaster, setIsClassSpellcaster] = useState(false);

  useEffect(() => {
    if (newChar.class) {
        atlasService.loadClass(newChar.class).then(cData => {
            setIsClassSpellcaster(!!cData?.spellcasting);
        }).catch(() => {
            setIsClassSpellcaster(false);
        });
    } else {
        setIsClassSpellcaster(false);
    }
  }, [newChar.class]);

  const STEPS = ALL_STEPS.filter(s => {
    if (s.id === 'spells' && !isClassSpellcaster) return false;
    return true;
  });

  const [availableSpecies, setAvailableSpecies] = useState<{name: string, index: string}[]>([]);
  const [availableSubraces, setAvailableSubraces] = useState<{name: string, index: string}[]>([]);
  const [availableClasses, setAvailableClasses] = useState<{name: string, index: string}[]>([]);
  const [availableBackgrounds, setAvailableBackgrounds] = useState<{name: string, index: string}[]>([]);
  const [availableAlignments, setAvailableAlignments] = useState<{name: string, index: string}[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<{name: string, index: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCharacterCreatorOpen) {
      loadInitialData();
    }
  }, [isCharacterCreatorOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const { fetchLanguagesList } = await import('../../services/storageService');
      const [s, sub, c, b, a, l] = await Promise.all([
        fetchSpeciesList(),
        fetchSubraceList(),
        fetchClassesList(),
        fetchBackgroundsList(),
        fetchAlignmentsList(),
        fetchLanguagesList()
      ]);
      
      setAvailableSpecies(s.filter(item => {
        const normalized = item.index.toLowerCase().replace(/_/g, '-');
        return PLAYABLE_SPECIES.includes(normalized);
      }));
      
      setAvailableSubraces(sub);
      setAvailableClasses(c);
      setAvailableBackgrounds(b);
      setAvailableAlignments(a);
      setAvailableLanguages(l);
    } catch (e) {
      console.error("Failed to load initial character creation data", e);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const canGoNext = () => {
    const errs = validateStep(currentStep, newChar, selectedSlot);
    return errs.length === 0;
  };

  const nextStep = () => {
    const stepErrs = validateStep(currentStep, newChar, selectedSlot);
    if (stepErrs.length > 0) {
      soundService.playEffect('UI_ERROR');
      setValidationErrors(stepErrs);
      setIsValidationOpen(true);
      return;
    }

    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(STEPS[currentIndex + 1].id);
      soundService.playEffect('UI_CLICK_LIGHT');
    }
  };

  const handleExit = () => {
    setIsCharacterCreatorOpen(false);
    setIsGameStarted(false);
    soundService.playEffect('UI_BACK_EXIT');
    soundService.playMusic('startup');
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentStep(STEPS[currentIndex - 1].id);
      soundService.playEffect('UI_BACK_EXIT');
    } else if (currentIndex === 0) {
      handleExit();
    }
  };

  const handleFinish = async () => {
    const allErrs = validateFullCharacter(newChar, selectedSlot);
    if (allErrs.length > 0) {
      soundService.playEffect('UI_ERROR');
      setValidationErrors(allErrs);
      setIsValidationOpen(true);
      return;
    }

    setLoading(true);
    let finalHp = 10;

    try {
        const [sData, subData, cData] = await Promise.all([
            newChar.race ? fetchSpeciesData(newChar.race) : null,
            newChar.subrace ? fetchSubraceData(newChar.subrace) : null,
            newChar.class ? fetchClassData(newChar.class) : null
        ]);

        if (cData?.hit_die) {
            const conVal = (newChar.stats?.con || 10);
            let totalCon = conVal;
            if (sData?.ability_bonuses) {
                const b = sData.ability_bonuses.find((ab: any) => ab.ability_score.index === 'con');
                if (b) totalCon += b.bonus;
            }
            if (subData?.ability_bonuses) {
                const b = subData.ability_bonuses.find((ab: any) => ab.ability_score.index === 'con');
                if (b) totalCon += b.bonus;
            }
            const conMod = Math.floor((totalCon - 10) / 2);
            
            const level = newChar.level || 0;
            if (level === 0) {
                finalHp = Math.max(1, Math.floor(cData.hit_die / 2) + conMod);
            } else {
                finalHp = cData.hit_die + conMod;
                for (let i = 2; i <= level; i++) {
                    finalHp += Math.floor(cData.hit_die / 2) + 1 + conMod;
                }
            }

            newChar.traits?.forEach(trait => {
                const hpBonus = trait.trait_specific?.passive_modifiers?.hp_bonus_per_level;
                if (hpBonus) {
                    finalHp += (hpBonus * Math.max(1, level));
                }
            });

            newChar.features?.forEach(feat => {
                const hpBonus = feat.feature_specific?.passive_modifiers?.hp_bonus_per_level;
                if (hpBonus) {
                    finalHp += (hpBonus * Math.max(1, level));
                }
            });
        }

        const charId = selectedSlot ? `slot${selectedSlot}` : `char-${Date.now()}`;
        
        const spellcastingAbility = 
            ['wizard', 'artificer'].includes(newChar.class?.toLowerCase() || '') ? 'int' :
            ['cleric', 'druid', 'ranger'].includes(newChar.class?.toLowerCase() || '') ? 'wis' :
            ['bard', 'sorcerer', 'warlock', 'paladin'].includes(newChar.class?.toLowerCase() || '') ? 'cha' : 'cha';

        const { calculateMaxSpellSlots } = await import('../../lib/statCalculations');
        const { createDefaultEquipment, createDefaultBackpack } = await import('../../lib/inventoryUtils');
        const maxSlots = calculateMaxSpellSlots(newChar as Character);
        const spellSlots: Record<string, { current: number; max: number }> = {};
        Object.entries(maxSlots).forEach(([lvl, max]) => {
            spellSlots[lvl] = { current: max, max };
        });

        const items = newChar.items || {};
        const containers = newChar.containers || {};
        let equipment = newChar.equipment;

        if (!equipment || equipment.slots.length === 0) {
            equipment = createDefaultEquipment(charId);
        } else {
            equipment.containerId = `equipment_${charId}`;
        }

        if (Object.keys(containers).length === 0) {
            const backpack = createDefaultBackpack(charId);
            containers[backpack.id] = backpack;
        }

        const finalizedChar: Character = {
          ...newChar as Character,
          id: charId,
          name: newChar.name || 'Hero',
          hp: finalHp,
          maxHp: finalHp,
          spellcastingAbility,
          spellSlots,
          saveVersion: 2,
          items,
          containers,
          equipment
        };

        if (newChar.imageUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.imageUrl, 'portrait');
            finalizedChar.imageUrl = `/data/character_save/images/${charId}/${charId}_portrait.webp`;
        }
        if (newChar.avatarUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.avatarUrl, 'avatar');
            finalizedChar.avatarUrl = `/data/character_save/images/${charId}/${charId}_avatar.webp`;
        }
        if (newChar.matrixUrl?.startsWith('data:')) {
            await saveService.saveCharacterImage(charId, newChar.matrixUrl, 'matrix');
            finalizedChar.matrixUrl = `/data/character_save/images/${charId}/${charId}_matrix.webp`;
        }

        await saveService.saveCharacter(finalizedChar, selectedSlot || undefined);

        setMainCharacter(finalizedChar);
        setActiveCharacter(charId);
        setIsGameStarted(true);
        
        soundService.playMusic('game');
        await loadCharacters();
        
        soundService.playEffect('TRANSACTION_SUCCESS');
        setIsCharacterCreatorOpen(false);
    } catch (e) {
        console.error("Error finalizing character", e);
        soundService.playEffect('UI_ERROR');
    } finally {
        setLoading(false);
    }
  };

  if (!isCharacterCreatorOpen) return null;

  return (
    <div id="character-creator-portal" className="fixed inset-0 top-16 z-[100] bg-dragon-darkRed/95 flex items-center justify-center p-4">
      {/* Parchment Overlay Asset */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: `url('/assets/ui/parchment.webp')` }}
      />
      
      <div id="creator-main-modal" className="w-full max-w-7xl h-[95vh] bg-parchment-100 border border-dragon-gold/30 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative rounded-sm items-stretch" style={{
        backgroundImage: `url('/assets/ui/parchment.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Header */}
        <div className="h-12 bg-white/20 border-b border-dragon-red/20 flex items-center px-4 shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-dragon-red/5 text-dragon-red border border-dragon-red/10 rounded-sm">
              {(() => {
                const iconName = STEPS.find(s => s.id === currentStep)?.icon || 'identity';
                return <GameIcon name={iconName as any} size={18} />;
              })()}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <h1 className="text-2xl font-bodoni font-black text-dragon-darkRed uppercase tracking-[0.2em] drop-shadow-sm">
                {STEPS.find(s => s.id === currentStep)?.label}
             </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Navigation Sidebar */}
          <div id="creator-sidebar" className="w-14 border-r border-dragon-red/10 bg-transparent p-2 flex flex-col gap-2 shrink-0 overflow-y-auto custom-scrollbar items-center">
             {STEPS.map((s, idx) => {
                const activeIdx = STEPS.findIndex(step => step.id === currentStep);
                const isCompleted = idx < activeIdx;
                const isActive = idx === activeIdx;

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                        soundService.playEffect('UI_CHARACTER_SELECT');
                        setDirection(idx > activeIdx ? 1 : -1);
                        setCurrentStep(s.id);
                    }}
                    title={s.label}
                    className={cn(
                       "w-10 h-10 flex items-center justify-center rounded-sm transition-all group shrink-0 relative",
                       isActive ? "bg-dragon-red text-white shadow-lg shadow-dragon-red/20" : 
                       isCompleted ? "text-dragon-red hover:bg-dragon-red/5" : "text-parchment-400 hover:text-dragon-red"
                    )}
                  >
                        {isCompleted ? <GameIcon name="check" size={16} color="currentColor" /> : (
                             <GameIcon name={s.icon as any} size={16} />
                        )}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-full" />
                        )}
                  </button>
                );
             })}
          </div>

          {/* Main Stage */}
          <div id="creator-stage" className="flex-1 relative overflow-hidden bg-transparent">
             {loading ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <GameIcon name="refresh" className="text-dragon-red animate-spin" size={32} />
                  <span className="text-[10px] font-header font-black text-dragon-red/40 uppercase tracking-widest">Invoking Data...</span>
               </div>
             ) : (
               <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    initial={{ x: direction * 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -direction * 30, opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="absolute inset-0 p-1 flex flex-col"
                  >
                     <StepContent 
                        step={currentStep} 
                        newChar={newChar} 
                        setNewChar={setNewChar}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={setSelectedSlot}
                        onSelectRuleset={handleRulesetChange}
                        available={{ subraces: availableSubraces,
                           species: availableSpecies,
                           classes: availableClasses,
                           backgrounds: availableBackgrounds,
                           alignments: availableAlignments,
                           languages: availableLanguages
                        }}
                     />
                  </motion.div>
               </AnimatePresence>
             )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div id="creator-footer" className="h-16 bg-white/20 border-t border-dragon-red/20 flex items-center justify-between px-6 shrink-0">
           <button 
             onClick={prevStep}
             className="flex items-center gap-1.5 px-4 py-2 border border-parchment-300 rounded-sm font-black text-[9px] text-parchment-500 uppercase tracking-widest hover:bg-parchment-100 transition-all"
           >
             <GameIcon name="direction_left" size={14} color="currentColor" />
             Previous
           </button>

           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-dragon-red/40 uppercase tracking-tighter mb-0.5">Character_Identity</span>
              <div className="flex items-center gap-2 text-[11px] font-black text-dragon-darkRed uppercase tracking-wider font-bodoni">
                 <span>{newChar.race?.replace(/-/g, ' ') || 'NO_ANCESTRY'}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold/40" />
                 <span>{newChar.class || 'NO_CLASS'}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-dragon-gold/40" />
                 <span className="px-2 py-0.5 bg-dragon-gold/20 border border-dragon-gold/30 rounded text-[9px] font-black text-dragon-darkRed">
                   Ruleset: {newChar.ruleset === '2024' ? 'D&D 5.5e (2024)' : 'D&D 5e (2014)'}
                 </span>
              </div>
           </div>

           {currentStep === 'review' ? (
              <button 
                id="finish-creation-btn"
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-6 py-2 bg-dragon-red text-white rounded-sm font-header font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-dragon-darkRed transition-all"
              >
                <GameIcon name="save_data" size={14} color="currentColor" />
                Manifest
              </button>
           ) : (
             <button 
               id="next-stage-btn"
               onClick={nextStep}
               className={cn(
                 "flex items-center gap-1.5 px-6 py-2 rounded-sm font-header font-black text-[10px] uppercase tracking-widest shadow-lg transition-all bg-dragon-red text-white hover:bg-dragon-darkRed cursor-pointer"
               )}
             >
               Continue
               <GameIcon name="direction_right" size={14} color="currentColor" />
             </button>
           )}
        </div>
      </div>

      {/* Required Steps Validation Overlay Modal */}
      <ValidationOverlay
        isOpen={isValidationOpen}
        errors={validationErrors}
        onClose={() => setIsValidationOpen(false)}
        onNavigateToStep={(targetStep) => {
          const idx = STEPS.findIndex(s => s.id === targetStep);
          const currentIdx = STEPS.findIndex(s => s.id === currentStep);
          setDirection(idx > currentIdx ? 1 : -1);
          setCurrentStep(targetStep);
        }}
      />
    </div>
  );
};

const StepContent: React.FC<{
  step: CreationStep;
  newChar: Partial<Character>;
  setNewChar: React.Dispatch<React.SetStateAction<Partial<Character>>>;
  selectedSlot: number | null;
  setSelectedSlot: (slot: number) => void;
  onSelectRuleset: (ruleset: '2014' | '2024') => void;
  available: any;
}> = ({ step, newChar, setNewChar, selectedSlot, setSelectedSlot, onSelectRuleset, available }) => {
   switch (step) {
     case 'welcome': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><WelcomeStep ruleset={newChar.ruleset || '2014'} onSelectRuleset={onSelectRuleset} /></div>;
     case 'slot': return <SlotStep selectedSlot={selectedSlot} onSelect={setSelectedSlot} />;
     case 'identity': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><IdentityStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'species': {
        const speciesWithSubraces = available.species.flatMap((s: any) => {
            const speciesSubraces = available.subraces.filter((sub: any) => {
                const idx = sub.index.toLowerCase();
                if (s.index === 'elf') return (idx.includes('elf') && !idx.includes('half-elf')) || idx.includes('drow');
                if (s.index === 'dwarf') return idx.includes('dwarf');
                if (s.index === 'halfling') return idx.includes('halfling');
                if (s.index === 'gnome') return idx.includes('gnome');
                return false;
            });

            if (speciesSubraces.length > 0) {
                return speciesSubraces.map((sub: any) => ({
                    index: `${s.index}:${sub.index}`,
                    name: `${sub.name}`
                }));
            }
            return [s];
        });

        return <SelectionStep 
            title="Select Species & Heritage"
            desc="Your species defines your biological traits and natural talents."
            items={speciesWithSubraces}
            selected={newChar.subrace ? `${newChar.race}:${newChar.subrace}` : newChar.race}
            onSelect={(val) => {
                if (val.includes(':')) {
                    const [race, subrace] = val.split(':');
                    setNewChar({...newChar, race, subrace});
                } else {
                    setNewChar({...newChar, race: val, subrace: undefined});
                }
            }}
            category="species"
        />;
     }
     case 'class': return <SelectionStep 
         title="Choose Class" 
         desc="Your class is your primary calling and path of training."
         items={available.classes}
         selected={newChar.class}
         onSelect={(val) => {
            const lowVal = (val || "").toLowerCase();
            const spellAbility = 
                ['wizard', 'artificer'].includes(lowVal) ? 'int' :
                ['cleric', 'druid', 'ranger'].includes(lowVal) ? 'wis' :
                ['bard', 'sorcerer', 'warlock', 'paladin'].includes(lowVal) ? 'cha' : 'cha';

            setNewChar({...newChar, class: val, proficiencies: [], inventory: {}, knownSpells: [], preparedSpells: [], spellSlots: {}, spellcastingAbility: spellAbility, choices: {}});
         }}
         category="class"
      />;
     case 'background': return <SelectionStep 
         title="Character Origins" 
         desc="Definition of your life before embarking on adventures."
         items={available.backgrounds}
         selected={newChar.background}
         onSelect={async (val) => {
            const { fetchBackgroundJson } = await import('../../services/storageService');
            const bgData = await fetchBackgroundJson(val);
            
            setNewChar(prev => {
                const newBackpack = [...(prev.backpack || [])];
                const newProficiencies = prev.proficiencies ? [...prev.proficiencies] : [];
                const newFeatures = prev.features ? [...prev.features] : [];

                if (bgData?.starting_equipment) {
                    bgData.starting_equipment.forEach((entry: any) => {
                        const item = entry.equipment;
                        const qty = entry.quantity || 1;
                        newBackpack.push({ ...item, quantity: qty, slot: entry.slot });
                    });
                }

                if (bgData?.starting_proficiencies) {
                    bgData.starting_proficiencies.forEach((p: any) => {
                        const pIdx = p.index || p.name;
                        if (!newProficiencies.includes(pIdx)) {
                            newProficiencies.push(pIdx);
                        }
                    });
                }

                if (bgData?.feat) {
                    const featFeature = {
                        name: bgData.feat.name,
                        index: bgData.feat.index,
                        desc: 'Granted by your ' + bgData.name + ' background.',
                        source: 'Background'
                    };
                    if (!newFeatures.find(f => f.index === featFeature.index)) {
                        newFeatures.push(featFeature);
                    }
                }

                if (bgData?.feature) {
                    const feature = {
                        name: bgData.feature.name,
                        index: bgData.feature.index || bgData.index + '-feature',
                        desc: Array.isArray(bgData.feature.desc) ? bgData.feature.desc.join('\n') : bgData.feature.desc,
                        source: 'Background'
                    };
                    if (!newFeatures.find(f => f.name === feature.name)) {
                        newFeatures.push(feature);
                    }
                }

                return {
                    ...prev,
                    background: val,
                    backpack: newBackpack,
                    proficiencies: newProficiencies,
                    features: newFeatures
                };
            });
         }}
         category="backgrounds"
      />;
     case 'alignment': return <AlignmentStep newChar={newChar} setNewChar={setNewChar} />;
     case 'stats': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><StatsStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'choices': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><ChoicesStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'spells': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><SpellsStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'equipment': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><EquipmentStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'appearance': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><AppearanceStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'describe': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><BackstoryStep newChar={newChar} setNewChar={setNewChar} /></div>;
     case 'review': return <div className="h-full overflow-y-auto custom-scrollbar pr-2"><ReviewStep newChar={newChar} setNewChar={setNewChar} /></div>;
     default: return null;
   }
};

export default CharacterCreator;
